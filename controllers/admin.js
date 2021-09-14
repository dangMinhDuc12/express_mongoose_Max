const Product = require("../models/product");
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')
const fileHelper = require('../ulti/file')

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true,
        editing: false,
        hasError: false,
        isAuth: req.session.isAuth,
        errMsg: null,
        validErrors: []
    })
}
exports.getEditProduct = async (req, res, next) => {
    const editMode = req.query.edit
    if (!editMode) return res.redirect('/')
    const { productId } = req.params

    //Relationship
    const product = await Product.findById(productId)

        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            prod: product,
            isAuth: req.session.isAuth,
            hasError: false,
            errMsg: null,
            validErrors: []
        })
}



exports.addProduct = async (req, res, next) => {
    const errors = validationResult(req)
    const { title, description, price } = req.body
    const imageURL = req.file?.path
    if (!imageURL) {
        return  res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            prod: {
                title,
                description,
                price
            },
            isAuth: req.session.isAuth,
            errMsg: 'Attached file is not an image',
            validErrors: errors.array()
        })
    }
    if (!errors.isEmpty()) {
        return  res.render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            prod: {
                title,
                description,
                price
            },
            isAuth: req.session.isAuth,
            errMsg: errors.array()[0].msg,
            validErrors: errors.array()
        })
    }
    try {
        const product = new Product({ title, imageURL, description, price, userId: req.user._id })
        await product.save()
        res.redirect('/')
    } catch (e) {
        const error = new Error(e)
        error.httpStatusCode = 500
        return next(error)
    }

}

exports.getProducts = async (req, res, next) => {

    //relationship
    const products = await Product.find({ userId: req.user._id })
        res.render('admin/products', {
            prods: products,
            pageTitle: 'Admin Products',
            path: '/admin/products',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true,
            isAuth: req.session.isAuth
        })
}
//
exports.updateProduct = async (req, res, next) => {
    const { productId } = req.params
    const errors = validationResult(req)
    const { title, description, price } = req.body
    const imageURL = req.file?.path
    if (!errors.isEmpty()) {
        return  res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            prod: {
                title,
                description,
                price,
                _id: productId
            },
            isAuth: req.session.isAuth,
            errMsg: errors.array()[0].msg,
            validErrors: errors.array()
        })
    }
    if (imageURL) {
        const productFind = await Product.findById(productId)
        fileHelper.deleteFile(productFind.imageURL)
        await Product.updateOne({ _id: productId, userId: req.user._id }, { title, imageURL, description, price })
    } else {
        await Product.updateOne({ _id: productId, userId: req.user._id }, { title, description, price })
    }

    res.redirect('/')
}
//
exports.deleteProduct = async (req, res, next) => {
    const { productId } = req.params
    const productFind = await Product.findById(productId)
    fileHelper.deleteFile(productFind.imageURL)
    await Product.deleteOne({ _id: productId, userId: req.user._id })
    res.redirect('/admin/products')
}