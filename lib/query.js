const mongodb = require("./db");
const { ObjectID } = require("mongodb");
module.exports = {
  getCousers: async () => {
    let db;
    let courses = [];
    try {
      db = await mongodb();
      courses = await db.collection("courses").find().toArray();
    } catch (error) {
      console.error(error);
    }
    return courses;
  },
  getCourser: async (root, args) => {
    let db;
    let course;
    try {
      db = await mongodb();
      course = await db
        .collection("courses")
        .findOne({ _id: ObjectID(args.id) });
    } catch (error) {
      console.error(error);
    }
    return course;
  },
};
