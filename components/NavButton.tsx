import React from 'react';

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-bold whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-700 hover:bg-white/40'}`}
  >
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
);

export default NavButton;
