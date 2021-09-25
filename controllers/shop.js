const Product = require('../models/product')
const Order = require('../models/order')
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const ITEM_PER_PAGE = 1
const stripe = require('stripe')(process.env.STRIPE_KEY)

exports.getProducts = async (req, res, next) => {
    //sendFile: gửi 1 file đến đường dẫn bên trong hàm, dirname: folder hiện tại
    const  page  = Number(req.query.page) || 1
    const numProducts = await Product.find().estimatedDocumentCount()
    const products = await Product.find({}).skip((page - 1) * ITEM_PER_PAGE).limit(ITEM_PER_PAGE)

         res.render('shop/product-list', {
             prods: products,
             pageTitle: 'Shop',
             path: '/products',
             hasProducts: products.length > 0,
             activeShop: true,
             productCSS: true,
             isAuth: req.session.isAuth,
             currentPage: page,
             hasNextPage: page * ITEM_PER_PAGE < numProducts,
             hasPrePage: page > 1,
             nextPage: page + 1,
             prePage: page - 1,
             lastPage: Math.ceil(numProducts / ITEM_PER_PAGE)
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
    const  page  = Number(req.query.page) || 1
    const numProducts = await Product.find().estimatedDocumentCount()
    const products = await Product.find({}).skip((page - 1) * ITEM_PER_PAGE).limit(ITEM_PER_PAGE)
        res.render('shop/index', {
            prods: products,
            pageTitle: 'Shop',
            path: '/',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
            isAuth: req.session.isAuth,
            currentPage: page,
            hasNextPage: page * ITEM_PER_PAGE < numProducts,
            hasPrePage: page > 1,
            nextPage: page + 1,
            prePage: page - 1,
            lastPage: Math.ceil(numProducts / ITEM_PER_PAGE)
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

module.exports.getInvoice = async (req, res, next) => {
    const { orderId } = req.params
    const invoiceName = `invoice-${orderId}.pdf`
    const invoicePath = path.join(path.dirname(require.main.filename), 'data', 'invoices', invoiceName)
    const orderFind = await Order.findById(orderId)
    // if (!orderFind) {
    //     return next(new Error('No order found'))
    // }
    // if (orderFind.userId.toString() !== req.user._id.toString()) {
    //     return next(new Error('Unauthorized'))
    // }
    // fs.readFile(invoicePath, (err, data) => {
    //     if (err) {
    //         return next(err)
    //     }
    //     res.setHeader('Content-Type', 'application/pdf')
    //     res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`)
    //     res.send(data)
    // })

    //Tạo ra 1 page stream để stream file, preload data, chưa cho download vội
    // const file = fs.createReadStream(invoicePath)
    // res.setHeader('Content-Type', 'application/pdf')
    // res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`)
    // file.pipe(res)

    //Tạo file pdf với pdf kit
    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename=${invoiceName}`)
    doc.pipe(fs.createWriteStream(invoicePath))
    doc.pipe(res)
    doc.fontSize(26).text('Invoice', {
        underline: true
    })
    doc.text('------------------------------')
    let totalPrice = 0
    orderFind.products.forEach(prod => {
        totalPrice +=  prod.quantity * prod.product.price
        doc.fontSize(14).text(`${prod.product.title} - ${prod.quantity} x ${prod.product.price} mil €`)
    })
    doc.text('------------------------------')
    doc.fontSize(20).text(`Total Price: ${totalPrice} mil €`)
    doc.end()
}

module.exports.getCheckout = async (req, res, next) => {
    const userWithProduct = await req.user.populate('cart.items.productId')
    const cartProducts = userWithProduct.cart.items
    const totalSum = cartProducts.reduce((acc, prod) => {
            acc += prod.quantity * prod.productId.price
            return acc
    }, 0)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: cartProducts.map(p => ({
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price,
            currency: 'usd',
            quantity: p.quantity
        })),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
    })
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Chechout',
        products: cartProducts,
        isAuth: req.session.isAuth,
        totalSum,
        sessionId: session.id
    })
}