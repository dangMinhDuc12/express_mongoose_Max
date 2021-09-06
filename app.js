const express = require('express')
const app = express()
const methodOverride = require('method-override')
const User = require('./models/user')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const dotenv = require('dotenv')
dotenv.config()

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
})

//Routes
const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const path = require("path");


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



app.use('/admin',adminRoutes)
app.use(authRoutes)
app.use(shopRoutes)



//404 not found page
app.use((req, res, next) => {
    res.status(404).render('404', {pageTitle: 'Page not found'})
})

;(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('connected to db')
        const userFind = await User.findOne()
        if(!userFind) {
            const userCreate = new User({
                name: 'Duc Dang',
                email: 'ducdang@gmail.com',
                cart: {
                    items: []
                }
            })
            await userCreate.save()
        }
        app.listen(3000)
    } catch (e) {
        console.log(e)
    }

})()
