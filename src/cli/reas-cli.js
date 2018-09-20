const {
    startFileAnalysys
} = require('./index')
const {
    getReasConfig
} = require('../defaults')
const visualizeModuleGraph = require('./visualize')
const workspace = process.cwd()

require('yargs')
    .example('reas ./source-file.js', '-> Analyse `source.js`')
    .version(true)
    .command('run [file]', 'start analyzing file', (yargs) => {
        yargs.positional('file', {
            describe: 'relative path to the file',
            type: 'string'
        })
    }, (argv) => {
        startFileAnalysys(getReasConfig({
            file: argv.file,
            workspace
        }))
    })
    .command('explore', 'Vizualise "parent" modules relations', (yargs) => {}, (argv) => {
        visualizeModuleGraph(getReasConfig({
            workspace
        }))
    })
    .argv
// .command('init', 'Generates default reas.config.json', (yargs) => {}, (argv) => {
//     generateConfig({
//         file: args.file,
//         workspace: __dirname
//     })
// }).argv