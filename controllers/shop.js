const Product = require('../models/product')
// const Cart = require('../models/cartSQL')
// const Order = require('../models/orderSQL')

exports.getProducts = async (req, res, next) => {
    //sendFile: gửi 1 file đến đường dẫn bên trong hàm, dirname: folder hiện tại
    const products = await Product.find({})

         res.render('shop/product-list', {
             prods: products,
             pageTitle: 'Shop',
             path: '/products',
             hasProducts: products.length > 0,
             activeShop: true,
             productCSS: true
         })

}

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId
    const product = await Product.findById(productId)
    res.render('shop/product-detail', {
        prod: product,
        pageTitle: product.title,
        path: '/products'
    })
}


exports.getIndex = async (req, res, next) => {
    const products = await Product.find({})
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
        })

}

exports.getCart = async (req, res, next) => {

    const cartProducts = await req.user.getCart()
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: cartProducts
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

//
// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout', {
//         path: '/checkout',
//         pageTitle: 'Checkout'
//     })
// }
//
exports.getOrders = async (req, res, next) => {
    //Lệnh include: đưa các association cần vào xong query
    const orders = await req.user.getOrders()
    res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
    })
}
//
exports.postOrders = async (req, res, next) => {
    await req.user.addOrders()
    res.redirect('/orders')
}