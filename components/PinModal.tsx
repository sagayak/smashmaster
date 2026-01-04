import React from 'react';
import { Lock } from 'lucide-react';

interface PinModalProps {
  title: string;
  description?: string;
  pinInput: string;
  setPinInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ title, description, pinInput, setPinInput, onSubmit, onCancel }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mb-4">
          <Lock className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-600 text-sm mt-1">{description || "Enter valid credentials."}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          autoFocus
          type="password"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          placeholder="PIN"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-black bg-white"
        />
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">Enter</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
        </div>
      </form>
    </div>
  </div>
);

export default PinModal;
