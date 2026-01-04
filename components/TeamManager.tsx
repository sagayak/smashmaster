
import React, { useState } from 'react';
import { Plus, Trash2, Users, UserPlus, X, Lock, ExternalLink, Activity, Trophy, Clock, UserCheck, History, BarChart3, Play, Edit2, LayoutDashboard, FileText } from 'lucide-react';
import { Team, Match } from '../types';

interface TeamManagerProps {
  teams: Team[];
  matches: Match[];
  tournamentId: string;
  onAdd: (team: Team) => void;
  onBulkAdd: (teams: Team[]) => void;
  onUpdate: (team: Team) => void;
  onRemove: (id: string) => void;
  onSelectTeam: (id: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, matches, tournamentId, onAdd, onBulkAdd, onUpdate, onRemove, onSelectTeam, isAdmin, onAdminLogin }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  
  const [newTeamName, setNewTeamName] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [members, setMembers] = useState<string[]>(['', '', '']); 

  const handleAddMember = () => {
    if (members.length < 4) {
      setMembers([...members, '']);
    }
  };

  const handleRemoveMemberSlot = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, name: string) => {
    const updated = [...members];
    updated[index] = name;
    setMembers(updated);
  };

  const handleDeleteTeam = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the team "${name}"? This will also remove them from the standings.`)) {
      onRemove(id);
    }
  };

  const handleStartEditing = (team: Team, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTeamId(team.id);
    setNewTeamName(team.name);
    setMembers([...team.members]);
    setIsAdding(false);
    setIsBulkAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsBulkAdding(false);
    setEditingTeamId(null);
    setNewTeamName('');
    setBulkInput('');
    setMembers(['', '', '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newTeamName.trim()) return;
    
    const validMembers = members.filter(m => m.trim() !== '');
    if (validMembers.length < 1) {
      alert("Please add at least 1 member");
      return;
    }

    if (editingTeamId) {
      onUpdate({
        id: editingTeamId,
        tournamentId,
        name: newTeamName,
        members: validMembers
      });
    } else {
      onAdd({
        id: crypto.randomUUID(),
        tournamentId,
        name: newTeamName,
        members: validMembers
      });
    }

    handleCancel();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const newTeams: Team[] = [];

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length === 0) return;

      const teamName = parts[0];
      const teamMembers = parts.length > 1 ? parts.slice(1) : ['Player 1'];

      newTeams.push({
        id: crypto.randomUUID(),
        tournamentId,
        name: teamName,
        members: teamMembers
      });
    });

    if (newTeams.length > 0) {
      onBulkAdd(newTeams);
    }

    handleCancel();
  };

  const calculateTeamStats = (team: Team) => {
    const teamMatches = matches.filter(m => m.team1Id === team.id || m.team2Id === team.id);
    const scheduled = teamMatches.filter(m => m.status === 'scheduled' || m.status === 'live').length;
    const played = teamMatches.filter(m => m.status === 'completed').length;
    const won = teamMatches.filter(m => m.status === 'completed' && m.winnerId === team.id).length;
    const lost = played - won;
    const umpiringCount = matches.filter(m => 
      m.umpireNames?.some(name => name.trim().toLowerCase() === team.name.trim().toLowerCase())
    ).length;

    return { scheduled, played, won, lost, umpiringCount };
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teams ({teams.length})</h2>
          <p className="text-slate-500">Manage participants and review performance summaries</p>
        </div>
        {isAdmin ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setIsBulkAdding(true); setIsAdding(false); setEditingTeamId(null); }}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95 border border-slate-200"
            >
              <FileText className="w-5 h-5" />
              Bulk Add
            </button>
            <button
              onClick={() => { setIsAdding(true); setIsBulkAdding(false); setEditingTeamId(null); setNewTeamName(''); setMembers(['', '', '']); }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Team
            </button>
          </div>
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

      {isBulkAdding && isAdmin && (
        <div className="bg-white border-2 border-dashed border-indigo-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Bulk Add Teams</h3>
          </div>
          <p className="text-sm text-slate-500 mb-2">Paste team data below, one team per line.</p>
          <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 mb-4 text-[10px] font-black text-indigo-700 uppercase tracking-widest leading-relaxed">
            Format: Team Name, Member 1, Member 2... (Members are optional)<br/>
            Example: <span className="text-slate-900">Thunder Smashes, John Doe, Jane Smith</span>
          </div>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <textarea
              required
              rows={6}
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Thunder Smashes, John Doe, Jane Smith&#10;Volley Kings, Mike Tyson&#10;Net Ninjas"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm transition-all"
              >
                Import Teams
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {(isAdding || editingTeamId) && isAdmin && (
        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingTeamId ? 'Edit Team' : 'Add New Team'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Team Name</label>
              <input
                type="text"
                required
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="e.g. Thunder Smashes"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700">Members (Min 1, Max 4)</label>
                {members.length < 4 && (
                  <button 
                    type="button" 
                    onClick={handleAddMember}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" /> Add Slot
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {members.map((member, idx) => (
                  <div key={idx} className="relative">
                    <input
                      type="text"
                      placeholder={`Member ${idx + 1}`}
                      value={member}
                      onChange={(e) => updateMember(idx, e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg pr-10 focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMemberSlot(idx)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 shadow-sm"
              >
                {editingTeamId ? 'Save Changes' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.length === 0 && !isAdding && !editingTeamId && !isBulkAdding && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No teams added yet.</p>
            {isAdmin && (
              <div className="mt-4 flex justify-center gap-4">
                <button 
                  onClick={() => setIsAdding(true)}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Add your first team
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => setIsBulkAdding(true)}
                  className="text-slate-600 font-semibold hover:underline"
                >
                  Bulk Import
                </button>
              </div>
            )}
          </div>
        )}

        {teams.map((team) => (
          <div 
            key={team.id} 
            onClick={() => onSelectTeam(team.id)}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-300 transition-all group relative cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    {team.members.length} Members
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {isAdmin && (
                  <>
                    <button
                      onClick={(e) => handleStartEditing(team, e)}
                      className="text-slate-300 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Edit Team"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTeam(team.id, team.name, e)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Team"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <div className="text-slate-300 group-hover:text-indigo-500 p-2 transition-colors">
                   <LayoutDashboard className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {team.members.map((member, i) => (
                <span 
                  key={i} 
                  className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {teams.length > 0 && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                 <div className="bg-indigo-600 p-2 rounded-xl">
                   <BarChart3 className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Summary</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Click any team to view their detailed rivalry dashboard</p>
                 </div>
               </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Team Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                      <div className="flex items-center justify-center gap-1.5"><Clock className="w-3 h-3"/> Scheduled</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                      <div className="flex items-center justify-center gap-1.5"><Play className="w-3 h-3"/> Played</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                      <div className="flex items-center justify-center gap-1.5"><Trophy className="w-3 h-3"/> Wins</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                      <div className="flex items-center justify-center gap-1.5"><History className="w-3 h-3"/> Losses</div>
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                      <div className="flex items-center justify-center gap-1.5"><UserCheck className="w-3 h-3"/> Umpiring</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((team) => {
                    const stats = calculateTeamStats(team);
                    return (
                      <tr 
                        key={team.id} 
                        onClick={() => onSelectTeam(team.id)}
                        className="hover:bg-indigo-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-8 py-4">
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600">{team.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">Tournament ID: {team.id.split('-')[0]}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black tabular-nums">{stats.scheduled}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black tabular-nums">{stats.played}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black tabular-nums">{stats.won}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-400 text-xs font-bold tabular-nums">
                           {stats.lost}
                        </td>
                        <td className="px-8 py-4 text-center">
                           <div className="flex items-center justify-center gap-1.5">
                             <span className={`px-3 py-1 rounded-full text-xs font-black tabular-nums ${
                               stats.umpiringCount > 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-300'
                             }`}>
                               {stats.umpiringCount} Duty
                             </span>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Note: Umpiring count includes every time this team was assigned as an official.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default TeamManager;
