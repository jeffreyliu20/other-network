import { MODES } from '../simulation.js';

const SLIDER_DEFS = [
  {
    key: 'immediacy',
    label: 'Immediacy',
    low: 'Async / Slow',
    high: 'Real-time / Live',
    color: '#00ff88',
  },
  {
    key: 'persistence',
    label: 'Persistence',
    low: 'Ephemeral',
    high: 'Archived Forever',
    color: '#00cfff',
  },
  {
    key: 'moderation',
    label: 'Moderation',
    low: 'None / Anarchic',
    high: 'Admin Censorship',
    color: '#ffb347',
  },
  {
    key: 'openness',
    label: 'Openness',
    low: 'Closed Lab',
    high: 'Public Network',
    color: '#aa77ff',
  },
  {
    key: 'commercialization',
    label: 'Commercialization',
    low: 'Gift Economy',
    high: 'Professional Hub',
    color: '#ff4466',
  },
];

export default function ControlPanel({ modeId, sliders, onMode, onSlider }) {
  const currentMode = MODES.find(m => m.id === modeId) || MODES[0];

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Mode selector */}
      <div>
        <div className="panel-title">Communication Mode</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {MODES.map(m => (
            <button
              key={m.id}
              className={`btn${modeId === m.id ? ' active' : ''}`}
              onClick={() => onMode(m.id)}
              style={{
                borderColor: modeId === m.id ? m.color : undefined,
                color: modeId === m.id ? m.color : undefined,
                background: modeId === m.id ? `${m.color}18` : undefined,
                boxShadow: modeId === m.id ? `0 0 10px ${m.color}44` : undefined,
                fontSize: '10px',
                padding: '7px 6px',
                textAlign: 'left',
              }}
            >
              <span style={{ marginRight: '5px' }}>{m.icon}</span>
              {m.shortLabel}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: '#060b10',
          border: `1px solid ${currentMode.color}44`,
          borderRadius: '3px',
          fontSize: '11px',
          color: currentMode.color,
          lineHeight: '1.5',
        }}>
          <span style={{ opacity: 0.6 }}>▶ </span>
          {currentMode.desc}
        </div>
        <div style={{
          marginTop: '4px',
          fontSize: '10px',
          color: 'var(--text-dim)',
          lineHeight: '1.4',
          fontStyle: 'italic',
        }}>
          {currentMode.reading}
        </div>
      </div>

      {/* Sliders */}
      <div>
        <div className="panel-title">Network Parameters</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {SLIDER_DEFS.map(def => (
            <div key={def.key}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
                fontSize: '11px',
              }}>
                <span style={{ color: def.color, textShadow: `0 0 4px ${def.color}` }}>
                  {def.label.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-bright)', fontWeight: 'bold' }}>
                  {sliders[def.key]}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliders[def.key]}
                onChange={e => onSlider(def.key, Number(e.target.value))}
                style={{ accentColor: def.color }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: 'var(--text-dim)',
                marginTop: '2px',
              }}>
                <span>{def.low}</span>
                <span>{def.high}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <div className="panel-title" style={{ fontSize: '14px' }}>Scenario Presets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { label: 'Utopian PLATO Republic', mode: 'notes', s: { immediacy: 30, persistence: 90, moderation: 30, openness: 90, commercialization: 5 } },
            { label: 'Chaotic Game Swamp', mode: 'talkomatic', s: { immediacy: 100, persistence: 5, moderation: 5, openness: 80, commercialization: 10 } },
            { label: 'WELL Counterculture', mode: 'well', s: { immediacy: 50, persistence: 80, moderation: 45, openness: 70, commercialization: 30 } },
            { label: 'Professionalized Network', mode: 'well', s: { immediacy: 40, persistence: 85, moderation: 60, openness: 50, commercialization: 95 } },
            { label: 'Surveillance Archive', mode: 'broadcast', s: { immediacy: 30, persistence: 100, moderation: 90, openness: 15, commercialization: 70 } },
          ].map(preset => (
            <button
              key={preset.label}
              className="btn"
              style={{ textAlign: 'left', fontSize: '10px', padding: '5px 8px' }}
              onClick={() => {
                onMode(preset.mode);
                Object.entries(preset.s).forEach(([k, v]) => onSlider(k, v));
              }}
            >
              ▷ {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
