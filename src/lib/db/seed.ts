import { db } from "./index";
import {
  batches,
  users,
  councils,
  goals,
  weeklyMilestones,
  buddies,
  declarations,
  attendance,
} from "./schema";
import { hashPassword } from "../auth/password";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

// ─── Real LEAP 99 Student Data ──────────────────────────────────────────────

interface StudentGoalData {
  goalStatement: string;
  values: string; // comma-separated
}

interface StudentData {
  declaration: string;
  enrollment: StudentGoalData;
  personal: StudentGoalData;
  professional: StudentGoalData;
}

// HC Louie and Coach Kalod goal data (from Excel v3.1)
const coachGoalData: Record<string, StudentData> = {
  Louie: {
    declaration: "I Am Unstoppable Love.",
    enrollment: {
      goalStatement:
        "As I lead with Unstoppable Love, I will experience myself as a COMMITTED, VULNERABLE, and LOVING Head Coach by enrolling 2 FLEX, 2 ALC, and 4 LEAP participants\u2014through courageous conversations, honest sharing, and disciplined follow-through\u2014on or before April 24, 2026.",
      values: "Committed, Vulnerable, Loving",
    },
    personal: {
      goalStatement:
        "As I leave a loving legacy to my wife, I will experience myself as a STEADY, CONNECTED, and FAITHFUL husband by living a 10-week practice of Unstoppable Love\u2014consistently showing up with integrity, compassion, and wholehearted presence through this season, whatever it takes, wherever my work may take me\u2014culminating in a private Steady Love Commitment Moment completed on or before April 24, 2026.",
      values: "Steady, Connected, Faithful",
    },
    professional: {
      goalStatement:
        "As I prepare for retirement in 2031, I will activate my Laguna farm through a focused 10-week plan\u2014bringing idle land back to life to create steady income, peace, and a place to come home to\u2014so that my retirement is grounded in RESPONSIBILITY, sustained by COMMITMENT, and lived in SIMPLICITY, culminating in a Farm Steady, Connected, Checkpoint on or before April 24, 2026.",
      values: "Responsibility, Commitment, Simplicity",
    },
  },
  Kalod: {
    declaration: "My Courage Empowers",
    enrollment: {
      goalStatement:
        "I am a Committed, Trusting, and Loving man as I enroll 2 people in FLEX, 2 people in ALC, and 4 people in LEAP on or before April 24, 2026.",
      values: "Committed, Trusting, Loving",
    },
    personal: {
      goalStatement:
        "I am a Committed, Loving and Responsible Man as I prepare for a healthy and vibrant old age by creating sustainable well-being habits through improved nutrition, quality sleep, and progressive fitness culminating in a 100km accumulated bike ride and presenting weight below 70kg with improved blood chemistry results on or before April 24, 2026.",
      values: "Committed, Loving, Responsible",
    },
    professional: {
      goalStatement:
        "I am a Responsible, Committed and Creative Man as I prepare for a financially rewarding future with AI by creating inspiring and engaging MetE143 Materials Science course content and presenting complete course materials for Semester Weeks 3-14 on or before April 24, 2026.",
      values: "Responsible, Committed, Creative",
    },
  },
};

const studentData: Record<string, StudentData> = {
  Elaine: {
    declaration: "My Love is My Power",
    enrollment: {
      goalStatement:
        "I am a committed, trusting, and loving woman as I enroll 2 people in FLEX, 2 people in ALC, and 4 people in LEAP on or before April 24, 2026.",
      values: "Commitment, Trust, Love",
    },
    personal: {
      goalStatement:
        "I am a responsible woman, joyfully building 30 habit-forming health activities as an expression of self-love and a commitment to a new lifestyle, culminating in a photoshoot by April 24, 2026.",
      values: "Responsibility, Joy, Self-Love",
    },
    professional: {
      goalStatement:
        "I am a committed woman, passionately cooking 48 bottles of Adobong Tuyot from abundance, culminating in its relaunch by April 24, 2026.",
      values: "Abundance, Passion, Commitment",
    },
  },
  Nini: {
    declaration: "My Courageous and Powerful Love Inspires Greatness",
    enrollment: {
      goalStatement:
        "As a loving, worthy, and caring woman, I will enroll two (2) FLEX, two (2) ALC, and four (4) LEAP students by April 24, 2026; empowering others and embracing growth.",
      values: "Vulnerability, Trust, Care",
    },
    personal: {
      goalStatement:
        "As a trusting and present mom, I will intentionally create at least ten (10) meaningful conversations and shared activities with my son, Johann, allowing him to co-create and plan our culminating activity, which we will complete on or before April 17, 2026.",
      values: "Courage, Power, Trust",
    },
    professional: {
      goalStatement:
        "Out of love and respect for persons with disabilities, I intentionally commit to learning sign language so I can meaningfully communicate with my Deaf counterparts. This is part of my preparation for coaching in Deaf LEAP 4 in 2027. With intention and accountability, I will review available training schedules and enroll in at least ten (10) hours of sign language sessions, culminating in a video presentation where I interpret a song using sign language on or before April 17.",
      values: "Love, Care, Commitment",
    },
  },
  Iya: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "I inspire others with my life story and with gratitude, love and trust, I enroll at least two (2) persons in FLEX, two (2) persons in ALC and four (4) persons in LEAP on or before doors open of Leap 99 Unstoppable Love.",
      values: "Abundance, Love, Commitment",
    },
    personal: {
      goalStatement:
        "I am a loving and joyful mother, inspiring my children to be the best version of themselves by teaching them that choosing to be healthy is a way of honoring ourselves and those we love. With gratitude, joy, and love, I will engage in at least eight (8) joyful activities with my children and build at least eight (8) sustainable habits that promote physical well-being and mental and emotional health, culminating in joining a three-kilometer (3K) run on or before the doors open of LEAP 99: Unstoppable Love.",
      values: "Love, Joy, Gratitude",
    },
    professional: {
      goalStatement:
        "I live a life of purpose by helping people transform -- not just as a lawyer, but as an executive and relationship coach. With courage, commitment, and trust, I will complete at least sixty (60) hours of study and training and courageously launch myself as a corporate performance and leadership coach on social media on or before doors open of LEAP 99 Unstoppable Love.",
      values: "Courage, Commitment, Trust",
    },
  },
  Danji: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "I empower others with my marvelous and joyful love as I enroll two (2) persons in FLEX, two (2) persons in ALC, and four (4) persons in LEAP, before doors open of LEAP 99 Unstoppable Love.",
      values: "Courage, Gratitude, Trust",
    },
    personal: {
      goalStatement:
        "To be worthy of hearing my joyful self, I will launch one (1) season or twelve (12) episodes of toy collecting and pop culture podcast. I joyfully upload with passion, worthiness, and courage culminating in a Facebook Live Podcast on or before April 24, 2026.",
      values: "Passion, Joy, Worthiness",
    },
    professional: {
      goalStatement:
        "As I joyfully celebrate my greatness and with my love and passion for events management, I courageously submit a full event masterplan proposal for the 2026 PH Toy Convention and the PH Funko Association Participation in the San Diego Comic Convention 2026 on or before April 24, 2026.",
      values: "Courage, Love, Passion",
    },
  },
  Royce: {
    declaration: "I choose to live with joy and gratitude",
    enrollment: {
      goalStatement:
        "I lovingly and joyfully enroll at least 2 FLEX, 2 ALC and 4 LEAP students within the period of the LEAP 99 coaching.",
      values: "Joy, Gratitude, Love",
    },
    personal: {
      goalStatement:
        "As I heal and reconnect with my inner kid, I lovingly and joyfully reflect to come up with at least 8 childhood events or activities I can relive now culminating with a joyful celebration event of my worthiness on or before April 24, 2026.",
      values: "Joy, Worthiness, Gratitude",
    },
    professional: {
      goalStatement:
        "As I express my passion and be an exemplary psychologist-life coach, I do the necessary steps in creating a tool prototype for coaching with an instrument development plan for review and validation by 3 peers in the psychology and/or life coaching profession on or before April 24, 2026.",
      values: "Responsibility, Abundance, Joy, Passion",
    },
  },
  Gek: {
    declaration: "I INSPIRE GREATNESS",
    enrollment: {
      goalStatement:
        "With openness, abundance, and commitment, I empower and inspire greatness as I enroll two (2) persons in FLEX, two (2) persons in ALC, and four (4) persons in LEAP, before doors open of LEAP 99 Unstoppable Love.",
      values: "Openness, Abundance, Commitment",
    },
    personal: {
      goalStatement:
        "In preparation to launch my dream photography business, Essence Frames, to help people preserve their most memorable moments by the 4th quarter of 2026, I am a passionate, committed, and powerful man, as I curate 10 meaningful photos culminating to a photography exhibit on or before the 20th of April 2026.",
      values: "Commitment, Joy, Passion",
    },
    professional: {
      goalStatement:
        "In preparation to becoming a world-class expert who manages, safeguards, and strategizes people's intellectual property, I am a committed, responsible, and passionate man as I do 10 skills building and/or skills strengthening activities culminating to a professional portfolio on or before the 20th of April 2026.",
      values: "Commitment, Responsibility, Passion",
    },
  },
  Angie: {
    declaration: "I GRATEFULLY BASK IN GOD'S LOVE",
    enrollment: {
      goalStatement:
        "As a open, loving, and vulnerable woman, as I excitedly share with my friends, relatives, co-workers and potential students what I experienced from my Trilogy journey, and enroll at least 2 for FLEX, at least 2 for ALC, and at least 4 for LEAP 99 Unstoppable Love on or before April 24, 2026.",
      values: "Open, Vulnerable, Loving",
    },
    personal: {
      goalStatement:
        "I love and give back to myself by embracing openness, vulnerability, joy, and trust. I honor my wholeness through at least 15 self-loving and adoring activities, culminating in a radiant essence shot that captures my true being on or before April 24, 2026.",
      values: "Self-Love, Vulnerability, Openness, Trust, Joy",
    },
    professional: {
      goalStatement:
        "I am a open, trusting, passionate and commited woman as I prepare my team for Admin certification by December 2026, as I joyfully train my team in creating an Administrative and Operations Support Manual and presenting a draft for management review on or before April 24, 2026.",
      values: "Trust, Openness, Joy, Passion, Commitment, Responsibility",
    },
  },
  Maj: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "As an abundant, joyful and loving woman, I inspire my friends, relatives, co-workers and potential students with the lessons I learned from my Trilogy journey, and enroll at least 2 for FLEX, at least 2 for ALC, and at least 4 for LEAP 99 Unstoppable Love on or before April 24, 2026.",
      values: "Vulnerability, Love, Joy",
    },
    personal: {
      goalStatement:
        "As a loving woman ready to create a beautiful life for myself, I go through at least 10 dates with the people I love and care culminating in a podcast sharing my experience on or before April 24, 2026.",
      values: "Courage, Power, Commitment",
    },
    professional: {
      goalStatement:
        "As a step towards becoming an impactful and passionate change leader, I take steps in building my NGO for survivors of human trafficking and domestic violence culminating in a soft launch on or before April 24, 2026.",
      values: "Courage, Power, Commitment",
    },
  },
  RJ: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "As a loving and committed council leader, I enroll at least 2 FLEX, 2 ALC and 4 LEAP students on or before April 24, 2026.",
      values: "Love, Commitment",
    },
    personal: {
      goalStatement:
        "I put the spotlight on myself, create internal balance and find the joy in stillness as I explore at least 10 \u2018relaxing\u2019 activities that enable me to relax my mind, body and spirit and journal the introspective journey on or before April 24, 2026.",
      values: "Responsibility, Courage, Self-Love",
    },
    professional: {
      goalStatement:
        "I create abundance with the work of my hands and heart by creating at least 5 upcycled accessories as part of my initial collection for an accessory line, display and sell them on or before April 24, 2026.",
      values: "Passion, Commitment, Creativity, Abundance",
    },
  },
  Jervin: {
    declaration: "I am Complete",
    enrollment: {
      goalStatement:
        "I continuously live in my wholeness, radiating my light to the people I love, coming from grace, love, and power, and I enroll at least two FLEX, two ALC, and four LEAP participants on or before April 24.",
      values: "Courage, Gratitude, Trust",
    },
    personal: {
      goalStatement:
        "As I live from love, responsibility, and trust, I experience wholeness by nurturing my health in mind, body, and spirit. I joyfully and consistently cultivate at least three wellness habits, fully embodying responsibility, self-respect, and devotion to myself. This journey naturally culminates in a photoshoot that powerfully expresses the grandest version of who I am.",
      values: "Love, Responsibility, Trust",
    },
    professional: {
      goalStatement:
        "From a place of wholeness, I live fully, embodying power, trust, and love, and showing up in ways that make me proud of myself. I am welcoming 12 aligned clients over eight weeks, naturally leading to my enrollment in the International Sports Sciences Association (ISSA) certification course on or before April 24, 2026\u2014an expression of the capable person I already am.",
      values: "Trust, Love, Power",
    },
  },
  Yollie: {
    declaration: "I Am God's Gift of Love",
    enrollment: {
      goalStatement:
        "I am loving, committed and caring as I joyfully enroll 2 people in FLEX and ALC on or before April 11, 2026 and April 17, 2026 respectively and 4 people in LEAP by April 24, 2026.",
      values: "Loving, Caring, Committed",
    },
    personal: {
      goalStatement:
        "With deep gratitude, I joyfully celebrate life and honor the divine as I allow myself to experience 10 new loving activities as I ensure being physically fit as I schedule my overdue executive medical check up on or before April 24, 2026.",
      values: "Grateful, Joyful, Self-Love",
    },
    professional: {
      goalStatement:
        "I am open, passionate and committed woman as I responsibly conquer procrastination as I say yes to creating a comprehensive business strategy that will open another door to a partnership on or before April 24, 2026.",
      values: "Open, Passionate, Committed",
    },
  },
  Anthony: {
    declaration: "My trusting love empowers greatness.",
    enrollment: {
      goalStatement:
        "I am a courageous and vulnerable man who lives my trusting love by inviting people to discover their greatness. With vulnerability, courage, openness, and trust, I will intentionally openly share the possibility of transformation through LEAP with at least twenty (20) people, invite them into meaningful conversations about growth, enroll at least four (4) participants into Leap, two (2) in ALC and two (2) in FLEX on or before the doors open of LEAP 99.",
      values: "Courage, Vulnerability, Trust",
    },
    personal: {
      goalStatement:
        "To live my trusting love by opening myself to new experiences and deeper connections, I intentionally will engage in at least four (4) activities and build connections with at least ten (10) new people, culminating in actively participating in one community or group event before April 25, 2026.",
      values: "Love, Trust, Courage, Self-Care",
    },
    professional: {
      goalStatement:
        "By April 25, 2026, I will complete a beginner level Filipino Sign Language (FSL) or ASL course, practice 3 hours weekly and hold a 5 to 10 minute basic signed conversation with a Deaf or signing partner, so I can communicate with presence, using sign language as a daily practice of trusting love and empowers the greatness of others.",
      values: "Love, Commitment",
    },
  },
  JP: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "I am a committed, caring and vulnerable man as I enroll 2 people in FLEX on or before April 11, 2026; 2 people in ALC on or before April 17, 2026, and 4 people in LEAP on or before April 24, 2026.",
      values: "Commitment, Care, Vulnerability",
    },
    personal: {
      goalStatement:
        "I just wanted to reconnect to my passion, and self identity after feeling 'stagnated and routinely' for the past years as I courageously do at least 10 self-affirming and reflective activities culminating in a celebratory moment to express passion, gratitude and zest for life on or before April 24, 2026.",
      values: "Commitment, Responsibility, Openness",
    },
    professional: {
      goalStatement:
        "I am preparing myself to be 'future-proof' as I adapt and adjust to changing business times by learning about A.",
      values: "Commitment, Responsibility, Openness",
    },
  },
  Daisy: {
    declaration: "I Embrace My Joyful and Beautiful Life",
    enrollment: {
      goalStatement:
        "As I declared in my Coaching journey for LEAP 99, I choose courage to declare, to trust myself that I can, and to believe in abundance by being vulnerable in asking for support from the people who love and trust me. From this space, I commit to enrolling 2 FLEX, 2 ALC, and 4 LEAP participants.",
      values: "Courage, Trust, Abundance, Vulnerability",
    },
    personal: {
      goalStatement:
        "As I embrace my joyful and beautiful life, I honor my loving, courageous, caring, and responsible self by committing to 12 self-loving, active, and healthy activities. Through this journey, I choose to be joyfully present for myself and for my family, on or before April 24, 2026. This commitment will culminate in a confirmed Executive Check-Up with Check-In, affirming my dedication to holistic well-being.",
      values: "Courage, Care, Responsibility",
    },
    professional: {
      goalStatement:
        "Embracing my courage, vulnerability, and responsibility, I commit to rebuilding the trust and confidence of our customers by re-opening our BigBrew Store along Aurora Boulevard, Cubao. This will provide our family with financial sustainability, allowing us to joyfully invest in our 12 meaningful activities with my kids. This commitment will culminate in the scheduled re-opening of our BigBrew Store on or before April 24, 2026.",
      values: "Courage, Vulnerability, Responsibility",
    },
  },
  Mickey: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "As I experience myself as a bold leader for transformation, I will enroll 2 FLEX, 2 ALC and 4 LEAP Students with power, freedom and vulnerability on or before April 24, 2026.",
      values: "Power, Freedom, Vulnerability",
    },
    personal: {
      goalStatement:
        "As I experience myself as a man who is worth loving and perfect, whole and complete, I will go on 10 dating or self-love activities with fun, joy and compassion on or before April 24, 2026.",
      values: "Fun, Joy, Compassion",
    },
    professional: {
      goalStatement:
        "As I experience myself as a bringer of joy to the world, I will playtest my Wordy Wizards boardgame in 4 gaming locations with power, joy and abundance, culminating in a presentation at a major boardgame convention or to a boardgame publisher or distributor on or before April 24, 2026.",
      values: "Power, Joy, Abundance",
    },
  },
  Ding: {
    declaration: "My love is unstoppable -- whatever it takes.",
    enrollment: {
      goalStatement:
        "As a loving and trusting man, I excitedly share to my friends, relatives and clients the learning I got from the Trilogy program (FLEX, ALC and LEAP) and enroll 2 FLEX, 2 ALC, 4 LEAP for LEAP 99, Unstoppable Journey on or before April 24, 2026.",
      values: "Love, Trust",
    },
    personal: {
      goalStatement:
        "I responsibly complete 12 meaningful and creative activities to help me maintain my healthy body with a culmination of having 10lbs lighter on or before April 24, 2026.",
      values: "Love, Trust",
    },
    professional: {
      goalStatement:
        "I love to regain my financial freedom as I responsibly and committedly do 48 client presentations of PRU Life UK products on or before April 24, 2026.",
      values: "Love, Trust",
    },
  },
  Cherry: {
    declaration: "MY POWERFUL LOVE INSPIRES GREATNESS",
    enrollment: {
      goalStatement:
        "With joy, love, trust and abundance, I will enroll 2 FLEX, 2 ALC and 4 LEAP students on or before April 24, 2026.",
      values: "Joy, Love, Trust, Abundance",
    },
    personal: {
      goalStatement:
        "Embracing my powerful love, I shall learn at least 12 passionate activities allowing me to experience vulnerability, joy, freedom, courage and self-love. As a culminating activity, I will document all these passionate activities in a reel and post it on Facebook and Instagram on or before April 24, 2026. The reel shall be a living testament on how my powerful love brought me joy and gave me enough courage to inspire the greatness in me.",
      values: "Vulnerability, Joy, Freedom, Courage, Self-Love",
    },
    professional: {
      goalStatement:
        "As a trusting, powerful and responsible business owner, I am committed in taking the necessary steps to expand my HR consulting services by sending 30 proposals to potential clients culminating in at least 5 business presentations on or before April 24, 2026 which will allow me to experience joy and commitment.",
      values: "Power, Trust, Commitment, Responsibility, Joy",
    },
  },
  Nancy: {
    declaration: "MY LOVE CREATES MIRACLES",
    enrollment: {
      goalStatement:
        "As a grateful, loving and vulnerable woman, as I excitedly share with my friends, and relatives what I experienced from my Trilogy journey and enroll at least 2 for FLEX, at least 2 for ALC, and at least 4 for LEAP 99 Unstoppable Love on or before April 24, 2026.",
      values: "Gratitude, Love, Vulnerability",
    },
    personal: {
      goalStatement:
        "As a passionate and loving woman, I joyfully create a balanced life by taking the necessary steps for my retirement by 2030 as I responsibly do at least 20 activities on or before April 24, 2026 - activities that will prepare myself physically, mentally, emotionally and spiritually for retirement.",
      values: "Self-Love, Joy, Wholehearted",
    },
    professional: {
      goalStatement:
        "As a grateful and loving founder of Miracles Warrior Foundation Inc., I passionately create my legacy by expanding the services of MWF as a legal interpreter for the deaf community by completing at least 40 hours of legal signing on or before April 24, 2026.",
      values: "Gratitude, Love, Passion",
    },
  },
};

export async function seedDatabase() {
  console.log("Seeding database...");
  const now = new Date();
  const CURRENT_WEEK = 8; // matches batch schema default — weeks < 8 are marked complete

  // Load real action plans extracted from PDF tracker
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let pdfActionPlans: Record<string, any> = {};
  try {
    const jsonPath = join(process.cwd(), "excel-action-plans-v3.json");
    pdfActionPlans = JSON.parse(readFileSync(jsonPath, "utf-8"));
    console.log(`Loaded PDF action plans for ${Object.keys(pdfActionPlans).length} students`);
  } catch {
    console.log("No excel-action-plans-v3.json found, using fallback data");
  }

  // Create batch
  const batchId = createId();
  await db.insert(batches).values({
    id: batchId,
    name: "LEAP 99",
    startDate: "2026-02-02",
    endDate: "2026-04-26",
    createdAt: now,
    updatedAt: now,
  });

  // Create Head Coach
  const hcId = createId();
  const defaultPwd = await hashPassword("password123");
  await db.insert(users).values({
    id: hcId,
    email: "louie@leap99.com",
    passwordHash: defaultPwd,
    name: "Louie",
    role: "head_coach",
    batchId,
    approvalStatus: "approved",
    createdAt: now,
    updatedAt: now,
  });

  // HC Louie declaration
  await db.insert(declarations).values({
    id: createId(),
    userId: hcId,
    text: coachGoalData.Louie.declaration,
    approvalStatus: "approved",
    createdAt: now,
    updatedAt: now,
  });

  // HC Louie goals (from Excel v3.1)
  const louieGoalData = coachGoalData.Louie;
  const louiePdfData = pdfActionPlans["Louie"] || {};
  for (const goalType of ["enrollment", "personal", "professional"] as const) {
    const goalId = createId();
    const goalInfo = louieGoalData[goalType];
    await db.insert(goals).values({
      id: goalId,
      userId: hcId,
      goalType,
      goalStatement: goalInfo.goalStatement,
      specificDetails: `Specific details for Louie's ${goalType} goal`,
      measurableCriteria: "Track weekly progress with measurable outcomes",
      achievableResources: "Coaching support and peer accountability",
      relevantAlignment: "Aligned with LEAP program objectives",
      startDate: "2026-02-02",
      endDate: "2026-04-26",
      excitingMotivation: "Personal growth and leadership development",
      rewardingBenefits: "Career advancement and community impact",
      valuesDeclaration: goalInfo.values,
      status: "in_progress",
      approvalStatus: "approved",
      createdAt: now,
      updatedAt: now,
    });

    const weekMilestones: { desc: string; start: string; end: string }[] = [
      { desc: "Clarity of goals", start: "2026-02-02", end: "2026-02-08" },
      { desc: "Action plans finalized | rendering", start: "2026-02-09", end: "2026-02-15" },
      { desc: "20%\u201340% of personal & professional goals completed | wk of 1st Workshop | naming the dragon", start: "2026-02-16", end: "2026-02-22" },
      { desc: "30%\u201350% of personal & professional goals completed | wk of 2nd Intensive", start: "2026-02-23", end: "2026-03-01" },
      { desc: "40%\u201360% of personal & professional goals completed", start: "2026-03-02", end: "2026-03-08" },
      { desc: "50%\u201370% of personal & professional goals completed", start: "2026-03-09", end: "2026-03-15" },
      { desc: "60%\u201380% of personal & professional goals completed", start: "2026-03-16", end: "2026-03-22" },
      { desc: "70%\u201390% of personal & professional goals completed | wk of 2nd Workshop", start: "2026-03-23", end: "2026-03-29" },
      { desc: "70%\u2013100% of personal & professional goals completed | wk of 3rd Intensive", start: "2026-03-30", end: "2026-04-05" },
      { desc: "80%\u2013100% of personal & professional goals completed | 100% FLEX enrollment", start: "2026-04-06", end: "2026-04-12" },
      { desc: "90%\u2013100% of personal & professional goals completed | 100% ALC enrollment", start: "2026-04-13", end: "2026-04-19" },
      { desc: "100% of all goals", start: "2026-04-20", end: "2026-04-24" },
    ];

    for (let week = 1; week <= 12; week++) {
      const wm = weekMilestones[week - 1];
      const weekKey = String(week);
      const pdfWeek = louiePdfData[weekKey];
      let actions: { text: string; done: boolean }[];
      if (pdfWeek && pdfWeek.actions[goalType] && pdfWeek.actions[goalType].length > 0) {
        actions = pdfWeek.actions[goalType].map((a: { text: string; done: boolean }) => ({ text: a.text, done: a.done }));
      } else {
        actions = [];
      }
      if (week < CURRENT_WEEK) {
        actions = actions.length > 0 ? actions.map((a) => ({ ...a, done: true })) : [{ text: wm.desc, done: true }];
      }
      const milestoneDesc = pdfWeek?.milestone?.[goalType] ? pdfWeek.milestone[goalType] : wm.desc;
      const doneCount = actions.filter((a) => a.done).length;
      const pct = actions.length > 0 ? Math.round((doneCount / actions.length) * 100) : 0;
      // Use JSON's per-week done flag for milestone completion if available; fall back to all-actions-done
      const jsonDone = pdfWeek?.done?.[goalType];
      const isComplete = jsonDone !== undefined
        ? jsonDone === "Y"
        : (actions.length > 0 && doneCount === actions.length);
      const results = isComplete ? [{ text: `Week ${week} milestone completed`, done: true }] : [];
      await db.insert(weeklyMilestones).values({
        id: createId(),
        goalId,
        weekNumber: week,
        weekStartDate: wm.start,
        weekEndDate: wm.end,
        milestoneDescription: milestoneDesc,
        actions: JSON.stringify(actions),
        results: JSON.stringify(results),
        cumulativePercentage: pct,
        approvalStatus: isComplete ? "approved" : "pending",
        approvedBy: isComplete ? hcId : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Create Coach (Kalod)
  const coachId = createId();
  await db.insert(users).values({
    id: coachId,
    email: "kalod.coach@leap99.com",
    passwordHash: defaultPwd,
    name: "Kalod Sta. Clara",
    role: "coach",
    batchId,
    approvalStatus: "approved",
    approvedBy: hcId,
    createdAt: now,
    updatedAt: now,
  });

  // Coach Kalod declaration (from Excel v3.1)
  await db.insert(declarations).values({
    id: createId(),
    userId: coachId,
    text: coachGoalData.Kalod.declaration,
    approvalStatus: "approved",
    approvedBy: hcId,
    createdAt: now,
    updatedAt: now,
  });

  // Coach Kalod goals (from Excel v3.1)
  const kalodGoalData = coachGoalData.Kalod;
  const kalodPdfData = pdfActionPlans["Kalod"] || {};
  for (const goalType of ["enrollment", "personal", "professional"] as const) {
    const goalId = createId();
    const goalInfo = kalodGoalData[goalType];
    await db.insert(goals).values({
      id: goalId,
      userId: coachId,
      goalType,
      goalStatement: goalInfo.goalStatement,
      specificDetails: `Specific details for Kalod's ${goalType} goal`,
      measurableCriteria: "Track weekly progress with measurable outcomes",
      achievableResources: "Coaching support and peer accountability",
      relevantAlignment: "Aligned with LEAP program objectives",
      startDate: "2026-02-02",
      endDate: "2026-04-26",
      excitingMotivation: "Personal growth and leadership development",
      rewardingBenefits: "Career advancement and community impact",
      valuesDeclaration: goalInfo.values,
      status: "in_progress",
      approvalStatus: "approved",
      approvedBy: hcId,
      createdAt: now,
      updatedAt: now,
    });

    const weekMilestones: { desc: string; start: string; end: string }[] = [
      { desc: "Clarity of goals", start: "2026-02-02", end: "2026-02-08" },
      { desc: "Action plans finalized | rendering", start: "2026-02-09", end: "2026-02-15" },
      { desc: "20%\u201340% of personal & professional goals completed | wk of 1st Workshop | naming the dragon", start: "2026-02-16", end: "2026-02-22" },
      { desc: "30%\u201350% of personal & professional goals completed | wk of 2nd Intensive", start: "2026-02-23", end: "2026-03-01" },
      { desc: "40%\u201360% of personal & professional goals completed", start: "2026-03-02", end: "2026-03-08" },
      { desc: "50%\u201370% of personal & professional goals completed", start: "2026-03-09", end: "2026-03-15" },
      { desc: "60%\u201380% of personal & professional goals completed", start: "2026-03-16", end: "2026-03-22" },
      { desc: "70%\u201390% of personal & professional goals completed | wk of 2nd Workshop", start: "2026-03-23", end: "2026-03-29" },
      { desc: "70%\u2013100% of personal & professional goals completed | wk of 3rd Intensive", start: "2026-03-30", end: "2026-04-05" },
      { desc: "80%\u2013100% of personal & professional goals completed | 100% FLEX enrollment", start: "2026-04-06", end: "2026-04-12" },
      { desc: "90%\u2013100% of personal & professional goals completed | 100% ALC enrollment", start: "2026-04-13", end: "2026-04-19" },
      { desc: "100% of all goals", start: "2026-04-20", end: "2026-04-24" },
    ];

    for (let week = 1; week <= 12; week++) {
      const wm = weekMilestones[week - 1];
      const weekKey = String(week);
      const pdfWeek = kalodPdfData[weekKey];
      let actions: { text: string; done: boolean }[];
      if (pdfWeek && pdfWeek.actions[goalType] && pdfWeek.actions[goalType].length > 0) {
        actions = pdfWeek.actions[goalType].map((a: { text: string; done: boolean }) => ({ text: a.text, done: a.done }));
      } else {
        actions = [];
      }
      if (week < CURRENT_WEEK) {
        actions = actions.length > 0 ? actions.map((a) => ({ ...a, done: true })) : [{ text: wm.desc, done: true }];
      }
      const milestoneDesc = pdfWeek?.milestone?.[goalType] ? pdfWeek.milestone[goalType] : wm.desc;
      const doneCount = actions.filter((a) => a.done).length;
      const pct = actions.length > 0 ? Math.round((doneCount / actions.length) * 100) : 0;
      const jsonDone = pdfWeek?.done?.[goalType];
      const isComplete = jsonDone !== undefined
        ? jsonDone === "Y"
        : (actions.length > 0 && doneCount === actions.length);
      const results = isComplete ? [{ text: `Week ${week} milestone completed`, done: true }] : [];
      await db.insert(weeklyMilestones).values({
        id: createId(),
        goalId,
        weekNumber: week,
        weekStartDate: wm.start,
        weekEndDate: wm.end,
        milestoneDescription: milestoneDesc,
        actions: JSON.stringify(actions),
        results: JSON.stringify(results),
        cumulativePercentage: pct,
        approvalStatus: isComplete ? "approved" : "pending",
        approvedBy: isComplete ? hcId : undefined,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  // Create 3 councils
  const councilData = [
    { name: "KINDER", theme: "Unstoppable Love", leaderName: "Iya" },
    { name: "MARY-G", theme: "Unstoppable Love", leaderName: "RJ" },
    { name: "The Magnificents", theme: "Unstoppable Love", leaderName: "JP" },
  ];

  const studentNames: Record<string, string[]> = {
    KINDER: ["Elaine", "Nini", "Iya", "Danji", "Royce", "Kalod Sta. Clara"],
    "MARY-G": ["Gek", "Angie", "Maj", "RJ", "Jervin", "Yollie"],
    "The Magnificents": ["Anthony", "JP", "Daisy", "Mickey", "Ding", "Cherry", "Nancy"],
  };

  for (const cd of councilData) {
    const councilId = createId();
    let leaderId: string | null = null;

    // Create students for this council
    const memberNames = studentNames[cd.name] || [];
    const memberIds: string[] = [];

    for (const name of memberNames) {
      const studentId = createId();
      const isLeader = name === cd.leaderName;
      if (isLeader) leaderId = studentId;

      await db.insert(users).values({
        id: studentId,
        email: name === "Kalod Sta. Clara" ? "kalod@leap99.com" : `${name.toLowerCase()}@leap99.com`,
        passwordHash: defaultPwd,
        name,
        role: isLeader ? "council_leader" : "student",
        councilId,
        batchId,
        approvalStatus: "approved",
        approvedBy: hcId,
        createdAt: now,
        updatedAt: now,
      });

      memberIds.push(studentId);

      // Get this student's real data (Kalod Sta. Clara falls back to coachGoalData.Kalod)
      const sd = studentData[name] ?? coachGoalData[name.split(" ")[0]];

      // Create 3 goals per student with real goal statements and values
      for (const goalType of ["enrollment", "personal", "professional"] as const) {
        const goalId = createId();
        const goalInfo = sd[goalType];

        await db.insert(goals).values({
          id: goalId,
          userId: studentId,
          goalType,
          goalStatement: goalInfo.goalStatement,
          specificDetails: `Specific details for ${name}'s ${goalType} goal`,
          measurableCriteria: "Track weekly progress with measurable outcomes",
          achievableResources: "Coaching support and peer accountability",
          relevantAlignment: "Aligned with LEAP program objectives",
          startDate: "2026-02-02",
          endDate: "2026-04-26",
          excitingMotivation: "Personal growth and leadership development",
          rewardingBenefits: "Career advancement and community impact",
          valuesDeclaration: goalInfo.values,
          status: "in_progress",
          approvalStatus: "approved",
          approvedBy: hcId,
          createdAt: now,
          updatedAt: now,
        });

        // Real 12-week milestones from LEAP 99 coaching program
        const weekMilestones: { desc: string; start: string; end: string }[] = [
          { desc: "Clarity of goals", start: "2026-02-02", end: "2026-02-08" },
          { desc: "Action plans finalized | rendering", start: "2026-02-09", end: "2026-02-15" },
          { desc: "20%\u201340% of personal & professional goals completed | wk of 1st Workshop | naming the dragon", start: "2026-02-16", end: "2026-02-22" },
          { desc: "30%\u201350% of personal & professional goals completed | wk of 2nd Intensive", start: "2026-02-23", end: "2026-03-01" },
          { desc: "40%\u201360% of personal & professional goals completed", start: "2026-03-02", end: "2026-03-08" },
          { desc: "50%\u201370% of personal & professional goals completed", start: "2026-03-09", end: "2026-03-15" },
          { desc: "60%\u201380% of personal & professional goals completed", start: "2026-03-16", end: "2026-03-22" },
          { desc: "70%\u201390% of personal & professional goals completed | wk of 2nd Workshop", start: "2026-03-23", end: "2026-03-29" },
          { desc: "70%\u2013100% of personal & professional goals completed | wk of 3rd Intensive", start: "2026-03-30", end: "2026-04-05" },
          { desc: "80%\u2013100% of personal & professional goals completed | 100% FLEX enrollment", start: "2026-04-06", end: "2026-04-12" },
          { desc: "90%\u2013100% of personal & professional goals completed | 100% ALC enrollment", start: "2026-04-13", end: "2026-04-19" },
          { desc: "100% of all goals", start: "2026-04-20", end: "2026-04-24" },
        ];

        // Get real action plans from PDF-extracted data for this student
        const studentPdfData = pdfActionPlans[name] || {};

        for (let week = 1; week <= 12; week++) {
          const wm = weekMilestones[week - 1];
          const weekKey = String(week);
          const pdfWeek = studentPdfData[weekKey];

          // Use real action plan text from PDF if available, otherwise use milestone description
          let actions: { text: string; done: boolean }[];
          if (pdfWeek && pdfWeek.actions[goalType] && pdfWeek.actions[goalType].length > 0) {
            actions = pdfWeek.actions[goalType].map((a: { text: string; done: boolean }) => ({
              text: a.text,
              done: a.done,
            }));
          } else {
            // Fallback: no specific actions from PDF for this student/week/goal
            actions = [];
          }
          // Mark past weeks as completed
          if (week < CURRENT_WEEK) {
            actions = actions.length > 0 ? actions.map((a) => ({ ...a, done: true })) : [{ text: wm.desc, done: true }];
          }

          // Get milestone description from PDF if available
          const milestoneDesc = pdfWeek?.milestone?.[goalType]
            ? pdfWeek.milestone[goalType]
            : wm.desc;

          // Calculate completion percentage from actions
          const doneCount = actions.filter((a) => a.done).length;
          const pct = actions.length > 0 ? Math.round((doneCount / actions.length) * 100) : 0;
          // Use JSON's per-week done flag for milestone completion if available; fall back to all-actions-done
          const jsonDone = pdfWeek?.done?.[goalType];
          const isComplete = jsonDone !== undefined
            ? jsonDone === "Y"
            : (actions.length > 0 && doneCount === actions.length);

          const results = isComplete
            ? [{ text: `Week ${week} milestone completed`, done: true }]
            : [];

          await db.insert(weeklyMilestones).values({
            id: createId(),
            goalId,
            weekNumber: week,
            weekStartDate: wm.start,
            weekEndDate: wm.end,
            milestoneDescription: milestoneDesc,
            actions: JSON.stringify(actions),
            results: JSON.stringify(results),
            cumulativePercentage: pct,
            approvalStatus: isComplete ? "approved" : "pending",
            approvedBy: isComplete ? hcId : undefined,
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // Add declaration from real data
      await db.insert(declarations).values({
        id: createId(),
        userId: studentId,
        text: sd.declaration,
        approvalStatus: "approved",
        approvedBy: hcId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Create council — Louie (hcId) coaches all councils; Kalod is admin coach only
    await db.insert(councils).values({
      id: councilId,
      name: cd.name,
      theme: cd.theme,
      coachId: hcId,
      leaderId,
      batchId,
      createdAt: now,
      updatedAt: now,
    });

    // Set up buddy pairs (pair adjacent students)
    for (let i = 0; i < memberIds.length - 1; i += 2) {
      await db.insert(buddies).values({
        id: createId(),
        studentId: memberIds[i],
        buddyId: memberIds[i + 1],
        councilId,
      });
      await db.insert(buddies).values({
        id: createId(),
        studentId: memberIds[i + 1],
        buddyId: memberIds[i],
        councilId,
      });
    }
  }

  // ─── Seed attendance data for all students (12 weeks each) ───
  type Status = "present" | "late" | "absent" | "no_data";

  const P: Status = "present";
  const L: Status = "late";
  const A: Status = "absent";
  const N: Status = "no_data";

  const attendancePatterns: Record<string, Status[][]> = {
    Elaine: [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,L,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,L,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
      [P,P,P,L,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
    ],
    Nini: [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,L,P],[P,P,P,L,P,P],
      [P,L,P,P,A,P],[L,P,A,P,P,A],[A,P,A,L,P,A],[A,A,P,A,P,A],
      [A,A,A,P,A,P],[L,A,A,A,P,A],[A,A,P,A,A,A],[A,A,A,A,P,A],
    ],
    Iya: [
      [P,P,A,P,P,A],[P,P,P,A,P,A],[P,A,P,P,A,P],[P,P,A,P,P,A],
      [P,P,P,A,A,P],[A,P,P,P,A,P],[P,P,A,P,P,A],[P,A,P,P,P,A],
      [P,P,A,P,A,P],[P,P,P,A,P,A],[P,A,P,P,P,A],[P,P,A,P,P,A],
    ],
    Danji: [
      [P,P,P,P,P,P],[A,A,A,P,A,A],[P,P,P,P,P,L],[A,A,A,A,A,L],
      [P,P,P,P,P,P],[L,A,A,A,A,A],[P,P,P,P,P,P],[A,A,P,A,A,A],
      [P,P,P,P,P,P],[A,A,A,A,L,A],[P,P,P,P,P,P],[A,A,A,A,A,A],
    ],
    Royce: [
      [P,P,P,P,L,P],[P,P,P,P,P,P],[P,P,L,P,P,P],[P,P,P,P,P,P],
      [P,L,P,P,P,P],[P,P,P,P,P,P],[P,P,P,L,P,P],[P,P,P,P,P,P],
      [L,P,P,P,P,P],[P,P,P,P,P,L],[P,P,P,P,P,P],[P,P,P,P,P,P],
    ],
    Gek: [
      [P,P,P,P,P,P],[P,P,P,P,P,L],[P,P,P,P,P,P],[P,P,P,L,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,L,P,P,P],[P,P,P,P,P,P],
      [A,A,A,A,P,A],[A,A,A,A,A,A],[A,P,A,A,A,A],[A,A,A,P,A,A],
    ],
    Angie: [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,L,P,A,P,A],
      [A,A,P,A,P,A],[A,A,P,A,A,P],[P,P,A,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,L],[P,P,P,P,P,P],[P,P,P,P,P,P],
    ],
    Maj: [
      [L,P,L,P,P,L],[P,L,P,L,P,P],[L,P,P,L,P,L],[P,L,P,P,L,P],
      [L,L,P,P,P,L],[P,P,L,P,L,P],[L,P,P,L,P,L],[P,L,P,P,L,P],
      [L,P,L,P,P,P],[P,L,P,L,P,L],[L,P,P,P,L,P],[P,L,P,L,P,L],
    ],
    RJ: [
      [A,A,A,P,A,A],[A,P,A,A,A,P],[A,A,P,A,P,A],[L,P,A,P,A,P],
      [P,A,P,P,A,P],[P,P,A,P,P,A],[P,P,P,A,P,P],[P,P,P,P,A,P],
      [P,P,P,P,P,A],[P,P,P,P,P,P],[P,P,P,P,P,L],[P,P,P,P,P,P],
    ],
    Jervin: [
      [A,A,P,A,A,A],[A,A,A,P,A,A],[P,A,A,A,A,P],[A,A,A,A,P,A],
      [A,P,A,A,A,A],[A,A,A,A,A,P],[A,A,P,A,A,A],[P,A,A,A,A,A],
      [A,A,A,P,A,A],[A,A,A,A,A,P],[A,P,A,A,A,A],[A,A,A,A,P,A],
    ],
    Yollie: [
      [P,P,P,A,P,P],[P,P,P,P,P,P],[P,P,A,P,P,P],[P,P,P,P,P,P],
      [P,A,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,A,P],[P,P,P,P,P,P],
      [P,P,P,P,P,A],[P,P,P,P,P,P],[P,P,A,P,P,P],[P,P,P,P,P,P],
    ],
    Anthony: [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,L,P,P,L,P],[P,P,L,P,P,L],
      [P,L,P,L,P,P],[L,P,P,P,L,P],[P,L,P,P,P,L],[P,P,L,P,L,P],
    ],
    JP: [
      [P,P,P,P,P,P],[A,P,A,A,P,A],[P,P,P,P,P,P],[A,A,P,A,P,A],
      [P,P,P,P,P,P],[P,A,P,A,A,P],[P,P,P,P,P,P],[A,A,P,A,A,P],
      [P,P,P,P,P,P],[A,P,A,A,P,A],[P,P,P,P,P,P],[A,A,A,P,A,A],
    ],
    Daisy: [
      [P,P,A,P,P,A],[P,A,P,P,P,A],[P,P,P,A,P,P],[A,P,P,P,A,P],
      [P,P,A,P,P,P],[P,P,P,A,P,A],[P,A,P,P,P,P],[P,P,A,P,P,A],
      [P,P,P,P,A,P],[A,P,P,P,P,A],[P,P,A,P,P,P],[P,A,P,P,P,P],
    ],
    Mickey: [
      [N,N,N,N,N,N],[N,N,N,N,N,N],[A,A,P,A,A,A],[A,P,A,A,P,A],
      [P,A,P,A,P,A],[P,P,A,P,A,P],[P,P,P,A,P,P],[P,P,P,P,A,P],
      [P,P,P,P,P,P],[P,P,P,P,P,L],[P,P,P,P,P,P],[P,P,P,P,P,P],
    ],
    Ding: [
      [P,P,A,P,A,P],[P,A,P,P,P,A],[A,P,P,A,P,P],[P,P,A,P,P,A],
      [P,A,P,P,A,P],[P,P,P,A,P,A],[A,P,P,P,A,P],[P,P,A,P,P,P],
      [P,A,P,P,P,A],[P,P,A,P,A,P],[P,P,P,A,P,P],[A,P,P,P,P,A],
    ],
    Cherry: [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,L,P,P,P],[P,A,P,A,P,A],
      [A,P,A,P,A,P],[L,A,P,A,P,L],[P,P,A,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,L],[P,P,P,P,P,P],
    ],
    Nancy: [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[A,A,A,A,A,A],[P,P,P,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
    ],
    "Kalod Sta. Clara": [
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
      [P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],
    ],
  };

  // Insert attendance rows for all students (including Kalod Sta. Clara who is a student in KINDER)
  const allStudents = await db.select().from(users);
  const studentUsers = allStudents.filter((u) => u.role === "student" || u.role === "council_leader");

  for (const student of studentUsers) {
    const pattern = attendancePatterns[student.name || ""] || attendancePatterns["Iya"];
    for (let week = 1; week <= 12; week++) {
      const weekData = pattern[week - 1];
      if (!weekData) continue;
      const [meeting, mon, tue, wed, thu, fri] = weekData;
      if ([meeting, mon, tue, wed, thu, fri].every((s) => s === "no_data")) continue;

      await db.insert(attendance).values({
        id: createId(),
        userId: student.id,
        weekNumber: week,
        meetingStatus: meeting,
        callMon: mon,
        callTue: tue,
        callWed: wed,
        callThu: thu,
        callFri: fri,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  console.log("Seed complete: 1 HC Louie + 1 admin coach Kalod (with goals) + 19 students (incl. Kalod as KINDER student), 3 councils (all coached by Louie), 63 goals, 756 milestones, ~228 attendance records, 21 declarations");
}
