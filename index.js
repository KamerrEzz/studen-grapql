require('dotenv').config()
const { makeExecutableSchema } = require("graphql-tools");
const express = require("express");
const { graphqlHTTP } = require("express-graphql"); // middleware
const app = express();
const port = process.env.PORT || 3000;
const { readFileSync } = require("fs");
const { join } = require("path");
const resolvers = require("./lib/resolvers");



const typeDefs = readFileSync(join(__dirname, "lib", "schema.graphql"), "utf-8");
const schema = makeExecutableSchema({typeDefs, resolvers}); 

app.use(
  "/api",
  graphqlHTTP({
    schema,
    graphiql: true,
    rootValue: resolvers,
  })
);

app.listen(port, () => console.log("on port: " + port));
