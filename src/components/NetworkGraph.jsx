import { useEffect, useRef, useState, useMemo } from 'react';
import { getNodeLayout, getEdges, MODES } from '../simulation.js';

const NODE_COUNT = 22;

export default function NetworkGraph({ modeId, metrics, tick }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const nodes = useMemo(() => getNodeLayout(mode.topology, NODE_COUNT), [modeId, tick]);
  const edges = useMemo(() => getEdges(mode.topology, nodes), [nodes]);
  const [pulses, setPulses] = useState([]);
  const pulseRef = useRef(0);

  // Animate pulses along edges
  useEffect(() => {
    const interval = setInterval(() => {
      if (edges.length === 0) return;
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const id = pulseRef.current++;
      setPulses(p => [...p.slice(-12), { id, from: edge.from, to: edge.to, progress: 0 }]);
    }, 400);
    return () => clearInterval(interval);
  }, [edges]);

  useEffect(() => {
    const anim = setInterval(() => {
      setPulses(p =>
        p.map(pulse => ({ ...pulse, progress: pulse.progress + 0.06 }))
          .filter(pulse => pulse.progress < 1)
      );
    }, 40);
    return () => clearInterval(anim);
  }, []);

  const color = mode.color;
  const cohesion = metrics.communityCohesion / 100;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        fontFamily: 'var(--vt)',
        fontSize: '16px',
        color: 'var(--cyan)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        textShadow: '0 0 8px var(--cyan)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '6px',
        marginBottom: '8px',
      }}>
        Network Topology — {mode.shortLabel}
      </div>
      <svg
        viewBox="0 0 400 300"
        style={{ width: '100%', background: '#060b10', borderRadius: '4px', border: '1px solid var(--border)' }}
      >
        {/* Grid lines */}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 43} x2="400" y2={i * 43}
            stroke="#0a1520" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`v${i}`} x1={i * 44} y1="0" x2={i * 44} y2="300"
            stroke="#0a1520" strokeWidth="1" />
        ))}

        {/* Edges */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.from.x} y1={e.from.y}
            x2={e.to.x} y2={e.to.y}
            stroke={color}
            strokeWidth={e.type === 'weak' ? 0.5 : 1}
            strokeOpacity={e.type === 'weak' ? 0.2 : 0.3 + cohesion * 0.3}
          />
        ))}

        {/* Pulse particles */}
        {pulses.map(pulse => {
          const x = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
          const y = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;
          return (
            <circle
              key={pulse.id}
              cx={x} cy={y} r={2.5}
              fill={color}
              opacity={1 - pulse.progress * 0.8}
              style={{ filter: `drop-shadow(0 0 3px ${color})` }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const r = node.role === 'hub' ? 7 : 4;
          const opacity = node.active ? 1 : 0.3;
          return (
            <g key={node.id}>
              <circle
                cx={node.x} cy={node.y} r={r + 3}
                fill={color}
                fillOpacity={0.08 * opacity}
              />
              <circle
                cx={node.x} cy={node.y} r={r}
                fill={node.role === 'hub' ? color : '#0f1923'}
                stroke={color}
                strokeWidth={node.role === 'hub' ? 2 : 1}
                fillOpacity={opacity}
                strokeOpacity={opacity}
                style={{ filter: node.active ? `drop-shadow(0 0 4px ${color})` : 'none' }}
              />
              {node.active && (
                <circle
                  cx={node.x} cy={node.y} r={r + 6}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.5}
                  strokeOpacity={0.2}
                />
              )}
            </g>
          );
        })}

        {/* Cohesion overlay: convergence rings */}
        {metrics.cooperativeConvergence > 60 && (
          <circle
            cx={200} cy={150} r={80 + metrics.cooperativeConvergence * 0.5}
            fill="none"
            stroke={color}
            strokeWidth={1}
            strokeOpacity={0.12}
            strokeDasharray="4 6"
          />
        )}
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        marginTop: '6px', fontSize: '10px', color: 'var(--text-dim)',
        letterSpacing: '0.5px',
      }}>
        <span>NODES: {NODE_COUNT}</span>
        <span>EDGES: {edges.length}</span>
        <span>TOPOLOGY: {mode.topology.toUpperCase()}</span>
        <span style={{ color: 'var(--green)', marginLeft: 'auto' }}>
          COHESION: {metrics.communityCohesion}%
        </span>
      </div>
    </div>
  );
}
