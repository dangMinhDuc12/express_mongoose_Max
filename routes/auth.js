const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth')

router.get('/login', authController.getLogin)

router.post('/login', authController.postLogin)

router.post('/logout', authController.logout)

router.get('/signup', authController.signup)

router.post('/signup', authController.postSignup)


module.exports = router