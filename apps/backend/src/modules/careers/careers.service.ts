export interface CareerRecord {
  id: string;
  title: string;
  stream: string;
  growth: string;
  salary: string;
  degree: string;
  matchTraits: string[];
  description: string;
  readinessStep: string;
}

const CAREERS: CareerRecord[] = [
  {
    id: "ai-engineer",
    title: "Machine Learning & AI Architect",
    stream: "Technology",
    growth: "🔥 +38% High Growth",
    salary: "$130,000 - $210,000",
    degree: "B.Tech Computer Science / Mathematics & Computing",
    matchTraits: ["Systems Logic", "Python", "Neural Networks"],
    description: "Designs, trains, and deploys deep foundation neural models and autonomous agent workflows.",
    readinessStep: "Master linear algebra, PyTorch, and distributed training systems.",
  },
  {
    id: "spatial-designer",
    title: "Spatial Computing & Vision UX Designer",
    stream: "Design",
    growth: "✨ +29% Creative Tech",
    salary: "$115,000 - $175,000",
    degree: "B.Des Interaction Design / Human-Computer Interaction",
    matchTraits: ["Spatial Form", "Emotional Resonance", "3D Ergonomics"],
    description: "Crafts intuitive next-generation spatial gestures, augmented reality overlays, and hardware interaction paradigms.",
    readinessStep: "Build 3D interactive prototypes in Unity/Spline and master spatial layout guidelines.",
  },
  {
    id: "neuro-psych",
    title: "Cognitive Neuroscience & Behavioral Analyst",
    stream: "Healthcare",
    growth: "🧬 Societal Impact",
    salary: "$105,000 - $160,000",
    degree: "B.Sc Psychology / Cognitive Science / Pre-Med",
    matchTraits: ["Interpersonal Resonance", "Empirical Method", "Active Listening"],
    description: "Investigates brain plasticity, neural pathways of learning, and designs targeted therapies.",
    readinessStep: "Engage in computational psychology lab research and clinical shadowing.",
  },
  {
    id: "fintech-lead",
    title: "FinTech Product Strategist & Venture Lead",
    stream: "Venture",
    growth: "⚡ +32% Commercial Scale",
    salary: "$125,000 - $190,000",
    degree: "B.Com / B.B.A / Economics & Data Analytics",
    matchTraits: ["Venture Scalability", "Risk Modeling", "Negotiation"],
    description: "Architects algorithmic credit models, decentralized protocols, and digital payment infrastructure.",
    readinessStep: "Analyze financial statements and build consumer banking micro-experiments.",
  },
  {
    id: "clean-energy",
    title: "Smart Grid & Renewable Storage Engineer",
    stream: "CleanTech",
    growth: "🌱 +35% Planetary",
    salary: "$110,000 - $170,000",
    degree: "B.Tech Electrical / Energy Systems Engineering",
    matchTraits: ["Planetary Impact", "Thermodynamics", "Sensor Networks"],
    description: "Develops decentralized solar/wind microgrid storage and carbon offset verification algorithms.",
    readinessStep: "Study battery chemistry kinetics and power distribution modeling software.",
  },
  {
    id: "tech-law",
    title: "Artificial Intelligence & Privacy Policy Counsel",
    stream: "Law",
    growth: "⚖️ +27% Global Policy",
    salary: "$140,000 - $220,000",
    degree: "B.A. LL.B (Hons) / Master of Public Policy",
    matchTraits: ["Rhetoric & Ethics", "Statutory Synthesis", "International Treaties"],
    description: "Shapes international AI copyright laws, data sovereignty governance, and cross-border tech ethics.",
    readinessStep: "Participate in national parliamentary debates and international moot courts.",
  },
];

export class CareersService {
  public static listCareers(stream?: string, query?: string): CareerRecord[] {
    return CAREERS.filter((item) => {
      const matchStream = !stream || stream.toLowerCase() === "all" || item.stream.toLowerCase() === stream.toLowerCase();
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.matchTraits.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      return matchStream && matchQuery;
    });
  }

  public static getCareerById(id: string): CareerRecord | undefined {
    return CAREERS.find((c) => c.id === id);
  }
}
