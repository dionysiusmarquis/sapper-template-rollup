let start = Date.now()

const path = require('path')
const mock = require('mock-require');
const svelte = require('@snowpack/plugin-svelte')
const deasync = require('deasync')
const cache = require('sapper/dist/core').cache

process.browser = false
process.env.PORT = 3000

const { build } = svelte({}, {generate: 'ssr'})

function svelteHook (contents, filePath) {
  const { changed, stats } = cache.stateSync(filePath);
  
  let code
  // We have to deasync Svelte compiling, because Node commonjs require system is always sync.
  if (changed) {
    const exec = deasync(cb => {
      build({ contents, filePath })
      .then(({ result }) => { code = result; cb() })
      .catch(error => { console.error('Hook error:', error); throw error })
    })
    exec()
    
    const entry = cache.addSync(filePath, code, stats);
    console.log(`[Unbundled Runtime] compiled ${filePath}`)
  } else {
    code = cache.get(filePath).code
  }

  return code
}

const srcFolder = path.resolve('src')
const serverFile = path.resolve(srcFolder, 'node_modules/@sapper/server')
let middleware
let dirty = true
mock('@sapper/server', {
  middleware: opts => {
    return (req, res, next) => {
      if (dirty) {
        // Clear cached src folder requires to get the latest server version
        for (const id in require.cache) {
          if (id.includes(srcFolder)) {
            delete require.cache[id]
          }
        }
        
        const start = Date.now()
        try {
          middleware = require(serverFile).middleware(opts)
        } catch (error) {
          console.error(error)
          throw error
        }

        dirty = false
        console.log(`[Unbundled Runtime] middleware rebuild took ${Date.now() - start}ms`)
      }

      return middleware(req, res, next)
    }
  }
})

/** This is just an alternative to esm with pirates, since esm is currently to strict caching file
 * @see https://github.com/standard-things/esm/issues/874 **/
const parser = require("@babel/parser")
require('@babel/register')({
  presets: ['@babel/preset-env'],
  ignore: [ filePath => !filePath.includes(srcFolder) ],
  plugins: [
    {
      name: 'svelte',
      parserOverride(code, opts) {
        if (opts.sourceFileName.includes('.svelte')) {
          const compiled = svelteHook(code, opts.sourceFileName)
          return parser.parse(compiled, opts)
        }
      },
    },
    '@babel/transform-runtime'
  ],
  extensions: [ '.svelte', '.es6', '.es', '.jsx', '.js', '.mjs' ]
});

module.exports = require("./src/server")

console.log(`[Unbundled Runtime] start took ${Date.now() - start}ms`)

process.on('message', message => { 
  if (message.__sapper__ && message.event === 'update') {
    dirty = true
  }
})
