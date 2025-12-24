
import React, { useState } from 'react';
import { Trophy, ArrowUpRight, Medal, Swords, Info, Star, Lock, Zap, ChevronRight } from 'lucide-react';
import { StandingsEntry } from '../types';

interface StandingsProps {
  standings: StandingsEntry[];
  top4: StandingsEntry[];
  onAddTieUp: (team1Id: string, team2Id: string) => void;
  isAdmin: boolean;
}

const Standings: React.FC<StandingsProps> = ({ standings, top4, onAddTieUp, isAdmin }) => {
  const [showPlayoffPicker, setShowPlayoffPicker] = useState(false);
  const [selectedT1, setSelectedT1] = useState('');
  const [selectedT2, setSelectedT2] = useState('');

  const handleCreatePlayoff = () => {
    if (!isAdmin) return;
    if (selectedT1 && selectedT2 && selectedT1 !== selectedT2) {
      onAddTieUp(selectedT1, selectedT2);
      setShowPlayoffPicker(false);
      setSelectedT1('');
      setSelectedT2('');
    }
  };

  const handleQuickMatch = (idx1: number, idx2: number) => {
    if (!isAdmin || !top4[idx1] || !top4[idx2]) return;
    onAddTieUp(top4[idx1].teamId, top4[idx2].teamId);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leaderboard</h2>
          <p className="text-slate-500">Ranked by Wins, then Point Difference</p>
        </div>
        
        {top4.length >= 2 && (
          isAdmin ? (
            <button 
              onClick={() => setShowPlayoffPicker(!showPlayoffPicker)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-lg active:scale-95 ${
                showPlayoffPicker ? 'bg-slate-200 text-slate-700' : 'bg-slate-900 text-white hover:bg-black'
              }`}
            >
              <Swords className="w-5 h-5" />
              {showPlayoffPicker ? 'Close Playoff Panel' : 'Schedule Playoff Match'}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-slate-400 bg-slate-100 px-4 py-2 rounded-lg font-bold text-sm">
              <Lock className="w-4 h-4" />
              Admin Playoff Tools
            </div>
          )
        )}
      </div>

      {showPlayoffPicker && isAdmin && (
        <div className="bg-white border-2 border-indigo-600 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Playoff Generator</h3>
              <p className="text-sm text-slate-500">Quickly schedule matches between the top contenders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Standard Pairings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickMatchButton 
                  label="Semi 1 (1st vs 4th)" 
                  onClick={() => handleQuickMatch(0, 3)} 
                  disabled={top4.length < 4}
                />
                <QuickMatchButton 
                  label="Semi 2 (2nd vs 3rd)" 
                  onClick={() => handleQuickMatch(1, 2)} 
                  disabled={top4.length < 3}
                />
                <QuickMatchButton 
                  label="Finals (1st vs 2nd)" 
                  onClick={() => handleQuickMatch(0, 1)} 
                  disabled={top4.length < 2}
                  highlight
                />
              </div>
            </div>

            {/* Custom Picker */}
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

      {/* Standings Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Team</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Wins</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Losses</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Pts For</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Pts Against</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No results available yet.
                  </td>
                </tr>
              ) : (
                standings.map((entry, index) => (
                  <tr key={entry.teamId} className={`hover:bg-slate-50 transition-colors ${index < 4 ? 'bg-indigo-50/20' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                          index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                          index === 1 ? 'bg-slate-200 text-slate-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'text-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                        {index < 4 && <Medal className="w-4 h-4 text-indigo-400" />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-900">{entry.teamName}</div>
                        {index < 4 && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-200">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Qualified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-slate-900">{entry.wins}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-sm">
                      {entry.losses}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-sm">
                      {entry.pointsFor}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 text-sm">
                      {entry.pointsAgainst}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold px-2 py-1 rounded-full text-xs ${
                        entry.pointDiff > 0 ? 'bg-emerald-100 text-emerald-700' : 
                        entry.pointDiff < 0 ? 'bg-red-100 text-red-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {entry.pointDiff > 0 ? `+${entry.pointDiff}` : entry.pointDiff}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
        <div className="flex items-start gap-4 mb-8">
          <div className="bg-white/10 p-3 rounded-2xl">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">THE ELITE FOUR</h3>
            <p className="text-slate-400 font-medium text-sm">Top ranked contenders eligible for the finals.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {top4.length > 0 ? top4.map((t, idx) => (
            <div key={t.teamId} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center group hover:bg-white/10 transition-all">
              <span className="text-4xl font-black text-white/5 mb-2 leading-none group-hover:text-indigo-500/10 transition-colors">0{idx + 1}</span>
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-xl mb-3 shadow-lg shadow-indigo-900/50">
                {t.teamName.charAt(0)}
              </div>
              <h4 className="font-bold text-lg mb-1">{t.teamName}</h4>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">{t.wins} Wins Total</p>
            </div>
          )) : (
             <div className="col-span-full py-6 text-center text-slate-500 font-medium italic">
                Standings will reveal the top 4 teams here.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuickMatchButton = ({ label, onClick, disabled, highlight }: { label: string, onClick: () => void, disabled: boolean, highlight?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`group flex items-center justify-between w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 active:scale-[0.98] ${
      disabled 
        ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-50' 
        : highlight
          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
          : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-slate-50'
    }`}
  >
    <span>{label}</span>
    <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${disabled ? 'text-slate-200' : 'text-indigo-400'}`} />
  </button>
);

export default Standings;
