
import React, { useState } from 'react';
import { Users, Swords, Trophy, Play, Plus, History, ArrowRight, RotateCcw, Trash2, Lock, Share2, Check, UserPlus, Key, Eye, EyeOff, ShieldCheck, Save } from 'lucide-react';
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
}

const Dashboard: React.FC<DashboardProps> = ({ teams, matches, standings, onNavigate, onReset, isAdmin, onAdminLogin, tournament, onUpdateTournament, onSelectTeam }) => {
  const [copied, setCopied] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [newPasscode, setNewPasscode] = useState(tournament?.matchPasscode || '0000');
  const activeMatches = matches.filter(m => m.status === 'live');

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasscodeChange = () => {
    if (!tournament) return;
    onUpdateTournament({ ...tournament, matchPasscode: newPasscode });
    alert("Scorer passcode updated successfully!");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tournament?.name}</h2>
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-100">
              {tournament?.format}
            </span>
          </div>
          <p className="text-slate-500 font-medium">Tournament Dashboard • Real-time scoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            {copied ? 'Link Copied!' : 'Share'}
          </button>
          {isAdmin && (
            <button 
              onClick={() => onNavigate('teams')}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <UserPlus className="w-4 h-4" />
              Add Team
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-6 h-6 text-indigo-600" />} label="Total Teams" value={teams.length} onClick={() => onNavigate('teams')} color="indigo" />
        <StatCard icon={<Swords className="w-6 h-6 text-emerald-600" />} label="Matches Played" value={matches.length} onClick={() => onNavigate('matches')} color="emerald" />
        <StatCard icon={<Trophy className="w-6 h-6 text-amber-600" />} label="Leader" value={standings[0]?.teamName || '---'} onClick={() => standings[0] ? onSelectTeam(standings[0].teamId) : onNavigate('standings')} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Now
            </h3>
            {activeMatches.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">No matches in progress right now.</p>
                <button onClick={() => onNavigate('matches')} className="mt-4 text-indigo-600 font-bold hover:underline inline-flex items-center gap-1">
                  Start a match <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map(m => (
                  <div key={m.id} onClick={() => onNavigate('matches')} className="bg-white border-2 border-indigo-100 rounded-2xl p-5 flex justify-between items-center cursor-pointer hover:border-indigo-500 transition-all group shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="flex items-center gap-6">
                      <div className="font-black text-slate-900 text-lg">{teams.find(t => t.id === m.team1Id)?.name}</div>
                      <div className="bg-slate-900 text-white px-3 py-1 rounded-lg font-black text-sm italic">VS</div>
                      <div className="font-black text-slate-900 text-lg">{teams.find(t => t.id === m.team2Id)?.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Resume</span>
                       <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {isAdmin && (
            <section className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 shadow-xl shadow-slate-100">
               <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Security & Access</h3>
                    <p className="text-sm text-slate-500 font-medium">Manage codes for tournament officials.</p>
                  </div>
               </div>
               
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Scorer Match Passcode</span>
                    <button onClick={() => setShowPasscode(!showPasscode)} className="text-indigo-600 hover:text-indigo-800 p-1">
                       {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type={showPasscode ? "text" : "password"}
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-xl font-black tracking-[0.2em] outline-none focus:border-indigo-500 transition-all text-xl"
                    />
                    <button 
                      onClick={handlePasscodeChange}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Update
                    </button>
                  </div>
                  <p className="mt-3 text-[10px] text-slate-400 font-medium italic">
                    Scorers must enter this code to start or resume any match.
                  </p>
               </div>
            </section>
          )}
          
          <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl"><RotateCcw className="w-4 h-4 text-red-600" /></div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Tournament Reset</h3>
                  <p className="text-xs text-slate-500">Clears all tournament data.</p>
                </div>
              </div>
              {isAdmin ? (
                <button onClick={onReset} className="bg-white border border-red-200 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" /> Reset Now
                </button>
              ) : (
                <button onClick={onAdminLogin} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors">
                  <Lock className="w-3.5 h-3.5" /> Unlock Admin
                </button>
              )}
            </div>
          </section>
        </div>

        <section className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-xl flex flex-col">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div>
               <h3 className="font-black text-slate-900 text-xl flex items-center gap-3 uppercase tracking-tight">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Top 4 Leaders
               </h3>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Qualification Zone</p>
             </div>
             <button onClick={() => onNavigate('standings')} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors">Full Board</button>
          </div>
          <div className="flex-1">
            {standings.length === 0 ? (
              <div className="p-16 text-center text-slate-400 italic font-medium">Complete a match to see rankings.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {standings.slice(0, 4).map((s, i) => (
                  <div 
                    key={s.teamId} 
                    onClick={() => onSelectTeam(s.teamId)}
                    className="px-8 py-6 flex items-center justify-between hover:bg-indigo-50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${i === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-500'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{s.teamName}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{s.wins} Wins</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.pointDiff > 0 ? `+${s.pointDiff}` : s.pointDiff} PD</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {i === 0 && <Trophy className="w-6 h-6 text-amber-400 drop-shadow-sm" />}
                       <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.15em]">Primary: Wins • Secondary: Point Difference</p>
          </div>
        </section>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onClick: () => void;
  color: 'indigo' | 'emerald' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, onClick, color }) => {
  const colorClasses = {
    indigo: 'border-indigo-100 hover:border-indigo-500 bg-white shadow-indigo-100/20',
    emerald: 'border-emerald-100 hover:border-emerald-500 bg-white shadow-emerald-100/20',
    amber: 'border-amber-100 hover:border-amber-500 bg-white shadow-amber-100/20',
  };
  return (
    <div onClick={onClick} className={`p-7 rounded-[2rem] border-2 transition-all cursor-pointer group shadow-xl relative overflow-hidden ${colorClasses[color]}`}>
      <div className="flex items-center gap-4 mb-3 relative z-10">
        <div className="p-2.5 bg-slate-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all duration-300">{icon}</div>
        <span className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter relative z-10 group-hover:translate-x-1 transition-transform">{value}</div>
    </div>
  );
};

export default Dashboard;
