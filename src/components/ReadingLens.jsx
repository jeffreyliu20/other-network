import { READING_LENS } from '../simulation.js';

export default function ReadingLens({ modeId, sliders, metrics }) {
  const state = { modeId, sliders, metrics };

  return (
    <div className="panel">
      <div className="panel-title">Reading Lens</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {READING_LENS.map(lens => {
          const active = lens.trigger(state);
          return (
            <div
              key={lens.id}
              style={{
                padding: '8px 10px',
                background: active ? `${lens.color}10` : '#060b10',
                border: `1px solid ${active ? lens.color + '66' : 'var(--border)'}`,
                borderRadius: '3px',
                transition: 'all 0.4s ease',
                opacity: active ? 1 : 0.45,
              }}
            >
              <div style={{
                color: active ? lens.color : 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                marginBottom: '4px',
                textShadow: active ? `0 0 6px ${lens.color}` : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{
                  display: 'inline-block',
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: active ? lens.color : 'var(--border)',
                  boxShadow: active ? `0 0 6px ${lens.color}` : 'none',
                  flexShrink: 0,
                }} />
                {lens.label.toUpperCase()}
                {active && (
                  <span style={{ marginLeft: 'auto', fontSize: '9px', color: lens.color, opacity: 0.7 }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <div style={{
                fontSize: '10px',
                color: active ? 'var(--text-bright)' : 'var(--text-dim)',
                lineHeight: '1.5',
              }}>
                {lens.desc}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '10px',
        color: 'var(--text-dim)',
        lineHeight: '1.5',
        fontStyle: 'italic',
        borderTop: '1px solid var(--border)',
        paddingTop: '8px',
      }}>
        Lenses activate based on current mode and parameters.
        McLuhan is always true: you cannot step outside the medium.
      </div>
    </div>
  );
}
