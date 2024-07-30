<script>
  import Status from "$lib/components/Status.svelte";
  import calendar from "$lib/assets/calendar.png";
  var version = process.env.VERSION;
  if (import.meta.env.DEV) {
    version = process.env.VERSION + "-dev";
  }
</script>

<footer class="bg-gray-100 dark:bg-gray-950">
  <div class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="sm:flex sm:items-center sm:justify-between">
      <div class="flex justify-center lg:justify-start items-center gap-3">
        <img
          src={calendar}
          alt="EDC logo"
          class="size-12 transition transform hover:rotate-180"
        />
        <Status/>
      </div>
      <p
        class="text-center text-sm text-gray-500 dark:text-gray-400 items-center py-3"
      >
        <strong>V{version}</strong> - Made by
        <a href="https://barab.me"><strong>barab.</strong></a>
      </p>
    </div>
  </div>
</footer>
