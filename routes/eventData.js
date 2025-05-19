const path = require("path");
const express = require('express');
const router = express.Router();
require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const publicPath = path.resolve(__dirname, "../templates/sensory");
router.use(express.static(publicPath));
const portNumber = 9876;

router.get("/viewData", (request, response) => {
    let table = "";

    (async () => {
        const databaseName = "CMSC335DB";
        const collectionName = "conventionRegistrations";
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);

            let filter = {};
            const cursor = collection.find(filter);
            result = await cursor.toArray();

            if (result) {
                let table = `<table style="border: 1px solid"><thead><tr><th style="border: 1px solid"><strong>Name</strong></th><th style="border: 1px solid"><strong>Email</strong></th>`;
                table += `<th style="border: 1px solid"><strong>Plan</strong></th><th style="border: 1px solid"><strong>Amount Paid</strong></th><th style="border: 1px solid"><strong>Credit Card #</strong></th></tr></thead><tbody>`;
                if (result.length == 0) {
                    table += `<tr><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td></tr></tbody></table>`;
                }
                else {
                    result.forEach(element => table += `<tr><td style="border: 1px solid">${element.name}</td><td style="border: 1px solid">${element.email}</td><td style="border: 1px solid">${element.plan}</td>
                        <td style="border: 1px solid">${element.price}</td><td style="border: 1px solid">XXXX-XXXX-XXXX-${element.end}</td></tr>`);
                }
                table += `</tbody></table>`;
                const variables = {
                    Number: portNumber,
                    Table: table
                }
                response.render("individuals", variables);
            }
        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
    })();
});

router.get("/viewTotals", (request, response) => {
    let table = "";
    let counter = 0;
    let totalPrice = 0;
    let numVulcan = 0;
    let numRomulan = 0;
    let numKlingon = 0;

    (async () => {
        const databaseName = "CMSC335DB";
        const collectionName = "conventionRegistrations";
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);

            let filter = {};
            const cursor = collection.find(filter);
            result = await cursor.toArray();

            if (result) {
                let table = `<table style="border: 1px solid"><thead><tr><th style="border: 1px solid"><strong>Total # of Attendees</strong></th><th style="border: 1px solid"><strong>Total Revenue</strong></th>`;
                table += `<th style="border: 1px solid"><strong># of Klingon Plans</strong></th><th style="border: 1px solid"><strong># of Romulan Plans</strong></th><th style="border: 1px solid"><strong># of Vulcan Plans</strong></th></tr></thead><tbody>`;
                if (result.length == 0) {
                    table += `<tr><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td><td style="border: 1px solid">N/A</td></tr></tbody></table>`;
                }
                else {
                    for (i = 0; i < result.length; i++) {
                        counter++;
                        totalPrice += result[i].price;
                        if (result[i].plan === "Vulcan") {
                            numVulcan++;
                        }
                        else if (result[i].plan === "Romulan") {
                            numRomulan++;
                        }
                        else {
                            numKlingon++;
                        }
                    }
                    table += `<tr><td style="border: 1px solid">${counter}</td><td style="border: 1px solid">$${totalPrice}</td>
                                <td style="border: 1px solid">${numKlingon}</td><td style="border: 1px solid">${numRomulan}</td><td style="border: 1px solid">${numVulcan}</td></tr></tbody></table>`;
                }
                table += `</tbody></table>`;
                const variables = {
                    Number: portNumber,
                    Table: table
                }
                response.render("totals", variables);
            }
        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
    })();
});

router.get("/erase", (request, response) => {
    const variables = {
        Number: portNumber
    }
    response.render("eraseInput", variables);
});

router.post("/processErase", (request, response) => {
    (async () => {
        const databaseName = "CMSC335DB";
        const collectionName = "conventionRegistrations";
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
            const filter = {};
            const result = await collection.deleteMany(filter);
            const variables = {
                Number: portNumber,
                removed: result.deletedCount
            }
            response.render("eraseOutput", variables);
        } catch (e) {
           console.error(e);
        } finally {
           await client.close();
        }
     })();
});;


module.exports = router;