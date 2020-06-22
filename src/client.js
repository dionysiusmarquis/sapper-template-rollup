import * as sapper from '@sapper/app';

sapper.start({
	target: document.querySelector('#sapper')
});

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    // TODO: Do anything here?
  });
}