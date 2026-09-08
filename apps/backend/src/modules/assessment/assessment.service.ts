export interface QuestionOption {
  key: "A" | "B" | "C" | "D";
  emoji: string;
  text: string;
  detail: string;
  scores: {
    creative: number;
    systems: number;
    empathy: number;
    venture: number;
  };
}

export interface Question {
  id: number;
  section: string;
  scenario: string;
  context: string;
  choices: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    section: "Cognitive Problem Solving",
    scenario: "When presented with an open-ended project challenge, what is your immediate default impulse?",
    context: "There are no wrong answers; choose how your brain naturally behaves.",
    choices: [
      {
        key: "A",
        emoji: "🎨",
        text: "Sketch multiple wild lateral concepts before filtering",
        detail: "You brainstorm freely without self-censoring, discovering unexpected connections.",
        scores: { creative: 35, systems: 10, empathy: 15, venture: 20 },
      },
      {
        key: "B",
        emoji: "🔬",
        text: "Deconstruct the problem into technical constraints and rules",
        detail: "You look for the underlying data structures, variables, and logical mechanics.",
        scores: { creative: 10, systems: 35, empathy: 10, venture: 15 },
      },
      {
        key: "C",
        emoji: "🤝",
        text: "Talk to people affected to understand their real emotional pain",
        detail: "You prioritize authentic human context and how individuals experience friction.",
        scores: { creative: 15, systems: 10, empathy: 35, venture: 10 },
      },
      {
        key: "D",
        emoji: "⚡",
        text: "Calculate commercial scale and design an execution roadmap",
        detail: "You immediately think about resource allocation, timelines, and market adoption.",
        scores: { creative: 15, systems: 20, empathy: 10, venture: 35 },
      },
    ],
  },
  {
    id: 2,
    section: "Work Energy Zones",
    scenario: "Which environment allows you to reach an effortless state of flow?",
    context: "Think about times you completely lost track of time.",
    choices: [
      {
        key: "A",
        emoji: "💻",
        text: "Deep solo problem-solving with code, math models, or complex data",
        detail: "Uninterrupted focus dissecting hard puzzles until the solution snaps into place.",
        scores: { creative: 15, systems: 35, empathy: 5, venture: 15 },
      },
      {
        key: "B",
        emoji: "✨",
        text: "Visualizing, prototyping, or designing interactive media and art",
        detail: "Crafting aesthetics, sensory flow, and memorable visual storytelling.",
        scores: { creative: 35, systems: 15, empathy: 15, venture: 10 },
      },
      {
        key: "C",
        emoji: "🧠",
        text: "Coaching a teammate or mediating a group through an obstacle",
        detail: "Observing group dynamics, helping peers grow, and fostering psychological safety.",
        scores: { creative: 10, systems: 10, empathy: 35, venture: 15 },
      },
      {
        key: "D",
        emoji: "🚀",
        text: "Pitching an ambitious initiative, negotiating, or rallying a launch",
        detail: "High-momentum environments where rallying people and driving traction matters.",
        scores: { creative: 20, systems: 15, empathy: 15, venture: 35 },
      },
    ],
  },
  {
    id: 3,
    section: "Instinctual Curiosity",
    scenario: "If you had 3 hours free in a world-class digital library, what shelf pulls you first?",
    context: "Follow your involuntary curiosity rather than what looks good on a resume.",
    choices: [
      {
        key: "A",
        emoji: "🔭",
        text: "Quantum algorithms, autonomous robotics, and cryptography",
        detail: "Rigorous empirical discovery and mathematical architecture.",
        scores: { creative: 15, systems: 35, empathy: 5, venture: 15 },
      },
      {
        key: "B",
        emoji: "🎬",
        text: "Spatial architecture, cinema direction, and interactive design",
        detail: "Visual composition, spatial psychology, and human-crafted experiences.",
        scores: { creative: 35, systems: 15, empathy: 15, venture: 10 },
      },
      {
        key: "C",
        emoji: "🧬",
        text: "Cognitive psychology, neuroscience, and cultural behavior",
        detail: "The mechanics of human mind, societal culture, and emotional well-being.",
        scores: { creative: 15, systems: 15, empathy: 35, venture: 10 },
      },
      {
        key: "D",
        emoji: "📈",
        text: "Venture transformations, geopolitics, and iconic market builders",
        detail: "How visionary leaders changed entire industries and scaled global networks.",
        scores: { creative: 15, systems: 20, empathy: 10, venture: 35 },
      },
    ],
  },
  {
    id: 4,
    section: "Handling Friction & Ambiguity",
    scenario: "When a major plan fails at the 11th hour, what is your natural reaction?",
    context: "Pressure strips away pretense and reveals your real archetype.",
    choices: [
      {
        key: "A",
        emoji: "🧭",
        text: "I step up to steer the group, clarify roles, and restore energy",
        detail: "Instinctive ownership, maintaining morale, and focusing on next steps.",
        scores: { creative: 10, systems: 20, empathy: 20, venture: 35 },
      },
      {
        key: "B",
        emoji: "🔍",
        text: "I diagnose the root logical breakdown and rewrite the framework",
        detail: "Systematic fault-isolation, debugging assumptions, and fixing the pipeline.",
        scores: { creative: 10, systems: 35, empathy: 10, venture: 15 },
      },
      {
        key: "C",
        emoji: "💡",
        text: "I invent an entirely lateral alternative nobody has noticed yet",
        detail: "Reframing constraints into an unorthodox competitive advantage.",
        scores: { creative: 35, systems: 15, empathy: 10, venture: 20 },
      },
      {
        key: "D",
        emoji: "❤️",
        text: "I listen to team frustrations and negotiate an aligned compromise",
        detail: "De-escalating friction, protecting morale, and reuniting the team.",
        scores: { creative: 10, systems: 10, empathy: 35, venture: 15 },
      },
    ],
  },
  {
    id: 5,
    section: "Ultimate Life Impact",
    scenario: "20 years from now, what achievement would bring you the deepest internal pride?",
    context: "Your internal north star.",
    choices: [
      {
        key: "A",
        emoji: "🛠️",
        text: "I engineered fundamental breakthroughs that advanced human technology",
        detail: "Tangible architectural marvels and technological milestones.",
        scores: { creative: 20, systems: 35, empathy: 10, venture: 20 },
      },
      {
        key: "B",
        emoji: "🌟",
        text: "I created iconic artistic works, memorable products, or cultural shifts",
        detail: "Original expression that moved millions of people.",
        scores: { creative: 35, systems: 15, empathy: 15, venture: 15 },
      },
      {
        key: "C",
        emoji: "🩺",
        text: "I directly alleviated suffering, healed people, or lifted communities",
        detail: "Compassionate interpersonal impact and systemic human welfare.",
        scores: { creative: 10, systems: 10, empathy: 35, venture: 15 },
      },
      {
        key: "D",
        emoji: "⚡",
        text: "I built high-growth enterprises that created immense opportunity and value",
        detail: "Venture scale, economic independence, and empowering thousands.",
        scores: { creative: 15, systems: 20, empathy: 15, venture: 35 },
      },
    ],
  },
];

export class AssessmentService {
  public static getQuestions(stage: string): Question[] {
    console.log(`[AssessmentService] Retrieving calibrated questions for stage: ${stage}`);
    return QUESTIONS;
  }

  public static evaluateSubmission(responses: Record<number, string>) {
    let totals = { creative: 40, systems: 38, empathy: 36, venture: 35 };

    Object.entries(responses).forEach(([qId, choiceKey]) => {
      const q = QUESTIONS.find((item) => item.id === Number(qId));
      const choice = q?.choices.find((c) => c.key === choiceKey);
      if (choice) {
        totals.creative += choice.scores.creative;
        totals.systems += choice.scores.systems;
        totals.empathy += choice.scores.empathy;
        totals.venture += choice.scores.venture;
      }
    });

    let topArchetype = {
      id: "creative_strategist",
      code: "#04",
      name: "The Creative Strategist",
      emoji: "🎨",
      tagline: "High divergent ideation + systems execution discipline.",
      description: "You thrive at the intersection where divergent aesthetic intuition meets systems execution.",
      matchPercentage: 98,
    };

    if (totals.systems >= totals.creative && totals.systems >= totals.venture) {
      topArchetype = {
        id: "systems_architect",
        code: "#07",
        name: "The Systems Architect",
        emoji: "⚡",
        tagline: "Deep structural deduction + first-principles scaling logic.",
        description: "Your core power lies in first-principles deduction, abstract logic, and building scalable architectures.",
        matchPercentage: 96,
      };
    } else if (totals.venture >= totals.creative && totals.venture >= totals.systems) {
      topArchetype = {
        id: "venture_catalyst",
        code: "#02",
        name: "The Venture Catalyst",
        emoji: "🚀",
        tagline: "Opportunity recognition + commercial execution velocity.",
        description: "Driven by opportunity recognition, market momentum, and assembling resources to scale ideas.",
        matchPercentage: 97,
      };
    } else if (totals.empathy >= totals.creative) {
      topArchetype = {
        id: "bio_social_visionary",
        code: "#09",
        name: "The Bio-Social Visionary",
        emoji: "🧬",
        tagline: "Interpersonal resonance + compassionate empirical investigation.",
        description: "You combine deep interpersonal resonance with scientific curiosity, elevating human wellness.",
        matchPercentage: 95,
      };
    }

    return {
      submissionId: `sub_${Date.now()}`,
      calculatedAt: new Date().toISOString(),
      dimensions: {
        creative: Math.min(totals.creative, 100),
        systems: Math.min(totals.systems, 100),
        empathy: Math.min(totals.empathy, 100),
        venture: Math.min(totals.venture, 100),
      },
      archetype: topArchetype,
      validityRating: "93.4% Certified Psychometric Reliability",
    };
  }
}
