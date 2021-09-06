const User = require('../models/user')


module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuth: false
    })
}

module.exports.postLogin = async (req, res, next) => {
    const userLogin = await User.findById('61360fb626754ca3b58831ad')
    req.session.isAuth = true
    req.session.user = userLogin

    //Gọi phương thức này khi chuyển hướng để router path này có thể bắt đc session đó
    req.session.save(err => {
        res.redirect('/')
    })
}

module.exports.logout = (req, res, next) => {
    req.session.destroy((err => {
        res.redirect('/')
    }))
}