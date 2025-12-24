
import { createClient } from '@supabase/supabase-js';
import { Team, Match } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const isCloudEnabled = supabaseUrl && supabaseKey;
const supabase = isCloudEnabled ? createClient(supabaseUrl, supabaseKey) : null;

export const api = {
  async getTeams(): Promise<Team[]> {
    if (supabase) {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) throw error;
      return data || [];
    }
    const local = localStorage.getItem('smashmaster_teams');
    return local ? JSON.parse(local) : [];
  },

  async saveTeam(team: Team): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('teams').insert([team]);
      if (error) throw error;
      return;
    }
    const teams = await this.getTeams();
    localStorage.setItem('smashmaster_teams', JSON.stringify([...teams, team]));
  },

  async deleteTeam(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const teams = await this.getTeams();
    localStorage.setItem('smashmaster_teams', JSON.stringify(teams.filter(t => t.id !== id)));
  },

  async getMatches(): Promise<Match[]> {
    if (supabase) {
      const { data, error } = await supabase.from('matches').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
    const local = localStorage.getItem('smashmaster_matches');
    return local ? JSON.parse(local) : [];
  },

  async saveMatch(match: Match): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('matches').insert([match]);
      if (error) throw error;
      return;
    }
    const matches = await this.getMatches();
    localStorage.setItem('smashmaster_matches', JSON.stringify([...matches, match]));
  },

  async updateMatch(match: Match): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('matches').update(match).eq('id', match.id);
      if (error) throw error;
      return;
    }
    const matches = await this.getMatches();
    localStorage.setItem('smashmaster_matches', JSON.stringify(matches.map(m => m.id === match.id ? match : m)));
  },

  async deleteMatch(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const matches = await this.getMatches();
    localStorage.setItem('smashmaster_matches', JSON.stringify(matches.filter(m => m.id !== id)));
  },

  async clearAll(): Promise<void> {
    if (supabase) {
      // Deleting all rows requires a filter, using a non-matching ID or range
      await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      return;
    }
    localStorage.removeItem('smashmaster_teams');
    localStorage.removeItem('smashmaster_matches');
  },

  /**
   * Listens for changes in the database and calls the callback.
   * Returns an unsubscribe function.
   */
  subscribeToChanges(onUpdate: () => void): () => void {
    if (!supabase) return () => {};

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => onUpdate()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => onUpdate()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
