const express = require('express');
require('dotenv').config();
const port = 5000;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
// console.log(DB_NAME);
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://Book-Life:${DB_PASSWORD}@cluster0.zsxmj.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res)=>{
    res.send("Hello World");
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookCollection = client.db(DB_NAME).collection("all_books");
  const userBookCollection = client.db(DB_NAME).collection("user_books");
  // perform actions on the collection object
  // console.log("Mongo Connected");
  // Book Collections
  app.post('/addBook', (req, res) =>{
    //   console.log(req.body);
      const bookData = req.body;
      bookCollection.insertOne(bookData)
      .then(data => {
        //   console.log(data.ops[0]);
          res.send(data.ops[0]);
      })
      .catch(err=> console.log(err))
  })
  app.get('/allBooks', (req, res) =>{
      bookCollection.find({})
      .toArray((err, documents) => {
        //   console.log(documents);
          res.send(documents);
      })
  })

  // Delete a user from MongoDB by id using (params)...
  app.get('/delete/:id', (deleteReq, deleteRes) =>{
    const id = deleteReq.params.id;
    bookCollection.deleteOne({_id: ObjectId(id)})
    .then(document => {
        // console.log(document.deletedCount);
        if(document.deletedCount){
            app.get('/allBooks', (req, res) =>{
                bookCollection.find({})
                .toArray((err, documents) => {
                  //   console.log(documents);
                    res.send(documents);
                })
            })
        }
        deleteRes.send(document);
    })
  })

  // User Collections
  app.get('/all-users-books', (req, res) =>{
    userBookCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents);
    })
  })

  app.get('/user-books', (req, res) =>{
    const userEmail = req.query.email;
    // console.log(userEmail);
    userBookCollection.find({userEmail})
    .toArray((err, documents) =>{
      // console.log(documents);
      res.send(documents);
    })
  })

  app.post('/add-book', (req, res) =>{
    const userBookData = req.body;
    // console.log(userBookData)
    userBookCollection.insertOne(userBookData)
    .then(data => {
        res.send(data.ops[0])
    })
    .catch(err => console.log(err))
  })

  app.post('/user-books/:id', (req, res)=>{
    // console.log(req.params.id,"\n",req.body);
    const id = req.params.id;
    // console.log(id);
    const userEmail = req.query.email;
    const userBookData = req.body;
    userBookCollection.findOne({_id: ObjectId(id), userEmail})
    .then(data => {
      // console.log(data, " => users data");
        data.quantity += userBookData.quantity;
        // console.log(data);
        userBookCollection.updateOne({_id: ObjectId(id)},{
          $set: { quantity: data.quantity }
        })
        .then(result => {
          res.send(result);
        })
    })
    .catch(err => console.log(err))
  })

//   client.close();
});

app.listen(process.env.PORT || port)