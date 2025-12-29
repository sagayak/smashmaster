import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  Users, 
  Swords, 
  BarChart3, 
  Plus, 
  Play, 
  Trash2, 
  ChevronLeft,
  Share2,
  Info,
  Save,
  RotateCcw,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  X
} from 'lucide-react';
import { Team, Match, ViewState, StandingsEntry, GameScore, Tournament } from './types';
import TeamManager from './components/TeamManager';
import MatchManager from './components/MatchManager';
import MatchScorer from './components/MatchScorer';
import Standings from './components/Standings';
import Dashboard from './components/Dashboard';
import TournamentSelector from './components/TournamentSelector';
import TeamDashboard from './components/TeamDashboard';
import { api } from './lib/api';

const ADMIN_PIN = "1218";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isScorer, setIsScorer] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showScorerModal, setShowScorerModal] = useState<boolean>(false);
  const [showUmpireModal, setShowUmpireModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [umpireInput, setUmpireInput] = useState<string[]>(["", ""]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const list = await api.getTournaments();
      setTournaments(list);
    } catch (err: any) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(async (isManual = false) => {
    if (!selectedTournamentId) return;
    if (isManual) setIsRefreshing(true);
    try {
      const [t, m] = await Promise.all([
        api.getTeams(selectedTournamentId), 
        api.getMatches(selectedTournamentId)
      ]);
      setTeams(t);
      setMatches(m);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    } catch (err: any) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    fetchTournaments();
    const adminStatus = sessionStorage.getItem('smashmaster_admin');
    const scorerStatus = sessionStorage.getItem('smashmaster_scorer');
    if (adminStatus === 'true') setIsAdmin(true);
    if (scorerStatus === 'true') setIsScorer(true);
  }, [fetchTournaments]);

  useEffect(() => {
    if (selectedTournamentId) {
      fetchData();
      const unsubscribe = api.subscribeToChanges(() => fetchData());
      return () => unsubscribe();
    }
  }, [selectedTournamentId, fetchData]);

  const handleCreateTournament = async (name: string, format: 'League' | 'Knockout') => {
    setLoading(true);
    try {
      const newTournament: Tournament = {
        id: crypto.randomUUID(),
        name,
        format,
        createdAt: Date.now(),
        status: 'active',
        matchPasscode: '0000'
      };
      setTournaments(prev => [newTournament, ...prev]);
      await api.saveTournament(newTournament);
      await fetchTournaments();
    } catch (err: any) {
      alert(`Error creating tournament: ${err.message}`);
      fetchTournaments();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournament = async (updated: Tournament) => {
    try {
      await api.updateTournament(updated);
      setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err: any) {
      alert(`Error updating tournament: ${err.message}`);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    try {
      await api.deleteTournament(id);
      setTournaments(prev => prev.filter(t => t.id !== id));
      if (selectedTournamentId === id) setSelectedTournamentId(null);
    } catch (err: any) {
      alert(`Error deleting tournament: ${err.message}`);
    }
  };

  const handleAddTeam = async (team: Team) => {
    try {
      await api.saveTeam(team);
      fetchData();
    } catch (err: any) {
      alert(`Error adding team: ${err.message}`);
    }
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    try {
      await api.updateTeam(updatedTeam);
      fetchData();
    } catch (err: any) {
      alert(`Error updating team: ${err.message}`);
    }
  };

  const handleUpdateMatch = async (updatedMatch: Match) => {
    try {
      await api.updateMatch(updatedMatch);
      fetchData();
    } catch (err: any) {
      alert(`Error updating match: ${err.message}`);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      sessionStorage.setItem('smashmaster_admin', 'true');
      setShowPinModal(false);
      setPinInput("");
    } else {
      alert("Incorrect Admin PIN");
      setPinInput("");
    }
  };

  const handleScorerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentTournament = tournaments.find(t => t.id === selectedTournamentId);
    if (pinInput === currentTournament?.matchPasscode) {
      setIsScorer(true);
      sessionStorage.setItem('smashmaster_scorer', 'true');
      setShowScorerModal(false);
      setPinInput("");
      
      const match = matches.find(m => m.id === activeMatchId);
      if (match) {
        setUmpireInput(match.umpireNames && match.umpireNames.length >= 2 ? [match.umpireNames[0], match.umpireNames[1]] : ["", ""]);
        setShowUmpireModal(true);
      }
    } else {
      alert("Incorrect Scorer Passcode");
      setPinInput("");
    }
  };

  const handleUmpireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const match = matches.find(m => m.id === activeMatchId);
    if (!match) return;

    const umpires = umpireInput.filter(u => u.trim() !== "");
    const updatedMatch: Match = { ...match, umpireNames: umpires.length > 0 ? umpires : undefined };
    
    await api.updateMatch(updatedMatch);
    setMatches(prev => prev.map(m => m.id === updatedMatch.id ? updatedMatch : m));
    
    setShowUmpireModal(false);
    setView('scorer');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsScorer(false);
    sessionStorage.removeItem('smashmaster_admin');
    sessionStorage.removeItem('smashmaster_scorer');
  };

  const handleStartMatchRequested = (id: string) => {
    const match = matches.find(m => m.id === id);
    setActiveMatchId(id);
    
    if (match?.umpireNames && match.umpireNames.length >= 2) {
      setUmpireInput([match.umpireNames[0], match.umpireNames[1]]);
    } else {
      setUmpireInput(["", ""]);
    }

    if (isAdmin || isScorer) {
      setShowUmpireModal(true);
    } else {
      setShowScorerModal(true);
    }
  };

  const calculateStandings = useCallback((): StandingsEntry[] => {
    const stats: Record<string, StandingsEntry> = {};
    teams.forEach(team => {
      stats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        wins: 0,
        losses: 0,
        gamesWon: 0,
        gamesLost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0
      };
    });

    matches.filter(m => m.status === 'completed').forEach(match => {
      const t1 = stats[match.team1Id];
      const t2 = stats[match.team2Id];
      if (!t1 || !t2) return;
      
      if (match.winnerId === match.team1Id) {
        t1.wins += 1;
        t2.losses += 1;
      } else if (match.winnerId === match.team2Id) {
        t2.wins += 1;
        t1.losses += 1;
      }

      match.scores.forEach(game => {
        if (game.team1 > game.team2) {
          t1.gamesWon++;
          t2.gamesLost++;
        } else if (game.team2 > game.team1) {
          t2.gamesWon++;
          t1.gamesLost++;
        }

        t1.pointsFor += (game.team1 || 0);
        t1.pointsAgainst += (game.team2 || 0);
        t2.pointsFor += (game.team2 || 0);
        t2.pointsAgainst += (game.team1 || 0);
      });
    });

    return Object.values(stats)
      .map(s => ({ ...s, pointDiff: s.pointsFor - s.pointsAgainst }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
        return b.pointDiff - a.pointDiff;
      });
  }, [teams, matches]);

  const standings = calculateStandings();
  const top4 = standings.slice(0, 4);
  const activeMatch = matches.find(m => m.id === activeMatchId);
  const currentTournament = tournaments.find(t => t.id === selectedTournamentId);

  const handleSelectTeamForDashboard = (teamId: string) => {
    setSelectedTeamId(teamId);
    setView('team-dashboard');
  };

  const eligibleUmpireTeams = teams.filter(t => 
    activeMatch ? (t.id !== activeMatch.team1Id && t.id !== activeMatch.team2Id) : true
  );

  if (!selectedTournamentId && !loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TournamentSelector 
          tournaments={tournaments}
          onSelect={setSelectedTournamentId}
          onCreate={handleCreateTournament}
          onDelete={handleDeleteTournament}
          isAdmin={isAdmin}
          onAdminLogin={() => setShowPinModal(true)}
        />
        {showPinModal && (
          <PinModal 
            title="Admin Access"
            pinInput={pinInput} 
            setPinInput={setPinInput} 
            onSubmit={handlePinSubmit} 
            onCancel={() => setShowPinModal(false)} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('dashboard')}>
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-black text-slate-900 leading-tight">SmashMaster</h1>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">
                    {currentTournament?.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTournamentId(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all">
                <LayoutGrid className="w-3.5 h-3.5" />
                Switch
              </button>
            </div>

            <nav className="flex items-center gap-1 sm:gap-4">
              <NavButton active={view === 'dashboard'} icon={<BarChart3 className="w-4 h-4" />} label="Home" onClick={() => setView('dashboard')} />
              <NavButton active={view === 'teams' || view === 'team-dashboard'} icon={<Users className="w-4 h-4" />} label="Teams" onClick={() => setView('teams')} />
              <NavButton active={view === 'matches'} icon={<Swords className="w-4 h-4" />} label="Matches" onClick={() => setView('matches')} />
              <NavButton active={view === 'standings'} icon={<Trophy className="w-4 h-4" />} label="Rankings" onClick={() => setView('standings')} />
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              {isAdmin || isScorer ? (
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-bold">
                  {isAdmin ? <Unlock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  <span className="hidden md:inline">{isAdmin ? 'Admin' : 'Scorer'}</span>
                </button>
              ) : (
                <button onClick={() => setShowPinModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium">
                  <Lock className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showPinModal && <PinModal title="Admin Authentication" pinInput={pinInput} setPinInput={setPinInput} onSubmit={handlePinSubmit} onCancel={() => setShowPinModal(false)} />}
      {showScorerModal && <PinModal title="Scorer Authentication" description="Enter the match access code to start scoring." pinInput={pinInput} setPinInput={setPinInput} onSubmit={handleScorerSubmit} onCancel={() => setShowScorerModal(false)} />}
      
      {showUmpireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-emerald-100 p-3 rounded-full mb-4">
                <UserCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Match Officials</h3>
              <p className="text-slate-500 text-sm mt-1">Select exactly two teams to serve as umpires for this tie-up.</p>
            </div>
            <form onSubmit={handleUmpireSubmit} className="space-y-5">
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Umpire Team {i+1}</label>
                    <select 
                      required
                      value={umpireInput[i]}
                      onChange={(e) => {
                        const next = [...umpireInput];
                        next[i] = e.target.value;
                        setUmpireInput(next);
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl bg-slate-50 text-sm font-bold outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Select Umpire Team --</option>
                      {eligibleUmpireTeams.map(t => (
                        <option key={t.id} value={t.name} disabled={umpireInput.includes(t.name) && umpireInput[i] !== t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="submit" 
                  disabled={umpireInput.some(u => !u)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                >
                  Proceed to Scoreboard
                </button>
                <button 
                  type="button" 
                  onClick={() => { setShowUmpireModal(false); setView('scorer'); }} 
                  className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all text-xs"
                >
                  Skip Umpires
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {(loading || isRefreshing) && (
          <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center pt-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-500 font-medium">Syncing...</p>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard 
            teams={teams} matches={matches} standings={standings} onNavigate={setView} onReset={() => setSelectedTournamentId(null)}
            isAdmin={isAdmin} onAdminLogin={() => setShowPinModal(true)} tournament={currentTournament}
            onUpdateTournament={handleUpdateTournament}
            onSelectTeam={handleSelectTeamForDashboard}
            onAddTeam={handleAddTeam}
          />
        )}
        {view === 'teams' && <TeamManager teams={teams} matches={matches} tournamentId={selectedTournamentId!} onAdd={handleAddTeam} onUpdate={handleUpdateTeam} onRemove={async (id) => { if(!isAdmin) return setShowPinModal(true); await api.deleteTeam(id); fetchData(); }} onSelectTeam={handleSelectTeamForDashboard} isAdmin={isAdmin} onAdminLogin={() => setShowPinModal(true)} />}
        {view === 'matches' && (
          <MatchManager 
            teams={teams} 
            matches={matches} 
            tournamentId={selectedTournamentId!} 
            onCreate={async (m) => { if(!isAdmin) return setShowPinModal(true); await api.saveMatch(m); fetchData(); setView('matches'); }} 
            onUpdate={handleUpdateMatch}
            onDelete={async (id) => { if(!isAdmin) return setShowPinModal(true); await api.deleteMatch(id); fetchData(); }} 
            onStart={handleStartMatchRequested} 
            isAdmin={isAdmin} 
            onAdminLogin={() => setShowPinModal(true)} 
          />
        )}
        {view === 'scorer' && activeMatch && <MatchScorer match={activeMatch} team1={teams.find(t => t.id === activeMatch.team1Id)!} team2={teams.find(t => t.id === activeMatch.team2Id)!} onUpdate={async (m) => { await api.updateMatch(m); fetchData(); }} onFinish={() => setView('matches')} />}
        {view === 'standings' && (
          <Standings 
            standings={standings} 
            top4={top4} 
            isAdmin={isAdmin} 
            onAddTieUp={(t1, t2) => {
              if(!isAdmin) return setShowPinModal(true);
              const nextOrder = matches.length > 0 ? Math.max(...matches.map(m => m.order || 0)) + 1 : 1;
              const nm: Match = { id: crypto.randomUUID(), tournamentId: selectedTournamentId!, team1Id: t1, team2Id: t2, status: 'scheduled', format: 3, pointsTarget: 21, currentGame: 0, scores: [], createdAt: Date.now(), order: nextOrder };
              api.saveMatch(nm).then(() => fetchData());
            }} 
            onSelectTeam={handleSelectTeamForDashboard}
          />
        )}
        {view === 'team-dashboard' && selectedTeamId && (
          <TeamDashboard 
            team={teams.find(t => t.id === selectedTeamId)!} 
            matches={matches} 
            teams={teams}
            standings={standings}
            onBack={() => setView('teams')}
            onStartMatch={handleStartMatchRequested}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div>&copy; SmashMaster Pro • {currentTournament?.name}</div>
          <div className="flex items-center gap-4">
            <button onClick={() => fetchData(true)} disabled={isRefreshing} className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync
            </button>
            <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <Save className="w-3 h-3 text-emerald-500" /> Saved: {lastSaved}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const PinModal = ({ title, description, pinInput, setPinInput, onSubmit, onCancel }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-8 max-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mb-4">
          <Lock className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm mt-1">{description || "Enter valid credentials to continue."}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input autoFocus type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} placeholder="Passcode" className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-black" />
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Enter</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
        </div>
      </form>
    </div>
  </div>
);

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
