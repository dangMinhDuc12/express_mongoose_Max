const path = require('path')

//Lấy ra đường dẫn file root của project
module.exports = path.dirname(require.main.filename)