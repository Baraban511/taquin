<script>
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import FluentRabbitFilled from "~icons/fluent/animal-rabbit-20-filled";
	export let step;
	let progress = tweened(0, {
		duration: 500,
		easing: cubicOut,
	});
	$: {
		if (step === "QCM") {
			progress.set(50);
		} else if (step === "LINK") {
			progress.set(100);
		} else {
			progress.set(0);
		}
	}
</script>

<div class="sticky top-0 dark:bg-gray-900 bg-white w-screen p-5 z-50">
	<div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
		<div
			class="flex justify-end items-center bg-blue-600 px-1 rounded-full"
			style="width: {$progress}%"
		>
			<FluentRabbitFilled class="text-xl" />
		</div>
	</div>
</div>
