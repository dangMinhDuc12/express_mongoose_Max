const User = require('../models/user')
const bcrypt = require('bcryptjs')

module.exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuth: false
    })
}

module.exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body
    const userLogin = await User.findOne({ email })
    if (!userLogin) {
        return res.redirect('/login')
    }
    const checkPassword = await bcrypt.compare(password, userLogin.password)
    if(!checkPassword) {
        return res.redirect('/login')
    }
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

module.exports.signup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuth: false
    })
}

module.exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    const checkUser = await User.findOne({ email })
    if (checkUser) {
        return res.redirect('/signup')
    }
    const hashPassword = await bcrypt.hash(password, 12)
    const createUser = new User({
        email,
        password: hashPassword,
        cart: {
            items: []
        }
    })
    await createUser.save()
    res.redirect('/login')
}