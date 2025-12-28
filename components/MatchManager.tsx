
import React, { useState } from 'react';
import { Plus, Swords, Play, Trash2, Calendar, Trophy, Zap, Activity, Lock, Edit3, Hash, UserCheck, X, UserPlus, ChevronDown } from 'lucide-react';
import { Team, Match } from '../types';
import { FORMATS, POINTS_TARGETS } from '../constants';
import { api } from '../lib/api';

interface MatchManagerProps {
  teams: Team[];
  matches: Match[];
  tournamentId: string;
  onCreate: (match: Match) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({ teams, matches, tournamentId, onCreate, onDelete, onStart, isAdmin, onAdminLogin }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [format, setFormat] = useState<1 | 3 | 5>(3);
  const [pointsTarget, setPointsTarget] = useState<15 | 21 | 30>(21);
  const [umpireInputs, setUmpireInputs] = useState<string[]>(['']);

  const sortedMatches = [...matches].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return b.createdAt - a.createdAt;
  });

  const handleAddUmpireSlot = () => {
    if (umpireInputs.length < 3) {
      setUmpireInputs([...umpireInputs, '']);
    }
  };

  const handleRemoveUmpireSlot = (index: number) => {
    setUmpireInputs(umpireInputs.filter((_, i) => i !== index));
  };

  const updateUmpireName = (index: number, name: string) => {
    const next = [...umpireInputs];
    next[index] = name;
    setUmpireInputs(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!team1Id || !team2Id || team1Id === team2Id) {
      alert("Please select two different teams");
      return;
    }

    const nextOrder = matches.length > 0 
      ? Math.max(...matches.map(m => m.order || 0)) + 1 
      : 1;

    const validUmpires = umpireInputs.filter(u => u.trim() !== "");

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
      order: nextOrder,
      umpireNames: validUmpires.length > 0 ? validUmpires : undefined
    });

    setIsCreating(false);
    setTeam1Id('');
    setTeam2Id('');
    setUmpireInputs(['']);
  };

  const handleUpdateOrder = async (matchId: string, newOrder: number) => {
    const match = matches.find(m => m.id === matchId);
    if (match && isAdmin) {
      const updatedMatch = { ...match, order: newOrder };
      await api.updateMatch(updatedMatch);
    }
  };

  const handleDeleteMatch = (id: string) => {
    if (window.confirm("Are you sure you want to delete this match? All recorded scores for this tie-up will be lost.")) {
      onDelete(id);
    }
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Deleted Team';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Matches</h2>
          <p className="text-slate-500">Manual tie-ups and game management</p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setIsCreating(true)}
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

      {isCreating && isAdmin && (
        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team 1</label>
                <select
                  required
                  value={team1Id}
                  onChange={(e) => setTeam1Id(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                >
                  <option value="">Select Team 1</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id} disabled={t.id === team2Id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-center items-center h-full relative">
                <div className="absolute top-1/2 -translate-y-1/2 bg-slate-100 p-2 rounded-full hidden md:block">
                  <Swords className="w-4 h-4 text-slate-400" />
                </div>
                <div className="w-full">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Team 2</label>
                  <select
                    required
                    value={team2Id}
                    onChange={(e) => setTeam2Id(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                  >
                    <option value="">Select Team 2</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id} disabled={t.id === team1Id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Match Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {FORMATS.map(f => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormat(f.value as 1|3|5)}
                      className={`py-2 rounded-lg font-medium border transition-all ${
                        format === f.value 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Game Points</label>
                <div className="grid grid-cols-3 gap-2">
                  {POINTS_TARGETS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPointsTarget(p as 15|21|30)}
                      className={`py-2 rounded-lg font-medium border transition-all ${
                        pointsTarget === p 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p} Pts
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <label className="flex items-center gap-2 text-sm font-black text-slate-700 uppercase tracking-widest">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Officials (Optional)
                </label>
                {umpireInputs.length < 3 && (
                  <button 
                    type="button" 
                    onClick={handleAddUmpireSlot}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> Add Slot
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {umpireInputs.map((u, i) => (
                  <div key={i} className="relative flex flex-col gap-2 p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <select 
                        value={teams.some(t => t.name === u) ? u : "custom"}
                        onChange={(e) => {
                          if (e.target.value === "custom") updateUmpireName(i, "");
                          else updateUmpireName(i, e.target.value);
                        }}
                        className="flex-1 px-3 py-1.5 border border-slate-200 rounded text-xs font-bold outline-none bg-slate-50"
                      >
                        <option value="custom">-- Choose Team or Custom --</option>
                        {teams.filter(t => t.id !== team1Id && t.id !== team2Id).map(team => (
                          <option key={team.id} value={team.name}>{team.name} (Team)</option>
                        ))}
                      </select>
                      {umpireInputs.length > 1 && (
                        <button type="button" onClick={() => handleRemoveUmpireSlot(i)} className="text-slate-300 hover:text-red-500"><X className="w-4 h-4"/></button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={`Name or selection above...`}
                      value={u}
                      onChange={(e) => updateUmpireName(i, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-100 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                Schedule Match
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setUmpireInputs(['']);
                }}
                className="px-8 py-3 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedMatches.length === 0 && !isCreating && (
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
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mr-1">
                     <Hash className="w-3 h-3" />
                     {isAdmin ? (
                       <input 
                        type="number" 
                        value={match.order} 
                        onChange={(e) => handleUpdateOrder(match.id, parseInt(e.target.value) || 0)}
                        className="bg-transparent w-8 outline-none border-none focus:ring-0 text-center"
                       />
                     ) : (
                       <span>{match.order}</span>
                     )}
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
                <div className="flex items-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                   <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Best of {match.format}</span>
                   <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{match.pointsTarget} Points</span>
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
              {isAdmin ? (
                <button
                  onClick={() => handleDeleteMatch(match.id)}
                  className="text-slate-400 hover:text-red-600 p-2 transition-colors rounded-lg hover:bg-red-50"
                  title="Delete Tie-up"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-4"></div>
              )}

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
                    {isAdmin && (
                      <button 
                        onClick={() => onStart(match.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Result
                      </button>
                    )}
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest px-2 py-2">
                      <Trophy className="w-4 h-4" />
                      Done
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
