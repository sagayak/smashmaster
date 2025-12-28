
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
  Clock
} from 'lucide-react';
import { Team, Match, GameScore, MatchStatus } from '../types';
import { FORMATS, POINTS_TARGETS } from '../constants';

interface MatchManagerProps {
  teams: Team[];
  matches: Match[];
  tournamentId: string;
  onCreate: (match: Match) => void;
  onUpdate: (match: Match) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({ teams, matches, tournamentId, onCreate, onUpdate, onDelete, onStart, isAdmin, onAdminLogin }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  
  // Shared form state for both create and edit
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [format, setFormat] = useState<1 | 3 | 5>(3);
  const [pointsTarget, setPointsTarget] = useState<15 | 21 | 30>(21);
  const [umpireInputs, setUmpireInputs] = useState<string[]>(['', '']);
  const [matchScores, setMatchScores] = useState<GameScore[]>([]);
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('scheduled');
  const [matchDate, setMatchDate] = useState('');
  const [matchTime, setMatchTime] = useState('');

  const sortedMatches = [...matches].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return b.createdAt - a.createdAt;
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

  const handleScoreChange = (index: number, team: 1 | 2, value: string) => {
    const nextScores = [...matchScores];
    const numValue = parseInt(value) || 0;
    if (team === 1) nextScores[index].team1 = numValue;
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
    
    // Auto-calculate winner if completed
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
        scheduledAt: scheduledAt
      };
      await onUpdate(updatedMatch);
      resetForm();
    } else {
      const nextOrder = matches.length > 0 ? Math.max(...matches.map(m => m.order || 0)) + 1 : 1;
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
        order: nextOrder,
        umpireNames: validUmpires.length > 0 ? validUmpires : undefined
      });
      resetForm();
    }
  };

  const handleDeleteMatch = (id: string) => {
    if (window.confirm("Are you sure you want to delete this match? All recorded scores for this tie-up will be lost.")) {
      onDelete(id);
    }
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Deleted Team';

  const eligibleUmpireTeams = teams.filter(t => t.id !== team1Id && t.id !== team2Id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Matches</h2>
          <p className="text-slate-500">Manual tie-ups and game management</p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95"
            disabled={teams.length < 2}
          >
            <Plus className="w-5 h-5" />
            New Tie-up
          </button>
        ) : (
          <button
            onClick={onAdminLogin}
            className="flex items-center gap-2 text-slate-500 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-slate-200"
          >
            <Lock className="w-4 h-4" />
            Admin Locked (Click to Unlock)
          </button>
        )}
      </div>

      {(isCreating || editingMatch) && isAdmin && (
        <div className="bg-white border-2 border-indigo-500 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Settings2 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              {editingMatch ? `Edit Match #${editingMatch.order}` : 'Schedule New Match'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Contestants</label>
                <div className="grid grid-cols-1 gap-3">
                  <select
                    required
                    value={team1Id}
                    onChange={(e) => setTeam1Id(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold bg-slate-50 transition-all"
                  >
                    <option value="">Select Team 1</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === team2Id}>{t.name}</option>
                    ))}
                  </select>
                  <div className="flex justify-center">
                    <div className="bg-slate-100 p-2 rounded-full">
                      <Swords className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <select
                    required
                    value={team2Id}
                    onChange={(e) => setTeam2Id(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold bg-slate-50 transition-all"
                  >
                    <option value="">Select Team 2</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === team1Id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Schedule (Optional)</label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date</span>
                     <input 
                       type="date"
                       value={matchDate}
                       onChange={(e) => setMatchDate(e.target.value)}
                       className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50 outline-none focus:border-indigo-500"
                     />
                   </div>
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Time</span>
                     <input 
                       type="time"
                       value={matchTime}
                       onChange={(e) => setMatchTime(e.target.value)}
                       className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50 outline-none focus:border-indigo-500"
                     />
                   </div>
                </div>

                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest mt-4">Match Config</label>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Best Of</span>
                     <select 
                       value={format} 
                       onChange={(e) => setFormat(parseInt(e.target.value) as 1|3|5)}
                       className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50"
                     >
                       {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Game Points</span>
                     <select 
                       value={pointsTarget} 
                       onChange={(e) => setPointsTarget(parseInt(e.target.value) as 15|21|30)}
                       className="w-full px-4 py-2.5 border-2 border-slate-100 rounded-xl font-bold bg-slate-50"
                     >
                       {POINTS_TARGETS.map(p => <option key={p} value={p}>{p} Pts</option>)}
                     </select>
                   </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Match Status</span>
                  <div className="flex gap-2">
                    {(['scheduled', 'live', 'completed'] as MatchStatus[]).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setMatchStatus(s)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          matchStatus === s ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Assign Officials
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1].map((i) => (
                  <select 
                    key={i}
                    value={umpireInputs[i]}
                    onChange={(e) => {
                      const next = [...umpireInputs];
                      next[i] = e.target.value;
                      setUmpireInputs(next);
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none bg-white focus:border-indigo-500 transition-all"
                  >
                    <option value="">-- Choose Umpire {i+1} --</option>
                    {eligibleUmpireTeams.map(team => (
                      <option key={team.id} value={team.name} disabled={umpireInputs.includes(team.name) && umpireInputs[i] !== team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            {editingMatch && (
              <div className="bg-indigo-50/30 p-6 rounded-2xl border-2 border-indigo-100 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm font-black text-indigo-900 uppercase tracking-widest">
                    <Edit3 className="w-4 h-4" />
                    Edit Game Scores
                  </label>
                  <button 
                    type="button" 
                    onClick={addScoreRow}
                    className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Add Game
                  </button>
                </div>
                
                {matchScores.length === 0 ? (
                  <div className="text-center py-4 text-slate-400 text-xs italic font-medium">No games recorded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {matchScores.map((score, idx) => (
                      <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-indigo-50 shadow-sm animate-in zoom-in-95">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">G{idx+1}</span>
                        <div className="flex-1 flex items-center justify-center gap-3">
                          <input 
                            type="number" 
                            value={score.team1} 
                            onChange={(e) => handleScoreChange(idx, 1, e.target.value)}
                            className="w-16 px-2 py-1.5 border-2 border-slate-100 rounded-lg text-center font-black outline-none focus:border-indigo-500"
                          />
                          <span className="text-slate-300 font-bold italic">VS</span>
                          <input 
                            type="number" 
                            value={score.team2} 
                            onChange={(e) => handleScoreChange(idx, 2, e.target.value)}
                            className="w-16 px-2 py-1.5 border-2 border-slate-100 rounded-lg text-center font-black outline-none focus:border-indigo-500"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeScoreRow(idx)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Save className="w-5 h-5" />
                {editingMatch ? 'Update Match Details' : 'Schedule Match'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedMatches.length === 0 && !isCreating && !editingMatch && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No matches scheduled yet.</p>
          </div>
        )}

        {sortedMatches.map((match) => (
          <div 
            key={match.id} 
            className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
              match.status === 'live' 
                ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-100 scale-[1.02]' 
                : 'border-slate-200 hover:shadow-md'
            }`}
          >
            {match.status === 'live' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-indigo-500 to-red-500 bg-[length:200%_100%] animate-[gradient_3s_linear_infinite]"></div>
            )}
            
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mr-1">
                      <Hash className="w-3 h-3" />
                      {match.order}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      match.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                      match.status === 'live' ? 'bg-red-600 text-white shadow-sm' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {match.status === 'live' && <Activity className="w-3 h-3 animate-pulse" />}
                      {match.status}
                    </span>
                  </div>
                  {match.scheduledAt && (
                    <div className="flex items-center gap-1.5 text-indigo-600">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(match.scheduledAt).toLocaleDateString()} @ {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Best of {match.format}</span>
                    <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{match.pointsTarget} Points</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-black text-xl mb-2 transition-all duration-500 ${
                    match.winnerId === match.team1Id 
                      ? 'bg-amber-400 text-white shadow-lg ring-4 ring-amber-100 scale-110' 
                      : match.status === 'live' ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getTeamName(match.team1Id).charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-slate-900 truncate text-sm">{getTeamName(match.team1Id)}</h4>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-xl font-black text-slate-300 italic tracking-tighter mb-1">VS</div>
                </div>

                <div className="flex-1 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center font-black text-xl mb-2 transition-all duration-500 ${
                    match.winnerId === match.team2Id 
                      ? 'bg-amber-400 text-white shadow-lg ring-4 ring-amber-100 scale-110' 
                      : match.status === 'live' ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getTeamName(match.team2Id).charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-slate-900 truncate text-sm">{getTeamName(match.team2Id)}</h4>
                </div>
              </div>

              {match.scores.length > 0 && (
                <div className="mt-6 flex justify-center gap-2 flex-wrap">
                  {match.scores.map((s, i) => (
                    <div key={i} className={`px-2 py-1 rounded text-[10px] font-black border ${
                      (s.team1 > s.team2 && match.winnerId === match.team1Id) || (s.team2 > s.team1 && match.winnerId === match.team2Id)
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {s.team1}-{s.team2}
                    </div>
                  ))}
                </div>
              )}
              
              {match.umpireNames && match.umpireNames.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                   <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     Officials: {match.umpireNames.join(", ")}
                   </span>
                </div>
              )}
            </div>

            <div className={`px-4 py-3 flex justify-between items-center border-t transition-colors ${
              match.status === 'live' ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex gap-1">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleStartEditing(match)}
                      className="text-slate-400 hover:text-indigo-600 p-2 transition-colors rounded-lg hover:bg-indigo-50"
                      title="Edit Match Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="text-slate-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {match.status !== 'completed' && (
                  <button
                    onClick={() => onStart(match.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm active:scale-95 ${
                      match.status === 'live' 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-100' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {match.status === 'live' ? <Zap className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    {match.status === 'live' ? 'Resume Match' : 'Start Match'}
                  </button>
                )}
                {match.status === 'completed' && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest px-2 py-2">
                      <Trophy className="w-4 h-4" />
                      Result Locked
                    </div>
                  </div>
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
