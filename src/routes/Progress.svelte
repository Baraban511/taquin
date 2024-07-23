<script>
	import { tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	//import { draw } from "svelte/transition";
	//import { IconCircleCheck } from "@tabler/icons-svelte";
	export let step;
	let progress = tweened(0, {
		duration: 500,
		easing: cubicOut,
	});
	$: {
		if (step === "QCM") {
			progress.set(0.5);
		} else if (step === "LINK") {
			progress.set(1);
		} else {
			progress.set(0);
		}
	}
</script>

<div class="sticky top-0 dark:bg-gray-900 bg-white w-screen p-5 z-50">
	<progress
		value={$progress}
		max="1"
		class="w-full dark:bg-gray-700 bg-gray-200 h-2.5 rounded-full"
	/>
</div>

<!-- <svg
			xmlns="http://www.w3.org/2000/svg"
			width="96"
			height="96"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#000000"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon icon-tabler icons-tabler-outline icon-tabler-circle-check"
			><path
				stroke="none"
				d="M0 0h24v24H0z"
				fill="none"
				transition:draw={{ duration: 9000, easing: quintOut }}
			/><path
				d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"
				transition:draw={{ duration: 9000, easing: quintOut }}
			/><path
				d="M9 12l2 2l4 -4"
				transition:draw={{ duration: 9000, easing: quintOut }}
			/></svg
		>-->
