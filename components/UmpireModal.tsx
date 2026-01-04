import React from 'react';
import { UserCheck } from 'lucide-react';
import { Team } from '../types';

interface UmpireModalProps {
  umpireInput: string[];
  setUmpireInput: (value: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  eligibleTeams: Team[];
}

const UmpireModal: React.FC<UmpireModalProps> = ({ umpireInput, setUmpireInput, onSubmit, onCancel, eligibleTeams }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
    <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-emerald-100 p-4 rounded-3xl mb-4">
          <UserCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Assign Umpires</h3>
        <p className="text-slate-500 font-bold text-sm mt-1">Select teams to officiate this match</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        {[0, 1].map(i => (
          <div key={i} className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Official {i+1}</label>
            <select
              value={umpireInput[i]}
              onChange={(e) => {
                const next = [...umpireInput];
                next[i] = e.target.value;
                setUmpireInput(next);
              }}
              className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">-- Select Team --</option>
              {eligibleTeams.map((t) => (
                <option key={t.id} value={t.name} disabled={umpireInput.includes(t.name) && umpireInput[i] !== t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Start Scoring</button>
          <button type="button" onClick={onCancel} className="px-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all">Skip</button>
        </div>
      </form>
    </div>
  </div>
);

export default UmpireModal;
