import { useEffect, useRef, useState } from 'react';
import { generateActivity, MODES } from '../simulation.js';

export default function ActivityFeed({ modeId, sliders, metrics, tick }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const [lines, setLines] = useState([]);
  const feedRef = useRef(null);

  useEffect(() => {
    const msgs = generateActivity(modeId, sliders, metrics);
    const ts = () => {
      const now = new Date();
      return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    };
    setLines(prev => {
      const next = [
        ...prev,
        { id: Date.now(), ts: ts(), msg: `--- MODE: ${mode.shortLabel} ---`, type: 'system' },
        ...msgs.map((msg, i) => ({ id: Date.now() + i + 1, ts: ts(), msg, type: 'msg' })),
      ].slice(-40);
      return next;
    });
  }, [tick, modeId]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [lines]);

  const getColor = (line) => {
    if (line.type === 'system') return 'var(--text-dim)';
    if (line.msg.startsWith('ADMIN') || line.msg.startsWith('SYSTEM') || line.msg.startsWith('SYSLOG')) return 'var(--amber)';
    if (line.msg.startsWith('** ALERT') || line.msg.startsWith('** No mod')) return 'var(--red)';
    if (line.msg.startsWith('**')) return 'var(--purple)';
    if (line.msg.startsWith('[CONF')) return '#aa77ff';
    if (line.msg.startsWith('[NOTE')) return 'var(--cyan)';
    if (line.msg.startsWith('MAIL')) return '#aa77ff';
    if (line.msg.includes('→')) return 'var(--green)';
    return 'var(--text)';
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="panel-title">Activity Feed</div>
      <div
        ref={feedRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          minHeight: '200px',
          maxHeight: '320px',
        }}
      >
        {lines.length === 0 && (
          <div style={{ color: 'var(--text-dim)', padding: '8px 0' }}>
            Awaiting network activity...
          </div>
        )}
        {lines.map(line => (
          <div key={line.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-dim)', flexShrink: 0, fontSize: '10px' }}>
              {line.ts}
            </span>
            <span style={{ color: getColor(line), wordBreak: 'break-word' }}>
              {line.msg}
            </span>
          </div>
        ))}
      </div>

      {/* Cursor blink */}
      <div style={{
        height: '16px',
        display: 'flex',
        alignItems: 'center',
        marginTop: '4px',
        fontSize: '12px',
        color: 'var(--green)',
      }}>
        <BlinkCursor />
      </div>
    </div>
  );
}

function BlinkCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn(v => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span style={{ opacity: on ? 1 : 0 }}>█</span>;
}
