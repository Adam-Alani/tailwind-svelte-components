<script>
	import Hero from './components/Hero.svelte'
	import Chips from './components/Chips.svelte'
	import Button from './components/Button.svelte'
	import CustomCard from './components/CustomCard.svelte'
	import Footer from './components/Footer.svelte'
</script>


<main class="flex flex-col min-h-screen">
	<section class="flex-grow px-12 py-12">

		<Hero img_link="https://upload.wikimedia.org/wikipedia/commons/f/f9/Phoenicopterus_ruber_in_S%C3%A3o_Paulo_Zoo.jpg">
			<h1 slot="Title">Header</h1>
			<h4 slot="Description">Say something cool here even though your startup is going to be bankrupt in a year or two</h4>
		</Hero>

		<div>
			<Chips name="Click Me" bg_color="bg-purple-500" txt_color="text-white"/>
			<Chips name="Hover Me" bg_color="bg-blue-500" txt_color="text-white"/>
			<Chips name="Shanghai" bg_color="bg-blue-500" txt_color="text-white"/>
			<Chips name="London" bg_color="bg-red-500" txt_color="text-white"/>
		</div>

		<div class="mt-8">
			<!--Use on:click={} to do whatever-->
			<!--These are basically the same thing as chips tbh-->

			<Button  name="Click Me" bg_color="bg-yellow-300" txt_color="text-black"/>
			<Button name="Click Me" bg_color="bg-pink-300" txt_color="text-black"	/>
			<Button name="Click Me" bg_color="bg-gray-800" txt_color="text-white"  />
			<Button name="Click Me" bg_color="bg-purple-900" txt_color="text-white" />
		</div>



		<div class="flex-row flex flex-wrap">

			<CustomCard width="w-72" height="h-56" bg_color="bg-blue-500">
				<!--Put Anything Here-->
				<h1 class="font-bold text-xl">Title Text</h1>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur bibendum massa sit amet pellentesque. Integer tincidunt nulla vitae scelerisque pretium. Sed ornare orci nisi, molestie fermentum neque fringilla ornare. Donec vitae nisl et massa aliquam ultricies vel eu quam. Fusce a nisl vel augue vulputate luctus ornare eu sapien. Mauris nec luctus ex, porta finibus tellus. Proin viverra eu augue a rhoncus. Etiam at imperdiet sem. Praesent vitae ligula pellentesque, efficitur enim id, eleifend lacus.</p>
			</CustomCard>

			<CustomCard width="w-72" height="h-56" bg_color="bg-green-500">
				<!--Put Anything Here-->
				<h1 class="font-bold text-xl">Title Text</h1>
				<p>Other Text</p>
			</CustomCard>

			<CustomCard width="w-72" height="h-56" bg_color="bg-purple-500">
				<!--Put Anything Here-->
				<h1 class="font-bold text-xl">Hover Me</h1>
				<p>Other Text</p>
			</CustomCard>
			<CustomCard width="w-72" height="h-56" bg_color="bg-blue-500">
				<!--Put Anything Here-->
				<h1 class="font-bold text-xl">Title Text</h1>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur bibendum massa sit amet pellentesque. Integer tincidunt nulla vitae scelerisque pretium. Sed ornare orci nisi, molestie fermentum neque fringilla ornare. Donec vitae nisl et massa aliquam ultricies vel eu quam. Fusce a nisl vel augue vulputate luctus ornare eu sapien. Mauris nec luctus ex, porta finibus tellus. Proin viverra eu augue a rhoncus. Etiam at imperdiet sem. Praesent vitae ligula pellentesque, efficitur enim id, eleifend lacus.</p>
			</CustomCard>

			<CustomCard width="w-72" height="h-56" bg_color="bg-green-500">
				<!--Put Anything Here-->
				<h1 class="font-bold text-xl">Title Text</h1>
				<p>Other Text</p>
			</CustomCard>
		</div>




	</section>

	<!--To use this, wrap all ur html in a flex flex-grow and min-h-screen, and this will automatically stick to bottom-->
	<Footer>
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed efficitur bibendum massa sit amet pellentesque. Integer tincidunt nulla vitae scelerisque pretium. Sed ornare orci nisi, molestie fermentum neque fringilla ornare. Donec vitae nisl et massa aliquam ultricies vel eu quam. Fusce a nisl vel augue vulputate luctus ornare eu sapien. Mauris nec luctus ex, porta finibus tellus. Proin viverra eu augue a rhoncus. </p>
	</Footer>

</main>








<style global>
	@import 'tailwindcss/base';
	@import 'tailwindcss/components';
	@import 'tailwindcss/utilities';
</style>
