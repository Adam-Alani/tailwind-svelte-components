<script>
    export let name;
    export let bg_color;
    export let txt_color;
    export let hover_color;  //If you get this to work, tell me

    let clickedColor = "bg-gray-800"

    function clickHandler() {
        clickedColor = bg_color
    }
</script>

<button on:click={clickHandler} class="{clickedColor} {txt_color}
    text-xs rounded-full shadow-md py-2 px-4 mx-1 my-0.5  font-semibold  focus:outline-none
    transition duration-500 ease-in-out transform hover:scale-110 hover:bg-blue-500">{name}
</button>







<style global>
    @import 'tailwindcss/base';
    @import 'tailwindcss/components';
    @import 'tailwindcss/utilities';
</style>

