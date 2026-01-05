
import React, { useState, useCallback } from 'react';
import { 
  Trophy, 
  Medal, 
  Swords, 
  Star, 
  Lock, 
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  LayoutList, 
  Activity,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { StandingsEntry } from '../types';

interface StandingsProps {
  standings: StandingsEntry[];
  top4: StandingsEntry[];
  onAddTieUp: (team1Id: string, team2Id: string) => void;
  onSelectTeam: (id: string) => void;
  isAdmin: boolean;
}

const Standings: React.FC<StandingsProps> = ({ standings, top4, onAddTieUp, onSelectTeam, isAdmin }) => {
  const [showPlayoffPicker, setShowPlayoffPicker] = useState(false);
  const [viewMode, setViewMode] = useState<'elite' | 'league'>('elite');
  const [selectedT1, setSelectedT1] = useState('');
  const [selectedT2, setSelectedT2] = useState('');
  
  // For interactive cards
  const [pair1, setPair1] = useState<string | null>(null);

  const handleCreatePlayoff = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (selectedT1 && selectedT2 && selectedT1 !== selectedT2) {
      onAddTieUp(selectedT1, selectedT2);
      setShowPlayoffPicker(false);
      setSelectedT1('');
      setSelectedT2('');
    }
  };

  const handleQuickMatch = (e: React.MouseEvent, idx1: number, idx2: number) => {
    e.preventDefault();
    if (!isAdmin || !top4[idx1] || !top4[idx2]) return;
    onAddTieUp(top4[idx1].teamId, top4[idx2].teamId);
  };

  const handleCardClick = (teamId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAdmin) {
      onSelectTeam(teamId);
      return;
    }
    if (!pair1) {
      setPair1(teamId);
    } else if (pair1 === teamId) {
      setPair1(null);
    } else {
      onAddTieUp(pair1, teamId);
      setPair1(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Tournament Rankings</h2>
          <p className="text-slate-500 font-bold text-sm">Automated standings based on the 3-point weighted system</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm">
          <button 
            onClick={() => setViewMode('elite')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'elite' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Elite View
          </button>
          <button 
            onClick={() => setViewMode('league')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewMode === 'league' 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            League Table
          </button>
        </div>
      </div>

      {/* Admin Playoff Tools */}
      {top4.length >= 2 && isAdmin && (
        <div className="flex justify-end">
          <button 
            onClick={() => setShowPlayoffPicker(!showPlayoffPicker)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl active:scale-95 border-b-4 ${
              showPlayoffPicker 
                ? 'bg-slate-200 text-slate-700 border-slate-300' 
                : 'bg-slate-900 text-white hover:bg-black border-slate-700'
            }`}
          >
            <Swords className="w-4 h-4" />
            {showPlayoffPicker ? 'Close Gen' : 'Generate Playoff'}
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="flex justify-end">
           <div className="flex items-center gap-2 text-slate-400 bg-white/40 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border border-white/60">
            <Lock className="w-3 h-3" />
            Admin Playoff Tools Locked
          </div>
        </div>
      )}

      {showPlayoffPicker && isAdmin && (
        <div className="bg-white border-2 border-indigo-600 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Playoff Generator</h3>
              <p className="text-sm text-slate-500 font-medium">Quickly schedule matches between the top contenders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Standard Pairings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickMatchButton label="Semi 1 (1st vs 4th)" onClick={(e) => handleQuickMatch(e, 0, 3)} disabled={top4.length < 4} />
                <QuickMatchButton label="Semi 2 (2nd vs 3rd)" onClick={(e) => handleQuickMatch(e, 1, 2)} disabled={top4.length < 3} />
                <QuickMatchButton label="Finals (1st vs 2nd)" onClick={(e) => handleQuickMatch(e, 0, 1)} disabled={top4.length < 2} highlight />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Custom Matchup</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-1">
                  <select 
                    value={selectedT1}
                    onChange={(e) => setSelectedT1(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Team A</option>
                    {top4.map((t, i) => <option key={t.teamId} value={t.teamId}>Rank {i+1}: {t.teamName}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <select 
                    value={selectedT2}
                    onChange={(e) => setSelectedT2(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Team B</option>
                    {top4.map((t, i) => <option key={t.teamId} value={t.teamId}>Rank {i+1}: {t.teamName}</option>)}
                  </select>
                </div>
                <button 
                  onClick={handleCreatePlayoff}
                  disabled={!selectedT1 || !selectedT2 || selectedT1 === selectedT2}
                  className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Create Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'league' ? (
        /* Detailed League Table View */
        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
             <TableIcon className="w-5 h-5 text-indigo-600" />
             <h3 className="font-black text-slate-900 uppercase tracking-tight">Full League Standings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Team Identity</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">PTS</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Tie-ups W/L</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Set Record</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Diff</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-slate-400 font-bold italic">No tournament data recorded yet.</td>
                  </tr>
                ) : (
                  standings.map((entry, index) => (
                    <tr 
                      key={entry.teamId} 
                      onClick={() => onSelectTeam(entry.teamId)}
                      className={`hover:bg-indigo-50/50 transition-colors cursor-pointer group ${index < 4 ? 'bg-indigo-50/20' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                            index === 0 ? 'bg-amber-100 text-amber-600 border-amber-200 shadow-sm' :
                            index === 1 ? 'bg-slate-100 text-slate-600 border-slate-200' :
                            index === 2 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            'bg-white text-slate-400 border-slate-100'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-lg tracking-tight">{entry.teamName}</div>
                          {index < 4 && (
                            <div className="flex items-center gap-1.5 mt-1">
                               <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-indigo-200">
                                 Elite Contender
                               </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="inline-flex flex-col items-center bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-100">
                          <span className="font-black text-lg tabular-nums leading-none mb-1">{entry.points}</span>
                          <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Points</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="inline-flex flex-col items-center bg-white px-3 py-1 rounded-xl border border-slate-100 shadow-sm">
                          <span className="font-black text-slate-900 text-sm tabular-nums">{entry.wins} - {entry.losses}</span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Matches</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="inline-flex flex-col items-center bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
                          <span className="font-black text-slate-600 text-sm tabular-nums">
                            {entry.gamesWon} - {entry.gamesLost}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sets</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`font-black px-3 py-1 rounded-full text-xs tabular-nums border ${
                          entry.pointDiff > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          entry.pointDiff < 0 ? 'bg-red-50 text-red-700 border-red-100' : 
                          'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center">
                           <div className="p-2 bg-slate-50 rounded-lg text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
                              <ArrowRight className="w-4 h-4" />
                           </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] italic">Points: 3 (2-0), 2 (2-1), 1 (1-2), 0 (0-2). Match Wins & Net Sets are Tie-breakers.</p>
          </div>
        </div>
      ) : (
        /* Elite Contenders View (Visual Cards) */
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
          
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-12 relative z-10">
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-4 rounded-3xl shadow-xl border border-indigo-400/20">
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
              </div>
              <div>
                <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none mb-2">PRO LEAGUE ELITE</h3>
                <p className="text-indigo-300/60 font-black text-[10px] tracking-[0.2em] uppercase">
                  Top 4 Performance Matrix (Weighted Scoring)
                </p>
              </div>
            </div>
            <button 
              onClick={() => setViewMode('league')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 group"
            >
               View Full League <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {top4.length > 0 ? top4.map((t, idx) => {
              const isSelected = pair1 === t.teamId;
              const rankColor = idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-indigo-400';
              const rankBg = idx === 0 ? 'bg-amber-400/10' : idx === 1 ? 'bg-slate-400/10' : idx === 2 ? 'bg-orange-400/10' : 'bg-indigo-400/10';
              
              return (
                <div 
                  key={t.teamId} 
                  onClick={(e) => isAdmin ? handleCardClick(t.teamId, e) : onSelectTeam(t.teamId)}
                  className={`relative bg-white/[0.03] border-2 rounded-[2.5rem] p-8 flex flex-col items-center text-center group transition-all duration-500 cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500/20 ring-8 ring-indigo-500/10 scale-105 shadow-[0_30px_60px_-12px_rgba(99,102,241,0.25)]' 
                      : 'border-white/5 hover:bg-white/5 hover:border-white/20 hover:-translate-y-2'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -top-4 -right-4 bg-indigo-500 p-2.5 rounded-full shadow-2xl animate-in zoom-in border-4 border-slate-900">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  )}
                  
                  <div className={`text-5xl font-black mb-4 leading-none transition-colors ${rankColor} opacity-20 group-hover:opacity-40`}>
                    0{idx + 1}
                  </div>
                  
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center font-black text-3xl mb-6 shadow-2xl transition-all duration-700 ${
                    isSelected ? 'bg-white text-indigo-600 scale-110' : `bg-white/5 text-white border border-white/10 group-hover:bg-indigo-600 group-hover:border-indigo-500`
                  }`}>
                    {t.teamName.charAt(0)}
                  </div>
                  
                  <h4 className="font-black text-xl mb-6 truncate w-full tracking-tight">{t.teamName}</h4>
                  
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <div className="flex flex-col items-center justify-center bg-indigo-600/40 p-3 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-600 transition-colors">
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300 mb-1">Points</span>
                      <span className="text-lg font-black text-white tabular-nums">{t.points}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-white/5 p-3 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Wins</span>
                      <span className="text-lg font-black text-white tabular-nums">{t.wins}</span>
                    </div>
                  </div>

                  <div className={`mt-4 w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${rankBg} ${rankColor} border border-white/5`}>
                     Net Sets: {t.gamesWon - t.gamesLost > 0 ? `+${t.gamesWon - t.gamesLost}` : t.gamesWon - t.gamesLost}
                  </div>

                  {isAdmin && !isSelected && pair1 && (
                    <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                       <Swords className="w-12 h-12 text-white mb-3 animate-bounce" />
                       <span className="font-black text-xs uppercase tracking-widest text-center">VS {top4.find(x => x.teamId === pair1)?.teamName}</span>
                       <span className="text-[10px] font-bold text-white/60 mt-2 uppercase">Click to Tie-up</span>
                    </div>
                  )}
                </div>
              );
            }) : (
               <div className="col-span-full py-24 text-center bg-white/5 rounded-[3rem] border-4 border-dashed border-white/5 text-slate-600 font-black uppercase tracking-widest italic">
                  Tournament data will reveal the top contenders here.
               </div>
            )}
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
               <Activity className="w-3 h-3 text-indigo-500" />
               League Ranking prioritizes Points (Straight Sets)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QuickMatchButton = ({ label, onClick, disabled, highlight }: { label: string, onClick: (e: React.MouseEvent) => void, disabled: boolean, highlight?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`group flex items-center justify-between w-full px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 active:scale-[0.98] ${
      disabled 
        ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-50' 
        : highlight
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 shadow-xl'
          : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-slate-50 shadow-sm'
    }`}
  >
    <span>{label}</span>
    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${disabled ? 'text-slate-200' : 'text-indigo-400'}`} />
  </button>
);

export default Standings;
