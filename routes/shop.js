const express = require('express')
const router = express.Router()
const shopController = require('../controllers/shop')
const isAuth = require('../middleware/isAuth')


//  / => GET
router.get('/', shopController.getIndex)
//
router.get('/products', shopController.getProducts)
//
router.get('/products/:productId', shopController.getProduct)
//
router.get('/cart', isAuth, shopController.getCart)
// //
router.post('/cart', isAuth,shopController.postCart)
// //
router.delete('/cart-delete-item/:productId',isAuth, shopController.deleteCartProduct)
// //
router.get('/orders', isAuth,shopController.getOrders)
// //
router.post('/create-order', isAuth,shopController.postOrders)

router.get('/order/:orderId', isAuth, shopController.getInvoice)
// //
// router.get('/checkout', shopController.getCheckout)

module.exports = router