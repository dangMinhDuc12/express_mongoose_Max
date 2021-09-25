
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
const errController = require('./controllers/error')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '-' + file.originalname )
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}


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
app.use('/images',express.static(path.join(__dirname, 'images')))

app.use(multer({ storage, fileFilter }).single('imageURL') )

//Để sau cookieparser và session
app.use(csrfProtection)
app.use(flash())

app.use(async (req, res, next) => {
    try {
        if (!req.session.user) {
            return next()
        }
        const userLogin = await User.findById(req.session.user._id)
        req.user = userLogin
        next()
    } catch (e) {
        throw new Error(err)
    }

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


//500
app.get('/500', errController.get500)

//404 not found page
app.use(errController.get404)

//Bất đồng bộ thì sẽ gọi next trong catch block thì sẽ lọt vào err middleware này để bắt lỗi, code đồng bộ sẽ gọi throw
app.use((err, req, res, next) => {
    res.redirect('/500')
})


//run server
;(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('connected to db')
        app.listen(process.env.PORT || 3000)
    } catch (e) {
        console.log(e)
    }

})()
