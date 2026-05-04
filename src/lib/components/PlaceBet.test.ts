import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import PlaceBet from './PlaceBet.svelte';

describe('PlaceBet', () => {
	const defaultProps = {
		totalOddsValue: 2.5,
		possibleWinningsValue: 250,
		stake: 100,
		stakePresets: [50, 100, 200, 500, 1000] as const,
		isPlaceBetDisabled: false,
		onSetStake: vi.fn(),
		onAddStakePreset: vi.fn(),
		onClearSlip: vi.fn(),
		onPlaceBet: vi.fn()
	};

	it('renders total odds and possible winnings', () => {
		render(PlaceBet, { props: defaultProps });

		expect(screen.getByText('Total odds')).toBeInTheDocument();
		expect(screen.getByText('2.50')).toBeInTheDocument();
		expect(screen.getByText('Possible winnings')).toBeInTheDocument();
		expect(screen.getByText('Ksh. 250')).toBeInTheDocument();
	});

	it('renders all stake preset buttons', () => {
		render(PlaceBet, { props: defaultProps });

		expect(screen.getByText('Kes 50')).toBeInTheDocument();
		expect(screen.getByText('Kes 100')).toBeInTheDocument();
		expect(screen.getByText('Kes 200')).toBeInTheDocument();
		expect(screen.getByText('Kes 500')).toBeInTheDocument();
		expect(screen.getByText('Kes 1000')).toBeInTheDocument();
	});

	it('calls onAddStakePreset when preset button is clicked', async () => {
		const user = userEvent.setup();
		const onAddStakePreset = vi.fn();
		render(PlaceBet, { props: { ...defaultProps, onAddStakePreset } });

		await user.click(screen.getByText('Kes 200'));

		expect(onAddStakePreset).toHaveBeenCalledWith(200);
	});

	it('renders stake input with current value', () => {
		render(PlaceBet, { props: defaultProps });

		const input = screen.getByLabelText('Stake') as HTMLInputElement;
		expect(input.value).toBe('100');
	});

	it('calls onSetStake when stake input changes', async () => {
		const user = userEvent.setup();
		const onSetStake = vi.fn();
		render(PlaceBet, { props: { ...defaultProps, onSetStake } });

		const input = screen.getByLabelText('Stake');
		await user.clear(input);
		await user.type(input, '300');

		expect(onSetStake).toHaveBeenCalled();
	});

	it('calls onClearSlip when Clear Slip button is clicked', async () => {
		const user = userEvent.setup();
		const onClearSlip = vi.fn();
		render(PlaceBet, { props: { ...defaultProps, onClearSlip } });

		await user.click(screen.getByText('Clear Slip'));

		expect(onClearSlip).toHaveBeenCalledOnce();
	});

	it('calls onPlaceBet when Place Bet button is clicked', async () => {
		const user = userEvent.setup();
		const onPlaceBet = vi.fn();
		render(PlaceBet, { props: { ...defaultProps, onPlaceBet } });

		await user.click(screen.getByText('Place Bet'));

		expect(onPlaceBet).toHaveBeenCalledOnce();
	});

	it('disables Place Bet button when isPlaceBetDisabled is true', () => {
		render(PlaceBet, { props: { ...defaultProps, isPlaceBetDisabled: true } });

		const button = screen.getByText('Place Bet') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});

	it('displays 0.00 for total odds when value is 0', () => {
		render(PlaceBet, { props: { ...defaultProps, totalOddsValue: 0 } });

		expect(screen.getByText('0.00')).toBeInTheDocument();
	});

	it('displays Ksh. 0 for possible winnings when value is 0', () => {
		render(PlaceBet, { props: { ...defaultProps, possibleWinningsValue: 0 } });

		expect(screen.getByText('Ksh. 0')).toBeInTheDocument();
	});
});
