<script lang="ts">
  import type { GameMarket } from '$lib/types';

  type Props = {
    orderedMarkets: GameMarket[];
    selectedOddId?: number;
    onSelectOdd: (oddId: number) => void;
  };

  let { orderedMarkets, selectedOddId, onSelectOdd }: Props = $props();
</script>

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
              selectedOddId === odd.event_odd_id
                ? 'border-[#f7c04a] bg-[#eaf7ea] ring-1 ring-[#f7c04a]'
                : 'hover:bg-[#f7f9fc]'
            }`}
            onclick={() => onSelectOdd(odd.event_odd_id)}
          >
            <div class="text-[9px] font-semibold leading-none text-[#4f5971]">
              {odd.outcome_name}
            </div>
            <div class="mt-1 text-[8px] leading-none text-[#a1a8b5]">
              {odd.odd_value.toFixed(2)}
            </div>
            {#if selectedOddId === odd.event_odd_id}
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
