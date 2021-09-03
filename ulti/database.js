const { MongoClient } = require('mongodb');

let db = null;
async function connectDb() {
    try {
        const client = await MongoClient.connect('mongodb+srv://Duc_Dang:duc12121997@cluster0.sg8nb.mongodb.net/shop?retryWrites=true&w=majority')
        db = client.db()
        return client
    } catch (e) {
        console.log(e)
        throw e
    }
}

function getDb() {
    if(db) {
        return db
    }
    throw 'No DB found'
}


module.exports.mongoConnect = connectDb
module.exports.getDb = getDb