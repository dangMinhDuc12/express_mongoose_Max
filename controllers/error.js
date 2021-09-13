module.exports.get404 = (req, res, next) => {
    res.status(404).render('error', {
        pageTitle: 'Page not found' ,
        path: '/404',
        isAuth: req.session.isAuth,
        statusCode: 404,
        message: 'Page not found' })
}

module.exports.get500 = (req,res,next) => {
    res.status(500).render('error', {
        statusCode: 500,
        path: '/500',
        message: 'Database has an error',
        isAuth: req.session.isAuth,
        pageTitle: 'Error'
    })
}
