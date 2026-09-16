import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { BodyMeasurementProfile, IMeasurementValue } from '../models/BodyMeasurementProfile';
import { MeasurementSession } from '../models/MeasurementSession';
import { Customer } from '../models/Customer';
import { MEASUREMENT_REGISTRY, normalizeMeasurementValue } from '../utils/measurements';
import { Types } from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    role: string;
    name: string;
    email: string;
  };
}

const router = Router();

// All measurement routes require user authentication
router.use(authenticateToken);

/**
 * Helper to ensure or resolve Customer document for the authenticated user.
 */
async function getOrCreateCustomer(userId: string) {
  let customer = await Customer.findOne({ userId });
  if (!customer) {
    customer = new Customer({
      userId: new Types.ObjectId(userId),
    });
    await customer.save();
  }
  return customer;
}

// =========================================================================
// 1. EXTENSIBLE SCHEMA REGISTRY
// =========================================================================

/**
 * GET /api/measurements/schema
 * Returns the dictionary of supported anatomical measurement keys, categories,
 * descriptions, and internal standard units (cm / kg).
 */
router.get('/schema', (_req: Request, res: Response) => {
  return res.json({
    standardUnit: 'cm',
    categories: ['BASIC', 'UPPER_BODY', 'LOWER_BODY'],
    measurements: Object.values(MEASUREMENT_REGISTRY),
  });
});

// =========================================================================
// 2. PROFILE CREATION & VERSIONING
// =========================================================================

/**
 * POST /api/measurements/profiles
 * Create a new measurement profile.
 * Automatically standardizes length units to centimeters (cm).
 */
router.post('/profiles', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await getOrCreateCustomer(req.user!.sub);
    const { profileName, source, bodyShape, measurements, setAsCurrent } = req.body;

    // Determine starting version for this profile name
    const existing = await BodyMeasurementProfile.find({
      customerId: customer._id,
      profileName: profileName || 'Default Profile',
    }).sort({ version: -1 });

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    // Process and normalize measurements to cm
    const processedMeasurements: Record<string, IMeasurementValue> = {};
    if (measurements && typeof measurements === 'object') {
      for (const [key, item] of Object.entries(measurements)) {
        const rawVal = typeof item === 'object' ? (item as any).value : Number(item);
        const rawUnit = typeof item === 'object' ? (item as any).unit : 'cm';
        const rawSource = typeof item === 'object' ? (item as any).source : source || 'MANUAL';
        const rawConfidence = typeof item === 'object' ? (item as any).confidence : 1.0;
        const rawVerified = typeof item === 'object' ? !!(item as any).verified : false;

        if (typeof rawVal === 'number' && !isNaN(rawVal)) {
          const normalized = normalizeMeasurementValue(key, rawVal, rawUnit);
          processedMeasurements[key] = {
            value: normalized.value,
            unit: normalized.unit,
            source: rawSource,
            confidence: rawConfidence,
            verified: rawVerified,
            measuredAt: new Date(),
            notes: typeof item === 'object' ? (item as any).notes : undefined,
          };
        }
      }
    }

    const isCurrent = setAsCurrent !== false;

    // If set as current, unset previous current profiles
    if (isCurrent) {
      await BodyMeasurementProfile.updateMany(
        { customerId: customer._id, isCurrent: true },
        { isCurrent: false }
      );
    }

    const profile = new BodyMeasurementProfile({
      customerId: customer._id,
      profileName: profileName || 'Default Profile',
      version: nextVersion,
      isCurrent,
      source: source || 'MANUAL',
      bodyShape,
      status: 'ACTIVE',
      measurements: processedMeasurements,
    });

    await profile.save();

    if (isCurrent) {
      customer.defaultMeasurementProfileId = profile._id as any;
      await customer.save();
    }

    return res.status(201).json({
      message: `Measurement profile created successfully (version ${profile.version})`,
      profile,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating measurement profile', error: error.message });
  }
});

/**
 * GET /api/measurements/profiles
 * List all measurement profiles and version history for the authenticated customer.
 */
router.get('/profiles', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.json({ profiles: [] });
    }

    const profiles = await BodyMeasurementProfile.find({ customerId: customer._id })
      .sort({ profileName: 1, version: -1 });

    return res.json({ count: profiles.length, profiles });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching measurement profiles', error: error.message });
  }
});

/**
 * GET /api/measurements/profiles/:id
 * Retrieve a specific profile version.
 */
router.get('/profiles/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const profile = await BodyMeasurementProfile.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!profile) {
      return res.status(404).json({ message: 'Measurement profile not found.' });
    }

    return res.json({ profile });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

/**
 * PUT /api/measurements/profiles/:id
 * NON-DESTRUCTIVE VERSIONING UPDATE:
 * Preserves historical measurements! Instead of mutating past records, creates
 * a new version document (e.g. v2 -> v3) preserving the entire audit trail.
 */
router.put('/profiles/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const currentProfile = await BodyMeasurementProfile.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!currentProfile) {
      return res.status(404).json({ message: 'Measurement profile not found.' });
    }

    const { measurements, profileName, source, bodyShape } = req.body;

    // Find highest version for this profile name to determine next number
    const targetName = profileName || currentProfile.profileName;
    const latest = await BodyMeasurementProfile.findOne({
      customerId: customer._id,
      profileName: targetName,
    }).sort({ version: -1 });

    const newVersionNumber = (latest ? latest.version : currentProfile.version) + 1;

    // Merge existing measurements with updated keys
    const mergedMeasurements: Record<string, IMeasurementValue> = {
      ...(currentProfile.measurements instanceof Map
        ? Object.fromEntries(currentProfile.measurements)
        : currentProfile.measurements || {}),
    };

    if (measurements && typeof measurements === 'object') {
      for (const [key, item] of Object.entries(measurements)) {
        const rawVal = typeof item === 'object' ? (item as any).value : Number(item);
        const rawUnit = typeof item === 'object' ? (item as any).unit : 'cm';
        const rawSource = typeof item === 'object' ? (item as any).source : source || 'MANUAL';
        const rawConfidence = typeof item === 'object' ? (item as any).confidence : 1.0;
        const rawVerified = typeof item === 'object' ? !!(item as any).verified : false;

        if (typeof rawVal === 'number' && !isNaN(rawVal)) {
          const normalized = normalizeMeasurementValue(key, rawVal, rawUnit);
          mergedMeasurements[key] = {
            value: normalized.value,
            unit: normalized.unit,
            source: rawSource,
            confidence: rawConfidence,
            verified: rawVerified,
            measuredAt: new Date(),
            notes: typeof item === 'object' ? (item as any).notes : undefined,
          };
        }
      }
    }

    // Set all previous versions to isCurrent: false
    await BodyMeasurementProfile.updateMany(
      { customerId: customer._id, isCurrent: true },
      { isCurrent: false }
    );

    // Create NEW version document
    const newVersionProfile = new BodyMeasurementProfile({
      customerId: customer._id,
      profileName: targetName,
      version: newVersionNumber,
      isCurrent: true,
      source: source || currentProfile.source,
      bodyShape: bodyShape || currentProfile.bodyShape,
      status: 'ACTIVE',
      measurements: mergedMeasurements,
    });

    await newVersionProfile.save();

    customer.defaultMeasurementProfileId = newVersionProfile._id as any;
    await customer.save();

    return res.status(201).json({
      message: `New version created: Profile v${newVersionProfile.version} (historical v${currentProfile.version} preserved)`,
      previousVersion: currentProfile.version,
      newVersion: newVersionProfile.version,
      profile: newVersionProfile,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error versioning measurement profile', error: error.message });
  }
});

/**
 * POST /api/measurements/profiles/:id/set-current
 * Designate a specific profile version as the active/current default.
 */
router.post('/profiles/:id/set-current', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const profile = await BodyMeasurementProfile.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!profile) {
      return res.status(404).json({ message: 'Measurement profile not found.' });
    }

    // Set all customer profiles to isCurrent: false
    await BodyMeasurementProfile.updateMany(
      { customerId: customer._id },
      { isCurrent: false }
    );

    profile.isCurrent = true;
    await profile.save();

    customer.defaultMeasurementProfileId = profile._id as any;
    await customer.save();

    return res.json({
      message: `Profile '${profile.profileName}' (v${profile.version}) is now set as the current default.`,
      currentProfileId: profile._id,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error setting current profile', error: error.message });
  }
});

/**
 * POST /api/measurements/profiles/:id/snapshot
 * Helper endpoint that returns a frozen, validated measurement snapshot for an order.
 */
router.post('/profiles/:id/snapshot', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const profile = await BodyMeasurementProfile.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!profile) {
      return res.status(404).json({ message: 'Measurement profile not found.' });
    }

    const rawMeasurements = profile.measurements instanceof Map
      ? Object.fromEntries(profile.measurements)
      : profile.measurements || {};

    const snapshot = {
      profileId: profile._id,
      profileName: profile.profileName,
      profileVersion: profile.version,
      bodyShape: profile.bodyShape,
      snapshotTimestamp: new Date(),
      measurements: rawMeasurements,
    };

    return res.json({ snapshot });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error generating snapshot', error: error.message });
  }
});

// =========================================================================
// 3. MEASUREMENT SESSION DOMAIN ENDPOINTS
// =========================================================================

/**
 * POST /api/measurements/sessions
 * Create a new dedicated measurement session.
 */
router.post('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await getOrCreateCustomer(req.user!.sub);
    const { captureType, heightReference } = req.body;

    const session = new MeasurementSession({
      customerId: customer._id,
      captureType: captureType || 'AI',
      heightReference: heightReference || undefined,
      status: 'CREATED',
      landmarks: {},
      estimatedMeasurements: {},
      confidenceScores: {},
      warnings: [],
    });

    await session.save();

    return res.status(201).json({
      message: 'Measurement session created successfully',
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating measurement session', error: error.message });
  }
});

/**
 * GET /api/measurements/sessions
 * List all measurement sessions for the authenticated customer.
 */
router.get('/sessions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.json({ sessions: [] });
    }

    const sessions = await MeasurementSession.find({ customerId: customer._id }).sort({ createdAt: -1 });
    return res.json({ count: sessions.length, sessions });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching measurement sessions', error: error.message });
  }
});

/**
 * GET /api/measurements/sessions/:id
 * Retrieve a specific measurement session.
 */
router.get('/sessions/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const session = await MeasurementSession.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Measurement session not found.' });
    }

    return res.json({ session });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching measurement session', error: error.message });
  }
});

/**
 * POST /api/measurements/sessions/:id/captures
 * Upload front capture, side capture, and height reference for a session.
 */
router.post('/sessions/:id/captures', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const session = await MeasurementSession.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Measurement session not found.' });
    }

    const { frontCapture, frontCaptureUrl, sideCapture, sideCaptureUrl, heightReference } = req.body;

    if (frontCapture || frontCaptureUrl) session.frontCaptureUrl = frontCapture || frontCaptureUrl;
    if (sideCapture || sideCaptureUrl) session.sideCaptureUrl = sideCapture || sideCaptureUrl;
    if (heightReference) session.heightReference = heightReference;

    session.status = 'CAPTURING';
    await session.save();

    return res.json({
      message: 'Captures saved successfully',
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error saving captures', error: error.message });
  }
});

/**
 * POST /api/measurements/sessions/:id/process
 * Trigger processing on body captures: extract landmarks, compute estimated measurements, confidence scores, and warnings.
 */
router.post('/sessions/:id/process', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const session = await MeasurementSession.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Measurement session not found.' });
    }

    session.status = 'PROCESSING';
    await session.save();

    // AI vision analysis simulation
    const parsedHeight = parseFloat(session.heightReference || '180') || 180;
    const heightFactor = parsedHeight / 180;

    const landmarks = {
      head: { x: 0.5, y: 0.1, confidence: 0.98 },
      neck: { x: 0.5, y: 0.18, confidence: 0.96 },
      leftShoulder: { x: 0.38, y: 0.24, confidence: 0.95 },
      rightShoulder: { x: 0.62, y: 0.24, confidence: 0.95 },
      chestCenter: { x: 0.5, y: 0.32, confidence: 0.93 },
      waistCenter: { x: 0.5, y: 0.45, confidence: 0.91 },
      hipCenter: { x: 0.5, y: 0.55, confidence: 0.92 },
      leftAnkle: { x: 0.42, y: 0.92, confidence: 0.89 },
      rightAnkle: { x: 0.58, y: 0.92, confidence: 0.89 },
    };

    const estimatedMeasurements = {
      height: { value: Math.round(parsedHeight * 10) / 10, unit: 'cm' },
      chest: { value: Math.round(104 * heightFactor * 10) / 10, unit: 'cm' },
      waist: { value: Math.round(84 * heightFactor * 10) / 10, unit: 'cm' },
      hip: { value: Math.round(98 * heightFactor * 10) / 10, unit: 'cm' },
      shoulder: { value: Math.round(46 * heightFactor * 10) / 10, unit: 'cm' },
      sleeveLength: { value: Math.round(65 * heightFactor * 10) / 10, unit: 'cm' },
      inseam: { value: Math.round(82 * heightFactor * 10) / 10, unit: 'cm' },
      neck: { value: Math.round(39 * heightFactor * 10) / 10, unit: 'cm' },
    };

    const confidenceScores = {
      height: 0.99,
      chest: 0.94,
      waist: 0.91,
      hip: 0.92,
      shoulder: 0.95,
      sleeveLength: 0.88,
      inseam: 0.86,
      neck: 0.85,
    };

    const warnings: string[] = [];
    if (!session.sideCaptureUrl) {
      warnings.push('Side capture missing: Sleeve length and chest depth confidence slightly reduced.');
    }
    if (parsedHeight < 120 || parsedHeight > 230) {
      warnings.push('Height reference seems unusual. Please verify your reference scale.');
    }

    session.landmarks = landmarks;
    session.estimatedMeasurements = estimatedMeasurements;
    session.confidenceScores = confidenceScores;
    session.warnings = warnings;
    session.status = 'REVIEW_REQUIRED';

    await session.save();

    return res.json({
      message: 'Measurement session processed successfully. Review required.',
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error processing measurement session', error: error.message });
  }
});

/**
 * PATCH /api/measurements/sessions/:id/verify
 * Confirm estimated measurements and generate/update active BodyMeasurementProfile.
 */
router.patch('/sessions/:id/verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await getOrCreateCustomer(req.user!.sub);
    const session = await MeasurementSession.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Measurement session not found.' });
    }

    const { verifiedMeasurements, profileName, bodyShape, fitPreference, category } = req.body;

    // Use overrides or fallback to session estimated measurements
    const finalMeasurements = verifiedMeasurements || session.estimatedMeasurements || {};

    session.status = 'VERIFIED';
    session.completedAt = new Date();
    await session.save();

    // Generate or update customer's current measurement profile
    const targetName = profileName || (session.captureType === 'MANUAL' ? 'Self-Measured Fit' : 'AI Capture Profile');
    const existing = await BodyMeasurementProfile.find({
      customerId: customer._id,
      profileName: targetName,
    }).sort({ version: -1 });

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    // Convert estimated measurements format into BodyMeasurementProfile measurements format
    const profileMeasurements: Record<string, IMeasurementValue> = {};
    for (const [key, item] of Object.entries(finalMeasurements)) {
      const val = typeof item === 'object' ? (item as any).value : Number(item);
      const unit = typeof item === 'object' ? (item as any).unit : 'cm';
      const confidence = session.confidenceScores && (session.confidenceScores as any)[key] ? (session.confidenceScores as any)[key] : (session.captureType === 'MANUAL' ? 1.0 : 0.95);

      if (typeof val === 'number' && !isNaN(val)) {
        profileMeasurements[key] = {
          value: val,
          unit,
          source: session.captureType || 'MANUAL',
          confidence,
          verified: true,
          measuredAt: new Date(),
        };
      }
    }

    // Set previous profiles to non-current
    await BodyMeasurementProfile.updateMany(
      { customerId: customer._id, isCurrent: true },
      { isCurrent: false }
    );

    const newProfile = new BodyMeasurementProfile({
      customerId: customer._id,
      profileName: targetName,
      version: nextVersion,
      isCurrent: true,
      source: session.captureType || 'MANUAL',
      bodyShape: bodyShape || 'ATHLETIC',
      status: 'ACTIVE',
      measurements: profileMeasurements,
    });

    await newProfile.save();

    customer.defaultMeasurementProfileId = newProfile._id as any;
    await customer.save();

    return res.json({
      message: 'Measurement session verified and saved as active measurement profile!',
      session,
      profile: newProfile,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying measurement session', error: error.message });
  }
});

/**
 * POST /api/measurements/sessions/:id/draft
 * Save in-progress draft step measurements to an active measurement session.
 */
router.post('/sessions/:id/draft', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const session = await MeasurementSession.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Measurement session not found.' });
    }

    const { draftMeasurements, currentStep } = req.body;
    if (draftMeasurements && typeof draftMeasurements === 'object') {
      session.estimatedMeasurements = {
        ...(session.estimatedMeasurements || {}),
        ...draftMeasurements,
      };
    }

    session.status = currentStep === 7 ? 'REVIEW_REQUIRED' : 'CAPTURING';
    await session.save();

    return res.json({
      message: 'Measurement session draft updated',
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error saving draft measurements', error: error.message });
  }
});

/**
 * PATCH /api/measurements/sessions/:id/status
 * Explicitly update the status of a measurement session to any valid state:
 * CREATED | CAPTURING | PROCESSING | REVIEW_REQUIRED | VERIFIED | FAILED | CANCELLED
 */
router.patch('/sessions/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findOne({ userId: req.user!.sub });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found.' });
    }

    const { status } = req.body;
    const validStatuses = ['CREATED', 'CAPTURING', 'PROCESSING', 'REVIEW_REQUIRED', 'VERIFIED', 'FAILED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const session = await MeasurementSession.findOne({
      _id: req.params.id,
      customerId: customer._id,
    });

    if (!session) {
      return res.status(404).json({ message: 'Measurement session not found.' });
    }

    session.status = status as any;
    if (['VERIFIED', 'FAILED', 'CANCELLED'].includes(status)) {
      session.completedAt = new Date();
    }

    await session.save();

    return res.json({
      message: `Measurement session status updated to ${status}`,
      session,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating session status', error: error.message });
  }
});

export default router;

