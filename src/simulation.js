// All simulation data, modes, and state-derivation logic

export const MODES = [
  {
    id: 'broadcast',
    label: 'Broadcast Lesson',
    shortLabel: 'BROADCAST',
    icon: '📡',
    color: '#ffb347',
    desc: 'One instructor, many passive receivers. No back-channel.',
    defaults: { immediacy: 80, persistence: 30, moderation: 70, openness: 20, commercialization: 10 },
    topology: 'star',
    reading: 'McLuhan: the transmitter defines the receiver; Rankin: PLATO classrooms pre-social',
  },
  {
    id: 'talk',
    label: 'PLATO Talk',
    shortLabel: 'TALK',
    icon: '💬',
    color: '#00ff88',
    desc: 'Synchronous dyadic channel. Two users; intense; no record.',
    defaults: { immediacy: 95, persistence: 5, moderation: 20, openness: 40, commercialization: 5 },
    topology: 'dyadic',
    reading: 'Rankin: PLATO "talk" as intimate real-time channel; Licklider: two-node cooperative model',
  },
  {
    id: 'talkomatic',
    label: 'Talkomatic',
    shortLabel: 'TALKOMATIC',
    icon: '🔥',
    color: '#ff4466',
    desc: 'Multi-user real-time group chat. Chaotic, immediate, ephemeral.',
    defaults: { immediacy: 100, persistence: 5, moderation: 10, openness: 50, commercialization: 5 },
    topology: 'chaotic',
    reading: 'Rankin: group channel; McLuhan: electric immediacy collapses social distance',
  },
  {
    id: 'notes',
    label: 'Notes / BBS',
    shortLabel: 'NOTES',
    icon: '📋',
    color: '#00cfff',
    desc: 'Async bulletin board. Slow, persistent, broad participation.',
    defaults: { immediacy: 20, persistence: 90, moderation: 40, openness: 60, commercialization: 10 },
    topology: 'hub',
    reading: 'Rankin: notes as community memory; Licklider: shared model evolves over time',
  },
  {
    id: 'email',
    label: 'E-Mail',
    shortLabel: 'E-MAIL',
    icon: '✉️',
    color: '#aa77ff',
    desc: 'Asynchronous private message. Personal ties, delayed.',
    defaults: { immediacy: 10, persistence: 80, moderation: 20, openness: 30, commercialization: 20 },
    topology: 'bilateral',
    reading: 'Licklider/Taylor: targeted communication; early ARPANET use patterns',
  },
  {
    id: 'well',
    label: 'WELL Conference',
    shortLabel: 'THE WELL',
    icon: '🌐',
    color: '#aa77ff',
    desc: 'Topic-based virtual community. Clustered, identity-forming, evolving.',
    defaults: { immediacy: 40, persistence: 85, moderation: 50, openness: 70, commercialization: 50 },
    topology: 'cluster',
    reading: 'Turner: counterculture meets network economy; McLuhan: medium produces community',
  },
];

export const READING_LENS = [
  {
    id: 'licklider',
    label: 'Licklider & Taylor',
    color: '#00cfff',
    desc: 'Communication as cooperative modeling — computers as shared dynamic media where people build common mental models together.',
    trigger: (s) => s.metrics.cooperativeConvergence > 55,
  },
  {
    id: 'rankin',
    label: 'Rankin (PLATO)',
    color: '#00ff88',
    desc: 'PLATO users becoming "computing citizens" — educational infrastructure spawning social community, identity, norms, harassment, and censorship debates.',
    trigger: (s) => ['talk','talkomatic','notes'].includes(s.modeId),
  },
  {
    id: 'turner',
    label: 'Turner (The WELL)',
    color: '#aa77ff',
    desc: 'Counterculture meets network economy — gift-economy community transforms into professional networking; identity and authenticity under commercial pressure.',
    trigger: (s) => s.sliders.commercialization > 50 || s.modeId === 'well',
  },
  {
    id: 'mcluhan',
    label: 'McLuhan',
    color: '#ffb347',
    desc: '"The medium is the message" — the communication architecture itself (not the content) reshapes social perception, privacy, distance, and community.',
    trigger: () => true,
  },
];

// Derive all metrics from mode + sliders
export function deriveMetrics(modeId, sliders) {
  const { immediacy, persistence, moderation, openness, commercialization } = sliders;

  // Base per-mode tuning
  const base = {
    broadcast:   { cohesion: 15, knowledge: 40, noise: 10, gatekeeping: 75, convergence: 20, surveillance: 55 },
    talk:        { cohesion: 80, knowledge: 50, noise: 20, gatekeeping: 30, convergence: 65, surveillance: 25 },
    talkomatic:  { cohesion: 55, knowledge: 30, noise: 85, gatekeeping: 20, convergence: 40, surveillance: 20 },
    notes:       { cohesion: 50, knowledge: 75, noise: 35, gatekeeping: 40, convergence: 70, surveillance: 50 },
    email:       { cohesion: 45, knowledge: 55, noise: 15, gatekeeping: 30, convergence: 50, surveillance: 60 },
    well:        { cohesion: 75, knowledge: 80, noise: 45, gatekeeping: 45, convergence: 75, surveillance: 40 },
  }[modeId] || { cohesion: 50, knowledge: 50, noise: 50, gatekeeping: 50, convergence: 50, surveillance: 50 };

  const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

  return {
    communityCohesion:      clamp(base.cohesion + openness * 0.25 - commercialization * 0.1 + persistence * 0.1),
    knowledgeSharing:       clamp(base.knowledge + persistence * 0.15 + openness * 0.1 - moderation * 0.05),
    noiseHarassmentRisk:    clamp(base.noise + immediacy * 0.15 - moderation * 0.2 + openness * 0.05),
    gatekeepingInequality:  clamp(base.gatekeeping - openness * 0.3 + commercialization * 0.2 + moderation * 0.1),
    cooperativeConvergence: clamp(base.convergence + persistence * 0.15 + openness * 0.1 - noise * 0.05),
    surveillanceRisk:       clamp(base.surveillance + persistence * 0.15 + moderation * 0.1 - openness * 0.05),
  };
}

// Generate activity feed messages for a given mode + metrics
export function generateActivity(modeId, sliders, metrics) {
  const pools = {
    broadcast: [
      'SYSTEM: Lesson 4B loaded. 127 terminals receiving.',
      'USER_214: [passive] viewed "Introduction to TUTOR programming"',
      'INSTRUCTOR: Broadcasting: "Chapter 3 — Control Structures"',
      'USER_088: [no response channel available]',
      'ADMIN: Attendance log updated. 94% completion rate.',
      'USER_302: [passive] Lesson completed. Score: 87/100',
      'SYSTEM: One-way channel active. No back-channel.',
      'INSTRUCTOR: Next lesson queued: "Database Fundamentals"',
    ],
    talk: [
      'USER_12 → USER_47: "can you see my screen?"',
      'USER_47 → USER_12: "yes got it — try line 34"',
      'USER_12 → USER_47: "OH. the semicolon. obviously"',
      'USER_47 → USER_12: "we all do it"',
      'USER_12 → USER_47: "what are you working on tonight?"',
      '** talk session opened: USER_33 ↔ USER_91 **',
      'USER_33 → USER_91: "did you hear about the system change?"',
      'USER_91 → USER_33: "no — when?"',
      'USER_33 → USER_91: "someone posted in notes. check it."',
      '** dyadic channel: no archive, no audience **',
    ],
    talkomatic: [
      'USER_7:  hey who else is stuck on the physics sim',
      'USER_12: SAME i cant get the gravity right',
      'USER_44: lol try multiplying by 9.8',
      'USER_7:  oh my god',
      'USER_3:  wait what channel is this',
      'USER_22: TALKOMATIC — cs lounge',
      'USER_44: anyone playing empire tonight',
      'USER_12: obviously',
      'USER_3:  this is chaos',
      'USER_7:  this IS the medium',
      '** 14 users in channel — scroll rate: HIGH **',
      'USER_55: who modifies the avatar glyphs',
      'USER_22: whoever feels like it',
      '** SYSTEM: channel full (30/30) **',
    ],
    notes: [
      '[NOTE 0441] RE: System downtime - posted 3 days ago',
      '[NOTE 0442] RE: RE: downtime - "it was a router issue in Urbana"',
      '[NOTE 0443] RE: RE: RE: downtime - "this keeps happening"',
      '[NOTE 0498] NEW: Proposal for community guidelines on PLATO',
      '[NOTE 0499] RE: Guidelines - "we don\'t need admin control here"',
      '[NOTE 0500] RE: RE: Guidelines - "USER_32 keeps spamming lesson boards"',
      '[NOTE 0501] MODERATOR: Thread locked pending review.',
      '[NOTE 0512] HISTORY: This thread is now part of the system archive.',
      '[NOTE 0513] NEW: Anyone interested in a music appreciation notes board?',
      '[NOTE 0514] RE: Music - "yes, three others confirmed"',
      '** Notes become community memory. Slow is durable. **',
    ],
    email: [
      'MAIL from: director@arpa → subject: quarterly report attached',
      'MAIL from: USER_8 → subject: RE: your proposal',
      'MAIL from: USER_8: "I agree but we should discuss async"',
      'MAIL from: SYSTEM → subject: storage quota warning',
      'MAIL from: USER_19 → subject: job posting — contractor role',
      'MAIL from: USER_44 → subject: can we talk? synchronously?',
      'MAIL from: USER_44: "email feels slow for this"',
      'MAIL from: USER_3 → subject: FWD: FWD: network news digest',
      '** Personal channel. No broadcast. Slow but personal. **',
      'MAIL from: USER_91 → subject: the community is changing',
    ],
    well: [
      '[CONF: parenting] USER_Mandel: "anyone dealt with a kid refusing school?"',
      '[CONF: grateful_dead] USER_Barlow: "set list from Boulder — transcendent"',
      '[CONF: work] USER_Brand: "anyone know a good sys admin in the Bay?"',
      '[CONF: parenting] USER_Rheingold: "yes — call me, this is important"',
      '[CONF: meta] USER_anon: "is the WELL still a community or a product?"',
      '[CONF: work] USER_Levy: "three job leads in this thread already"',
      '[CONF: grateful_dead] USER_Barlow: "the music brought us here. the WELL keeps us."',
      '[CONF: meta] USER_Mandel: "you are what you WELL"',
      '[CONF: meta] USER_anon: "real names only policy — enforced or norm?"',
      '[CONF: work] USER_Brand: "community and economy are not opposites"',
      '** Virtual community. Real relationships. Countercultural roots, professional branches. **',
    ],
  };

  // Inject dynamic messages based on slider extremes
  const dynamic = [];
  if (sliders.moderation > 80) dynamic.push('ADMIN: Post removed — community standards violation.');
  if (sliders.moderation < 20) dynamic.push('** No moderation active. Signal/noise ratio: LOW **');
  if (sliders.commercialization > 75) dynamic.push('USER_PRO: "who here is hiring?" [3 DMs received]');
  if (sliders.openness > 85) dynamic.push('** Public network: new user joined from outside institution **');
  if (sliders.openness < 20) dynamic.push('SECURITY: External connection attempt blocked.');
  if (metrics.noiseHarassmentRisk > 75) dynamic.push('** ALERT: Harassment report filed. Moderator notified. **');
  if (metrics.surveillanceRisk > 80) dynamic.push('SYSLOG: All sessions archived to tape. Admin access unlimited.');
  if (metrics.cooperativeConvergence > 85) dynamic.push('** Cooperative model convergence detected: shared understanding emerging **');

  const pool = [...(pools[modeId] || []), ...dynamic];
  // Shuffle and return 6
  return pool.sort(() => Math.random() - 0.5).slice(0, 6);
}

// Node layout helpers for network graph
export function getNodeLayout(topology, count = 20) {
  const nodes = [];
  const W = 400, H = 300, cx = W / 2, cy = H / 2;

  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count;
    let x, y, role;

    switch (topology) {
      case 'star':
        if (i === 0) { x = cx; y = cy; role = 'hub'; }
        else { x = cx + 160 * Math.cos(angle); y = cy + 120 * Math.sin(angle); role = 'receiver'; }
        break;
      case 'dyadic': {
        const pair = Math.floor(i / 2);
        const side = i % 2;
        x = 60 + pair * 35 + side * 20;
        y = cy + (pair % 3 - 1) * 70;
        role = 'peer';
        break;
      }
      case 'chaotic':
        x = 40 + Math.random() * 320;
        y = 30 + Math.random() * 240;
        role = 'node';
        break;
      case 'hub':
        if (i === 0) { x = cx; y = cy; role = 'hub'; }
        else {
          const r = 60 + (i % 3) * 55;
          x = cx + r * Math.cos(angle); y = cy + r * Math.sin(angle); role = 'spoke';
        }
        break;
      case 'bilateral': {
        const col = i % 4;
        const row = Math.floor(i / 4);
        x = 50 + col * 90; y = 50 + row * 65; role = 'node';
        break;
      }
      case 'cluster': {
        const clusters = [[cx - 110, cy - 70], [cx + 110, cy - 70], [cx, cy + 90]];
        const c = clusters[i % 3];
        const r2 = 30 + Math.random() * 20;
        const a2 = Math.random() * 2 * Math.PI;
        x = c[0] + r2 * Math.cos(a2); y = c[1] + r2 * Math.sin(a2); role = 'member';
        break;
      }
      default:
        x = cx + 150 * Math.cos(angle); y = cy + 120 * Math.sin(angle); role = 'node';
    }
    nodes.push({ id: i, x, y, role, active: Math.random() > 0.3 });
  }
  return nodes;
}

export function getEdges(topology, nodes) {
  const edges = [];
  switch (topology) {
    case 'star':
      nodes.slice(1).forEach(n => edges.push({ from: nodes[0], to: n, type: 'broadcast' }));
      break;
    case 'dyadic':
      for (let i = 0; i < nodes.length - 1; i += 2) {
        edges.push({ from: nodes[i], to: nodes[i+1], type: 'talk' });
      }
      break;
    case 'chaotic':
      nodes.forEach(n => {
        const others = nodes.filter(o => o.id !== n.id && Math.random() > 0.65);
        others.slice(0, 2).forEach(o => edges.push({ from: n, to: o, type: 'chat' }));
      });
      break;
    case 'hub':
      nodes.slice(1).forEach(n => edges.push({ from: nodes[0], to: n, type: 'notes' }));
      break;
    case 'bilateral':
      nodes.forEach(n => {
        if (Math.random() > 0.5 && n.id + 1 < nodes.length) {
          edges.push({ from: n, to: nodes[n.id + 1], type: 'email' });
        }
      });
      break;
    case 'cluster': {
      const clusterOf = (i) => i % 3;
      nodes.forEach(n => {
        nodes.filter(o => o.id !== n.id && clusterOf(o.id) === clusterOf(n.id) && Math.random() > 0.3)
          .slice(0, 2)
          .forEach(o => edges.push({ from: n, to: o, type: 'conf' }));
      });
      // Cross-cluster ties (sparse)
      nodes.filter((_, i) => i % 7 === 0).forEach(n => {
        const target = nodes[Math.floor(Math.random() * nodes.length)];
        if (target.id !== n.id) edges.push({ from: n, to: target, type: 'weak' });
      });
      break;
    }
    default:
      break;
  }
  return edges;
}
