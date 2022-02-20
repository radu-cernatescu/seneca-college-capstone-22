const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const argon2 = require('argon2');
const bodyParser = require('body-parser');

const uri = "mongodb+srv://dbUser:ejmpFQ2aFQzMaJpI@userdb.srfax.mongodb.net/UserDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/* Initialize Express backend */
const app = express();
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


/* USERS */

/*
*/
app.post("/api/user-login", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("logins");
        await collection.findOne({
            email: {$eq: req.body.email}
        }).then(async user => {
            if (user) {
                if (await argon2.verify(user.password, req.body.password)) {
                    res.send({message: "SUCCESS", data: user});
                }
                else{
                    res.send({message:"FAILED"});
                }
            }
            else{
                res.send({message:"FAILED"});
            }
        }).catch(err => {
            res.send({message:"FAILED"});
        });
        
    }).catch(err => {/*console.log(err)*/});
    client.close();
});

/*
*/
app.post("/api/sign-up", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("logins");
        await collection.findOne({
            email: {$eq: req.body.email}
        }).then(async user => {
            if (user) {
                res.send({message:"EXISTING USER"});
            }
            else {
                const user = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                    password: await argon2.hash(req.body.password)
                }
                await collection.insertOne(user).then(() => {
                    res.send({message: "SUCCESS"});
                }).catch(err => {
                    res.send({message: "FAILED"});
                });
            }
        }).catch(() => {
            res.send({message:"FAILED"});
        });
    }).catch(err => {/*console.log(err)*/});
    client.close();
});

/* ITEMS/LISTINGS */

/*
*/
app.get("/api/items", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("items");
        
        const items = await collection.find().toArray();
        if (items) {
            res.send({ message: "SUCCESS", data: items });
        }
        else {
            res.send({ message: "FAILED" });
        }
        
    }).catch(err => {/*console.log(err)*/});
    client.close();
});

/*
*/
app.get("/api/item", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("items");
        
        const item = await collection.findOne({
            title: {$eq: req.query.title}
        });
        if (item) {
            res.send({ message: "SUCCESS", data: item });
        }
        else {
            res.send({ message: "FAILED" });
        }
    }).catch(err => {/*console.log(err)*/});
    client.close();
});

/*
*/
app.post("/api/add-item", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("items");
        await collection.findOne({
            userId: {$eq: req.body.user._id},
            title: {$eq: req.body.item.title}
        }).then(async item => {
            if (item) {
                res.send({message:"EXISTING ITEM WITH SAME TITLE"});
            }
            else {
                req.body.item.userId = req.body.user._id;
                await collection.insertOne(req.body.item).then(() => {
                    res.send({message: "SUCCESS"});
                }).catch(() => {res.send({message: "FAILED"})});
            }
        }).catch(() => {
            res.send({message:"FAILED"});
        });
    }).catch(err => {/*console.log(err)*/});
    client.close();
});

/*
*/
app.post("/api/update-item", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("items");
        let items = await collection.find({
            userId: {$eq: req.body.user._id},
            title: {$eq: req.body.newitem.title}
        }).toArray();
        if (items.length > 1) {
            res.send({message:"EXISTING ITEM WITH SAME TITLE"});
        }
        else {
            let myquery = { userId: req.body.user._id, title: req.body.olditem.title };
            let newvalues = { $set: {} };
            if (req.body.olditem.images[0] != req.body.newitem.images[0]) {
                newvalues.$set['images'] = req.body.newitem.images;
            }
            if (req.body.olditem.title != req.body.newitem.title) {
                newvalues.$set['title'] = req.body.newitem.title
            }
            if (req.body.olditem.description != req.body.newitem.description) {
                newvalues.$set['description'] = req.body.newitem.description;
            }
            if (req.body.olditem.price != req.body.newitem.price) {
                newvalues.$set['price'] = req.body.newitem.price;
            }
            newvalues.$set['parameters'] = req.body.newitem.parameters;
            newvalues.$set['colors'] = req.body.newitem.colors;
            newvalues.$set['sizes'] = req.body.newitem.sizes;
            
            await collection.updateOne(myquery, newvalues).then(() => {
                res.send({message: "SUCCESS"});
            }).catch(() => {res.send({message: "FAILED"})});
        }        
    }).catch(err => {/*console.log(err)*/});
});

/*
*/
app.post("/api/remove-item", async (req, res) => {
    await client.connect().then(async () => {
        const collection = client.db("users").collection("items");
        let myquery = { userId: req.body.user._id, title: req.body.item.title };
        await collection.deleteOne(myquery).then(() => {
            res.send({message: "SUCCESS"});
        }).catch(() => {res.send({message: "FAILED"})});
    });
    client.close();
});

/* SHOPPING CART */

/*
*/
app.post("/api/add-shopping-item", async (req, res) => {

});

/*
*/
app.post("/api/remove-shopping-item", async (req, res) => {

});

/*
*/
app.post("/api/clear-shopping-cart", async (req, res) => {

});

/* Allows express to serve files from this directory
*/
app.use(express.static('dist/Group15'));

/* We are using the express backend to serve the index.html
   for our Angular app
*/
app.get('/*', function(req, res) {
    res.sendFile('index.html', {root: 'dist/Group15'});
});

/*
*/
app.listen(process.env.PORT || 80);
