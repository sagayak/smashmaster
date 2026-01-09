
import React, { useState, useEffect } from 'react';
import { Match, Team, GameScore, MatchStatus } from '../types';
import { ChevronLeft, Trophy, RotateCcw, CheckCircle2, RotateCw, PlusCircle, UserCheck, Minus, Plus, Edit3, Target, PartyPopper, Users, UserPlus } from 'lucide-react';

interface MatchScorerProps {
  match: Match;
  team1: Team;
  team2: Team;
  onUpdate: (match: Match) => void;
  onFinish: () => void;
  onEditLineup: () => void;
}

const MatchScorer: React.FC<MatchScorerProps> = ({ match, team1, team2, onUpdate, onFinish, onEditLineup }) => {
  const [t1Score, setT1Score] = useState(0);
  const [t2Score, setT2Score] = useState(0);
  const [history, setHistory] = useState<{ t1: number, t2: number }[]>([]);
  const [showMatchWinnerOverlay, setShowMatchWinnerOverlay] = useState<string | null>(null);

  const currentScores = [...match.scores];
  const t1GamesWon = currentScores.filter(s => s.team1 > s.team2).length;
  const t2GamesWon = currentScores.filter(s => s.team2 > s.team1).length;
  const gamesNeeded = Math.ceil(match.format / 2);

  const activeLineup = match.lineups ? match.lineups[match.scores.length] : null;

  const addPoint = (team: 1 | 2) => {
    if (showMatchWinnerOverlay) return;
    setHistory([...history, { t1: t1Score, t2: t2Score }]);
    if (team === 1) setT1Score(prev => prev + 1);
    else setT2Score(prev => prev + 1);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const removePoint = (team: 1 | 2, e?: React.MouseEvent) => {
    if (showMatchWinnerOverlay) return;
    if (e) e.stopPropagation();
    setHistory([...history, { t1: t1Score, t2: t2Score }]);
    if (team === 1) setT1Score(prev => Math.max(0, prev - 1));
    else setT2Score(prev => Math.max(0, prev - 1));
  };

  const handleScoreInput = (team: 1 | 2, val: string) => {
    if (showMatchWinnerOverlay) return;
    const numValue = parseInt(val) || 0;
    setHistory([...history, { t1: t1Score, t2: t2Score }]);
    if (team === 1) setT1Score(numValue);
    else setT2Score(numValue);
  };

  const undoPoint = () => {
    if (history.length === 0 || showMatchWinnerOverlay) return;
    const last = history[history.length - 1];
    setT1Score(last.t1);
    setT2Score(last.t2);
    setHistory(history.slice(0, -1));
  };

  const resetGameScore = () => {
    if (window.confirm("Reset current game score?")) {
      setT1Score(0);
      setT2Score(0);
      setHistory([]);
    }
  };

  const handleFinishGame = async () => {
    const newScore: GameScore = { team1: t1Score, team2: t2Score };
    const updatedScores = [...match.scores, newScore];
    
    const newT1Wins = updatedScores.filter(s => s.team1 > s.team2).length;
    const newT2Wins = updatedScores.filter(s => s.team2 > s.team1).length;
    
    let updatedStatus: MatchStatus = 'live';
    let winnerId: string | undefined = undefined;

    if (newT1Wins >= gamesNeeded) {
      updatedStatus = 'completed';
      winnerId = team1.id;
      setShowMatchWinnerOverlay(team1.name);
    } else if (newT2Wins >= gamesNeeded) {
      updatedStatus = 'completed';
      winnerId = team2.id;
      setShowMatchWinnerOverlay(team2.name);
    }

    const updatedMatch: Match = {
      ...match,
      scores: updatedScores,
      currentGame: match.currentGame + 1,
      status: updatedStatus,
      winnerId: winnerId
    };

    await onUpdate(updatedMatch);
    
    if (updatedStatus !== 'completed') {
      setT1Score(0);
      setT2Score(0);
      setHistory([]);
    }
  };

  const canFinishGame = t1Score >= match.pointsTarget || t2Score >= match.pointsTarget || (t1Score > 0 && t2Score > 0 && Math.abs(t1Score - t2Score) >= 2 && Math.max(t1Score, t2Score) >= (match.pointsTarget - 5));

  useEffect(() => {
    if (match.status === 'scheduled') {
      onUpdate({ ...match, status: 'live' });
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[60] flex flex-col p-4 sm:p-6 overflow-hidden select-none text-white">
      {showMatchWinnerOverlay && (
        <div className="fixed inset-0 z-[100] bg-indigo-600 flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
           <PartyPopper className="w-24 h-24 text-white mb-8 animate-bounce" />
           <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-indigo-200 mb-4">Match Completed</h2>
           <div className="text-5xl sm:text-7xl font-black text-white text-center mb-12 drop-shadow-2xl">
             {showMatchWinnerOverlay}
           </div>
           <div className="bg-white/10 p-8 rounded-[3rem] border border-white/20 mb-12 max-w-md w-full">
              <div className="flex justify-between items-center gap-8 mb-4">
                 <div className="text-center flex-1">
                    <div className="text-[10px] font-black uppercase text-indigo-200 mb-1">{team1.name}</div>
                    <div className="text-3xl font-black">{t1GamesWon + (showMatchWinnerOverlay === team1.name ? 1 : 0)}</div>
                 </div>
                 <div className="text-xl font-black text-indigo-300 italic">VS</div>
                 <div className="text-center flex-1">
                    <div className="text-[10px] font-black uppercase text-indigo-200 mb-1">{team2.name}</div>
                    <div className="text-3xl font-black">{t2GamesWon + (showMatchWinnerOverlay === team2.name ? 1 : 0)}</div>
                 </div>
              </div>
              <div className="flex justify-center gap-3">
                 {[...match.scores, { team1: t1Score, team2: t2Score }].map((s, i) => (
                   <span key={i} className="bg-white/20 px-3 py-1 rounded-xl text-xs font-black">
                     {s.team1}-{s.team2}
                   </span>
                 ))}
              </div>
           </div>
           <button 
             onClick={onFinish}
             className="bg-white text-indigo-600 px-12 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:scale-110 active:scale-95 transition-all"
           >
             Finish Session
           </button>
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 relative z-10 shrink-0">
        <div className="flex gap-2">
          <button onClick={onFinish} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
            <ChevronLeft className="w-4 h-4" />
            Exit
          </button>
          <button onClick={onEditLineup} className="flex items-center gap-2 bg-indigo-600/50 px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all border border-indigo-500/30">
            <UserPlus className="w-4 h-4" />
            Lineup
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] mb-3">
            Match Progression
          </span>

          <div className="flex items-center gap-3">
            {Array.from({ length: match.format }).map((_, i) => {
              const isCompleted = i < match.scores.length;
              const isCurrent = i === match.scores.length;
              const winnerOfGame = isCompleted ? (match.scores[i].team1 > match.scores[i].team2 ? 1 : 2) : null;
              
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div 
                    className={`h-2 w-14 sm:w-20 rounded-full transition-all duration-700 overflow-hidden relative shadow-inner ${
                      isCompleted 
                        ? winnerOfGame === 1 
                          ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] border border-indigo-400/50' 
                          : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] border border-emerald-400/50' 
                        : isCurrent 
                          ? 'bg-white/40 border border-white/20' 
                          : 'bg-white/5 border border-white/5'
                    }`}
                  >
                    {isCurrent && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                    )}
                    {isCompleted && (
                       <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                    )}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isCurrent ? 'text-white' : 'text-white/20'}`}>
                    {isCompleted ? `${match.scores[i].team1}:${match.scores[i].team2}` : `SET ${i + 1}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={undoPoint} disabled={history.length === 0} className="bg-white/10 px-4 py-2 rounded-xl text-white font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
           Undo
        </button>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full min-h-0 mb-4 overflow-visible">
        <ScoreSide 
          team={team1} 
          score={t1Score} 
          gamesWon={t1GamesWon} 
          isActive={t1Score >= t2Score}
          onAdd={() => addPoint(1)}
          onRemove={(e) => removePoint(1, e)}
          onInput={(val) => handleScoreInput(1, val)}
          colorClass="indigo"
          side="1"
          activePlayers={activeLineup?.team1Players}
        />

        <ScoreSide 
          team={team2} 
          score={t2Score} 
          gamesWon={t2GamesWon} 
          isActive={t2Score >= t1Score}
          onAdd={() => addPoint(2)}
          onRemove={(e) => removePoint(2, e)}
          onInput={(val) => handleScoreInput(2, val)}
          colorClass="emerald"
          side="2"
          activePlayers={activeLineup?.team2Players}
        />
      </div>

      {/* Bottom Bar Actions */}
      <div className="flex items-center justify-between gap-4 relative z-10 px-2 shrink-0">
        <button 
          onClick={resetGameScore}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/30 hover:text-red-400 hover:bg-white/10 transition-all shadow-xl"
          title="Reset Game"
        >
          <RotateCw className="w-6 h-6" />
        </button>

        {canFinishGame ? (
          <button
            onClick={handleFinishGame}
            className="flex-1 bg-white text-slate-900 py-5 rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all px-4 border-b-4 border-slate-300 active:border-b-0"
          >
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            END SET {match.scores.length + 1}
          </button>
        ) : (
          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl py-5 flex flex-col items-center justify-center">
            <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">Target Score: {match.pointsTarget}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

interface ScoreSideProps {
  team: Team;
  score: number;
  gamesWon: number;
  isActive: boolean;
  onAdd: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onInput: (val: string) => void;
  colorClass: 'indigo' | 'emerald';
  side: string;
  activePlayers?: string[];
}

const ScoreSide: React.FC<ScoreSideProps> = ({ team, score, gamesWon, isActive, onAdd, onRemove, onInput, colorClass, side, activePlayers }) => {
  const bgClasses = colorClass === 'indigo' 
    ? (isActive ? 'bg-indigo-600/20 border-indigo-500/50 shadow-[inset_0_0_50px_rgba(99,102,241,0.1)]' : 'bg-white/5 border-white/5')
    : (isActive ? 'bg-emerald-600/20 border-emerald-500/50 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-white/5');
  
  const accentBg = colorClass === 'indigo' ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';

  return (
    <div className={`relative flex flex-col items-center justify-center p-4 rounded-[3.5rem] border-4 transition-all duration-500 overflow-hidden ${bgClasses}`}>
      {/* Background large side indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] text-[20rem] sm:text-[25rem] font-black leading-none select-none overflow-hidden translate-y-8">
        {side}
      </div>

      <div className="text-center mb-6 relative z-10 w-full px-4">
        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-1 drop-shadow-md truncate leading-tight">{team.name}</h3>
        
        {activePlayers && activePlayers.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-3">
             <Users className="w-3 h-3 text-white/40" />
             <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex gap-1.5">
                {activePlayers.map((p, i) => (
                  <span key={i} className={p ? '' : 'text-white/20'}>{p || '???'}</span>
                ))}
             </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-10 h-2 rounded-full transition-all duration-500 ${i < gamesWon ? accentBg : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:gap-8 relative z-10 w-full max-w-sm px-4">
        <button 
          onClick={onRemove}
          className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center active:scale-90"
        >
          <Minus className="w-8 h-8 sm:w-12 sm:h-12 text-white/30" />
        </button>

        <div className="flex-1 relative flex items-center justify-center min-w-[3ch]">
          <input 
            type="number" 
            value={score}
            onChange={(e) => onInput(e.target.value)}
            className="w-full text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tabular-nums bg-transparent text-center outline-none border-none focus:ring-0 py-4 leading-none min-h-[1.1em] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          />
        </div>

        <button 
          onClick={onAdd}
          className={`flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-full border transition-all flex items-center justify-center active:scale-90 shadow-2xl ${
            colorClass === 'indigo' ? 'bg-indigo-500 border-indigo-400' : 'bg-emerald-500 border-emerald-400'
          }`}
        >
          <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
        </button>
      </div>
    </div>
  );
};

export default MatchScorer;
