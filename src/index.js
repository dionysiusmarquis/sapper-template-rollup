const target = document.querySelector('#sapper')

// This is to simulate sapper index page SSR
import App from "./snowpack/@sapper/internal/App.svelte";
import component from './routes/index.svelte'
const app = new App({
	target,
	props: {
		stores: {},
		segments: [ undefined, undefined ],
		status: 200,
		error: null,
		level0: { props: undefined },
		level1: { 
			component,
			props: {},
			segment: undefined
		},
		notify: () => console.log('Initial render done.')
	}
});

export default app

// Sapper init
import * as sapper from './snowpack/@sapper/app';

sapper.start({
	target
});

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		app.$destroy();
	});
}