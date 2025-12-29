
import React, { useState } from 'react';
import { Users, Swords, Trophy, Play, Plus, ArrowRight, RotateCcw, Lock, Share2, Check, X, Medal, Settings2, CheckCircle2 } from 'lucide-react';
import { Team, Match, StandingsEntry, ViewState, Tournament } from '../types';

interface DashboardProps {
  teams: Team[];
  matches: Match[];
  standings: StandingsEntry[];
  onNavigate: (view: ViewState) => void;
  onReset: () => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
  tournament?: Tournament;
  onUpdateTournament: (updated: Tournament) => void;
  onSelectTeam: (id: string) => void;
  onAddTeam: (team: Team) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ teams, matches, standings, onNavigate, onReset, isAdmin, onAdminLogin, tournament, onUpdateTournament, onSelectTeam, onAddTeam }) => {
  const [copied, setCopied] = useState(false);
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [quickTeamName, setQuickTeamName] = useState('');
  const [isAddingQuick, setIsAddingQuick] = useState(false);
  const [lastAddedTeam, setLastAddedTeam] = useState<string | null>(null);

  const activeMatches = matches.filter(m => m.status === 'live');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateFormat = (format: 'League' | 'Knockout') => {
    if (!tournament) return;
    onUpdateTournament({ ...tournament, format });
    setIsEditingFormat(false);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTeamName.trim() || !tournament) return;
    
    const teamName = quickTeamName.trim();
    onAddTeam({
      id: crypto.randomUUID(),
      tournamentId: tournament.id,
      name: teamName,
      members: ['Player 1', 'Player 2']
    });
    
    setLastAddedTeam(teamName);
    setQuickTeamName('');
    // Keep adding mode active for continuous entry
    setTimeout(() => setLastAddedTeam(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tournament?.name}</h2>
            <div className="relative">
              <button 
                onClick={() => isAdmin && setIsEditingFormat(!isEditingFormat)}
                className={`bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-b-4 border-indigo-800 flex items-center gap-2 transition-all hover:bg-indigo-700 active:translate-y-0.5 active:border-b-0`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Format: {tournament?.format}
              </button>
              {isEditingFormat && isAdmin && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 min-w-[200px] animate-in slide-in-from-top-2">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Select Format</div>
                  <button onClick={() => updateFormat('League')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">
                    League Table
                    {tournament?.format === 'League' && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button onClick={() => updateFormat('Knockout')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">
                    Knockout Bracket
                    {tournament?.format === 'Knockout' && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-500 font-medium text-sm">Organize your matches and track the leaderboard.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-slate-700 font-bold hover:bg-white transition-all group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            <span className="text-sm">{copied ? 'Link Copied' : 'Share'}</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsAddingQuick(!isAddingQuick)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${isAddingQuick ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
            >
              {isAddingQuick ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingQuick ? 'Close Panel' : 'Add Teams'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Form */}
      {isAddingQuick && isAdmin && (
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Rapid Team Registration</h3>
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Type a team name and hit Enter to add another</p>
              </div>
            </div>
            {lastAddedTeam && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl animate-in fade-in slide-in-from-right-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold">Added "{lastAddedTeam}"</span>
              </div>
            )}
          </div>
          <form onSubmit={handleQuickAddSubmit} className="flex flex-col sm:flex-row gap-4">
            <input 
              autoFocus
              required
              type="text"
              placeholder="e.g. Smash Kings"
              value={quickTeamName}
              onChange={(e) => setQuickTeamName(e.target.value)}
              className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 font-bold text-lg outline-none focus:border-white transition-all"
            />
            <button type="submit" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Add Team
            </button>
          </form>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-6 h-6 text-indigo-600" />} label="Teams" value={teams.length} onClick={() => onNavigate('teams')} color="indigo" />
        <StatCard icon={<Swords className="w-6 h-6 text-emerald-600" />} label="Matches" value={matches.length} onClick={() => onNavigate('matches')} color="emerald" />
        <StatCard icon={<Trophy className="w-6 h-6 text-amber-600" />} label="Leader" value={standings[0]?.teamName || 'TBD'} onClick={() => standings[0] ? onSelectTeam(standings[0].teamId) : onNavigate('standings')} color="amber" />
      </div>

      {/* Activity & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Court Activity
              </h3>
            </div>
            {activeMatches.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center group hover:border-indigo-300 transition-all">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 font-bold text-lg mb-2">No live matches</p>
                <button onClick={() => onNavigate('matches')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all inline-flex items-center gap-2 shadow-lg">
                  View Schedule <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map(m => (
                  <div key={m.id} onClick={() => onNavigate('matches')} className="bg-white border-2 border-indigo-50/10 rounded-[2rem] p-6 flex justify-between items-center cursor-pointer hover:border-indigo-500 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                    <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
                      <div className="text-center w-16">
                        <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 mb-1 mx-auto">{teams.find(t => t.id === m.team1Id)?.name.charAt(0)}</div>
                        <div className="font-black text-slate-900 text-xs truncate">{teams.find(t => t.id === m.team1Id)?.name}</div>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Live Score</div>
                        <div className="bg-slate-900 text-white min-w-[6rem] px-4 py-3 rounded-xl font-black text-2xl tabular-nums leading-tight border-b-4 border-indigo-500 text-center">
                          {m.scores[m.scores.length - 1]?.team1 || 0} - {m.scores[m.scores.length - 1]?.team2 || 0}
                        </div>
                      </div>
                      <div className="text-center w-16">
                        <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 mb-1 mx-auto">{teams.find(t => t.id === m.team2Id)?.name.charAt(0)}</div>
                        <div className="font-black text-slate-900 text-xs truncate">{teams.find(t => t.id === m.team2Id)?.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center gap-4 mb-6">
                <div className="bg-slate-100 p-3 rounded-2xl">
                  <Settings2 className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Management</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <QuickActionButton icon={<Users className="w-4 h-4" />} label="Team List" onClick={() => onNavigate('teams')} />
                <QuickActionButton icon={<Swords className="w-4 h-4" />} label="Tie-ups" onClick={() => onNavigate('matches')} />
                <QuickActionButton icon={<RotateCcw className="w-4 h-4" />} label="Reset Data" onClick={onReset} danger={isAdmin} />
                <QuickActionButton icon={<Lock className="w-4 h-4" />} label={isAdmin ? "Logout" : "Admin"} onClick={onAdminLogin} />
             </div>
          </section>
        </div>

        <section className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
          <div className="p-8 flex justify-between items-center border-b border-white/5 bg-white/5">
             <h3 className="font-black text-white text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                <Trophy className="w-8 h-8 text-amber-400" />
                Leaderboard
             </h3>
             <button onClick={() => onNavigate('standings')} className="bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Full Standings</button>
          </div>
          <div className="flex-1">
            {standings.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                 <p className="text-white/30 font-bold italic">No rankings yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {standings.slice(0, 5).map((s, i) => (
                  <div 
                    key={s.teamId} 
                    onClick={() => onSelectTeam(s.teamId)}
                    className="px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg transform transition-transform group-hover:scale-110 ${
                        i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-white/10 text-white/60'
                      }`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-black text-white text-xl group-hover:text-indigo-400 transition-colors">{s.teamName}</div>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{s.wins} Wins</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-4 rounded-2xl border transition-all text-sm font-bold ${
      danger 
        ? 'border-red-100 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95' 
        : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white hover:border-indigo-100 active:scale-95'
    }`}
  >
    <div className={`p-2 rounded-xl ${danger ? 'bg-red-200 text-red-700' : 'bg-white shadow-sm text-indigo-600'}`}>
      {icon}
    </div>
    {label}
  </button>
);

const StatCard = ({ icon, label, value, onClick, color }: { icon: React.ReactNode, label: string, value: string | number, onClick: () => void, color: 'indigo' | 'emerald' | 'amber' }) => {
  const colorClasses = {
    indigo: 'border-indigo-100 hover:border-indigo-500 bg-white',
    emerald: 'border-emerald-100 hover:border-emerald-500 bg-white',
    amber: 'border-amber-100 hover:border-amber-500 bg-white',
  };
  return (
    <div onClick={onClick} className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group shadow-lg relative overflow-hidden ${colorClasses[color]}`}>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">{icon}</div>
        <span className="text-slate-400 font-black text-xs uppercase tracking-[0.25em]">{label}</span>
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter relative z-10 group-hover:translate-x-2 transition-transform duration-300">{value}</div>
    </div>
  );
};

export default Dashboard;
