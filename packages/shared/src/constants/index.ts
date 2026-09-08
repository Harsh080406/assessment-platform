import { StudentArchetype } from "../types/index.js";

export const PSYCHOMETRIC_MODELS = {
  BIG_FIVE: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"],
  HOLLAND_RIASEC: ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"],
  STANDARDIZED_VALIDITY_SCORE: 0.934,
};

export const CORE_ARCHETYPES: Record<string, StudentArchetype> = {
  creative_strategist: {
    id: "creative_strategist",
    code: "#04",
    name: "The Creative Strategist",
    emoji: "🎨",
    tagline: "High divergent ideation + systems execution discipline.",
    description: "Flourishes where human emotion, visual storytelling, and technological systems meet. Sees lateral connections that specialists miss.",
    radarPoints: "80,24 135,60 115,125 40,118 28,60",
    dominantTraits: ["Divergent Thinking", "Spatial Intuition", "Cross-Disciplinary Synthesis"],
    recommendedCareers: ["spatial-designer", "ai-engineer", "fintech-lead"],
    compatibilityScore: 98,
  },
  systems_architect: {
    id: "systems_architect",
    code: "#07",
    name: "The Systems Architect",
    emoji: "⚡",
    tagline: "Deep structural deduction + first-principles scaling logic.",
    description: "Built for fundamental computational logic, algorithmic modeling, and stress-testing complex topologies under ambiguity.",
    radarPoints: "80,18 138,50 100,128 30,110 24,52",
    dominantTraits: ["Algorithmic Rigor", "Fault Isolation", "Modular Scalability"],
    recommendedCareers: ["ai-engineer", "clean-energy", "tech-law"],
    compatibilityScore: 96,
  },
  venture_catalyst: {
    id: "venture_catalyst",
    code: "#02",
    name: "The Venture Catalyst",
    emoji: "🚀",
    tagline: "Opportunity recognition + commercial execution velocity.",
    description: "Natural entrepreneurial drive with an innate sense for resource mobilization, team leadership, and market momentum.",
    radarPoints: "80,28 138,65 110,120 45,115 25,62",
    dominantTraits: ["Commercial Foresight", "Persuasive Rhetoric", "Calculated Risk"],
    recommendedCareers: ["fintech-lead", "spatial-designer", "tech-law"],
    compatibilityScore: 97,
  },
  bio_social_visionary: {
    id: "bio_social_visionary",
    code: "#09",
    name: "The Bio-Social Visionary",
    emoji: "🧬",
    tagline: "Interpersonal resonance + compassionate empirical investigation.",
    description: "Deeply values human health, mental flourishing, and societal equity. Combines empirical science with profound interpersonal intuition.",
    radarPoints: "80,30 125,68 118,122 38,124 30,65",
    dominantTraits: ["Empathetic Care", "Biological Insight", "Moral Conviction"],
    recommendedCareers: ["neuro-psych", "clean-energy", "tech-law"],
    compatibilityScore: 95,
  },
};
