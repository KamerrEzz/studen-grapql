

const mutations = require("./mutations")
const querys = require("./query")
const types = require("./types")

module.exports = {
  Query: querys,
  Mutation: mutations,
  ...types
};
