import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Compass,
  Sparkles,
  TrendingUp,
  Cpu,
  Brain,
  Briefcase,
  Layers,
  GraduationCap,
  ShieldCheck,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function StudentCareerInsightsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/careers");
  }

  const careerTrajectories = [
    {
      id: "ai-systems-architect",
      title: "AI Systems Architect",
      category: "STEM & Deep Tech",
      matchScore: 94,
      icon: Cpu,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
      description:
        "Design scalable autonomous systems, neural pipelines, and ethical machine intelligence architectures for high-growth tech domains.",
      traits: ["High Analytical Synthesis", "Abstract Reasoning", "Systems Thinking"],
      skills: ["Neural Architectures", "Distributed Systems", "Algorithm Optimization"],
      growth: "+32% 10-Yr Demand",
      degree: "Computer Science / Cognitive AI",
    },
    {
      id: "venture-product-strategist",
      title: "Venture Product Strategist",
      category: "Product & Leadership",
      matchScore: 89,
      icon: TrendingUp,
      iconBg: "bg-[#FAF5FF]",
      iconColor: "text-[#9333EA]",
      description:
        "Orchestrate venture creation, market penetration strategies, and multi-disciplinary teams to scale disruptive technological products.",
      traits: ["High Adaptability", "Cross-Domain Empathy", "Strategic Risk Framing"],
      skills: ["Product Economics", "Go-To-Market", "Stakeholder Alignment"],
      growth: "+24% 10-Yr Demand",
      degree: "Management Science / Tech Engineering",
    },
    {
      id: "biomedical-neural-engineer",
      title: "Biomedical & Neurotech Engineer",
      category: "Applied Health & Sciences",
      matchScore: 86,
      icon: Brain,
      iconBg: "bg-[#F0FDF4]",
      iconColor: "text-[#16A34A]",
      description:
        "Interface neuro-biological computation, bio-sensors, and regenerative medical technologies to enhance human cognition and health.",
      traits: ["Precision Focus", "Empirical Deduction", "Holistic Bio-Logic"],
      skills: ["Biosensors", "Neuro-Informatics", "Clinical Validation"],
      growth: "+28% 10-Yr Demand",
      degree: "Biomedical Engineering / Bio-Computation",
    },
    {
      id: "cognitive-ux-architect",
      title: "Cognitive Experience Architect",
      category: "Design & Interaction",
      matchScore: 82,
      icon: Compass,
      iconBg: "bg-[#FFF8EE]",
      iconColor: "text-[#D97706]",
      description:
        "Architect intuitive spatial computing and human-agent interaction frameworks grounded in cognitive psychology and behavioral data.",
      traits: ["Spatial Cognition", "Perceptual Ergonomics", "Qualitative Empathy"],
      skills: ["Spatial Interfaces", "Human Factors", "Behavioral Telemetry"],
      growth: "+21% 10-Yr Demand",
      degree: "Cognitive Science / Interaction Design",
    },
  ];

  const skillMatrices = [
    {
      category: "Cognitive Strengths",
      skills: [
        { name: "Complex Problem Decomposition", score: 92 },
        { name: "Logical Deduction & Synthesis", score: 88 },
        { name: "Abstract Pattern Identification", score: 85 },
      ],
    },
    {
      category: "Leadership & Work Dynamic",
      skills: [
        { name: "Autonomous Execution", score: 90 },
        { name: "Cross-Functional Collaboration", score: 84 },
        { name: "Situational Agility", score: 78 },
      ],
    },
  ];

  return (
    <main className="w-full space-y-8">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-6 bg-[#FF6B6B] rounded-full inline-block" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Career Insights & Trajectory Matrix
          </h1>
        </div>
        <p className="text-sm text-[#64748B] max-w-3xl leading-relaxed">
          Calibrated career recommendations synthesized from your psychometric evaluations, behavioral matrix, and industry growth vectors.
        </p>
      </div>

      {/* Trajectories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careerTrajectories.map((career) => {
          const Icon = career.icon;
          return (
            <div
              key={career.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-md hover:border-[#CBD5E1] transition-all"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${career.iconBg} ${career.iconColor} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FFF0EE] border border-[#FED7CC] px-2.5 py-1 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B6B] text-[#FF6B6B]" />
                    <span className="text-xs font-bold text-[#FF6B6B]">{career.matchScore}% Match</span>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                  {career.category}
                </div>
                <h2 className="text-lg font-bold text-[#0F172A] mb-2 tracking-tight">
                  {career.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed mb-5">
                  {career.description}
                </p>

                {/* Traits & Competencies */}
                <div className="space-y-3 mb-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                      Key Cognitive Traits
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {career.traits.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-medium bg-white text-[#0F172A] border border-[#E2E8F0] px-2 py-0.5 rounded-md"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block mb-1.5">
                      Core Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {career.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-medium bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FE] px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer details */}
              <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-1 font-semibold text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{career.growth}</span>
                </div>
                <span className="font-medium text-[#64748B]">{career.degree}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Matrices Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="text-base font-bold text-[#0F172A]">Calibrated Competency Breakdown</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skillMatrices.map((matrix) => (
            <div key={matrix.category} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                {matrix.category}
              </h4>
              <div className="space-y-3">
                {matrix.skills.map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#0F172A]">{skill.name}</span>
                      <span className="text-[#FF6B6B] font-bold">{skill.score}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6B6B] to-[#F97316] rounded-full"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
