const User = require('../models/user')
const bcrypt = require('bcryptjs')
const mailer = require('../ulti/mailer')
const crypto = require('crypto')
const { validationResult } = require('express-validator')

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
        errMsg,
        oldInput: {
            email: '',
            password: ''
        },
        validErrors: []
    })
}

module.exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errMsg = errors.array()[0].msg
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuth: false,
            errMsg,
            oldInput: {
                email,
                password
            },
            validErrors: errors.array()
        })
    }
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
        errMsg,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validErrors: []
    })
}

module.exports.postSignup = async (req, res, next) => {
    const { email, password, confirmPassword } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errMsg = errors.array()[0].msg
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            isAuth: false,
            errMsg,
            oldInput: {
                email,
                password,
                confirmPassword
            },
            validErrors: errors.array()
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
    await mailer.sendMail(email, 'Signup Success', '<h1>You successfully signed up</h1>')
    res.redirect('/login')
}

module.exports.getReset = (req, res, next) => {
    const messages = req.flash('errMsg')
    let errMsg = null
    if (messages.length) {
        errMsg = messages[0]
    } else {
        errMsg = null
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        isAuth: false,
        errMsg
    })

}

module.exports.postReset = async (req, res, next) => {
    const { email } = req.body
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            console.log(err)
            return res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        const userWithEmail = await User.findOne({ email })
        if (!userWithEmail) {
            req.flash('errMsg', 'User does not exist')
            return req.session.save((err) => {
                res.redirect('/reset')
            })
        }
        userWithEmail.resetToken = token
        userWithEmail.resetTokenExpiration = Date.now() + 3600000
        await userWithEmail.save()
        await mailer.sendMail(email, 'Password Reset', `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
        `)
        res.redirect('/')
    })

}

module.exports.getNewPassword = async (req, res, next) => {
    const { resetToken } = req.params
    const userWithToken = await User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } })
    if (!userWithToken) {
        req.flash('errMsg', 'Cannot find user')
        return req.session.save((err) => {
            res.redirect('/reset')
        })
    }
    const messages = req.flash('errMsg')
    let errMsg = null
    if (messages.length) {
        errMsg = messages[0]
    } else {
        errMsg = null
    }
    res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        isAuth: false,
        errMsg,
        userId: userWithToken._id.toString(),
        resetToken
    })
}

module.exports.postNewPassword = async (req, res, next) => {
    const { userId, resetToken, password } = req.body
    const newHashPassword = await bcrypt.hash(password, 12)
    const userWithNewPw = await User.findOne({ _id: userId, resetToken, resetTokenExpiration: { $gt: Date.now() } })
    userWithNewPw.password = newHashPassword
    userWithNewPw.resetToken = undefined
    userWithNewPw.resetTokenExpiration = undefined
    await userWithNewPw.save()

    res.redirect('/login')
}