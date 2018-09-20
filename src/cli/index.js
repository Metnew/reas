// export 
const execa = require('execa')
const path = require('path')
const Listr = require('listr')
const fs = require('fs')
const fse = require('fs-extra')
const _ = require('lodash')
const debundle = require('../api/debundle')
const parseDebundledModules = require('../api/parseDebundledModules')
const {
    getReasJsonContents,
    REAS_CONFIG_FILENAME
} = require('../defaults')

// конфиг для работы тасков
// ctx.REAS = {}
// конфиг воркспейса
// ctx.REAS_WORKSPACE_CONFIG

const tasks = new Listr([{
        title: `Generating ${REAS_CONFIG_FILENAME}`,
        task: (ctx) => {
            const config = getReasJsonContents(ctx)
            fse.writeJsonSync(ctx.paths.configFile, config, {
                spaces: '\t'
            })
        }
    },
    {
        title: 'Parsing file using webpack-unpack',
        task: (ctx, task) => {
            ctx.modules = debundle(ctx)
            task.title = `${ctx.modules.length} modules parsed`
        }
    },
    {
        title: 'Dissecting parsed modules',
        task: (ctx, task) => {
            const {
                parentModulesNum
            } = parseDebundledModules(ctx)
            task.title = `${parentModulesNum} parent modules found`
        }
    },
    // {
    //     title: 'Parsing file interfaces',
    //     task: (ctx, task) => {}
    // },
    // {
    //     title: 'Detecting frameworks',
    //     task: () => {
    //         // console.log('React detected! Replacing modules 150-188 with direct reference.')
    //     }
    // },
    // {
    //     title: 'Writing beautified sources into /sources',
    //     task: () => {}
    // },
    // {
    //     title: 'Writing "Prepack"ed source modules into /sources-prepacked',
    //     task: () => {}
    // }
]);


module.exports.startFileAnalysys = function (config) {
    tasks.run(config).catch(err => {
        console.error(err);
    });
}