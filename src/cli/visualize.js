const fse = require('fs-extra')
// const serve = require('serve-handler')
// const http = require("http")
const opn = require('opn')
// const getPort = require('get-port')

module.exports = async function viz(config) {
    const preRefsTreePath = config.REAS.paths.preRefsTree
    const preRefsTreeExists = fs.existSync(preRefsTreePath)
    if (!preRefsTreeExists) {
        throw new Error('Run "reas run <file>", before vizualizing results')
    }
    const preRefsTree = require(preRefsTreePath)

    const vizStaticPath = path.resolve(__dirname, '../static/viz/index.html')

    opn(`file://` + vizStaticPath);
}