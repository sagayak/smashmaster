
import React, { useEffect, useState } from 'react';
import { Trophy, ChevronRight, Zap, Target } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-950">
      <style>{`
        @keyframes speedLine {
          0% { transform: translateX(-100%) translateY(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateX(200%) translateY(100px); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-30px) rotate(15deg) scale(1.1); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(30px) rotate(-10deg) scale(1.05); }
        }
        @keyframes explosive {
          0% { transform: scale(0.5) rotate(-10deg); opacity: 0; filter: blur(10px); }
          70% { transform: scale(1.1) rotate(2deg); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }
          50% { box-shadow: 0 0 50px rgba(99, 102, 241, 0.6); }
        }
        @keyframes drift {
          from { background-position: 0% 0%; }
          to { background-position: 100% 100%; }
        }
        @keyframes court-entry {
          from { transform: perspective(1000px) rotateX(60deg) translateY(200px); opacity: 0; }
          to { transform: perspective(1000px) rotateX(60deg) translateY(0); opacity: 1; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .speed-line {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: speedLine 0.8s linear infinite;
          pointer-events: none;
        }
        .title-letter {
          display: inline-block;
          animation: explosive 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .shimmer {
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transform: skewX(-25deg);
          animation: shimmer-load 3s infinite;
        }
        @keyframes shimmer-load {
          to { left: 200%; }
        }
        .gradient-mesh {
          position: absolute;
          inset: -50%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
          animation: drift 20s linear infinite alternate;
        }
        .court-container {
          position: absolute;
          width: 1400px;
          height: 1000px;
          pointer-events: none;
          background: #006B3C; /* Pro Badminton Green */
          border: 12px solid #005630;
          box-shadow: 
            0 0 100px rgba(0, 107, 60, 0.3),
            inset 0 0 150px rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .court-main {
          bottom: -25%;
          left: 50%;
          transform: translateX(-50%) perspective(1200px) rotateX(65deg);
          animation: court-entry 2.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        .court-surface-texture {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.08;
          mix-blend-mode: overlay;
        }
        .court-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
        }
        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 20%;
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: scan 8s linear infinite;
        }
        .sport-asset {
          position: absolute;
          pointer-events: none;
          z-index: 15;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.8));
        }
        .floating-racket {
          width: 500px;
          right: -5%;
          bottom: 10%;
          transform: rotate(-30deg);
          animation: float 6s ease-in-out infinite;
        }
        .floating-shuttle {
          width: 280px;
          left: 2%;
          top: 15%;
          transform: rotate(20deg);
          animation: float-reverse 7s ease-in-out infinite;
        }
      `}</style>

      {/* Background FX */}
      <div className="gradient-mesh"></div>

      {/* Main Green Pro Court - Bottom Center */}
      <div className="court-container court-main">
        <div className="court-surface-texture"></div>
        <div className="scan-line"></div>
        <CourtLines />
      </div>

      {/* Sport Imagery */}
      <img 
        src="https://images.unsplash.com/photo-1613918431703-9115d903964d?q=80&w=1000&auto=format&fit=crop" 
        alt="Professional Badminton Racket"
        className="sport-asset floating-racket opacity-70 group-hover:opacity-100 transition-opacity duration-700"
        style={{ mixBlendMode: 'screen' }}
      />
      <img 
        src="https://images.unsplash.com/photo-1626225967045-9410dd996701?q=80&w=1000&auto=format&fit=crop" 
        alt="Feather Shuttlecock"
        className="sport-asset floating-shuttle opacity-80 group-hover:opacity-100 transition-opacity duration-700"
      />
      
      {/* Dynamic Speed Lines */}
      {mounted && [...Array(15)].map((_, i) => (
        <div 
          key={i} 
          className="speed-line"
          style={{
            width: `${Math.random() * 200 + 150}px`,
            top: `${Math.random() * 100}%`,
            left: `-${Math.random() * 50}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${Math.random() * 0.4 + 0.3}s`
          }}
        />
      ))}

      {/* Floating Interactive Icons */}
      <div className="absolute top-[15%] left-[10%] text-indigo-500/10 animate-float">
        <Zap size={180} />
      </div>
      <div className="absolute bottom-[20%] right-[12%] text-emerald-500/10 animate-float" style={{ animationDelay: '-3s' }}>
        <Target size={220} />
      </div>

      <div className="relative z-20 max-w-5xl w-full text-center">
        {/* Main Landing Card */}
        <div className="bg-white/[0.01] backdrop-blur-3xl border border-white/10 p-12 sm:p-24 rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="shimmer"></div>
          
          {/* Badge */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 animate-in fade-in slide-in-from-top-4 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Pro Arena Edition 2026
            </div>
          </div>

          {/* Explosive Title */}
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter mb-8 leading-[0.85]">
            <span className="block">
              {["S", "M", "A", "S", "H"].map((l, i) => (
                <span key={i} className="title-letter" style={{ animationDelay: `${i * 0.1}s` }}>{l}</span>
              ))}
            </span>
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-500 to-emerald-400 bg-[length:200%_auto] animate-[gradient_4s_linear_infinite]">
              MASTER
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-2xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            The pro-grade tournament engine for clubs that play to win. 
            Real-time scoring, manual tie-ups, and elite analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
            {/* Primary Action */}
            <button 
              onClick={onEnter}
              className="group relative flex items-center gap-5 bg-white text-slate-950 px-12 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.25em] text-lg transition-all hover:scale-110 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-emerald-500/40 overflow-hidden"
              style={{ animation: 'pulse-glow 3s infinite' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              Launch Arena
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-5 rounded-[2.5rem]">
               <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-slate-900 bg-slate-800 flex items-center justify-center font-black text-[10px] text-white/40">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
               </div>
               <div className="text-left">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Network</div>
                  <div className="text-xs font-black text-white">42+ Active Clubs</div>
               </div>
            </div>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in fade-in duration-1000 delay-1000">
          <MetricItem value="0.04s" label="Sync Latency" />
          <MetricItem value="24/7" label="Arena Uptime" />
          <MetricItem value="1.2k" label="Tournaments" />
          <MetricItem value="100%" label="E-Umpire Logic" />
        </div>
      </div>
    </div>
  );
};

const CourtLines = () => (
  <>
    {/* Center Line */}
    <div className="court-line w-2 h-full left-1/2 -translate-x-1/2"></div>
    {/* Net Line (conceptual horizontal center) */}
    <div className="court-line w-full h-2 top-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"></div>
    {/* Short Service Lines */}
    <div className="court-line w-full h-2 top-[35%]"></div>
    <div className="court-line w-full h-2 bottom-[35%]"></div>
    {/* Singles Side Lines */}
    <div className="court-line w-2 h-full left-[10%]"></div>
    <div className="court-line w-2 h-full right-[10%]"></div>
    {/* Doubles Side Lines (Back) */}
    <div className="court-line w-full h-2 top-[5%]"></div>
    <div className="court-line w-full h-2 bottom-[5%]"></div>
    {/* Outer Boundary */}
    <div className="court-line w-2 h-full left-0"></div>
    <div className="court-line w-2 h-full right-0"></div>
  </>
);

const MetricItem = ({ value, label }: { value: string, label: string }) => (
  <div className="text-center group">
    <div className="text-3xl font-black text-white mb-1 group-hover:text-emerald-400 transition-colors">{value}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{label}</div>
  </div>
);

export default LandingPage;
