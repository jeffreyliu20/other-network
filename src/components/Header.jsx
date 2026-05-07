import { useEffect, useState } from 'react';

const TAGLINES = [
  'Social Computing Simulator — PLATO / ARPANET / The WELL',
  'Communication is not transmission. It is cooperative modeling.',
  'The medium reorganizes what is possible.',
  'Every network is also a community. Every community is also a medium.',
];

export default function Header({ tick }) {
  const [tagline, setTagline] = useState(0);
  const [time, setTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTagline(t => (t + 1) % TAGLINES.length);
  }, [tick]);

  return (
    <header style={{
      borderBottom: '1px solid var(--border-glow)',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(180deg, #0a1520 0%, var(--bg) 100%)',
      flexWrap: 'wrap',
      gap: '6px',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--vt)',
          fontSize: '28px',
          letterSpacing: '4px',
          color: 'var(--cyan)',
          textShadow: '0 0 12px var(--cyan), 0 0 30px rgba(0,207,255,0.3)',
          lineHeight: 1,
        }}>
          THE OTHER NETWORK
        </div>
        <div style={{
          fontSize: '10px',
          color: 'var(--text-dim)',
          letterSpacing: '2px',
          marginTop: '2px',
          transition: 'all 0.5s ease',
        }}>
          {TAGLINES[tagline]}
        </div>
      </div>
      <div style={{
        textAlign: 'right',
        fontFamily: 'var(--vt)',
        fontSize: '16px',
        color: 'var(--green)',
        textShadow: '0 0 6px var(--green)',
        lineHeight: '1.4',
      }}>
        <div>{time}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--mono)' }}>
          TICK #{tick}
        </div>
      </div>
    </header>
  );
}
