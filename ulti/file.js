const fs = require('fs')
const path = require('path')

module.exports.deleteFile = (imageURL) => {
    const p = path.join(path.dirname(require.main.filename), imageURL)
    fs.unlink(p, (err) => {
        if (err) {
            throw (err)
        }
    })
}