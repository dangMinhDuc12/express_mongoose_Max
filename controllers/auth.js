const User = require('../models/user')
const bcrypt = require('bcryptjs')
const mailer = require('../ulti/mailer')

module.exports.getLogin = (req, res, next) => {
    const messages = req.flash('errMsg')
    let errMsg = null
    if (messages.length) {
        errMsg = messages[0]
    } else {
        errMsg = null
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuth: false,
        errMsg
    })
}

module.exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body
    const userLogin = await User.findOne({ email })
    if (!userLogin) {
        req.flash('errMsg', 'Invalid email')
        return req.session.save((err) => {
             res.redirect('/login')
        })

    }
    const checkPassword = await bcrypt.compare(password, userLogin.password)
    if(!checkPassword) {
        req.flash('errMsg', 'Invalid password')
        return req.session.save((err) => {
             res.redirect('/login')
        })
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
    const messages = req.flash('errMsg')
    let errMsg = null
    if (messages.length) {
        errMsg = messages[0]
    } else {
        errMsg = null
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        isAuth: false,
        errMsg
    })
}

module.exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    const checkUser = await User.findOne({ email })
    if (checkUser) {
        req.flash('errMsg', 'User existed')
        return req.session.save((err) => {
             res.redirect('/signup')
        })
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
    await mailer.sendMail('dangminhduca3@gmail.com', 'Signup Success', '<h1>You successfully signed up</h1>')
    res.redirect('/login')
}