const express = require("express");
const cors = require("cors");
const dbJson = require("./items-db.json");
const { createHandler } = require("graphql-http/lib/use/express");
const gql = require("graphql-tag");
const { buildASTSchema } = require("graphql");
const depthLimit = require("graphql-depth-limit");

const app = express();
const PORT = 3000;

// Allow cross-origin access
app.use(cors({ origin: "*", credentials: true }));

// Serve static files
app.use("/images", express.static("public"));

const schema = buildASTSchema(gql(`
    type Query {
        hello: String!
        merchandises: [Merchandise]
        merchandise(id:ID): Merchandise
    }
    
    type Merchandise {
    id: ID
    name: String
    description: String
    lastBid: Float
    lastBidUser: String
    imageUrl: String
    relatedMerchandise: Merchandise
    }

    type BidResult{
    accepted: Boolean!
    reason: String
    }

    type Mutation{
    submitBid(id: ID, newBid: Float, newBidUser: String): BidResult
    
    }
`));

const rootValue = {
    hello: () => "Hello World!",
    merchandises: () => dbJson,
    merchandise: ({ id }) => dbJson.find(item => item.id == id),
    submitBid: ({ id, newBid, newBidUser }) => {
        if (newBid === undefined) {
            return {
                accepted: false,
                reason: "new bid is missing!"
            }
        }
        if (newBidUser === undefined) {
            return {
                accepted: false,
                reason: "new bid user is missing!"
            }
        }

        const match = dbJson.find(item => item.id == id);
        if (match == undefined) {
            return {
                accepted: false,
                reason: "invalid or missing item id!"
            }
        }

        if (match.lastBid >= newBid) {
            return {
                accepted: false,
                reason: "bid is not high enough!"
            }
        }

        match.lastBid = newBid;
        match.lastBidUser = newBidUser;
        return {
            accepted: true,
            reason: null
        }


    }
};

app.use("/", createHandler({ schema, rootValue, validationRules: [depthLimit(2)] }));

app.listen(PORT, () => {
    setInterval(virtualBid, 5000);
    console.log(`Server is listening on port ${PORT}`);
});


// virtual bidder

function virtualBid() {

    const virtualBidders = ["mystic-fox", "magical-lion", "swift-zebra", "smart-monkey", "sneaky-snake", "majestic-tiger", "roaming-jellyfish"]

    dbJson.forEach((item) => {

        // generate a random percentage from 1 to 2
        const increase = Math.random() * 2;
        item.lastBid *= Number(1.0 + (increase / 100));

        // select a random fake user ID
        const index = Math.floor(Math.random() * 7);
        item.lastBidUser = virtualBidders[index];
    })

}
