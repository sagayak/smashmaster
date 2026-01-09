
import React, { useState } from 'react';
import { 
  Plus, 
  Swords, 
  Play, 
  Trash2, 
  Calendar, 
  Activity, 
  Lock, 
  Edit3, 
  Save, 
  Settings2,
  FileText,
  ArrowUpAZ,
  Users,
  Table as TableIcon,
  ChevronRight,
  Clock,
  UserCheck
} from 'lucide-react';
import { Team, Match, GameScore, MatchStatus } from '../types';
import { FORMATS, POINTS_TARGETS } from '../constants';

interface MatchManagerProps {
  teams: Team[];
  matches: Match[];
  tournamentId: string;
  onCreate: (match: Match) => void;
  onBulkCreate: (matches: Match[]) => void;
  onUpdate: (match: Match) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({ teams, matches, tournamentId, onCreate, onBulkCreate, onUpdate, onDelete, onStart, isAdmin, onAdminLogin }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [format, setFormat] = useState<1 | 3 | 5>(3);
  const [pointsTarget, setPointsTarget] = useState<15 | 21 | 30>(21);
  const [umpireInputs, setUmpireInputs] = useState<string[]>(['', '']);
  const [matchScores, setMatchScores] = useState<GameScore[]>([]);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('scheduled');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');
  const [matchOrder, setMatchOrder] = useState<number>(1);

  const sortedMatches = [...matches].sort((a, b) => {
    const timeA = a.scheduledAt || Infinity;
    const timeB = b.scheduledAt || Infinity;
    if (timeA !== timeB) return timeA - timeB;
    return (a.order || 0) - (b.order || 0);
  });

  const resetForm = () => {
    setTeam1Id('');
    setTeam2Id('');
    setFormat(3);
    setPointsTarget(21);
    setUmpireInputs(['', '']);
    setMatchScores([]);
    setMatchStatus('scheduled');
    setMatchDate('');
    setMatchTime('');
    setMatchOrder(matches.length > 0 ? Math.max(...matches.map(m => m.order || 0)) + 1 : 1);
    setIsCreating(false);
    setEditingMatch(null);
  };

  const handleStartEditing = (match: Match) => {
    setEditingMatch(match);
    setTeam1Id(match.team1Id);
    setTeam2Id(match.team2Id);
    setFormat(match.format);
    setPointsTarget(match.pointsTarget);
    setUmpireInputs(match.umpireNames && match.umpireNames.length >= 2 ? [match.umpireNames[0], match.umpireNames[1]] : ['', '']);
    setMatchScores([...match.scores]);
    setMatchStatus(match.status);
    setMatchOrder(match.order || 1);
    
    if (match.scheduledAt) {
      const d = new Date(match.scheduledAt);
      setMatchDate(d.toISOString().split('T')[0]);
      setMatchTime(d.toTimeString().split(' ')[0].substring(0, 5));
    } else {
      setMatchDate('');
      setMatchTime('');
    }
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!team1Id || !team2Id || team1Id === team2Id) {
      alert("Please select two different teams");
      return;
    }

    const validUmpires = umpireInputs.filter(u => u.trim() !== "");
    let winnerId: string | undefined = undefined;
    if (matchStatus === 'completed' && matchScores.length > 0) {
      const t1Wins = matchScores.filter(s => s.team1 > s.team2).length;
      const t2Wins = matchScores.filter(s => s.team2 > s.team1).length;
      if (t1Wins > t2Wins) winnerId = team1Id;
      else if (t2Wins > t1Wins) winnerId = team2Id;
    }

    let scheduledAt: number | undefined = undefined;
    if (matchDate && matchTime) {
      scheduledAt = new Date(`${matchDate}T${matchTime}`).getTime();
    }

    if (editingMatch) {
      const updatedMatch: Match = {
        ...editingMatch,
        team1Id,
        team2Id,
        format,
        pointsTarget,
        umpireNames: validUmpires.length > 0 ? validUmpires : undefined,
        scores: matchScores,
        status: matchStatus,
        winnerId: winnerId,
        scheduledAt: scheduledAt,
        order: matchOrder
      };
      await onUpdate(updatedMatch);
      resetForm();
    } else {
      onCreate({
        id: crypto.randomUUID(),
        tournamentId,
        team1Id,
        team2Id,
        status: 'scheduled',
        format,
        pointsTarget,
        currentGame: 0,
        scores: [],
        createdAt: Date.now(),
        scheduledAt: scheduledAt,
        order: matchOrder,
        umpireNames: validUmpires.length > 0 ? validUmpires : undefined,
        winnerId: undefined
      });
      resetForm();
    }
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Deleted Team';

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Matches</h2>
          <p className="text-slate-500">Scheduled tie-ups and court progression</p>
        </div>
        {isAdmin ? (
          <div className="flex gap-2">
            <button onClick={() => { resetForm(); setIsCreating(true); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all" disabled={teams.length < 2}><Plus className="w-5 h-5" />New Tie-up</button>
          </div>
        ) : (
          <button onClick={onAdminLogin} className="flex items-center gap-2 text-slate-500 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-slate-200"><Lock className="w-4 h-4" />Admin Locked</button>
        )}
      </div>

      {(isCreating || editingMatch) && isAdmin && (
        <div className="bg-white border-2 border-indigo-500 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl"><Settings2 className="w-5 h-5 text-white" /></div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingMatch ? `Edit Match #${editingMatch.order}` : 'Schedule New Match'}</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Contestants & Priority</label>
                <div className="grid grid-cols-1 gap-3">
                  <select required value={team1Id} onChange={(e) => setTeam1Id(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold bg-slate-50">
                    <option value="">Select Team 1</option>
                    {teams.map(t => <option key={t.id} value={t.id} disabled={t.id === team2Id}>{t.name}</option>)}
                  </select>
                  <div className="flex justify-center"><div className="bg-slate-100 p-2 rounded-full"><Swords className="w-4 h-4 text-slate-400" /></div></div>
                  <select required value={team2Id} onChange={(e) => setTeam2Id(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold bg-slate-50">
                    <option value="">Select Team 2</option>
                    {teams.map(t => <option key={t.id} value={t.id} disabled={t.id === team1Id}>{t.name}</option>)}
                  </select>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2"><ArrowUpAZ className="w-3 h-3" />Display Order</label>
                    <input type="number" required min="1" value={matchOrder} onChange={(e) => setMatchOrder(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-black bg-white" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Schedule & Format</label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</span><input type="date" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50" /></div>
                   <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Time</span><input type="time" value={matchTime} onChange={(e) => setMatchTime(e.target.value)} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                   <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Best Of</span><select value={format} onChange={(e) => setFormat(parseInt(e.target.value) as 1|3|5)} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50">{FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select></div>
                   <div className="space-y-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Points</span><select value={pointsTarget} onChange={(e) => setPointsTarget(parseInt(e.target.value) as 15|21|30)} className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50">{POINTS_TARGETS.map(p => <option key={p} value={p}>{p} Pts</option>)}</select></div>
                </div>
              </div>

              <div className="space-y-4 col-span-1 md:col-span-2">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Assign Umpire Duties (Optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {umpireInputs.map((val, i) => (
                    <div key={i} className="space-y-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Official {i + 1}</span>
                      <select 
                        value={val} 
                        onChange={(e) => {
                          const next = [...umpireInputs];
                          next[i] = e.target.value;
                          setUmpireInputs(next);
                        }} 
                        className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50"
                      >
                        <option value="">-- Select Team --</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.name} disabled={t.id === team1Id || t.id === team2Id || (umpireInputs.includes(t.name) && val !== t.name)}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4"><button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-3"><Save className="w-5 h-5" />{editingMatch ? 'Update Match' : 'Schedule Match'}</button><button type="button" onClick={resetForm} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200">Cancel</button></div>
          </form>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedMatches.map((match) => {
          const t1 = teams.find(t => t.id === match.team1Id);
          const t2 = teams.find(t => t.id === match.team2Id);
          
          return (
            <div key={match.id} className={`relative border rounded-2xl overflow-hidden transition-all duration-300 ${match.status === 'live' ? 'bg-indigo-50/40 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xl' : 'bg-white border-slate-200'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black">#{match.order}</div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${match.status === 'completed' ? 'bg-slate-100 text-slate-600' : match.status === 'live' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{match.status}</span>
                    </div>
                    {match.scheduledAt && (
                      <div className="flex items-center gap-1.5 text-indigo-600 text-[10px] font-black uppercase">
                        <Calendar className="w-3 h-3" />
                        {new Date(match.scheduledAt).toLocaleDateString()} @ {new Date(match.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </div>
                    )}
                    {/* Umpire Duty Display in Card */}
                    {match.umpireNames && match.umpireNames.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-black uppercase">
                        <UserCheck className="w-3 h-3" />
                        Officials: {match.umpireNames.join(' & ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1 text-center">
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-black text-xl mb-2 transition-all ${match.winnerId === match.team1Id ? 'bg-amber-400 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600'}`}>
                      {t1?.name.charAt(0) || 'D'}
                    </div>
                    <h4 className="font-black text-sm text-slate-900 truncate px-2">{t1?.name || 'Deleted Team'}</h4>
                  </div>
                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="text-xl font-black text-slate-300 italic mb-1">VS</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center font-black text-xl mb-2 transition-all ${match.winnerId === match.team2Id ? 'bg-amber-400 text-white shadow-lg' : 'bg-emerald-50 text-emerald-600'}`}>
                      {t2?.name.charAt(0) || 'D'}
                    </div>
                    <h4 className="font-black text-sm text-slate-900 truncate px-2">{t2?.name || 'Deleted Team'}</h4>
                  </div>
                </div>

                {match.lineups && match.lineups.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      <Users className="w-3 h-3" /> Match Progress
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {match.lineups.slice(0, match.format).map((lineup, idx) => {
                        const isCurrentSet = match.status === 'live' && idx === match.scores.length;
                        const isPlayed = idx < match.scores.length;
                        const score = isPlayed ? match.scores[idx] : null;

                        return (
                          <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border text-[10px] transition-all ${isCurrentSet ? 'bg-indigo-600 text-white' : isPlayed ? 'bg-slate-100' : 'bg-slate-50/50 opacity-40'}`}>
                             <span className="font-black w-6">G{idx+1}</span>
                             <div className="flex-1 flex justify-between items-center px-4">
                               <span className="truncate max-w-[42%] font-bold">{lineup.team1Players.join(' & ')}</span>
                               {isPlayed ? (
                                 <span className="font-black">{score?.team1}-{score?.team2}</span>
                               ) : (
                                 <span className="text-[8px] font-black uppercase">VS</span>
                               )}
                               <span className="truncate max-w-[42%] font-bold text-right">{lineup.team2Players.join(' & ')}</span>
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`px-4 py-3 flex justify-between items-center border-t ${match.status === 'live' ? 'bg-indigo-100/30' : 'bg-slate-50'}`}>
                <div className="flex gap-1">
                  {isAdmin && <><button onClick={() => handleStartEditing(match)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-4 h-4" /></button><button onClick={() => onDelete(match.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button></>}
                </div>
                {match.status !== 'completed' && (
                  <button 
                    onClick={() => onStart(match.id)} 
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${match.status === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-900 text-white hover:bg-black'}`}
                  >
                    {match.status === 'live' ? <Activity className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {match.status === 'live' ? 'Resume' : 'Start'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Match Ledger Table with Umpire Duty Column */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl"><TableIcon className="w-5 h-5 text-white" /></div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Match Ledger</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Full Schedule (Sorted by Date & Order)</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Sequence</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date/Time</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Matchup</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Umpire Duty</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Result</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedMatches.map(m => {
                const t1 = getTeamName(m.team1Id);
                const t2 = getTeamName(m.team2Id);
                const t1Games = m.scores.filter(s => s.team1 > s.team2).length;
                const t2Games = m.scores.filter(s => s.team2 > s.team1).length;

                return (
                  <tr key={m.id} className="hover:bg-indigo-50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-400">#{m.order}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="text-xs font-black text-slate-900 flex items-center gap-1.5"><Calendar className="w-3 h-3 text-indigo-500" />{m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString() : 'TBD'}</div>
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5"><Clock className="w-3 h-3" />{m.scheduledAt ? new Date(m.scheduledAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`font-black ${m.winnerId === m.team1Id ? 'text-indigo-600' : 'text-slate-700'}`}>{t1}</span>
                        <span className="text-[9px] font-black text-slate-300">VS</span>
                        <span className={`font-black ${m.winnerId === m.team2Id ? 'text-indigo-600' : 'text-slate-700'}`}>{t2}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">
                        {m.umpireNames && m.umpireNames.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3 h-3 text-amber-500" />
                            {m.umpireNames.join(' & ')}
                          </div>
                        ) : (
                          <span className="text-slate-300">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                       {m.status === 'completed' ? (
                         <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-2 py-0.5 rounded-lg font-black tabular-nums text-xs">
                           {t1Games} - {t2Games}
                         </div>
                       ) : (
                         <span className="text-slate-300 font-black">--</span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                         m.status === 'completed' ? 'bg-slate-100 text-slate-400' :
                         m.status === 'live' ? 'bg-red-500 text-white shadow-lg shadow-red-100' :
                         'bg-emerald-500 text-white'
                       }`}>
                         {m.status}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MatchManager;
