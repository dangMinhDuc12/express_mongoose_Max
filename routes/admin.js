const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')

//  /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct)
//
// // /admin/add-product => POST
router.post('/add-product', adminController.addProduct)
//
// // /admin/products => GET
router.get('/products', adminController.getProducts)
// //
router.get('/edit-product/:productId', adminController.getEditProduct)
// //
router.delete('/delete-product/:productId', adminController.deleteProduct)
// //
router.put('/edit-product/:productId', adminController.updateProduct)



module.exports = router