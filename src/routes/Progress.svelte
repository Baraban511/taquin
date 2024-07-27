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
		duration: 1000,
		easing: quartInOut,
	});
	$: {
		if (step === "QCM") {
			progress.set(50);
			depart = false;
		} else if (step === "LINK") {
			progress.set(100);
			etape = false;
		} else {
			progress.set(0);
			depart = true;
			etape = true;
		}
	}
</script>

<div class="sticky top-0 dark:bg-gray-900 bg-white w-screen p-5 z-50">
	<div class="flex items-center justify-between w-full">
		<div>
			{#if depart}
				<div class="py-1" transition:fly={{ duration: 1000, x: -100, y: 0, easing: quartInOut }}>Départ</div>
			{/if}
		</div>
		<div>
			{#if etape}
				<div class="py-1" transition:fly={{ duration: 1000, x: 0, y: -100, easing: quartInOut }}>Etape</div>
			{/if}
		</div>
		<div>
			<div class="py-1" transition:fly>Arrivé</div>
		</div>
	</div>

	<div
		class="flex items-center w-full bg-gray-200 rounded-full dark:bg-gray-700 h-6"
	>
		<div
			class="flex justify-end items-center static"
			style="width: {$progress}%"
		>
			<FluentRabbitFilled class="text-3xl" />
		</div>
	</div>
</div>
