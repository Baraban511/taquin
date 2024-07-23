<script>
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";
    import { IconCircleFilled } from "@tabler/icons-svelte";
    let data = [];
    let error = null;
    let loading = true;

    onMount(async () => {
        try {
            const response = await fetch("/status");
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            data = await response.json();
        } catch (err) {
            error = err.message;
        } finally {
            loading = false;
        }
    });
</script>

<div
    class="group select-none transition hover:bg-slate-300 dark:hover:bg-slate-900 rounded-md p-2"
>
    {#if loading}
        <p class="flex items-center dark:text-gray-600" transition:slide>
            <IconCircleFilled class="p-1" />Chargement
        </p>
    {:else if error}
        <p class="flex items-center text-red-600" transition:slide>
            <IconCircleFilled class="p-1" />Impossible de charger le status
        </p>
    {:else if !data.online}
        <p
            class="group-hover:hidden flex items-center text-orange-600"
            transition:slide
        >
            <IconCircleFilled class="p-1" />EcoleDirecte subi des pertubations
        </p>
        <a
            class="hidden group-hover:block text-gray-600"
            href="https://status.ecoledirecte.com"
            target="_blank"
        >
            Plus de détails disponibles sur leur site
        </a>
    {:else}
        <p
            class="group-hover:hidden flex items-center text-green-600"
            transition:slide
        >
            <IconCircleFilled class="p-1" />Systèmes opérationnels.
        </p>
        <p class="hidden group-hover:block text-gray-600">
            Temps de réponse : {data.time}ms
        </p>
    {/if}
</div>
