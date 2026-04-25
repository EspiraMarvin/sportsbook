<script lang="ts">
  type Props = {
    totalOddsValue: number;
    possibleWinningsValue: number;
    stake: number;
    stakePresets: readonly number[];
    isPlaceBetDisabled: boolean;
    onSetStake: (value: number) => void;
    onAddStakePreset: (value: number) => void;
    onClearSlip: () => void;
    onPlaceBet: () => void;
  };

  let {
    totalOddsValue,
    possibleWinningsValue,
    stake,
    stakePresets,
    isPlaceBetDisabled,
    onSetStake,
    onAddStakePreset,
    onClearSlip,
    onPlaceBet,
  }: Props = $props();
</script>

<div class="sticky bottom-0 z-10 border-t border-[#dce1e8] bg-[#f7f8fb] p-3">
  <div
    class="rounded-lg border border-[#eef0f4] bg-white p-3 text-[#1b2034] shadow-sm"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="text-sm">
        <div class="text-[#1b2034]/90">Total odds</div>
        <div class="mt-1 text-[#1b2034]/90">Possible winnings</div>
      </div>
      <div class="text-right text-sm font-semibold">
        <div>{totalOddsValue ? totalOddsValue.toFixed(2) : '0.00'}</div>
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
          onclick={() => onAddStakePreset(preset)}
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
          <label for="stake" class="text-md font-normal text-white">
            Stake
          </label>
        </div>
        <input
          id="stake"
          class="w-28 bg-transparent text-right text-lg text-white outline-none placeholder:text-white"
          type="number"
          min="0"
          step="1"
          inputmode="numeric"
          value={stake}
          oninput={(event) =>
            onSetStake(Number((event.currentTarget as HTMLInputElement).value))}
        />
      </div>
    </div>

    <div class="mt-3 grid w-full grid-cols-2 gap-2">
      <button
        class="rounded-lg border border-[#d9dde5] bg-[#f2f4f8] px-4 py-3 text-md text-[#2b3348]"
        onclick={onClearSlip}
      >
        Clear Slip
      </button>
      <button
        disabled={isPlaceBetDisabled}
        onclick={onPlaceBet}
        class="w-full rounded-lg bg-[#f3c15a] px-4 py-3 text-md text-[#11162a] disabled:cursor-not-allowed disabled:bg-[#e8d7a8]"
      >
        Place Bet
      </button>
    </div>
  </div>
</div>
