const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/isAuth')
const { body } = require('express-validator')

router.use(isAuth)
//  /admin/add-product => GET
router.get('/add-product', adminController.getAddProduct)
//
// // /admin/add-product => POST
router.post('/add-product',
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat().trim(),
    body('description').isLength({ min: 5, max: 500 }).trim()
    ,adminController.addProduct)
//
// // /admin/products => GET
router.get('/products', adminController.getProducts)
// //
router.get('/edit-product/:productId', adminController.getEditProduct)
// //
router.delete('/delete-product/:productId', adminController.deleteProduct)
// //
router.put('/edit-product/:productId',
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat().trim(),
    body('description').isLength({ min: 5, max: 500 }).trim(), adminController.updateProduct)



module.exports = router