
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
  
  if (obj.id) snake.id = obj.id;
  if (obj.name) snake.name = obj.name;
  if (obj.format) snake.format = obj.format;
  if (obj.status) snake.status = obj.status;
  if (obj.members) snake.members = obj.members;
  if (obj.matchPasscode) snake.match_passcode = obj.matchPasscode;
  
  if (obj.tournamentId) snake.tournament_id = obj.tournamentId;
  if (obj.team1Id) snake.team1_id = obj.team1Id;
  if (obj.team2Id) snake.team2_id = obj.team2Id;
  if (obj.winnerId !== undefined) snake.winner_id = obj.winnerId || null;

  const safeInt = (val: any, fallback: number = 0) => {
    const num = parseInt(val, 10);
    return isNaN(num) ? fallback : num;
  };

  if (Object.prototype.hasOwnProperty.call(obj, 'pointsTarget')) {
    snake.points_target = safeInt(obj.pointsTarget, 21);
  }
  
  if (Object.prototype.hasOwnProperty.call(obj, 'currentGame')) {
    snake.current_game = safeInt(obj.currentGame, 0);
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'order')) {
    snake.order_index = safeInt(obj.order, 1);
  }
  
  if (obj.scores) {
    snake.scores = Array.isArray(obj.scores) ? obj.scores : [];
  }

  if (obj.umpireNames) {
    snake.umpire_names = Array.isArray(obj.umpireNames) ? obj.umpireNames : [];
  }
  
  if (obj.createdAt) {
    snake.created_at = new Date(obj.createdAt).toISOString();
  }

  if (obj.scheduledAt) {
    snake.scheduled_at = new Date(obj.scheduledAt).toISOString();
  } else {
    snake.scheduled_at = null;
  }

  return snake;
};

/**
 * Maps backend snake_case response back to frontend camelCase Types.
 */
const fromSnakeCase = (data: any[]): any[] => {
  return data.map(item => {
    const isTournament = Object.prototype.hasOwnProperty.call(item, 'format') && !Object.prototype.hasOwnProperty.call(item, 'team1_id');
    const isTeam = Object.prototype.hasOwnProperty.call(item, 'members');
    const isMatch = Object.prototype.hasOwnProperty.call(item, 'team1_id');

    const base: any = {
      id: item.id,
      name: item.name,
      status: item.status,
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
    };

    if (isTournament) {
      return {
        ...base,
        format: item.format,
        matchPasscode: item.match_passcode || '0000'
      } as Tournament;
    }

    if (isTeam) {
      return {
        ...base,
        tournamentId: item.tournament_id,
        members: item.members || [],
      } as Team;
    }

    if (isMatch) {
      let scores = item.scores || [];
      if (typeof scores === 'string') {
        try { scores = JSON.parse(scores); } catch (e) { scores = []; }
      }
      return {
        ...base,
        tournamentId: item.tournament_id,
        team1Id: item.team1_id,
        team2Id: item.team2_id,
        winnerId: item.winner_id,
        format: item.format,
        pointsTarget: item.points_target ?? 21,
        currentGame: item.current_game ?? 0,
        order: item.order_index ?? 1,
        umpireNames: item.umpire_names || [],
        scores: Array.isArray(scores) ? scores : [],
        scheduledAt: item.scheduled_at ? new Date(item.scheduled_at).getTime() : undefined,
      } as Match;
    }

    return item;
  });
};

export const api = {
  async getTournaments(): Promise<Tournament[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return fromSnakeCase(data || []);
      }
    } catch (err) {
      console.warn("Local storage fallback for tournaments");
    }
    const local = localStorage.getItem('smashmaster_tournaments');
    return local ? JSON.parse(local).sort((a: any, b: any) => b.createdAt - a.createdAt) : [];
  },

  async saveTournament(tournament: Tournament): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(tournament);
      const { error } = await supabase.from('tournaments').insert([payload]);
      if (error) throw error;
      return;
    }
    const list = JSON.parse(localStorage.getItem('smashmaster_tournaments') || '[]');
    localStorage.setItem('smashmaster_tournaments', JSON.stringify([tournament, ...list]));
  },

  async updateTournament(tournament: Tournament): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(tournament);
      const { error } = await supabase.from('tournaments').update(payload).eq('id', tournament.id);
      if (error) throw error;
      return;
    }
    const local = localStorage.getItem('smashmaster_tournaments');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_tournaments', JSON.stringify(all.map((t: any) => t.id === tournament.id ? tournament : t)));
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
      const { data, error } = await supabase.from('teams').select('*').eq('tournament_id', tournamentId);
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
      if (error) throw error;
      return;
    }
    const local = localStorage.getItem('smashmaster_teams');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_teams', JSON.stringify([...all, team]));
  },

  async updateTeam(team: Team): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(team);
      const { error } = await supabase.from('teams').update(payload).eq('id', team.id);
      if (error) throw error;
      return;
    }
    const local = localStorage.getItem('smashmaster_teams');
    const all = local ? JSON.parse(local) : [];
    localStorage.setItem('smashmaster_teams', JSON.stringify(all.map((t: any) => t.id === team.id ? team : t)));
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
      const { data, error } = await supabase.from('matches').select('*').eq('tournament_id', tournamentId).order('order_index', { ascending: true });
      if (error) return [];
      return fromSnakeCase(data || []);
    }
    const local = localStorage.getItem('smashmaster_matches');
    const all = local ? JSON.parse(local) : [];
    return all.filter((m: Match) => m.tournamentId === tournamentId).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  },

  async saveMatch(match: Match): Promise<void> {
    if (supabase) {
      const payload = toSnakeCasePayload(match);
      const { error } = await supabase.from('matches').insert([payload]);
      if (error) throw error;
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
      if (error) throw error;
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
    const channel = supabase.channel('app-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => onUpdate())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }
};
