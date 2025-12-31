
import React, { useState } from 'react';
import { 
  Users, Swords, Trophy, Play, Plus, ArrowRight, RotateCcw, Lock, Share2, 
  Check, X, Medal, Settings2, CheckCircle2, BookOpen, Info, HelpCircle, 
  Activity, ListChecks, Target, ChevronRight
} from 'lucide-react';
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
  const [showHandbook, setShowHandbook] = useState(false);

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
    
    onAddTeam({
      id: crypto.randomUUID(),
      tournamentId: tournament.id,
      name: quickTeamName.trim(),
      members: ['Player 1', 'Player 2']
    });
    
    setQuickTeamName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tournament?.name}</h2>
            <div className="relative">
              <button 
                onClick={() => isAdmin && setIsEditingFormat(!isEditingFormat)}
                className="bg-indigo-600/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-b-4 border-indigo-800 flex items-center gap-2 transition-all hover:bg-indigo-700 active:translate-y-0.5 active:border-b-0 backdrop-blur-sm"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Format: {tournament?.format}
              </button>
              {isEditingFormat && isAdmin && (
                <div className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 min-w-[200px] animate-in slide-in-from-top-2">
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
          <p className="text-slate-700 font-bold text-sm">Real-time tournament tracking & manual tie-ups.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowHandbook(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <BookOpen className="w-4 h-4" />
            Full Handbook
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/40 border border-white/60 px-4 py-2.5 rounded-2xl text-slate-700 font-bold hover:bg-white/60 transition-all group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            <span className="text-sm">{copied ? 'Copied' : 'Share'}</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsAddingQuick(!isAddingQuick)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${isAddingQuick ? 'bg-slate-800 text-white' : 'bg-emerald-600/90 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
            >
              {isAddingQuick ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingQuick ? 'Close' : 'Add Teams'}
            </button>
          )}
        </div>
      </div>

      {/* Handbook Modal */}
      {showHandbook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowHandbook(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-indigo-600 p-3 rounded-2xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tournament Rules</h3>
                <p className="text-sm font-bold text-slate-500">Essential instructions for players and organizers</p>
              </div>
            </div>

            <div className="space-y-8">
              <HandbookSection 
                title="1. Ranking & Top 4" 
                icon={<Trophy className="w-5 h-5 text-amber-500" />}
                content="The top 4 teams are determined using the following tie-breaking criteria in order:"
                items={[
                  { label: "1. Match Points", desc: "Total match wins (The most important factor)." },
                  { label: "2. Set/Game Ratio", desc: "If match wins are tied, individual sets won across all matches decide the rank." },
                  { label: "3. Point Difference", desc: "The final tie-breaker: Total points scored minus points conceded." }
                ]}
              />

              <HandbookSection 
                title="2. Point Difference" 
                icon={<Activity className="w-5 h-5 text-indigo-500" />}
                content="We track every single point scored in every set played."
                items={[
                  { label: "Calculation", desc: "PD = (Sum of All Your Points) - (Sum of All Opponent Points)." },
                  { label: "Impact", desc: "Even if you lose a match, keeping the scores close helps your ranking!" }
                ]}
              />

              <HandbookSection 
                title="3. Team Setup" 
                icon={<Users className="w-5 h-5 text-emerald-500" />}
                content={`Currently ${teams.length} teams are registered.`}
                items={[
                  { label: "Manual Entry", desc: "Admins can add teams one-by-one with specific member names." },
                  { label: "Bulk Import", desc: "Import dozens of teams at once from a text list in the Teams tab." }
                ]}
              />
            </div>

            <button 
              onClick={() => setShowHandbook(false)}
              className="mt-10 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {isAddingQuick && isAdmin && (
        <div className="bg-indigo-600/80 backdrop-blur-xl rounded-[2.5rem] p-8 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Quick Team Entry</h3>
            </div>
          </div>
          <form onSubmit={handleQuickAddSubmit} className="flex flex-col sm:flex-row gap-4">
            <input 
              autoFocus required type="text" placeholder="Team Name..."
              value={quickTeamName} onChange={(e) => setQuickTeamName(e.target.value)}
              className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 font-bold text-lg outline-none focus:border-white transition-all"
            />
            <button type="submit" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-6 h-6 text-indigo-600" />} label="Total Teams" value={teams.length} onClick={() => onNavigate('teams')} color="indigo" />
        <StatCard icon={<Swords className="w-6 h-6 text-emerald-600" />} label="Matches" value={matches.length} onClick={() => onNavigate('matches')} color="emerald" />
        <StatCard icon={<Trophy className="w-6 h-6 text-amber-600" />} label="1st Place" value={standings[0]?.teamName || 'TBD'} onClick={() => standings[0] ? onSelectTeam(standings[0].teamId) : onNavigate('standings')} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Matches & Guide */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tournament Readme Checklist */}
          <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-2xl">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tournament Manifesto</h3>
                <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest">Public Instructions & Format</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Match Format</h4>
                    <p className="text-[11px] text-slate-500 font-bold">Standard matches: Best of 3 sets to 21 points. Knockouts may vary.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Top 4 Calculation</h4>
                    <p className="text-[11px] text-slate-500 font-bold">Calculated by: 1. Match Wins, 2. Set Difference, 3. Point Difference (PD).</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">PD Calculation</h4>
                    <p className="text-[11px] text-slate-500 font-bold">Point Difference = (Total Scored Points) - (Total Conceded Points).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Team Roster</h4>
                    <p className="text-[11px] text-slate-500 font-bold">Currently {teams.length} teams active. View detailed squads in the Teams tab.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowHandbook(true)}
              className="mt-8 w-full flex items-center justify-center gap-2 text-indigo-700 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all"
            >
              View Full Scoring Guide <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          {/* Live Activity */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                On Court Now
              </h3>
            </div>
            {activeMatches.length === 0 ? (
              <div className="bg-white/30 backdrop-blur-lg border-2 border-dashed border-white/60 rounded-[2.5rem] p-12 text-center group">
                <p className="text-slate-700 font-bold text-lg mb-4">No live matches at the moment.</p>
                <button onClick={() => onNavigate('matches')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all inline-flex items-center gap-2 shadow-lg">
                  Start New Match <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map(m => (
                  <div key={m.id} onClick={() => onNavigate('matches')} className="bg-white/60 backdrop-blur-xl border-2 border-white/60 rounded-[2rem] p-6 flex justify-between items-center cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-center w-24">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 mx-auto mb-1">{teams.find(t => t.id === m.team1Id)?.name.charAt(0)}</div>
                        <div className="font-bold text-slate-900 text-xs truncate">{teams.find(t => t.id === m.team1Id)?.name}</div>
                      </div>
                      <div className="flex-1 text-center bg-slate-900 text-white py-3 rounded-2xl font-black text-3xl tabular-nums shadow-lg border-b-4 border-indigo-500">
                        {m.scores[m.scores.length - 1]?.team1 || 0} : {m.scores[m.scores.length - 1]?.team2 || 0}
                      </div>
                      <div className="text-center w-24">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 mx-auto mb-1">{teams.find(t => t.id === m.team2Id)?.name.charAt(0)}</div>
                        <div className="font-bold text-slate-900 text-xs truncate">{teams.find(t => t.id === m.team2Id)?.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Mini Leaderboard */}
        <section className="bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px]">
          <div className="p-8 border-b border-white/10 bg-white/5">
             <h3 className="font-black text-white text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                <Trophy className="w-8 h-8 text-amber-400" />
                Standings
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {standings.length === 0 ? (
              <div className="p-12 text-center text-white/30 font-bold italic">Waiting for matches...</div>
            ) : (
              <div className="divide-y divide-white/5">
                {standings.slice(0, 6).map((s, i) => (
                  <div key={s.teamId} onClick={() => onSelectTeam(s.teamId)} className="px-8 py-6 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-all group">
                    <div className="flex items-center gap-5">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                      <div>
                        <div className="font-black text-white text-lg group-hover:text-indigo-400 transition-colors">{s.teamName}</div>
                        <div className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">{s.wins} Wins • PD {s.pointDiff}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('standings')} className="p-6 bg-white/5 text-center text-white/50 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border-t border-white/5">View Full Table</button>
        </section>
      </div>
    </div>
  );
};

const HandbookSection = ({ title, icon, content, items }: { title: string, icon: React.ReactNode, content: string, items: { label: string, desc: string }[] }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h4>
    </div>
    <p className="text-slate-600 text-sm leading-relaxed mb-4">{content}</p>
    <div className="space-y-3 pl-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-4">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 shrink-0"></div>
          <div>
            <span className="block text-xs font-black text-indigo-700 uppercase tracking-tight">{item.label}</span>
            <span className="text-sm text-slate-500">{item.desc}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({ icon, label, value, onClick, color }: { icon: React.ReactNode, label: string, value: string | number, onClick: () => void, color: 'indigo' | 'emerald' | 'amber' }) => {
  const colorClasses = {
    indigo: 'border-indigo-200/50 hover:border-indigo-500 bg-white/40',
    emerald: 'border-emerald-200/50 hover:border-emerald-500 bg-white/40',
    amber: 'border-amber-200/50 hover:border-amber-500 bg-white/40',
  };
  return (
    <div onClick={onClick} className={`p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all cursor-pointer group shadow-lg relative overflow-hidden ${colorClasses[color]}`}>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="p-3 bg-white/60 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">{icon}</div>
        <span className="text-slate-500 font-black text-xs uppercase tracking-[0.25em]">{label}</span>
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter relative z-10 group-hover:translate-x-2 transition-transform duration-300">{value}</div>
    </div>
  );
};

export default Dashboard;
