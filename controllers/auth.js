module.exports.getLogin = (req, res, next) => {
    // const isAuth = req.cookies.isAuth
    console.log(req.session.isAuth)
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuth: false
    })
}

module.exports.postLogin = (req, res, next) => {
    req.session.isAuth = true
    res.redirect('/')
}