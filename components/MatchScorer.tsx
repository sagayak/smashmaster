
import React, { useState, useEffect } from 'react';
import { Match, Team, GameScore, MatchStatus } from '../types';
import { ChevronLeft, Trophy, RotateCcw, CheckCircle2, RotateCw, PlusCircle, UserCheck, Minus, Plus, Edit3 } from 'lucide-react';

interface MatchScorerProps {
  match: Match;
  team1: Team;
  team2: Team;
  onUpdate: (match: Match) => void;
  onFinish: () => void;
}

const MatchScorer: React.FC<MatchScorerProps> = ({ match, team1, team2, onUpdate, onFinish }) => {
  const [t1Score, setT1Score] = useState(0);
  const [t2Score, setT2Score] = useState(0);
  const [history, setHistory] = useState<{ t1: number, t2: number }[]>([]);

  const currentScores = [...match.scores];
  const t1GamesWon = currentScores.filter(s => s.team1 > s.team2).length;
  const t2GamesWon = currentScores.filter(s => s.team2 > s.team1).length;
  const gamesNeeded = Math.ceil(match.format / 2);

  const addPoint = (team: 1 | 2) => {
    setHistory([...history, { t1: t1Score, t2: t2Score }]);
    if (team === 1) setT1Score(prev => prev + 1);
    else setT2Score(prev => prev + 1);
    
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const removePoint = (team: 1 | 2, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHistory([...history, { t1: t1Score, t2: t2Score }]);
    if (team === 1) setT1Score(prev => Math.max(0, prev - 1));
    else setT2Score(prev => Math.max(0, prev - 1));
  };

  const handleScoreInput = (team: 1 | 2, val: string) => {
    const numValue = parseInt(val) || 0;
    setHistory([...history, { t1: t1Score, t2: t2Score }]);
    if (team === 1) setT1Score(numValue);
    else setT2Score(numValue);
  };

  const undoPoint = () => {
    if (history.length === 0) return;
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
    } else if (newT2Wins >= gamesNeeded) {
      updatedStatus = 'completed';
      winnerId = team2.id;
    }

    const updatedMatch: Match = {
      ...match,
      scores: updatedScores,
      currentGame: match.currentGame + 1,
      status: updatedStatus,
      winnerId: winnerId
    };

    await onUpdate(updatedMatch);
    setT1Score(0);
    setT2Score(0);
    setHistory([]);

    if (updatedStatus === 'completed') {
      onFinish();
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
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button onClick={onFinish} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
          <ChevronLeft className="w-5 h-5" />
          Quit
        </button>
        
        <div className="flex flex-col items-center">
          {match.umpireNames && match.umpireNames.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                Umpire: {match.umpireNames.join(", ")}
              </span>
            </div>
          )}
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">
             Game {match.scores.length + 1} of {match.format}
          </span>
          <div className="flex gap-2">
            {Array.from({ length: match.format }).map((_, i) => (
              <div key={i} className={`w-12 h-2 rounded-full transition-all duration-700 ${
                i < match.scores.length ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        <button onClick={undoPoint} disabled={history.length === 0} className="bg-white/10 px-4 py-2 rounded-xl text-white font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
           Undo
        </button>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full min-h-0 mb-6">
        {/* Team 1 Score Card */}
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
        />

        {/* Team 2 Score Card */}
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
        />
      </div>

      {/* Bottom Bar Actions */}
      <div className="flex items-center justify-between gap-6 relative z-10 px-2">
        <button 
          onClick={resetGameScore}
          className="p-5 bg-white/5 border border-white/10 rounded-3xl text-white/30 hover:text-red-400 hover:bg-white/10 transition-all shadow-xl"
          title="Reset Game"
        >
          <RotateCw className="w-7 h-7" />
        </button>

        {canFinishGame ? (
          <button
            onClick={handleFinishGame}
            className="flex-1 bg-white text-slate-900 py-6 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            SUBMIT GAME RESULT
          </button>
        ) : (
          <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] py-6 flex flex-col items-center justify-center">
            <span className="text-white/40 font-black uppercase tracking-[0.3em] text-sm">Target: {match.pointsTarget} Points</span>
            <div className="flex items-center gap-2 mt-1">
               <Edit3 className="w-3 h-3 text-white/20" />
               <span className="text-[10px] text-white/20 font-bold uppercase italic">Direct input enabled</span>
            </div>
          </div>
        )}

        <div className="w-16 hidden sm:block"></div>
      </div>
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
}

const ScoreSide: React.FC<ScoreSideProps> = ({ team, score, gamesWon, isActive, onAdd, onRemove, onInput, colorClass, side }) => {
  const bgClasses = colorClass === 'indigo' 
    ? (isActive ? 'bg-indigo-600/20 border-indigo-500/50' : 'bg-white/5 border-white/5')
    : (isActive ? 'bg-emerald-600/20 border-emerald-500/50' : 'bg-white/5 border-white/5');
  
  const accentText = colorClass === 'indigo' ? 'text-indigo-400' : 'text-emerald-400';
  const accentBg = colorClass === 'indigo' ? 'bg-indigo-500' : 'bg-emerald-500';

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-[3rem] border-4 transition-all duration-500 ${bgClasses}`}>
      {/* Background large number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] text-[25rem] font-black leading-none select-none">
        {side}
      </div>

      {/* Team Meta */}
      <div className="text-center mb-6 relative z-10">
        <h3 className="text-2xl font-black uppercase tracking-tight mb-2 drop-shadow-md">{team.name}</h3>
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`w-8 h-1.5 rounded-full ${i < gamesWon ? accentBg : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* Interactive Scoring Controls */}
      <div className="flex items-center gap-6 relative z-10 w-full max-w-sm">
        <button 
          onClick={onRemove}
          className="flex-shrink-0 w-20 h-20 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center group active:scale-90"
        >
          <Minus className="w-10 h-10 text-white/40 group-hover:text-white" />
        </button>

        <div className="flex-1 relative flex items-center justify-center group">
          <input 
            type="number" 
            value={score}
            onChange={(e) => onInput(e.target.value)}
            className="w-full text-[12rem] font-black tabular-nums leading-none tracking-tighter bg-transparent text-center outline-none border-none focus:ring-0 cursor-text selection:bg-indigo-500/30"
          />
          <div className="absolute -bottom-4 opacity-30 group-focus-within:opacity-100 transition-opacity">
            <Edit3 className="w-5 h-5" />
          </div>
        </div>

        <button 
          onClick={onAdd}
          className={`flex-shrink-0 w-20 h-20 rounded-full border transition-all flex items-center justify-center group active:scale-90 shadow-2xl ${
            colorClass === 'indigo' ? 'bg-indigo-500 border-indigo-400' : 'bg-emerald-500 border-emerald-400'
          }`}
        >
          <Plus className="w-10 h-10 text-white" />
        </button>
      </div>

      {/* Quick Add Overlay Hint (Visible on large screens) */}
      <div className="mt-8 text-white/20 font-bold uppercase tracking-[0.2em] text-[10px] hidden sm:block">
        Click + to increment or type score above
      </div>
    </div>
  );
};

export default MatchScorer;
