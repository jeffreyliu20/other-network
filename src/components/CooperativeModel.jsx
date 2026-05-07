import { useEffect, useState } from 'react';

const USERS = ['U12', 'U33', 'U47', 'U91', 'U3', 'U22', 'U55', 'U7'];
const DIMS = ['Privacy', 'Authority', 'Community', 'Knowledge', 'Economy'];

function randBetween(a, b) {
  return a + Math.random() * (b - a);
}

function initBeliefs() {
  return USERS.map(id => ({
    id,
    beliefs: DIMS.map(() => randBetween(0.1, 0.9)),
  }));
}

function stepBeliefs(beliefs, convergence, noise) {
  const centroid = DIMS.map((_, di) => {
    const sum = beliefs.reduce((acc, u) => acc + u.beliefs[di], 0);
    return sum / beliefs.length;
  });

  return beliefs.map(user => ({
    ...user,
    beliefs: user.beliefs.map((b, di) => {
      // Pull toward centroid scaled by convergence
      const pull = (centroid[di] - b) * convergence * 0.12;
      // Push away from centroid scaled by noise (chaos fragments beliefs)
      const push = (b - centroid[di]) * noise * 0.10;
      // Random jitter proportional to noise
      const jitter = (Math.random() - 0.5) * noise * 0.12;
      return Math.max(0.02, Math.min(0.98, b + pull + push + jitter));
    }),
  }));
}

const DIM_COLORS = ['#00cfff', '#00ff88', '#aa77ff', '#ffb347', '#ff4466'];

export default function CooperativeModel({ metrics }) {
  const convergence = metrics.cooperativeConvergence / 100;
  // noise drives fragmentation directly
  const noise = metrics.noiseHarassmentRisk / 100;
  // interval: faster when chaotic
  const intervalMs = Math.round(600 - noise * 400);

  const [beliefs, setBeliefs] = useState(initBeliefs);

  useEffect(() => {
    setBeliefs(initBeliefs());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBeliefs(prev => stepBeliefs(prev, convergence, noise));
    }, Math.max(80, intervalMs));
    return () => clearInterval(interval);
  }, [convergence, noise, intervalMs]);

  // Variance per dimension
  const variance = DIMS.map((_, di) => {
    const vals = beliefs.map(u => u.beliefs[di]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return vals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / vals.length;
  });
  const avgVariance = variance.reduce((a, b) => a + b, 0) / variance.length;
  // Max possible variance for uniform [0,1] is 1/12 ≈ 0.083
  const spreadPct = Math.round(Math.min(100, avgVariance / 0.083 * 100));
  const alignmentPct = 100 - spreadPct;

  return (
    <div className="panel">
      <div className="panel-title">Cooperative Model (Licklider)</div>
      <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '8px' }}>
        Each user holds beliefs across 5 dimensions. Watch them converge or fragment.
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ color: 'var(--text-dim)', textAlign: 'left', paddingBottom: '4px', fontWeight: 'normal' }}>
                USER
              </th>
              {DIMS.map((d, i) => (
                <th key={d} style={{ color: DIM_COLORS[i], textAlign: 'center', fontWeight: 'normal', paddingBottom: '4px', fontSize: '9px' }}>
                  {d.slice(0, 4).toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beliefs.map(user => (
              <tr key={user.id}>
                <td style={{ color: 'var(--text-dim)', paddingRight: '6px', paddingBottom: '3px' }}>
                  {user.id}
                </td>
                {user.beliefs.map((b, di) => (
                  <td key={di} style={{ textAlign: 'center', paddingBottom: '3px' }}>
                    <div style={{
                      width: '20px',
                      height: '12px',
                      margin: '0 auto',
                      background: DIM_COLORS[di],
                      opacity: 0.1 + b * 0.9,
                      borderRadius: '2px',
                      boxShadow: b > 0.75 ? `0 0 5px ${DIM_COLORS[di]}` : 'none',
                      transition: 'opacity 0.15s',
                    }} title={`${DIMS[di]}: ${Math.round(b * 100)}%`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '10px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '6px' }}>
          BELIEF SPREAD (high = fragmented; low = convergent)
        </div>
        {DIMS.map((d, i) => (
          <div key={d} style={{ marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '2px' }}>
              <span style={{ color: DIM_COLORS[i] }}>{d}</span>
              <span style={{ color: 'var(--text-dim)' }}>{Math.round(Math.min(100, variance[i] / 0.083 * 100))}%</span>
            </div>
            <div className="meter-bar">
              <div
                className="meter-fill"
                style={{
                  width: `${Math.min(100, variance[i] / 0.083 * 100)}%`,
                  background: `linear-gradient(90deg, ${DIM_COLORS[i]}44, ${DIM_COLORS[i]})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '10px',
        padding: '6px',
        background: '#060b10',
        border: `1px solid ${alignmentPct > 60 ? '#00ff8844' : alignmentPct > 30 ? '#ffb34744' : '#ff446644'}`,
        borderRadius: '3px',
        fontSize: '10px',
        textAlign: 'center',
      }}>
        <span style={{ color: 'var(--text-dim)' }}>MODEL ALIGNMENT: </span>
        <span style={{
          color: alignmentPct > 60 ? 'var(--green)' : alignmentPct > 30 ? 'var(--amber)' : 'var(--red)',
          fontWeight: 'bold',
          textShadow: alignmentPct > 60 ? '0 0 6px var(--green)' : alignmentPct < 30 ? '0 0 6px var(--red)' : 'none',
        }}>
          {alignmentPct}%
        </span>
        <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>
          {alignmentPct > 65 ? '— cooperative model converging' :
           alignmentPct > 35 ? '— partial shared understanding' :
           '— fragmented worldviews'}
        </span>
      </div>
    </div>
  );
}
