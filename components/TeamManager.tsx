
import React, { useState } from 'react';
import { Plus, Trash2, Users, UserPlus, X, Lock } from 'lucide-react';
import { Team } from '../types';

interface TeamManagerProps {
  teams: Team[];
  onAdd: (team: Team) => void;
  onRemove: (id: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onAdd, onRemove, isAdmin, onAdminLogin }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['', '', '']); // Default 3 members

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newTeamName.trim()) return;
    
    const validMembers = members.filter(m => m.trim() !== '');
    if (validMembers.length < 2) {
      alert("Please add at least 2 members");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      name: newTeamName,
      members: validMembers
    });

    setNewTeamName('');
    setMembers(['', '', '']);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teams ({teams.length})</h2>
          <p className="text-slate-500">Manage participating teams</p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add Team
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

      {isAdding && isAdmin && (
        <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
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
                <label className="block text-sm font-semibold text-slate-700">Members (Min 2, Max 4)</label>
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
                    {members.length > 2 && (
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
                Create Team
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No teams added yet.</p>
            {isAdmin ? (
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-4 text-indigo-600 font-semibold hover:underline"
              >
                Start by adding your first team
              </button>
            ) : (
              <button 
                onClick={onAdminLogin}
                className="mt-4 text-indigo-600 font-semibold hover:underline"
              >
                Login as Admin to add teams
              </button>
            )}
          </div>
        )}

        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all group">
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
              {isAdmin && (
                <button
                  onClick={() => onRemove(team.id)}
                  className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
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
    </div>
  );
};

export default TeamManager;
