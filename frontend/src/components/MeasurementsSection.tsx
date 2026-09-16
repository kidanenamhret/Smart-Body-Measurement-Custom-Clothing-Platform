import React, { useState, useEffect } from 'react';
import type { MeasurementProfile, MeasurementValue } from '../types';
import {
  fetchMeasurementProfiles,
  saveMeasurementProfile,
  setDefaultMeasurementProfile,
} from '../services/api';
import { AIMeasurementEngine } from './AIMeasurementEngine';
import { MeasureYourselfWizard } from './MeasureYourselfWizard';

interface MeasurementsSectionProps {
  profiles?: MeasurementProfile[];
  onNavigateTab?: (tab: string) => void;
}

export const MeasurementsSection: React.FC<MeasurementsSectionProps> = ({
  profiles: initialProfiles = [],
  onNavigateTab,
}) => {
  const [profiles, setProfiles] = useState<MeasurementProfile[]>(initialProfiles);
  const [activeTab, setActiveTab] = useState<'PROFILES' | 'MEASURE_YOURSELF' | 'AI_ENGINE'>('PROFILES');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CASUAL' | 'FORMAL' | 'TRADITIONAL' | 'WINTER' | 'CUSTOM'>('ALL');
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  
  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [modalProfile, setModalProfile] = useState<MeasurementProfile | null>(null);

  // Update Form State
  const [editMeasurements, setEditMeasurements] = useState<Record<string, number>>({});
  const [editProfileName, setEditProfileName] = useState<string>('');
  const [editFitPreference, setEditFitPreference] = useState<'Slim Fit' | 'Regular Fit' | 'Relaxed Fit'>('Regular Fit');
  const [editBodyShape, setEditBodyShape] = useState<string>('ATHLETIC');

  // Create Form State
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'CASUAL' | 'FORMAL' | 'TRADITIONAL' | 'WINTER' | 'CUSTOM'>('CASUAL');
  const [newFitPreference, setNewFitPreference] = useState<'Slim Fit' | 'Regular Fit' | 'Relaxed Fit'>('Regular Fit');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newHeight, setNewHeight] = useState<number>(182);
  const [newChest, setNewChest] = useState<number>(104);
  const [newWaist, setNewWaist] = useState<number>(84);
  const [newShoulder, setNewShoulder] = useState<number>(46.5);
  const [newSleeve, setNewSleeve] = useState<number>(65);
  const [newInseam, setNewInseam] = useState<number>(82);

  const [successMessage, setSuccessMessage] = useState<string>('');

  // Load profiles on mount
  useEffect(() => {
    fetchMeasurementProfiles().then((profs) => {
      if (profs && profs.length > 0) {
        setProfiles(profs);
        const current = profs.find((p) => p.isCurrent) || profs[0];
        setActiveProfileId(current.id);
      }
    });
  }, []);

  const defaultProfile = profiles.find((p) => p.isCurrent) || profiles[0];
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || defaultProfile;

  const showToastMsg = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSetDefault = async (profileId: string) => {
    const updated = await setDefaultMeasurementProfile(profileId);
    setProfiles(updated);
    setActiveProfileId(profileId);
    showToastMsg(`'${profiles.find((p) => p.id === profileId)?.profileName || 'Profile'}' is now your default profile.`);
  };

  const handleOpenViewModal = (prof: MeasurementProfile) => {
    setModalProfile(prof);
    setIsViewModalOpen(true);
  };

  const handleOpenUpdateModal = (prof: MeasurementProfile) => {
    setModalProfile(prof);
    setEditProfileName(prof.profileName);
    setEditFitPreference(prof.fitPreference || 'Regular Fit');
    setEditBodyShape(prof.bodyShape || 'ATHLETIC');
    const metricVals: Record<string, number> = {};
    Object.entries(prof.measurements || {}).forEach(([k, v]) => {
      metricVals[k] = v.value;
    });
    setEditMeasurements(metricVals);
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProfile) return;

    const updatedMeasurements: Record<string, MeasurementValue> = { ...modalProfile.measurements };
    Object.entries(editMeasurements).forEach(([key, val]) => {
      if (updatedMeasurements[key]) {
        updatedMeasurements[key] = {
          ...updatedMeasurements[key],
          value: Number(val),
          verified: true,
          measuredAt: new Date().toISOString().slice(0, 10),
        };
      } else {
        updatedMeasurements[key] = {
          value: Number(val),
          unit: 'cm',
          source: 'MANUAL',
          verified: true,
          measuredAt: new Date().toISOString().slice(0, 10),
        };
      }
    });

    const updatedProf: MeasurementProfile = {
      ...modalProfile,
      profileName: editProfileName,
      fitPreference: editFitPreference,
      bodyShape: editBodyShape,
      version: modalProfile.version + 1,
      lastVerifiedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      measurements: updatedMeasurements,
    };

    const newProfiles = await saveMeasurementProfile(updatedProf);
    setProfiles(newProfiles);
    setIsUpdateModalOpen(false);
    showToastMsg(`Profile '${updatedProf.profileName}' updated to version v${updatedProf.version}!`);
  };

  const handleCreateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryLabels = {
      CASUAL: 'Casual Wear',
      FORMAL: 'Formal Wear',
      TRADITIONAL: 'Traditional Wear',
      WINTER: 'Winter Clothing',
      CUSTOM: 'Custom Fit',
    };

    const easeAllowances = {
      CASUAL: '+2.5 cm relaxed comfort',
      FORMAL: '+1.0 cm sharp bespoke contour',
      TRADITIONAL: 'Ceremonial drape & ankle clearance',
      WINTER: '+4.0 cm heavy layering allowance',
      CUSTOM: 'Customized tailoring ease',
    };

    const newProf: MeasurementProfile = {
      id: `prof-${Date.now().toString().slice(-6)}`,
      profileName: newProfileName || categoryLabels[newCategory],
      version: 1,
      isCurrent: profiles.length === 0,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      bodyShape: 'ATHLETIC',
      source: 'AI + Manual Verification',
      confidenceScore: 95,
      lastVerifiedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fitPreference: newFitPreference,
      easeAllowance: easeAllowances[newCategory],
      description: newDescription || `Specialized profile for ${categoryLabels[newCategory]} garments.`,
      measurements: {
        height: { value: newHeight, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: new Date().toISOString().slice(0, 10) },
        chest: { value: newChest, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: new Date().toISOString().slice(0, 10) },
        waist: { value: newWaist, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: new Date().toISOString().slice(0, 10) },
        shoulder: { value: newShoulder, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: new Date().toISOString().slice(0, 10) },
        sleeveLength: { value: newSleeve, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: new Date().toISOString().slice(0, 10) },
        inseam: { value: newInseam, unit: 'cm', source: 'MANUAL', verified: true, measuredAt: new Date().toISOString().slice(0, 10) },
      },
    };

    const updatedList = await saveMeasurementProfile(newProf);
    setProfiles(updatedList);
    setActiveProfileId(newProf.id);
    setIsCreateModalOpen(false);
    showToastMsg(`New Measurement Profile '${newProf.profileName}' successfully created!`);
  };

  // Filter profiles based on category tab
  const filteredProfiles = selectedCategory === 'ALL'
    ? profiles
    : profiles.filter((p) => p.category === selectedCategory);

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'CASUAL': return '👕';
      case 'FORMAL': return '👔';
      case 'TRADITIONAL': return '👘';
      case 'WINTER': return '🧥';
      default: return '📐';
    }
  };

  return (
    <section style={{ padding: '32px 0' }}>
      {/* 1. TOP HEADER & NAVIGATION SWITCHER */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem' }}>📏</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
              Your Body Measurement Profiles
            </h2>
          </div>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', maxWidth: '720px' }}>
            Your personal fitting vault. Standardized centimeter body metrics with guided self-measuring, AI vision verification, and specialized fit profiles for Casual, Formal, Traditional, and Winter attire.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setActiveTab('PROFILES')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'PROFILES' ? '1px solid #f59e0b' : 'none',
                background: activeTab === 'PROFILES' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                color: activeTab === 'PROFILES' ? '#f59e0b' : '#94a3b8',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              ⭐ Profiles ({profiles.length})
            </button>
            <button
              onClick={() => setActiveTab('MEASURE_YOURSELF')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'MEASURE_YOURSELF' ? '1px solid #06b6d4' : 'none',
                background: activeTab === 'MEASURE_YOURSELF' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                color: activeTab === 'MEASURE_YOURSELF' ? '#06b6d4' : '#94a3b8',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              📐 Measure Yourself (Steps 1–7)
            </button>
            <button
              onClick={() => setActiveTab('AI_ENGINE')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: activeTab === 'AI_ENGINE' ? '1px solid #10b981' : 'none',
                background: activeTab === 'AI_ENGINE' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: activeTab === 'AI_ENGINE' ? '#34d399' : '#94a3b8',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              🤖 12-Stage AI Scanner
            </button>
          </div>

          <button
            className="btn-primary"
            onClick={() => setActiveTab('MEASURE_YOURSELF')}
            style={{ padding: '10px 18px', fontSize: '0.9rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>📐</span> Measure Yourself
          </button>

          <button
            className="btn-outline"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ padding: '10px 16px', fontSize: '0.9rem', fontWeight: '700' }}
          >
            + Manual Entry
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{ padding: '14px 20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', borderRadius: '10px', marginBottom: '24px', fontWeight: '600' }}>
          ✅ {successMessage}
        </div>
      )}

      {/* ======================================================================== */}
      {/* 2. TAB: PROFILES (FIRST-CLASS CORE FEATURE) */}
      {/* ======================================================================== */}
      {activeTab === 'PROFILES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* A. DEFAULT PROFILE HERO CARD (AS REQUESTED) */}
          {defaultProfile && (
            <div
              className="glass-card"
              style={{
                padding: '32px',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85))',
                border: '1.5px solid #f59e0b',
                borderRadius: '20px',
                boxShadow: '0 12px 36px rgba(245, 158, 11, 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle Ambient Glow */}
              <div
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#080c14',
                        fontWeight: '800',
                        fontSize: '0.8rem',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                      }}
                    >
                      ⭐ Default Profile
                    </span>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                      Version v{defaultProfile.version}
                    </span>
                    {defaultProfile.fitPreference && (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: '12px' }}>
                        {defaultProfile.fitPreference}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', margin: '4px 0 6px 0' }}>
                    {defaultProfile.profileName}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: '600px' }}>
                    {defaultProfile.description || 'Primary calibrated fitting profile used by default for bespoke orders.'}
                  </p>
                </div>

                {/* Confidence Meter */}
                <div style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '16px 20px', textAlign: 'center', minWidth: '180px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                    Measurement Confidence
                  </span>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: '#10b981', lineHeight: '1' }}>
                    {defaultProfile.confidenceScore || 94}%
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${defaultProfile.confidenceScore || 94}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
                  </div>
                </div>
              </div>

              {/* Key Meta Information Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Last verified:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f1f5f9' }}>
                    📅 {defaultProfile.lastVerifiedAt || 'Sept 15, 2026'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Source:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#06b6d4' }}>
                    🔬 {defaultProfile.source || 'AI + Manual Verification'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Ease Allowance:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fbbf24' }}>
                    ✨ {defaultProfile.easeAllowance || '+1.0 cm bespoke contour'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Body Posture / Shape:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#a855f7' }}>
                    🧍 {defaultProfile.bodyShape || 'ATHLETIC'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleOpenViewModal(defaultProfile)}
                  style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: '700' }}
                >
                  👁️ View Measurements
                </button>
                <button
                  className="btn-outline"
                  onClick={() => handleOpenUpdateModal(defaultProfile)}
                  style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: '700' }}
                >
                  ✏️ Update Measurements
                </button>
                {onNavigateTab && (
                  <button
                    className="btn-outline"
                    onClick={() => onNavigateTab('catalog')}
                    style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: '700', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', marginLeft: 'auto' }}
                  >
                    ✂️ Customize Garment With This Profile ➔
                  </button>
                )}
              </div>
            </div>
          )}

          {/* B. SPECIALIZED MEASUREMENT PROFILES (CASUAL, FORMAL, TRADITIONAL, WINTER) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Clothing Style Measurement Profiles
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  Different clothing types require distinct ease allowances and draping clearances. Switch or configure specialized profiles below.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap' }}>
                {(['ALL', 'CASUAL', 'FORMAL', 'TRADITIONAL', 'WINTER'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: selectedCategory === cat ? '1px solid #f59e0b' : 'none',
                      background: selectedCategory === cat ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                      color: selectedCategory === cat ? '#f59e0b' : '#94a3b8',
                      fontWeight: selectedCategory === cat ? '800' : '500',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {cat === 'ALL' ? 'All Styles' : cat === 'CASUAL' ? '👕 Casual Wear' : cat === 'FORMAL' ? '👔 Formal Wear' : cat === 'TRADITIONAL' ? '👘 Traditional' : '🧥 Winter'}
                  </button>
                ))}
              </div>
            </div>

            {/* Profiles Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredProfiles.map((prof) => {
                const isSelected = prof.id === activeProfileId;
                const isDef = prof.isCurrent;

                return (
                  <div
                    key={prof.id}
                    className="glass-card"
                    style={{
                      padding: '24px',
                      borderRadius: '16px',
                      border: isDef ? '1.5px solid #f59e0b' : isSelected ? '1.5px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isDef ? 'rgba(245, 158, 11, 0.04)' : isSelected ? 'rgba(6, 182, 212, 0.04)' : 'rgba(15, 23, 42, 0.6)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => setActiveProfileId(prof.id)}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.4rem' }}>{getCategoryIcon(prof.category)}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase' }}>
                            {prof.categoryLabel || prof.category || 'Custom'}
                          </span>
                        </div>

                        {isDef ? (
                          <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                            ⭐ Default
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(prof.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              color: '#94a3b8',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      {/* Profile Name & Description */}
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 6px 0' }}>
                        {prof.profileName}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 16px 0', minHeight: '38px', lineHeight: '1.4' }}>
                        {prof.description || 'Specialized fitting configuration with tailored ease modifiers.'}
                      </p>

                      {/* Metrics Snapshot */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '12px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>CHEST</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f1f5f9' }}>
                            {prof.measurements?.chest?.value || '--'} cm
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>WAIST</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f1f5f9' }}>
                            {prof.measurements?.waist?.value || '--'} cm
                          </span>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>SHOULDER</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#f1f5f9' }}>
                            {prof.measurements?.shoulder?.value || '--'} cm
                          </span>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Ease:</span>
                          <span style={{ color: '#fbbf24', fontWeight: '600' }}>{prof.easeAllowance || '+1.0 cm'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Last verified:</span>
                          <span style={{ color: '#cbd5e1' }}>{prof.lastVerifiedAt || 'Sept 15, 2026'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Confidence:</span>
                          <span style={{ color: '#10b981', fontWeight: '700' }}>{prof.confidenceScore || 94}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <button
                        className="btn-outline"
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center', justifyContent: 'center' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenViewModal(prof);
                        }}
                      >
                        👁️ View Spec
                      </button>
                      <button
                        className="btn-outline"
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', textAlign: 'center', justifyContent: 'center' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUpdateModal(prof);
                        }}
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* C. ACTIVE PROFILE COMPREHENSIVE METRICS BREAKDOWN */}
          {activeProfile && (
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 4px 0' }}>
                    📊 Detailed Metrics Specification: {activeProfile.profileName}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Standardized measurements in centimeters with precision verification provenance.
                  </span>
                </div>

                <button
                  className="btn-outline"
                  onClick={() => handleOpenViewModal(activeProfile)}
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  📋 Export Measurement Passport
                </button>
              </div>

              {/* Grid of Measurements */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {Object.entries(activeProfile.measurements || {}).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'capitalize', display: 'block', fontWeight: '500' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        {val.source === 'AI' ? '🤖 AI Vision' : val.source === 'TAILOR' ? '✂️ Master Tailor' : '👤 Manual'} • {val.measuredAt}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f1f5f9' }}>
                        {val.value}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '4px' }}>
                        {val.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================== */}
      {/* 3. TAB: MEASURE YOURSELF 7-STEP GUIDED JOURNEY */}
      {/* ======================================================================== */}
      {activeTab === 'MEASURE_YOURSELF' && (
        <MeasureYourselfWizard
          onProfileCreated={(newProf) => {
            setProfiles([newProf, ...profiles]);
            setActiveProfileId(newProf.id);
            setActiveTab('PROFILES');
            showToastMsg(`Profile '${newProf.profileName}' successfully created & saved to your vault!`);
          }}
          onCancel={() => setActiveTab('PROFILES')}
        />
      )}

      {/* ======================================================================== */}
      {/* 4. TAB: AI 12-STAGE VISION ENGINE */}
      {/* ======================================================================== */}
      {activeTab === 'AI_ENGINE' && (
        <AIMeasurementEngine
          onProfileCreated={(newProf) => {
            setProfiles([newProf, ...profiles]);
            setActiveProfileId(newProf.id);
            setActiveTab('PROFILES');
            showToastMsg('AI Camera Profile successfully created and saved!');
          }}
          onCancel={() => setActiveTab('PROFILES')}
        />
      )}

      {/* ======================================================================== */}
      {/* 5. MODAL: VIEW MEASUREMENTS PASSPORT */}
      {/* ======================================================================== */}
      {isViewModalOpen && modalProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              background: '#0f172a',
              border: '1px solid #f59e0b',
              borderRadius: '20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                  ⭐ Official Measurement Passport
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f8fafc', margin: '4px 0' }}>
                  {modalProfile.profileName} (v{modalProfile.version})
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {modalProfile.categoryLabel || modalProfile.category} • Last verified: {modalProfile.lastVerifiedAt || 'Sept 15, 2026'}
                </span>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Spec Sheet Table */}
            <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden', marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#cbd5e1' }}>
                    <th style={{ padding: '12px 16px' }}>Body Point</th>
                    <th style={{ padding: '12px 16px' }}>Dimension</th>
                    <th style={{ padding: '12px 16px' }}>Source</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(modalProfile.measurements || {}).map(([key, item], idx) => (
                    <tr
                      key={key}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      <td style={{ padding: '10px 16px', fontWeight: '600', color: '#e2e8f0', textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: '800', color: '#f59e0b' }}>
                        {item.value} {item.unit}
                      </td>
                      <td style={{ padding: '10px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                        {item.source}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '700' }}>✓ Verified</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn-outline"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(modalProfile.measurements, null, 2));
                  showToastMsg('Measurement Passport copied to clipboard!');
                }}
              >
                📋 Copy Specs
              </button>
              <button className="btn-primary" onClick={() => setIsViewModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* 6. MODAL: UPDATE MEASUREMENTS */}
      {/* ======================================================================== */}
      {isUpdateModalOpen && modalProfile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsUpdateModalOpen(false)}
        >
          <form
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              background: '#0f172a',
              border: '1px solid #06b6d4',
              borderRadius: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveUpdateProfile}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#06b6d4', margin: 0 }}>
                ✏️ Update Measurements ({modalProfile.profileName})
              </h3>
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Profile Name</label>
                <input
                  type="text"
                  value={editProfileName}
                  onChange={(e) => setEditProfileName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Fit Preference</label>
                <select
                  value={editFitPreference}
                  onChange={(e) => setEditFitPreference(e.target.value as any)}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="Slim Fit">Slim Fit (Contoured)</option>
                  <option value="Regular Fit">Regular Fit (Standard)</option>
                  <option value="Relaxed Fit">Relaxed Fit (Comfort)</option>
                </select>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '12px' }}>
              Body Measurements (Centimeters)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              {Object.keys(modalProfile.measurements || {}).map((key) => (
                <div key={key}>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize', display: 'block', marginBottom: '4px' }}>
                    {key.replace(/([A-Z])/g, ' $1')} (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editMeasurements[key] ?? ''}
                    onChange={(e) => setEditMeasurements({ ...editMeasurements, [key]: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save & Create Version v{modalProfile.version + 1}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================================== */}
      {/* 7. MODAL: CREATE NEW MEASUREMENT PROFILE */}
      {/* ======================================================================== */}
      {isCreateModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsCreateModalOpen(false)}
        >
          <form
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              background: '#0f172a',
              border: '1px solid #f59e0b',
              borderRadius: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateProfileSubmit}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#f59e0b', margin: 0 }}>
                ➕ Create New Measurement Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Profile Name</label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Kemis Fit"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Clothing Style Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
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
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Fit Preference</label>
                <select
                  value={newFitPreference}
                  onChange={(e) => setNewFitPreference(e.target.value as any)}
                  style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                >
                  <option value="Slim Fit">Slim Fit (Contoured)</option>
                  <option value="Regular Fit">Regular Fit (Standard)</option>
                  <option value="Relaxed Fit">Relaxed Fit (Comfort)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>Notes / Specific Tailoring Guidance</label>
              <input
                type="text"
                placeholder="e.g. Extra ease around chest for comfortable movement."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
              />
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '12px' }}>
              Key Measurements (Centimeters)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Height (cm)</label>
                <input
                  type="number"
                  value={newHeight}
                  onChange={(e) => setNewHeight(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chest (cm)</label>
                <input
                  type="number"
                  value={newChest}
                  onChange={(e) => setNewChest(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Waist (cm)</label>
                <input
                  type="number"
                  value={newWaist}
                  onChange={(e) => setNewWaist(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Shoulder (cm)</label>
                <input
                  type="number"
                  value={newShoulder}
                  onChange={(e) => setNewShoulder(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Sleeve (cm)</label>
                <input
                  type="number"
                  value={newSleeve}
                  onChange={(e) => setNewSleeve(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Inseam (cm)</label>
                <input
                  type="number"
                  value={newInseam}
                  onChange={(e) => setNewInseam(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid #475569', borderRadius: '6px', color: '#fff' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create & Save Profile 🚀
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};
