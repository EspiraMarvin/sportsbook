<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';
  import type { PlacedBet } from '$lib/types';

  type Props = {
    placedBets: PlacedBet[];
  };

  let { placedBets }: Props = $props();
  let selectedBetId = $state<string | null>(null);

  const activeBet = $derived(
    selectedBetId ? placedBets.find((bet) => bet.id === selectedBetId) ?? null : null,
  );

  function openDetails(betId: string) {
    selectedBetId = betId;
  }

  function backToList() {
    selectedBetId = null;
  }

  $effect(() => {
    if (!selectedBetId) return;
    if (!placedBets.some((bet) => bet.id === selectedBetId)) {
      selectedBetId = null;
    }
  });
</script>

<div class="mb-4 rounded border border-[#dce2ea] bg-white">
  {#if activeBet}
    <div class="flex items-center justify-between border-b border-[#eef1f5] px-3 py-2">
      <h3 class="text-sm font-semibold text-[#384057]">My Bets</h3>
      <button
        onclick={backToList}
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
            onclick={() => openDetails(bet.id)}
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
              {bet.items.length} selection{bet.items.length > 1 ? 's' : ''} • Ksh. {bet.stake.toLocaleString()}
            </div>
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>
