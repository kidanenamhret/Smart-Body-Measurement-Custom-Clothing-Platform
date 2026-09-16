import React from 'react';
import type { TailorProductionStage } from '../types';

interface ProductionProgressBarProps {
  productionStage?: TailorProductionStage | string;
  progressPercent?: number;
  notes?: string;
}

const STAGES: { stage: TailorProductionStage; label: string; icon: string; percent: number }[] = [
  { stage: 'ORDER_ACCEPTED', label: 'Order Accepted', icon: '📝', percent: 0 },
  { stage: 'MEASUREMENT_VERIFIED', label: 'Measurements Verified', icon: '📏', percent: 20 },
  { stage: 'CUTTING', label: 'Fabric Cutting', icon: '✂️', percent: 40 },
  { stage: 'SEWING', label: 'Stitching & Assembly', icon: '🧵', percent: 60 },
  { stage: 'FINISHING', label: 'Press & Detailing', icon: '✨', percent: 80 },
  { stage: 'QUALITY_CHECK', label: 'Quality Check', icon: '🔍', percent: 95 },
  { stage: 'READY', label: 'Garment Ready', icon: '🎁', percent: 100 },
];

export const ProductionProgressBar: React.FC<ProductionProgressBarProps> = ({
  productionStage = 'ORDER_ACCEPTED',
  progressPercent = 0,
  notes,
}) => {
  const currentStageIndex = STAGES.findIndex((s) => s.stage === productionStage);
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
  const computedPercent = progressPercent > 0 ? progressPercent : STAGES[activeIndex].percent;

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header & Percentage Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>✂️</span>
          <h4 style={{ fontSize: '0.95rem', color: '#fff', fontWeight: '700' }}>
            Tailor Production Workflow
          </h4>
          <span style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: '600' }}>
            ({STAGES[activeIndex].label})
          </span>
        </div>

        <span
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(6, 182, 212, 0.2))',
            border: '1px solid #f59e0b',
            color: '#f59e0b',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: '800',
          }}
        >
          {computedPercent}% COMPLETE
        </span>
      </div>

      {/* Progress Bar Container */}
      <div
        style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginBottom: '20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${computedPercent}%`,
            background: 'linear-gradient(90deg, #f59e0b 0%, #06b6d4 100%)',
            borderRadius: '9999px',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.6)',
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </div>

      {/* 7-Step Milestone Stepper */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
        {STAGES.map((s, idx) => {
          const isDone = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={s.stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isCurrent
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : isDone
                    ? 'rgba(16, 185, 129, 0.25)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isCurrent
                    ? '2px solid #fff'
                    : isDone
                    ? '1px solid #10b981'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: isCurrent ? '#000' : isDone ? '#10b981' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  marginBottom: '6px',
                  boxShadow: isCurrent ? '0 0 14px rgba(245, 158, 11, 0.6)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {isDone ? '✓' : s.icon}
              </div>

              <div
                style={{
                  fontSize: '0.65rem',
                  fontWeight: isCurrent ? '700' : '500',
                  color: isCurrent ? '#f59e0b' : isDone ? '#10b981' : '#64748b',
                  lineHeight: '1.1',
                  maxWidth: '56px',
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tailor Workshop Notes Callout */}
      {notes && (
        <div
          style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(6, 182, 212, 0.1)',
            borderLeft: '3px solid #06b6d4',
            borderRadius: '6px',
            fontSize: '0.78rem',
            color: '#cbd5e1',
          }}
        >
          💬 <strong>Workshop Note:</strong> {notes}
        </div>
      )}
    </div>
  );
};
