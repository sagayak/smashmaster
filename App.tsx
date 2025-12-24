
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
  LayoutGrid
} from 'lucide-react';
import { Team, Match, ViewState, StandingsEntry, GameScore, Tournament } from './types';
import TeamManager from './components/TeamManager';
import MatchManager from './components/MatchManager';
import MatchScorer from './components/MatchScorer';
import Standings from './components/Standings';
import Dashboard from './components/Dashboard';
import TournamentSelector from './components/TournamentSelector';
import { api } from './lib/api';

const ADMIN_PIN = "1218";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial Tournaments Fetch
  const fetchTournaments = useCallback(async () => {
    try {
      const list = await api.getTournaments();
      setTournaments(list);
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Scoped Data
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
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedTournamentId]);

  useEffect(() => {
    fetchTournaments();
    const adminStatus = sessionStorage.getItem('smashmaster_admin');
    if (adminStatus === 'true') setIsAdmin(true);
  }, [fetchTournaments]);

  useEffect(() => {
    if (selectedTournamentId) {
      fetchData();
      const unsubscribe = api.subscribeToChanges(() => fetchData());
      return () => unsubscribe();
    }
  }, [selectedTournamentId, fetchData]);

  // Tournament Handlers
  const handleCreateTournament = async (name: string) => {
    setLoading(true);
    try {
      const newTournament: Tournament = {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        status: 'active'
      };
      await api.saveTournament(newTournament);
      await fetchTournaments();
    } catch (err) {
      alert("Failed to create tournament. Please check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    try {
      await api.deleteTournament(id);
      await fetchTournaments();
      if (selectedTournamentId === id) setSelectedTournamentId(null);
    } catch (err) {
      alert("Failed to delete tournament.");
      console.error(err);
    }
  };

  // Auth Handlers
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      sessionStorage.setItem('smashmaster_admin', 'true');
      setShowPinModal(false);
      setPinInput("");
    } else {
      alert("Incorrect PIN");
      setPinInput("");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('smashmaster_admin');
  };

  const triggerAdminLogin = () => setShowPinModal(true);

  // Scoped Data Handlers
  const addTeam = async (team: Team) => {
    if (!isAdmin) return triggerAdminLogin();
    const newTeam = { ...team, tournamentId: selectedTournamentId! };
    await api.saveTeam(newTeam);
    await fetchData();
  };

  const removeTeam = async (id: string) => {
    if (!isAdmin) return triggerAdminLogin();
    await api.deleteTeam(id);
    await fetchData();
  };
  
  const createMatch = async (match: Match) => {
    if (!isAdmin) return triggerAdminLogin();
    const newMatch = { ...match, tournamentId: selectedTournamentId! };
    await api.saveMatch(newMatch);
    await fetchData();
    setView('matches');
  };

  const deleteMatch = async (id: string) => {
    if (!isAdmin) return triggerAdminLogin();
    await api.deleteMatch(id);
    await fetchData();
  };

  const startMatch = (id: string) => {
    setActiveMatchId(id);
    setView('scorer');
  };

  const updateMatch = async (updatedMatch: Match) => {
    await api.updateMatch(updatedMatch);
    await fetchData();
  };

  const calculateStandings = useCallback((): StandingsEntry[] => {
    const stats: Record<string, StandingsEntry> = {};
    teams.forEach(team => {
      stats[team.id] = {
        teamId: team.id,
        teamName: team.name,
        wins: 0,
        losses: 0,
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
        t1.pointsFor += game.team1;
        t1.pointsAgainst += game.team2;
        t2.pointsFor += game.team2;
        t2.pointsAgainst += game.team1;
      });
    });

    return Object.values(stats)
      .map(s => ({ ...s, pointDiff: s.pointsFor - s.pointsAgainst }))
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.pointDiff - a.pointDiff;
      });
  }, [teams, matches]);

  const standings = calculateStandings();
  const top4 = standings.slice(0, 4);
  const activeMatch = matches.find(m => m.id === activeMatchId);
  const currentTournament = tournaments.find(t => t.id === selectedTournamentId);

  if (!selectedTournamentId && !loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TournamentSelector 
          tournaments={tournaments}
          onSelect={setSelectedTournamentId}
          onCreate={handleCreateTournament}
          onDelete={handleDeleteTournament}
          isAdmin={isAdmin}
          onAdminLogin={triggerAdminLogin}
        />
        {showPinModal && (
          <PinModal 
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
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => setView('dashboard')}
              >
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-black text-slate-900 leading-tight">SmashMaster</h1>
                  <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">{currentTournament?.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTournamentId(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Switch
              </button>
            </div>

            <nav className="flex items-center gap-1 sm:gap-4">
              <NavButton active={view === 'dashboard'} icon={<BarChart3 className="w-4 h-4" />} label="Home" onClick={() => setView('dashboard')} />
              <NavButton active={view === 'teams'} icon={<Users className="w-4 h-4" />} label="Teams" onClick={() => setView('teams')} />
              <NavButton active={view === 'matches'} icon={<Swords className="w-4 h-4" />} label="Matches" onClick={() => setView('matches')} />
              <NavButton active={view === 'standings'} icon={<Trophy className="w-4 h-4" />} label="Rankings" onClick={() => setView('standings')} />
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              
              {isAdmin ? (
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-bold"
                >
                  <Unlock className="w-4 h-4" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              ) : (
                <button 
                  onClick={triggerAdminLogin}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden md:inline">Admin Login</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showPinModal && (
        <PinModal 
          pinInput={pinInput} 
          setPinInput={setPinInput} 
          onSubmit={handlePinSubmit} 
          onCancel={() => setShowPinModal(false)} 
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {(loading || (isRefreshing && !selectedTournamentId)) && (
          <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center pt-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-500 font-medium animate-pulse">Processing tournament data...</p>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard 
            teams={teams} 
            matches={matches} 
            standings={standings} 
            onNavigate={setView} 
            onReset={() => setSelectedTournamentId(null)}
            isAdmin={isAdmin}
            onAdminLogin={triggerAdminLogin}
          />
        )}

        {view === 'teams' && (
          <TeamManager 
            teams={teams} 
            onAdd={addTeam} 
            onRemove={removeTeam} 
            isAdmin={isAdmin}
            onAdminLogin={triggerAdminLogin}
          />
        )}

        {view === 'matches' && (
          <MatchManager 
            teams={teams} 
            matches={matches} 
            onCreate={createMatch} 
            onDelete={deleteMatch}
            onStart={startMatch}
            isAdmin={isAdmin}
            onAdminLogin={triggerAdminLogin}
          />
        )}

        {view === 'scorer' && activeMatch && (
          <MatchScorer 
            match={activeMatch} 
            team1={teams.find(t => t.id === activeMatch.team1Id)!}
            team2={teams.find(t => t.id === activeMatch.team2Id)!}
            onUpdate={updateMatch}
            onFinish={() => setView('matches')}
          />
        )}

        {view === 'standings' && (
          <Standings 
            standings={standings} 
            top4={top4} 
            isAdmin={isAdmin}
            onAddTieUp={(t1, t2) => {
              const newMatch: Match = {
                id: crypto.randomUUID(),
                tournamentId: selectedTournamentId!,
                team1Id: t1,
                team2Id: t2,
                status: 'scheduled',
                format: 3,
                pointsTarget: 21,
                currentGame: 0,
                scores: [],
                createdAt: Date.now()
              };
              createMatch(newMatch);
            }}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <div>&copy; {new Date().getFullYear()} SmashMaster Pro • {currentTournament?.name}</div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Sync Data'}
            </button>
            <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <Save className="w-3 h-3 text-emerald-500" />
              Auto-archived: {lastSaved}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const PinModal = ({ pinInput, setPinInput, onSubmit, onCancel }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mb-4">
          <Lock className="w-6 h-6 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Admin Authentication</h3>
        <p className="text-slate-500 text-sm mt-1">Enter your secret PIN to unlock tournament management.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input 
          autoFocus
          type="password"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          placeholder="Enter PIN"
          className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-black"
        />
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Unlock</button>
          <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
        </div>
      </form>
    </div>
  </div>
);

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${
      active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
