<script>
  import { env } from "$env/dynamic/public";
  console.log(env.PUBLIC_BANNER_TEXT);
</script>

<div
  class="flex justify-center items-center relative top-0 z-50 w-full min-h-10 bg-red-500 p-1"
>
  <p class="text-center">{env.PUBLIC_BANNER_TEXT}</p>
</div>
