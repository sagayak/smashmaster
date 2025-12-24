
import { createClient } from '@supabase/supabase-js';
import { Team, Match, Tournament } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const isCloudEnabled = supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE');
const supabase = isCloudEnabled ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Maps frontend camelCase objects to backend snake_case for Supabase.
 * Ensures that tournamentId correctly maps to tournament_id.
 */
const toSnakeCasePayload = (obj: any) => {
  const snake: any = {};
  for (const key in obj) {
    // Manual mapping for common fields to be 100% safe
    if (key === 'tournamentId') snake['tournament_id'] = obj[key];
    else if (key === 'team1Id') snake['team1_id'] = obj[key];
    else if (key === 'team2Id') snake['team2_id'] = obj[key];
    else if (key === 'winnerId') snake['winner_id'] = obj[key];
    else if (key === 'pointsTarget') snake['points_target'] = obj[key];
    else if (key === 'currentGame') snake['current_game'] = obj[key];
    else if (key === 'createdAt') snake['created_at'] = new Date(obj[key]).toISOString();
    else {
      // Automatic conversion for others (e.g., status -> status)
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snake[snakeKey] = obj[key];
    }
  }
  return snake;
};

/**
 * Maps backend snake_case response back to frontend camelCase Types.
 */
const fromSnakeCase = (data: any[]) => {
  return data.map(item => {
    const entry: any = { ...item };
    if (item.tournament_id) entry.tournamentId = item.tournament_id;
    if (item.team1_id) entry.team1Id = item.team1_id;
    if (item.team2_id) entry.team2Id = item.team2_id;
    if (item.winner_id) entry.winnerId = item.winner_id;
    if (item.points_target) entry.pointsTarget = item.points_target;
    if (item.current_game) entry.currentGame = item.current_game;
    
    const ts = item.created_at || item.createdAt;
    entry.createdAt = ts ? new Date(ts).getTime() : Date.now();
    
    return entry;
  });
};

export const api = {
  async getTournaments(): Promise<Tournament[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Supabase error fetching tournaments:", error);
          throw error;
        }
        return fromSnakeCase(data || []);
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to LocalStorage:", err);
    }
    const local = localStorage.getItem('smashmaster_tournaments');
    return local ? JSON.parse(local).sort((a: any, b: any) => b.createdAt - a.createdAt) : [];
  },

  async saveTournament(tournament: Tournament): Promise<void> {
    try {
      if (supabase) {
        const payload = toSnakeCasePayload(tournament);
        const { error } = await supabase.from('tournaments').insert([payload]);
        if (error) {
          console.error("Supabase error saving tournament:", error);
          throw error;
        }
        return;
      }
    } catch (err) {
      console.warn("Supabase save failed, using LocalStorage:", err);
    }
    const list = await this.getTournaments();
    localStorage.setItem('smashmaster_tournaments', JSON.stringify([tournament, ...list]));
  },

  async deleteTournament(id: string): Promise<void> {
    try {
      if (supabase) {
        const { error } = await supabase.from('tournaments').delete().eq('id', id);
        if (error) throw error;
        return;
      }
    } catch (err) {}
    const list = await this.getTournaments();
    localStorage.setItem('smashmaster_tournaments', JSON.stringify(list.filter(t => t.id !== id)));
  },

  async getTeams(tournamentId: string): Promise<Team[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
      if (error) return [];
      return fromSnakeCase(data || []);
    }
    const local = localStorage.getItem('smashmaster_teams');
    const all = local ? JSON.parse(local) : [];
    return all.filter((t: Team) => t.tournamentId === tournamentId);
  },

  async saveTeam(team: Team): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(team);
      const { error } = await supabase.from('teams').insert([payload]);
      if (error) console.error("Error saving team:", error);
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
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false });
      if (error) return [];
      return fromSnakeCase(data || []);
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    return all.filter((m: Match) => m.tournamentId === tournamentId).sort((a: any, b: any) => b.createdAt - a.createdAt);
  },

  async saveMatch(match: Match): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(match);
      const { error } = await supabase.from('matches').insert([payload]);
      return;
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_matches', JSON.stringify([...all, match]));
  },

  async updateMatch(match: Match): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(match);
      const { error } = await supabase.from('matches').update(payload).eq('id', match.id);
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
