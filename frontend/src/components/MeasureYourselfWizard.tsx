import React, { useState, useEffect } from 'react';
import type { MeasurementProfile } from '../types';
import {
  createMeasurementSession,
  saveMeasurementSessionDraft,
  verifyMeasurementSession,
} from '../services/api';
import { VisualMeasurementGuide } from './VisualMeasurementGuide';

interface MeasureYourselfWizardProps {
  onProfileCreated?: (profile: MeasurementProfile) => void;
  onCancel?: () => void;
  initialCategory?: 'CASUAL' | 'FORMAL' | 'TRADITIONAL' | 'WINTER' | 'CUSTOM';
}

export type MeasureStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface StepInfo {
  number: MeasureStepNumber;
  title: string;
  shortName: string;
  icon: string;
  description: string;
  tailorTip: string;
}

const WIZARD_STEPS: StepInfo[] = [
  {
    number: 1,
    title: 'Step 1: Height',
    shortName: 'Height',
    icon: '📏',
    description: 'Total standing height measured from the crown of your head to the floor.',
    tailorTip: 'Stand flat-footed against a wall without shoes. Keep your posture straight, eyes looking directly ahead.',
  },
  {
    number: 2,
    title: 'Step 2: Shoulders',
    shortName: 'Shoulders',
    icon: '👔',
    description: 'Across-back shoulder width measured between the outer acromion shoulder bones.',
    tailorTip: 'Measure along the natural curve of the upper back from the tip of the left shoulder bone to the tip of the right shoulder bone.',
  },
  {
    number: 3,
    title: 'Step 3: Chest',
    shortName: 'Chest',
    icon: '🫁',
    description: 'Circumference around the fullest part of your chest/bust.',
    tailorTip: 'Wrap the tape horizontally across your shoulder blades and under your armpits. Breathe naturally; do not puff or suck in your chest.',
  },
  {
    number: 4,
    title: 'Step 4: Waist',
    shortName: 'Waist',
    icon: '📐',
    description: 'Circumference around your natural waistline, usually 2–3 cm above your navel.',
    tailorTip: 'Find the narrowest crease of your torso when bending slightly sideways. Keep one finger between tape and body for comfortable ease.',
  },
  {
    number: 5,
    title: 'Step 5: Arms',
    shortName: 'Arms',
    icon: '💪',
    description: 'Sleeve and arm length from shoulder bone to wrist bone with arm slightly bent.',
    tailorTip: 'Bend your elbow at a slight 45° angle with your hand resting on your hip. Measure from the top shoulder bone down over the elbow to your wrist.',
  },
  {
    number: 6,
    title: 'Step 6: Legs',
    shortName: 'Legs',
    icon: '👖',
    description: 'Inseam (crotch to ankle) and Outseam (waist to ankle hem) for trousers and dresses.',
    tailorTip: 'Measure from the top inside of your thigh down to the top of your shoes (Inseam) and from waistline to desired pant break (Outseam).',
  },
  {
    number: 7,
    title: 'Step 7: Review & Finalize',
    shortName: 'Review',
    icon: '⭐',
    description: 'Review your personalized measurements before saving your bespoke fitting profile.',
    tailorTip: 'Check each metric and choose your preferred fit ease. You can edit any step with 1 click before finalizing.',
  },
];

export const MeasureYourselfWizard: React.FC<MeasureYourselfWizardProps> = ({
  onProfileCreated,
  onCancel,
  initialCategory = 'CUSTOM',
}) => {
  const [currentStep, setCurrentStep] = useState<MeasureStepNumber>(1);
  const [unitMode, setUnitMode] = useState<'cm' | 'in'>('cm');
  const [sessionId, setSessionId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Step 1: Height
  const [height, setHeight] = useState<number>(182); // cm

  // Step 2: Shoulders
  const [shoulderWidth, setShoulderWidth] = useState<number>(46.5); // cm
  const [backWidth, setBackWidth] = useState<number>(44); // cm

  // Step 3: Chest
  const [chest, setChest] = useState<number>(104); // cm
  const [neck, setNeck] = useState<number>(39.5); // cm

  // Step 4: Waist
  const [waist, setWaist] = useState<number>(84); // cm
  const [hip, setHip] = useState<number>(98); // cm

  // Step 5: Arms
  const [sleeveLength, setSleeveLength] = useState<number>(65); // cm
  const [bicep, setBicep] = useState<number>(34); // cm
  const [wrist, setWrist] = useState<number>(17.5); // cm

  // Step 6: Legs
  const [inseam, setInseam] = useState<number>(82); // cm
  const [outseam, setOutseam] = useState<number>(106); // cm
  const [thigh, setThigh] = useState<number>(58); // cm

  // Step 7: Profile Customization
  const [profileName, setProfileName] = useState<string>('My Bespoke Profile');
  const [category, setCategory] = useState<'CASUAL' | 'FORMAL' | 'TRADITIONAL' | 'WINTER' | 'CUSTOM'>(initialCategory);
  const [fitPreference, setFitPreference] = useState<'Slim Fit' | 'Regular Fit' | 'Relaxed Fit'>('Regular Fit');
  const [bodyShape, setBodyShape] = useState<string>('ATHLETIC');

  // Initialize backend session on component mount
  useEffect(() => {
    createMeasurementSession({ captureType: 'MANUAL', heightReference: height.toString() })
      .then(({ session }) => {
        if (session && session.sessionId) {
          setSessionId(session.sessionId);
        }
      })
      .catch((err) => console.warn('Could not initialize backend measurement session:', err));
  }, []);

  // Helper unit conversions
  const toDisplay = (cmVal: number) => {
    if (unitMode === 'cm') return cmVal;
    return Math.round((cmVal / 2.54) * 10) / 10;
  };

  const fromDisplay = (val: number) => {
    if (unitMode === 'cm') return val;
    return Math.round(val * 2.54 * 10) / 10;
  };

  const getActiveMeasurementsMap = () => ({
    height: { value: height, unit: 'cm' },
    shoulder: { value: shoulderWidth, unit: 'cm' },
    backWidth: { value: backWidth, unit: 'cm' },
    chest: { value: chest, unit: 'cm' },
    neck: { value: neck, unit: 'cm' },
    waist: { value: waist, unit: 'cm' },
    hip: { value: hip, unit: 'cm' },
    sleeveLength: { value: sleeveLength, unit: 'cm' },
    bicep: { value: bicep, unit: 'cm' },
    wrist: { value: wrist, unit: 'cm' },
    inseam: { value: inseam, unit: 'cm' },
    outseam: { value: outseam, unit: 'cm' },
    thigh: { value: thigh, unit: 'cm' },
  });

  // Save session draft when stepping forward
  const handleNextStep = () => {
    if (sessionId) {
      saveMeasurementSessionDraft(sessionId, getActiveMeasurementsMap(), currentStep + 1);
    }
    if (currentStep < 7) {
      setCurrentStep((prev) => (prev + 1) as MeasureStepNumber);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as MeasureStepNumber);
    }
  };

  const handleJumpToStep = (stepNum: MeasureStepNumber) => {
    setCurrentStep(stepNum);
  };

  // Final confirmation on Step 7
  const handleFinalizeAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Verifying measurements and creating permanent profile version...');

    try {
      const result = await verifyMeasurementSession(sessionId || `sess-manual-${Date.now()}`, {
        verifiedMeasurements: getActiveMeasurementsMap(),
        profileName: profileName.trim() || 'My Bespoke Profile',
        category,
        fitPreference,
        bodyShape,
      });

      setIsSaving(false);
      setStatusMessage('✨ Profile successfully created and saved to your fit vault!');

      if (onProfileCreated && result.profile) {
        setTimeout(() => {
          onProfileCreated(result.profile);
        }, 600);
      }
    } catch (err: any) {
      setIsSaving(false);
      setStatusMessage('⚠️ Could not save profile: ' + (err.message || 'Unknown error'));
    }
  };

  const activeStepInfo = WIZARD_STEPS[currentStep - 1];

  return (
    <div
      className="glass-card"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.94) 100%)',
        border: '1.5px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow Effect */}
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* TOP HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.8rem' }}>📐</span>
            <h2
              style={{
                fontSize: '1.8rem',
                fontWeight: '900',
                margin: 0,
                background: 'linear-gradient(90deg, #f59e0b, #ec4899, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Measure Yourself
            </h2>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              7-Step Guided Journey
            </span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            Follow the illustrated step-by-step guide to record accurate anatomical body dimensions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Unit Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              padding: '3px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <button
              type="button"
              onClick={() => setUnitMode('cm')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: unitMode === 'cm' ? '#f59e0b' : 'transparent',
                color: unitMode === 'cm' ? '#080c14' : '#94a3b8',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Centimeters (cm)
            </button>
            <button
              type="button"
              onClick={() => setUnitMode('in')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                background: unitMode === 'in' ? '#f59e0b' : 'transparent',
                color: unitMode === 'in' ? '#080c14' : '#94a3b8',
                fontWeight: '800',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Inches (in)
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              ✕ Exit
            </button>
          )}
        </div>
      </div>

      {/* 7-STEP PROGRESS STEPPER */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '10px',
          }}
        >
          {WIZARD_STEPS.map((step) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;

            return (
              <div
                key={step.number}
                onClick={() => handleJumpToStep(step.number)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 4px',
                  borderRadius: '12px',
                  background: isActive
                    ? 'rgba(245, 158, 11, 0.15)'
                    : isCompleted
                    ? 'rgba(16, 185, 129, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isActive
                    ? '1.5px solid #f59e0b'
                    : isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>{step.icon}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: isActive ? '#f59e0b' : isCompleted ? '#34d399' : '#64748b',
                    }}
                  >
                    Step {step.number}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#f8fafc' : isCompleted ? '#cbd5e1' : '#94a3b8',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {step.shortName}
                </span>
              </div>
            );
          })}
        </div>

        {/* Linear Progress Bar */}
        <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentStep - 1) / 6) * 100}%`,
              background: 'linear-gradient(90deg, #f59e0b, #ec4899, #06b6d4)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '20px',
          }}
        >
          {statusMessage}
        </div>
      )}

      {/* MAIN STEP CONTENT AREA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: currentStep === 7 ? '1fr' : '1.2fr 1fr',
          gap: '28px',
          alignItems: 'start',
          marginBottom: '32px',
        }}
      >
        {/* LEFT / MAIN COLUMN: INPUT CONTROLS & STEP DETAILS */}
        <div>
          {/* Step Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.5rem' }}>{activeStepInfo.icon}</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
                {activeStepInfo.title}
              </h3>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              {activeStepInfo.description}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '12px 16px',
                background: 'rgba(245, 158, 11, 0.08)',
                borderLeft: '3px solid #f59e0b',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.85rem',
                color: '#fef08a',
              }}
            >
              <span>💡</span>
              <div>
                <strong>Tailor's Tip: </strong>
                {activeStepInfo.tailorTip}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STEP 1: HEIGHT */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <VisualMeasurementGuide type="height" />
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                    Standing Body Height ({unitMode})
                  </label>
                  <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#f59e0b' }}>
                    {toDisplay(height)} {unitMode}
                    {unitMode === 'cm' && (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '6px' }}>
                        ({Math.floor(height / 30.48)}'{Math.round((height % 30.48) / 2.54)}")
                      </span>
                    )}
                  </span>
                </div>

                {/* Range Slider + Stepper Input */}
                <input
                  type="range"
                  min={unitMode === 'cm' ? 120 : 48}
                  max={unitMode === 'cm' ? 220 : 86}
                  step={unitMode === 'cm' ? 1 : 0.5}
                  value={toDisplay(height)}
                  onChange={(e) => setHeight(fromDisplay(parseFloat(e.target.value) || 180))}
                  style={{ width: '100%', accentColor: '#f59e0b', height: '8px', cursor: 'pointer', marginBottom: '16px' }}
                />

                {/* Quick Selection Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>Quick Select:</span>
                  {[165, 170, 175, 180, 182, 185, 190].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHeight(preset)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: height === preset ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: height === preset ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: height === preset ? '#f59e0b' : '#cbd5e1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: '600',
                      }}
                    >
                      {unitMode === 'cm' ? `${preset} cm` : `${toDisplay(preset)} in`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: SHOULDERS */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <VisualMeasurementGuide type="shoulder" />
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                    Shoulder Width (Acromion to Acromion)
                  </label>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>
                    {toDisplay(shoulderWidth)} {unitMode}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitMode === 'cm' ? 35 : 14}
                  max={unitMode === 'cm' ? 60 : 24}
                  step={unitMode === 'cm' ? 0.5 : 0.2}
                  value={toDisplay(shoulderWidth)}
                  onChange={(e) => setShoulderWidth(fromDisplay(parseFloat(e.target.value) || 46))}
                  style={{ width: '100%', accentColor: '#f59e0b', height: '8px', cursor: 'pointer', marginBottom: '14px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[42, 44, 46.5, 48, 50, 52].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setShoulderWidth(val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: shoulderWidth === val ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: shoulderWidth === val ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: shoulderWidth === val ? '#f59e0b' : '#cbd5e1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {toDisplay(val)} {unitMode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Back Width */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block' }}>
                    Upper Back Width (Optional)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Distance across back blade creases
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    value={toDisplay(backWidth)}
                    onChange={(e) => setBackWidth(fromDisplay(parseFloat(e.target.value) || 44))}
                    style={{
                      width: '80px',
                      padding: '6px 10px',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: '700',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{unitMode}</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: CHEST */}
          {/* ============================================================== */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <VisualMeasurementGuide type="chest" />
                <VisualMeasurementGuide type="neck" />
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                    Full Chest / Bust Circumference
                  </label>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>
                    {toDisplay(chest)} {unitMode}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitMode === 'cm' ? 75 : 30}
                  max={unitMode === 'cm' ? 140 : 56}
                  step={unitMode === 'cm' ? 0.5 : 0.2}
                  value={toDisplay(chest)}
                  onChange={(e) => setChest(fromDisplay(parseFloat(e.target.value) || 104))}
                  style={{ width: '100%', accentColor: '#f59e0b', height: '8px', cursor: 'pointer', marginBottom: '14px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[96, 100, 104, 108, 112, 116].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setChest(val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: chest === val ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: chest === val ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: chest === val ? '#f59e0b' : '#cbd5e1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {toDisplay(val)} {unitMode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neck Circumference */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block' }}>
                    Neck Collar Size
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Around base of neck for shirt collar fit
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    value={toDisplay(neck)}
                    onChange={(e) => setNeck(fromDisplay(parseFloat(e.target.value) || 39))}
                    style={{
                      width: '80px',
                      padding: '6px 10px',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: '700',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{unitMode}</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: WAIST */}
          {/* ============================================================== */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <VisualMeasurementGuide type="waist" />
                <VisualMeasurementGuide type="hip" />
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                    Natural Waist Circumference
                  </label>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>
                    {toDisplay(waist)} {unitMode}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitMode === 'cm' ? 60 : 24}
                  max={unitMode === 'cm' ? 130 : 52}
                  step={unitMode === 'cm' ? 0.5 : 0.2}
                  value={toDisplay(waist)}
                  onChange={(e) => setWaist(fromDisplay(parseFloat(e.target.value) || 84))}
                  style={{ width: '100%', accentColor: '#f59e0b', height: '8px', cursor: 'pointer', marginBottom: '14px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[76, 80, 84, 88, 92, 96].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setWaist(val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: waist === val ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: waist === val ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: waist === val ? '#f59e0b' : '#cbd5e1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {toDisplay(val)} {unitMode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hip / Seat */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', display: 'block' }}>
                    Hip / Seat Circumference
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Around the fullest part of hips & buttocks
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.5"
                    value={toDisplay(hip)}
                    onChange={(e) => setHip(fromDisplay(parseFloat(e.target.value) || 98))}
                    style={{
                      width: '80px',
                      padding: '6px 10px',
                      background: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#fff',
                      textAlign: 'center',
                      fontWeight: '700',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{unitMode}</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 5: ARMS */}
          {/* ============================================================== */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <VisualMeasurementGuide type="sleeve" />
                <VisualMeasurementGuide type="wrist" />
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                    Sleeve / Arm Length
                  </label>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>
                    {toDisplay(sleeveLength)} {unitMode}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitMode === 'cm' ? 50 : 20}
                  max={unitMode === 'cm' ? 80 : 32}
                  step={unitMode === 'cm' ? 0.5 : 0.2}
                  value={toDisplay(sleeveLength)}
                  onChange={(e) => setSleeveLength(fromDisplay(parseFloat(e.target.value) || 65))}
                  style={{ width: '100%', accentColor: '#f59e0b', height: '8px', cursor: 'pointer', marginBottom: '14px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[60, 63, 65, 67, 70].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSleeveLength(val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: sleeveLength === val ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: sleeveLength === val ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: sleeveLength === val ? '#f59e0b' : '#cbd5e1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {toDisplay(val)} {unitMode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bicep & Wrist row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Bicep Circumference
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={toDisplay(bicep)}
                      onChange={(e) => setBicep(fromDisplay(parseFloat(e.target.value) || 34))}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{unitMode}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Wrist Circumference
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={toDisplay(wrist)}
                      onChange={(e) => setWrist(fromDisplay(parseFloat(e.target.value) || 17.5))}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{unitMode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 6: LEGS */}
          {/* ============================================================== */}
          {currentStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <VisualMeasurementGuide type="inseam" />
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc' }}>
                    Inseam Length (Crotch to Ankle)
                  </label>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>
                    {toDisplay(inseam)} {unitMode}
                  </span>
                </div>
                <input
                  type="range"
                  min={unitMode === 'cm' ? 65 : 26}
                  max={unitMode === 'cm' ? 100 : 40}
                  step={unitMode === 'cm' ? 0.5 : 0.2}
                  value={toDisplay(inseam)}
                  onChange={(e) => setInseam(fromDisplay(parseFloat(e.target.value) || 82))}
                  style={{ width: '100%', accentColor: '#f59e0b', height: '8px', cursor: 'pointer', marginBottom: '14px' }}
                />
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[76, 78, 80, 82, 84, 86].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setInseam(val)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: inseam === val ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                        background: inseam === val ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        color: inseam === val ? '#f59e0b' : '#cbd5e1',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {toDisplay(val)} {unitMode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outseam & Thigh Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Outseam / Total Pant Length
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={toDisplay(outseam)}
                      onChange={(e) => setOutseam(fromDisplay(parseFloat(e.target.value) || 106))}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{unitMode}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                    Thigh Circumference
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      step="0.5"
                      value={toDisplay(thigh)}
                      onChange={(e) => setThigh(fromDisplay(parseFloat(e.target.value) || 58))}
                      style={{ width: '100%', padding: '6px 8px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff', fontWeight: '700' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{unitMode}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 7: REVIEW & FINALIZE */}
          {/* ============================================================== */}
          {currentStep === 7 && (
            <form onSubmit={handleFinalizeAndSave}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '20px',
                  marginBottom: '24px',
                }}
              >
                {/* 1. Profile Metadata Form */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f59e0b', margin: '0 0 16px 0' }}>
                    📋 Fitting Profile Metadata
                  </h4>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Profile Title
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Primary Bespoke Fit, Suit Profile..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '600',
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Style Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                      >
                        <option value="CASUAL">👕 Casual Wear</option>
                        <option value="FORMAL">👔 Formal Wear</option>
                        <option value="TRADITIONAL">👘 Traditional Wear</option>
                        <option value="WINTER">🧥 Winter Clothing</option>
                        <option value="CUSTOM">📐 Custom Fit</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                        Fit Preference
                      </label>
                      <select
                        value={fitPreference}
                        onChange={(e) => setFitPreference(e.target.value as any)}
                        style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                      >
                        <option value="Slim Fit">Slim Fit (Contoured)</option>
                        <option value="Regular Fit">Regular Fit (Standard)</option>
                        <option value="Relaxed Fit">Relaxed Fit (Comfort)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                      Body Shape / Posture
                    </label>
                    <select
                      value={bodyShape}
                      onChange={(e) => setBodyShape(e.target.value)}
                      style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                    >
                      <option value="ATHLETIC">Athletic / Broad Shoulders</option>
                      <option value="REGULAR">Regular / Balanced Proportion</option>
                      <option value="SLIM">Slim / Lean Contour</option>
                      <option value="HOURGLASS">Hourglass Proportion</option>
                      <option value="OVAL">Oval / Relaxed Midsection</option>
                    </select>
                  </div>
                </div>

                {/* 2. Full Verified Measurements Breakdown */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#06b6d4', margin: 0 }}>
                      📊 Measured Dimensions Spec
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>
                      ✓ 6 Core Steps Verified
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    {[
                      { label: 'Step 1: Height', value: `${toDisplay(height)} ${unitMode}`, step: 1 as MeasureStepNumber },
                      { label: 'Step 2: Shoulder', value: `${toDisplay(shoulderWidth)} ${unitMode}`, step: 2 as MeasureStepNumber },
                      { label: 'Step 3: Chest', value: `${toDisplay(chest)} ${unitMode}`, step: 3 as MeasureStepNumber },
                      { label: 'Step 4: Waist', value: `${toDisplay(waist)} ${unitMode}`, step: 4 as MeasureStepNumber },
                      { label: 'Step 5: Sleeve', value: `${toDisplay(sleeveLength)} ${unitMode}`, step: 5 as MeasureStepNumber },
                      { label: 'Step 6: Inseam', value: `${toDisplay(inseam)} ${unitMode}`, step: 6 as MeasureStepNumber },
                      { label: 'Neck Collar', value: `${toDisplay(neck)} ${unitMode}`, step: 3 as MeasureStepNumber },
                      { label: 'Hip / Seat', value: `${toDisplay(hip)} ${unitMode}`, step: 4 as MeasureStepNumber },
                      { label: 'Outseam', value: `${toDisplay(outseam)} ${unitMode}`, step: 6 as MeasureStepNumber },
                      { label: 'Bicep', value: `${toDisplay(bicep)} ${unitMode}`, step: 5 as MeasureStepNumber },
                      { label: 'Wrist', value: `${toDisplay(wrist)} ${unitMode}`, step: 5 as MeasureStepNumber },
                      { label: 'Thigh', value: `${toDisplay(thigh)} ${unitMode}`, step: 6 as MeasureStepNumber },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block' }}>{item.label}</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f8fafc' }}>{item.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleJumpToStep(item.step)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f59e0b',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: '2px 4px',
                          }}
                          title={`Edit ${item.label}`}
                        >
                          ✏️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setCurrentStep(6)}
                  style={{ padding: '12px 24px' }}
                >
                  ← Back to Step 6 (Legs)
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                  style={{
                    padding: '14px 32px',
                    fontSize: '1rem',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  {isSaving ? '⏳ Finalizing Profile...' : '⭐ Complete & Save Measurement Profile'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: INTERACTIVE ANATOMICAL BODY SILHOUETTE GUIDE */}
        {currentStep < 7 && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Target Anatomy Guide
              </span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontWeight: '700' }}>
                {activeStepInfo.shortName} Active
              </span>
            </div>

            {/* SVG Anatomical Silhouette with dynamic highlighted region */}
            <div
              style={{
                width: '100%',
                maxWidth: '260px',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <svg viewBox="0 0 200 400" style={{ width: '100%', height: '100%' }}>
                {/* Neutral Body Silhouette */}
                <g fill="rgba(255, 255, 255, 0.08)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5">
                  {/* Head */}
                  <circle cx="100" cy="45" r="22" />
                  {/* Neck */}
                  <rect x="94" y="67" width="12" height="14" rx="2" />
                  {/* Torso */}
                  <path d="M 65,85 L 135,85 L 125,200 L 75,200 Z" />
                  {/* Left Arm */}
                  <path d="M 65,85 L 45,160 L 35,230 L 45,235 L 58,165 L 75,95 Z" />
                  {/* Right Arm */}
                  <path d="M 135,85 L 155,160 L 165,230 L 155,235 L 142,165 L 125,95 Z" />
                  {/* Legs */}
                  <path d="M 75,200 L 125,200 L 120,380 L 105,380 L 100,240 L 95,380 L 80,380 Z" />
                </g>

                {/* DYNAMIC STEP HIGHLIGHTS */}
                {/* Step 1: Height (Full vertical ruler vector) */}
                {currentStep === 1 && (
                  <g>
                    <line x1="20" y1="20" x2="20" y2="385" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
                    <circle cx="20" cy="20" r="4" fill="#f59e0b" />
                    <circle cx="20" cy="385" r="4" fill="#f59e0b" />
                    <text x="30" y="200" fill="#f59e0b" fontSize="12" fontWeight="bold" transform="rotate(-90 30 200)">
                      Height: {toDisplay(height)} {unitMode}
                    </text>
                  </g>
                )}

                {/* Step 2: Shoulders (Upper horizontal line) */}
                {currentStep === 2 && (
                  <g>
                    <line x1="55" y1="85" x2="145" y2="85" stroke="#f59e0b" strokeWidth="4" />
                    <circle cx="55" cy="85" r="6" fill="#f59e0b" />
                    <circle cx="145" cy="85" r="6" fill="#f59e0b" />
                    <text x="100" y="75" fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Shoulder: {toDisplay(shoulderWidth)} {unitMode}
                    </text>
                  </g>
                )}

                {/* Step 3: Chest (Circumference band) */}
                {currentStep === 3 && (
                  <g>
                    <rect x="62" y="115" width="76" height="26" rx="6" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" strokeWidth="2.5" />
                    <line x1="50" y1="128" x2="150" y2="128" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="100" y="132" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Chest: {toDisplay(chest)} {unitMode}
                    </text>
                  </g>
                )}

                {/* Step 4: Waist (Mid torso band) */}
                {currentStep === 4 && (
                  <g>
                    <rect x="68" y="165" width="64" height="24" rx="6" fill="rgba(245, 158, 11, 0.4)" stroke="#f59e0b" strokeWidth="2.5" />
                    <line x1="55" y1="177" x2="145" y2="177" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                    <text x="100" y="181" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      Waist: {toDisplay(waist)} {unitMode}
                    </text>
                  </g>
                )}

                {/* Step 5: Arms (Sleeve vector highlight) */}
                {currentStep === 5 && (
                  <g>
                    <path d="M 65,85 L 45,160 L 35,230" fill="none" stroke="#f59e0b" strokeWidth="4" />
                    <circle cx="65" cy="85" r="5" fill="#f59e0b" />
                    <circle cx="45" cy="160" r="4" fill="#06b6d4" />
                    <circle cx="35" cy="230" r="5" fill="#f59e0b" />
                    <text x="10" y="165" fill="#f59e0b" fontSize="11" fontWeight="bold">
                      Arm: {toDisplay(sleeveLength)} {unitMode}
                    </text>
                  </g>
                )}

                {/* Step 6: Legs (Inseam & Outseam vectors) */}
                {currentStep === 6 && (
                  <g>
                    {/* Inseam line */}
                    <line x1="100" y1="240" x2="95" y2="380" stroke="#10b981" strokeWidth="3" />
                    <circle cx="100" cy="240" r="4" fill="#10b981" />
                    <circle cx="95" cy="380" r="4" fill="#10b981" />
                    {/* Outseam line */}
                    <line x1="130" y1="200" x2="120" y2="380" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="130" cy="200" r="4" fill="#f59e0b" />
                    <circle cx="120" cy="380" r="4" fill="#f59e0b" />
                    <text x="100" y="320" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">
                      Inseam: {toDisplay(inseam)} {unitMode}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Metric Live Summary Card */}
            <div
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                marginTop: '12px',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Active Dimension</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f59e0b' }}>
                {currentStep === 1
                  ? `${toDisplay(height)} ${unitMode}`
                  : currentStep === 2
                  ? `${toDisplay(shoulderWidth)} ${unitMode}`
                  : currentStep === 3
                  ? `${toDisplay(chest)} ${unitMode}`
                  : currentStep === 4
                  ? `${toDisplay(waist)} ${unitMode}`
                  : currentStep === 5
                  ? `${toDisplay(sleeveLength)} ${unitMode}`
                  : `${toDisplay(inseam)} ${unitMode}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER STEP NAVIGATION (FOR STEPS 1 TO 6) */}
      {currentStep < 7 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            className="btn-outline"
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            style={{
              padding: '10px 20px',
              opacity: currentStep === 1 ? 0.4 : 1,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ← Previous Step
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Step <strong>{currentStep}</strong> of 7
            </span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleNextStep}
            style={{
              padding: '12px 28px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {currentStep === 6 ? 'Review Measurements ➔' : `Next: ${WIZARD_STEPS[currentStep].shortName} ➔`}
          </button>
        </div>
      )}
    </div>
  );
};
