<script lang="ts">
  import { browser } from '$app/environment';
  import { ArrowLeft } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import rawGames from '../data/games.json';

  type NavItem = { label: string; active?: boolean };
  type MiddleTab = 'Highlights' | 'Live' | 'Upcoming';
  type RightPanelView = 'betslip' | 'mybets';

  type GameOdd = {
    event_odd_id: number;
    parent_match_id: number;
    sub_type_id: number;
    outcome_id: string;
    outcome_name: string;
    outcome_alias: string;
    market_name: string;
    odd_value: number;
  };

  type GameMarket = {
    sub_type_id: number;
    name: string;
    market_priority?: number;
    odds: GameOdd[];
  };

  type Game = {
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

  type BetslipItem = {
    matchId: number;
    matchTitle: string;
    leagueTitle: string;
    marketTitle: string;
    selectionLabel: string;
    oddValue: number;
  };

  type PlacedBet = {
    id: string;
    placedAt: string;
    stake: number;
    totalOdds: number;
    possibleWinnings: number;
    items: BetslipItem[];
  };

  const games = rawGames as Game[];
  const PLACED_BETS_KEY = 'sportsbook_placed_bets_v1';

  const topNav: NavItem[] = [
    { label: 'Home', active: true },
    { label: 'Live' },
    { label: 'Aviator' },
    { label: 'Crash' },
    { label: 'League' },
  ];

  const sidebarShortcuts = [
    { id: 'mybets', label: 'My Bets' },
    { id: 'profile', label: 'Profile' },
    { id: 'chat', label: 'Chat Us' },
    { id: 'affiliate', label: 'Join Affiliate' },
    { id: 'promos', label: 'Promos' },
  ] as const;

  let selections = $state<Record<number, number | undefined>>({});
  let stake = $state<number>(0);
  let totalOddsValue = $state<number>(0);
  let possibleWinningsValue = $state<number>(0);
  let activeMiddleTab = $state<MiddleTab>('Highlights');
  let rightPanelView = $state<RightPanelView>('betslip');
  let placedBets = $state<PlacedBet[]>([]);
  let selectedPlacedBetId = $state<string | null>(null);
  let toastMessage = $state<string | null>(null);

  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  function getAllOdds(game: Game): GameOdd[] {
    return game.markets.flatMap((market) => market.odds);
  }

  function getOrderedMarkets(game: Game): GameMarket[] {
    return game.markets
      .slice()
      .sort((a, b) => (a.market_priority ?? -1) - (b.market_priority ?? -1));
  }

  function formatKickoff(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function toggleSelection(matchId: number, oddId: number) {
    const current = selections[matchId];
    if (current === oddId) {
      const { [matchId]: _removed, ...rest } = selections;
      selections = rest;
      return;
    }
    selections = { ...selections, [matchId]: oddId };
  }

  function removeSelection(matchId: number) {
    const { [matchId]: _removed, ...rest } = selections;
    selections = rest;
  }

  function clearSlip() {
    selections = {};
    stake = 0;
  }

  function betslipItems(): BetslipItem[] {
    return Object.entries(selections)
      .map(([matchIdStr, selectedOddId]) => {
        const matchId = Number(matchIdStr);
        const game = games.find((g) => g.parent_match_id === matchId);
        if (!game || !selectedOddId) return null;

        const odd = getAllOdds(game).find(
          (o) => o.event_odd_id === selectedOddId,
        );
        if (!odd) return null;

        const selectionLabel =
          odd.outcome_name.toUpperCase() === '1'
            ? game.home_team
            : odd.outcome_name.toUpperCase() === '2'
              ? game.away_team
              : odd.outcome_name.toUpperCase() === 'X'
                ? 'draw'
                : odd.outcome_alias;

        return {
          matchId,
          matchTitle: `${game.home_team} - ${game.away_team}`,
          leagueTitle: game.competition_name,
          marketTitle: odd.market_name,
          selectionLabel,
          oddValue: odd.odd_value,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }

  function setMiddleTab(tab: MiddleTab) {
    activeMiddleTab = tab;
  }

  function openMyBets() {
    if (rightPanelView === 'mybets') {
      rightPanelView = 'betslip';
      selectedPlacedBetId = null;
      return;
    }
    rightPanelView = 'mybets';
    selectedPlacedBetId = null;
  }

  function showBetslip() {
    rightPanelView = 'betslip';
  }

  function openPlacedBetDetails(betId: string) {
    selectedPlacedBetId = betId;
    rightPanelView = 'mybets';
  }

  function backToMyBetsList() {
    selectedPlacedBetId = null;
  }

  function selectedPlacedBet(): PlacedBet | null {
    if (!selectedPlacedBetId) return null;
    return placedBets.find((b) => b.id === selectedPlacedBetId) ?? null;
  }

  function showToast(message: string) {
    toastMessage = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage = null;
      toastTimer = null;
    }, 2500);
  }

  function placeBet() {
    const items = betslipItems();
    if (items.length === 0 || stake <= 0) return;

    const bet: PlacedBet = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      placedAt: new Date().toISOString(),
      stake,
      totalOdds: totalOddsValue,
      possibleWinnings: possibleWinningsValue,
      items,
    };

    placedBets = [bet, ...placedBets];
    selections = {};
    stake = 0;
    rightPanelView = 'mybets';
    selectedPlacedBetId = null;
    showToast('Bet placed successfully.');
  }

  const stakePresets = [100, 200, 500, 1000, 5000] as const;

  type CompetitionGroup = { competitionName: string; games: Game[] };

  function groupedByCompetition(): CompetitionGroup[] {
    const byComp = new Map<string, Game[]>();
    for (const game of games) {
      const key = game.competition_name || 'Other';
      const list = byComp.get(key);
      if (list) list.push(game);
      else byComp.set(key, [game]);
    }

    return Array.from(byComp.entries())
      .map(([competitionName, items]) => ({
        competitionName,
        games: items
          .slice()
          .sort((a, b) => a.start_time.localeCompare(b.start_time)),
      }))
      .sort((a, b) => a.competitionName.localeCompare(b.competitionName));
  }

  function totalOdds(): number {
    const items = betslipItems();
    if (items.length === 0) return 0;
    return items.reduce((acc, item) => acc * item.oddValue, 1);
  }

  function possibleWinnings(): number {
    const t = totalOdds();
    if (!stake || !t) return 0;
    return stake * t;
  }

  $effect(() => {
    totalOddsValue = totalOdds();
    possibleWinningsValue = possibleWinnings();
  });

  onMount(() => {
    if (!browser) return;
    const stored = localStorage.getItem(PLACED_BETS_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as PlacedBet[];
      if (Array.isArray(parsed)) placedBets = parsed;
    } catch {
      placedBets = [];
    }
  });

  $effect(() => {
    if (!browser) return;
    localStorage.setItem(PLACED_BETS_KEY, JSON.stringify(placedBets));
  });
</script>

<main class="min-h-dvh bg-[#eef0f4] text-[#1b2034]">
  <div class="min-h-dvh w-full bg-white shadow-sm">
    <header class="border-b border-[#d8dde5] px-4 py-3">
      <div class="flex flex-wrap items-center gap-2 lg:ml-60">
        {#each topNav as item}
          <button
            class={`rounded px-3 py-1.5 text-xs font-semibold transition ${
              item.active
                ? 'bg-[#3cb64a] text-white'
                : 'border border-[#d7dbe3] bg-[#f7f8fa] text-[#4d5468] hover:bg-[#eceff3]'
            }`}
          >
            {item.label}
          </button>
        {/each}
      </div>
    </header>

    <div
      class="grid h-[calc(100dvh-56px)] grid-cols-1 lg:grid-cols-[260px_1fr_320px]"
    >
      <aside class="border-b border-[#e4e8ee] p-3 lg:border-b-0 lg:border-r">
        <div class="mb-4">
          <label class="sr-only" for="games-search">Search</label>
          <input
            id="games-search"
            type="search"
            placeholder="Search"
            class="w-full rounded border border-[#dce2ea] bg-[#f8f9fb] px-3 py-2 text-xs text-[#4f5971] placeholder:text-[#7a8294] outline-none transition focus:border-[#c2c9d5] focus:bg-white"
          />
        </div>

        <div class="mb-4 grid grid-cols-5 gap-2">
          {#each sidebarShortcuts as shortcut}
            <button
              onclick={() => (shortcut.id === 'mybets' ? openMyBets() : undefined)}
              class={`rounded border p-1 text-center text-[7px] transition ${
                shortcut.id === 'mybets' && rightPanelView === 'mybets'
                  ? 'border-[#5cbf59] bg-[#eaf7ea]'
                  : 'border-[#dde2ea] bg-white hover:bg-[#f7f9fc]'
              }`}
            >
              <div class="mx-auto mb-1 h-6 w-6 rounded-full bg-[#edf1f7]"></div>
              {shortcut.label}
            </button>
          {/each}
        </div>

        {#if rightPanelView === 'mybets'}
          <div class="mb-4 rounded border border-[#dce2ea] bg-white">
            {#if selectedPlacedBet()}
              {@const activeBet = selectedPlacedBet()}
              {#if activeBet}
                <div class="flex items-center justify-between border-b border-[#eef1f5] px-3 py-2">
                  <h3 class="text-sm font-semibold text-[#384057]">My Bets</h3>
                  <button
                    onclick={backToMyBetsList}
                    aria-label="Back to bets list"
                    class="rounded p-1 text-[#6b7386] hover:bg-[#f2f4f8] hover:text-[#2a3044]"
                  >
                    <ArrowLeft size={14} />
                  </button>
                </div>

                <div class="max-h-56 overflow-y-auto p-2">
                  <div class="rounded border border-[#e7ebf1] bg-[#fbfcfe] p-2">
                    <div class="flex items-start justify-between gap-2">
                      <div class="text-[11px] font-semibold text-[#2a3044]">
                        Bet #{activeBet.id.slice(-6)}
                      </div>
                      <div class="text-[10px] text-[#8a92a2]">
                        {new Date(activeBet.placedAt).toLocaleString()}
                      </div>
                    </div>
                    <div class="mt-2 space-y-1 text-[10px] text-[#4f5971]">
                      {#each activeBet.items as item}
                        <div class="flex items-start justify-between gap-2">
                          <span class="truncate">{item.matchTitle} - {item.selectionLabel}</span>
                          <span class="font-semibold">{item.oddValue.toFixed(2)}</span>
                        </div>
                      {/each}
                    </div>
                    <div class="mt-2 border-t border-[#e6eaf0] pt-2 text-[10px]">
                      <div class="flex justify-between">
                        <span class="text-[#8a92a2]">Stake</span>
                        <span class="font-semibold">Ksh. {activeBet.stake.toLocaleString()}</span>
                      </div>
                      <div class="mt-1 flex justify-between">
                        <span class="text-[#8a92a2]">Possible winnings</span>
                        <span class="font-semibold">Ksh. {activeBet.possibleWinnings.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              {/if}
            {:else}
              <div class="border-b border-[#eef1f5] px-3 py-2">
                <h3 class="text-sm font-semibold text-[#384057]">My Bets</h3>
              </div>

              <div class="max-h-56 space-y-2 overflow-y-auto p-2">
                {#if placedBets.length === 0}
                  <div class="rounded bg-[#f7f9fc] p-3 text-center text-xs text-[#6b7386]">
                    No placed bets yet.
                  </div>
                {:else}
                  {#each placedBets as bet (bet.id)}
                    <button
                      onclick={() => openPlacedBetDetails(bet.id)}
                      class="w-full rounded border border-[#e7ebf1] bg-[#fbfcfe] p-2 text-left transition hover:bg-[#f2f6fb]"
                    >
                      <div class="flex items-start justify-between gap-2">
                        <div class="text-[11px] font-semibold text-[#2a3044]">
                          Bet #{bet.id.slice(-6)}
                        </div>
                        <div class="text-[10px] text-[#8a92a2]">
                          {new Date(bet.placedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div class="mt-1 text-[10px] text-[#4f5971]">
                        {bet.items.length} selection{bet.items.length > 1 ? 's' : ''} •
                        Ksh. {bet.stake.toLocaleString()}
                      </div>
                    </button>
                  {/each}
                {/if}
              </div>
            {/if}
          </div>
        {/if}

        <h3 class="mb-2 text-sm font-semibold text-[#384057]">Top Games</h3>
        <div class="space-y-2">
          <div
            class="rounded border border-[#2f3341] bg-[#101721] px-3 py-2 text-xl font-bold italic text-red-500"
          >
            Aviator
          </div>
          <div
            class="rounded border border-[#2d3949] bg-[#141f2c] px-3 py-2 text-xl font-bold italic text-blue-300"
          >
            JetX
          </div>
          <div
            class="rounded border border-[#2d3949] bg-[#1d2430] px-3 py-2 text-xl font-bold italic text-white"
          >
            Navigator
          </div>
        </div>
        <h3 class="mt-4 text-sm font-semibold text-[#384057]">Top Leagues</h3>
      </aside>

      <section
        class="border-b border-[#e4e8ee] p-3 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r"
      >
        <div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {#each [1, 2, 3] as promo}
            <div class="rounded border border-[#d8dee6] bg-[#f7f9fb] p-2">
              <div
                class="mb-1 text-[11px] font-semibold leading-tight text-[#2d3348]"
              >
                Sports welcome bonus.
              </div>
              <div class="text-sm font-bold leading-tight text-[#11162a]">
                100% up to £50 on first deposit.
              </div>
            </div>
          {/each}
        </div>

        <div class="mb-2 flex items-center gap-1 text-xs font-semibold">
          {#each (['Highlights', 'Live', 'Upcoming'] as MiddleTab[]) as tab}
            <button
              class={`rounded px-3 py-1 ${
                activeMiddleTab === tab
                  ? 'bg-[#5cbf59] text-white'
                  : 'bg-[#f2f4f8] text-[#596175]'
              }`}
              onclick={() => setMiddleTab(tab)}
            >
              {tab}
            </button>
          {/each}
        </div>

        <div class="rounded border border-[#d8dee6] bg-white">
          <div
            class="flex items-center justify-between bg-[#162a61] px-3 py-2 text-sm font-semibold text-white"
          >
            <span>Soccer</span>
          </div>

          {#if activeMiddleTab === 'Highlights'}
            {#each groupedByCompetition() as group (group.competitionName)}
              <div
                class="flex items-center justify-between border-t border-[#edf1f5] px-3 py-2 text-[11px] text-[#8a92a2]"
              >
                <div class="truncate">
                  {group.games[0]?.country_name ?? ''}{group.games[0]
                    ?.country_name
                    ? ' / '
                    : ''}
                  {group.competitionName}
                </div>
                <div class="ml-3 shrink-0 font-semibold text-[#7c8597]">&gt;</div>
              </div>

              {#each group.games as game (game.parent_match_id)}
                {@const orderedMarkets = getOrderedMarkets(game)}
                {@const selected = selections[game.parent_match_id]}
                <div class="border-t border-[#edf1f5] px-3 py-3">
                  <div
                    class="grid gap-3 md:grid-cols-[minmax(300px,2fr)_minmax(0,6fr)_48px] md:items-center"
                  >
                    <div class="min-w-0">
                      <div class="flex flex-col gap-y-2">
                        <div class="text-sm font-semibold leading-none">
                          {game.home_team}
                        </div>
                        <div
                          class="text-sm font-semibold leading-none text-[#3d4560]"
                        >
                          {game.away_team}
                        </div>
                      </div>

                      <div class="mt-1.5 text-[9px] text-[#9097a6]">
                        {formatKickoff(game.start_time)}
                      </div>
                    </div>
                    <div class="flex-1 overflow-x-auto">
                      <div class="flex min-w-full items-center gap-7 pr-1">
                        {#each orderedMarkets as market (market.sub_type_id)}
                          <div
                            class="flex items-center gap-1.5"
                            style={`flex: ${market.odds.length} 1 0%; min-width: calc(${market.odds.length} * 4rem + ${market.odds.length - 1} * 0.375rem);`}
                          >
                            {#each market.odds as odd (odd.event_odd_id)}
                              <button
                                class={`relative h-12 w-16 rounded-md border border-[#e4e8ee] bg-white px-1.5 text-center shadow-[0_1px_2px_rgba(16,24,40,0.08)] transition ${
                                  selected === odd.event_odd_id
                                    ? 'border-[#f7c04a] bg-[#eaf7ea] ring-1 ring-[#f7c04a]'
                                    : 'hover:bg-[#f7f9fc]'
                                }`}
                                onclick={() =>
                                  toggleSelection(
                                    game.parent_match_id,
                                    odd.event_odd_id,
                                  )}
                              >
                                <div
                                  class="text-[9px] font-semibold leading-none text-[#4f5971]"
                                >
                                  {odd.outcome_name}
                                </div>
                                <div
                                  class="mt-1 text-[8px] leading-none text-[#a1a8b5]"
                                >
                                  {odd.odd_value.toFixed(2)}
                                </div>
                                {#if selected === odd.event_odd_id}
                                  <span
                                    class="hidden lg:block absolute right-0.5 top-1 h-1.5 w-1.5 rounded-full bg-[#f7c04a]"
                                  ></span>
                                {/if}
                              </button>
                            {/each}
                          </div>
                        {/each}
                      </div>
                    </div>
                    <div
                      class="mr-2 text-[8px] font-semibold leading-tight text-[#4f5971]"
                    >
                      {game.total_markets} <br /> More
                    </div>
                  </div>
                </div>
              {/each}
            {/each}
          {:else}
            <div class="border-t border-[#edf1f5] px-3 py-3">
              <h3 class="text-sm font-semibold text-[#2d3348]">
                {activeMiddleTab} matches
              </h3>
              <p class="mt-2 text-xs text-[#8a92a2]">
                No matches in {activeMiddleTab.toLowerCase()} right now.
              </p>
            </div>
          {/if}
        </div>
      </section>

      <aside class="flex h-[calc(100dvh-56px)] flex-col bg-[#f7f8fb]">
        <div class="grid grid-cols-2 border-b border-[#dce1e8]">
          <button
            onclick={showBetslip}
            class="border-r border-[#dce1e8] px-3 py-2 text-sm font-semibold text-[#4e5568]"
          >
            Betslip ({betslipItems().length})
          </button>
          <button
            class="bg-[#162a61] px-3 py-2 text-sm font-semibold text-white"
            >Jenga bets (0)</button
          >
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-3 pt-3 pb-80">
          {#if betslipItems().length === 0}
            <div class="mt-4 p-3 text-center text-[#6b7386]">
              <p class="text-md">Your betslip is empty.</p>
              <p class="text-xs mt-1">
                You have not selected any games so far.
              </p>
              <p class="text-xs mt-1">
                Make any selections and they will appear here
              </p>
            </div>
          {:else}
            <div class="space-y-2">
              {#each betslipItems() as item (item.matchId)}
                <div class="rounded border border-[#dce2ea] bg-white">
                  <div
                    class="flex items-start justify-between gap-3 border-b border-[#eef1f5] px-3 py-2"
                  >
                    <div class="min-w-0">
                      <div
                        class="truncate text-sm font-semibold text-[#2a3044]"
                      >
                        {item.matchTitle}
                      </div>
                      <div class="truncate text-[11px] text-[#8a92a2]">
                        {item.leagueTitle}
                      </div>
                      <div class="truncate text-[11px] text-[#8a92a2]">
                        {item.marketTitle}
                      </div>
                    </div>
                    <button
                      class="rounded p-1 text-[#8a92a2] hover:bg-[#f2f4f8] hover:text-[#2a3044]"
                      aria-label="Remove selection"
                      onclick={() => removeSelection(item.matchId)}
                    >
                      ✕
                    </button>
                  </div>

                  <div
                    class="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <div class="font-semibold text-[#3b4258]">
                      {item.selectionLabel}
                    </div>
                    <div class="font-semibold text-[#11162a]">
                      {item.oddValue.toFixed(2)}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- place bet section (always visible) -->
        <div
          class="sticky bottom-0 z-10 border-t border-[#dce1e8] bg-[#f7f8fb] p-3"
        >
          <div
            class="rounded-lg border border-[#eef0f4] bg-white p-3 text-[#1b2034] shadow-sm"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="text-sm">
                <div class="text-[#1b2034]/90">Total odds</div>
                <div class="mt-1 text-[#1b2034]/90">Possible winnings</div>
              </div>
              <div class="text-right text-sm font-semibold">
                <div>
                  {totalOddsValue ? totalOddsValue.toFixed(2) : '0.00'}
                </div>
                <div class="mt-1 text-lg font-bold">
                  {possibleWinningsValue
                    ? `Ksh. ${possibleWinningsValue.toLocaleString()}`
                    : 'Ksh. 0'}
                </div>
              </div>
            </div>

            <div
              class="mt-3 grid grid-cols-5 overflow-hidden rounded border border-white/80"
            >
              {#each stakePresets as preset}
                <button
                  class={`px-1 py-3 text-center text-xs ${
                    stake === preset
                      ? 'bg-[#1b2a3f] text-[#f7c04a] ring-2 ring-inset ring-[#2f9bff]'
                      : 'bg-[#1b2a3f] text-white hover:bg-[#23344d]'
                  } border-r border-white/80 last:border-r-0`}
                  onclick={() => (stake = preset)}
                >
                  Kes {preset}
                </button>
              {/each}
            </div>

            <div
              class="mt-3 rounded-lg border border-[#f3c15a] bg-[#1b2a3f]/80 px-4 py-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="text-md font-normal text-white">Stake</div>
                </div>
                <input
                  class="w-28 bg-transparent text-right text-lg text-white outline-none placeholder:text-white"
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  bind:value={stake}
                />
              </div>
            </div>

            <div class="mt-3 grid w-full grid-cols-2 gap-2">
              <button
                class="rounded-lg border border-[#d9dde5] bg-[#f2f4f8] px-4 py-3 text-md text-[#2b3348]"
                onclick={clearSlip}
              >
                Clear Slip
              </button>
              <button
                disabled={betslipItems().length === 0 || stake <= 0}
                onclick={placeBet}
                class="w-full rounded-lg bg-[#f3c15a] px-4 py-3 text-md text-[#11162a]
				disabled:cursor-not-allowed disabled:bg-[#e8d7a8]"
              >
                Place Bet
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</main>

{#if toastMessage}
  <div class="fixed right-4 top-4 z-50 rounded bg-[#1e9f4f] px-4 py-2 text-sm font-semibold text-white shadow-lg">
    {toastMessage}
  </div>
{/if}
