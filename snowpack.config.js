const scripts = {
  "mount:public": "mount static --to /",
  "mount:sapper": "mount @sapper --to /client/node_modules/@sapper",
  "mount:src": "mount src --to /client"
};

// const dev =  process.env.NODE_ENV === 'development';
const options = {
  dev: true,
  hydratable: true
}

module.exports = {
  exclude: ['**/src/*server.js', '**/src/service-worker.js'],
  plugins: [
    ["@snowpack/plugin-svelte", options],
    "@snowpack/plugin-dotenv"
  ],
  scripts,
  installOptions: {
    // this is needed to build 'src/node_modules/@sapper/*'
    rollup: {
      plugins: [
        require('rollup-plugin-svelte')(options),
        require("rollup-plugin-node-polyfills")()
      ]
    }
  },
  devOptions: {
    open: "none"
  },
};