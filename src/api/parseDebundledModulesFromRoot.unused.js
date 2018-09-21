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

function getParents(id) {
    return refs[id].requiredBy
}

function getChildren(id) {
    return refs[id].requires
}

// If a parent module has only 1 parent 
// Then parent's parent is a real parent module
function getRealParentId(id) {
    // ENTRY case (680)
    // For every parent find their parent until all parents point to one node
    // if node is equal to ENTRY -> return module by itself
    const getNextParentsLayer = (nodes) => {
        return _.uniq(nodes.map(getParents))
    }

    const x = (arrOfId, fallback) => {

    }
    // 1. get parents
    // 2. for every parent get their parents [meta-parents]
    // 3. make meta-parents uniq
    // 4. is their len
    const parents = getParents(id)

    if (parents.length === 0) {
        return fallback
    }

    const nextParentsLayer = getNextParentsLayer(parents)
    if (nextParentsLayer.length === 1) {
        return x(, nextParentsLayer[0])
    }
    const nextLayer = ''
    return getNextParentsLayer(id)

    x(id, id)

    const moduleParentId = requiredBy[0]
    const moduleParent = refs[moduleParentId]
    const moduleParentParents = moduleParent.requiredBy
    const moduleParentHasOneParent = moduleParentParents.length === 1
    // const moduleHasMoreThanOneParent =
    return moduleParentHasOneParent ? getRealParentId(moduleParentId) : moduleParentId
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

function detectParentModules(refs) {
    Object.values(refs).forEach((ref) => {
        const {
            requiredBy
        } = ref
        // BUG: 680 is entry, it has no requiredBy
        ref.isParent = !(requiredBy.length === 1)
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
    refs = detectParentModules(getReferencesFromDebundledModules(modules))
    // Helper files
    let pathsTree = {}
    let parentModulesNum = 0
    let parentsRefs = {}

    const SOURCE_DIR = config.paths.preSources
    // Clean dist dir if it exists
    fse.emptyDirSync(SOURCE_DIR)

    const entry = Object.values(refs).find((a) => a.entry)
    const {
        requires,
        requiredBy
    } = entry

    while ()

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

            // only one module requires this module
            if (!isParent) {
                const parentModuleId = getRealParentId(id)
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