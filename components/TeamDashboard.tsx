
import React from 'react';
import { ChevronLeft, Swords, Trophy, Activity, History, Hash, UserCheck, Shield, Clock } from 'lucide-react';
import { Team, Match } from '../types';

interface TeamDashboardProps {
  team: Team;
  matches: Match[];
  teams: Team[];
  onBack: () => void;
  onStartMatch: (id: string) => void;
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, matches, teams, onBack, onStartMatch }) => {
  const teamMatches = matches.filter(m => m.team1Id === team.id || m.team2Id === team.id);
  const scheduled = teamMatches.filter(m => m.status === 'scheduled').length;
  const played = teamMatches.filter(m => m.status === 'completed').length;
  const won = teamMatches.filter(m => m.status === 'completed' && m.winnerId === team.id).length;
  const lost = played - won;
  
  // Calculate umpiring count
  const umpiringCount = matches.filter(m => 
    m.umpireNames?.some(name => name.trim().toLowerCase() === team.name.trim().toLowerCase())
  ).length;

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Deleted Team';

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{team.name}</h2>
          <div className="flex items-center gap-3 mt-1">
             <span className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                <Shield className="w-3 h-3" /> Team Stats
             </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               {team.members.join(", ")}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatItem label="Scheduled" value={scheduled} color="slate" icon={<Clock className="w-4 h-4"/>} />
        <StatItem label="Matches Played" value={played} color="indigo" icon={<Activity className="w-4 h-4"/>} />
        <StatItem label="Wins" value={won} color="emerald" icon={<Trophy className="w-4 h-4"/>} />
        <StatItem label="Losses" value={lost} color="red" icon={<History className="w-4 h-4"/>} />
        <StatItem label="Umpiring Duty" value={umpiringCount} color="amber" icon={<UserCheck className="w-4 h-4"/>} />
      </div>

      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
             <Swords className="w-6 h-6" />
           </div>
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Match History & Schedule</h3>
        </div>

        {teamMatches.length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            No matches found for this team yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMatches.sort((a,b) => (a.order || 0) - (b.order || 0)).map(match => {
              const isTeam1 = match.team1Id === team.id;
              const opponentName = getTeamName(isTeam1 ? match.team2Id : match.team1Id);
              const isWinner = match.winnerId === team.id;
              
              return (
                <div key={match.id} className="p-5 border border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col justify-between hover:bg-white hover:border-indigo-100 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="bg-slate-900 text-white px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" /> Match {match.order}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                        match.status === 'completed' ? (isWinner ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700') : 'bg-slate-200 text-slate-600'
                      }`}>
                        {match.status === 'completed' ? (isWinner ? 'Victory' : 'Defeat') : match.status}
                      </span>
                   </div>

                   <div className="flex items-center justify-between mb-4">
                      <div className="text-center flex-1">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Our Team</div>
                         <div className="font-black text-slate-900 text-sm truncate">{team.name}</div>
                      </div>
                      <div className="font-black text-slate-300 italic px-4">VS</div>
                      <div className="text-center flex-1">
                         <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Opponent</div>
                         <div className="font-black text-slate-900 text-sm truncate">{opponentName}</div>
                      </div>
                   </div>

                   <div className="flex justify-between items-center">
                      <div className="flex gap-1.5">
                        {match.scores.map((s, idx) => (
                          <span key={idx} className="bg-white px-2 py-1 rounded-lg border border-slate-100 text-[10px] font-black text-slate-600">
                            {isTeam1 ? `${s.team1}-${s.team2}` : `${s.team2}-${s.team1}`}
                          </span>
                        ))}
                      </div>
                      {match.status !== 'completed' && (
                        <button 
                          onClick={() => onStartMatch(match.id)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-700"
                        >
                          Go to Scoreboard
                        </button>
                      )}
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
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
    <div className={`p-6 rounded-3xl border shadow-sm ${themes[color] || themes.slate}`}>
      <div className="flex items-center gap-2 mb-2 opacity-60">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-4xl font-black tracking-tighter tabular-nums">{value}</div>
    </div>
  );
};

export default TeamDashboard;
