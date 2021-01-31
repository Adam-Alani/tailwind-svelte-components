<script>
    export let name;
    export let bg_color;
    export let txt_color;
    export let hover_color;  //If you get this to work, tell me




</script>

<button class="{bg_color} {txt_color}
    rounded shadow-md py-2 px-4 mx-1 my-0.5 font-semibold focus:outline-none
    transition duration-500 ease-in-out transform hover:scale-110 hover:bg-blue-500">{name}
</button>







<style global>
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';
</style>

