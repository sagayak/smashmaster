
import { createClient } from '@supabase/supabase-js';
import { Team, Match, Tournament } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const isCloudEnabled = supabaseUrl && supabaseKey;
const supabase = isCloudEnabled ? createClient(supabaseUrl, supabaseKey) : null;

export const api = {
  // --- Tournament Methods ---
  async getTournaments(): Promise<Tournament[]> {
    if (supabase) {
      const { data, error } = await supabase.from('tournaments').select('*').order('createdAt', { ascending: false });
      if (error) return [];
      return data || [];
    }
    const local = localStorage.getItem('smashmaster_tournaments');
    return local ? JSON.parse(local) : [];
  },

  async saveTournament(tournament: Tournament): Promise<void> {
    if (supabase) {
      await supabase.from('tournaments').insert([tournament]);
      return;
    }
    const list = await this.getTournaments();
    localStorage.setItem('smashmaster_tournaments', JSON.stringify([tournament, ...list]));
  },

  async deleteTournament(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('matches').delete().eq('tournamentId', id);
      await supabase.from('teams').delete().eq('tournamentId', id);
      await supabase.from('tournaments').delete().eq('id', id);
      return;
    }
    const list = await this.getTournaments();
    localStorage.setItem('smashmaster_tournaments', JSON.stringify(list.filter(t => t.id !== id)));
    // Also cleanup local storage data for that tournament
    const teams = JSON.parse(localStorage.getItem('smashmaster_teams') || '[]');
    const matches = JSON.parse(localStorage.getItem('smashmaster_matches') || '[]');
    localStorage.setItem('smashmaster_teams', JSON.stringify(teams.filter((t: any) => t.tournamentId !== id)));
    localStorage.setItem('smashmaster_matches', JSON.stringify(matches.filter((m: any) => m.tournamentId !== id)));
  },

  // --- Scoped Data Methods ---
  async getTeams(tournamentId: string): Promise<Team[]> {
    if (supabase) {
      const { data } = await supabase.from('teams').select('*').eq('tournamentId', tournamentId);
      return data || [];
    }
    const local = localStorage.getItem('smashmaster_teams');
    const all = local ? JSON.parse(local) : [];
    return all.filter((t: Team) => t.tournamentId === tournamentId);
  },

  async saveTeam(team: Team): Promise<void> {
    if (supabase) {
      await supabase.from('teams').insert([team]);
      return;
    }
    const local = localStorage.getItem('smashmaster_teams');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_teams', JSON.stringify([...all, team]));
  },

  async deleteTeam(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('teams').delete().eq('id', id);
      return;
    }
    const local = localStorage.getItem('smashmaster_teams');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_teams', JSON.stringify(all.filter((t: Team) => t.id !== id)));
  },

  async getMatches(tournamentId: string): Promise<Match[]> {
    if (supabase) {
      const { data } = await supabase.from('matches').select('*').eq('tournamentId', tournamentId);
      return (data || []).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    return all.filter((m: Match) => m.tournamentId === tournamentId).sort((a: any, b: any) => b.createdAt - a.createdAt);
  },

  async saveMatch(match: Match): Promise<void> {
    if (supabase) {
      const payload = { ...match, created_at: new Date(match.createdAt).toISOString() };
      await supabase.from('matches').insert([payload]);
      return;
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_matches', JSON.stringify([...all, match]));
  },

  async updateMatch(match: Match): Promise<void> {
    if (supabase) {
      await supabase.from('matches').update(match).eq('id', match.id);
      return;
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_matches', JSON.stringify(all.map((m: Match) => m.id === match.id ? match : m)));
  },

  async deleteMatch(id: string): Promise<void> {
    if (supabase) {
      await supabase.from('matches').delete().eq('id', id);
      return;
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_matches', JSON.stringify(all.filter((m: Match) => m.id !== id)));
  },

  subscribeToChanges(onUpdate: () => void): () => void {
    if (!supabase) return () => {};
    const channel = supabase.channel('schema-db-changes').on('postgres_changes', { event: '*', schema: 'public' }, onUpdate).subscribe();
    return () => supabase.removeChannel(channel);
  }
};
