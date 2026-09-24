"use client";

interface DilemmaCard {
  id: string;
  student: string;
  classStage: string;
  quote: string;
  dilemma: string;
  answers: string;
}

const DILEMMAS: DilemmaCard[] = [
  {
    id: "stream-fear",
    student: "Ananya M.",
    classStage: "Class 10 ICSE",
    quote: "“Choosing a stream felt like locking in the next 10 years with zero data.”",
    dilemma: "Stream Decision",
    answers: "14.2k resolved",
  },
  {
    id: "pcm-vs-design",
    student: "Rohan S.",
    classStage: "Class 12 CBSE",
    quote: "“Pushed toward standard PCM, but my instinct was interactive systems.”",
    dilemma: "Aptitude Alignment",
    answers: "18.4k resolved",
  },
  {
    id: "good-at-this",
    student: "Devansh K.",
    classStage: "B.Tech 2nd Year",
    quote: "“Helped me pivot from herd expectations to high-growth Spatial AI.”",
    dilemma: "Career Pivot",
    answers: "21.6k resolved",
  },
];

export default function SocialProof() {
  return (
    <section className="py-14 sm:py-20 bg-[#FBFBF9] relative overflow-hidden" id="dilemmas">
      <div className="w-full px-3.5 sm:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
        {/* Section Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#E0E7FE]">
              <span>Real Student Dilemmas</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#0F172A] tracking-tight">
              Sound familiar?
            </h2>
            <p className="text-[#64748B] font-medium text-xs sm:text-base mt-1.5 max-w-lg leading-relaxed">
              Confronting outdated career advice? See how students solved stream and career paralysis.
            </p>
          </div>

          <div className="self-start lg:self-auto bg-white border border-[#E2E8F0] px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-[#0F172A]">
              48,290+ Students Guided This Month
            </span>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {DILEMMAS.map((item) => {
            return (
              <div
                key={item.id}
                className="group relative p-5 sm:p-6 bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all duration-200 rounded-2xl flex flex-col justify-between overflow-hidden"
              >
                {/* Small length accent border */}
                <div className="absolute top-0 left-6 w-12 h-[3px] bg-[#FF6B6B] rounded-full group-hover:w-16 transition-all duration-300" />

                <div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] border border-[#E0E7FE] rounded-full">
                      {item.classStage}
                    </span>
                    <span className="text-[11px] font-semibold text-[#64748B]">
                      {item.dilemma}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold leading-snug text-black">
                    {item.quote}
                  </p>

                  <div className="mt-3 text-xs font-bold uppercase tracking-wider text-black">
                    — {item.student}
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                  <span className="flex items-center gap-1.5 text-[#64748B]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {item.answers}
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                    Calibrated
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
