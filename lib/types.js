const mongo = require("./db");
const { ObjectID } = require("mongodb");

module.exports = {
  Course: {
    //esta es la funcion traera todos los datos
    people: async ({ people }) => {
      let db, peopleData, ids;

      try {
        db = await mongo();
        ids = people ? people.map((id) => ObjectID(id)) : [];
        peopleData =
          ids.length > 0
            ? await db
                .collection("students")
                .find({ _id: { $in: ids } })
                .toArray()
            : [];
      } catch (error) {
        console.error(error);
      }

      return peopleData;
    },
  },
};
