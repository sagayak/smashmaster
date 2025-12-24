
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
  Loader2
} from 'lucide-react';
import { Team, Match, ViewState, StandingsEntry, GameScore } from './types';
import TeamManager from './components/TeamManager';
import MatchManager from './components/MatchManager';
import MatchScorer from './components/MatchScorer';
import Standings from './components/Standings';
import Dashboard from './components/Dashboard';
import { api } from './lib/api';

const ADMIN_PIN = "1218";

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");

  // Initial Data Fetch
  const fetchData = useCallback(async () => {
    try {
      const [t, m] = await Promise.all([api.getTeams(), api.getMatches()]);
      setTeams(t);
      setMatches(m);
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    fetchData();

    // Check if was admin in this session
    const adminStatus = sessionStorage.getItem('smashmaster_admin');
    if (adminStatus === 'true') setIsAdmin(true);
    
    // Setup Real-time Subscription for instant cloud updates
    const unsubscribe = api.subscribeToChanges(() => {
      console.log("Database update detected, refreshing...");
      fetchData();
    });

    return () => {
      unsubscribe();
    };
  }, [fetchData]);

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

  // Handlers
  const addTeam = async (team: Team) => {
    if (!isAdmin) return triggerAdminLogin();
    await api.saveTeam(team);
    // Real-time listener will trigger fetchData automatically
  };

  const removeTeam = async (id: string) => {
    if (!isAdmin) return triggerAdminLogin();
    await api.deleteTeam(id);
  };
  
  const createMatch = async (match: Match) => {
    if (!isAdmin) return triggerAdminLogin();
    await api.saveMatch(match);
    setView('matches');
  };

  const deleteMatch = async (id: string) => {
    if (!isAdmin) return triggerAdminLogin();
    await api.deleteMatch(id);
  };

  const startMatch = (id: string) => {
    setActiveMatchId(id);
    setView('scorer');
  };

  const updateMatch = async (updatedMatch: Match) => {
    await api.updateMatch(updatedMatch);
  };

  const resetTournament = async () => {
    if (!isAdmin) return triggerAdminLogin();
    if (window.confirm('Are you absolutely sure? This will delete all cloud/local data for this tournament.')) {
      setLoading(true);
      await api.clearAll();
      await fetchData();
      setView('dashboard');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">SmashMaster</h1>
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

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-indigo-100 p-3 rounded-full mb-4">
                <Lock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Admin Authentication</h3>
              <p className="text-slate-500 text-sm mt-1">Enter your secret PIN to unlock tournament management.</p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input 
                autoFocus
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN"
                className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none text-center text-2xl tracking-[0.5em] font-black"
              />
              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                >
                  Unlock
                </button>
                <button 
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinInput(""); }}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center pt-20">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-slate-500 font-medium animate-pulse">Syncing tournament data...</p>
          </div>
        )}

        {view === 'dashboard' && (
          <Dashboard 
            teams={teams} 
            matches={matches} 
            standings={standings} 
            onNavigate={setView} 
            onReset={resetTournament}
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-500 text-sm">
          <div>&copy; {new Date().getFullYear()} SmashMaster Badminton Tournament Pro</div>
          <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            <Save className="w-3 h-3 text-emerald-500" />
            Synced at {lastSaved}
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ active, icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm font-medium whitespace-nowrap ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
