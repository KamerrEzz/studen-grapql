const { MongoClient } = require("mongodb");
const { db_user, db_pass, db_port, db_host, db_name } = process.env;

const mongoUrl = `mongodb://${db_user}:${db_pass}@${db_host}:${db_port}/${db_name}?authSource=admin`;
// console.log(mongoUrl);
let connection;

async function connectDB() {
  if (connection) return connection;

  let client;
  try {
    client = await MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connection = client.db(db_name);
  } catch (error) {
    console.error("Could not connect to db", mongoUrl, error);
    process.exit(1);
  }

  return connection;
}

module.exports = connectDB;
