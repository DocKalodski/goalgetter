// ─── Goal Templates for LEAP 99 ──────────────────────────────────────────────
// Standard endDate for all templates: 2026-06-19 (Friday before Graduation Jun 20-21)
// Weekly target % defaults follow the LEAP 99 schedule progression

export interface TemplateQuestion {
  id: string;
  label: string;
  placeholder?: string;
  type: "number" | "text" | "select" | "multiselect";
  options?: string[];
  unit?: string;
  defaultValue?: string;
  hint?: string;
  /** Only show this question when:
   *  - value present: answers[id] includes value
   *  - notEmpty: true: answers[id] is non-empty (any value filled in) */
  dependsOn?: { id: string; value?: string; notEmpty?: boolean };
}

export interface TemplateWeek {
  weekNumber: number;
  description: string;
  actions: Array<{ text: string; days: number[] }>;
  results: Array<{ text: string }>;
  cumulativePercentage: number;
}

export interface GoalTemplate {
  id: string;
  goalType: "enrollment" | "personal" | "professional";
  subType: string;
  name: string;
  description: string;
  wheelAreaHint?: string;
  safetyNote?: string;
  questions: TemplateQuestion[];
  smarter: (a: Record<string, string>) => {
    specificDetails: string;
    measurableCriteria: string;
    achievableResources: string;
    relevantAlignment: string;
    endDate: string;
    excitingMotivation: string;
    rewardingBenefits: string;
  };
  milestones: (a: Record<string, string>) => TemplateWeek[];
}

// ── Week-target defaults (LEAP 99 schedule) ───────────────────────────────────
const WK_PCT = [0, 10, 20, 35, 50, 65, 80, 100];

// ── Day-shorthand ─────────────────────────────────────────────────────────────
const MON_FRI = [0, 1, 2, 3, 4];
const DAILY   = [0, 1, 2, 3, 4, 5, 6];
const SUN     = [6];
const MON     = [0];

// ─────────────────────────────────────────────────────────────────────────────
// ENROLLMENT — Standard (1 FLEX + 1 ALC)
// ─────────────────────────────────────────────────────────────────────────────
const enrollmentStandard: GoalTemplate = {
  id: "enrollment-flex-alc",
  goalType: "enrollment",
  subType: "enrollment",
  name: "Enroll 1 FLEX + 1 ALC Client",
  description: "Standard enrollment goal: 1 FLEX client (May sessions) + 1 ALC student (June sessions) through daily outreach.",
  questions: [
    { id: "flexTarget",  label: "FLEX clients to enroll",        type: "number",  placeholder: "1",          defaultValue: "1" },
    { id: "alcTarget",   label: "ALC students to enroll",        type: "number",  placeholder: "1",          defaultValue: "1" },
    { id: "currentCount",label: "Currently enrolled (total)",    type: "number",  placeholder: "0",          defaultValue: "0" },
    { id: "channel",     label: "Primary outreach channel",      type: "multiselect",  options: ["referrals","social media","calls","combination","other"], defaultValue: "referrals" },
    { id: "essence",     label: "Essence quality to embody in enrollment", type: "multiselect",
      options: ["authentic","generous","service-oriented","abundant","courageous","committed","bold","joyful","patient","warm","inspired","other"], defaultValue: "authentic",
      hint: "This becomes the soul of your goal — how you show up in every conversation." },
  ],
  smarter: (a) => ({
    specificDetails: `Enroll ${a.flexTarget || 1} FLEX client (May sessions @ Abenson HQ Muñoz May 9–10 · SMX Aura May 16–17) + ${a.alcTarget || 1} ALC student (June sessions @ SMX Aura Jun 5–7 · Jun 12–14) through daily ${a.channel || "referral"} outreach; showing up as ${a.essence || "authentic"} in every conversation`,
    measurableCriteria: `${a.flexTarget || 1} FLEX enrolled by Wk 4; ${a.alcTarget || 1} ALC enrolled by Wk 5; track daily conversations → discovery calls → proposals → closes; logged weekly in GoalGetter`,
    achievableResources: `Warm network available; starting from ${a.currentCount || 0} enrolled; ${a.channel || "referral"} system and pitch scripts built in Wk 1; LEAP 99 calendar as urgency anchors; accountability coach weekly`,
    relevantAlignment: `I have never consistently enrolled clients through my own outreach system — building this habit and hitting ${parseInt(a.flexTarget || "1") + parseInt(a.alcTarget || "1")} paid clients is new territory that goes beyond my comfort zone`,
    endDate: "June 19, 2026 (Friday before Graduation)",
    excitingMotivation: `Being ${a.essence || "authentic"} and serving future clients the way I wish someone had served me — proving that my coaching business is real and that people trust me enough to invest; the look on my first client's face at Graduation`,
    rewardingBenefits: `${parseInt(a.flexTarget || "1") + parseInt(a.alcTarget || "1")} paying clients active; business model proven; recurring income; legacy clients for LEAP 100; living as the ${a.essence || "authentic"} person I committed to be`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0],
      description:`Build outreach system: 50-person warm list, FLEX + ALC pitch scripts, outreach schedule locked, GoalGetter calendar confirmed as urgency tool`,
      actions:[{text:"Build warm list of 50+ prospects (name, contact, relationship)",days:MON_FRI},{text:`Draft ${a.channel || "referral"} outreach script — FLEX pitch + ALC pitch`,days:[1]},{text:"Book 5 initial invitation conversations for Wk 2",days:[3,4]},{text:`Lock daily outreach schedule in GoalGetter; embody ${a.essence || "authentic"} in every message`,days:MON}],
      results:[{text:`50-person warm list complete`},{text:`Pitch scripts for FLEX (May 9–10 Abenson; May 16–17 SMX) + ALC (Jun 5–7; Jun 12–14 SMX) ready`}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1],
      description:`Execute outreach: 20 conversations, 5 discovery calls booked; FLEX 298 (May 9–10 Abenson HQ, Muñoz) as urgency anchor`,
      actions:[{text:"Send 5+ outreach messages daily (calls/messages/in-person)",days:MON_FRI},{text:"Conduct 5 discovery calls; document objections + responses",days:[1,2,3,4]},{text:`FLEX 298 (May 9–10 Abenson Muñoz) — invite warm prospects; use event as urgency`,days:[5]},{text:`Log all conversations in tracker; rate own ${a.essence || "authentic"} presence 1-10`,days:SUN}],
      results:[{text:"20+ conversations completed"},{text:"5+ discovery calls held"},{text:"2+ FLEX proposals sent"}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2],
      description:`5 discovery calls complete; 2+ FLEX proposals sent; FLEX 299 (May 16–17 SMX Aura) + 1st Workshop May 17 — leverage event energy`,
      actions:[{text:"Follow up all Wk 2 proposals — send 2 new FLEX proposals",days:MON_FRI},{text:"FLEX 299 (May 16–17 SMX Aura) — invite warm FLEX prospects; 1st Workshop May 17",days:[5,6]},{text:"Start ALC pipeline: 10 new ALC conversations this week",days:MON_FRI},{text:"Workshop debrief: how did you show up as "+a.essence+" this week?",days:SUN}],
      results:[{text:"5+ discovery calls completed"},{text:"2+ FLEX proposals sent"},{text:"ALC pipeline started (10+ conversations)"}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3],
      description:`Enroll 1st FLEX client; 2nd Intensive May 23–24 UP BGC; ALC pipeline at 30+ conversations`,
      actions:[{text:"Close FLEX enrollment — follow up all proposals until YES or clear NO",days:MON_FRI},{text:"2nd Intensive May 23–24 UP BGC — attend; share enrollment progress with coach",days:[5,6]},{text:"30+ ALC conversations; 3+ discovery calls booked",days:MON_FRI},{text:"Celebrate FLEX win — send client a personal welcome message",days:[3]}],
      results:[{text:`1st FLEX client ENROLLED ✓`},{text:"ALC pipeline: 30+ conversations, 3+ discovery calls"}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4],
      description:`ALC orientation calls; 3+ ALC prospects active; FLEX client thriving; direct prospects to ALC 256 (Jun 5–7 SMX Aura)`,
      actions:[{text:"Conduct 3+ ALC orientation calls — paint the picture of ALC 256 (Jun 5–7 SMX Aura)",days:MON_FRI},{text:"Send 2+ ALC proposals; follow up daily",days:MON_FRI},{text:"Check in with FLEX client — document their early wins for your testimony",days:[2]},{text:"Rate your "+a.essence+" presence this week; adjust approach if needed",days:SUN}],
      results:[{text:"3+ ALC prospects in proposal stage"},{text:"FLEX client active and engaged"}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5],
      description:`Enroll 1st ALC student — ALC 256 Jun 5–7 SMX Aura; ALC program launched`,
      actions:[{text:"Close ALC enrollment — follow up until YES or clear NO",days:MON_FRI},{text:"ALC 256 Jun 5–7 SMX Aura — send off your ALC student with a personal message",days:[4,5,6]},{text:"ALC 257 (Jun 12–14) invitation: plant urgency seed for Wk 7",days:[3]},{text:"Document your full FLEX+ALC process — what worked?",days:SUN}],
      results:[{text:`1st ALC student ENROLLED ✓`},{text:"Both clients receiving first sessions"}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6],
      description:`Goal hit — 1 FLEX + 1 ALC active; ALC 257 Jun 12–14 SMX Aura; testimony drafted; 2nd Workshop + AckNight Jun 14`,
      actions:[{text:"ALC 257 Jun 12–14 SMX Aura — celebrate with your ALC student; 2nd Workshop + AckNight Jun 14",days:[4,5,6]},{text:"Draft your enrollment testimony — essence quality shown + results",days:[1,2]},{text:"Activate referral loop: ask each client for 1 referral",days:[2,3]},{text:"AckNight Jun 14 — share your story",days:[6]}],
      results:[{text:"1 FLEX + 1 ALC active ✓"},{text:"Testimony drafted"},{text:"Referral conversations started"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7],
      description:`Both clients thriving; onboarding documented; next cohort waitlist; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:"Final client check-in — gather early wins for testimony",days:[1,2]},{text:"Prepare personal graduation words for each enrolled client",days:[3]},{text:"Graduation Jun 20–21 — embrace your clients; deliver personal word",days:[5,6]},{text:"Lock next cohort waitlist; send invitations to 3 new prospects",days:[1,2,3]}],
      results:[{text:"Both clients graduation-ready"},{text:"Testimony complete by Jun 19"},{text:"Next cohort waitlist started"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// ENROLLMENT — High Volume (2+ FLEX + 2+ ALC pipeline)
// ─────────────────────────────────────────────────────────────────────────────
const enrollmentHighVolume: GoalTemplate = {
  id: "enrollment-high-volume",
  goalType: "enrollment",
  subType: "enrollment-high",
  name: "High-Volume Enrollment (2+ FLEX + 2+ ALC)",
  description: "Pipeline-management approach for coaches targeting 2 or more clients across both tracks — funnel management, referral chains, batch attendance of all sessions.",
  questions: [
    { id: "flexTarget",  label: "FLEX clients to enroll (2–5)",     type: "number", placeholder: "2", defaultValue: "2" },
    { id: "alcTarget",   label: "ALC students to enroll (2–5)",     type: "number", placeholder: "2", defaultValue: "2" },
    { id: "channel",     label: "Primary outreach channel",         type: "multiselect", options: ["referrals","social media","calls","combination","other"], defaultValue: "referrals" },
    { id: "essence",     label: "Essence quality to embody in enrollment", type: "multiselect",
      options: ["authentic","generous","service-oriented","abundant","courageous","committed","bold","joyful","patient","warm","inspired","other"], defaultValue: "abundant" },
  ],
  smarter: (a) => {
    const total = parseInt(a.flexTarget || "2") + parseInt(a.alcTarget || "2");
    return {
      specificDetails: `Enroll ${a.flexTarget || 2} FLEX clients + ${a.alcTarget || 2} ALC students through simultaneous ${a.channel || "referral"} pipeline management; attending all FLEX sessions (May 9–10, May 16–17) and all ALC sessions (Jun 5–7, Jun 12–14) as urgency anchors; 10+ conversations/day`,
      measurableCriteria: `${a.flexTarget || 2} FLEX enrolled by Wk 4; ${a.alcTarget || 2} ALC enrolled by Wk 5; pipeline tracked: conversations → calls → proposals → closes weekly; target ${total} total clients active by Jun 19`,
      achievableResources: `Warm network + referral chain from first clients; both FLEX 298 + 299 and ALC 256 + 257 as live urgency tools; 3+ hours/day dedicated; systematic funnel tracking in GoalGetter`,
      relevantAlignment: `I have never managed a multi-client pipeline simultaneously — enrolling ${total} paying clients pushes well beyond my previous enrollment comfort zone`,
      endDate: "June 19, 2026",
      excitingMotivation: `Showing up ${a.essence || "abundant"} — proving I can build a coaching practice, not just close one client; the moment all ${total} clients are active is the moment my business becomes real`,
      rewardingBenefits: `${total} active clients; stable monthly income; referral network activated; business model proven for LEAP 100 and beyond`,
    };
  },
  milestones: (a) => {
    const fx = parseInt(a.flexTarget || "2");
    const al = parseInt(a.alcTarget || "2");
    const total = fx + al;
    return [
      { weekNumber:1, cumulativePercentage:WK_PCT[0], description:"Build multi-client funnel: 100-person warm list, separate FLEX + ALC pitch tracks, daily pipeline tracker set up",
        actions:[{text:"Build 100+ person warm list — segment into FLEX and ALC profiles",days:MON_FRI},{text:"Draft dual-track pitch: FLEX (May sessions urgency) + ALC (June sessions urgency)",days:[1,2]},{text:"Set up pipeline tracker with columns: Contact → Conversation → Discovery Call → Proposal → Enrolled",days:MON},{text:"Book 10 outreach conversations for Wk 2",days:[3,4]}],
        results:[{text:"100-person warm list built and segmented"},{text:"Pipeline tracker live"}] },
      { weekNumber:2, cumulativePercentage:WK_PCT[1], description:"40+ conversations; 10 discovery calls; FLEX 298 (May 9–10 Abenson Muñoz) — move FLEX prospects urgently",
        actions:[{text:"10+ outreach conversations/day across FLEX + ALC tracks",days:MON_FRI},{text:"FLEX 298 May 9–10 Abenson HQ Muñoz — invite all FLEX prospects; use event date as close",days:[5,6]},{text:"Conduct 10 discovery calls; document objections",days:[1,2,3,4]},{text:"Pipeline review: how many in each stage?",days:SUN}],
        results:[{text:"40+ conversations held"},{text:"10+ discovery calls completed"},{text:"5+ FLEX proposals sent"}] },
      { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`Close FLEX pipeline; FLEX 299 (May 16–17 SMX Aura) + 1st Workshop; ALC pipeline 30+ conversations`,
        actions:[{text:"Follow up all FLEX proposals — close or eliminate from pipeline",days:MON_FRI},{text:"FLEX 299 May 16–17 SMX Aura + 1st Workshop May 17 — maximize invitation energy",days:[5,6]},{text:"30+ ALC conversations; 5 ALC discovery calls",days:MON_FRI},{text:"Referral ask: every enrolled client gives 1 referral name",days:[3]}],
        results:[{text:`${fx} FLEX clients enrolled or in final-close stage`},{text:"ALC pipeline: 30+ conversations"}] },
      { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`${fx} FLEX enrolled; 2nd Intensive May 23–24 UP BGC; ALC pipeline at 50+ conversations`,
        actions:[{text:"Close final FLEX enrollments — all "+fx+" confirmed",days:MON_FRI},{text:"2nd Intensive May 23–24 UP BGC — attend; celebrate FLEX wins with coach",days:[5,6]},{text:"50+ ALC conversations; 10 ALC discovery calls; 5 ALC proposals sent",days:MON_FRI},{text:"Send enrolled FLEX clients a personal welcome message",days:[3]}],
        results:[{text:`${fx} FLEX clients enrolled ✓`},{text:"ALC pipeline: 50+ conversations, 5+ proposals"}] },
      { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`ALC pipeline close; ${al} ALC enrolled; FLEX clients thriving; ALC 256 (Jun 5–7) as urgency`,
        actions:[{text:"Close all ALC enrollments — "+al+" confirmed",days:MON_FRI},{text:"Direct enrolled ALC students to ALC 256 Jun 5–7 SMX Aura",days:[3]},{text:"FLEX client check-in — document wins for testimony",days:[2]},{text:"Start LEAP 100 waitlist: ask all "+total+" clients for 1 referral each",days:[4]}],
        results:[{text:`${al} ALC students enrolled ✓`},{text:"All "+total+" clients active"}] },
      { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`All ${total} clients in programs; ALC 256 Jun 5–7; testimony drafting; referral chain active`,
        actions:[{text:"ALC 256 Jun 5–7 SMX Aura — send off ALC students with personal messages",days:[4,5,6]},{text:"Draft enrollment testimony — essence quality + pipeline process + client outcomes",days:[1,2]},{text:"Activate referral chain: each of "+total+" clients refers 1 person for LEAP 100",days:[3,4]},{text:"Income tracking: document earnings per client enrolled",days:SUN}],
        results:[{text:"All clients receiving first sessions"},{text:"Testimony draft complete"}] },
      { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`Goal complete; ALC 257 Jun 12–14 SMX Aura; 2nd Workshop + AckNight Jun 14; LEAP 100 pipeline seeded`,
        actions:[{text:"ALC 257 Jun 12–14 SMX Aura — celebrate with ALC students; 2nd Workshop Jun 14",days:[4,5]},{text:"AckNight Jun 14 — share your "+total+"-client enrollment story",days:[6]},{text:"Lock LEAP 100 waitlist — at least 5 names",days:[1,2]},{text:"Finalize testimony — ready for presentation Jun 19",days:[3]}],
        results:[{text:"All "+total+" clients active and engaged ✓"},{text:"LEAP 100 waitlist: 5+ names"}] },
      { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`Graduation sprint; prepare personal words for each client; testimony ready Jun 19; Graduation Jun 20–21`,
        actions:[{text:"Prepare personal graduation words for each of "+total+" clients",days:[1,2]},{text:"Graduation Jun 20–21 — embrace each client; deliver personal word",days:[5,6]},{text:"Document full pipeline process for replication",days:[3]},{text:"Submit testimony by Jun 19",days:[4]}],
        results:[{text:"Testimony complete ✓"},{text:"All clients graduation-ready"},{text:"Next cohort process documented"}] },
    ];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL — Health & Wellness
// ─────────────────────────────────────────────────────────────────────────────
const personalHealth: GoalTemplate = {
  id: "personal-health",
  goalType: "personal",
  subType: "health",
  name: "Health & Wellness",
  description: "Doctor-first health goal supporting weight loss, body measurements, medical test improvement, and/or fitness targets over 8 weeks with maintenance in Wk 8.",
  wheelAreaHint: "Area A: Physical Health",
  safetyNote: "⚕️ Doctor consultation required as first action. Max 1 kg/week weight loss.",
  questions: [
    { id: "primaryTarget", label: "Health target(s) — pick all that apply", type: "multiselect",
      options: ["Weight loss (kg)","Body measurements (cm)","Medical test result","General fitness level","other"],
      defaultValue: "Weight loss (kg)",
      hint: "Select multiple if you're combining targets (e.g., weight + waist)." },

    // ── Weight loss fields ───────────────────────────────────────────────────
    { id: "weightCurrent", label: "Current weight (kg)", type: "number", placeholder: "78",
      hint: "Safe rate: max 1 kg/week. 7 execution weeks = 7 kg maximum.",
      dependsOn: { id: "primaryTarget", value: "Weight loss (kg)" } },
    { id: "weightTarget",  label: "Target weight (kg)", type: "number", placeholder: "72",
      dependsOn: { id: "primaryTarget", value: "Weight loss (kg)" } },

    // ── Body measurements — pick parts as pills, each reveals its own current+target ──
    { id: "bodyParts", label: "Which body part(s) to track?", type: "multiselect",
      options: ["waist","hips","chest","arms","thighs"],
      hint: "Select all you want to reduce. Each shows its own current + target.",
      dependsOn: { id: "primaryTarget", value: "Body measurements (cm)" } },
    { id: "waistCurrent", label: "Waist — current (cm)", type: "number", placeholder: "90", dependsOn: { id: "bodyParts", value: "waist" } },
    { id: "waistTarget",  label: "Waist — target (cm)",  type: "number", placeholder: "82", dependsOn: { id: "bodyParts", value: "waist" } },
    { id: "hipsCurrent",  label: "Hips — current (cm)",  type: "number", placeholder: "105", dependsOn: { id: "bodyParts", value: "hips" } },
    { id: "hipsTarget",   label: "Hips — target (cm)",   type: "number", placeholder: "95",  dependsOn: { id: "bodyParts", value: "hips" } },
    { id: "chestCurrent", label: "Chest — current (cm)", type: "number", placeholder: "100", dependsOn: { id: "bodyParts", value: "chest" } },
    { id: "chestTarget",  label: "Chest — target (cm)",  type: "number", placeholder: "90",  dependsOn: { id: "bodyParts", value: "chest" } },
    { id: "armsCurrent",  label: "Arms — current (cm)",  type: "number", placeholder: "35",  dependsOn: { id: "bodyParts", value: "arms" } },
    { id: "armsTarget",   label: "Arms — target (cm)",   type: "number", placeholder: "30",  dependsOn: { id: "bodyParts", value: "arms" } },
    { id: "thighsCurrent",label: "Thighs — current (cm)",type: "number", placeholder: "62",  dependsOn: { id: "bodyParts", value: "thighs" } },
    { id: "thighsTarget", label: "Thighs — target (cm)", type: "number", placeholder: "55",  dependsOn: { id: "bodyParts", value: "thighs" } },

    // ── Medical markers — pick markers as pills, each reveals its own current+target ──
    { id: "healthMarkers", label: "Which health markers to improve?", type: "multiselect",
      options: ["cholesterol","blood sugar (fasting)","blood pressure","uric acid","HbA1c","triglycerides","creatinine","other"],
      hint: "⚕️ Doctor-prescribed targets required for all. Select all you're tracking.",
      dependsOn: { id: "primaryTarget", value: "Medical test result" } },
    { id: "cholCurrent",  label: "Cholesterol — current (mg/dL)",        type: "number", placeholder: "220", dependsOn: { id: "healthMarkers", value: "cholesterol" } },
    { id: "cholTarget",   label: "Cholesterol — doctor's target (mg/dL)", type: "number", placeholder: "180", dependsOn: { id: "healthMarkers", value: "cholesterol" } },
    { id: "bgCurrent",    label: "Blood sugar — current fasting (mg/dL)", type: "number", placeholder: "130", dependsOn: { id: "healthMarkers", value: "blood sugar" } },
    { id: "bgTarget",     label: "Blood sugar — doctor's target (mg/dL)", type: "number", placeholder: "100", dependsOn: { id: "healthMarkers", value: "blood sugar" } },
    { id: "bpCurrent",    label: "Blood pressure — current (e.g. 140/90)", type: "text", placeholder: "140/90", dependsOn: { id: "healthMarkers", value: "blood pressure" } },
    { id: "bpTarget",     label: "Blood pressure — doctor's target",       type: "text", placeholder: "120/80", dependsOn: { id: "healthMarkers", value: "blood pressure" } },
    { id: "uaCurrent",    label: "Uric acid — current (mg/dL)",           type: "number", placeholder: "8.5", dependsOn: { id: "healthMarkers", value: "uric acid" } },
    { id: "uaTarget",     label: "Uric acid — doctor's target (mg/dL)",   type: "number", placeholder: "6.5", dependsOn: { id: "healthMarkers", value: "uric acid" } },
    { id: "hba1cCurrent", label: "HbA1c — current (%)",                   type: "number", placeholder: "7.5", dependsOn: { id: "healthMarkers", value: "HbA1c" } },
    { id: "hba1cTarget",  label: "HbA1c — doctor's target (%)",           type: "number", placeholder: "6.5", dependsOn: { id: "healthMarkers", value: "HbA1c" } },
    { id: "trigCurrent",  label: "Triglycerides — current (mg/dL)",       type: "number", placeholder: "200", dependsOn: { id: "healthMarkers", value: "triglycerides" } },
    { id: "trigTarget",   label: "Triglycerides — doctor's target (mg/dL)",type: "number", placeholder: "150", dependsOn: { id: "healthMarkers", value: "triglycerides" } },
    { id: "creatCurrent", label: "Creatinine — current (mg/dL)",          type: "number", placeholder: "1.5", dependsOn: { id: "healthMarkers", value: "creatinine" } },
    { id: "creatTarget",  label: "Creatinine — doctor's target (mg/dL)",  type: "number", placeholder: "1.0", dependsOn: { id: "healthMarkers", value: "creatinine" } },
    { id: "otherMarkerName",    label: "Other marker — test name", type: "text", placeholder: "e.g., hemoglobin / ALT / PSA", dependsOn: { id: "healthMarkers", value: "other" } },
    { id: "otherMarkerUnit",    label: "Unit", type: "text", placeholder: "e.g., g/dL", dependsOn: { id: "healthMarkers", value: "other" } },
    { id: "otherMarkerCurrent", label: "Current value", type: "number", placeholder: "", dependsOn: { id: "healthMarkers", value: "other" } },
    { id: "otherMarkerTarget",  label: "Doctor's target", type: "number", placeholder: "", dependsOn: { id: "healthMarkers", value: "other" } },

    // ── General fitness ──────────────────────────────────────────────────────
    { id: "fitnessNow", label: "Current fitness level", type: "multiselect",
      options: ["no exercise habit","occasional light walking","can't climb stairs without winding","light exercise 1–2x/week","moderate exercise 3x/week","already somewhat active","other"],
      dependsOn: { id: "primaryTarget", value: "General fitness level" } },
    { id: "fitnessTarget", label: "Target fitness activity by Wk 7", type: "multiselect",
      options: ["run 3km non-stop","run 5km","complete a 5K race","do 20 push-ups","do 50 push-ups","bike 50km total","swim 500m","plank 2 minutes","attend gym 5x/week","finish a fun run","other"],
      dependsOn: { id: "primaryTarget", value: "General fitness level" } },

    // ── Common fields ────────────────────────────────────────────────────────
    { id: "movement",   label: "Preferred movement / exercise", type: "multiselect",
      options: ["gym","home workout","running","walking + steps","cycling","swimming","sport","yoga / pilates","other"], defaultValue: "gym" },
    { id: "dietary",    label: "Dietary approach", type: "multiselect",
      options: ["calorie-aware","intermittent fasting","clean eating","doctor-prescribed","balanced meals","plant-based","low-carb","other"], defaultValue: "calorie-aware" },
    { id: "doctorDone", label: "Doctor check-up done?", type: "select",
      options: ["Yes — cleared to proceed","No — Wk 1 is the consultation"], defaultValue: "No — Wk 1 is the consultation" },
  ],
  smarter: (a) => {
    const targets = (a.primaryTarget || "Weight loss (kg)").split(",").map(s => s.trim());
    const hasWeight  = targets.some(t => t.includes("Weight"));
    const hasMeasure = targets.some(t => t.includes("Body"));
    const hasMedical = targets.some(t => t.includes("Medical"));
    const hasFitness = targets.some(t => t.includes("fitness"));

    // Build body measurement summaries from per-part fields
    const bodyPartsList = (a.bodyParts || "").split(",").map(s => s.trim()).filter(Boolean);
    const measures: string[] = [];
    if (bodyPartsList.includes("waist")  && a.waistCurrent  && a.waistTarget)  measures.push(`waist ${a.waistCurrent}→${a.waistTarget} cm`);
    if (bodyPartsList.includes("hips")   && a.hipsCurrent   && a.hipsTarget)   measures.push(`hips ${a.hipsCurrent}→${a.hipsTarget} cm`);
    if (bodyPartsList.includes("chest")  && a.chestCurrent  && a.chestTarget)  measures.push(`chest ${a.chestCurrent}→${a.chestTarget} cm`);
    if (bodyPartsList.includes("arms")   && a.armsCurrent   && a.armsTarget)   measures.push(`arms ${a.armsCurrent}→${a.armsTarget} cm`);
    if (bodyPartsList.includes("thighs") && a.thighsCurrent && a.thighsTarget) measures.push(`thighs ${a.thighsCurrent}→${a.thighsTarget} cm`);

    // Build medical marker summaries from per-marker fields
    const healthMarkersList = (a.healthMarkers || "").split(",").map(s => s.trim()).filter(Boolean);
    const medMarkers: string[] = [];
    if (healthMarkersList.includes("cholesterol")         && a.cholCurrent)      medMarkers.push(`cholesterol ${a.cholCurrent}→${a.cholTarget||"180"} mg/dL`);
    if (healthMarkersList.includes("blood sugar (fasting)") && a.bgCurrent)      medMarkers.push(`blood sugar ${a.bgCurrent}→${a.bgTarget||"100"} mg/dL`);
    if (healthMarkersList.includes("blood pressure")      && a.bpCurrent)        medMarkers.push(`BP ${a.bpCurrent}→${a.bpTarget||"120/80"}`);
    if (healthMarkersList.includes("uric acid")           && a.uaCurrent)        medMarkers.push(`uric acid ${a.uaCurrent}→${a.uaTarget||"6.5"} mg/dL`);
    if (healthMarkersList.includes("HbA1c")               && a.hba1cCurrent)     medMarkers.push(`HbA1c ${a.hba1cCurrent}→${a.hba1cTarget||"6.5"}%`);
    if (healthMarkersList.includes("triglycerides")       && a.trigCurrent)      medMarkers.push(`triglycerides ${a.trigCurrent}→${a.trigTarget||"150"} mg/dL`);
    if (healthMarkersList.includes("creatinine")          && a.creatCurrent)     medMarkers.push(`creatinine ${a.creatCurrent}→${a.creatTarget||"1.0"} mg/dL`);
    if (healthMarkersList.includes("other")               && a.otherMarkerName)  medMarkers.push(`${a.otherMarkerName} ${a.otherMarkerCurrent||"?"}→${a.otherMarkerTarget||"?"} ${a.otherMarkerUnit||""}`);

    const specific: string[] = [];
    if (hasWeight && a.weightCurrent && a.weightTarget)
      specific.push(`weight ${a.weightCurrent}→${a.weightTarget} kg (${Math.abs(+a.weightCurrent - +a.weightTarget)} kg loss)`);
    else if (hasWeight) specific.push("weight loss (amount set with doctor)");
    if (hasMeasure && measures.length) specific.push(measures.join("; "));
    if (hasMedical && medMarkers.length) specific.push(medMarkers.join("; "));
    if (hasFitness && a.fitnessTarget)
      specific.push(`fitness: "${a.fitnessNow||"current level"}" → "${a.fitnessTarget}"`);
    const specificGoal = specific.length ? specific.join(" + ") : "health improvement";

    const measurable: string[] = [];
    if (hasWeight) measurable.push(`Sunday weigh-in (${a.weightCurrent||"?"}→${a.weightTarget||"?"} kg)`);
    if (hasMeasure && measures.length) measurable.push(`${measures.map(m=>m.split(" ")[0]).join("+")} measured monthly`);
    if (hasMedical && medMarkers.length) measurable.push(`${medMarkers.map(m=>m.split(" ")[0]).join("+")} retested Wk 4 + Wk 7`);
    if (hasFitness) measurable.push("fitness milestone logged weekly");

    return {
      specificDetails: `Achieve ${specificGoal} through daily ${a.movement || "gym"} + ${a.dietary || "calorie-aware"} eating; doctor-cleared plan from Wk 1; 6/7 days/week for 8 weeks`,
      measurableCriteria: `${measurable.join("; ") || "weekly measurements logged"}; food/activity log 5/7 days; energy score rated weekly; doctor follow-up Wk 4`,
      achievableResources: `Doctor consultation ${a.doctorDone === "Yes — cleared to proceed" ? "complete" : "booked for Wk 1"}; ${a.movement || "gym"} accessible; ${a.dietary || "calorie-aware"} meal plan ready; LEAP accountability structure`,
      relevantAlignment: `Sustaining ${a.movement || "gym"} + ${a.dietary || "clean eating"} through Intensives, Workshops, and social events is new territory — this time it is doctor-supervised and LEAP-accountable`,
      endDate: "June 19, 2026",
      excitingMotivation: `The confidence and energy to show up fully in every area of LEAP; the version of myself at graduation photos knowing I kept the hardest commitment to my own body`,
      rewardingBenefits: `${specificGoal} achieved; maintenance week complete; doctor confirms improvement; testimony: "I became the person I committed to be"`,
    };
  },
  milestones: (a) => {
    const targets = (a.primaryTarget || "Weight loss (kg)").split(",").map(s => s.trim());
    const hasWeight  = targets.some(t => t.includes("Weight"));
    const hasMeasure = targets.some(t => t.includes("Body"));
    const hasMedical = targets.some(t => t.includes("Medical"));
    const hasFitness = targets.some(t => t.includes("fitness"));

    // Weight loss week-by-week interpolation
    const wStart = parseFloat(a.weightCurrent || "0");
    const wEnd   = parseFloat(a.weightTarget  || "0");
    const wLoss  = Math.max(0, wStart - wEnd);
    const wAt = (wk: number) => wStart > 0 && wLoss > 0
      ? `${Math.round((wStart - wLoss * ((wk - 1) / 7)) * 10) / 10} kg`
      : null;

    // Measurement interpolation from per-part pill fields
    const bpList = (a.bodyParts || "").split(",").map(s => s.trim()).filter(Boolean);
    const mSlots = [
      { part: "waist",  s: parseFloat(a.waistCurrent||"0"),  e: parseFloat(a.waistTarget||"0") },
      { part: "hips",   s: parseFloat(a.hipsCurrent||"0"),   e: parseFloat(a.hipsTarget||"0") },
      { part: "chest",  s: parseFloat(a.chestCurrent||"0"),  e: parseFloat(a.chestTarget||"0") },
      { part: "arms",   s: parseFloat(a.armsCurrent||"0"),   e: parseFloat(a.armsTarget||"0") },
      { part: "thighs", s: parseFloat(a.thighsCurrent||"0"), e: parseFloat(a.thighsTarget||"0") },
    ].filter(m => bpList.includes(m.part) && m.s > 0 && m.e > 0);

    const mAt = (wk: number) => mSlots.length
      ? mSlots.map(m => `${m.part} ${Math.round((m.s - (m.s - m.e)*((wk-1)/7))*10)/10} cm`).join(", ")
      : null;

    // Medical labels from per-marker pill fields
    const hmList = (a.healthMarkers || "").split(",").map(s => s.trim()).filter(Boolean);
    const medLabels: string[] = [];
    if (hmList.includes("cholesterol"))          medLabels.push("cholesterol");
    if (hmList.includes("blood sugar (fasting)")) medLabels.push("blood sugar");
    if (hmList.includes("blood pressure"))        medLabels.push("BP");
    if (hmList.includes("uric acid"))             medLabels.push("uric acid");
    if (hmList.includes("HbA1c"))                 medLabels.push("HbA1c");
    if (hmList.includes("triglycerides"))         medLabels.push("triglycerides");
    if (hmList.includes("creatinine"))            medLabels.push("creatinine");
    if (hmList.includes("other") && a.otherMarkerName) medLabels.push(a.otherMarkerName);

    const wkTarget = (wk: number) => {
      const parts: string[] = [];
      if (hasWeight  && wAt(wk))    parts.push(`weight ${wAt(wk)}`);
      if (hasMeasure && mAt(wk))    parts.push(mAt(wk)!);
      if (hasMedical && wk === 7 && medLabels.length)
        parts.push(`${medLabels.join("+")} targets reached`);
      if (hasFitness) parts.push(wk >= 7 ? `"${a.fitnessTarget||"target"}" achieved` : "fitness progressing");
      return parts.join(" + ") || "on track";
    };

    const baselineText = () => {
      const parts: string[] = [];
      if (hasWeight  && a.weightCurrent) parts.push(`weight: ${a.weightCurrent} kg`);
      if (hasMeasure && mSlots.length)   parts.push(mSlots.map(m=>`${m.part}: ${m.s} cm`).join(", "));
      if (hasMedical && medLabels.length) {
        const currMap: Record<string,string> = {
          "cholesterol": a.cholCurrent||"?", "blood sugar": a.bgCurrent||"?",
          "BP": a.bpCurrent||"?", "uric acid": a.uaCurrent||"?",
          "HbA1c": a.hba1cCurrent||"?", "triglycerides": a.trigCurrent||"?",
          "creatinine": a.creatCurrent||"?",
        };
        parts.push(medLabels.map(n => `${n}: ${currMap[n] ?? a.otherMarkerCurrent ?? "?"}`).join("; "));
      }
      if (hasFitness && a.fitnessNow)    parts.push(`fitness: "${a.fitnessNow}"`);
      return parts.join("; ") || "baseline";
    };

    return [
      { weekNumber:1, cumulativePercentage:WK_PCT[0],
        description:`Doctor consultation + baseline logged (${baselineText()}); schedule locked`,
        actions:[
          {text:`Doctor consultation — get clearance + confirm targets: ${baselineText()}`,days:[1]},
          {text:`Log all baselines on Day 1 in GoalGetter`,days:MON},
          {text:`Set up ${a.movement||"gym"} schedule — 6 sessions/week locked`,days:MON},
          {text:`Sunday meal prep — ${a.dietary||"calorie-aware"} plan for Wk 2`,days:SUN},
        ],
        results:[{text:`Baselines logged: ${baselineText()}`},{text:"Doctor clearance confirmed"},{text:`${a.movement||"gym"} schedule locked`}] },
      { weekNumber:2, cumulativePercentage:WK_PCT[1],
        description:`First full week — 6/7 sessions; food log 5/7 days; target: ${wkTarget(2)}`,
        actions:[
          {text:`Daily ${a.movement||"gym"} — 6/7 days`,days:DAILY},
          {text:`${a.dietary||"calorie-aware"} food log every day`,days:DAILY},
          {text:`Sunday check: ${hasWeight?"weigh-in":"measurement"} + energy score`,days:SUN},
          {text:"Meal prep for Wk 3",days:SUN},
        ],
        results:[{text:"6/7 movement sessions complete"},{text:`Check: ${wkTarget(2)}`}] },
      { weekNumber:3, cumulativePercentage:WK_PCT[2],
        description:`1st Workshop May 17 — routine survives; target: ${wkTarget(3)}`,
        actions:[
          {text:`Daily ${a.movement||"gym"} — 6/7 days`,days:DAILY},
          {text:"Pre-pack meals before 1st Workshop (May 17)",days:[5]},
          {text:"1st Workshop May 17 — stay on plan",days:[6]},
          {text:`Sunday check: ${hasWeight?"weigh-in":"measurement"} + share progress`,days:SUN},
        ],
        results:[{text:"Routine survived Workshop weekend"},{text:`Check: ${wkTarget(3)}`}] },
      { weekNumber:4, cumulativePercentage:WK_PCT[3],
        description:`2nd Intensive May 23–24 — midpoint check; target: ${wkTarget(4)}`,
        actions:[
          {text:`Daily ${a.movement||"gym"}`,days:DAILY},
          {text:"2nd Intensive May 23–24 UP BGC — protect routine; healthy options",days:[5,6]},
          {text:"Midpoint doctor/coach check-in — adjust plan if needed",days:[3]},
          {text:`Sunday: ${hasMedical?"doctor re-test scheduled?":"measurement"} + midpoint celebration`,days:SUN},
        ],
        results:[{text:`Midpoint check: ${wkTarget(4)}`},{text:"Doctor/coach check-in done"},{text:"Plan adjusted if needed"}] },
      { weekNumber:5, cumulativePercentage:WK_PCT[4],
        description:`Habit automatic — share progress with LEAP; target: ${wkTarget(5)}`,
        actions:[
          {text:`Daily ${a.movement||"gym"} — habit by now`,days:DAILY},
          {text:"Share progress in LEAP community",days:[1]},
          {text:`Sunday check: ${wkTarget(5)}`,days:SUN},
          {text:"Plan Wk 6 meals — ALC weekend coming",days:[4]},
        ],
        results:[{text:`Check: ${wkTarget(5)}`},{text:"Progress shared publicly"}] },
      { weekNumber:6, cumulativePercentage:WK_PCT[5],
        description:`ALC Jun 5–7 weekend — protect routine; target: ${wkTarget(6)}`,
        actions:[
          {text:`Daily ${a.movement||"gym"}`,days:DAILY},
          {text:"ALC Jun 5–7 SMX Aura — bring healthy snacks; maintain plan",days:[4,5,6]},
          {text:`Sunday check: ${wkTarget(6)}`,days:SUN},
          {text:"Plan final 2-week push",days:SUN},
        ],
        results:[{text:"Routine protected through ALC weekend"},{text:`Check: ${wkTarget(6)}`}] },
      { weekNumber:7, cumulativePercentage:WK_PCT[6],
        description:`TARGET HIT — ${wkTarget(7)}; AckNight Jun 14; document what worked`,
        actions:[
          {text:`Daily ${a.movement||"gym"} — final push`,days:DAILY},
          {text:"ALC 257 + 2nd Workshop + AckNight Jun 14 — celebrate health win",days:[4,5,6]},
          {text:"Document what worked — routine, meals, mindset",days:[2]},
          {text:`Sunday final measurement — confirm ${wkTarget(7)}`,days:SUN},
        ],
        results:[{text:`TARGET REACHED: ${wkTarget(7)} ✓`},{text:"Success documented"},{text:"Maintenance plan designed"}] },
      { weekNumber:8, cumulativePercentage:WK_PCT[7],
        description:`MAINTENANCE WEEK — maintain ${wkTarget(7)}; testimony ready Jun 19`,
        actions:[
          {text:`Maintain ${a.movement||"gym"} — 6/7 sessions in graduation week`,days:DAILY},
          {text:`Final measurement Jun 18 — confirm maintenance of ${wkTarget(7)}`,days:[3]},
          {text:"Graduation Jun 20–21 — arrive as the person you committed to become",days:[5,6]},
          {text:"Testimony complete by Jun 19",days:[4]},
        ],
        results:[{text:`${wkTarget(7)} maintained ✓`},{text:"Testimony ready Jun 19"},{text:"Health identity confirmed"}] },
    ];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL — Being-ness & Essence (includes Purpose/Legacy sub-option)
// ─────────────────────────────────────────────────────────────────────────────
const personalBeingness: GoalTemplate = {
  id: "personal-beingness",
  goalType: "personal",
  subType: "beingness",
  name: "Being-ness & Essence",
  description: "Embed 1–3 essence qualities into daily life through a consistent practice — BECOMING who you choose to be, not just doing a routine.",
  wheelAreaHint: "Area B: Mental Wellness · Area L: Purpose/Legacy",
  questions: [
    { id: "qualities",   label: "Essence quality/qualities to embody (pick 1–3)", type: "multiselect",
      options: ["disciplined","present","joyful","calm","confident","courageous","loving","generous","patient","grateful","focused","resilient","bold","humble","authentic","peaceful","abundant","purposeful","playful","free","other"],
      hint: "Pick 1–3 qualities. These become your daily identity target." },
    { id: "experience", label: "What do you want to experience/feel by graduation?", type: "multiselect",
      options: ["inner peace","deep confidence","real joy","clarity of purpose","emotional freedom","a sense of aliveness","total presence","unshakeable discipline","genuine connection","radical self-acceptance","other"],
      hint: "Choose what you want your inner life to feel like — not just what you want to do." },
    { id: "practice",   label: "Daily practice to build it", type: "multiselect",
      options: ["journaling","morning workout","meditation","prayer","visualization","cold shower","gratitude practice","reading","breathwork","evening reflection","other"],
      hint: "Can combine: journaling + workout + meditation. Pick all that apply." },
    { id: "timing",     label: "Morning or evening practice?", type: "select", options: ["morning","evening","both"], defaultValue: "morning" },
    { id: "currentScore",label: "Current self-score for this quality (1–10)", type: "number", placeholder: "4", defaultValue: "4" },
    { id: "targetScore", label: "Target self-score by Wk 7",                 type: "number", placeholder: "8", defaultValue: "8" },
    { id: "purpose",    label: "Include a legacy/purpose dimension?", type: "select",
      options: ["No — focus on personal being-ness only","Yes — leave a mark (family / community / work / the world)"], defaultValue: "No — focus on personal being-ness only" },
    { id: "purposeDescription", label: "What mark do you want to leave?", type: "text",
      placeholder: "e.g., be a present father, build something for my community, inspire my team",
      hint: "This becomes the legacy thread woven into your weekly milestones.",
      dependsOn: { id: "purpose", value: "Yes" } },
  ],
  smarter: (a) => ({
    specificDetails: `Embody ${a.qualities || "chosen essence quality"} through a daily ${a.timing || "morning"} practice (${a.practice || "journaling + movement"}), 6/7 days/week for 8 weeks${a.purpose?.startsWith("Yes") ? `; channel this quality into a legacy action: ${a.purposeDescription || "leave a mark on family/community"}` : ""}`,
    measurableCriteria: `Daily practice completion tracked (6/7 days target); self-score for ${a.qualities || "quality"} from ${a.currentScore || 4} → ${a.targetScore || 8} (rated every Sunday); 1 meaningful insight shared with coach weekly${a.experience ? `; target experience: ${a.experience}` : ""}`,
    achievableResources: `${a.timing || "Morning"} time block protected; journal and materials ready; LEAP accountability structure weekly; 8-week programme as the container that holds the commitment`,
    relevantAlignment: `I have tried and stopped this practice before — this time LEAP structure + public declaration makes this the first time I sustain it for 8 weeks; going from score ${a.currentScore || 4} to ${a.targetScore || 8} is new identity territory`,
    endDate: "June 19, 2026",
    excitingMotivation: `Starting every day as the ${a.qualities || "quality"} person I am becoming — not fighting myself, but being myself${a.experience ? `; experiencing ${a.experience} for real by graduation` : ""}; the moment I can say "this is who I am now" with full conviction`,
    rewardingBenefits: `Score ${a.currentScore || 4} → ${a.targetScore || 8}; 48+ days of consistent practice; proven identity shift that outlasts LEAP; testimony at graduation${a.purpose?.startsWith("Yes") ? `; legacy action complete: ${a.purposeDescription || "mark left"}` : ""}`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Declare quality publicly; design practice; first 7-day streak; baseline score ${a.currentScore || 4}`,
      actions:[{text:`Declare ${a.qualities || "your quality"} publicly — share with coach + at least 1 person`,days:MON},{text:`Set up ${a.timing || "morning"} practice: alarm, journal, materials`,days:MON},{text:`Execute practice every day — ${a.practice || "journaling + movement"}`,days:DAILY},{text:"Sunday score rating + first insight logged",days:SUN}],
      results:[{text:`Quality declared: ${a.qualities || "chosen quality"}`},{text:`7-day practice streak started`},{text:`Baseline score: ${a.currentScore || 4}`}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`12/14 days; patterns surfacing; score ${parseInt(a.currentScore||"4")+1}; first insight shared with coach`,
      actions:[{text:`Daily ${a.timing || "morning"} practice — ${a.practice || "journaling + movement"}`,days:DAILY},{text:"Journal: Where did I see this quality show up today?",days:DAILY},{text:`Coaching call: share 1 insight about ${a.qualities || "quality"} this week`,days:[2]},{text:"Sunday score + pattern reflection",days:SUN}],
      results:[{text:"12/14 days completed"},{text:`Score ${parseInt(a.currentScore||"4")+1}`},{text:"First insight shared"}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`18/21 days; identity language emerging; 1st Workshop May 17 — practice survives schedule`,
      actions:[{text:`Daily practice — ${a.practice || "journaling + movement"}`,days:DAILY},{text:"1st Workshop May 17 — practice the MORNING OF the workshop",days:[6]},{text:`Journal: "I am ${a.qualities || "quality"}" — identity statement, not just behavior`,days:DAILY},{text:"Sunday score + breakthrough noted",days:SUN}],
      results:[{text:"18/21 days complete"},{text:`Practice survived Workshop weekend`},{text:`Score ${parseInt(a.currentScore||"4")+2}`}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`Quality showed up WITHOUT effort — documented; 2nd Intensive May 23–24; score ${parseInt(a.currentScore||"4")+3}`,
      actions:[{text:`Daily practice through Intensive weekend`,days:DAILY},{text:"2nd Intensive May 23–24 UP BGC — note: which moment did your quality show up?",days:[5,6]},{text:`Journal entry: "It happened without thinking — I just WAS ${a.qualities || "quality"}"`,days:[3]},{text:"Midpoint score + coaching check-in",days:SUN}],
      results:[{text:"24/28 days complete"},{text:"Quality showed up effortlessly — documented"},{text:`Score ${parseInt(a.currentScore||"4")+3}`}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`Practice survived intensive week; resilience = identity evidence; score ${parseInt(a.currentScore||"4")+4}`,
      actions:[{text:`Daily practice — habit by now`,days:DAILY},{text:`Share how ${a.qualities || "quality"} is changing your relationships`,days:[2]},{text:"Journal: 3 situations where you chose your quality over old patterns",days:DAILY},{text:"Sunday score",days:SUN}],
      results:[{text:"30/35 days complete"},{text:`Score ${parseInt(a.currentScore||"4")+4}`}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`Quality visible to others — coach or peer names it; score ${parseInt(a.currentScore||"4")+4}+`,
      actions:[{text:`Daily practice`,days:DAILY},{text:`Ask coach or 1 friend: "Do you notice any change in me?"`,days:[2]},{text:"ALC 256 Jun 5–7 — carry your quality into the event; note how it shows up",days:[4,5,6]},{text:"Sunday score",days:SUN}],
      results:[{text:"Quality recognized externally ✓"},{text:`Score approaching ${parseInt(a.targetScore||"8")-1}`}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`Score ${a.targetScore || 8} — TARGET HIT; 2nd Workshop + AckNight Jun 14; design next-level expression`,
      actions:[{text:`Daily practice — final push to score ${a.targetScore || 8}`,days:DAILY},{text:"2nd Workshop + AckNight Jun 14 — share your being-ness testimony",days:[6]},{text:`Journal: "How will I express ${a.qualities || "quality"} beyond LEAP?"`,days:[4,5]},{text:"Sunday final score measurement",days:SUN}],
      results:[{text:`Score ${a.targetScore || 8} REACHED ✓`},{text:"Testimony shared at AckNight"},{text:"Next-level expression designed"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`48/56 days; quality documented as permanent identity; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:`Daily practice — even in graduation week`,days:DAILY},{text:"Write final testimony: 'Before LEAP → After LEAP' identity shift",days:[1,2]},{text:"Graduation Jun 20–21 — show up AS the quality",days:[5,6]},{text:"Submit testimony by Jun 19",days:[4]}],
      results:[{text:"48/56 days complete ✓"},{text:`Identity: ${a.qualities || "quality"} is permanent`},{text:"Testimony ready Jun 19"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL — Relationship: Deepening an Existing Bond
// ─────────────────────────────────────────────────────────────────────────────
const personalRelationshipDeepen: GoalTemplate = {
  id: "personal-relationship-deepen",
  goalType: "personal",
  subType: "relationship-deepen",
  name: "Deepening a Relationship",
  description: "Grow a real relationship through YOUR consistent showing up — not changing the other person, but measuring your own presence and actions.",
  wheelAreaHint: "Area C: Relationships",
  questions: [
    { id: "relation",      label: "Who is this with?", type: "select",
      options: ["partner","parent","sibling","close friend","child","mentor"], defaultValue: "partner" },
    { id: "currentScore",  label: "Current closeness score (1–10)",  type: "number", placeholder: "5", defaultValue: "5" },
    { id: "targetScore",   label: "Target closeness score",          type: "number", placeholder: "8", defaultValue: "8" },
    { id: "sessionsPerWk", label: "Quality sessions per week you commit to", type: "number", placeholder: "3", defaultValue: "3" },
    { id: "sessionLength", label: "Duration per quality session (e.g., 1 hr)", type: "text", placeholder: "1 hr", defaultValue: "1 hr" },
  ],
  smarter: (a) => ({
    specificDetails: `Show up for my ${a.relation || "partner"} with ${a.sessionsPerWk || 3} × ${a.sessionLength || "1-hr"} phone-free quality sessions/week + 1 meaningful gesture/week for 8 weeks; presence and vulnerability as the practice`,
    measurableCriteria: `Track ${a.sessionsPerWk || 3} sessions + 1 gesture/week in GoalGetter; closeness score ${a.currentScore || 5} → ${a.targetScore || 8} (rated Sunday); journal 1 meaningful moment/week`,
    achievableResources: `Schedule protected; phone-basket rule established; commitment communicated to ${a.relation || "partner"}; LEAP accountability partner for reflection; coaching call check-ins`,
    relevantAlignment: `Work and busyness have consistently eroded my presence — for the first time I am treating this relationship as a committed goal, not an intention; going from score ${a.currentScore || 5} to ${a.targetScore || 8} requires real behavior change`,
    endDate: "June 19, 2026",
    excitingMotivation: `Building the relationship I always wanted through MY actions — being the person who shows up every time, not the person who means to; the closeness I create over 8 weeks will be real and earned`,
    rewardingBenefits: `Closeness score ${a.currentScore || 5} → ${a.targetScore || 8}; ${parseInt(a.sessionsPerWk || "3") * 8 * parseInt((a.sessionLength || "1 hr").match(/\d+/)?.[0] || "1")}+ quality hours given; identity as a present and reliable person; graduation testimony`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Commitment conversation done; schedule protected; baseline ${a.currentScore || 5} logged; phone-basket rule set`,
      actions:[{text:`Have commitment conversation with ${a.relation || "partner"} — share goal and schedule`,days:MON},{text:"Set up phone-basket rule (phones away during sessions)",days:MON},{text:`Week 1: ${a.sessionsPerWk || 3} quality sessions completed`,days:MON_FRI},{text:"Sunday closeness score + 1 meaningful moment journaled",days:SUN}],
      results:[{text:`Commitment communicated`},{text:`Baseline: ${a.currentScore || 5}`},{text:`${a.sessionsPerWk || 3} sessions held`}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`${(parseInt(a.sessionsPerWk||"3")*2)} sessions; first gesture done; score ${parseInt(a.currentScore||"5")+.5}; first vulnerable share logged`,
      actions:[{text:`${a.sessionsPerWk || 3} quality sessions this week — phones away`,days:MON_FRI},{text:"Do 1 meaningful gesture (surprise, act of service, handwritten note)",days:[2]},{text:"Share 1 vulnerable feeling or thought during a session",days:[3]},{text:"Sunday score + reflection",days:SUN}],
      results:[{text:`${(parseInt(a.sessionsPerWk||"3")*2)} total sessions complete`},{text:"1 gesture done"},{text:"First vulnerable share logged"}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`1st Workshop May 17 — sessions maintained through schedule; quality deepening; score ${parseInt(a.currentScore||"5")+1}`,
      actions:[{text:`${a.sessionsPerWk || 3} sessions — protect schedule around 1st Workshop (May 17)`,days:MON_FRI},{text:"Plan 1 shared experience this week (walk, meal, outing)",days:[1,2]},{text:"1st Workshop May 17 — share your relationship goal in your testimony",days:[6]},{text:"Sunday closeness score",days:SUN}],
      results:[{text:"Sessions maintained through Workshop weekend"},{text:`Score ${parseInt(a.currentScore||"5")+1}`}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`1 meaningful shared experience; closeness ${parseInt(a.currentScore||"5")+1.5}; 2nd Intensive — relationship protected`,
      actions:[{text:`${a.sessionsPerWk || 3} sessions`,days:MON_FRI},{text:"Create 1 meaningful shared experience or memory this week",days:[3,4]},{text:"2nd Intensive May 23–24 UP BGC — tell ${a.relation || 'your person'} why this matters; send a message from the event",days:[5]},{text:"Sunday score",days:SUN}],
      results:[{text:"Shared experience created"},{text:`Closeness score ${parseInt(a.currentScore||"5")+2}`}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`Sessions through intensive week; ${a.relation || "person"} notices change; score ${parseInt(a.currentScore||"5")+2.5}`,
      actions:[{text:`${a.sessionsPerWk || 3} sessions`,days:MON_FRI},{text:`Ask ${a.relation || "your person"}: "Have you noticed anything different about us lately?"`,days:[2]},{text:"Journal: how has your own presence changed?",days:DAILY},{text:"Sunday score",days:SUN}],
      results:[{text:`${a.relation || "Person"} confirms positive change noticed ✓`},{text:`Score ${parseInt(a.currentScore||"5")+3}`}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`New shared ritual created; ALC Jun 5–7 — sessions protected; score approaching target`,
      actions:[{text:`${a.sessionsPerWk || 3} sessions — protect around ALC 256 Jun 5–7`,days:MON_FRI},{text:"Create and lock a new shared weekly ritual",days:[1]},{text:"Document the most memorable moment of the 8 weeks so far",days:[4]},{text:"Sunday score",days:SUN}],
      results:[{text:"New ritual created"},{text:"Memorable moment documented"},{text:`Score ${parseInt(a.currentScore||"5")+3.5}`}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`Closeness ${a.targetScore || 8} — TARGET HIT; 2nd Workshop + AckNight Jun 14; relationship is the testimony`,
      actions:[{text:`${a.sessionsPerWk || 3} sessions`,days:MON_FRI},{text:"AckNight Jun 14 — share your relationship journey as your testimony",days:[6]},{text:"Write: 'This is who I am now in this relationship'",days:[4,5]},{text:"Sunday final score",days:SUN}],
      results:[{text:`Closeness ${a.targetScore || 8} REACHED ✓`},{text:"Testimony shared at AckNight"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`Sessions complete; score confirmed; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:`${a.sessionsPerWk || 3} sessions — final week`,days:MON_FRI},{text:"Write final testimony: before/after in this relationship",days:[1,2]},{text:`Graduation Jun 20–21 — bring ${a.relation || "your person"} in spirit or in person`,days:[5,6]},{text:"Submit testimony by Jun 19",days:[4]}],
      results:[{text:`Final closeness score: ${a.targetScore || 8} ✓`},{text:"Testimony ready Jun 19"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PERSONAL — Becoming Partner-Ready
// ─────────────────────────────────────────────────────────────────────────────
const personalRelationshipPrepare: GoalTemplate = {
  id: "personal-relationship-prepare",
  goalType: "personal",
  subType: "relationship-prepare",
  name: "Becoming Partner-Ready",
  description: "Build the essence qualities and self-capacity for the relationship you want — 100% your actions, 100% your control, no specific target person.",
  wheelAreaHint: "Area D: Romance",
  questions: [
    { id: "prepFor",      label: "Preparing for?", type: "select",
      options: ["romantic relationship","deep friendship","family healing","rekindling a past bond"], defaultValue: "romantic relationship" },
    { id: "qualities",    label: "2–3 qualities to embody in relationship", type: "multiselect",
      options: ["loving","present","secure","patient","open","warm","committed","honest","vulnerable","playful","calm","generous","other"],
      hint: "Pick 2–3 qualities you want to BE in this relationship — these become your daily identity target." },
    { id: "currentScore", label: "Current self-score for these qualities (1–10)", type: "number", placeholder: "4", defaultValue: "4" },
    { id: "targetScore",  label: "Target score",                                   type: "number", placeholder: "8", defaultValue: "8" },
    { id: "practice",     label: "Practice(s) to build these qualities", type: "multiselect",
      placeholder: "e.g., journaling + therapy",
      options: ["journaling","therapy / counseling","social activities","mindfulness","prayer","volunteering / service","reading","support group","other"],
      hint: "Can combine multiple practices." },
    { id: "dating",       label: "Include dating as an action step?", type: "select",
      options: ["Yes — going on dates and meeting people builds real confidence","No — focus on inner work only"], defaultValue: "No — focus on inner work only" },
    { id: "datingFrequency", label: "Dates or social outings per week?", type: "number",
      placeholder: "1", defaultValue: "1",
      hint: "Even 1 outing/week over 8 weeks = 8 real-world practice opportunities.",
      dependsOn: { id: "dating", value: "Yes" } },
  ],
  smarter: (a) => ({
    specificDetails: `Embody ${a.qualities || "loving, present, secure"} in preparation for a ${a.prepFor || "romantic relationship"} through ${a.practice || "journaling + therapy"}, 5×/week for 8 weeks${a.dating?.startsWith("Yes") ? "; include dating/meeting people as active practice" : ""}`,
    measurableCriteria: `Daily practice tracked; combined quality score ${a.currentScore || 4} → ${a.targetScore || 8} (rated Sunday); coaching/therapist check-in monthly; 1 real-situation test documented weekly`,
    achievableResources: `Journal and materials ready; ${a.practice || "therapy"} sessions booked; 30 min/day dedicated; LEAP accountability structure as container; ${a.dating?.startsWith("Yes") ? "social calendar for meeting new people" : "reflection practice"}`,
    relevantAlignment: `Past patterns of dependence or avoidance have blocked me from this quality — for the first time I am building from the inside out; going from score ${a.currentScore || 4} to ${a.targetScore || 8} requires real identity work, not just wishful thinking`,
    endDate: "June 19, 2026",
    excitingMotivation: `Showing up ready for love that lasts — not desperate, not closed, but genuinely whole; the version of me at graduation who knows "I did the work" and is no longer waiting`,
    rewardingBenefits: `Score ${a.currentScore || 4} → ${a.targetScore || 8}; documented evidence of new patterns; "I am partner-ready" identity confirmed at graduation; testimony: "I built the person I want to be in relationship"`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Qualities declared; practice designed; ${a.dating?.startsWith("Yes") ? "social calendar set; " : ""}baseline ${a.currentScore || 4} logged`,
      actions:[{text:`Declare qualities publicly: "${a.qualities || "loving, present, secure"}" — share with coach`,days:MON},{text:`Start ${a.practice || "journaling"} daily — first entry`,days:MON},{text:a.dating?.startsWith("Yes") ? "Plan 2 social outings this month for meeting people" : "Book therapy/coaching session for Wk 2",days:[2]},{text:"Sunday score + reflection on old pattern",days:SUN}],
      results:[{text:`Qualities declared`},{text:`Baseline: ${a.currentScore || 4}`},{text:"Practice started"}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`10/14 sessions; past pattern identified; first insight; score ${parseInt(a.currentScore||"4")+1}`,
      actions:[{text:`Daily ${a.practice || "journaling"} — 5/7 days`,days:DAILY},{text:"Identify and name 1 old pattern from past relationships",days:[2]},{text:a.dating?.startsWith("Yes") ? "Go on 1 date or social outing — practice presence" : "Therapy/coaching session — explore pattern root",days:[3]},{text:"Sunday score",days:SUN}],
      results:[{text:"Old pattern named and documented"},{text:`Score ${parseInt(a.currentScore||"4")+1}`}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`Identity language emerging; 1st Workshop — practice survives schedule; score ${parseInt(a.currentScore||"4")+2}`,
      actions:[{text:`Daily ${a.practice || "journaling"} — "I am ${a.qualities || 'partner-ready'}" identity statement`,days:DAILY},{text:"1st Workshop May 17 — practice quality at the event itself",days:[6]},{text:a.dating?.startsWith("Yes") ? "1 social interaction this week — practice being present" : "Therapy session — progress check",days:[3]},{text:"Sunday score",days:SUN}],
      results:[{text:"Identity language emerging in journal"},{text:`Score ${parseInt(a.currentScore||"4")+2}`}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`Quality showed up in real situation — documented; score ${parseInt(a.currentScore||"4")+3}; 2nd Intensive`,
      actions:[{text:`Daily practice`,days:DAILY},{text:"2nd Intensive May 23–24 — how does your quality show up when you're surrounded by growth?",days:[5,6]},{text:"Document: 'Quality showed up without effort today — here's what happened'",days:[3]},{text:"Sunday midpoint score",days:SUN}],
      results:[{text:"Real-situation quality evidence documented ✓"},{text:`Score ${parseInt(a.currentScore||"4")+3}`}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`Pattern of reactivity interrupted; new response chosen; score ${parseInt(a.currentScore||"4")+4}`,
      actions:[{text:`Daily practice`,days:DAILY},{text:"Catch 1 old reactive pattern — choose new response — document it",days:DAILY},{text:a.dating?.startsWith("Yes") ? "1 social/dating interaction — practice your qualities in real time" : "Coaching/therapy check-in",days:[3]},{text:"Sunday score",days:SUN}],
      results:[{text:"Old pattern consciously interrupted ✓"},{text:`Score ${parseInt(a.currentScore||"4")+4}`}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`Quality recognized by others; score ${parseInt(a.targetScore||"8")-1}`,
      actions:[{text:`Daily practice`,days:DAILY},{text:`Ask coach or trusted friend: "Do you see ${a.qualities || "the qualities"} in how I carry myself now?"`,days:[2]},{text:`ALC 256 Jun 5–7 — carry your quality into the weekend`,days:[4,5,6]},{text:"Sunday score",days:SUN}],
      results:[{text:`Quality recognized externally ✓`},{text:`Score ${parseInt(a.targetScore||"8")-1}`}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`Score ${a.targetScore || 8} — EMBODIED, NOT PERFORMED; 2nd Workshop + AckNight Jun 14`,
      actions:[{text:`Daily practice`,days:DAILY},{text:"AckNight Jun 14 — share your partner-readiness journey as testimony",days:[6]},{text:"Write: 'This is who I am now — ready and whole'",days:[4,5]},{text:"Sunday final score",days:SUN}],
      results:[{text:`Score ${a.targetScore || 8} — embodied, not performed ✓`},{text:"Testimony shared at AckNight"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`Score confirmed; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:`Daily practice — even in graduation week`,days:DAILY},{text:"Write final testimony: 'I built the person I want to be in relationship'",days:[1,2]},{text:"Graduation Jun 20–21 — show up whole",days:[5,6]},{text:"Submit testimony by Jun 19",days:[4]}],
      results:[{text:`Score ${a.targetScore || 8} confirmed ✓`},{text:"Testimony: 'I am partner-ready' ✓"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — Extra Income (Employed)
// ─────────────────────────────────────────────────────────────────────────────
const professionalIncomeEmployed: GoalTemplate = {
  id: "professional-income-employed",
  goalType: "professional",
  subType: "income-employed",
  name: "Extra Income (Employed)",
  description: "Generate additional monthly income alongside employment — offer built in Wk 1, outreach starts Wk 2, consistent income by Wk 5, target hit by Wk 7.",
  wheelAreaHint: "Area J: Income/Financial",
  questions: [
    { id: "currentIncome", label: "Current monthly income (₱)", type: "number", placeholder: "30000", defaultValue: "30000" },
    { id: "targetExtra",   label: "Target EXTRA monthly income (₱)", type: "number", placeholder: "15000", defaultValue: "15000" },
    { id: "source",        label: "Extra income source", type: "multiselect",
      options: ["freelance skills","side coaching","selling products","affiliate marketing","part-time job","content creation","training/facilitation","other"], defaultValue: "freelance skills" },
    { id: "offerReady",    label: "Offer ready?", type: "select",
      options: ["Yes — I know what I'm selling and at what price","No — Wk 1 builds the offer"], defaultValue: "No — Wk 1 builds the offer" },
    { id: "offerDescription", label: "What will you sell?", type: "multiselect",
      options: ["graphic design / branding","coaching sessions","training / facilitation","baked goods / food products","handmade / craft products","photography / videography","social media management","writing / copywriting","tutoring / academic coaching","virtual assistant services","tech / IT support","other"],
      hint: "Pick all that apply — or choose 'other' to type your own.",
      dependsOn: { id: "offerReady", value: "Yes" } },
    { id: "pricePerUnit",  label: "Price per session/unit (₱)", type: "number",
      placeholder: "3000",
      dependsOn: { id: "offerReady", value: "Yes" } },
    { id: "unitsPerMonth", label: "Sessions/units per month (target)", type: "number",
      placeholder: "5",
      hint: "Projected monthly income = price × units/month",
      dependsOn: { id: "offerReady", value: "Yes" } },
    { id: "hoursPerDay",   label: "Hours available per day for this", type: "number", placeholder: "2", defaultValue: "2" },
  ],
  smarter: (a) => ({
    specificDetails: `Generate +₱${a.targetExtra || "15,000"}/month extra through ${a.source || "freelance"} work${a.offerReady?.startsWith("Yes") && a.offerDescription ? ` selling ${a.offerDescription} at ₱${a.pricePerUnit || "TBD"}/unit` : ""}; offer ${a.offerReady?.startsWith("Yes") ? "already ready" : "built in Wk 1"}; ${a.hoursPerDay || 2} hrs/day outreach starting Wk 2; daily conversations tracked`,
    measurableCriteria: `Track conversations/week (10+); proposals sent (3+/week); income logged weekly; target +₱${a.targetExtra || "15,000"}/month by Jun 19${a.pricePerUnit && a.unitsPerMonth ? `; projected: ₱${a.pricePerUnit} × ${a.unitsPerMonth} units = ₱${parseInt(a.pricePerUnit)*parseInt(a.unitsPerMonth)}/month` : ""}; income tracker in GoalGetter`,
    achievableResources: `${a.hoursPerDay || 2} hrs/day available; ${a.offerDescription ? `offer: ${a.offerDescription}` : "skills identified"}; warm network of 30+ to tap; ${a.source || "freelance"} offer ${a.offerReady?.startsWith("Yes") ? "ready now" : "built Wk 1"}; LEAP community for referrals`,
    relevantAlignment: `I have never consistently generated income outside my salary — building this extra income stream from zero is genuinely new territory and requires daily outreach discipline I haven't maintained before`,
    endDate: "June 19, 2026",
    excitingMotivation: `Proving that my earning potential isn't capped by my job title — building something that outlasts LEAP and gives me options; the moment I receive the first payment from my own effort`,
    rewardingBenefits: `+₱${a.targetExtra || "15,000"}/month active; income identity shift; "I create my own income" identity at graduation; testimony: "I built a new income stream in 8 weeks"`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Define offer: what, for whom, at what rate; 30-person warm list; pitch drafted; Wk 2 schedule locked`,
      actions:[{text:`Define offer: skill + target client + rate (₱${Math.round(parseInt(a.targetExtra||"15000")/4)}/project or /hr)`,days:MON},{text:"Build 30-person warm list — segment by likelihood to hire",days:[1,2]},{text:"Draft pitch message and conversation opener",days:[3]},{text:`Lock daily ${a.hoursPerDay || 2}-hour outreach block in calendar`,days:[4]}],
      results:[{text:"Offer defined and priced"},{text:"30-person warm list ready"},{text:"Pitch drafted"}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`10+ conversations; 3 discovery calls; first proposal sent; income tracker started`,
      actions:[{text:`${a.hoursPerDay || 2}-hr outreach block daily — 10+ conversations this week`,days:MON_FRI},{text:"Conduct 3 discovery calls — document needs, objections, budget",days:[1,2,3]},{text:"Send 1 proposal with pricing and timeline",days:[3,4]},{text:"Start income tracker — log all outreach + proposals",days:MON}],
      results:[{text:"10+ conversations held"},{text:"3 discovery calls done"},{text:"1+ proposal sent"}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`Proposals followed up; FIRST INCOME EARNED; 1st Workshop May 17`,
      actions:[{text:`Follow up all Wk 2 proposals — close or learn why not`,days:MON_FRI},{text:"Send 3 new proposals",days:[1,2,3]},{text:"1st Workshop May 17 — reflection: what's working in your outreach?",days:[6]},{text:"Log first payment — screenshot and celebrate",days:DAILY}],
      results:[{text:"First income earned ✓ — amount logged"},{text:"3+ proposals in pipeline"}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`Pipeline growing; referral ask made; 2nd Intensive May 23–24; monthly income pace building`,
      actions:[{text:`Daily ${a.hoursPerDay || 2}-hr outreach block`,days:MON_FRI},{text:"Ask every current client/gig for 1 referral name",days:[2]},{text:"2nd Intensive May 23–24 — abundance mindset; share income wins with coach",days:[5,6]},{text:"Monthly income tally: on track for ₱"+a.targetExtra+"?",days:SUN}],
      results:[{text:"Cumulative income tracked"},{text:"Referral pipeline started"},{text:"Monthly pace calculated"}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`Income stream consistent; 2 active clients/gigs; referrals activated; monthly pace building`,
      actions:[{text:`Daily outreach`,days:MON_FRI},{text:"Deliver excellent work to current clients — document testimonials",days:MON_FRI},{text:"2 active clients/gigs confirmed",days:[1]},{text:"Calculate: current monthly run rate vs. ₱"+a.targetExtra+" target",days:SUN}],
      results:[{text:"2+ active clients/gigs ✓"},{text:"Monthly run rate ≥ ₱"+Math.round(parseInt(a.targetExtra||"15000")*0.5)}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`Run rate ₱${Math.round(parseInt(a.targetExtra||"15000")*.7)}+; testimonials captured; next month pre-sold; ALC Jun 5–7`,
      actions:[{text:`Daily outreach`,days:MON_FRI},{text:"Capture 2 client testimonials for marketing",days:[2]},{text:"ALC 256 Jun 5–7 — energy investment for final push",days:[4,5,6]},{text:"Pre-sell: reach out to next month's best prospects",days:[1,2,3]}],
      results:[{text:`Run rate ₱${Math.round(parseInt(a.targetExtra||"15000")*.7)}+ ✓`},{text:"2 testimonials captured"}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`TARGET +₱${a.targetExtra || "15,000"} HIT or confirmed; 2nd Workshop + AckNight Jun 14; income model documented`,
      actions:[{text:`Daily outreach`,days:MON_FRI},{text:"AckNight Jun 14 — share your income breakthrough testimony",days:[6]},{text:"Document your income system: offer, outreach process, close method",days:[4,5]},{text:"Month-to-date income confirmation",days:SUN}],
      results:[{text:`+₱${a.targetExtra || "15,000"}/month HIT or confirmed ✓`},{text:"Income model documented"},{text:"Testimony ready"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`Month confirmed; extra income active; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:`Continue outreach and delivery`,days:MON_FRI},{text:"Final income tally — ₱"+a.targetExtra+" confirmed this month",days:[3]},{text:"Graduation Jun 20–21",days:[5,6]},{text:"Submit testimony by Jun 19",days:[4]}],
      results:[{text:`+₱${a.targetExtra || "15,000"}/month active ✓`},{text:"Testimony: 'I built a new income stream' ✓"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — Finding Income (Unemployed/Exploring)
// ─────────────────────────────────────────────────────────────────────────────
const professionalIncomeExploring: GoalTemplate = {
  id: "professional-income-exploring",
  goalType: "professional",
  subType: "income-exploring",
  name: "Finding Income (Unemployed / Exploring)",
  description: "Create your own income from zero through daily proactive effort — first income by Wk 3, consistent by Wk 5, target achieved by Wk 7.",
  wheelAreaHint: "Area J: Income/Financial",
  questions: [
    { id: "situation",    label: "Current situation", type: "select",
      options: ["unemployed","in career transition","exploring options","building a business","freelancing / self-employed"], defaultValue: "unemployed" },
    { id: "targetIncome", label: "Target monthly income (₱)", type: "number", placeholder: "25000", defaultValue: "25000" },
    { id: "opportunity",  label: "Income opportunity type(s)", type: "multiselect",
      options: ["employment (full-time / part-time)","freelance services","online business","gig work (delivery / transport)","coaching / training / facilitation","content creation (YouTube / TikTok / blog)","selling products (physical / digital)","affiliate marketing","other"],
      hint: "Pick all that apply." },
    { id: "skills",       label: "Skills/strengths to monetize", type: "multiselect",
      options: ["facilitation / training","writing / content creation","graphic design / visual arts","photography / videography","social media management","coaching / counseling","cooking / baking / food","sales / business development","tech / programming / IT","admin / virtual assistance","teaching / tutoring","other"],
      hint: "Pick all your monetizable strengths." },
    { id: "hoursPerDay",  label: "Hours per day available for this", type: "number", placeholder: "6", defaultValue: "6" },
  ],
  smarter: (a) => ({
    specificDetails: `Secure ₱${a.targetIncome || "25,000"}/month through ${a.opportunity || "freelance + coaching"} leveraging ${a.skills || "my skills"}; ${a.hoursPerDay || 6} hrs/day; first income by Wk 3; ${a.situation || "building from zero"} with full focus`,
    measurableCriteria: `Track pitches/week (5+); conversations (10+/week); applications/proposals sent (3+); income logged weekly; target ₱${a.targetIncome || "25,000"}/month by Wk 7`,
    achievableResources: `${a.hoursPerDay || 6} hrs/day; ${a.skills || "skills"} portfolio ready Wk 1; LEAP community for referrals; GoalGetter accountability; coaching support`,
    relevantAlignment: `I have never built income independently in this way — creating ₱${a.targetIncome || "25,000"}/month from zero requires daily discipline and consistency I haven't demonstrated at this level before`,
    endDate: "June 19, 2026",
    excitingMotivation: `Building MY income on MY terms — proving that I create opportunity where none existed; the moment ₱${a.targetIncome || "25,000"} appears in my account from work I sourced myself`,
    rewardingBenefits: `₱${a.targetIncome || "25,000"}/month by Jun 19; "I create my own income" identity; financial confidence; graduation testimony; foundation for ₱${Math.round(parseInt(a.targetIncome||"25000")*1.5)} next`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Skills/offer defined; portfolio updated; 5 target clients; first 5 outreach messages sent`,
      actions:[{text:`Define your offer package: "${a.skills || "skills"} → specific deliverable → rate"`,days:MON},{text:"Update portfolio/LinkedIn/resume to highlight "+a.skills,days:[1,2]},{text:"Identify 5 target clients or employers; send first 5 outreach messages",days:[3,4]},{text:`Set up ₱${a.targetIncome || "25,000"} income tracker`,days:MON}],
      results:[{text:"Offer defined and packaged"},{text:"Portfolio updated"},{text:"5 outreach messages sent"}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`10+ conversations; 3 discovery calls; 2 proposals/applications; tracker active`,
      actions:[{text:`${a.hoursPerDay || 6} hrs/day outreach — 10+ conversations`,days:MON_FRI},{text:"Conduct 3 discovery calls or job interviews",days:[1,2,3]},{text:"Send 2+ proposals or applications with pricing/requirements",days:[3,4]},{text:"Income tracker: log all activity",days:SUN}],
      results:[{text:"10+ conversations held"},{text:"3 calls done"},{text:"2 proposals sent"}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`FIRST INCOME EARNED (even small); 1st Workshop May 17; model being validated`,
      actions:[{text:`Follow up all proposals — close or learn why not`,days:MON_FRI},{text:"Send 3 new proposals",days:[1,2,3]},{text:"1st Workshop May 17 — reflect: what income activity has worked best?",days:[6]},{text:"Log first payment — no amount too small",days:DAILY}],
      results:[{text:"First income earned ✓ — amount logged"},{text:"Model validation in progress"}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`3+ income sources in pipeline; 2nd Intensive May 23–24; abundance mindset deepened`,
      actions:[{text:`Daily ${a.hoursPerDay || 6}-hr outreach`,days:MON_FRI},{text:"2nd Intensive May 23–24 — share income progress with coach; abundance mindset",days:[5,6]},{text:"3+ different income sources in active pipeline",days:[3]},{text:"Monthly pace calculation: on track for ₱"+a.targetIncome+"?",days:SUN}],
      results:[{text:"3+ income sources in pipeline"},{text:"Monthly pace calculated"}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`Consistent income — first regular client/gig; referrals activated`,
      actions:[{text:`Daily outreach`,days:MON_FRI},{text:"First recurring client or gig locked — deliver exceptional work",days:MON_FRI},{text:"Ask every client for 1 referral",days:[2]},{text:"Eliminate non-starters from pipeline; focus on top 3",days:[4]}],
      results:[{text:"1+ recurring income source active ✓"},{text:"Referral ask made to all clients"}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`Monthly pace ₱${Math.round(parseInt(a.targetIncome||"25000")*.6)}+; offer refined; ALC Jun 5–7 energy`,
      actions:[{text:`Daily outreach`,days:MON_FRI},{text:"Refine offer based on what's closing — drop what isn't",days:[1,2]},{text:"ALC 256 Jun 5–7 SMX Aura — bring your hustle energy into the room",days:[4,5,6]},{text:"Month-to-date tally",days:SUN}],
      results:[{text:`Monthly pace ₱${Math.round(parseInt(a.targetIncome||"25000")*.6)}+ ✓`},{text:"Offer refined"}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`TARGET ₱${a.targetIncome || "25,000"} HIT OR CONFIRMED; 2nd Workshop + AckNight Jun 14`,
      actions:[{text:`Daily outreach`,days:MON_FRI},{text:"AckNight Jun 14 — share your income creation testimony",days:[6]},{text:"Document your full income-creation process",days:[4,5]},{text:"Month income confirmation",days:SUN}],
      results:[{text:`₱${a.targetIncome || "25,000"}/month HIT or confirmed ✓`},{text:"Testimony ready"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`Income secured; work rhythm established; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:`Continue delivery and outreach`,days:MON_FRI},{text:"Final income tally",days:[3]},{text:"Graduation Jun 20–21",days:[5,6]},{text:"Submit testimony by Jun 19",days:[4]}],
      results:[{text:`₱${a.targetIncome || "25,000"}/month active ✓`},{text:"Testimony: 'I create my own income' ✓"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — Career Being-ness (Career Identity)
// ─────────────────────────────────────────────────────────────────────────────
const professionalCareerBeingness: GoalTemplate = {
  id: "professional-career-beingness",
  goalType: "professional",
  subType: "career-beingness",
  name: "Career Identity (Professional Being-ness)",
  description: "Embody the professional qualities of the role you want — 100% your actions, not dependent on a promotion or anyone else's decision.",
  wheelAreaHint: "Area G: Career/Work · Area K: Professional Growth",
  questions: [
    { id: "roleTarget",  label: "Professional role/identity to grow into", type: "multiselect",
      options: ["manager","senior contributor / specialist","team lead","project lead","entrepreneur / business owner","trusted expert / go-to person","executive / director","thought leader / speaker","mentor / coach","creative professional","other"],
      hint: "Pick the role(s) that describe who you are becoming." },
    { id: "qualities",   label: "2–3 essence qualities of that role", type: "multiselect",
      options: ["reliable","strategic","visionary","decisive","collaborative","empathetic","systematic","innovative","proactive","accountable","organized","inspiring","calm under pressure","solution-focused","other"],
      hint: "Pick 2–3. These become the qualities you consciously embody daily at work." },
    { id: "currentScore",label: "Current self-score (1–10)", type: "number", placeholder: "5", defaultValue: "5" },
    { id: "targetScore", label: "Target score",              type: "number", placeholder: "8", defaultValue: "8" },
    { id: "visibleAction",label:"Visible action(s) to showcase these qualities", type: "multiselect",
      options: ["lead a project from start to finish","speak up / contribute in at least 3 meetings/week","mentor or coach 1 colleague","present to leadership or a group","volunteer for a stretch assignment","drive a team initiative","document and share a process improvement","other"],
      hint: "Pick 1–3 visible actions you will do every week." },
  ],
  smarter: (a) => ({
    specificDetails: `Embody ${a.qualities || "chosen professional qualities"} through ${a.visibleAction || "leading a project + contributing in meetings"} for 8 weeks; show up as a ${a.roleTarget || "senior professional"} in every interaction`,
    measurableCriteria: `Track ${a.visibleAction || "project milestones + meeting contributions"}; self-score ${a.currentScore || 5} → ${a.targetScore || 8} (rated Sunday); peer or coach observation weekly; 1 visible leadership moment documented per week`,
    achievableResources: `Project or meeting access confirmed; ${a.visibleAction || "visibility commitment"} mapped; LEAP coaching for reflection; commitment to speak up even when uncomfortable`,
    relevantAlignment: `Imposter syndrome has held me back — I have the skills of a ${a.roleTarget || "senior professional"} but haven't been playing at that level; going from score ${a.currentScore || 5} to ${a.targetScore || 8} requires showing up consistently, not waiting for permission`,
    endDate: "June 19, 2026",
    excitingMotivation: `Being the ${a.roleTarget || "professional"} I KNOW I can be — not waiting for a promotion to start acting like one; the day my team or peers see me as a ${a.qualities?.split(",")[0]?.trim() || "leader"} because I earned it`,
    rewardingBenefits: `Score ${a.currentScore || 5} → ${a.targetScore || 8}; ${a.visibleAction || "project"} delivered; "I lead like a ${a.roleTarget || "professional"}" identity confirmed; graduation testimony; advancement conversation now has substance`,
  }),
  milestones: (a) => [
    { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Qualities declared; ${a.visibleAction || "project + visibility action"} committed; baseline ${a.currentScore || 5}; first week of speaking up`,
      actions:[{text:`Declare publicly: "I am becoming ${a.roleTarget || 'a senior professional'}"`,days:MON},{text:`Commit to ${a.visibleAction || "leading 1 project"} — lock schedule`,days:MON},{text:"Speak up or lead at minimum once every day",days:MON_FRI},{text:"Sunday score + 1 leadership moment documented",days:SUN}],
      results:[{text:`Baseline: ${a.currentScore || 5}`},{text:"Visibility commitment locked"}] },
    { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`Visible contributions; ${a.visibleAction?.includes("project") ? "project Wk 1 milestone done" : "first week tracked"}; score ${parseInt(a.currentScore||"5")+.5}`,
      actions:[{text:`Daily visible contribution: ${a.visibleAction || "lead meeting, speak up, mentor"}`,days:MON_FRI},{text:"Document 3 leadership moments from this week",days:[5]},{text:"Seek feedback from 1 peer or mentor",days:[3]},{text:"Sunday score",days:SUN}],
      results:[{text:"3 leadership moments documented"},{text:`Score ${parseInt(a.currentScore||"5")+ .5}`}] },
    { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`Team feedback received; 1st Workshop — leadership lens applied; score ${parseInt(a.currentScore||"5")+1}`,
      actions:[{text:`Daily visible contribution`,days:MON_FRI},{text:"Ask 1 team member for honest professional feedback",days:[2]},{text:"1st Workshop May 17 — apply your leadership lens to LEAP sessions",days:[6]},{text:"Sunday score",days:SUN}],
      results:[{text:"External feedback received"},{text:`Score ${parseInt(a.currentScore||"5")+1}`}] },
    { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`Key decision made independently; score ${parseInt(a.currentScore||"5")+2}; 2nd Intensive — identity deepened`,
      actions:[{text:`Daily visible contribution`,days:MON_FRI},{text:"Make 1 significant professional decision independently — document it",days:[2,3]},{text:"2nd Intensive May 23–24 — what does your leadership identity feel like?",days:[5,6]},{text:"Sunday score",days:SUN}],
      results:[{text:"Independent decision made and documented ✓"},{text:`Score ${parseInt(a.currentScore||"5")+2}`}] },
    { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`Progress visible to others; recognized as ${a.qualities?.split(",")[0]?.trim() || "reliable"}; score ${parseInt(a.currentScore||"5")+3}`,
      actions:[{text:`Daily visible contribution`,days:MON_FRI},{text:"Ask manager or peer: 'Have you noticed a change in my leadership presence?'",days:[3]},{text:"Journal: 3 situations where you led with confidence",days:DAILY},{text:"Sunday score",days:SUN}],
      results:[{text:`Recognized as ${a.qualities?.split(",")[0]?.trim() || "reliable"} by others ✓`},{text:`Score ${parseInt(a.currentScore||"5")+3}`}] },
    { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`Score 7+; near completion of ${a.visibleAction || "project"}; mentor/teach 1 person`,
      actions:[{text:`Daily visible contribution`,days:MON_FRI},{text:"Mentor or teach 1 colleague — share what you've learned",days:[2,3]},{text:`${a.visibleAction?.includes("project") ? "Project approaching completion — document wins" : "Document visible leadership wins"}`,days:[4]},{text:"Sunday score",days:SUN}],
      results:[{text:"Mentored 1 colleague ✓"},{text:`Score ${parseInt(a.currentScore||"5")+3.5}`}] },
    { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`${a.visibleAction?.includes("project") ? "PROJECT COMPLETE;" : "TARGET MET;"} score ${a.targetScore || 8}; 2nd Workshop + AckNight testimony`,
      actions:[{text:`${a.visibleAction?.includes("project") ? "Complete project deliverable" : "Final visible leadership action"}`,days:MON_FRI},{text:"AckNight Jun 14 — share your professional identity journey as testimony",days:[6]},{text:"Write: 'This is the professional I am now'",days:[4,5]},{text:"Sunday final score",days:SUN}],
      results:[{text:`${a.visibleAction || "Goal"} COMPLETE ✓`},{text:`Score ${a.targetScore || 8} HIT ✓`},{text:"Testimony shared at AckNight"}] },
    { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`Score confirmed; process documented; testimony ready Jun 19; Graduation Jun 20–21`,
      actions:[{text:`Maintain visible leadership contributions`,days:MON_FRI},{text:"Document your leadership process for replication",days:[1,2]},{text:"Graduation Jun 20–21",days:[5,6]},{text:"Submit testimony by Jun 19",days:[4]}],
      results:[{text:`Score ${a.targetScore || 8} confirmed ✓`},{text:"Testimony: 'I lead like a "+a.roleTarget+"' ✓"}] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFESSIONAL — Skill Building with Culminating Activity
// ─────────────────────────────────────────────────────────────────────────────
const professionalSkills: GoalTemplate = {
  id: "professional-skills",
  goalType: "professional",
  subType: "skills",
  name: "Skill Building with Culminating Activity",
  description: "Build a creative or professional skill over 8 weeks — capped by a real showcase event that proves the skill is real.",
  wheelAreaHint: "Area I: Skills",
  questions: [
    { id: "skill",         label: "Skill to build", type: "multiselect",
      options: ["baking / cooking","dancing","singing / vocal performance","painting / drawing / visual art","photography","public speaking / storytelling","playing an instrument","graphic design","video editing / filmmaking","gardening / landscaping","driving","language learning","writing / creative writing","pottery / crafts","other"],
      hint: "Pick 1 main skill (or combine related ones)." },
    { id: "culmination",   label: "Culminating activity / showcase event", type: "multiselect",
      options: ["taste feast / dinner for friends","recital or live performance","art exhibit / gallery showing","photography exhibit or portfolio launch","language conversation demo","public speech or presentation","driving test / road test","song recording or cover release","video project premiere","garden open house / walkthrough","craft / product launch","other"],
      hint: "Pick 1 event that proves the skill is real — this is your graduation milestone." },
    { id: "sessionsPerWk", label: "Practice sessions per week", type: "number", placeholder: "4", defaultValue: "4" },
    { id: "sessionLength", label: "Duration per session (e.g., 1.5 hr)", type: "text", placeholder: "1.5 hr", defaultValue: "1.5 hr" },
    { id: "currentLevel",  label: "Current level", type: "select",
      options: ["complete beginner","some basics","intermediate","advanced but rusty"], defaultValue: "complete beginner" },
  ],
  smarter: (a) => ({
    specificDetails: `Build ${a.skill || "chosen skill"} from ${a.currentLevel || "beginner"} to competent through ${a.sessionsPerWk || 4} × ${a.sessionLength || "1.5-hr"} sessions/week for 8 weeks; culminate in ${a.culmination || "showcase event"} by Wk 8`,
    measurableCriteria: `Track sessions completed/week (${a.sessionsPerWk || 4} target); complexity/quality score 1→5 rated every 2 weeks; external evaluation by Wk 7 (taste test / rehearsal audience); ${a.culmination || "showcase"} hosted by Jun 19`,
    achievableResources: `Equipment and materials accessible; ${a.sessionsPerWk || 4}-session weekly schedule locked; progression plan from Wk 1; accountability partner for check-ins; LEAP structure as the commitment container`,
    relevantAlignment: `I have never built ${a.skill || "this skill"} beyond dabbling — committing to ${parseInt(a.sessionsPerWk || "4") * 8} sessions and a real ${a.culmination || "showcase"} is the first time I treat this as a serious goal, not a hobby attempt`,
    endDate: "June 19, 2026",
    excitingMotivation: `The look on my guests' / audience's faces during ${a.culmination || "the showcase"}; proving skill from zero in 8 weeks; showing up at graduation with concrete, shareable, tangible proof`,
    rewardingBenefits: `${parseInt(a.sessionsPerWk || "4") * 8}+ sessions completed; ${a.culmination || "showcase"} hosted; 3 signature pieces / skills mastered; graduation testimony: "I proved I can build anything I commit to"`,
  }),
  milestones: (a) => {
    const sess = parseInt(a.sessionsPerWk || "4");
    return [
      { weekNumber:1, cumulativePercentage:WK_PCT[0], description:`Equipment ready; skill progression mapped; first practice sessions; baseline logged`,
        actions:[{text:`Gather all equipment/materials for ${a.skill || "skill"}`,days:MON},{text:"Map 8-week progression: beginner → intermediate → showcase level",days:MON},{text:`First ${Math.min(sess,3)} practice sessions — basics only`,days:[1,3,5]},{text:"Log baseline: what can you do day 1?",days:MON}],
        results:[{text:"Equipment/materials ready"},{text:"8-week progression plan mapped"},{text:`First ${Math.min(sess,3)} sessions done`}] },
      { weekNumber:2, cumulativePercentage:WK_PCT[1], description:`${sess*2} sessions; skill improving; first external taste/test; quality score 1.5→2`,
        actions:[{text:`${sess} sessions this week`,days:MON_FRI},{text:`Practice 3+ variations / techniques in ${a.skill || "skill"}`,days:MON_FRI},{text:"First household or self evaluation — rate quality 1-5",days:[6]},{text:"Sunday: what improved? what needs more work?",days:SUN}],
        results:[{text:`${sess*2} total sessions complete`},{text:"Quality score 1.5–2"}] },
      { weekNumber:3, cumulativePercentage:WK_PCT[2], description:`${sess*3} sessions; first external feedback from friend/family; 1st Workshop May 17`,
        actions:[{text:`${sess} sessions`,days:MON_FRI},{text:"Share your skill with 1 friend/family member — get honest feedback",days:[4]},{text:"1st Workshop May 17 — practice the morning of; bring skill energy into LEAP",days:[6]},{text:"Quality score update",days:SUN}],
        results:[{text:`${sess*3} total sessions`},{text:"External feedback received"},{text:"Quality score 2.5"}] },
      { weekNumber:4, cumulativePercentage:WK_PCT[3], description:`${sess*4} sessions; first complex technique attempted; 2nd Intensive May 23–24; score 3`,
        actions:[{text:`${sess} sessions — attempt first complex technique`,days:MON_FRI},{text:"2nd Intensive May 23–24 UP BGC — keep practice going; midpoint celebration",days:[5,6]},{text:"Document: what breakthrough happened this week?",days:[4]},{text:"Quality score 3",days:SUN}],
        results:[{text:`${sess*4} total sessions`},{text:"Complex technique attempted"},{text:"Quality score 3"}] },
      { weekNumber:5, cumulativePercentage:WK_PCT[4], description:`3 techniques reliably consistent; mini showcase for 3 people; score 3.5`,
        actions:[{text:`${sess} sessions — focus on consistency over complexity`,days:MON_FRI},{text:`Mini showcase: demonstrate skill for 3 people; get feedback`,days:[6]},{text:"Identify 3 signature pieces/techniques for the culmination",days:[4]},{text:"Quality score 3.5",days:SUN}],
        results:[{text:`Mini showcase done ✓`},{text:"3 signature pieces identified"},{text:"Quality score 3.5"}] },
      { weekNumber:6, cumulativePercentage:WK_PCT[5], description:`Signature pieces identified; 5+ people preview; ALC Jun 5–7; score 4`,
        actions:[{text:`${sess} sessions`,days:MON_FRI},{text:`Preview your skill for 5+ people — incorporate feedback`,days:[4]},{text:"ALC 256 Jun 5–7 — bring something from your skill to share if possible",days:[4,5,6]},{text:"Quality score 4",days:SUN}],
        results:[{text:"5+ person preview done"},{text:"Feedback incorporated"},{text:"Quality score 4"}] },
      { weekNumber:7, cumulativePercentage:WK_PCT[6], description:`CULMINATION REHEARSAL — full run-through; guests/audience confirmed; 2nd Workshop + AckNight Jun 14; score 4.5`,
        actions:[{text:`${sess} sessions — full rehearsal with all planned elements`,days:MON_FRI},{text:`Rehearsal: run full ${a.culmination || "showcase"} from start to finish`,days:[4]},{text:"AckNight Jun 14 — share skill journey as testimony",days:[6]},{text:"Quality score 4.5",days:SUN}],
        results:[{text:`Full rehearsal complete ✓`},{text:`Guests confirmed for ${a.culmination || "showcase"}`},{text:"Testimony shared at AckNight"}] },
      { weekNumber:8, cumulativePercentage:WK_PCT[7], description:`${(a.culmination || "SHOWCASE").toUpperCase()} HOSTED; photos/evidence; testimony ready Jun 19; Graduation Jun 20–21`,
        actions:[{text:`Final practice sessions before ${a.culmination || "showcase"}`,days:[1,2]},{text:`HOST ${(a.culmination || "showcase").toUpperCase()} — fully commit, enjoy it`,days:[3]},{text:"Photo/video evidence captured",days:[3]},{text:"Write testimony; Graduation Jun 20–21",days:[4,5,6]}],
        results:[{text:`${a.culmination || "Showcase"} HOSTED ✓`},{text:"Evidence documented"},{text:"Testimony: 'I built this skill from zero' ✓"}] },
    ];
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Export all templates
// ─────────────────────────────────────────────────────────────────────────────
export const GOAL_TEMPLATES: GoalTemplate[] = [
  enrollmentStandard,
  enrollmentHighVolume,
  personalHealth,
  personalBeingness,
  personalRelationshipDeepen,
  personalRelationshipPrepare,
  professionalIncomeEmployed,
  professionalIncomeExploring,
  professionalCareerBeingness,
  professionalSkills,
];

// Sub-category selection → template ID mapping
export const SUBCATEGORY_TO_TEMPLATE: Record<string, string> = {
  "enrollment":                  "enrollment-flex-alc",
  "enrollment-high":             "enrollment-high-volume",
  "health":                      "personal-health",
  "beingness":                   "personal-beingness",
  "relationship-deepen":         "personal-relationship-deepen",
  "relationship-prepare":        "personal-relationship-prepare",
  "income-employed":             "professional-income-employed",
  "income-exploring":            "professional-income-exploring",
  "career-beingness":            "professional-career-beingness",
  "skills":                      "professional-skills",
};

// Wheel area → suggested template(s)
export const WHEEL_AREA_SUGGESTIONS: Record<string, string[]> = {
  "A": ["personal-health"],
  "B": ["personal-beingness"],
  "C": ["personal-relationship-deepen"],
  "D": ["personal-relationship-prepare"],
  "E": ["personal-beingness","personal-relationship-deepen"],
  "F": ["personal-beingness","personal-relationship-deepen"],
  "G": ["professional-career-beingness"],
  "H": ["professional-career-beingness"],
  "I": ["professional-skills"],
  "J": ["professional-income-employed","professional-income-exploring"],
  "K": ["professional-career-beingness","professional-skills"],
  "L": ["personal-beingness"],
};
