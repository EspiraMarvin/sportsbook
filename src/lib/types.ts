export type NavItem = { label: string; active?: boolean };

export type MiddleTab = 'Highlights' | 'Live' | 'Upcoming';
export type RightPanelView = 'betslip' | 'mybets';

export type GameOdd = {
  event_odd_id: number;
  parent_match_id: number;
  sub_type_id: number;
  outcome_id: string;
  outcome_name: string;
  outcome_alias: string;
  market_name: string;
  odd_value: number;
};

export type GameMarket = {
  sub_type_id: number;
  name: string;
  market_priority?: number;
  odds: GameOdd[];
};

export type Game = {
  parent_match_id: number;
  home_team: string;
  away_team: string;
  start_time: string;
  sport_name: string;
  competition_name: string;
  country_name: string;
  total_markets: number;
  markets: GameMarket[];
};

export type BetslipItem = {
  matchId: number;
  matchTitle: string;
  leagueTitle: string;
  marketTitle: string;
  selectionLabel: string;
  oddValue: number;
};

export type PlacedBet = {
  id: string;
  placedAt: string;
  stake: number;
  totalOdds: number;
  possibleWinnings: number;
  items: BetslipItem[];
};

export type CompetitionGroup = { competitionName: string; games: Game[] };
