
//Import package
const express = require('express')
const app = express()
const methodOverride = require('method-override')
const User = require('./models/user')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const dotenv = require('dotenv')
const csrf = require('csurf')
const csrfProtection = csrf()
const flash = require('connect-flash')



dotenv.config()

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
})

//import routes
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const path = require("path");


//Config app & use middleware
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(methodOverride('_method'))
app.use(cookieParser())
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

//Để sau cookieparser và session
app.use(csrfProtection)
app.use(flash())

app.use(async (req, res, next) => {
    if (!req.session.user) {
        return next()
    }
    const userLogin = await User.findById(req.session.user._id)
    req.user = userLogin
    next()
})

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken()
    if (req.user) {
        res.locals.userLoginName = req.user.email
    }
    next()
})

app.use('/admin',adminRoutes)
app.use(authRoutes)
app.use(shopRoutes)



//404 not found page
app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page not found'})
})


//run server
;(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('connected to db')
        app.listen(3000)
    } catch (e) {
        console.log(e)
    }

})()
