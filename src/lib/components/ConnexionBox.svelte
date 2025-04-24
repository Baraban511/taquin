<script>
    import { preventDefault } from 'svelte/legacy';
    import { enhance } from "$app/forms";
    import { slide } from "svelte/transition";
    import TablerEye from "~icons/tabler/eye";
    import TablerEyeOff from "~icons/tabler/eye-off";
    import TablerCircleDashed from "~icons/tabler/circle-dashed";
	import TablerUpload from "~icons/tabler/upload";
	import TablerCheck from "~icons/tabler/check";
    import googleCalendar from "$lib/assets/google-calendar.png";
    let { data } = $props();
    let password = $state("password");
    let loading = $state(false);
    let clipboard = $state(false);
    function copy(text) {
        clipboard = false;
        navigator.clipboard.writeText(text).then(() => {
            clipboard = true;
        });
    }
</script>

<div class="border-2 dark:border-gray-700 mx-5 rounded">
    {#if !data?.step}
        <div class="p-5" transition:slide>
            <p class="dark:text-white text-center text-2xl font-bold p-3">
                Connexion
            </p>
            <p class="dark:text-white text-center text-lg p-3">
                Connectez-vous avec votre compte EcoleDirecte
            </p>
            <form
                method="post"
                action="?/connexion"
                class="max-w-sm mx-auto py-3"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update();
                        loading = false;
                    };
                }}
            >
                <div class="grid gap-6 mb-6 md:grid-cols-2">
                    <div>
                        <label
                            for="login"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Identifiant</label
                        >
                        <input
                            type="text"
                            id="login"
                            placeholder="Identifiant"
                            name="login"
                            autocomplete="off"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            autocapitalize="none"
                            disabled={loading}
                            required
                        />
                    </div>
                    <div>
                        <label
                            for="password"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >Mot de passe</label
                        >
                        <div class="relative z-auto">
                            <input
                                type={password}
                                id="password"
                                name="password"
                                placeholder="Mot de passe"
                                autocomplete="off"
                                autocapitalize="none"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                disabled={loading}
                                required
                            />
                            <button
                                type="button"
                                class="absolute inset-y-0 end-0 grid place-content-center px-3 dark:bg-gray-700 bg-gray-50 m-0.5"
                                onclick={preventDefault(() =>
                                    password === "password"
                                        ? (password = "text")
                                        : (password = "password"))}
                            >
                                {#if password === "password"}
                                    <TablerEye
                                        class="dark:text-white dark:bg-gray-700 bg-gray-50 text-xl "
                                    />
                                {:else}
                                    <TablerEyeOff
                                        class="dark:text-white text-xl"
                                    />
                                {/if}</button
                            >
                        </div>
                    </div>
                </div>
                <button
                    type="submit"
                    class="text-white flex items-center justify-center w-full bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    disabled={loading}
                    >{#if loading}
                        <TablerCircleDashed class="animate-spin h-5 w-5" />
                    {:else}
                        Se connecter
                    {/if}</button
                >
            </form>
        </div>
    {/if}
    <!--QCM form-->
    {#if data?.step === "QCM"}
        <div transition:slide class="p-5 mb-5">
            <p class="dark:text-white text-center text-xl p-3 mb-4">
                {data.qcm.question}
            </p>

            <form
                method="POST"
                action="?/qcm"
                class="w-auto mx-auto flex items-center justify-center flex-col"
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update();
                        loading = false;
                    };
                }}
            >
                <fieldset
                    class="flex justify-center items-center flex-wrap gap-4"
                >
                    {#each data.qcm.answers as answer, i}
                        <div>
                            <label
                                for="radio{i}"
                                class="block cursor-pointer rounded-lg border p-4 text-sm font-medium shadow-sm has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 border-gray-100 bg-white hover:border-gray-200"
                            >
                                <p class="text-gray-700 dark:text-gray-200">
                                    {answer}
                                </p>
                                <input
                                    type="radio"
                                    name="answer"
                                    value={answer}
                                    disabled={loading}
                                    id="radio{i}"
                                    class="sr-only"
                                    required
                                />
                            </label>
                        </div>
                    {/each}
                </fieldset>
                <button
                    type="submit"
                    class="flex items-center justify-center w-auto sm:w-1/5 text-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 my-4 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    disabled={loading}
                >
                    {#if loading}
                        <TablerCircleDashed class="animate-spin h-5 w-5" />
                    {:else}
                        Valider
                    {/if}
                </button>
            </form>
        </div>
    {/if}

    {#if data?.step === "LINK"}
        <div class="p-5" transition:slide>
            <p href={data.link} class="text-2xl font-bold p-3">
                Exportez votre calendrier
            </p>
            <div
                class="flex flex-col sm:flex-row justify-center items-center gap-5 m-5"
            >
                <div
                    class="flex flex-1 overflow-hidden items-center justify-center flex-col gap-4 p-2 rounded-md bg-slate-200 dark:bg-slate-800 border dark:border-gray-700"
                >
                    <img
                        class="w-20 mt-3"
                        alt="L'icône de Calendrier Google"
                        src={googleCalendar}
                    />
                    <h3 class="text-lg font-medium">
                        S'abonner avec Google Calendar
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400">
                        Vous pouvez automatiquement exporter ce calendrier vers
                        le Google Calendar.
                    </p>
                    <a
                        class="py-1 px-2 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 rounded"
                        href={`https://www.google.com/calendar/render?cid=webcal://${encodeURI(data.link)}`}
                        target="_blank"
                    >
                        Exporter vers Google Calendar
                    </a>
                </div>
                <div
                    class="flex flex-1 overflow-hidden items-center justify-center flex-col gap-4 p-2 rounded-md bg-slate-200 dark:bg-slate-800 border dark:border-gray-700 w-full"
                >
                    <TablerUpload class="text-7xl" />
                    <h3 class="text-lg font-medium">
                        S'abonner manuellement avec n'importe quel calendrier
                    </h3>
                    <p class="text-gray-500 dark:text-gray-400">
                        Exporter ce calendrier vers le Calendrier iOS, Outlook,
                        Proton, etc.
                    </p>
                    <div class="flex max-w-full">
                        <a
                            class="truncate py-1 px-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 rounded-l hover:border-blue-500 dark:hover:border-blue-500 dark:text-white"
                            href={`webcal://${data.link}`}
                            >{`webcal://${data.link}`}
                        </a>
                        <button
                            class="flex items-center justify-center py-1 px-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 hover:text-blue-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-r"
                            onclick={copy(`webcal://${data.link}`)}
                            ><TablerCheck
                                class="{clipboard ? '' : 'hidden'} h-5 w-5 mr-3"
                            />
                            {clipboard ? "Copié" : "Copier"}</button
                        >
                    </div>
                </div>
            </div>
            <p
                class="text-gray-500 select-all dark:text-gray-700 text-sm break-all mt-5 text-center"
            >
                webcal://{data.link}
            </p>
        </div>
        <!--Message d'information pour les mails de vérification-->
    {/if}
</div>
