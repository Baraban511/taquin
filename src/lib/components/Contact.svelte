<script>
    import { enhance } from "$app/forms";
    import { slide } from "svelte/transition";
    import wavingHand from "$lib/assets/waving-hand.png";
    import TablerCircleDashed from "~icons/tabler/circle-dashed";
    export let mail;
    let loading = false;
</script>

{#if mail === true}
    <div class="flex items-center justify-center gap-2 p-5" transition:slide>
        <img src={wavingHand} alt="Waving Hand" class="w-16 h-16" />
        <p class="text-4xl font-bold mt-3">Message reçu.</p>
    </div>
{:else}
    <form
        method="post"
        action="?/contact"
        class="flex items-start m-5 gap-4 flex-col"
        use:enhance={() => {
            loading = true;
            return async ({ update }) => {
                await update();
                loading = false;
            };
        }}
        transition:slide
    >
        <p class="text-4xl font-bold">Contact</p>
        <p class="text-gray-500 dark:text-gray-400">
            Un problème, une question ? Contactez-nous !
        </p>
        <input
            type="email"
            placeholder="Email"
            name="mail"
            autocomplete="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            autocapitalize="none"
            disabled={loading}
        />
        <textarea
            placeholder="Message"
            name="message"
            rows="8"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            disabled={loading}
            required
        />
        <button
            type="submit"
            class="flex items-center justify-center mb-5 w-full sm:w-auto bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-white"
            disabled={loading}
            >{#if loading}
                <TablerCircleDashed class="animate-spin h-5 w-5" />
            {:else}
                Envoyer
            {/if}</button
        >
    </form>
{/if}