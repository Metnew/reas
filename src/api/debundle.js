const execa = require('execa')
const fse = require('fs-extra')
const path = require('path')

module.exports = function (config) {
    const {
        workspace,
        file,
    } = config.paths
    const filePath = path.join(workspace, file)
    const {
        stdout: modules
    } = execa.shellSync(`webpack-unpack < ${filePath}`)
    const modulesJson = JSON.parse(modules)
    const modulesJsonPath = config.paths.debundledSources
    fse.outputJsonSync(modulesJsonPath, modulesJson)
    return modulesJson
}