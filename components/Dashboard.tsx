
import React, { useState } from 'react';
import { 
  Users, Swords, Trophy, Plus, ArrowRight, Lock, Share2, 
  Check, X, Settings2, BookOpen, Activity, ListChecks, 
  Target, ChevronRight, Download, Upload, AlertTriangle, Key,
  Printer, FileJson, Trash2, RefreshCcw, CheckCircle2
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
  onResetTournamentData: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="w-5 h-5 text-amber-500" />,
  Activity: <Activity className="w-5 h-5 text-indigo-500" />,
  Users: <Users className="w-5 h-5 text-emerald-500" />,
  Target: <Target className="w-5 h-5 text-rose-500" />,
  Swords: <Swords className="w-5 h-5 text-slate-500" />,
  Info: <Target className="w-5 h-5 text-sky-500" />
};

const Dashboard: React.FC<DashboardProps> = ({ 
  teams, matches, standings, onNavigate, onReset, isAdmin, 
  onAdminLogin, tournament, onUpdateTournament, onSelectTeam, 
  onAddTeam, onResetTournamentData 
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingFormat, setIsEditingFormat] = useState(false);
  const [isEditingPin, setIsEditingPin] = useState(false);
  const [newPin, setNewPin] = useState(tournament?.matchPasscode || '0000');
  const [showHandbook, setShowHandbook] = useState(false);
  const [isEditingHandbook, setIsEditingHandbook] = useState(false);
  const [editingHandbookData, setEditingHandbookData] = useState<HandbookSectionData[]>([]);

  const activeMatches = matches.filter(m => m.status === 'live');
  const currentHandbook = tournament?.handbook || [];

  const handleOpenHandbook = () => {
    setEditingHandbookData(JSON.parse(JSON.stringify(currentHandbook)));
    setShowHandbook(true);
  };

  const handleExportHandbook = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentHandbook, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${tournament?.name}_handbook.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportHandbook = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tournament) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onUpdateTournament({ ...tournament, handbook: json });
        alert("Handbook imported successfully!");
      } catch (err) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handlePrintHandbook = () => {
    window.print();
  };

  const handleUpdateFormat = (format: 'League' | 'Knockout') => {
    if (!tournament) return;
    onUpdateTournament({ ...tournament, format });
    setIsEditingFormat(false);
  };

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !newPin.trim()) return;
    onUpdateTournament({ ...tournament, matchPasscode: newPin.trim() });
    setIsEditingPin(false);
  };

  const handleSaveHandbook = () => {
    if (!tournament) return;
    onUpdateTournament({ ...tournament, handbook: editingHandbookData });
    setIsEditingHandbook(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-xl">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tournament?.name}</h2>
            <div className="flex items-center gap-2">
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
                    <button onClick={() => handleUpdateFormat('League')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">League Table {tournament?.format === 'League' && <Check className="w-4 h-4 text-emerald-500" />}</button>
                    <button onClick={() => handleUpdateFormat('Knockout')} className="w-full text-left px-4 py-3 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-between">Knockout Bracket {tournament?.format === 'Knockout' && <Check className="w-4 h-4 text-emerald-500" />}</button>
                  </div>
                )}
              </div>
              {isAdmin && (
                <div className="relative">
                  <button 
                    onClick={() => setIsEditingPin(!isEditingPin)}
                    className="bg-slate-800 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-b-4 border-slate-950 flex items-center gap-2 transition-all hover:bg-slate-700 active:translate-y-0.5 active:border-b-0 backdrop-blur-sm"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    PIN: {tournament?.matchPasscode}
                  </button>
                  {isEditingPin && (
                    <div className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 min-w-[240px] animate-in slide-in-from-top-2">
                      <form onSubmit={handleUpdatePin} className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Scorer Passcode</label>
                        <input 
                          autoFocus
                          type="text" 
                          value={newPin} 
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-black text-center tracking-[0.3em]"
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-[10px] font-black uppercase">Update</button>
                          <button type="button" onClick={() => setIsEditingPin(false)} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase">X</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-700 font-bold text-sm">Real-time tournament tracking & manual tie-ups.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={handleOpenHandbook} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <BookOpen className="w-4 h-4" /> Handbook
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/40 border border-white/60 px-4 py-2.5 rounded-2xl text-slate-700 font-bold hover:bg-white/60 transition-all group"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
            <span className="text-sm">{copied ? 'Copied' : 'Share'}</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => onNavigate('teams')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl bg-emerald-600/90 text-white hover:bg-emerald-700`}
            >
              <Plus className="w-4 h-4" /> Add Teams
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="w-6 h-6 text-indigo-600" />} label="Total Teams" value={teams.length} onClick={() => onNavigate('teams')} color="indigo" />
        <StatCard icon={<Swords className="w-6 h-6 text-emerald-600" />} label="Matches" value={matches.length} onClick={() => onNavigate('matches')} color="emerald" />
        <StatCard icon={<Trophy className="w-6 h-6 text-amber-600" />} label="1st Place" value={standings[0]?.teamName || 'TBD'} onClick={() => standings[0] ? onSelectTeam(standings[0].teamId) : onNavigate('standings')} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] p-8 shadow-sm relative group overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-600 p-3 rounded-2xl"><ListChecks className="w-6 h-6 text-white" /></div>
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
            <button onClick={handleOpenHandbook} className="mt-8 w-full flex items-center justify-center gap-2 text-indigo-700 font-black uppercase tracking-widest text-[10px] hover:gap-4 transition-all py-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
              Open Comprehensive Guide <ChevronRight className="w-4 h-4" />
            </button>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span> On Court Now
              </h3>
            </div>
            {activeMatches.length === 0 ? (
              <div className="bg-white/30 backdrop-blur-lg border-2 border-dashed border-white/60 rounded-[2.5rem] p-12 text-center group">
                <p className="text-slate-700 font-bold text-lg mb-4">No live matches at the moment.</p>
                <button onClick={() => onNavigate('matches')} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all inline-flex items-center gap-2 shadow-lg">Schedule Tie-ups <ArrowRight className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeMatches.map(m => {
                  const t1 = teams.find(t => t.id === m.team1Id);
                  const t2 = teams.find(t => t.id === m.team2Id);
                  
                  return (
                    <div key={m.id} onClick={() => onNavigate('matches')} className="bg-white/60 backdrop-blur-xl border-2 border-white/60 rounded-[2rem] p-6 flex flex-col cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                      <div className="flex items-center gap-4 sm:gap-8 mb-6">
                        <div className="text-center w-20 sm:w-24 shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 mx-auto mb-1 transition-transform group-hover:scale-110">{t1?.name.charAt(0)}</div>
                          <div className="font-bold text-slate-900 text-[10px] sm:text-xs truncate">{t1?.name}</div>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-center bg-slate-900 text-white w-full py-4 rounded-3xl font-black text-4xl tabular-nums shadow-lg border-b-4 border-indigo-500 gap-3">
                            {m.scores[m.scores.length - 1]?.team1 || 0}
                            <span className="text-slate-600 text-xl font-medium">:</span>
                            {m.scores[m.scores.length - 1]?.team2 || 0}
                          </div>
                          <div className="mt-2 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                            Currently Playing Game {m.scores.length + 1}
                          </div>
                        </div>
                        <div className="text-center w-20 sm:w-24 shrink-0">
                          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center font-black text-indigo-700 mx-auto mb-1 transition-transform group-hover:scale-110">{t2?.name.charAt(0)}</div>
                          <div className="font-bold text-slate-900 text-[10px] sm:text-xs truncate">{t2?.name}</div>
                        </div>
                      </div>

                      {m.lineups && m.lineups.length > 0 && (
                        <div className="space-y-2 border-t border-slate-100 pt-4">
                           {m.lineups.slice(0, m.scores.length + 1).map((lineup, idx) => {
                             const isCurrent = idx === m.scores.length;
                             return (
                               <div key={idx} className={`flex items-center justify-between text-[9px] p-2 rounded-xl transition-all ${isCurrent ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 opacity-60'}`}>
                                 <span className="font-black w-4">G{idx+1}</span>
                                 <div className="flex-1 flex justify-between items-center px-4">
                                   <div className="font-bold truncate max-w-[40%] text-left">{lineup.team1Players.join(' & ')}</div>
                                   <div className="font-black italic px-2">VS</div>
                                   <div className="font-bold truncate max-w-[40%] text-right">{lineup.team2Players.join(' & ')}</div>
                                 </div>
                                 {isCurrent && <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>}
                               </div>
                             );
                           })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Admin Tools Section */}
          {isAdmin && (
            <section className="bg-red-50/50 border-2 border-dashed border-red-200 rounded-[2.5rem] p-8">
               <div className="flex items-center gap-3 mb-6">
                 <div className="bg-red-600 p-3 rounded-2xl"><AlertTriangle className="w-6 h-6 text-white" /></div>
                 <div>
                   <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Danger Zone</h3>
                   <p className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest">Admin Controls</p>
                 </div>
               </div>
               <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={onResetTournamentData}
                    className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Reset Tournament Data
                  </button>
                  <button 
                    onClick={onReset}
                    className="bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> Switch Tournament
                  </button>
               </div>
            </section>
          )}
        </div>

        <section className="bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[500px] border border-white/5">
          <div className="p-8 border-b border-white/10 bg-white/5"><h3 className="font-black text-white text-2xl flex items-center gap-3 uppercase tracking-tighter italic"><Trophy className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" /> Top Ranking</h3></div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {standings.length === 0 ? <div className="p-12 text-center text-white/30 font-bold italic">Waiting for tournament data...</div> : (
              <div className="divide-y divide-white/5">
                {standings.slice(0, 6).map((s, i) => (
                  <div key={s.teamId} onClick={() => onSelectTeam(s.teamId)} className="px-8 py-6 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-all group">
                    <div className="flex items-center gap-5">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${i === 0 ? 'bg-amber-400 text-amber-900 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                      <div><div className="font-black text-white text-lg group-hover:text-indigo-400 transition-colors tracking-tight">{s.teamName}</div><div className="text-[10px] font-black uppercase text-indigo-400/80 tracking-widest">{s.points} Pts • {s.wins} Wins</div></div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-white transition-all group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onNavigate('standings')} className="p-6 bg-white/5 text-center text-white/50 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border-t border-white/5 group"><span className="flex items-center justify-center gap-2 group-hover:gap-4 transition-all">View Complete Standings <ChevronRight className="w-4 h-4" /></span></button>
        </section>
      </div>

      {/* Handbook Modal */}
      {showHandbook && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-300 print:relative print:bg-white">
          <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-4">
              <button onClick={() => setShowHandbook(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-6 h-6 text-slate-900" />
              </button>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tournament Handbook</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrintHandbook} className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all" title="Print to PDF">
                <Printer className="w-5 h-5" />
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => setIsEditingHandbook(!isEditingHandbook)} className={`p-2.5 rounded-xl transition-all ${isEditingHandbook ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    <Settings2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleExportHandbook} className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all" title="Export JSON">
                    <FileJson className="w-5 h-5" />
                  </button>
                  <label className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all cursor-pointer" title="Import JSON">
                    <Upload className="w-5 h-5" />
                    <input type="file" accept=".json" onChange={handleImportHandbook} className="hidden" />
                  </label>
                </>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8 sm:p-20 print:p-0">
             <div id="handbook-content" className="max-w-4xl mx-auto space-y-16 print:max-w-none">
                <div className="text-center space-y-4">
                   <Trophy className="w-16 h-16 text-indigo-600 mx-auto" />
                   <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">{tournament?.name} Manifesto</h1>
                   <div className="h-1 w-24 bg-indigo-600 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 gap-16">
                   {(isEditingHandbook ? editingHandbookData : currentHandbook).map((section, sIdx) => (
                      <div key={section.id} className="space-y-6">
                         <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-4">
                            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                               {isEditingHandbook ? (
                                 <select 
                                   value={section.iconName} 
                                   onChange={(e) => {
                                     const next = [...editingHandbookData];
                                     next[sIdx].iconName = e.target.value as any;
                                     setEditingHandbookData(next);
                                   }}
                                   className="bg-transparent font-bold outline-none"
                                 >
                                    <option value="Trophy">Trophy</option>
                                    <option value="Activity">Activity</option>
                                    <option value="Users">Users</option>
                                    <option value="Target">Target</option>
                                    <option value="Swords">Swords</option>
                                 </select>
                               ) : (ICON_MAP[section.iconName] || <ListChecks />)}
                            </div>
                            <div className="flex-1">
                               {isEditingHandbook ? (
                                 <input 
                                   className="text-2xl font-black text-slate-900 outline-none w-full bg-slate-50 p-2 rounded-lg"
                                   value={section.title}
                                   onChange={(e) => {
                                     const next = [...editingHandbookData];
                                     next[sIdx].title = e.target.value;
                                     setEditingHandbookData(next);
                                   }}
                                 />
                               ) : (
                                 <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{section.title}</h2>
                               )}
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            {isEditingHandbook ? (
                              <textarea 
                                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-700 font-medium outline-none"
                                value={section.content}
                                rows={3}
                                onChange={(e) => {
                                  const next = [...editingHandbookData];
                                  next[sIdx].content = e.target.value;
                                  setEditingHandbookData(next);
                                }}
                              />
                            ) : (
                              <p className="text-slate-600 text-lg leading-relaxed font-medium">{section.content}</p>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {(section.items || []).map((item, iIdx) => (
                                  <div key={iIdx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                                     {isEditingHandbook ? (
                                       <>
                                         <input 
                                           className="w-full font-black text-indigo-600 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                                           value={item.label}
                                           onChange={(e) => {
                                             const next = [...editingHandbookData];
                                             next[sIdx].items[iIdx].label = e.target.value;
                                             setEditingHandbookData(next);
                                           }}
                                         />
                                         <textarea 
                                           className="w-full text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-2"
                                           value={item.desc}
                                           rows={2}
                                           onChange={(e) => {
                                             const next = [...editingHandbookData];
                                             next[sIdx].items[iIdx].desc = e.target.value;
                                             setEditingHandbookData(next);
                                           }}
                                         />
                                       </>
                                     ) : (
                                       <>
                                         <div className="text-xs font-black text-indigo-600 uppercase tracking-widest">{item.label}</div>
                                         <p className="text-sm text-slate-500 font-bold leading-snug">{item.desc}</p>
                                       </>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </main>
          
          {isEditingHandbook && (
            <footer className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 print:hidden">
               <button onClick={() => setIsEditingHandbook(false)} className="px-8 py-3 bg-white text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200">Cancel</button>
               <button onClick={handleSaveHandbook} className="px-12 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100">Save manifesto</button>
            </footer>
          )}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #handbook-content, #handbook-content * { visibility: visible; }
          #handbook-content { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon, label, value, onClick, color }: { icon: React.ReactNode, label: string, value: string | number, onClick: () => void, color: 'indigo' | 'emerald' | 'amber' }) => (
  <div onClick={onClick} className={`p-8 rounded-[2.5rem] border backdrop-blur-xl transition-all cursor-pointer group shadow-xl relative overflow-hidden ${color === 'indigo' ? 'border-indigo-200/50 hover:border-indigo-500 bg-white/40 shadow-indigo-100/20' : color === 'emerald' ? 'border-emerald-200/50 hover:border-emerald-500 bg-white/40 shadow-emerald-100/20' : 'border-amber-200/50 hover:border-amber-500 bg-white/40 shadow-amber-100/20'}`}>
    <div className="flex items-center gap-4 mb-4 relative z-10"><div className="p-3 bg-white/60 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm border border-white/40">{icon}</div><span className="text-slate-500 font-black text-xs uppercase tracking-[0.25em]">{label}</span></div>
    <div className="text-4xl font-black text-slate-900 tracking-tighter relative z-10 group-hover:translate-x-2 transition-transform duration-300">{value}</div>
  </div>
);

export default Dashboard;
