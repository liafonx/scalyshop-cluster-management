db = db.getSiblingDB('scalyDB');

db.createUser({
    user: "scaly",
    pwd: "scalypw",
    roles: [
        { role: "readWrite", db: "scalyDB" }
    ]
});

db.createCollection('favorites');
db.createCollection('orders');
db.createCollection('products');

sh.enableSharding("scalyDB");

sh.shardCollection("scalyDB.favorites", {"productId": "hashed"});
sh.shardCollection("scalyDB.orders", {orderRef: "hashed"});
sh.shardCollection("scalyDB.products", {name: "hashed"});