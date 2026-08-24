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
    id: 'f001', name: 'Baron Vexley', handle: '@baronvexley', region: 'Miami, FL', age: 27,
    joined: 'Jan 2024', movement: 0, peak: 1, weeks: 41,
    tagline: 'Undisputed. Has not surrendered the top slot in eleven consecutive cycles.',
    bio: 'The measuring stick of the Fraud Verse. Baron entered the rankings at #14 and climbed to the summit in under four months, largely on the back of a transformation arc the panel graded as generational. Runs a supplement label, two gyms and a media arm.',
    stats: { height: 97, frame: 98, transformation: 96, aesthetics: 95, grooming: 94, drip: 92, business: 96, social: 98, personality: 95, longevity: 97 }
  },
  {
    id: 'f002', name: 'Sylas Kane', handle: '@sylaskane', region: 'Los Angeles, CA', age: 24,
    joined: 'Mar 2024', movement: 1, peak: 2, weeks: 38,
    tagline: 'The most complete profile below the throne.',
    bio: 'A rare Fraud with no scoring weakness. Sylas grades above 88 in all ten qualities, which no other ranked figure currently manages. The panel has repeatedly flagged business acumen as the only lane separating him from #1.',
    stats: { height: 93, frame: 96, transformation: 94, aesthetics: 97, grooming: 96, drip: 95, business: 88, social: 94, personality: 93, longevity: 91 }
  },
  {
    id: 'f003', name: 'Dominic Ash', handle: '@domash', region: 'London, UK', age: 29,
    joined: 'Jan 2024', movement: -1, peak: 1, weeks: 41,
    tagline: 'Former #1. Slipping on social resonance, immovable everywhere else.',
    bio: 'Held the top position for the first six cycles of the modern era. Dominic remains the highest-graded frame in the verse, but a quiet quarter across media has cost him ground in the aggregate three cycles running.',
    stats: { height: 95, frame: 99, transformation: 89, aesthetics: 93, grooming: 91, drip: 90, business: 94, social: 85, personality: 96, longevity: 95 }
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
    title: 'Locke breaks the top ten as Reyes posts the steepest fall on record',
    lede: 'Cycle 41 delivered the widest spread of movement the board has seen since the format was fixed: four positions up for Zephyr Locke, four down for Konstantin Reyes, and a top three that refused to move at all.',
    body: [
      'The headline of the cycle is Zephyr Locke, who converts the highest transformation grade ever recorded by the panel into a top-ten placement twenty-nine cycles after entering at #61. Nothing about the underlying profile is remarkable — the frame grades below several figures ranked beneath him — but the panel has now upgraded his transformation lane in seven consecutive cycles, and at 10% of the aggregate that compounds.',
      'At the other end, Konstantin Reyes gives back four positions after the largest conduct adjustment the panel has issued. His physical grades are untouched; personality and social resonance both fell, and two lanes moving together is worth more than any single lane can absorb.',
      'The top three held. Baron Vexley extends his run at the summit to eleven cycles, Sylas Kane keeps second on the strength of the most complete profile on the board, and Dominic Ash concedes nothing structurally while continuing to leak ground on media.',
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
    title: 'Vexley extends to nine as the Mythic tier stays a population of one',
    lede: 'For the ninth consecutive cycle the Mythic tier contains exactly one name, and the gap between first and second has widened again.',
    body: [
      'Baron Vexley moves to 95.8 and remains the only figure above the 95.0 Mythic threshold. Sylas Kane sits 2.1 points back with the most balanced profile on the board and no obvious route to closing the gap other than a commercial venture.',
      'The panel notes that the Mythic threshold has never been adjusted and will not be. A tier that admits three or four figures per cycle stops describing anything.'
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
