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
let entryModule

function getParents(id) {
    // console.log(id)
    return refs[id].requiredBy
}

function getChildren(id) {
    return refs[id].requires
}

// If a parent module has only 1 parent 
// Then parent's parent is a real parent module

// 1. get parents
// 2. for every parent get their parents [meta-parents]
// 3. make meta-parents uniq
// 4. if their len = 0 -> entry found, return last found parent module
// 5. if their len == 1 => parent module detected -> call again with fallback as this module
// 6. if their len > 1, call again
function getRealParentId(id) {

    const getNextParentsLayer = (nodes) => {
        // get parents for every node
        // then flatten
        // then select uniq
        return _.uniq(_.flatten(nodes.map(getParents)))
    }

    const getParentLayer = (parents, fallback) => {
        if (parents.length === 0) {
            // ENTRY found
            return fallback
        } else if (parents.length === 1) {
            console.log('Real parent', fallback, parents)
            // Parent detected
            return getRealParentId(parents[0])
        } else if (parents.includes(entryModule)) {
            console.log('Entry in parents, stop traverse', fallback, parents)
            // Module includes entry
            // BUG: hardcode!
            return fallback
        }
        const nextParents = getNextParentsLayer(parents)
        return getParentLayer(nextParents, fallback)
    }

    const parents = getParents(id)
    return getParentLayer(parents, id)
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
        // Silently set entryModule
        if (chunk.entry) {
            entryModule = chunk.id
        }
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
    let parentsRefs = {}

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
        const {
            requires,
            requiredBy,
            isParent
        } = refs[id]

        let modulePath = ''
        const parentModule = getRealParentId(id)

        // child module found
        if (parentModule != id) {
            const parentModuleDir = `${SOURCE_DIR}/${parentModule}`
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
            parentsRefs[id] = {
                requires: _.uniq(requires.map((moduleId) => getRealParentId(moduleId))).filter((a) => a != id),
                requiredBy: _.uniq(requiredBy.map((moduleId) => getRealParentId(moduleId)))
            }
        }
        // append module to pathTree
        pathsTree[id] = modulePath
    })

    fse.writeJsonSync(paths.preRefsTree, refs, {
        spaces: '\t'
    })
    fse.writeJsonSync(paths.parentRefsTree, parentsRefs, {
        spaces: '\t'
    })
    fse.writeJsonSync(paths.prePathsTree, pathsTree, {
        spaces: '\t'
    })

    return {
        parentModulesNum
    }
}