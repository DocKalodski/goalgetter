export interface EssenceQuality {
  name: string;
  definition: string;
}

export interface EssenceCategory {
  label: string;
  color: string;
  headerColor: string;
  qualities: EssenceQuality[];
}

export const ESSENCE_CATEGORIES: EssenceCategory[] = [
  {
    label: "Character & Integrity",
    color: "border-blue-400 dark:border-blue-500",
    headerColor: "text-blue-700 dark:text-blue-400",
    qualities: [
      { name: "HONEST",    definition: "Speaking truth even when difficult" },
      { name: "INTEGRITY", definition: "Maintaining strong moral principles and values" },
      { name: "AUTHENTIC", definition: "Showing true self in all situations" },
      { name: "HUMBLE",    definition: "Recognizing everyone has value and worth" },
      { name: "WORTHY",    definition: "Knowing own value while respecting others" },
    ],
  },
  {
    label: "Emotional Intelligence",
    color: "border-purple-400 dark:border-purple-500",
    headerColor: "text-purple-700 dark:text-purple-400",
    qualities: [
      { name: "EMPATHETIC",    definition: "Understanding and feeling others' emotions" },
      { name: "COMPASSIONATE", definition: "Showing kindness and mercy to all people" },
      { name: "GENTLE",        definition: "Handling people and situations with care" },
      { name: "PATIENT",       definition: "Allowing things to unfold in their right time" },
      { name: "WISE",          definition: "Using good judgment and learning from experience" },
    ],
  },
  {
    label: "Personal Power",
    color: "border-amber-400 dark:border-amber-500",
    headerColor: "text-amber-700 dark:text-amber-400",
    qualities: [
      { name: "EMPOWERED",  definition: "Taking control of own life and choices" },
      { name: "COURAGEOUS", definition: "Facing challenges with strength and bravery" },
      { name: "POWERFUL",   definition: "Using strength to help others and create change" },
      { name: "CONFIDENT",  definition: "Believing in own abilities and feeling secure" },
      { name: "SUCCESSFUL", definition: "Achieving goals through positive persistent action" },
    ],
  },
  {
    label: "Relationships & Connection",
    color: "border-rose-400 dark:border-rose-500",
    headerColor: "text-rose-700 dark:text-rose-400",
    qualities: [
      { name: "LOVING",     definition: "Expressing deep care and affection for others" },
      { name: "CARING",     definition: "Showing deep concern for others' wellbeing" },
      { name: "TRUSTING",   definition: "Having faith in others' good intentions" },
      { name: "RESPECTFUL", definition: "Honoring the dignity of all people" },
      { name: "ACCEPTING",  definition: "Welcoming differences and embracing all people" },
    ],
  },
  {
    label: "Communication & Expression",
    color: "border-teal-400 dark:border-teal-500",
    headerColor: "text-teal-700 dark:text-teal-400",
    qualities: [
      { name: "EXPRESSIVE", definition: "Communicating thoughts and feelings clearly" },
      { name: "OPEN",       definition: "Being receptive to new experiences and ideas" },
      { name: "INSPIRING",  definition: "Motivating others to reach their excellence" },
      { name: "BRAVE",      definition: "Having courage to speak up and take risks" },
      { name: "PERSISTENT", definition: "Continuing despite obstacles and setbacks" },
    ],
  },
  {
    label: "Service & Generosity",
    color: "border-green-400 dark:border-green-500",
    headerColor: "text-green-700 dark:text-green-400",
    qualities: [
      { name: "GIVING",      definition: "Sharing generously with others from the heart" },
      { name: "ABUNDANT",    definition: "Living with plenty, believing there's enough for everyone" },
      { name: "RESPONSIBLE", definition: "Owning actions and decisions, taking accountability" },
      { name: "COMMITTED",   definition: "Staying dedicated to goals and relationships" },
      { name: "COOPERATIVE", definition: "Working well with others for mutual success" },
    ],
  },
  {
    label: "Professional Excellence",
    color: "border-indigo-400 dark:border-indigo-500",
    headerColor: "text-indigo-700 dark:text-indigo-400",
    qualities: [
      { name: "RELIABLE",    definition: "Being someone others can count on consistently" },
      { name: "PUNCTUAL",    definition: "Respecting others' time and valuing commitments" },
      { name: "HARDWORKING", definition: "Putting effort into everything you do" },
      { name: "FOCUSED",     definition: "Staying concentrated on goals and priorities" },
      { name: "INNOVATIVE",  definition: "Bringing fresh ideas and creative solutions" },
    ],
  },
  {
    label: "Healing & Growth",
    color: "border-cyan-400 dark:border-cyan-500",
    headerColor: "text-cyan-700 dark:text-cyan-400",
    qualities: [
      { name: "FORGIVING",  definition: "Letting go of hurt and anger for inner peace" },
      { name: "VULNERABLE", definition: "Being willing to show your true self & admit weaknesses" },
      { name: "PEACEFUL",   definition: "Promoting harmony and tranquility in environment" },
      { name: "GRATEFUL",   definition: "Appreciating what you have and recognizing blessings" },
      { name: "RESILIENT",  definition: "Bouncing back from difficulties and growing stronger" },
    ],
  },
  {
    label: "Joy & Passion",
    color: "border-yellow-400 dark:border-yellow-500",
    headerColor: "text-yellow-700 dark:text-yellow-400",
    qualities: [
      { name: "JOYFUL",     definition: "Living with happiness and celebrating life" },
      { name: "PASSIONATE", definition: "Pursuing what matters with intensity and enthusiasm" },
      { name: "POSITIVE",   definition: "Maintaining optimistic outlook, seeing possibilities" },
      { name: "CREATIVE",   definition: "Bringing new ideas and beautiful solutions to life" },
      { name: "VIBRANT",    definition: "Living with energy, enthusiasm and vitality" },
    ],
  },
];

export const CUSTOM_QUALITIES_KEY = "gg_custom_essence_qualities";

export function getAllQualities(custom: EssenceQuality[] = []): EssenceQuality[] {
  return [...ESSENCE_CATEGORIES.flatMap(c => c.qualities), ...custom];
}
