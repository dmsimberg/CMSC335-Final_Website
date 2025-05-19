const path = require("path");
const express = require('express');
const router = express.Router();
require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const portNumber = 9876;

router.get("/register", (request, response) => {
    const variables = {
        Number: portNumber
    }
    response.render("register", variables);
});

router.post("/confirmation", (request, response) => {
    let n = request.body.name;
    let e = request.body.email;
    let p1 = request.body.plan;
    let cc1 = request.body.cc1;
    let cc2 = request.body.cc1;
    let cc3 = request.body.cc1;
    let cc4 = request.body.cc1;
    let ccString = `${cc1}-${cc2}-${cc3}-${cc4}`;
    
    let p2;
    if (p1 === "Klingon") {
        p2 = 20;
    }
    else if (p1 === "Romulan") {
        p2 = 30;
    }
    else {
        p2 = 50;
    }

    (async () => {
        const databaseName = "CMSC335DB";
        const collectionName = "conventionRegistrations";
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
           await client.connect();
           const database = client.db(databaseName);
           const collection = database.collection(collectionName);
     
           const application = {name: n, email: e, plan: p1, price: p2, end: cc4, creditCardNumber: ccString};
           await collection.insertOne(application);
        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
     })();
    const variables = { name: n, email: e, cc4: cc4, plan: p1, time: `Ticket purchased at ${new Date()}`, Number: portNumber};
    response.render("confirmation", variables);
});;

router.get("/viewRegistration", (request, response) => {
    const variables = {
        Number: portNumber
    }
    response.render("view", variables);
});

router.post("/processViewRegistration", (request, response) => {
    let e = request.body.email;
    (async () => {
        const databaseName = "CMSC335DB";
        const collectionName = "conventionRegistrations";
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
           await client.connect();
           const database = client.db(databaseName);
           const collection = database.collection(collectionName);
           
           const emailRequested = e;
           let filter = { email: emailRequested };
           result = await collection.findOne(filter);

           if (result) {
                const variables = { name: result.name, email: result.email, plan: result.plan, cc4: result.end, time: `Ticket viewed at ${new Date()}`, Number: portNumber};
                response.render("confirmation", variables);
            }
            else {
                const variables = { name: "NONE", email: "NONE", plan: "NONE", cc4: "NONE", time: `Ticket viewed at ${new Date()}`, Number: portNumber};
                response.render("confirmation", variables);
            }

        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
    })();
});

router.get("/cancel", (request, response) => {
    const variables = {
        Number: portNumber
    }
    response.render("cancelInput", variables);
});

router.post("/processCancel", (request, response) => {
    let e = request.body.email;
    (async () => {
        const databaseName = "CMSC335DB";
        const collectionName = "conventionRegistrations";
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
           
            const filter = { email: e }; // filter = {} deletes them all
            const result = await collection.deleteMany(filter);
            const number = result.deletedCount;
            const variables = {
                num: number,
                Number: portNumber
            };
            response.render("cancelOutput", variables);
        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
    })();
});

module.exports = router;