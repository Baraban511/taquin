<script>
	import { tweened } from "svelte/motion";
	import { quartInOut } from "svelte/easing";
	import { fly } from "svelte/transition";
	import { cubicInOut } from "svelte/easing";
	import FluentRabbitFilled from "~icons/fluent/animal-rabbit-20-filled";
	export let step;
	let depart,
		etape = true;
	let progress = tweened(0, {
		duration: 1500,
		easing: quartInOut,
	});
	$: {
		if (step === "QCM") {
			progress.set(49);
			depart = false;
		} else if (step === "LINK") {
			progress.set(99);
			etape = false;
		} else {
			progress.set(1);
			depart = true;
			etape = true;
		}
	}
</script>

<div
	class="sticky top-0 dark:bg-gray-900 bg-white w-screen px-5 pb-5 pt-3 z-50"
>
	<div class="flex justify-between items-end w-full">
		<div class="w-1/3">
			{#if depart}
				<div
					class="flex py-1"
					transition:fly={{
						delay: 250,
						duration: 1000,
						x: -100,
						y: 0,
						easing: quartInOut,
					}}
				>
					Départ
				</div>
			{/if}
		</div>
		<div class="text-center w-1/3">
			{#if etape}
				<div
					class="py-1"
					transition:fly={{
						delay: 250,
						duration: 1000,
						x: 0,
						y: -100,
						easing: quartInOut,
					}}
				>
					Etape
				</div>
			{/if}
		</div>
		<div class="text-right w-1/3">
			<div class="py-1">Arrivé</div>
		</div>
	</div>

	<div class="flex items-center w-full border-b-2 h-6">
		<FluentRabbitFilled
			class="text-3xl"
			style="position: sticky;
left: {$progress}%"
		/>
	</div>
</div>
