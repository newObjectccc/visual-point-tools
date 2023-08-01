const path = require('path')
const rollup = require('rollup')
const tsPlugin = require('rollup-plugin-ts')


const workspaceRoot = path.resolve(__dirname)
const packagesDir = path.resolve(workspaceRoot, 'packages')

const packageConfigs = [
  {
    name: 'logger',
    input: path.resolve(packagesDir, 'logger/src/index.ts'),
    output: path.resolve(packagesDir, 'logger/dist/bundle.js'),
    name: 'logger',
    format: 'umd'
  },
  {
    name: 'reporter',
    input: path.resolve(packagesDir, 'reporter/src/index.ts'),
    output: path.resolve(packagesDir, 'reporter/dist/bundle.js'),
    name: 'reporter',
    format: 'umd'
  },
  {
    name: 'visual-pointing',
    input: path.resolve(packagesDir, 'visual-pointing/src/index.ts'),
    output: path.resolve(packagesDir, 'visual-pointing/dist/bundle.js'),
    name: 'visual-pointing',
    format: 'umd'
  }
]

async function buildPackages() {
  for (const config of packageConfigs) {
    const bundle = await rollup.rollup({
      input: config.input,
      plugins: [tsPlugin()]
    })

    await bundle.write({
      file: config.output,
      name: config.name,
      format: config.format
    })
  }
}

buildPackages().catch(err => {
  console.error('Error building packages:', err)
  process.exit(1)
})