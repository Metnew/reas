const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const execa = require('execa')
const _ = require('lodash')
const {
    prepack,
    prepackFileSync
} = require('prepack')
let refs = {}

// If a parent module has only 1 parent 
// Then parent's parent is a real parent module
function getRealParent(id) {
    const moduleInfo = refs[id]
    const requiredBy = moduleInfo.requiredBy
    const moduleParentId = requiredBy[0]
    const moduleParent = refs[moduleParentId]
    const moduleParentParents = moduleParent.requiredBy
    const moduleParentHasOneParent = moduleParentParents.length === 1
    return moduleParentHasOneParent ? getRealParent(moduleParentId) : moduleParent
}

function getReferencesFromDebundledModules(modules) {

    let refs = modules.map((chunk) => ({
        [chunk.id]: {
            requires: [],
            requiredBy: [],
            entry: chunk.entry
        }
    })).reduce((a, b) => ({ ...a,
        ...b
    }), {})

    modules.forEach((chunk) => {
        Object.values(chunk.deps).forEach((depId) => {
            refs[chunk.id].requires.push(depId)
            refs[depId].requiredBy.push(chunk.id)
        })
    })

    return refs
}

module.exports = function (config) {
    const {
        // modules extracted from the analyzed file
        modules,
        // configuration paths
        paths
    } = config
    refs = getReferencesFromDebundledModules(modules)

    // Helper files
    let pathsTree = {}
    let parentModulesNum = 0

    const SOURCE_DIR = config.paths.preSources
    // Clean dist dir if it exists
    fse.emptyDirSync(SOURCE_DIR)

    // Start analyzing every module
    modules.forEach(({
        id,
        source,
        entry
    }) => {
        // Get info for current module id
        const thisModule = refs[id]
        const {
            requires,
            requiredBy
        } = thisModule

        let modulePath = ''

        // only one module requires this module
        if (requiredBy.length === 1) {

            const parentModuleId = getRealParent(id).id
            const parentModuleDir = `${SOURCE_DIR}/${parentModuleId}`
            modulePath = `${parentModuleDir}/${id}.js`

            fse.ensureDirSync(parentModuleDir)
            fse.outputFileSync(modulePath, source)
        } else {

            parentModulesNum++;
            const moduleDir = `${SOURCE_DIR}/${id}`
            modulePath = `${moduleDir}/index.js`

            // если на модуль больше 1 ссылки:
            // 1. сделать папку
            // 2. записать как index.js
            // 3. записать инфу о детях
            fse.ensureDirSync(moduleDir)
            fse.outputFileSync(modulePath, source)
            // parentPathsTree[id] = 
        }
        // append module to pathTree
        pathsTree[id] = modulePath
    })

    fse.writeJsonSync(paths.preRefsTree, refs, {
        spaces: '\t'
    })
    fse.writeJsonSync(paths.prePathsTree, pathsTree, {
        spaces: '\t'
    })

    return {
        parentModulesNum
    }
}



// else if (fromLinks.length > 1) {
//     // если от модуля больше 1 ссылки - сделать для него папку
//     let exist = fs.existsSync(`./${SOURCE_DIR}/${id}`)

//     if (!exist) {
//         exec(`mkdir -p ./${SOURCE_DIR}/${id}`)
//     }

//     fs.writeFileSync(`./${SOURCE_DIR}/${id}/index.js`, source, 'utf8')
// }

// fs.writeFile('./result.json', JSON.stringify(arr), 'utf8', (err) => {
//     if (err) throw err
// })