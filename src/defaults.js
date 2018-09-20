const path = require('path')
// const filenamify = require('filenamify')
const REAS_CONFIG_FILENAME = 'reas.config.json'
const constValues = {
    REAS_CONFIG_FILENAME
}
const methods = {
    getReasJsonContents(config) {
        return {
            paths: {
                file: config.paths.file
            }
        }
    },
    getReasConfig(paths) {
        const {
            file,
            workspace
        } = paths
        // const storedReasJsonConfig = file
        return {
            paths: {
                file,
                // workspaceDir: 
                configFile: path.join(workspace, REAS_CONFIG_FILENAME),
                fileAbs: path.join(workspace, file),
                workspace,
                debundledSources: path.join(workspace, 'pre-reas',
                    'reas.modules.json'),
                // Data obtained after parsing modules
                preSources: path.resolve(workspace, 'pre-sources'),
                preLengthTree: path.resolve(workspace, `pre-reas/reas.length.json`),
                preRefsTree: path.resolve(workspace, `pre-reas/reas.refs.json`),
                prePathsTree: path.resolve(workspace, `pre-reas/reas.paths.json`),
                // Data obtained after analysys
                sources: path.resolve(workspace, `pre-sources`),
                lengthTree: path.resolve(workspace, `reas/reas.length.json`),
                refsTree: path.resolve(workspace, `reas/reas.refs.json`),
                pathsTree: path.resolve(workspace, `reas/reas.paths.json`),

                vizStaticFilesModule: path.join(__dirname, '../static/viz'),
                vizStaticFilesWorkspace: path.join(workspace, './viz')
            }
        }
    }
}

module.exports = {
    ...constValues,
    ...methods
}


// {
//     "prepack": false,
//     "noOneRefChildren": true,
//     "removeFrameworks": true,
//     "generateLengthTree": false,
//     "generatePathTree": false,
//     "generateReportTree": true,
//     "generateReport": true,
//     "generateRefsTree": false
// }