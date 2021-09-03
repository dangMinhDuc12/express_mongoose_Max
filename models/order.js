const {  DataTypes } = require('sequelize')

const sequelize = require('../ulti/database')

const Order = sequelize.define('orders', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    }
})

module.exports = Order