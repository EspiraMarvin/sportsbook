<script lang="ts">
  import { browser } from '$app/environment';
  import {
    Flame,
    ListChecks,
    MessageCircle,
    UserPlus,
    UserRound,
  } from '@lucide/svelte';
  import MyBets from '$lib/components/MyBets.svelte';
  import OrderedMarkets from '$lib/components/OrderedMarkets.svelte';
  import PlaceBet from '$lib/components/PlaceBet.svelte';
  import type {
    BetslipItem,
    CompetitionGroup,
    Game,
    GameMarket,
    GameOdd,
    MiddleTab,
    NavItem,
    PlacedBet,
    RightPanelView,
  } from '$lib/types';
  import { onMount } from 'svelte';
  import rawGames from '../data/games.json';
  // import { goto } from '$app/navigation';

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

  const leftPanelIframes = [
    {
      name: 'Aviator',
      class: 'border-[#2f3341] bg-[#101721] text-red-500',
    },
    {
      name: 'JetX',
      class: 'border-[#2d3949] bg-[#141f2c] text-blue-300',
    },
    {
      name: 'Navigator',
      class: 'border-[#2d3949] bg-[#1d2430] text-white',
    },
  ];

  let aviatorIframeUrl =
    'https://stage.100hp.app/airjet_grm/test/?b=5f132e40ee5c0215e2b1ef1e66d088a4917cbe9f6fe576a912f65a38901e16fc1fc6125be1450e859fe3d50d2e44ee20950978129070174c32d0f25c43d45f7b952aee34c76d2347f16fbb42aa020981939e19da52f106091356a2f21064f40f2aff94c8f370c43d8dda1f926eb34fec1a0bd4e0effa440ddee8833a67416d73e1d8296d49e754106e66ccc3844b0297a8e5b61233fa5ee075896f4fafb40c9ff4151dfcdbd9e624e61e8f3e12.d56b150a69f4eff6ab7d7a4c374bd7ff.4096f4ba-22e6-486d-b5e9-80639fec596f&language=en&pik=019aea9c-ab29-7a4b-aa48-844140f9db9d';

  let selections = $state<Record<number, number | undefined>>({});
  let stake = $state<number>(0);
  let searchQuery = $state<string>('');
  let totalOddsValue = $state<number>(0);
  let possibleWinningsValue = $state<number>(0);
  let activeMiddleTab = $state<MiddleTab>('Highlights');
  let activeIframeTab = $state<'' | 'Aviator' | 'JetX' | 'Navigator'>('');
  let rightPanelView = $state<RightPanelView>('betslip');
  let placedBets = $state<PlacedBet[]>([]);
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

  function addStakePreset(amount: number) {
    stake = Math.max(0, stake + amount);
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

  function setIframeTab(tab: any) {
    activeIframeTab = tab;
  }

  function openMyBets() {
    if (rightPanelView === 'mybets') {
      rightPanelView = 'betslip';
      return;
    }
    rightPanelView = 'mybets';
  }

  function showBetslip() {
    rightPanelView = 'betslip';
  }

  function showToast(message: string) {
    toastMessage = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMessage = null;
      toastTimer = null;
    }, 2500);
  }

  function searchMatches(query: string) {
    searchQuery = query;
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      console.log('Search results:', []);
      return;
    }

    const results = games.filter((game) => {
      const home = game.home_team.toLowerCase();
      const away = game.away_team.toLowerCase();
      return home.includes(normalizedQuery) || away.includes(normalizedQuery);
    });

    console.log(
      'Search results:',
      results.map((game) => ({
        matchId: game.parent_match_id,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        competition: game.competition_name,
      })),
    );
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
    showToast('Bet placed successfully.');
  }

  const stakePresets = [100, 200, 500, 1000, 5000] as const;

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

  /*function navigateToAviator() {
    goto('/aviator', {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
    });
  }*/
</script>

<main class="min-h-dvh bg-[#eef0f4] text-[#1b2034]">
  <h1 class="sr-only">Sportsbook — soccer odds, highlights, and bet slip</h1>
  <div class="min-h-dvh w-full bg-white shadow-sm">
    <header class="border-b border-[#d8dde5] px-4 py-3">
      <div class="flex flex-wrap items-center gap-2 lg:ml-60">
        {#each topNav as item}
          <button
            class={`rounded px-3 py-1.5 text-xs font-semibold transition ${
              (item.active && activeIframeTab === '') ||
              (item.label === 'Aviator' && activeIframeTab === 'Aviator')
                ? 'bg-[#3cb64a] text-white'
                : 'border border-[#d7dbe3] bg-[#f7f8fa] text-[#4d5468] hover:bg-[#eceff3]'
            }`}
            onclick={() => {
              if (item.label === 'Aviator') {
                setIframeTab('Aviator');
              } else {
                setIframeTab('');
              }
            }}
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
            value={searchQuery}
            oninput={(event) =>
              searchMatches((event.currentTarget as HTMLInputElement).value)}
            class="w-full rounded border border-[#dce2ea] bg-[#f8f9fb] px-3 py-2 text-xs text-[#4f5971] placeholder:text-[#7a8294] outline-none transition focus:border-[#c2c9d5] focus:bg-white"
          />
        </div>

        <div class="mb-4 grid grid-cols-5 gap-2">
          {#each sidebarShortcuts as shortcut}
            <button
              onclick={() =>
                shortcut.id === 'mybets' ? openMyBets() : undefined}
              class={`rounded border p-1 text-center text-[7px] transition ${
                shortcut.id === 'mybets' && rightPanelView === 'mybets'
                  ? 'border-[#5cbf59] bg-[#eaf7ea]'
                  : 'border-[#dde2ea] bg-white hover:bg-[#f7f9fc]'
              }`}
            >
              <div
                class="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-[#edf1f7] text-[#445072]"
              >
                {#if shortcut.id === 'mybets'}
                  <ListChecks size={13} />
                {:else if shortcut.id === 'profile'}
                  <UserRound size={13} />
                {:else if shortcut.id === 'chat'}
                  <MessageCircle size={13} />
                {:else if shortcut.id === 'affiliate'}
                  <UserPlus size={13} />
                {:else if shortcut.id === 'promos'}
                  <Flame size={13} />
                {/if}
              </div>
              {shortcut.label}
            </button>
          {/each}
        </div>

        {#if rightPanelView === 'mybets'}
          <MyBets {placedBets} />
        {/if}

        <h3 class="mb-2 text-sm font-semibold text-[#384057]">Top Games</h3>
        <div class="space-y-2">
          {#each leftPanelIframes as iFrameTab}
            <button
              class={`rounded border w-full px-3 py-2 text-xl font-bold italic ${iFrameTab.class}`}
              onclick={() => setIframeTab(iFrameTab.name)}
            >
              {iFrameTab.name}
            </button>
          {/each}
        </div>
        <h3 class="mt-4 text-sm font-semibold text-[#384057]">Top Leagues</h3>
      </aside>

      <section
        class={`border-b border-[#e4e8ee] lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r ${activeIframeTab === 'Aviator' ? '' : 'p-3'}`}
      >
        {#if activeIframeTab === 'Aviator'}
          <iframe
            title={activeIframeTab}
            src={aviatorIframeUrl}
            class="w-full h-full border-0"
            allowfullscreen
          ></iframe>
        {:else}
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
            {#each ['Highlights', 'Live', 'Upcoming'] as MiddleTab[] as tab}
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
                  <div class="ml-3 shrink-0 font-semibold text-[#7c8597]">
                    &gt;
                  </div>
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
                      <OrderedMarkets
                        {orderedMarkets}
                        selectedOddId={selected}
                        onSelectOdd={(oddId) =>
                          toggleSelection(game.parent_match_id, oddId)}
                      />
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
        {/if}
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

        <PlaceBet
          {totalOddsValue}
          {possibleWinningsValue}
          {stake}
          {stakePresets}
          isPlaceBetDisabled={betslipItems().length === 0 || stake <= 0}
          onSetStake={(value) =>
            (stake = Number.isNaN(value) ? 0 : Math.max(0, value))}
          onAddStakePreset={addStakePreset}
          onClearSlip={clearSlip}
          onPlaceBet={placeBet}
        />
      </aside>
    </div>
  </div>
</main>

{#if toastMessage}
  <div
    class="fixed right-4 top-4 z-50 rounded bg-[#1e9f4f] px-4 py-2 text-sm font-semibold text-white shadow-lg"
  >
    {toastMessage}
  </div>
{/if}
