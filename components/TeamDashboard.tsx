
import React from 'react';
import { 
  ChevronLeft, 
  Trophy, 
  Activity, 
  History, 
  Shield, 
  Clock, 
  Calendar, 
  User, 
  Users,
  TrendingUp, 
  CheckCircle2,
  PlayCircle,
  Medal,
  ExternalLink,
  Swords
} from 'lucide-react';
import { Team, Match, StandingsEntry } from '../types';

interface TeamDashboardProps {
  team: Team;
  matches: Match[];
  teams: Team[];
  standings: StandingsEntry[];
  onBack: () => void;
  onStartMatch: (id: string) => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, matches, teams, standings, onBack, onStartMatch }) => {
  const teamMatches = matches.filter(m => m.team1Id === team.id || m.team2Id === team.id);
  const completedMatches = teamMatches.filter(m => m.status === 'completed').sort((a, b) => b.createdAt - a.createdAt);
  const remainingMatches = teamMatches.filter(m => m.status !== 'completed').sort((a, b) => {
    if (a.scheduledAt && b.scheduledAt) return a.scheduledAt - b.scheduledAt;
    return (a.order || 0) - (b.order || 0);
  });

  const scheduledCount = remainingMatches.length;
  const playedCount = completedMatches.length;
  const wonCount = completedMatches.filter(m => m.winnerId === team.id).length;
  const lostCount = playedCount - wonCount;
  
  const teamStats = standings.find(s => s.teamId === team.id);
  const teamRank = standings.findIndex(s => s.teamId === team.id) + 1;
  const teamPoints = teamStats?.pointsFor || 0;
  const gamesWonTotal = teamStats?.gamesWon || 0;

  const form = completedMatches.slice(0, 5).map(m => m.winnerId === team.id ? 'W' : 'L').reverse();

  const getTeam = (id: string) => teams.find(t => t.id === id);

  // Head-to-Head Aggregation
  const h2h = teams.filter(t => t.id !== team.id).map(opponent => {
    const duels = completedMatches.filter(m => m.team1Id === opponent.id || m.team2Id === opponent.id);
    const wins = duels.filter(m => m.winnerId === team.id).length;
    const losses = duels.length - wins;
    return { opponent, wins, losses, total: duels.length };
  }).filter(h => h.total > 0);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-95"><ChevronLeft className="w-6 h-6" /></button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{team.name}</h2>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-lg shadow-indigo-100">
                <TrendingUp className="w-4 h-4" /> Rank #{teamRank}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200">
                <Shield className="w-3 h-3" /> Competitive Core
              </span>
              <div className="flex gap-1 ml-2">
                {form.map((res, i) => (
                  <span key={i} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-black ${res === 'W' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{res}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center gap-6 shadow-sm">
          <div className="text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Points For</div>
            <div className="text-2xl font-black text-slate-900">{teamPoints}</div>
          </div>
          <div className="w-px h-8 bg-slate-100"></div>
          <div className="text-center">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Diff</div>
            <div className="text-2xl font-black text-indigo-600">{standings.find(s => s.teamId === team.id)?.pointDiff || 0}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <StatItem label="Remaining" value={scheduledCount} color="slate" icon={<Clock className="w-4 h-4"/>} />
        <StatItem label="Played" value={playedCount} color="indigo" icon={<Activity className="w-4 h-4"/>} />
        <StatItem label="Sets Won" value={gamesWonTotal} color="emerald" icon={<Medal className="w-4 h-4"/>} />
        <StatItem label="Match W" value={wonCount} color="emerald" icon={<Trophy className="w-4 h-4"/>} />
        <StatItem label="Match L" value={lostCount} color="red" icon={<History className="w-4 h-4"/>} />
        <StatItem label="Duty" value={matches.filter(m => m.umpireNames?.some(name => name.trim().toLowerCase() === team.name.trim().toLowerCase())).length} color="amber" icon={<Users className="w-4 h-4"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
             <div className="flex items-center gap-3 mb-6"><div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><Users className="w-6 h-6" /></div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Squad</h3></div>
             <div className="space-y-3">
               {team.members.map((member, i) => (
                 <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors shadow-sm"><User className="w-6 h-6" /></div>
                   <div><div className="font-black text-slate-900 text-lg leading-tight">{member}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Official Athlete</div></div>
                 </div>
               ))}
             </div>
          </section>

          {/* H2H Section */}
          <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white"><Swords className="w-6 h-6" /></div>
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">H2H Analytics</h3>
                   <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Historical Rivalries</p>
                </div>
             </div>
             <div className="space-y-4">
                {h2h.length === 0 ? (
                  <div className="py-12 text-center text-white/30 font-bold italic">No rivalries recorded yet.</div>
                ) : (
                  h2h.map(record => (
                    <div key={record.opponent.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                       <div className="font-bold text-sm truncate max-w-[120px]">{record.opponent.name}</div>
                       <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                             <span className="bg-emerald-500 text-white w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black">{record.wins}</span>
                             <span className="bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black">{record.losses}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${record.wins > record.losses ? 'text-emerald-400' : record.losses > record.wins ? 'text-red-400' : 'text-slate-400'}`}>
                             {record.wins > record.losses ? 'Dominate' : record.losses > record.wins ? 'Behind' : 'Equal'}
                          </span>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3"><div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600"><PlayCircle className="w-6 h-6" /></div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fixtures & Times</h3></div>
               <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">{remainingMatches.length} Pending</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/80">
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date / Time</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Contestant</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Active Pairings</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {remainingMatches.length === 0 ? (<tr><td colSpan={4} className="py-20 text-center text-slate-400 italic font-medium">No upcoming fixtures found.</td></tr>) : (
                     remainingMatches.map(match => {
                       const isTeam1 = match.team1Id === team.id;
                       const opponent = getTeam(isTeam1 ? match.team2Id : match.team1Id);
                       const opponentName = opponent?.name || 'Deleted Team';
                       const opponentMembers = opponent?.members || [];

                       return (
                         <tr key={match.id} className="hover:bg-indigo-50/30 transition-colors group">
                           <td className="px-8 py-5">
                             <div className="flex flex-col">
                               <div className="flex items-center gap-2 text-slate-900 font-black text-sm mb-1">
                                 <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString() : 'TBD'}
                               </div>
                               <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                 <Clock className="w-3 h-3" />
                                 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center font-black text-indigo-400 shrink-0">{opponentName.charAt(0)}</div>
                               <div>
                                 <div className="font-black text-slate-900 text-sm">{opponentName}</div>
                                 <div className="flex flex-wrap gap-1 mt-1">
                                   {opponentMembers.map((m, i) => (
                                     <span key={i} className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{m}</span>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-5">
                             <div className="flex flex-col gap-1">
                                {match.lineups?.slice(0, 2).map((l, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 text-[9px] text-slate-500">
                                    <span className="font-black text-indigo-600">G{idx+1}:</span>
                                    <span className="truncate max-w-[120px] font-bold">{(isTeam1 ? l.team1Players : l.team2Players).join(' & ')}</span>
                                  </div>
                                ))}
                                {!match.lineups && <span className="text-[9px] text-slate-300 italic font-bold">Lineup Pending</span>}
                             </div>
                           </td>
                           <td className="px-8 py-5 text-right"><button onClick={() => onStartMatch(match.id)} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Start <ExternalLink className="w-3.5 h-3.5" /></button></td>
                         </tr>
                       );
                     })
                   )}
                 </tbody>
               </table>
             </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
             <div className="flex items-center gap-3 mb-8"><div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div><h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Performance</h3></div>
             {completedMatches.length === 0 ? (<div className="py-20 text-center text-slate-400 italic font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">History is empty.</div>) : (
               <div className="space-y-4">
                 {completedMatches.map(match => {
                   const isTeam1 = match.team1Id === team.id;
                   const opponent = getTeam(isTeam1 ? match.team2Id : match.team1Id);
                   const opponentName = opponent?.name || 'Deleted Team';
                   const opponentMembers = opponent?.members || [];
                   const isWinner = match.winnerId === team.id;
                   return (
                     <div key={match.id} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col md:flex-row items-center gap-6 group hover:bg-white transition-all shadow-sm">
                        <div className="flex flex-col items-center md:items-start min-w-[100px]"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 ${isWinner ? 'bg-emerald-500 text-white shadow-lg' : 'bg-red-500 text-white shadow-lg'}`}>{isWinner ? 'Victory' : 'Defeat'}</span><span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Match #{match.order}</span></div>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                           <div className="flex items-center gap-6">
                             <span className="font-black text-slate-900 text-sm truncate max-w-[80px]">{team.name}</span>
                             <div className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums">
                               {match.scores.filter(s => isTeam1 ? s.team1 > s.team2 : s.team2 > s.team1).length} - {match.scores.filter(s => isTeam1 ? s.team2 > s.team1 : s.team1 > s.team2).length}
                             </div>
                             <span className="font-black text-slate-900 text-sm truncate max-w-[80px]">{opponentName}</span>
                           </div>
                           <div className="flex flex-wrap justify-center gap-1">
                             <span className="text-[8px] text-slate-400 uppercase font-bold mr-1">Opponent Members:</span>
                             {opponentMembers.map((m, i) => (
                               <span key={i} className="text-[8px] bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded font-bold">{m}</span>
                             ))}
                           </div>
                        </div>
                        <div className="flex flex-col gap-1">
                           {match.lineups?.slice(0, match.scores.length).map((l, idx) => (
                             <div key={idx} className="bg-white px-2 py-0.5 rounded-md border border-slate-100 text-[8px] font-black text-slate-600 shadow-sm flex items-center justify-between min-w-[120px]">
                               <span>{(isTeam1 ? l.team1Players : l.team2Players).join(' & ')}</span>
                               <span className="text-slate-300 ml-2">{isTeam1 ? `${match.scores[idx].team1}-${match.scores[idx].team2}` : `${match.scores[idx].team2}-${match.scores[idx].team1}`}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                   );
                 })}
               </div>
             )}
          </section>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) => {
  const themes: Record<string, string> = {
    slate: "bg-white text-slate-900 border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-red-50 text-red-700 border-red-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  };
  return (
    <div className={`p-6 rounded-3xl border shadow-sm ${themes[color] || themes.slate} transition-transform hover:-translate-y-1`}><div className="flex items-center gap-2 mb-2 opacity-60">{icon}<span className="text-[10px] font-black uppercase tracking-widest">{label}</span></div><div className="text-4xl font-black tracking-tighter tabular-nums leading-none">{value}</div></div>
  );
};

export default TeamDashboard;
