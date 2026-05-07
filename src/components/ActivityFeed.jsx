import { useEffect, useRef, useState, useCallback } from 'react';
import { generateActivity, MODES } from '../simulation.js';

const BOT_NAMES = ['USER_7', 'USER_12', 'USER_22', 'USER_33', 'USER_44', 'USER_47', 'USER_55', 'USER_91', 'USER_3'];

const BOT_REACTIONS = {
  talkomatic: [
    (msg) => `lol ${msg.split(' ')[0]}`,
    (msg) => `wait what`,
    (msg) => `same omg`,
    (msg) => `who said that`,
    (msg) => `^ this`,
    (msg) => `anyone else seeing this`,
    (msg) => `** 3 users typing **`,
    (msg) => `go back to playing empire`,
    () => `THIS IS CHAOS`,
    (msg) => `RE: "${msg.slice(0, 20)}..." — agreed`,
  ],
  talk: [
    (msg) => `got it, "${msg.slice(0, 15)}..."`,
    (msg) => `can you clarify that?`,
    (msg) => `interesting — tell me more`,
    (msg) => `noted. working on it`,
  ],
  notes: [
    (msg) => `[NOTE] RE: "${msg.slice(0, 20)}" — this belongs in the archive`,
    (msg) => `[NOTE] I disagree. See thread 0442.`,
    (msg) => `[NOTE] Moderator notified.`,
    (msg) => `[NOTE] This is now part of system history.`,
  ],
  well: [
    (msg) => `[CONF: meta] RE: "${msg.slice(0,20)}" — the community is watching`,
    (msg) => `[CONF: work] anyone hiring after this thread?`,
    (msg) => `[CONF: parenting] this reminds me of something Rheingold wrote`,
    (msg) => `[CONF: grateful_dead] off-topic but — anyone at the show last night?`,
  ],
  broadcast: [
    () => `[passive] no back-channel available`,
    () => `SYSTEM: user attempted reply — rejected`,
  ],
  email: [
    (msg) => `MAIL → YOU: RE: "${msg.slice(0,20)}" — will respond async`,
    (msg) => `MAIL → YOU: forwarding to 3 others`,
  ],
};

function botReact(modeId, userMsg) {
  const pool = BOT_REACTIONS[modeId] || BOT_REACTIONS.talkomatic;
  const fn = pool[Math.floor(Math.random() * pool.length)];
  const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
  return { bot, text: fn(userMsg) };
}

function ts() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

export default function ActivityFeed({ modeId, sliders, metrics, tick }) {
  const mode = MODES.find(m => m.id === modeId) || MODES[0];
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const feedRef = useRef(null);
  const inputRef = useRef(null);

  const addLines = useCallback((newLines) => {
    setLines(prev => [...prev, ...newLines].slice(-60));
  }, []);

  // Auto-feed on tick
  useEffect(() => {
    const msgs = generateActivity(modeId, sliders, metrics);
    addLines([
      { id: `sys-${Date.now()}`, ts: ts(), msg: `--- ${mode.shortLabel} ---`, type: 'system' },
      ...msgs.map((msg, i) => ({ id: `auto-${Date.now()}-${i}`, ts: ts(), msg, type: 'msg' })),
    ]);
  }, [tick, modeId]);

  // Fast auto-feed for talkomatic
  useEffect(() => {
    if (modeId !== 'talkomatic') return;
    const interval = setInterval(() => {
      const bot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const lines = [
        `${bot}: anyone here`,
        `${bot}: lol`,
        `${bot}: this channel is wild`,
        `${bot}: ** scroll rate: HIGH **`,
        `${bot}: wait who are you`,
        `${bot}: playing empire later?`,
        `${bot}: ^ same`,
        `${bot}: this is the medium`,
      ];
      addLines([{
        id: `bot-${Date.now()}`,
        ts: ts(),
        msg: lines[Math.floor(Math.random() * lines.length)],
        type: 'bot',
      }]);
    }, 1200);
    return () => clearInterval(interval);
  }, [modeId]);

  // Scroll to bottom
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [lines]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');

    // User message
    const newLines = [{
      id: `user-${Date.now()}`,
      ts: ts(),
      msg: `YOU: ${userMsg}`,
      type: 'user',
    }];

    // Bot reactions — more in talkomatic, fewer in email
    const reactionCount = {
      talkomatic: 3 + Math.floor(Math.random() * 4),
      talk: 1,
      notes: 1,
      well: 2,
      email: 1,
      broadcast: 1,
    }[modeId] ?? 1;

    for (let i = 0; i < reactionCount; i++) {
      setTimeout(() => {
        const { bot, text } = botReact(modeId, userMsg);
        addLines([{ id: `react-${Date.now()}-${i}`, ts: ts(), msg: `${bot}: ${text}`, type: 'bot' }]);
      }, 300 + i * (modeId === 'talkomatic' ? 150 : 600));
    }

    addLines(newLines);
  };

  const getColor = (line) => {
    if (line.type === 'system') return 'var(--text-dim)';
    if (line.type === 'user') return 'var(--green)';
    if (line.type === 'bot') return mode.color;
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
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">Activity Feed</div>
      <div
        ref={feedRef}
        style={{
          overflowY: 'auto',
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          minHeight: '180px',
          maxHeight: '280px',
        }}
      >
        {lines.length === 0 && (
          <div style={{ color: 'var(--text-dim)', padding: '8px 0' }}>Awaiting network activity...</div>
        )}
        {lines.map(line => (
          <div key={line.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-dim)', flexShrink: 0, fontSize: '10px' }}>{line.ts}</span>
            <span style={{ color: getColor(line), wordBreak: 'break-word' }}>{line.msg}</span>
          </div>
        ))}
      </div>

      {/* User input */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginTop: '8px',
        borderTop: '1px solid var(--border)',
        paddingTop: '8px',
        alignItems: 'center',
      }}>
        <span style={{ color: mode.color, fontSize: '11px', flexShrink: 0 }}>YOU▸</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`send a message via ${mode.shortLabel}...`}
          style={{
            flex: 1,
            background: '#060b10',
            border: `1px solid ${mode.color}44`,
            borderRadius: '2px',
            color: 'var(--text-bright)',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            padding: '4px 8px',
            outline: 'none',
          }}
        />
        <button
          className="btn"
          onClick={handleSend}
          style={{ borderColor: mode.color, color: mode.color, flexShrink: 0 }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
