<script>
    export let img_link;
</script>


<div class="mx-auto max-w-6xl py-12 ">
    <div class="grid grid-cols-1 lg:grid-cols-2 items-center pb-12 gridbox gap-10">
        <div class="flex flex-col lg:text-left text-center lg:items-baseline flex-grow  ">
            <h1 class="font-bold text-4xl">
                <slot name="Title">
                </slot>
            </h1>
            <h4 class="text-xl ">
                <slot name="Description">
                </slot>
            </h4>
        </div>
        <img src={img_link} width="600px" height="auto" class=" rounded-xl shadow-md ">
    </div>
</div>





<style global>
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';
</style>
