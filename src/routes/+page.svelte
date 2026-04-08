<script lang="ts">
	type NavItem = { label: string; active?: boolean };
	type Market = { label: string; odds: string };
	type MatchRow = {
		home: string;
		away: string;
		time: string;
		markets: Market[];
	};

	const topNav: NavItem[] = [
		{ label: 'Home', active: true },
		{ label: 'Live' },
		{ label: 'Aviator' },
		{ label: 'Crash' },
		{ label: 'League' }
	];

	const sidebarShortcuts = ['My Bets', 'Profile', 'Chat Us', 'Join Affiliate', 'Promos'];

	const matches: MatchRow[] = [
		{
			home: 'Turkiye',
			away: 'Romania',
			time: 'Today - 20:00',
			markets: [
				{ label: '1', odds: '1.45' },
				{ label: 'X', odds: '3.00' },
				{ label: '2', odds: '6.80' },
				{ label: '1 or X', odds: '1.10' },
				{ label: '1 or 2', odds: '1.13' },
				{ label: 'X or 2', odds: '2.34' },
				{ label: 'Yes', odds: '1.18' },
				{ label: 'No', odds: '2.34' }
			]
		},
		{
			home: 'Turkiye',
			away: 'Romania',
			time: 'Today - 20:00',
			markets: [
				{ label: '1', odds: '1.45' },
				{ label: 'X', odds: '3.00' },
				{ label: '2', odds: '6.80' },
				{ label: '1 or X', odds: '1.10' },
				{ label: '1 or 2', odds: '1.13' },
				{ label: 'X or 2', odds: '2.34' },
				{ label: 'Yes', odds: '1.18' },
				{ label: 'No', odds: '2.34' }
			]
		},
		{
			home: 'Turkiye',
			away: 'Romania',
			time: 'Today - 20:00',
			markets: [
				{ label: '1', odds: '1.45' },
				{ label: 'X', odds: '3.00' },
				{ label: '2', odds: '6.80' },
				{ label: '1 or X', odds: '1.10' },
				{ label: '1 or 2', odds: '1.13' },
				{ label: 'X or 2', odds: '2.34' },
				{ label: 'Yes', odds: '1.18' },
				{ label: 'No', odds: '2.34' }
			]
		}
	];
</script>

<main class="min-h-screen bg-[#eef0f4] p-3 text-[#1b2034]">
	<div class="mx-auto max-w-[1200px] rounded border border-[#d4d8df] bg-white shadow-sm">
		<header class="border-b border-[#d8dde5] px-4 py-3">
			<div class="flex flex-wrap items-center gap-2">
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

		<div class="grid min-h-[560px] grid-cols-12">
			<aside class="col-span-12 border-r border-[#e4e8ee] p-3 md:col-span-3 lg:col-span-2">
				<div class="mb-4 rounded border border-[#dce2ea] bg-[#f8f9fb] px-3 py-2 text-xs text-[#7a8294]">
					Search
				</div>

				<div class="mb-4 grid grid-cols-5 gap-2">
					{#each sidebarShortcuts as shortcut}
						<div class="rounded border border-[#dde2ea] bg-white p-1 text-center text-[10px] text-[#60697c]">
							<div class="mx-auto mb-1 h-5 w-5 rounded-full bg-[#edf1f7]"></div>
							{shortcut}
						</div>
					{/each}
				</div>

				<h3 class="mb-2 text-sm font-semibold text-[#384057]">Top Games</h3>
				<div class="space-y-2">
					<div class="rounded border border-[#2f3341] bg-[#101721] px-3 py-2 text-xl font-bold italic text-red-500">
						Aviator
					</div>
					<div class="rounded border border-[#2d3949] bg-[#141f2c] px-3 py-2 text-xl font-bold italic text-blue-300">
						JetX
					</div>
					<div class="rounded border border-[#2d3949] bg-[#1d2430] px-3 py-2 text-xl font-bold italic text-white">
						Navigator
					</div>
				</div>
			</aside>

			<section class="col-span-12 border-r border-[#e4e8ee] p-3 md:col-span-6 lg:col-span-7">
				<div class="mb-3 grid grid-cols-3 gap-2">
					{#each [1, 2, 3] as promo}
						<div class="rounded border border-[#d8dee6] bg-[#f7f9fb] p-2">
							<div class="mb-1 text-[11px] font-semibold leading-tight text-[#2d3348]">
								Sports welcome bonus.
							</div>
							<div class="text-sm font-bold leading-tight text-[#11162a]">
								100% up to £50 on first deposit.
							</div>
						</div>
					{/each}
				</div>

				<div class="mb-2 flex items-center gap-1 text-xs font-semibold">
					<button class="rounded bg-[#5cbf59] px-3 py-1 text-white">Highlights</button>
					<button class="rounded bg-[#f2f4f8] px-3 py-1 text-[#596175]">Live</button>
					<button class="rounded bg-[#f2f4f8] px-3 py-1 text-[#596175]">Upcoming</button>
				</div>

				<div class="rounded border border-[#d8dee6] bg-white">
					<div class="flex items-center justify-between bg-[#162a61] px-3 py-2 text-sm font-semibold text-white">
						<span>Soccer</span>
						<span>&gt;</span>
					</div>

					<div class="px-3 py-2 text-[11px] text-[#8a92a2]">International / Fifa World Cup Qualification, UEFA</div>

					{#each matches as match}
						<div class="border-t border-[#edf1f5] px-3 py-3">
							<div class="flex items-center justify-between gap-3">
								<div class="min-w-[130px]">
									<div class="text-lg font-semibold leading-none">{match.home}</div>
									<div class="text-lg font-semibold leading-none text-[#3d4560]">{match.away}</div>
									<div class="mt-1 text-[10px] text-[#9097a6]">{match.time}</div>
								</div>
								<div class="grid flex-1 grid-cols-4 gap-2 md:grid-cols-8">
									{#each match.markets as market}
										<button class="rounded border border-[#e0e6ee] bg-[#fbfcfd] py-1 text-center">
											<div class="text-[10px] font-semibold text-[#545e73]">{market.label}</div>
											<div class="text-[10px] text-[#9ea5b3]">{market.odds}</div>
										</button>
									{/each}
								</div>
								<div class="text-[10px] font-semibold text-[#4f5971]">200+ More</div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<aside class="col-span-12 bg-[#f7f8fb] md:col-span-3">
				<div class="grid grid-cols-2 border-b border-[#dce1e8]">
					<button class="border-r border-[#dce1e8] px-3 py-2 text-sm font-semibold text-[#4e5568]">
						Betslip (0)
					</button>
					<button class="bg-[#162a61] px-3 py-2 text-sm font-semibold text-white">Jenga bets (0)</button>
				</div>
			</aside>
		</div>
	</div>
</main>
