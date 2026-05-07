const METRIC_DEFS = [
  { key: 'communityCohesion',     label: 'Community Cohesion',      color: '#00ff88', icon: '◈' },
  { key: 'knowledgeSharing',      label: 'Knowledge Sharing',        color: '#00cfff', icon: '◉' },
  { key: 'noiseHarassmentRisk',   label: 'Noise / Harassment Risk',  color: '#ff4466', icon: '◬' },
  { key: 'gatekeepingInequality', label: 'Gatekeeping / Inequality', color: '#ffb347', icon: '◧' },
  { key: 'cooperativeConvergence',label: 'Cooperative Convergence',  color: '#aa77ff', icon: '◎' },
  { key: 'surveillanceRisk',      label: 'Surveillance Risk',        color: '#ff4466', icon: '◫' },
];

export default function MetricsPanel({ metrics }) {
  return (
    <div className="panel">
      <div className="panel-title">System Metrics</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {METRIC_DEFS.map(def => {
          const val = metrics[def.key] ?? 0;
          return (
            <div key={def.key}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '3px',
                fontSize: '10px',
              }}>
                <span style={{ color: def.color }}>
                  {def.icon} {def.label.toUpperCase()}
                </span>
                <span style={{
                  color: val > 75 ? def.color : 'var(--text-bright)',
                  fontWeight: 'bold',
                  textShadow: val > 75 ? `0 0 4px ${def.color}` : 'none',
                }}>
                  {val}%
                </span>
              </div>
              <div className="meter-bar">
                <div
                  className="meter-fill"
                  style={{
                    width: `${val}%`,
                    background: val > 75
                      ? `linear-gradient(90deg, ${def.color}88, ${def.color})`
                      : `linear-gradient(90deg, ${def.color}44, ${def.color}88)`,
                    boxShadow: val > 75 ? `0 0 6px ${def.color}` : 'none',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* State summary */}
      <div style={{
        marginTop: '12px',
        padding: '8px',
        background: '#060b10',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        fontSize: '10px',
        color: 'var(--text-dim)',
        lineHeight: '1.6',
      }}>
        <div style={{ color: 'var(--amber)', marginBottom: '4px' }}>▸ NETWORK STATE</div>
        {metrics.communityCohesion > 70 && (
          <div>◈ Strong community bonds forming</div>
        )}
        {metrics.communityCohesion < 30 && (
          <div>◈ Isolated nodes — community fragmented</div>
        )}
        {metrics.noiseHarassmentRisk > 70 && (
          <div style={{ color: '#ff4466' }}>◬ High harassment risk — moderation absent</div>
        )}
        {metrics.cooperativeConvergence > 70 && (
          <div style={{ color: '#aa77ff' }}>◎ Licklider effect: shared model emerging</div>
        )}
        {metrics.gatekeepingInequality > 70 && (
          <div style={{ color: '#ffb347' }}>◧ Access inequality elevated</div>
        )}
        {metrics.surveillanceRisk > 75 && (
          <div style={{ color: '#ff4466' }}>◫ McLuhan: the archive sees everything</div>
        )}
        {metrics.knowledgeSharing > 75 && (
          <div style={{ color: '#00cfff' }}>◉ Collective intelligence accumulating</div>
        )}
      </div>
    </div>
  );
}
