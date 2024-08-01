<script>
	import "./styles.css";
	import { fly } from "svelte/transition";
	import { tweened } from "svelte/motion";
	import { flip } from "svelte/animate";
	import Footer from "$lib/components/Footer.svelte";
	import Progress from "$lib/components/Progress.svelte";
	import HowItWorks from "$lib/components/HowItWorks.svelte";
	import Faq from "$lib/components/FAQ.svelte";
	import Functionalities from "$lib/components/Functionalities.svelte";
	import Contact from "$lib/components/Contact.svelte";
	import Header from "$lib/components/Header.svelte";
	import ConnexionBox from "$lib/components/ConnexionBox.svelte";
	import TablerX from "~icons/tabler/x";
	export let data;
	export let form;
	$: Components = [
		{ component: Header },
		{ component: ConnexionBox, props: { data } },
		{ component: HowItWorks },
		{ component: Functionalities },
		{ component: Faq },
	];
	$: if (data?.step === "QCM") {
		Components = [{ component: ConnexionBox, props: { data } }];
	}
	$: if (data?.step === "LINK") {
		Components = [
			{ component: ConnexionBox, props: { data } },
			{ component: Contact, props: { mail: data?.mail } },
		];
	}
	let pageTitle = "Connexion";
	if (data?.step === "QCM") {
		pageTitle = "Double authentification";
	}
	if (data?.step === "LINK") {
		pageTitle = "Exportez votre calendrier";
	}
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>Taquin - {pageTitle}</title>
	<link rel="canonical" href="https://taquin.tech/" />
</svelte:head>

<noscript>
	<div class="bg-indigo-600 px-4 py-3 text-white">
		<p class="text-center text-sm font-medium">
			Javascript est désactivé sur votre navigateur. Certaines
			fonctionnalités de cette page ne fonctionneront pas correctement.
		</p>
	</div>
</noscript>
<div
	class="dark:bg-gray-900 min-w-screen min-h-screen text-center dark:text-white"
>
	<Progress step={data.step} />

	{#each Components as { component: Component, props = { } }, key (Component) }
	<div animate:flip>	
	<svelte:component this={Component} {...props}/>
	</div>
	{/each}
</div>
<!--Error pop-up-->
{#if form?.error}
	<div
		transition:fly={{ x: -200, duration: 700 }}
		role="alert"
		id="alert"
		class="z-50 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 fixed bottom-2 left-2"
	>
		<div class="flex items-start gap-4">
			<div class="flex-1">
				<strong class="block font-medium text-gray-900 dark:text-white"
					>Erreur</strong
				>

				<p class="mt-1 text-sm text-gray-700 dark:text-gray-200">
					{form.error}
				</p>
			</div>

			<button
				on:click={() => (form.error = null)}
				class="text-gray-500 transition hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-500"
			>
				<span class="sr-only">Fermer la notification</span>
				<TablerX class="text-xl" />
			</button>
		</div>
	</div>
{/if}
<Footer />
