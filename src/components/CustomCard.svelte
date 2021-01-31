<script>
    export let width;
    export let height;
    export let bg_color;
</script>

<div class=" {width} min-{height} {bg_color} shadow-md rounded-xl mx-2 my-4 transition duration-500 ease-in-out transform hover:scale-110">
    <div class="mx-6 py-4 ">
    <slot></slot>
    </div>
</div>




<style global>
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';
</style>
