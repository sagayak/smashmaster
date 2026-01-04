
import React, { useState, useEffect } from 'react';
import { 
  Users, Swords, Trophy, Play, Plus, ArrowRight, RotateCcw, Lock, Share2, 
  Check, X, Medal, Settings2, CheckCircle2, BookOpen, Info, HelpCircle, 
  Activity, ListChecks, Target, ChevronRight, Edit3, Trash2, GripVertical, PlusCircle, RefreshCcw
} from 'lucide-react';
import { Team, Match, StandingsEntry, ViewState, Tournament, HandbookSectionData } from '../types';

interface DashboardProps {
  teams: Team[];
  matches: Match[];
  standings: StandingsEntry[];
  onNavigate: (view: ViewState) => void;
  onReset: () => void;
  isAdmin: boolean;
  onAdminLogin: () => void;
  tournament?: Tournament;
  onUpdateTournament: (updated: Tournament) => void;
  onSelectTeam: (id: string) => void;
  onAddTeam: (team: Team) => void;
}

const DEFAULT_STRUCTURE: HandbookSectionData[] = [
  {
    id: '1',
    title: '1. Ranking & Tie-Breakers',
    iconName: 'Trophy',
    content: 'Standings are calculated using a hierarchical logic to ensure fair competition:',
    items: [
      { label: 'Match Wins', desc: 'Primary metric. Most overall match victories ranks highest.' },
      { label: 'Set Ratio', desc: 'Calculated as (Sets Won / Sets Played). Used if match wins are tied.' },
      { label: 'Point Diff', desc: 'Total points scored minus total points conceded.' }
    ]
  },
  {
    id: '2',
    title: '2. Point Difference (PD)',
    iconName: 'Activity',
    content: 'PD is the ultimate tie-breaker. Every point in every set counts.',
    items: [
      { label: 'Calculation', desc: 'PD = (Sum of Your Points) - (Sum of Opponent Points).' },
      { label: 'Strategy', desc: 'Losing 28-30 is significantly better for your rank than losing 10-30.' }
    ]
  },
  {
    id: '3',
    title: '3. Match Protocols',
    iconName: 'Target',
    content: 'Standard match configurations for all tournament tie-ups(League Stage):',
    items: [
      { label: 'Format', desc: 'Best of 3 sets. First to win 2 sets wins the match.' },
      { label: 'Scoring', desc: 'Rally point system. Sets played to 30 points.' }
    ]
  }
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-5 h-5 text-amber-500" />,
  Activity: <Activity className="w-5 h-5 text-indigo-500" />,
  Users: <Users className="w-5 h-5 text-emerald-500" />,
  Target: <Target className="w-5 h-5 text-rose-500" />,
  Swords: <Swords className="w-5 h-5 text-slate-500" />,
  Info: <Info className="w-5 h-5 text-sky-500" />
};

const Dashboard: React.FC<DashboardProps> = ({ teams, matches, standings, onNavigate, onReset, isAdmin, onAdminLogin, tournament, onUpdateTournament, onSelectTeam, onAddTeam }) => {
  const [copied, setCopied] = useState(false);
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [quickTeamName, setQuickTeamName] = useState('');
  const [isAddingQuick, setIsAddingQuick] = useState(false);
  const [showHandbook, setShowHandbook] = useState(false);
  const [isEditingHandbook, setIsEditingHandbook] = useState(false);
  const [editingHandbookData, setEditingHandbookData] = useState<HandbookSectionData[]>([]);

  const activeMatches = matches.filter(m => m.status === 'live');
  const currentHandbook = tournament?.handbook || [];

  const handleOpenHandbook = () => {
    setEditingHandbookData(JSON.parse(JSON.stringify(currentHandbook)));
    setShowHandbook(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateFormat = (format: 'League' | 'Knockout') => {
    if (!tournament) return;
    onUpdateTournament({ ...tournament, format });
    setIsEditingFormat(false);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTeamName.trim() || !tournament) return;
    
    onAddTeam({
      id: crypto.randomUUID(),
      tournamentId: tournament.id,
      name: quickTeamName.trim(),
      members: ['Player 1', 'Player 2']
    });
    
    setQuickTeamName('');
  };

  const handleSaveHandbook = () => {
    if (!tournament) return;
    onUpdateTournament({ ...tournament, handbook: editingHandbookData });
    setIsEditingHandbook(false);
  };

  const handleLoadDefaults = () => {
    if (window.confirm("Load standard tournament rules? This will overwrite current changes.")) {
      setEditingHandbookData(JSON.parse(JSON.stringify(DEFAULT_STRUCTURE)));
      setIsEditingHandbook(true);
    }
  };

  const addHandbookSection = () => {
    const newSection: HandbookSectionData = {
      id: crypto.randomUUID(),
      title: 'New Section',
      iconName: 'Info',
      content: 'Section description goes here.',
      items: [{ label: 'Rule Name', desc: 'Rule description' }]
    };
    setEditingHandbookData([...editingHandbookData, newSection]);
  };

  const removeHandbookSection = (id: string) => {
    if (window.confirm("Remove this handbook section?")) {
      setEditingHandbookData(editingHandbookData.filter(s => s.id !== id));
    }
  };

  const updateSection = (id: string, field: keyof HandbookSectionData, value: any) => {
    setEditingHandbookData(editingHandbookData.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSubItem = (sectionId: string) => {
    setEditingHandbookData(editingHandbookData.map(s => s.id === sectionId ? {
      ...s,
      items: [...s.items, { label: '', desc: '' }]
    } : s));
  };

  const removeSubItem = (sectionId: string, itemIdx: number) => {
    setEditingHandbookData(editingHandbookData.map(s => s.id === sectionId ? {
      ...s,
      items: s.items.filter((_, idx) => idx !== itemIdx)
    } : s));
  };

  const updateSubItem = (sectionId: string, itemIdx: number, field: 'label' | 'desc', value: string) => {
    setEditingHandbookData(editingHandbookData.map(s => s.id === sectionId ? {
      ...s,
      items: s.items.map((item, idx) => idx === itemIdx ? { ...item, [field]: value } : item)
    } : s));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tournament?.name}</h2>
            <div className="relative">
              <button 
                onClick={() => isAdmin && setIsEditingFormat(!isEditingFormat)}
                className="bg-indigo-600/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-b-4 border-indigo-800 flex items-center gap-2 transition-all hover:bg-indigo-700 active:translate-y-0.5 active:border-b-0 backdrop-blur-sm"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Format: {tournament?.format}
              </button>
              {isEditingFormat && isAdmin && (
                <div className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 min-w-[200px] animate-in slide-in-from-top-2">
                  <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Select Format</div>
                  <button onClick={() => updateFormat('League')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">
                    League Table
                    {tournament?.format === 'League' && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                  <button onClick={() => updateFormat('Knockout')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">
                    Knockout Bracket
                    {tournament?.format === 'Knockout' && <Check className="w-4 h-4 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-700 font-bold text-sm">Real-time tournament tracking & manual tie-ups.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleOpenHandbook}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <BookOpen className="w-4 h-4" />
            Full Handbook
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/40 border border-white/60 px-4 py-2.5 rounded-2xl text-slate-700 font-bold hover:bg-white/60 transition-all group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            <span className="text-sm">{copied ? 'Copied' : 'Share'}</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsAddingQuick(!isAddingQuick)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 ${isAddingQuick ? 'bg-slate-800 text-white' : 'bg-emerald-600/90 text-white hover:bg-emerald-700 shadow-emerald-100'}`}
            >
              {isAddingQuick ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingQuick ? 'Close' : 'Add Teams'}
            </button>
          )}
        </div>
      </div>

      {/* Handbook Modal */}
      {showHandbook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-8 max-w-3xl w-full shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col relative border border-white/40">
            <button onClick={() => { setShowHandbook(false); setIsEditingHandbook(false); }} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10">
              <X className="w-5 h-5 text-slate-500" />
            </button>
            
            <div className="flex items-center justify-between mb-8 pr-12">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tournament Handbook</h3>
                  <p className="text-sm font-bold text-slate-500">Official rules and scoring protocols</p>
                </div>
              </div>
              {isAdmin && !isEditingHandbook && (
                <button 
                  onClick={() => setIsEditingHandbook(true)}
                  className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest border border-indigo-100"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Rules
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-1">
              {isEditingHandbook ? (
                <div className="space-y-12 pb-12">
                  <div className="flex justify-end">
                    <button 
                      onClick={handleLoadDefaults}
                      className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                    >
                      <RefreshCcw className="w-3 h-3" /> Load Official Defaults
                    </button>
                  </div>
                  {editingHandbookData.map((section) => (
                    <div key={section.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 relative group/section shadow-sm">
                      <button 
                        onClick={() => removeHandbookSection(section.id)}
                        className="absolute -top-3 -right-3 bg-white border-2 border-red-100 text-red-500 p-2.5 rounded-full shadow-lg hover:bg-red-50 transition-all opacity-0 group-hover/section:opacity-100 z-10"
                        title="Remove Section"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">Section Title</label>
                          <input 
                            type="text" 
                            value={section.title} 
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                            className="w-full bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-500 shadow-sm transition-all"
                            placeholder="e.g. 1. Scoring Logic"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">Icon Theme</label>
                          <div className="relative">
                            <select 
                              value={section.iconName}
                              onChange={(e) => updateSection(section.id, 'iconName', e.target.value)}
                              className="w-full bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 font-bold outline-none focus:border-indigo-500 shadow-sm appearance-none transition-all pl-12"
                            >
                              {Object.keys(ICON_MAP).map(icon => <option key={icon} value={icon}>{icon}</option>)}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              {ICON_MAP[section.iconName]}
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <ChevronRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">Description Summary</label>
                        <textarea 
                          value={section.content}
                          onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                          className="w-full bg-white px-5 py-3 rounded-2xl border-2 border-slate-100 font-medium text-sm outline-none focus:border-indigo-500 shadow-sm min-h-[100px] leading-relaxed"
                          placeholder="Briefly describe what this section covers..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">Sub-Items & Rules</label>
                        <div className="space-y-3">
                          {section.items.map((item, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in zoom-in-95 duration-200 group/item">
                              <div className="pt-2">
                                <GripVertical className="w-4 h-4 text-slate-300" />
                              </div>
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input 
                                  placeholder="Rule Label (e.g. Set 1)"
                                  value={item.label}
                                  onChange={(e) => updateSubItem(section.id, idx, 'label', e.target.value)}
                                  className="sm:col-span-1 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-wider outline-none focus:border-indigo-500"
                                />
                                <input 
                                  placeholder="Rule detail or instruction..."
                                  value={item.desc}
                                  onChange={(e) => updateSubItem(section.id, idx, 'desc', e.target.value)}
                                  className="sm:col-span-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 font-medium text-xs outline-none focus:border-indigo-500"
                                />
                              </div>
                              <button 
                                onClick={() => removeSubItem(section.id, idx)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                title="Remove Rule"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => addSubItem(section.id)}
                          className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:text-indigo-800 px-3 py-2 transition-all mt-2 group"
                        >
                          <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Append Rule
                        </button>
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={addHandbookSection}
                    className="w-full py-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 font-black uppercase tracking-widest text-xs hover:border-indigo-200 hover:text-indigo-600 transition-all bg-slate-50/30 flex flex-col items-center gap-3"
                  >
                    <Plus className="w-8 h-8" />
                    Add New Handbook Section
                  </button>
                </div>
              ) : (
                <div className="space-y-10 pb-8">
                  {currentHandbook.length === 0 ? (
                    <div className="py-20 text-center">
                       <HelpCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                       <p className="text-slate-400 italic font-medium mb-6">The handbook is currently empty.</p>
                       {isAdmin && (
                         <div className="flex flex-col items-center gap-4">
                           <button 
                            onClick={handleLoadDefaults}
                            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center gap-2"
                           >
                            <RefreshCcw className="w-4 h-4" /> Load Standard Rules
                           </button>
                           <button onClick={() => setIsEditingHandbook(true)} className="text-slate-400 font-black uppercase tracking-widest text-[10px] hover:underline">
                             Or create custom sections
                           </button>
                         </div>
                       )}
                    </div>
                  ) : (
                    currentHandbook.map((section) => (
                      <HandbookSection 
                        key={section.id}
                        title={section.title} 
                        icon={ICON_MAP[section.iconName] || <Info className="w-5 h-5" />}
                        content={section.content}
                        items={section.items}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className={`mt-6 pt-6 border-t border-slate-100 flex gap-4 ${isEditingHandbook ? 'sticky bottom-0 bg-white/95 backdrop-blur-md pb-2 z-20' : ''}`}>
              {isEditingHandbook ? (
                <>
                  <button 
                    onClick={handleSaveHandbook}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Commit Changes
                  </button>
                  <button 
                    onClick={() => { setIsEditingHandbook(false); setEditingHandbookData(JSON.parse(JSON.stringify(currentHandbook))); }}
                    className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowHandbook(false)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl"
                >
                  Got it, thanks!
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isAddingQuick && isAdmin && (
        <div className="bg-indigo-600/80 backdrop-blur-xl rounded-[2.5rem] p-8 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Quick Team Entry</h3>
            </div>
          </div>
          <form onSubmit={handleQuickAddSubmit} className="flex flex-col sm:flex-row gap-4">
            <input 
              autoFocus required type="text" placeholder="Team Name..."
              value={quickTeamName} onChange={(e) => setQuickTeamName(e.target.value)}
              className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 font-bold text-lg outline-none focus:border-white transition-all"
            />
            <button type="submit" className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-6 h-6 text-indigo-600" />} label="Total Teams" value={teams.length} onClick={() => onNavigate('teams')} color="indigo" />
        <StatCard icon={<Swords className="w-6 h-6 text-emerald-600" />} label="Matches" value={matches.length} onClick={() => onNavigate('matches')} color="emerald" />
        <StatCard icon={<Trophy className="w-6 h-6 text-amber-600" />} label="1st Place" value={standings[0]?.teamName || 'TBD'} onClick={() => standings[0] ? onSelectTeam(standings[0].teamId) : onNavigate('standings')} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Live Matches & Manifesto Preview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Tournament Readme Checklist */}
          <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-sm relative group overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
            {isAdmin && (
              <button 
                onClick={handleOpenHandbook}
                className="absolute top-8 right-8 text-indigo-600 bg-indigo-50 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-indigo-100 border border-indigo-100 shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-2xl">
                <ListChecks className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Scoring Manifesto</h3>
                <p className="text-[10px] font-bold text-indigo-600/70 uppercase tracking-widest">Core Rules & Logic</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentHandbook.slice(0, 4).map((section, idx) => (
                <div key={section.id || idx} className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                    <div className="scale-75">{ICON_MAP[section.iconName] || <CheckCircle2 className="w-4 h-4 text-indigo-600" />}</div>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{section.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-2">{section.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={handleOpenHandbook}
              className="mt-8 w-full flex items-center justify-center gap-2 text-indigo-700 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all py-4 bg-slate-50/50 rounded-2xl border border-slate-100/50"
            >
              Open Comprehensive Guide <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          {/* Live Activity */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                On Court Now
              </h3>
            </div>
            {activeMatches.length === 0 ? (
              <div className="bg-white/30 backdrop-blur-lg border-2 border-dashed border-white/60 rounded-[2.5rem] p-12 text-center group">
                <p className="text-slate-700 font-bold text-lg mb-4">No live matches at the moment.</p>
                <button onClick={() => onNavigate('matches')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all inline-flex items-center gap-2 shadow-lg">
                  Schedule Tie-ups <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map(m => (
                  <div key={m.id} onClick={() => onNavigate('matches')} className="bg-white/60 backdrop-blur-xl border-2 border-white/60 rounded-[2rem] p-6 flex justify-between items-center cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                    <div className="flex items-center gap-8 flex-1">
                      <div className="text-center w-24">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 mx-auto mb-1 transition-transform group-hover:scale-110">{teams.find(t => t.id === m.team1Id)?.name.charAt(0)}</div>
                        <div className="font-bold text-slate-900 text-xs truncate">{teams.find(t => t.id === m.team1Id)?.name}</div>
                      </div>
                      <div className="flex-1 text-center bg-slate-900 text-white py-4 rounded-3xl font-black text-4xl tabular-nums shadow-lg border-b-4 border-indigo-500 flex items-center justify-center gap-3">
                        {m.scores[m.scores.length - 1]?.team1 || 0}
                        <span className="text-slate-600 text-xl font-medium">:</span>
                        {m.scores[m.scores.length - 1]?.team2 || 0}
                      </div>
                      <div className="text-center w-24">
                        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 mx-auto mb-1 transition-transform group-hover:scale-110">{teams.find(t => t.id === m.team2Id)?.name.charAt(0)}</div>
                        <div className="font-bold text-slate-900 text-xs truncate">{teams.find(t => t.id === m.team2Id)?.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Mini Leaderboard */}
        <section className="bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px] border border-white/5">
          <div className="p-8 border-b border-white/10 bg-white/5">
             <h3 className="font-black text-white text-2xl flex items-center gap-3 uppercase tracking-tighter italic">
                <Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                Top Ranking
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {standings.length === 0 ? (
              <div className="p-12 text-center text-white/30 font-bold italic">Waiting for tournament data...</div>
            ) : (
              <div className="divide-y divide-white/5">
                {standings.slice(0, 6).map((s, i) => (
                  <div key={s.teamId} onClick={() => onSelectTeam(s.teamId)} className="px-8 py-6 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-all group">
                    <div className="flex items-center gap-5">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${i === 0 ? 'bg-amber-400 text-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                      <div>
                        <div className="font-black text-white text-lg group-hover:text-indigo-400 transition-colors tracking-tight">{s.teamName}</div>
                        <div className="text-[10px] font-black uppercase text-indigo-400/80 tracking-widest">{s.wins} Wins • PD {s.pointDiff > 0 ? `+${s.pointDiff}` : s.pointDiff}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('standings')} className="p-6 bg-white/5 text-center text-white/50 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border-t border-white/5 group">
            <span className="flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
              View Complete Standings <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </section>
      </div>
    </div>
  );
};

interface HandbookSectionProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  items: { label: string; desc: string }[];
}

const HandbookSection: React.FC<HandbookSectionProps> = ({ title, icon, content, items }) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex items-center gap-3 mb-2">
      <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-sm">{icon}</div>
      <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">{title}</h4>
    </div>
    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">{content}</p>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 group/item">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2.5 shrink-0 group-hover/item:scale-150 transition-transform"></div>
            <div>
              <span className="block text-xs font-black text-indigo-700 uppercase tracking-widest mb-1">{item.label}</span>
              <span className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, onClick, color }: { icon: React.ReactNode, label: string, value: string | number, onClick: () => void, color: 'indigo' | 'emerald' | 'amber' }) => {
  const colorClasses = {
    indigo: 'border-indigo-200/50 hover:border-indigo-500 bg-white/40 shadow-indigo-100/20',
    emerald: 'border-emerald-200/50 hover:border-emerald-500 bg-white/40 shadow-emerald-100/20',
    amber: 'border-amber-200/50 hover:border-amber-500 bg-white/40 shadow-amber-100/20',
  };
  return (
    <div onClick={onClick} className={`p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all cursor-pointer group shadow-xl relative overflow-hidden ${colorClasses[color]}`}>
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-current opacity-[0.03] rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="p-3 bg-white/60 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm border border-white/40">{icon}</div>
        <span className="text-slate-500 font-black text-xs uppercase tracking-[0.25em]">{label}</span>
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter relative z-10 group-hover:translate-x-2 transition-transform duration-300">{value}</div>
    </div>
  );
};

export default Dashboard;
