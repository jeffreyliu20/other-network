import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { MODES, deriveMetrics } from './simulation.js';
import Header from './components/Header.jsx';
import NetworkGraph from './components/NetworkGraph.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import CooperativeModel from './components/CooperativeModel.jsx';
import ReadingLens from './components/ReadingLens.jsx';

const DEFAULT_MODE = 'notes';
const DEFAULT_SLIDERS = MODES.find(m => m.id === DEFAULT_MODE)?.defaults || {
  immediacy: 20, persistence: 90, moderation: 40, openness: 60, commercialization: 10,
};

export default function App() {
  const [modeId, setModeId] = useState(DEFAULT_MODE);
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);
  const [tick, setTick] = useState(0);
  const [graphTick, setGraphTick] = useState(0);

  const metrics = deriveMetrics(modeId, sliders);

  // Advance feed tick every 5 seconds
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const handleMode = useCallback((id) => {
    const mode = MODES.find(m => m.id === id);
    setModeId(id);
    if (mode?.defaults) setSliders(mode.defaults);
    setGraphTick(n => n + 1);
    setTick(n => n + 1);
  }, []);

  const handleSlider = useCallback((key, val) => {
    setSliders(prev => ({ ...prev, [key]: val }));
  }, []);

  const mode = MODES.find(m => m.id === modeId) || MODES[0];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      <Header tick={tick} />

      {/* Main layout */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '280px 1fr 280px',
        gridTemplateRows: 'auto auto',
        gap: '10px',
        padding: '10px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
      }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridRow: '1 / 3' }}>
          <ControlPanel
            modeId={modeId}
            sliders={sliders}
            onMode={handleMode}
            onSlider={handleSlider}
          />
        </div>

        {/* Center top: network graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="panel" style={{ flex: '0 0 auto' }}>
            <NetworkGraph modeId={modeId} metrics={metrics} tick={graphTick} />
          </div>

          {/* Center bottom: activity feed */}
          <ActivityFeed modeId={modeId} sliders={sliders} metrics={metrics} tick={tick} />

          {/* Mode banner */}
          <div style={{
            padding: '8px 12px',
            background: `${mode.color}10`,
            border: `1px solid ${mode.color}44`,
            borderRadius: '4px',
            fontSize: '11px',
            color: mode.color,
            letterSpacing: '1px',
            textAlign: 'center',
            textShadow: `0 0 6px ${mode.color}`,
            fontFamily: 'var(--vt)',
            fontSize: '15px',
          }}>
            {mode.icon} {mode.label.toUpperCase()} — {mode.topology.toUpperCase()} TOPOLOGY
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', gridRow: '1 / 3' }}>
          <MetricsPanel metrics={metrics} />
          <CooperativeModel metrics={metrics} />
          <ReadingLens modeId={modeId} sliders={sliders} metrics={metrics} />
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '8px 20px',
        fontSize: '10px',
        color: 'var(--text-dim)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '4px',
      }}>
        <span>Week 7 — Social Computing — "The Other Network"</span>
        <span>Licklider & Taylor · Rankin · Turner · McLuhan</span>
        <span style={{ color: 'var(--green)' }}>the medium is the message</span>
      </footer>
    </div>
  );
}
