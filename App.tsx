
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
import { Team, Match, ViewState, StandingsEntry, GameScore, Tournament, HandbookSectionData } from './types';
import TeamManager from './components/TeamManager';
import MatchManager from './components/MatchManager';
import MatchScorer from './components/MatchScorer';
import Standings from './components/Standings';
import Dashboard from './components/Dashboard';
import TournamentSelector from './components/TournamentSelector';
import TeamDashboard from './components/TeamDashboard';
import { api } from './lib/api';
import PinModal from './components/PinModal';
import UmpireModal from './components/UmpireModal';
import NavButton from './components/NavButton';
import { ToastProvider, useToast } from './components/ToastContext';

const ADMIN_PIN = "1218";

const DEFAULT_HANDBOOK: HandbookSectionData[] = [
  {
    id: '1',
    title: '1. Ranking & Tie-Breakers',
    iconName: 'Trophy',
    content: 'Final standings are calculated using a strict hierarchical logic to ensure fair competition:',
    items: [
      { label: 'Match Wins', desc: 'The primary metric. The team with the most overall match victories ranks highest.' },
      { label: 'Set/Game Ratio', desc: 'Calculated as (Sets Won / Sets Played). Used if match wins are tied.' },
      { label: 'Point Difference', desc: 'The total points scored across all sets minus total points conceded.' }
    ]
  },
  {
    id: '2',
    title: '2. Point Difference (PD)',
    iconName: 'Activity',
    content: 'PD is our ultimate tie-breaker. Every single point in every set matters for your final rank.',
    items: [
      { label: 'Logic', desc: 'PD = (Sum of Your Points) - (Sum of Opponent Points).' },
      { label: 'Strategy', desc: 'Even if losing a match, keeping the score close (e.g., 28-30) protects your PD significantly more than a blowout.' }
    ]
  },
  {
    id: '3',
    title: '3. Match Protocols',
    iconName: 'Target',
    content: 'Standard match configurations for all tournament tie-ups(League Stage):',
    items: [
      { label: 'Format', desc: 'Typically Best of 3 sets. The first team to win 2 sets wins the match.' },
      { label: 'Scoring', desc: 'Rally point system. Sets are played to 30 points.' },
      { label: 'Shuttles', desc: 'Teams should provide their own shuttles unless specified by the venue.' }
    ]
  },
  {
    id: '4',
    title: '4. Umpiring Duties',
    iconName: 'Users',
    content: 'To ensure smooth flow, teams are assigned officiating duties for other matches.',
    items: [
      { label: 'Assignment', desc: 'Check the "Matches" tab. If your team is listed as an official, you must provide 2 umpires.' },
      { label: 'Role', desc: 'Officials track the live score and announce set winners to the tournament desk.' }
    ]
  }
];

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const { toast } = useToast();
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
        matchPasscode: '0000',
        handbook: DEFAULT_HANDBOOK
      };
      setTournaments(prev => [newTournament, ...prev]);
      await api.saveTournament(newTournament);
      await fetchTournaments();
      toast.success('Tournament created successfully');
    } catch (err: any) {
      toast.error(`Error creating tournament: ${err.message}`);
      fetchTournaments();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournament = async (updated: Tournament) => {
    try {
      await api.updateTournament(updated);
      setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast.success('Tournament updated');
    } catch (err: any) {
      toast.error(`Error updating tournament: ${err.message}`);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    try {
      await api.deleteTournament(id);
      setTournaments(prev => prev.filter(t => t.id !== id));
      if (selectedTournamentId === id) setSelectedTournamentId(null);
      toast.success('Tournament deleted');
    } catch (err: any) {
      toast.error(`Error deleting tournament: ${err.message}`);
    }
  };

  const handleAddTeam = async (team: Team) => {
    try {
      await api.saveTeam(team);
      fetchData();
      toast.success('Team added successfully');
    } catch (err: any) {
      toast.error(`Error adding team: ${err.message}`);
    }
  };

  const handleBulkAddTeams = async (newTeams: Team[]) => {
    try {
      setIsRefreshing(true);
      await api.saveTeams(newTeams);
      await fetchData();
      toast.success(`${newTeams.length} teams added successfully`);
    } catch (err: any) {
      toast.error(`Error bulk adding teams: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    try {
      await api.updateTeam(updatedTeam);
      fetchData();
      toast.success('Team updated successfully');
    } catch (err: any) {
      toast.error(`Error updating team: ${err.message}`);
    }
  };

  const handleUpdateMatch = async (updatedMatch: Match) => {
    try {
      await api.updateMatch(updatedMatch);
      fetchData();
      toast.success('Match updated');
    } catch (err: any) {
      toast.error(`Error updating match: ${err.message}`);
    }
  };

  const handleBulkCreateMatches = async (newMatches: Match[]) => {
    try {
      setIsRefreshing(true);
      await api.saveMatches(newMatches);
      await fetchData();
      toast.success(`${newMatches.length} matches imported`);
    } catch (err: any) {
      toast.error(`Error importing matches: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAdmin(true);
      sessionStorage.setItem('smashmaster_admin', 'true');
      setShowPinModal(false);
      setPinInput("");
      toast.success('Admin access granted');
    } else {
      toast.error("Incorrect Admin PIN");
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
      toast.success('Scorer access granted');
    } else {
      toast.error("Incorrect Scorer Passcode");
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
      <div className="min-h-screen">
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/40 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('dashboard')}>
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-black text-slate-900 leading-tight tracking-tight">SmashMaster</h1>
                  <p className="text-[10px] text-indigo-700 font-black uppercase tracking-widest">
                    {currentTournament?.name || 'Tournament'}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedTournamentId(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-700 rounded-lg text-xs font-bold transition-all border border-white/60">
                <LayoutGrid className="w-3.5 h-3.5" />
                Switch
              </button>
            </div>

            <nav className="flex items-center gap-1 sm:gap-4">
              <NavButton active={view === 'dashboard'} icon={<BarChart3 className="w-4 h-4" />} label="Home" onClick={() => setView('dashboard')} />
              <NavButton active={view === 'teams' || view === 'team-dashboard'} icon={<Users className="w-4 h-4" />} label="Teams" onClick={() => setView('teams')} />
              <NavButton active={view === 'matches'} icon={<Swords className="w-4 h-4" />} label="Matches" onClick={() => setView('matches')} />
              <NavButton active={view === 'standings'} icon={<Trophy className="w-4 h-4" />} label="Rankings" onClick={() => setView('standings')} />
              <div className="h-6 w-px bg-slate-300/40 mx-1"></div>
              {isAdmin || isScorer ? (
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-400/80 text-amber-900 hover:bg-amber-500/80 transition-colors text-sm font-bold backdrop-blur-md border border-amber-500/30">
                  {isAdmin ? <Unlock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                  <span className="hidden md:inline">{isAdmin ? 'Admin' : 'Scorer'}</span>
                </button>
              ) : (
                <button onClick={() => setShowPinModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-md text-slate-600 hover:bg-white/40 transition-colors text-sm font-bold">
                  <Lock className="w-4 h-4" />
                  <span className="hidden md:inline">Login</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showPinModal && <PinModal title="Admin Authentication" pinInput={pinInput} setPinInput={setPinInput} onSubmit={handlePinSubmit} onCancel={() => setShowPinModal(false)} />}
      {showScorerModal && <PinModal title="Scorer Authentication" description="Enter match access code (Default: 0000)." pinInput={pinInput} setPinInput={setPinInput} onSubmit={handleScorerSubmit} onCancel={() => setShowScorerModal(false)} />}
      {showUmpireModal && (
        <UmpireModal 
          umpireInput={umpireInput} 
          setUmpireInput={setUmpireInput} 
          onSubmit={handleUmpireSubmit} 
          onCancel={() => { setShowUmpireModal(false); setView('scorer'); }} 
          eligibleTeams={eligibleUmpireTeams} 
        />
      )}
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative">
        {(loading || isRefreshing) && (
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-700">Syncing...</span>
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
        {view === 'teams' && <TeamManager teams={teams} matches={matches} tournamentId={selectedTournamentId!} onAdd={handleAddTeam} onBulkAdd={handleBulkAddTeams} onUpdate={handleUpdateTeam} onRemove={async (id) => { if(!isAdmin) return setShowPinModal(true); await api.deleteTeam(id); fetchData(); }} onSelectTeam={handleSelectTeamForDashboard} isAdmin={isAdmin} onAdminLogin={() => setShowPinModal(true)} />}
        {view === 'matches' && (
          <MatchManager 
            teams={teams} 
            matches={matches} 
            tournamentId={selectedTournamentId!} 
            onCreate={async (m) => { if(!isAdmin) return setShowPinModal(true); await api.saveMatch(m); fetchData(); setView('matches'); }} 
            onBulkCreate={handleBulkCreateMatches}
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

      <footer className="bg-white/20 backdrop-blur-md border-t border-white/20 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-700 text-sm font-bold">
          <div>SmashMaster Pro • {currentTournament?.name || 'Tournament'}</div>
          <div className="flex items-center gap-4">
            <button onClick={() => fetchData(true)} disabled={isRefreshing} className="flex items-center gap-2 text-indigo-700 hover:text-indigo-900 transition-colors">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync
            </button>
            <div className="flex items-center gap-2 text-xs bg-white/40 px-3 py-1 rounded-full border border-white/40 shadow-sm">
              <Save className="w-3 h-3 text-emerald-600" /> {lastSaved}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
