# Modulo 2

## Queries y Resolvers

Una query permite ejecutar una petición al API, dentro de una query debes indicar la consulta que quieres ejecutar y los campos que deseas obtener. GraphQL te va a devolver la información que solicitaste dentro del objeto data.

El resultado de tu petición no se va a ejecutar de manera mágica, para ello debes definir el objeto resolvers, este objeto va a contener una propiedad del mismo nombre que la query que va a resolver o ejecutar.

```js
"use strict";

const { graphql, buildSchema } = require("graphql");

// schema
const schema = buildSchema(`
    type Query {
        hello: String,
    }
`);

// resolvers
const resolvers = {
  hello: () => "Hola mundo",
  saludo: () => "Hola a todos",
};

// execute query
graphql(schema, "{ saludo }", resolvers).then((data) => {
  console.log(data);
});
```

- `type` el tipo
- `schema` lo que tendra la peticion
- `{ saludo }` El objecto de la informacion - lo que se pedira
- `resolvers` se podria decir que son los datos a regresar

## Sirviendo el API en la web

Ya viste que nuestra API funciona a través de la línea de comandos, pero necesitamos que está funcione dentro de la web, para ello necesitas de las dependencias de express y un middleware de GraphQL, vamos a instalarlo con el siguiente comando:

```js
npm i express express-graphql
```

Para evitar el proceso de detener nuestro servidor cada que ejecutamos un nuevo cambio vamos a utilizar la dependencia de desarrollo Nodemon

```js
npm i nodemon -D
```

Agreagamos mas datos

```js
const { graphql, buildSchema } = require("graphql");
const express = require("express");
const { graphqlHTTP } = require("express-graphql"); //middleware
const app = express();
const port = process.env.PORT || 3000;

// Creamos el formato
const schema = buildSchema(`
    type Query {
        hello: String,
        saludar: String,
    }
`);
// la informacion a pedira
const resolvers = {
  hello: () => "hello world",
  saludar: () => "Hola mundo",
};

//endpoint - la ruta

app.use(
  "/api",
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  })
);

app.listen(port, () => console.log("listening on port: " + port));
```

## Custons

Aqui ya creamos todo mas modular `carpeta lib`

```js
type Course { // el contenido que se obtendra
    _id: ID,
    title: String,
    teacher: String,
    description: String,
    topics: String
}

type Query {
    getCorusers: [Course] // aqui tenemos un array con toda la informacion
}
```

nosotros pidiendo la informacion

```js
{
  getCousers {
    _id
    title
  }
}
```

## Argumentos

instalamos algo nuevo que nos ayudara mucho mejor

```bash
$ npm i graphql-tools
```

```js
// antes
const { buildSchema } = require("graphql");

//cambiara a

const { makeExecutableSchema } = require("graphql-tools");

// y

const typeDefs = readFileSync(
  join(__dirname, "lib", "schema.graphql"),
  "utf-8"
);
const schema = makeExecutableSchema({ typeDefs, resolve });

// resolvers.js
module.exports = {
  Query: {
    getCousers: () => {
      return courses;
    },
  },
};
```

en schema

```js
getCourser(id: ID!) // el ! significa obligatorio
```

Peticion

```js
{
  getCourser(id: "anyid") {
    title
  }
}

```

## Configuración de base de datos

Lo que hacemos lo mismo que mongodb

archivo `/lib/db.js`

ya de ahi ps

```js
module.exports = {
  Query: {
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
  },
};
```

## Meter informacion

creamos nuestro schema

```js
input CourseInput { // lo que contendra
    title: String!,
    teacher: String,
    description: String!,
    topics: String
}

type Mutation { //mandar datos
    "Crea un curso"
    createCourse(input: CourseInput!): Course
}
```

al hacer crearlo

```js
mutation { //decimos que es
  createCourse(input: { // lo que ejecutara y los daots
    title: "Curso mutation"
    description: "descripcion 4"
    topics: "diseños"
  }){ //lo que queremos que nos regrese
    _id
    title
    description
  }
}
```

## Nested Types

Podemos hacer relaciones

```js
type Course {
    _id: ID
    title: String
    teacher: String
    description: String
    topics: String
    people: [Student] //Qui le digo que tendre un array y contra estudiantes
}

type Student {
    _id: ID!
    name: String!
    email: String!
}
```

y lo demas es actualizar y validar peticiones

```js
mutation {
  addPerson(courseID: "60216e7c4b62c32e98b6d5d7", studenID: "602414106a9fe326905e44c6"){
    title
  }
}

```

## Resolver de tipos

GraphQL necesita de un resolver para el tipo de dato padre y una función para el campo del nested type para poder extraer su información.

Es decir si pongo esto

```js
{
  getCousers {
    title
    people // aqui me dara error, por que es compuesto
  }
}
```

lo que significa que puedo hacer

```js
{
  getCousers {
    title
    people { // pero hay que areglar esto
      _id
      name
      email
    }
  }
}
```

entonces creamos `types` gracias a graph tools , esto se vuelve mas facil

# Modulo 3

## Alias y fragments

Dentro de GraphQL podemos correr más de una petición a la vez y nombrarlas de distinta manera para poder identificarlas, esto es posible gracias a los Aliases o simplemente Alias.

La sintaxis de un Alias es bastante simple:

```js
nombreDelAlias: tipoDeDato(argumento: tipo) {
  datos
}
```

Además de los Alias, podemos agrupar campos para ser reutilizados en distintas peticiones gracias a los Fragments.

https://graphql.github.io/learn/queries/#aliases

```graphql
{
  All: getCousers {
    ...CourseFields //usando los campos
    people {
      name
    }
  },
  CourseOne: getCourser(id: "60216e7c4b62c32e98b6d5d7"){
    title
  }

}

fragment CourseFields on Course { //Los campos que podemos repetir
  _id
  title
  description
}
```

es parecido a una funcion

## Variables

Podemos utilizar variables dentro de las peticiones que hagamos a GraphQL simplemente definiéndolas con la siguiente sintaxis:

```sh
$nombre: tipo
```

https://graphql.github.io/learn/queries/#variables

```graphql
query GetCourse2($course: ID!) {
  getCourse(id: $course) {
    _id
    title
    people {
      _id
      name
    }
  }
}
```

Requiere un objeto JSON como:

```json
{
  "course": "5cb4b8ce75f954a0585f7be3"
}
```

## Enums

Los Enums o enumeration types son tipos de datos escalares cuyos valores son configurables. Si definimos un tipo de dato como enum sus valores posibles solamente serán aquellos que se encuentren entre los definidos en el enum.

```js

enum Level { //Lo que tendra
  principiante
  intermedio
  avanzado
}

type Course {
    _id: ID
    title: String
    teacher: String
    description: String
    topics: String
    people: [Student]
    level: Level //Aqui le decimos que solo obtendra valores del Level
}


```

## Interfaces - Tipo Monitor

Las interfaces son muy importantes y útiles cuando nos encontramos con tipos de datos similares. Una interfaz nos permite definir un tipo de dato padre que utilizando la palabra implements va a implementar los campos que tenga definidos dentro del tipo de dato que queramos.

```graphql
interface Person {
  _id: ID!
  name: String!
  email: String!
}

type Studen implements Person {
  avatar: String
}

type Monitor implements Person {
  phone: Number
}
```

en la parte de types

```js
Person: {
  __resolveType: (person, context, info) => {
    if (person.phone) {
      //aqui ocurre la magia
      return "Monitor";
    } else {
      return "Student";
    }
  };
}
```

cambiamos las queryes y los resolves para poder hacer las
peticiones como se deben
y para hacer la peticion

```graphql
{
  getPeople {
    _id
    name
    email
    ... on Monitor {
      phone
    }
    ... on Studen {
      avatar
    }
  }
}
```

## Directivas

as directivas son una instrucción que permite agregar condicionales a nuestras peticiones. Podemos modificar de manera dinámica nuestra query simplemente añadiendo

```js
@include(if: Boolean) {
  datos
}
```

https://graphql.github.io/learn/queries/#directives

es como un if directamente

## Unions

Unions permite agrupar varios custom types sin importar si tienen algo en común, su sintaxis es la siguiente:

```js
union SearchResult = CustomType1 | CustomType2 | CustomType3
```

https://graphql.github.io/learn/schema/#union-types

```graphql
union GlobalSerch = Course | Student  | Monitor


# Query
searchTeam(ketword: String!): [GlobalSerch] # Regresaremos varios elementos a buscar por una palabra de
```

types - resolve

```js

GlobalSerch {
  __resolve: (item, context, info) => {
    if(item.title) {
      return "Course
    }

    if(item.phone) {
      return "Monito"
    }

    if(item.avatar) {
      return "Student"
    }
  }
}

```

queries

```js
/*
  para buscar varios, crearemos un indice
*/

// db.courses.createIndex({$**: "text"})

searchItem: async (root, { keyword }) => {
  db.collection()
    .find(($text: { $search: keyword }))
    .toArray();
};
```

buscamos resultados de manera global

# modulo 4

## Consumiendo la Api

Para que nuestra API sea accesible desde cualquier lugar debemos añadir el middleware cors a express, primero debemos instalarlo con el siguiente comando:

```js
//npm i cors

app.use(cors());
```

quitar el modo produccion o desarrollo

```js
const isDev = process.env.Dev; //false desarrollo - true produccion

app.use(
  "/api",
  graphqlHTTP({
    schema,
    graphiql: isDev,
    rootValue: resolvers,
  })
);
```

## HTTP requests

usamos la url

## Clientes

Aquí les dejo la lista de los clientes mencionados:

- FetchQl: https://www.npmjs.com/package/fetchql

- - Tiene un objeto de configuración donde se introduce todas los requerimientos que necesita un query.

- Graphql-request https://www.npmjs.com/package/graphql-request

- - Se puede usar tanto en node como en un aplicativo de front. Es el más sencillo de usar.

- Apollo Client: https://www.npmjs.com/package/apollo-client

- - En un cliente muy completo pues tiene los mismos usos que graphql-request, pero se puede manejar caché de query, uso de promesas, entre otros.

- Relay: https://relay.dev/

- -Es un cliente orientado a integrar el front. es usado por Facebook de manera oficial para conectar con graphql.

- Vue Apollo: https://apollo.vuejs.org/

- - Apollo Angular: https://www.apollographql.com/docs/angular/

## Consumiendo el API desde un frontend simple

