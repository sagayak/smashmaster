
import React, { useState, useEffect } from 'react';
import { Match, Team, GameScore, MatchStatus } from '../types';
import { ChevronLeft, Trophy, RotateCcw, CheckCircle2, RotateCw, PlusCircle, UserCheck } from 'lucide-react';

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
    
    // Simple visual haptic feedback (using browser API if available)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
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

  const winningTeam = t1Score > t2Score ? team1.name : team2.name;
  const canFinishGame = t1Score >= match.pointsTarget || t2Score >= match.pointsTarget;

  useEffect(() => {
    if (match.status === 'scheduled') {
      onUpdate({ ...match, status: 'live' });
    }
    // Lock body scroll to prevent refreshing while scoring
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-50 z-[60] flex flex-col p-4 sm:p-6 overflow-hidden select-none">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onFinish} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest shadow-sm hover:text-indigo-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Quit
        </button>
        
        <div className="flex flex-col items-center">
          {match.umpireNames && match.umpireNames.length > 0 && (
            <div className="flex items-center gap-1.5 mb-1 px-3 py-0.5 bg-slate-100 rounded-full border border-slate-200">
              <UserCheck className="w-3 h-3 text-emerald-600" />
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                Umpire: {match.umpireNames.join(", ")}
              </span>
            </div>
          )}
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">
             Game {match.scores.length + 1} • {match.pointsTarget} Pts
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: match.format }).map((_, i) => (
              <div key={i} className={`w-10 h-1.5 rounded-full transition-all duration-500 ${
                i < match.scores.length ? 'bg-indigo-600 shadow-sm' : 'bg-slate-200'
              }`} />
            ))}
          </div>
        </div>

        <button onClick={undoPoint} className="bg-white px-4 py-2 rounded-xl text-slate-400 font-black text-xs uppercase tracking-widest shadow-sm hover:text-slate-900 transition-colors">
           Undo
        </button>
      </div>

      {/* Main Score Area */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full min-h-0 mb-6">
        {/* Team 1 Score Card */}
        <button 
          onClick={() => addPoint(1)}
          className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-[6px] transition-all active:scale-95 relative overflow-hidden ${
            t1Score > t2Score 
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-200' 
              : 'bg-white border-slate-100 text-slate-900 shadow-md'
          }`}
        >
          <div className="mb-2 text-center relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight truncate max-w-[200px]">{team1.name}</h3>
            <div className={`mt-1 inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              t1Score > t2Score ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              Sets: {t1GamesWon}
            </div>
          </div>
          <div className="text-[12rem] font-black tabular-nums leading-none tracking-tighter relative z-10">
            {t1Score}
          </div>
          <div className="mt-4 flex items-center gap-2 opacity-30 relative z-10">
             <PlusCircle className="w-5 h-5" />
             <span className="text-xs font-black uppercase">Tap to Score</span>
          </div>
          {/* Subtle background rank indicator */}
          <div className="absolute -bottom-10 -left-10 text-[20rem] font-black opacity-[0.03] select-none pointer-events-none">1</div>
        </button>

        {/* Team 2 Score Card */}
        <button 
          onClick={() => addPoint(2)}
          className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-[6px] transition-all active:scale-95 relative overflow-hidden ${
            t2Score > t1Score 
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-2xl shadow-emerald-200' 
              : 'bg-white border-slate-100 text-slate-900 shadow-md'
          }`}
        >
          <div className="mb-2 text-center relative z-10">
            <h3 className="text-xl font-black uppercase tracking-tight truncate max-w-[200px]">{team2.name}</h3>
            <div className={`mt-1 inline-block px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              t2Score > t1Score ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              Sets: {t2GamesWon}
            </div>
          </div>
          <div className="text-[12rem] font-black tabular-nums leading-none tracking-tighter relative z-10">
            {t2Score}
          </div>
          <div className="mt-4 flex items-center gap-2 opacity-30 relative z-10">
             <PlusCircle className="w-5 h-5" />
             <span className="text-xs font-black uppercase">Tap to Score</span>
          </div>
          <div className="absolute -bottom-10 -right-10 text-[20rem] font-black opacity-[0.03] select-none pointer-events-none">2</div>
        </button>
      </div>

      {/* Footer / Finish Actions */}
      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={resetGameScore}
          className="p-5 bg-white rounded-3xl text-slate-300 hover:text-red-500 transition-colors shadow-sm"
          title="Reset Game"
        >
          <RotateCw className="w-6 h-6" />
        </button>

        {canFinishGame ? (
          <button
            onClick={handleFinishGame}
            className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl animate-in slide-in-from-bottom-6 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            SUBMIT GAME RESULT
          </button>
        ) : (
          <div className="flex-1 bg-slate-100 rounded-[2rem] py-6 text-center text-slate-400 font-black uppercase tracking-[0.2em] text-sm italic">
            First to {match.pointsTarget} Points
          </div>
        )}

        <div className="w-16 hidden sm:block"></div>
      </div>
    </div>
  );
};

export default MatchScorer;
