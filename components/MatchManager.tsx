
import React, { useState } from 'react';
import { 
  Plus, 
  Swords, 
  Play, 
  Trash2, 
  Calendar, 
  Trophy, 
  Zap, 
  Activity, 
  Lock, 
  Edit3, 
  Hash, 
  UserCheck, 
  X, 
  Save, 
  Settings2,
  Clock,
  FileText,
  Download,
  Table as TableIcon,
  ArrowUpAZ,
  Users
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
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  
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
    setIsBulkAdding(false);
    setEditingMatch(null);
    setBulkInput('');
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
    setIsBulkAdding(false);
  };

  const handleScoreChange = (index: number, teamNum: 1 | 2, value: string) => {
    const nextScores = [...matchScores];
    const numValue = parseInt(value) || 0;
    if (teamNum === 1) nextScores[index].team1 = numValue;
    else nextScores[index].team2 = numValue;
    setMatchScores(nextScores);
  };

  const addScoreRow = () => {
    setMatchScores([...matchScores, { team1: 0, team2: 0 }]);
  };

  const removeScoreRow = (index: number) => {
    setMatchScores(matchScores.filter((_, i) => i !== index));
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

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newMatches: Match[] = [];
    let currentOrder = matches.length > 0 ? Math.max(...matches.map(m => m.order || 0)) : 0;
    let skippedLines: string[] = [];

    for (const line of lines) {
      const parts = line.split(',').map(s => s?.trim());
      if (parts.length < 2) continue;
      const [t1Name, t2Name, pts, sets, u1, u2, sched] = parts;
      const team1 = teams.find(t => t.name.toLowerCase() === t1Name?.toLowerCase());
      const team2 = teams.find(t => t.name.toLowerCase() === t2Name?.toLowerCase());
      if (!team1 || !team2) {
        skippedLines.push(line);
        continue;
      }
      const points = [15, 21, 30].includes(parseInt(pts)) ? (parseInt(pts) as 15|21|30) : 21;
      const formatVal = [1, 3, 5].includes(parseInt(sets)) ? (parseInt(sets) as 1|3|5) : 3;
      const umpires = [u1, u2].filter(u => u && u.length > 0);
      let scheduledAt: number | undefined = undefined;
      if (sched) {
        const parsedDate = Date.parse(sched);
        if (!isNaN(parsedDate)) scheduledAt = parsedDate;
      }
      currentOrder++;
      newMatches.push({
        id: crypto.randomUUID(),
        tournamentId: tournamentId,
        team1Id: team1.id,
        team2Id: team2.id,
        status: 'scheduled',
        format: formatVal,
        pointsTarget: points,
        currentGame: 0,
        scores: [],
        createdAt: Date.now(),
        scheduledAt,
        order: currentOrder,
        umpireNames: umpires.length > 0 ? umpires : undefined,
        winnerId: undefined
      });
    }

    if (skippedLines.length > 0) alert(`Skipped (team not found):\n${skippedLines.join('\n')}`);
    if (newMatches.length > 0) { onBulkCreate(newMatches); resetForm(); }
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Deleted Team';

  const exportToCSV = () => {
    const headers = ['Order', 'Date/Time', 'Match', 'Umpires', 'Status'];
    const rows = sortedMatches.map(m => [
      m.order,
      m.scheduledAt ? new Date(m.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'TBD',
      `${getTeamName(m.team1Id)} vs ${getTeamName(m.team2Id)}`,
      m.umpireNames?.join('; ') || 'None',
      m.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tournament_schedule_${new Date().getTime()}.csv`);
    link.click();
  };

  const eligibleUmpireTeams = teams.filter(t => t.id !== team1Id && t.id !== team2Id);

  return (
    <div className="space-y-12">
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Matches</h2>
          <p className="text-slate-500">Manual tie-ups and game management</p>
        </div>
        {isAdmin ? (
          <div className="flex gap-2">
            <button onClick={() => { resetForm(); setIsBulkAdding(true); }} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all border border-slate-200"><FileText className="w-5 h-5" />Bulk Import</button>
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
            </div>
            <div className="flex gap-4"><button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-3"><Save className="w-5 h-5" />{editingMatch ? 'Update Match' : 'Schedule Match'}</button><button type="button" onClick={resetForm} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200">Cancel</button></div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedMatches.map((match) => (
          <div key={match.id} className={`relative border rounded-2xl overflow-hidden transition-all duration-300 ${match.status === 'live' ? 'bg-indigo-50/40 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xl' : 'bg-white border-slate-200'}`}>
            {match.status === 'live' && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-red-500 animate-[gradient_3s_linear_infinite]"></div>}
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2"><div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black">#{match.order}</div><span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${match.status === 'completed' ? 'bg-slate-100 text-slate-600' : match.status === 'live' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{match.status}</span></div>
                  {match.scheduledAt && <div className="flex items-center gap-1.5 text-indigo-600 text-[10px] font-black uppercase"><Calendar className="w-3 h-3" />{new Date(match.scheduledAt).toLocaleDateString()} @ {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded border">Best of {match.format} • {match.pointsTarget} Pts</div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center"><div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-black text-lg mb-2 ${match.winnerId === match.team1Id ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-100'}`}>{getTeamName(match.team1Id).charAt(0)}</div><h4 className="font-bold text-sm">{getTeamName(match.team1Id)}</h4></div>
                <div className="text-xl font-black text-slate-300 italic">VS</div>
                <div className="flex-1 text-center"><div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-black text-lg mb-2 ${match.winnerId === match.team2Id ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-100'}`}>{getTeamName(match.team2Id).charAt(0)}</div><h4 className="font-bold text-sm">{getTeamName(match.team2Id)}</h4></div>
              </div>
            </div>
            <div className={`px-4 py-3 flex justify-between items-center border-t ${match.status === 'live' ? 'bg-indigo-100/30' : 'bg-slate-50'}`}>
              <div className="flex gap-1">
                {isAdmin && <><button onClick={() => handleStartEditing(match)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit3 className="w-4 h-4" /></button><button onClick={() => onDelete(match.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></>}
              </div>
              <div className="flex gap-2">
                {match.status !== 'completed' && (
                  <button onClick={() => onStart(match.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all ${match.status === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-emerald-600 text-white'}`}>{match.status === 'live' ? 'Resume' : 'Start Match'}</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchManager;
