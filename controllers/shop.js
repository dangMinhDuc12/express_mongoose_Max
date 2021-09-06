const Product = require('../models/product')
const Order = require('../models/order')

exports.getProducts = async (req, res, next) => {
    //sendFile: gửi 1 file đến đường dẫn bên trong hàm, dirname: folder hiện tại
    const products = await Product.find({})

         res.render('shop/product-list', {
             prods: products,
             pageTitle: 'Shop',
             path: '/products',
             hasProducts: products.length > 0,
             activeShop: true,
             productCSS: true,
             isAuth: req.session.isAuth
         })

}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId
    const product = await Product.findById(productId)
    res.render('shop/product-detail', {
        prod: product,
        pageTitle: product.title,
        path: '/products',
        isAuth: req.session.isAuth
    })
}


exports.getIndex = async (req, res, next) => {
    console.log('index', req.session.isAuth)
    const products = await Product.find({})
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
            isAuth: req.session.isAuth
        })

}

exports.getCart = async (req, res, next) => {

    const userWithProduct = await req.user.populate('cart.items.productId')
    const cartProducts = userWithProduct.cart.items
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts,
        isAuth: req.session.isAuth
    })
}

exports.postCart = async (req, res, next) => {
    const productId = req.body.productId
    const product = await Product.findById(productId)
    await req.user.addToCart(product)
    res.redirect('/cart')
}
//
exports.deleteCartProduct = async (req, res, next) => {
    const { productId } = req.params
    await req.user.deleteProductFromCart(productId)
    res.redirect('/cart')
}

exports.getOrders = async (req, res, next) => {
    //Lệnh include: đưa các association cần vào xong query
    const orders = await Order.find({ userId: req.user._id })
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuth: req.session.isAuth
    })
}
//
exports.postOrders = async (req, res, next) => {
    const userWithCart = await req.user.populate('cart.items.productId')
    const products = userWithCart.cart.items.map(item => ({
        product: { ... item.productId } ,
        quantity: item.quantity
    }))
    const order = new Order({
        products,
        userId: req.user._id
    })
    await order.save()
    await req.user.clearCart()
    res.redirect('/orders')
}