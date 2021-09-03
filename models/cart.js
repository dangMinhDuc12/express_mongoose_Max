const {  DataTypes } = require('sequelize')

const sequelize = require('../ulti/database')

const Cart = sequelize.define('carts', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = Cart