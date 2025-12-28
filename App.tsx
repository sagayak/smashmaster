
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
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
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
      setLastSaved(new Date().toLocaleTimeString());
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

    // Filter to valid team names
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

      let t1GW = 0;
      let t2GW = 0;
      
      match.scores