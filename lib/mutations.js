const mongo = require("./db");
const { ObjectID } = require("mongodb");

module.exports = {
  createCourse: async (root, { input }) => {
    const defaults = {
      teacher: "",
      topics: "",
    };
    const newCourse = Object.assign(defaults, input);
    let db;
    let course;
    try {
      db = await mongo();
      course = await db.collection("courses").insertOne(newCourse);
      newCourse._id = course.insertedId;
    } catch (error) {
      console.error(error);
    }

    return newCourse;
  },
  editCuourse: async (root, { _id, input }) => {
    let db;
    let course;
    try {
      db = await mongo();
      await db
        .collection("courses")
        .updateOne({ _id: ObjectID(_id) }, { $set: input });
      course = await db.collection("courses").findOne({ _id: ObjectID(_id) });
    } catch (error) {
        console.error(error);
    }
    console.log("find", course) 
    return course;
  },
  createStudent: async (root, { input }) => {
    let db;
    let student;
    try {
      db = await mongo();
      student = await db.collection("students").insertOne(input)
      student = await db.collection("students").findOne({ _id: ObjectID(student.insertedId)})
    } catch (error) {
      console.error(error);
    }

    return student;
  },
  addPerson: async (root, {courseID, studenID}) => {
    let db, course, student;

    try {
      db = await mongo();
      course = await db.collection("courses").findOne({ _id: ObjectID(courseID)})
      student = await db.collection("students").findOne({ _id: ObjectID(studenID)})


      if(!course || !student) throw new Error("La perona o el curso no existe");

      await db.collection("courses").updateOne(
        {_id: ObjectID(courseID)},
        {$addToSet: {people: ObjectID(studenID)}}
        )
    } catch (error) {
      console.error(error);
    }

    return course
  }
};
