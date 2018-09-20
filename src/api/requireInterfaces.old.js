const walk = require('walkdir')
const path = require('path')
const chalk = require('chalk')
const log = console.log;
const debundled = require(`./${process.env.ASM_PROJECT}/debundled.json`)
const pathTree = require(`./${process.env.ASM_PROJECT}/path.json`)
const fs = require('fs')
const MODULES_DIR = `./${process.env.ASM_PROJECT}/modules`
const paths = walk.sync(MODULES_DIR)
const _ = require('lodash')

let result = {}

paths
    .filter(a => a.includes('index.js') && !a.includes('.json'))
    .forEach(modulePath => {
        const str = fs.readFileSync(modulePath, 'utf8')
        const moduleShortPath = path.relative(path.resolve(MODULES_DIR), modulePath)
        let publicModule

        try {
            const quickData = fs.readFileSync(modulePath, 'utf8')
            if (quickData.includes('Observable')) {
                log('RxJS module' + moduleShortPath)
                return
            }
        } catch (e) {
            log(e)
        }

        // var Module = require('module');
        // var originalRequire = Module.prototype.require;

        // Module.prototype.require = function (arg) {
        //     //do your thing here
        //     return originalRequire(pathTree[arg]);
        // };
        try {
            // global.window = {Symbol: Symbol};
            // global.self = {};
            publicModule = eval(`
            var pathTree = eval(${JSON.stringify(pathTree)});
            require = (numArg) => {
                return require(pathTree[numArg])
            }
    ${str}`);

            if (publicModule === this || publicModule.global === global) {
                log(chalk.magentaBright('GlobalModule: ' + moduleShortPath))
                result[moduleShortPath] = 'Global module'
            } else if (publicModule.toString && publicModule.toString().includes('[native code]')) {
                log(chalk.cyanBright('Exports native func:' + moduleShortPath + ' Func:' + publicModule.name))
                result[moduleShortPath] = 'Func:' + publicModule.name
            } else if (_.isPlainObject(publicModule)) {
                // even plain object can have funcs
                Object.keys(publicModule).map((key) => {
                    if (_.isFunction(publicModule[key])) {
                        log(chalk.bgRed('Object includes func: ', key))
                    }
                })
                result[moduleShortPath] = JSON.stringify(publicModule)
                log(chalk.redBright(moduleShortPath + ' Interface', JSON.stringify(publicModule)))
            } else if (_.isFunction(publicModule)) {
                log(chalk.blue('Found function!'))
            } else {
                result[moduleShortPath] = 'any'
                log(chalk.greenBright(moduleShortPath, publicModule))
            }

        } catch (e) {
            console.log(chalk.whiteBright("Can't evaluate: " + moduleShortPath))
        }
    });

fse.outputJsonSync(path.resolve(`./${process.env.ASM_PROJECT}`, 'result.json'), result)