import React from 'react';

export type MeasurementType =
  | 'height'
  | 'shoulder'
  | 'chest'
  | 'neck'
  | 'waist'
  | 'hip'
  | 'sleeve'
  | 'wrist'
  | 'inseam';

interface GuideData {
  title: string;
  asciiArt: string;
  instruction: string;
  checklist: string[];
}

const GUIDE_DATA: Record<MeasurementType, GuideData> = {
  height: {
    title: 'Height',
    asciiArt: `   📏\n ──┬──\n   │\n   👤\n   │\n ──┴──`,
    instruction: 'Measure your total standing height from the crown of your head to the floor.',
    checklist: ['Stand flat-footed against a wall', 'Keep your posture straight', 'Look directly ahead'],
  },
  shoulder: {
    title: 'Shoulder Width',
    asciiArt: `   ↓\n●──────●\n   👤`,
    instruction: 'Measure from the left shoulder point to the right shoulder point.',
    checklist: ['Stand naturally', 'Keep arms relaxed', 'Use a measuring tape'],
  },
  chest: {
    title: 'Chest',
    asciiArt: ` ← 👤 →\n  (──)`,
    instruction: 'Wrap the tape horizontally across your shoulder blades and under your armpits.',
    checklist: ['Breathe naturally', 'Do not puff out chest', 'Keep tape horizontal'],
  },
  neck: {
    title: 'Neck',
    asciiArt: `   ↓\n ( 👤 )\n   ↑`,
    instruction: 'Wrap the tape around the base of your neck where a shirt collar would sit.',
    checklist: ['Keep one finger between tape and neck', 'Do not pull too tight'],
  },
  waist: {
    title: 'Waist',
    asciiArt: ` ← 👤 →\n  >──<`,
    instruction: 'Measure around your natural waistline, usually 2–3 cm above your navel.',
    checklist: ['Find the narrowest crease when bending sideways', 'Keep one finger between tape and body'],
  },
  hip: {
    title: 'Hip',
    asciiArt: ` ← 👤 →\n (────)`,
    instruction: 'Wrap the tape around the fullest part of your hips and buttocks.',
    checklist: ['Empty your pockets', 'Keep feet together', 'Ensure tape is horizontal'],
  },
  sleeve: {
    title: 'Sleeve',
    asciiArt: `    ●\n   /\n  /\n ●`,
    instruction: 'Measure from the top shoulder bone down over the slightly bent elbow to your wrist.',
    checklist: ['Bend elbow slightly (45°)', 'Hand resting on hip'],
  },
  wrist: {
    title: 'Wrist',
    asciiArt: `   👤\n --||--`,
    instruction: 'Measure around your wrist bone.',
    checklist: ['Measure on the hand you wear a watch', 'Do not pull tape too tight'],
  },
  inseam: {
    title: 'Inseam',
    asciiArt: `   👤\n   / \\\n  |   |`,
    instruction: 'Measure from the top inside of your thigh down to the floor or desired pant break.',
    checklist: ['Wear the shoes you plan to wear with the garment', 'Keep legs straight'],
  },
};

interface VisualMeasurementGuideProps {
  type: MeasurementType;
}

export const VisualMeasurementGuide: React.FC<VisualMeasurementGuideProps> = ({ type }) => {
  const data = GUIDE_DATA[type];

  if (!data) return null;

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* ASCII Art Block */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px',
          minWidth: '160px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <pre
          style={{
            fontFamily: 'monospace',
            fontSize: '1.2rem',
            lineHeight: '1.4',
            color: '#f59e0b',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {data.asciiArt}
        </pre>
      </div>

      {/* Instruction */}
      <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>
        {data.title}
      </h4>
      <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.5' }}>
        {data.instruction}
      </p>

      {/* Checklist */}
      <div style={{ width: '100%', textAlign: 'left' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
          Recommended:
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.checklist.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Action Link */}
      <div style={{ marginTop: '20px', width: '100%' }}>
        <button
          type="button"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          [ How to measure ]
        </button>
      </div>
    </div>
  );
};
