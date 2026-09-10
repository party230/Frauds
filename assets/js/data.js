/* Official Fraud Rankings — dataset
 * Every Fraud is graded on 10 distinct qualities, all split evenly (10% each).
 * All figures below are fictional.
 */

var CATEGORIES = [
  { key: 'height',        label: 'Height',            blurb: 'Raw verticality and standing presence.' },
  { key: 'frame',         label: 'Body Frame',        blurb: 'Shoulder width, clavicular structure, natural build.' },
  { key: 'transformation',label: 'Transformation',    blurb: 'Weight loss, muscle gain, grooming and facial refinement over time.' },
  { key: 'aesthetics',    label: 'Facial Aesthetics', blurb: 'Bone structure, symmetry, harmony of the midface.' },
  { key: 'grooming',      label: 'Grooming',          blurb: 'Skin, hair, upkeep and day-to-day maintenance.' },
  { key: 'drip',          label: 'Style & Drip',      blurb: 'Fit selection, tailoring, consistency of wardrobe.' },
  { key: 'business',      label: 'Business Acumen',   blurb: 'Ventures, deals, brand equity and monetisation.' },
  { key: 'social',        label: 'Social Resonance',  blurb: 'Reach, engagement and cultural footprint across the verse.' },
  { key: 'personality',   label: 'Personality',       blurb: 'Confidence, composure and perceived dominance.' },
  { key: 'longevity',     label: 'Longevity',         blurb: 'Staying power and consistency across ranking cycles.' }
];

var FRAUDS = [
  {
    id: 'f001', name: 'Adhiparth Mehta Sharma', nickname: 'Adhiparty', handle: '@adhiparty',
    region: 'Mumbai \u00b7 Delhi, IN', age: 26,
    joined: 'Jan 2024', movement: 0, peak: 1, weeks: 41,
    tagline: 'The merger. Two profiles, one entry, and the widest lead the board has ever carried.',
    bio: 'For eleven cycles the summit was a two-man argument decided by a hundredth of a point. In cycle 41 the panel stopped arguing and merged the entries: Adhiparth Mehta Sharma is what Parth Mehta and Adhiraj Sharma amount to when neither has to concede a lane. He takes the room from one half and the face from the other \u2014 a 98 on social resonance beside a 98 on facial aesthetics, which no single profile in the history of the board has held at once. The result grades 96.80, the highest aggregate ever recorded, and leads second place by more than four points.',
    stats: { height: 97, frame: 98, transformation: 96, aesthetics: 98, grooming: 97, drip: 96, business: 96, social: 98, personality: 95, longevity: 97 },
    profile: {
      status: 'Merged entry \u00b7 cycle 41 \u00b7 the only PSL God on the board',
      quote: 'You spend eleven cycles trying to beat someone and it turns out the panel was grading two halves of the same man.',
      signature: 'A jaw shadow that survives overhead light, cold-weather tailoring, and a feed that has never posted twice from the same angle.',
      vitals: [
        ['Height', '6\'2" \u00b7 188cm'],
        ['Weight', '86kg at 8.5% body fat'],
        ['Clavicle', '46cm \u2014 top decile for the board'],
        ['Wingspan', '196cm'],
        ['Cycle debut', 'Cycle 1, entered #14'],
        ['Merged at', 'Cycle 41, from #1 and #2']
      ],
      strengths: ['Facial aesthetics (98)', 'Social resonance (98)', 'Body frame (98)', 'Grooming (97)', 'No lane below 95'],
      watch: ['Personality (95) is now the lowest lane on the profile', 'A merged entry has no rival, and the panel has never graded longevity without one'],
      ventures: [
        { name: 'Fraudulent Labs', note: 'Supplement label. Two SKUs, both audited, both sold out through cycle 40.' },
        { name: 'Adhilice Skin', note: 'Four-product line \u2014 the only member venture with published ingredient lists.' },
        { name: 'Party Athletic', note: 'Two gyms in Mumbai and a training collective in Delhi, both built around frame work.' },
        { name: 'The Party Line', note: 'Media arm. Interviews the panel refuses to publish.' }
      ],
      milestones: [
        { cycle: 1,  note: 'Parth Mehta enters the board at #14 on a frame grade nobody expected from a debut.' },
        { cycle: 4,  note: 'Adhiraj Sharma enters at #29. The panel flags the facial aesthetics grade immediately.' },
        { cycle: 9,  note: 'Parth takes #1 for the first time. Transformation graded 96 \u2014 generational, per the panel.' },
        { cycle: 30, note: 'Adhiraj takes #2 and begins a four-cycle chase from 2.10 points back.' },
        { cycle: 38, note: 'Aesthetics graded 98 \u2014 the highest single grade in the quality\'s history.' },
        { cycle: 41, note: 'The gap reaches 0.01 and the panel merges the entries. Aggregate 96.80.' }
      ],
      protocol: [
        'Frame work three times a week \u2014 side delts and back, never the mirror muscles',
        'Fixed 5:40 wake time, seven days, no exceptions',
        'The four-product skin protocol every night since cycle 4, never skipped, never expanded',
        'One photographed appearance per cycle, on the telephoto lens, never the ultrawide'
      ]
    }
  },
  {
    id: 'f003', name: 'Clav', nickname: 'Prince of BP', handle: '@clav', region: 'London, UK', age: 29,
    joined: 'Jan 2024', movement: -1, peak: 1, weeks: 41,
    tagline: 'Former #1. Slipping on social resonance, immovable everywhere else.',
    bio: 'Held the top position for the first six cycles of the modern era. Clav remains the highest-graded frame in the verse — the 99 is the only one the panel has ever issued for structure — but a quiet quarter across media has cost him ground in the aggregate three cycles running.',
    stats: { height: 95, frame: 99, transformation: 89, aesthetics: 93, grooming: 91, drip: 90, business: 94, social: 85, personality: 96, longevity: 95 },
    profile: {
      status: 'Former #1 · third negative cycle',
      quote: 'They can have the feed. The clavicle is not going anywhere.',
      signature: 'The only 99 the panel has ever issued for structure, and no interest whatsoever in defending it publicly.',
      vitals: [
        ['Height', '6\'2" · 188cm'],
        ['Weight', '92kg at 11% body fat'],
        ['Clavicle', '48cm — the widest on the board'],
        ['Wingspan', '199cm'],
        ['Cycle debut', 'Cycle 1, entered #2'],
        ['Cycles at #1', 'Six, consecutive']
      ],
      strengths: ['Body frame (99)', 'Personality (96)', 'Height (95)', 'Longevity (95)'],
      watch: ['Social resonance (85) is costing him a full point of aggregate', 'Transformation (89) has stalled for four cycles'],
      ventures: [
        { name: 'BP Strength', note: 'Equipment brand. Sells almost nothing and is regarded as excellent.' }
      ],
      milestones: [
        { cycle: 1,  note: 'Enters at #2 with the frame grade that still stands as the record.' },
        { cycle: 3,  note: 'Takes #1 and holds it for six cycles.' },
        { cycle: 9,  note: 'Surrenders the summit to the profile that would become Adhiparth.' },
        { cycle: 41, note: 'Third consecutive negative cycle. All of it on media, none of it structural.' }
      ],
      protocol: [
        'Heavy compound work, low frequency, long rests',
        'No feed maintenance whatsoever, which the panel grades exactly as it sounds',
        'Sleep eight hours or cancel the day'
      ],
      rival: 'f001'
    }
  },
  {
    id: 'f004', name: 'Rocco Delaine', handle: '@roccodelaine', region: 'Milan, IT', age: 26,
    joined: 'Feb 2024', movement: 2, peak: 4, weeks: 36,
    tagline: 'Best-dressed Fraud on the board, four cycles running.',
    bio: 'Rocco converts a modest frame grade into elite placement through presentation. Perfect-ten territory on style, and the panel notes his grooming has not dipped below 95 since he entered.',
    stats: { height: 88, frame: 90, transformation: 92, aesthetics: 96, grooming: 98, drip: 99, business: 89, social: 92, personality: 90, longevity: 88 }
  },
  {
    id: 'f005', name: 'Kaine Rutherford', handle: '@kainerford', region: 'Sydney, AU', age: 31,
    joined: 'Jan 2024', movement: -1, peak: 2, weeks: 41,
    tagline: 'The businessman. Highest commercial grade in the verse.',
    bio: 'Nobody monetises the verse like Kaine. Two exits, a clothing label and the largest ambassador deal in ranking history. Age has begun to shave points off transformation, but longevity keeps him fixed in the top ten.',
    stats: { height: 91, frame: 89, transformation: 84, aesthetics: 88, grooming: 92, drip: 93, business: 99, social: 95, personality: 94, longevity: 96 }
  },
  {
    id: 'f006', name: 'Zephyr Locke', handle: '@zephyrlocke', region: 'Berlin, DE', age: 23,
    joined: 'May 2024', movement: 4, peak: 6, weeks: 29,
    tagline: 'Fastest riser of the current cycle. Up four.',
    bio: 'Entered at #61 and has not posted a negative cycle since. The transformation grade of 99 is the highest ever recorded by the panel and single-handedly carries an otherwise average frame into the top ten.',
    stats: { height: 89, frame: 87, transformation: 99, aesthetics: 92, grooming: 94, drip: 91, business: 82, social: 96, personality: 92, longevity: 79 }
  },
  {
    id: 'f007', name: 'Atlas Moreno', handle: '@atlasmoreno', region: 'Madrid, ES', age: 28,
    joined: 'Feb 2024', movement: 0, peak: 5, weeks: 37,
    tagline: 'Tallest ranked Fraud in the verse.',
    bio: 'Atlas takes the maximum available height grade and pairs it with a frame the panel calls structurally flawless. Personality scoring remains the one lane where reviewers are split.',
    stats: { height: 100, frame: 97, transformation: 86, aesthetics: 89, grooming: 88, drip: 85, business: 87, social: 88, personality: 83, longevity: 90 }
  },
  {
    id: 'f008', name: 'Cassian Vale', handle: '@cassianvale', region: 'Toronto, CA', age: 25,
    joined: 'Apr 2024', movement: -2, peak: 6, weeks: 32,
    tagline: 'Cooling off after three consecutive rises.',
    bio: 'Cassian built his placement on media volume, and the panel penalises volatility. A quiet cycle dropped him two spots, though his aesthetics grade remains a top-five figure.',
    stats: { height: 90, frame: 91, transformation: 90, aesthetics: 95, grooming: 93, drip: 92, business: 84, social: 87, personality: 88, longevity: 84 }
  },
  {
    id: 'f009', name: 'Vaughn Sterling', handle: '@vaughnsterling', region: 'New York, NY', age: 30,
    joined: 'Jan 2024', movement: 1, peak: 7, weeks: 41,
    tagline: 'The most consistent grade on the board.',
    bio: 'Vaughn has moved no more than two positions in any single cycle since the rankings began. Reviewers describe the profile as the definition of a floor: nothing spectacular, nothing that ever slips.',
    stats: { height: 92, frame: 90, transformation: 85, aesthetics: 90, grooming: 91, drip: 89, business: 91, social: 86, personality: 91, longevity: 98 }
  },
  {
    id: 'f010', name: 'Elias Crowne', handle: '@eliascrowne', region: 'Dubai, AE', age: 33,
    joined: 'Feb 2024', movement: 0, peak: 8, weeks: 37,
    tagline: 'Old guard. Still grading elite on composure.',
    bio: 'The senior figure of the top ten. Elias trades transformation upside for an unmatched personality grade, and the community vote has kept him rising-star positive for eight straight cycles.',
    stats: { height: 90, frame: 88, transformation: 80, aesthetics: 87, grooming: 93, drip: 94, business: 95, social: 84, personality: 97, longevity: 93 }
  },
  {
    id: 'f011', name: 'Nikolai Brandt', handle: '@nikbrandt', region: 'Stockholm, SE', age: 26,
    joined: 'Mar 2024', movement: 3, peak: 11, weeks: 35,
    tagline: 'Knocking on the top ten.',
    bio: 'Three positive cycles in a row have put Nikolai within a single point of the elite tier. Panel notes: needs a commercial venture to break through.',
    stats: { height: 94, frame: 92, transformation: 88, aesthetics: 91, grooming: 89, drip: 86, business: 78, social: 85, personality: 87, longevity: 82 }
  },
  {
    id: 'f012', name: 'Theo Marchetti', handle: '@theomarchetti', region: 'Rome, IT', age: 24,
    joined: 'Jun 2024', movement: 5, peak: 12, weeks: 26,
    tagline: 'Biggest single-cycle jump on the board. Up five.',
    bio: 'A late entrant who has compounded every cycle. Theo grades top-fifteen in six of the ten qualities, and the community rising-star vote sits at 91% positive.',
    stats: { height: 87, frame: 89, transformation: 95, aesthetics: 93, grooming: 92, drip: 90, business: 76, social: 91, personality: 86, longevity: 74 }
  },
  {
    id: 'f013', name: 'Damien Roux', handle: '@damienroux', region: 'Paris, FR', age: 28,
    joined: 'Feb 2024', movement: -3, peak: 7, weeks: 37,
    tagline: 'Third straight negative cycle.',
    bio: 'Damien has surrendered six positions since his peak. The panel cites a stalled transformation arc; his aesthetics and grooming grades are unchanged.',
    stats: { height: 89, frame: 86, transformation: 78, aesthetics: 94, grooming: 95, drip: 92, business: 83, social: 82, personality: 85, longevity: 86 }
  },
  {
    id: 'f014', name: 'Hugo Vantablack', handle: '@hugovanta', region: 'Amsterdam, NL', age: 27,
    joined: 'Apr 2024', movement: 0, peak: 13, weeks: 33,
    tagline: 'Immovable at fourteen.',
    bio: 'Four consecutive cycles at the same position, a ranking record. Balanced across the board with no grade above 92 and none below 79.',
    stats: { height: 91, frame: 88, transformation: 86, aesthetics: 88, grooming: 87, drip: 88, business: 85, social: 83, personality: 84, longevity: 87 }
  },
  {
    id: 'f015', name: 'Marcus Thorne', handle: '@marcusthorne', region: 'Chicago, IL', age: 32,
    joined: 'Jan 2024', movement: -1, peak: 9, weeks: 41,
    tagline: 'Veteran. Trading peak grades for durability.',
    bio: 'One of six figures present since the first cycle. Marcus has never fallen out of the top twenty, though the panel has downgraded his transformation lane four times.',
    stats: { height: 93, frame: 91, transformation: 74, aesthetics: 85, grooming: 86, drip: 84, business: 90, social: 80, personality: 92, longevity: 94 }
  },
  {
    id: 'f016', name: 'Ronan Blackwood', handle: '@ronanblackwood', region: 'Dublin, IE', age: 25,
    joined: 'Jul 2024', movement: 6, peak: 16, weeks: 22,
    tagline: 'Entered at fifty-two. Now sixteen.',
    bio: 'The steepest entry curve in ranking history after Zephyr Locke. Community sentiment is overwhelmingly positive; the panel remains cautious on longevity.',
    stats: { height: 92, frame: 93, transformation: 94, aesthetics: 87, grooming: 84, drip: 82, business: 72, social: 88, personality: 85, longevity: 68 }
  },
  {
    id: 'f017', name: 'Jules Carrow', handle: '@julescarrow', region: 'Austin, TX', age: 29,
    joined: 'Mar 2024', movement: 1, peak: 15, weeks: 35,
    tagline: 'Commercially strong, structurally average.',
    bio: 'Jules holds a top-ten business grade attached to a mid-tier physical profile. The aggregate keeps him stable in the high teens cycle after cycle.',
    stats: { height: 86, frame: 84, transformation: 87, aesthetics: 84, grooming: 89, drip: 91, business: 93, social: 89, personality: 88, longevity: 85 }
  },
  {
    id: 'f018', name: 'Emeric Sloan', handle: '@emericsloan', region: 'Copenhagen, DK', age: 26,
    joined: 'May 2024', movement: -2, peak: 14, weeks: 30,
    tagline: 'Overrated vote climbing for a second cycle.',
    bio: 'The community has flagged Emeric overrated in back-to-back cycles, and the panel has responded with a two-position adjustment. His grooming grade is unaffected and remains elite.',
    stats: { height: 88, frame: 87, transformation: 83, aesthetics: 90, grooming: 96, drip: 89, business: 79, social: 86, personality: 80, longevity: 81 }
  },
  {
    id: 'f019', name: 'Silas Vandergraaf', handle: '@silasvdg', region: 'Cape Town, ZA', age: 30,
    joined: 'Feb 2024', movement: 0, peak: 17, weeks: 37,
    tagline: 'Frame carries the entire profile.',
    bio: 'A 95 frame grade props up a profile that grades below 82 in five separate qualities. Reviewers describe Silas as the clearest single-lane Fraud in the top twenty.',
    stats: { height: 94, frame: 95, transformation: 81, aesthetics: 82, grooming: 78, drip: 76, business: 81, social: 79, personality: 86, longevity: 88 }
  },
  {
    id: 'f020', name: 'Corbin Wrayne', handle: '@corbinwrayne', region: 'Vancouver, CA', age: 23,
    joined: 'Aug 2024', movement: 4, peak: 20, weeks: 18,
    tagline: 'Newest entrant inside the top twenty.',
    bio: 'Eighteen cycles on the board and already ahead of figures who have been ranked since the first day. Panel notes exceptional social resonance for a profile this young.',
    stats: { height: 90, frame: 88, transformation: 92, aesthetics: 89, grooming: 85, drip: 87, business: 70, social: 93, personality: 82, longevity: 64 }
  },
  {
    id: 'f021', name: 'Lorenzo Bianchi', handle: '@lorenzobianchi', region: 'Naples, IT', age: 27,
    joined: 'Apr 2024', movement: -1, peak: 18, weeks: 33,
    tagline: 'Holding the line.',
    bio: 'Lorenzo has hovered between eighteen and twenty-three for six months. The panel considers the profile fully mature with limited remaining upside.',
    stats: { height: 87, frame: 86, transformation: 82, aesthetics: 91, grooming: 90, drip: 90, business: 77, social: 81, personality: 83, longevity: 83 }
  },
  {
    id: 'f022', name: 'Aurelio Diaz', handle: '@aureliodiaz', region: 'Mexico City, MX', age: 24,
    joined: 'Jun 2024', movement: 2, peak: 22, weeks: 26,
    tagline: 'Quietly compounding.',
    bio: 'No single elite grade, but Aurelio has improved in at least three qualities in every cycle since entry. The panel calls this the healthiest curve outside the top ten.',
    stats: { height: 85, frame: 87, transformation: 90, aesthetics: 88, grooming: 86, drip: 85, business: 74, social: 84, personality: 87, longevity: 72 }
  },
  {
    id: 'f023', name: 'Konstantin Reyes', handle: '@konreyes', region: 'Lisbon, PT', age: 31,
    joined: 'Mar 2024', movement: -4, peak: 12, weeks: 35,
    tagline: 'Steepest fall of the current cycle. Down four.',
    bio: 'A public dispute in the verse triggered the largest single-cycle conduct adjustment the panel has issued. Physical grades unchanged; personality and social resonance both downgraded.',
    stats: { height: 91, frame: 90, transformation: 84, aesthetics: 86, grooming: 83, drip: 81, business: 80, social: 71, personality: 70, longevity: 84 }
  },
  {
    id: 'f024', name: 'Bastian Kohl', handle: '@bastiankohl', region: 'Zurich, CH', age: 28,
    joined: 'May 2024', movement: 0, peak: 24, weeks: 30,
    tagline: 'Anchoring the ranked field.',
    bio: 'Bastian closes out the ranked twenty-four. Solid grades throughout with a notable weakness in social resonance that the panel says is the only thing keeping him outside the top twenty.',
    stats: { height: 89, frame: 85, transformation: 86, aesthetics: 85, grooming: 88, drip: 86, business: 82, social: 68, personality: 84, longevity: 80 }
  }
];

/* ---------- membership plans ---------- */
var PLANS = [
  {
    id: 'spectator', name: 'Spectator', price: 0, level: 0,
    blurb: 'The public board, free forever.',
    perks: [
      'Full public board every cycle',
      'Rising star and overrated voting',
      'Quality breakdown on every profile',
      'Watchlist of up to five Frauds'
    ]
  },
  {
    id: 'verified', name: 'Verified', price: 9, level: 1, featured: true,
    blurb: 'For the members who move the board.',
    perks: [
      'Everything in Spectator',
      'Nominate a Fraud for review each cycle',
      'Grade history and cycle-by-cycle movement',
      'Panel notes released 24 hours early',
      'Unlimited watchlist'
    ]
  },
  {
    id: 'panel', name: 'Panel Access', price: 29, level: 2,
    blurb: 'The numbers behind every grade.',
    perks: [
      'Everything in Verified',
      'Raw per-quality scoring sheets',
      'Priority submissions and grade appeals',
      'Head-to-head comparison exports',
      'Direct line to the ranking panel'
    ]
  }
];

/* ---------- cycle reports ---------- */
var NEWS = [
  {
    id: 'c41', cycle: 41, date: '24 August 2026', tag: 'Cycle report',
    title: 'The panel merges its top two and the board loses its closest race',
    lede: 'Cycle 41 will be remembered for one ruling: after eleven cycles and a margin that had narrowed to a hundredth of a point, the panel merged first and second into a single entry.',
    body: [
      'The headline of the cycle is Zephyr Locke, who converts the highest transformation grade ever recorded by the panel into a top-ten placement twenty-nine cycles after entering at #61. Nothing about the underlying profile is remarkable — the frame grades below several figures ranked beneath him — but the panel has now upgraded his transformation lane in seven consecutive cycles, and at 10% of the aggregate that compounds.',
      'At the other end, Konstantin Reyes gives back four positions after the largest conduct adjustment the panel has issued. His physical grades are untouched; personality and social resonance both fell, and two lanes moving together is worth more than any single lane can absorb.',
      'The summit is now one name. Parth Mehta held 95.80, Adhiraj Sharma 95.79, and after four cycles of a chase that had already forced the panel to grade a lane to a decimal, the ruling was that the board was measuring two halves of the same profile. Adhiparth Mehta Sharma enters at 96.80 — the highest aggregate ever recorded — and leads Clav by 4.10 points, the widest margin the board has carried since cycle 3.',
      'What the merge produces is a profile with no counterpart in the archive: 98 on social resonance beside 98 on facial aesthetics, and nothing below 95. It is also the first PSL God the board has published, at 9.0.',
      'Elsewhere: Theo Marchetti and Ronan Blackwood both posted their fourth straight positive cycle, Emeric Sloan drew a second consecutive overrated flag from the community, and Hugo Vantablack set a ranking record by holding the same position for a fourth cycle running.'
    ]
  },
  {
    id: 'c40', cycle: 40, date: '22 August 2026', tag: 'Cycle report',
    title: 'The board tightens: eight Frauds separated by under two points',
    lede: 'Compression through the middle of the board has made the Ascending tier the most contested it has ever been, with eight ranked figures inside a two-point band.',
    body: [
      'From #9 through #16 the aggregate spread is 1.9 points. In practical terms every one of those eight Frauds is a single quality upgrade away from moving three or four positions, and the panel expects the next two cycles to look violent as a result.',
      'Compression is a function of the even weighting. When no quality can be leaned on for more than 10%, profiles converge toward the middle unless a figure grades exceptionally in several lanes at once — which is precisely what separates the top five from everyone else.'
    ]
  },
  {
    id: 'c39', cycle: 39, date: '20 August 2026', tag: 'Methodology',
    title: 'Why longevity is worth exactly as much as height',
    lede: 'The single most common appeal the panel receives argues that the ten qualities should not be weighted evenly. Here is why they are, and why that is not changing.',
    body: [
      'Every cycle the desk receives appeals from members arguing that business acumen should outweigh height, or that transformation should count double for figures early in an arc. The even split is the entire basis of the ranking. Once one quality is worth more than another, the board stops measuring the Fraud and starts measuring the panel.',
      'The even weighting also has a practical effect: it makes a single elite lane insufficient. Silas Vandergraaf holds a 95 frame grade and sits outside the top fifteen, because five of his other lanes grade below 82. A ranking that weighted frame heavily would have him in the top five and would tell you very little.'
    ]
  },
  {
    id: 'c38', cycle: 38, date: '18 August 2026', tag: 'Board note',
    title: 'Submissions reopen: what the panel needs from a nomination',
    lede: 'Nominations are open to Verified members again after a two-cycle pause. The panel has published what a submission needs to contain to be reviewed.',
    body: [
      'A nomination is reviewed only when it names a standout quality and cites evidence from within the last two cycles. Submissions that consist of a name and a handle are logged but not graded.',
      'Nothing enters the board on a single showing. The panel requires two full cycles of evidence before a nominated figure is graded across all ten qualities, which means the fastest a nomination can appear on the board is cycle 43.'
    ]
  },
  {
    id: 'c37', cycle: 37, date: '16 August 2026', tag: 'Cycle report',
    title: 'The Mythic tier takes a second name as the chase closes to a hundredth',
    lede: 'After nine cycles as a population of one, the Mythic tier admits a second figure — and the two are separated by less than the panel usually bothers to measure.',
    body: [
      'Parth Mehta holds 95.80. Adhiraj Sharma crosses the 95.0 Mythic threshold at 95.79 after upgrades in six lanes, ending the longest run of solo occupancy the tier has had. Four cycles later the panel would rule that it had been grading one profile in two halves.',
      'The panel notes that the Mythic threshold has never been adjusted and will not be. A tier that admits three or four figures per cycle stops describing anything — two, separated by a hundredth, describes a great deal.'
    ]
  },
  {
    id: 'c36', cycle: 36, date: '14 August 2026', tag: 'Community',
    title: 'Community sentiment now moves grades in two lanes, not one',
    lede: 'Sustained rising-star and overrated voting will now trigger a panel review of personality and social resonance together rather than in isolation.',
    body: [
      'Sentiment has always fed into the board, but until this cycle a sustained overrated flag triggered a review of a single lane. From cycle 36 the review covers personality and social resonance jointly, on the basis that community perception rarely moves one without the other.',
      'This does not mean votes set grades. The panel grades; sustained sentiment decides what gets re-examined.'
    ]
  }
];


/* ---------- looksmaxxing desk ---------- *
 * A separate vertical from the cycle reports: protocol, evidence and gear,
 * nothing about the board itself.
 */
var LOOKSMAX_CATEGORIES = [
  { key: 'jaw',      label: 'Jaw & Mewing' },
  { key: 'skin',     label: 'Skin' },
  { key: 'hair',     label: 'Hair' },
  { key: 'frame',    label: 'Frame & Training' },
  { key: 'sleep',    label: 'Sleep & Recovery' },
  { key: 'diet',     label: 'Diet' },
  { key: 'style',    label: 'Style & Grooming' },
  { key: 'posture',  label: 'Posture' },
  { key: 'angles',   label: 'Angles & Photos' }
];

var LOOKSMAX = [
  {
    id: 'lm01', category: 'jaw', date: '24 August 2026', readMinutes: 6,
    tags: ['mewing', 'jawline', 'evidence'],
    title: 'Mewing, honestly: what tongue posture does and does not do',
    lede: 'The most argued-about protocol in the verse, separated into the part with a plausible mechanism and the part that is wishful thinking.',
    body: [
      'Resting tongue posture — the whole tongue flat against the palate, teeth lightly together, lips sealed, breathing through the nose — is cheap, safe and worth doing. What it plausibly changes in an adult is swelling, water retention and the way you carry your head, which is why the "results" that appear within a week are real but are not bone.',
      'What it does not do in an adult is move the maxilla. Growth plates in the midface have fused; a tongue is not going to remodel them, and the before-and-afters that claim otherwise are almost always a change in body fat, lighting and camera height, in that order.',
      'The honest version of the protocol: nasal breathing all day, tongue up whenever you are not eating or speaking, and a hard stop on mouth breathing at night — tape is popular but see a doctor first if you snore, because the thing you are taping over may be sleep apnoea.'
    ],
    protocol: [
      'Tongue flat on the palate, not just the tip',
      'Nasal breathing, all day, including on the treadmill',
      'Teeth touching lightly, never clenched',
      'Fix the airway before chasing the aesthetics'
    ],
    verdict: 'Worth doing. Not a jaw transplant.'
  },
  {
    id: 'lm02', category: 'skin', date: '23 August 2026', readMinutes: 5,
    tags: ['skin', 'routine', 'sunscreen'],
    title: 'The four-product skin routine that beats the eleven-product one',
    lede: 'Most of the returns in skin come from four things, and the eleven-step routine is mostly a tax on your patience.',
    body: [
      'Cleanser at night, moisturiser twice a day, a retinoid three nights a week, and sunscreen every single morning. That is the whole evidence-backed core. Everything after it is a rounding error you are paying a subscription for.',
      'Sunscreen is the one nobody wants to hear about because it is boring and works on a ten-year horizon. It is also the single largest lever on how your face ages, which makes it the highest-return item in the verse per unit of effort.',
      'Retinoids are the second lever and the one people quit fastest, because weeks two through six look worse than week zero. Start at the lowest strength, twice a week, buffer with moisturiser, and do not stack acids on top while your barrier is learning.'
    ],
    protocol: [
      'AM: cleanse (water is fine), moisturise, SPF 30+',
      'PM: cleanse, retinoid 3× a week, moisturise',
      'Add nothing new for six weeks so you know what is working',
      'Reapply sunscreen if you are outside past midday'
    ],
    verdict: 'Four products. Six weeks. No exceptions on the sunscreen.'
  },
  {
    id: 'lm03', category: 'hair', date: '22 August 2026', readMinutes: 7,
    tags: ['hair', 'maintenance', 'evidence'],
    title: 'Hair: act early or accept it, but stop doing neither',
    lede: 'The worst outcome in the verse is three years of denial followed by an intervention that would have worked three years ago.',
    body: [
      'Hair loss is progressive, and every intervention with evidence behind it is better at keeping what you have than at bringing back what you lost. That makes the timing of the decision more important than the choice itself.',
      'The two options with real evidence are well documented and both are medical decisions with side-effect profiles — which means the conversation belongs with a doctor, not a forum. Anyone selling you certainty in a comment section is selling you something else.',
      'The third option is the one the verse under-rates: cut it short, own the hairline, and put the effort into frame, skin and style, all of which respond faster than a follicle ever will.'
    ],
    protocol: [
      'Take a photo under the same light every three months',
      'Decide early — the question is timing, not vanity',
      'Talk to a dermatologist before anything systemic',
      'A short, sharp cut beats a defended hairline'
    ],
    verdict: 'The decision is the intervention. Make it.'
  },
  {
    id: 'lm04', category: 'frame', date: '21 August 2026', readMinutes: 8,
    tags: ['training', 'frame', 'shoulders'],
    title: 'Frame is the highest-leverage grade you can actually move',
    lede: 'Height is fixed and bone structure is fixed. Shoulder width, in the way anyone perceives it, is not.',
    body: [
      'Clavicle length is genetic. Everything hanging off it is not: side delts, upper back and the taper they create are the difference between a 79 frame grade and an 89, and they respond to two focused sessions a week.',
      'The mistake is training the mirror — chest and arms — when the perceived frame is built on lateral raises, rows, and enough back thickness that a t-shirt has something to sit on. Volume beats intensity here; delts recover fast and want frequency.',
      'The second mistake is skipping the body-fat conversation. A taper is a ratio, and the denominator is the waist. Nothing widens shoulders as fast as losing four kilos does.'
    ],
    protocol: [
      'Side delts 3× a week, 12–20 reps, stop shy of failure',
      'Rows and pull-downs for the width behind the taper',
      'Keep the waist honest — the ratio is the point',
      'Give it twelve weeks before you judge the change'
    ],
    verdict: 'The most movable grade on the board.'
  },
  {
    id: 'lm05', category: 'sleep', date: '20 August 2026', readMinutes: 5,
    tags: ['sleep', 'recovery', 'face'],
    title: 'Sleep is a facial protocol, not a lifestyle preference',
    lede: 'Nothing in the verse degrades a face faster than four consecutive bad nights, and nothing repairs it more cheaply.',
    body: [
      'Under-eye colour, midface puffiness and the slack look that people misdiagnose as fat are all downstream of sleep debt and the fluid handling that comes with it. Fix the nights and half of the morning complaints resolve on their own.',
      'The lever that matters most is consistency of wake time, not total hours. A fixed alarm seven days a week does more for how you look on a Tuesday than an extra hour on Sunday ever will.',
      'Side sleeping compresses one side of the face for six hours a night; if you wake up asymmetric and it settles by noon, that is the mechanism. Back sleeping fixes it if you can tolerate it.'
    ],
    protocol: [
      'Fixed wake time, every day, weekends included',
      'Last caffeine eight hours before bed',
      'Cool, dark room — the boring advice is the working advice',
      'Sleep on your back if you can stand it'
    ],
    verdict: 'The cheapest grade increase available.'
  },
  {
    id: 'lm06', category: 'diet', date: '19 August 2026', readMinutes: 6,
    tags: ['diet', 'water', 'bloat'],
    title: 'Sodium, water and the puffiness you can fix by Thursday',
    lede: 'Most "bad face days" are a fluid story, and the fluid story is controllable within seventy-two hours.',
    body: [
      'Salt load, alcohol and short sleep all pull the same lever, and the result shows up first in the eyelids and the jaw shadow. That is why the same face looks sharp on Wednesday and soft on Sunday with no change in body fat whatsoever.',
      'The correction is not a cleanse or a supplement. It is three days of consistent water, unremarkable sodium, no alcohol, and eight hours a night, after which the face you thought you lost comes back.',
      'The longer play is body-fat percentage, which sets the ceiling for definition — but nobody should be dieting to fix what is actually last night.'
    ],
    protocol: [
      'Two to three litres of water daily, spread out',
      'Keep sodium boring for 72 hours before anything photographed',
      'Alcohol is the single biggest facial variable in the verse',
      'Judge your face at the same hour, not at midnight'
    ],
    verdict: 'Fix the week before you diagnose the face.'
  },
  {
    id: 'lm07', category: 'style', date: '18 August 2026', readMinutes: 6,
    tags: ['style', 'fit', 'grooming'],
    title: 'Fit beats brand: the tailoring rules the panel grades on',
    lede: 'Style is 10% of the aggregate and the cheapest ten points on the board, because tailoring costs less than the shirt did.',
    body: [
      'The shoulder seam sits on the shoulder bone. That single rule outranks every logo decision anyone will make this year, and it is the first thing the panel looks at when grading drip.',
      'The second rule is contrast: the eye reads a defined edge between top and bottom as structure. Monochrome hides the taper you spent twelve weeks building.',
      'The third is maintenance. A grooming grade above 90 is mostly a haircut every three weeks instead of every six, and nails, brows and collar edges that nobody consciously notices until they are wrong.'
    ],
    protocol: [
      'Tailor the shoulders, hem the sleeves, keep the rest',
      'Three colours maximum, one of them structural',
      'Haircut every three weeks, not when it annoys you',
      'Shoes and collar carry more grade than the label does'
    ],
    verdict: 'Ten points, one tailor, ninety minutes.'
  },
  {
    id: 'lm08', category: 'posture', date: '17 August 2026', readMinutes: 5,
    tags: ['posture', 'neck', 'desk'],
    title: 'Forward head posture is costing you a grade you already own',
    lede: 'The most common structural complaint in the verse is not structural at all — it is a desk.',
    body: [
      'Forward head posture flattens the jaw shadow, shortens the neck and softens the profile, and it is almost entirely a load problem: the head sits ahead of the spine for nine hours, and the muscles that hold it back give up.',
      'The fix is unglamorous and effective — chin tucks, upper back work, a monitor at eye height, and a standing break every hour. Three weeks in, the profile photo changes without a single thing about your bones changing.',
      'The tell is a photo from the side, taken by somebody else, standing normally. Nobody sees their own posture accurately in a mirror because looking in a mirror corrects it.'
    ],
    protocol: [
      'Chin tucks, 3 sets of 10, daily',
      'Monitor top at eye height — books work fine',
      'Rows and face pulls twice a week',
      'Have someone photograph your profile monthly'
    ],
    verdict: 'A desk problem wearing a bone-structure costume.'
  },
  {
    id: 'lm09', category: 'angles', date: '16 August 2026', readMinutes: 7,
    tags: ['photos', 'angles', 'evidence'],
    title: 'Camera height, focal length, and why your mirror lies',
    lede: 'Half the transformations in the verse are a lens change. Learn the variables so you can tell progress from photography.',
    body: [
      'A phone held above eye level with a wide lens at arm\'s length enlarges whatever is closest — usually the nose and forehead — and shrinks the jaw. The same face at chest height, two metres back, on the telephoto lens, reads as an entirely different bone structure.',
      'This is why progress photos need fixed variables: same lens, same distance, same height, same light, same time of day, neutral expression. Change one and the comparison is worthless.',
      'It is also why the verse should be sceptical of any before-and-after where the "before" is a low-light selfie and the "after" is a shot somebody else took outdoors at golden hour.'
    ],
    protocol: [
      'Camera at chest height, two metres back',
      'Use the 2× or 3× lens, never the ultrawide',
      'Same window, same hour, neutral face',
      'Take the photo weekly, judge it monthly'
    ],
    verdict: 'Standardise the camera before you judge the face.'
  },
  {
    id: 'lm10', category: 'skin', date: '15 August 2026', readMinutes: 4,
    tags: ['skin', 'shaving', 'irritation'],
    title: 'Stop wrecking your face every morning: the shaving audit',
    lede: 'Redness, bumps and the perpetual irritation half the verse treats as skin type are usually a blade problem.',
    body: [
      'A dull blade drags rather than cuts, which is what causes the irritation people then treat with harsher products, which irritates further. Changing the blade every five to seven shaves ends the cycle faster than any serum.',
      'Shave after a warm shower, with the grain first, and stop chasing the last visible shadow — the second and third passes against the grain are where ingrowns come from.',
      'Then leave it alone. No alcohol-heavy aftershave on a face you just abraded; moisturiser and sunscreen, same as any other morning.'
    ],
    protocol: [
      'New blade every 5–7 shaves',
      'Warm water first, with the grain, one pass',
      'Skip the alcohol aftershave',
      'Moisturise while the face is still damp'
    ],
    verdict: 'Not your skin type. Your blade.'
  }
];

/* ---------- daily routine tracker ---------- */
var HABITS = [
  { key: 'mew',    label: 'Tongue posture all day', hint: 'Nasal breathing, tongue on the palate.' },
  { key: 'skin',   label: 'Skin routine',           hint: 'Cleanse, moisturise, SPF in the morning.' },
  { key: 'train',  label: 'Training session',       hint: 'Frame work counts double this cycle.' },
  { key: 'water',  label: '2L water',               hint: 'Spread out, not all at 11pm.' },
  { key: 'sleep',  label: '7+ hours, fixed wake',   hint: 'Consistency beats total hours.' },
  { key: 'posture',label: 'Posture set',            hint: 'Chin tucks and a monitor at eye height.' },
  { key: 'sun',    label: 'Sunscreen reapplied',    hint: 'Only counts if you were outside past midday.' }
];
