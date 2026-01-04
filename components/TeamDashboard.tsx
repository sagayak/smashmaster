
import React from 'react';
import { 
  ChevronLeft, 
  Swords, 
  Trophy, 
  Activity, 
  History, 
  Hash, 
  UserCheck, 
  Shield, 
  Clock, 
  Calendar, 
  User, 
  Users,
  TrendingUp, 
  LayoutList,
  CheckCircle2,
  PlayCircle,
  Flame,
  Medal,
  ExternalLink
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

  // Calculate form (last 5)
  const form = completedMatches.slice(0, 5).map(m => m.winnerId === team.id ? 'W' : 'L').reverse();

  // Calculate Head-to-Head Stats
  const h2hStats = completedMatches.reduce((acc, match) => {
    const isTeam1 = match.team1Id === team.id;
    const opponentId = isTeam1 ? match.team2Id : match.team1Id;
    const isWinner = match.winnerId === team.id;

    if (!acc[opponentId]) {
      acc[opponentId] = {
        opponentName: teams.find(t => t.id === opponentId)?.name || 'Unknown',
        wins: 0,
        losses: 0,
        matches: []
      };
    }

    if (isWinner) acc[opponentId].wins++;
    else acc[opponentId].losses++;

    acc[opponentId].matches.push(match);
    return acc;
  }, {} as Record<string, { opponentName: string, wins: number, losses: number, matches: Match[] }>);

  const h2hList = Object.values(h2hStats) as { opponentName: string, wins: number, losses: number, matches: Match[] }[];

  // Calculate umpiring count
  const umpiringCount = matches.filter(m => 
    m.umpireNames?.some(name => name.trim().toLowerCase() === team.name.trim().toLowerCase())
  ).length;

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Deleted Team';
  const getTeamMembers = (id: string) => teams.find(t => t.id === id)?.members || [];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={onBack}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{team.name}</h2>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-xl text-sm font-black flex items-center gap-1.5 shadow-lg shadow-indigo-100">
                <TrendingUp className="w-4 h-4" />
                Rank #{teamRank}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  <Shield className="w-3 h-3" /> Core Identity
               </span>
               <div className="flex gap-1 ml-2">
                 {form.map((res, i) => (
                   <span key={i} className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-black ${res === 'W' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                     {res}
                   </span>
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
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">PD</div>
              <div className="text-2xl font-black text-indigo-600">{standings.find(s => s.teamId === team.id)?.pointDiff || 0}</div>
           </div>
        </div>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <StatItem label="Remaining" value={scheduledCount} color="slate" icon={<Clock className="w-4 h-4"/>} />
        <StatItem label="Played" value={playedCount} color="indigo" icon={<Activity className="w-4 h-4"/>} />
        <StatItem label="Sets Won" value={gamesWonTotal} color="emerald" icon={<Medal className="w-4 h-4"/>} />
        <StatItem label="Match W" value={wonCount} color="emerald" icon={<Trophy className="w-4 h-4"/>} />
        <StatItem label="Match L" value={lostCount} color="red" icon={<History className="w-4 h-4"/>} />
        <StatItem label="Duty" value={umpiringCount} color="amber" icon={<UserCheck className="w-4 h-4"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* Squad Members Card */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                   <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Squad</h3>
             </div>
             <div className="space-y-3">
                {team.members.map((member, i) => (
                  <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100 group hover:border-indigo-200 hover:bg-white transition-all">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors shadow-sm">
                        <User className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="font-black text-slate-900 text-lg leading-tight">{member}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Player Rank #{(i+1) * 7}</div>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Points Table Context */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
                <LayoutList className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-black italic tracking-tight uppercase">Leaderboard Position</h3>
             </div>
             <div className="space-y-4 relative z-10">
                {standings.slice(Math.max(0, teamRank - 2), teamRank + 2).map((s, idx) => {
                   const isCurrent = s.teamId === team.id;
                   const absoluteRank = standings.findIndex(entry => entry.teamId === s.teamId) + 1;
                   return (
                     <div key={s.teamId} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${isCurrent ? 'bg-indigo-600 scale-105 shadow-xl ring-2 ring-indigo-400' : 'bg-white/5'}`}>
                        <div className="flex items-center gap-3">
                           <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${isCurrent ? 'bg-white text-indigo-600' : 'bg-white/10 text-white/40'}`}>
                              {absoluteRank}
                           </span>
                           <span className={`font-black text-sm truncate max-w-[120px] ${isCurrent ? 'text-white' : 'text-white/70'}`}>{s.teamName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{s.wins}W</span>
                           <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{s.gamesWon}S</span>
                        </div>
                     </div>
                   );
                })}
             </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Matches Tabular View */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-100">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                     <PlayCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Upcoming Schedule</h3>
               </div>
               <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-100">
                 {remainingMatches.length} Fixtures Remaining
               </span>
             </div>

             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50/80">
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date & Time</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Opponent Team</th>
                     <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Opponent Members</th>
                     <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {remainingMatches.length === 0 ? (
                     <tr>
                       <td colSpan={4} className="py-20 text-center text-slate-400 italic font-medium">
                         No upcoming fixtures found for this team.
                       </td>
                     </tr>
                   ) : (
                     remainingMatches.map(match => {
                       const isTeam1 = match.team1Id === team.id;
                       const opponentId = isTeam1 ? match.team2Id : match.team1Id;
                       const opponentName = getTeamName(opponentId);
                       const opponentMembers = getTeamMembers(opponentId);
                       
                       return (
                         <tr key={match.id} className="hover:bg-indigo-50/30 transition-colors group">
                           <td className="px-8 py-5">
                             <div className="flex flex-col">
                               <div className="flex items-center gap-2 text-slate-900 font-black text-sm mb-1">
                                 <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'TBD'}
                               </div>
                               <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                 <Clock className="w-3 h-3" />
                                 {match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Pending'}
                               </div>
                             </div>
                           </td>
                           <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                  {opponentName.charAt(0)}
                                </div>
                                <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-base tracking-tight">{opponentName}</div>
                             </div>
                           </td>
                           <td className="px-6 py-5">
                             <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                {opponentMembers.length > 0 ? opponentMembers.map((m, i) => (
                                  <span key={i} className="bg-white border border-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tight shadow-sm">
                                    {m}
                                  </span>
                                )) : (
                                  <span className="text-[9px] text-slate-300 italic font-bold">Squad Pending</span>
                                )}
                             </div>
                           </td>
                           <td className="px-8 py-5 text-right">
                             <button 
                               onClick={() => onStartMatch(match.id)}
                               className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-indigo-100 group-hover:shadow-lg active:scale-95"
                             >
                               Start <ExternalLink className="w-3.5 h-3.5" />
                             </button>
                           </td>
                         </tr>
                       );
                     })
                   )}
                 </tbody>
               </table>
             </div>
             <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">All scheduled matches contribute to final League Standing.</p>
             </div>
          </section>

          {/* Head-to-Head Section */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                     <Flame className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Head-to-Head Records</h3>
               </div>
             </div>

             {h2hList.length === 0 ? (
               <div className="py-12 text-center text-slate-400 italic font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                 No rivalries recorded yet. Play a match to see H2H stats.
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {h2hList.map((stat, i) => (
                   <div key={i} className="p-6 border border-slate-100 rounded-[2rem] bg-white hover:bg-slate-50/50 transition-all group shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                         <div className="font-black text-slate-900 text-lg">{stat.opponentName}</div>
                         <div className="flex items-center gap-1 bg-slate-900 text-white px-3 py-1 rounded-xl text-xs font-black tabular-nums">
                            {stat.wins} - {stat.losses}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score History</div>
                         <div className="flex flex-wrap gap-2">
                           {stat.matches.map((m: Match) => {
                             const isTeam1 = m.team1Id === team.id;
                             return m.scores.map((s, idx) => (
                               <span key={`${m.id}-${idx}`} className="bg-slate-100 px-2 py-1 rounded text-[10px] font-bold text-slate-600 border border-slate-200">
                                 {isTeam1 ? `${s.team1}-${s.team2}` : `${s.team2}-${s.team1}`}
                               </span>
                             ));
                           })}
                         </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </section>

          {/* Recent History */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
             <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                     <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent History</h3>
               </div>
             </div>

             {completedMatches.length === 0 ? (
               <div className="py-20 text-center text-slate-400 italic font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                 History is empty. Complete matches to see them here.
               </div>
             ) : (
               <div className="space-y-4">
                 {completedMatches.map(match => {
                   const isTeam1 = match.team1Id === team.id;
                   const opponentName = getTeamName(isTeam1 ? match.team2Id : match.team1Id);
                   const isWinner = match.winnerId === team.id;
                   
                   return (
                     <div key={match.id} className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col md:flex-row items-center gap-6 group hover:bg-white transition-all">
                        <div className="flex flex-col items-center md:items-start min-w-[120px]">
                           <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${isWinner ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>
                              {isWinner ? 'Victory' : 'Defeat'}
                           </span>
                           <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Match #{match.order}</span>
                           {match.scheduledAt && (
                              <span className="text-[8px] text-slate-300 font-bold uppercase mt-1">
                                {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                           )}
                        </div>

                        <div className="flex-1 flex items-center justify-center gap-8 text-center">
                           <div className="flex-1 flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Our Team</span>
                              <span className="font-black text-slate-900 truncate max-w-[100px]">{team.name}</span>
                           </div>
                           <div className="flex flex-col items-center">
                              <span className="text-sm font-black text-slate-300 italic mb-1">VS</span>
                              <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black tabular-nums">
                                 {match.scores.reduce((acc, s) => acc + (isTeam1 ? (s.team1 > s.team2 ? 1 : 0) : (s.team2 > s.team1 ? 1 : 0)), 0)} - {match.scores.reduce((acc, s) => acc + (isTeam1 ? (s.team2 > s.team1 ? 1 : 0) : (s.team1 > s.team2 ? 1 : 0)), 0)}
                              </div>
                           </div>
                           <div className="flex-1 flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opponent</span>
                              <span className="font-black text-slate-900 truncate max-w-[100px]">{opponentName}</span>
                           </div>
                        </div>

                        <div className="flex gap-1.5">
                           {match.scores.map((s, idx) => (
                             <span key={idx} className="bg-white px-2 py-1 rounded-lg border border-slate-100 text-[10px] font-black text-slate-600 shadow-sm">
                               {isTeam1 ? `${s.team1}-${s.team2}` : `${s.team2}-${s.team1}`}
                             </span>
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
    <div className={`p-6 rounded-3xl border shadow-sm ${themes[color] || themes.slate} transition-transform hover:-translate-y-1`}>
      <div className="flex items-center gap-2 mb-2 opacity-60">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-4xl font-black tracking-tighter tabular-nums leading-none">{value}</div>
    </div>
  );
};

export default TeamDashboard;
