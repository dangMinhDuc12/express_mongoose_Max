const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')
const { check, body } = require('express-validator')

const User = require('../models/user')

router.get('/login', authController.getLogin)

router.post('/login',
    check('email')
        .isEmail()
        .withMessage('Please enter valid email')
        .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters').isLength({ min:5 }).isAlphanumeric().trim()

    ,authController.postLogin)

router.post('/logout', authController.logout)

router.get('/signup', authController.signup)

router.post('/signup',
    check('email').
    isEmail().
    withMessage('Please enter valid email').custom( async (value, { req }) => {
        const userFind = await User.findOne( { email: value })
        if (userFind) {
            return Promise.reject('E-mail already in use')
        }
    }).normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters').isLength({ min:5 }).isAlphanumeric().trim(),
    body('confirmPassword').trim().custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password have to match')
        }
        return true
    })
    , authController.postSignup)

router.get('/reset', authController.getReset)

router.post('/reset', authController.postReset)

router.get('/reset/:resetToken', authController.getNewPassword)

router.post('/new-password', authController.postNewPassword)

module.exports = router