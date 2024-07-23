<script>
    import { IconBell, IconRefresh, IconSchoolOff } from "@tabler/icons-svelte";
</script>

<div class="p-5">
    <p class="text-4xl font-bold p-3">Fonctionnalitées :</p>
    <div class="flex flex-col lg:flex-row gap-4 text-center lg:text-left">
        <div
            class="p-2 flex-1 transition-shadow hover:shadow-2xl hover:dark:shadow-slate-800 rounded-md"
        >
            <div class="flex lg:justify-start justify-center items-center py-2">
                <IconBell />
                <p class="text-xl font-bold ml-2">Notifications</p>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
                Taquin vous envoie des notifications en cas de cours annulé plus d'une
                heure en avance.
            </p>
        </div>
        <div
            class="p-2 flex-1 transition-shadow hover:shadow-2xl hover:dark:shadow-slate-800 rounded-md"
        >
            <div class="flex lg:justify-start justify-center items-center py-2">
                <IconRefresh />
                <p class="text-xl font-bold ml-2">Mises à jours automatiques</p>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
                Votre calendrier se met à jour automatiquement, mais vous pouvez
                aussi le rafraichir manuellement.
            </p>
        </div>
        <div
            class="p-2 flex-1 transition-shadow hover:shadow-2xl hover:dark:shadow-slate-800 rounded-md"
        >
            <div class="flex lg:justify-start justify-center items-center py-2">
                <IconSchoolOff />
                <p class="text-xl font-bold ml-2">Jours fériés</p>
            </div>
            <p class="text-gray-500 dark:text-gray-400">
                Taquin rajoute automatiquement les jours fériés à votre calendrier
            </p>
        </div>
    </div>
</div>
