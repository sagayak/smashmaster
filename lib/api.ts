
import { createClient } from '@supabase/supabase-js';
import { Team, Match, Tournament } from '../types';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

const isCloudEnabled = supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE');
const supabase = isCloudEnabled ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Maps frontend camelCase objects to backend snake_case for Supabase.
 */
const toSnakeCasePayload = (obj: any) => {
  const snake: any = {};
  for (const key in obj) {
    if (key === 'tournamentId') snake['tournament_id'] = obj[key];
    else if (key === 'team1Id') snake['team1_id'] = obj[key];
    else if (key === 'team2Id') snake['team2_id'] = obj[key];
    else if (key === 'winnerId') snake['winner_id'] = obj[key] || null;
    else if (key === 'pointsTarget') snake['points_target'] = obj[key];
    else if (key === 'currentGame') snake['current_game'] = obj[key];
    else if (key === 'createdAt') snake['created_at'] = new Date(obj[key]).toISOString();
    else if (key === 'scores') {
      // Ensure scores is always an array
      const scoresVal = Array.isArray(obj[key]) ? obj[key] : [];
      snake['scores'] = scoresVal;
    }
    else {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snake[snakeKey] = obj[key];
    }
  }
  return snake;
};

/**
 * Maps backend snake_case response back to frontend camelCase Types.
 * Uses fallback checks in case the user manually created columns with camelCase.
 */
const fromSnakeCase = (data: any[]): any[] => {
  return data.map(item => {
    let scores = item.scores || [];
    if (typeof scores === 'string') {
      try { scores = JSON.parse(scores); } catch (e) { scores = []; }
    }

    const entry: any = {
      ...item,
      id: item.id,
      tournamentId: item.tournament_id || item.tournamentId,
      team1Id: item.team1_id || item.team1Id,
      team2Id: item.team2_id || item.team2Id,
      winnerId: item.winner_id || item.winnerId,
      status: item.status,
      format: item.format,
      pointsTarget: item.points_target || item.pointsTarget,
      currentGame: item.current_game || item.currentGame,
      scores: Array.isArray(scores) ? scores : [],
      name: item.name,
      members: item.members,
    };

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
          console.error("Supabase Tournament Fetch Error:", error);
          throw error;
        }
        return fromSnakeCase(data || []);
      }
    } catch (err) {
      console.warn("Tournament fetch failed, falling back to local storage");
    }
    const local = localStorage.getItem('smashmaster_tournaments');
    return local ? JSON.parse(local).sort((a: any, b: any) => b.createdAt - a.createdAt) : [];
  },

  async saveTournament(tournament: Tournament): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(tournament);
      const { error } = await supabase.from('tournaments').insert([payload]);
      if (error) {
        console.error("Supabase Save Error:", error);
        throw error;
      }
      return;
    }
    const list = JSON.parse(localStorage.getItem('smashmaster_tournaments') || '[]');
    localStorage.setItem('smashmaster_tournaments', JSON.stringify([tournament, ...list]));
  },

  async deleteTournament(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const list = await this.getTournaments();
    localStorage.setItem('smashmaster_tournaments', JSON.stringify(list.filter(t => t.id !== id)));
  },

  async getTeams(tournamentId: string): Promise<Team[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('tournament_id', tournamentId);
      if (error) {
        console.error("Supabase Team Fetch Error:", error);
        return [];
      }
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
      if (error) {
        console.error("Supabase Save Team Error:", error);
        throw error;
      }
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
      
      if (error) {
        console.error("Supabase Match Fetch Error:", error);
        // Important: check if the table actually exists
        if (error.code === 'PGRST116' || error.message.includes('not found')) {
          console.warn("Table 'matches' might be missing columns or the table itself.");
        }
        return [];
      }
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
      if (error) {
        console.error("Supabase Save Match Error:", error);
        throw error;
      }
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
      if (error) {
        console.error("Supabase Update Match Error:", error);
        throw error;
      }
      return;
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_matches', JSON.stringify(all.map((m: Match) => m.id === match.id ? match : m)));
  },

  async deleteMatch(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_matches', JSON.stringify(all.filter((m: Match) => m.id !== id)));
  },

  subscribeToChanges(onUpdate: () => void): () => void {
    if (!supabase) return () => {};
    // Listen to everything in the public schema for the current session
    const channel = supabase.channel('app-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('Realtime change detected:', payload.table);
        onUpdate();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
