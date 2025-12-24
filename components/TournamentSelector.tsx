
import React, { useState } from 'react';
import { Plus, Trophy, Calendar, Trash2, ArrowRight, Lock, Archive, LayoutGrid } from 'lucide-react';
import { Tournament } from '../types';

interface TournamentSelectorProps {
  tournaments: Tournament[];
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
}

const TournamentSelector: React.FC<TournamentSelectorProps> = ({ 
  tournaments, onSelect, onCreate, onDelete, isAdmin, onAdminLogin 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-100 mb-6">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">SmashMaster Pro</h1>
        <p className="text-slate-500 font-medium">Select a tournament to manage or view results</p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-500" />
          All Tournaments ({tournaments.length})
        </h2>
        {isAdmin ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-5 h-5" />
            New Tournament
          </button>
        ) : (
          <button onClick={onAdminLogin} className="text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Admin Login to Add
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white border-2 border-indigo-100 rounded-2xl p-6 mb-8 shadow-xl animate-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <input 
              autoFocus
              required
              type="text"
              placeholder="Tournament Name (e.g. Summer Smash 2024)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-5 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-medium"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700">Create</button>
              <button type="button" onClick={() => setIsAdding(false)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No tournaments found.</p>
            <p className="text-slate-400 text-sm">Create your first tournament to get started.</p>
          </div>
        )}

        {tournaments.map(t => (
          <div key={t.id} className="group bg-white border border-slate-200 rounded-3xl p-6 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                  <Trophy className="w-6 h-6 text-indigo-600 group-hover:text-white" />
                </div>
                {isAdmin && (
                  <button 
                    onClick={() => { if(window.confirm('Delete this entire tournament and all its data?')) onDelete(t.id); }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">{t.name}</h3>
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <button 
              onClick={() => onSelect(t.id)}
              className="mt-8 w-full bg-slate-50 text-slate-900 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm active:scale-95"
            >
              Open Tournament
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentSelector;
