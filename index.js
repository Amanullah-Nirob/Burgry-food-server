const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId=require(`mongodb`).ObjectId
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.amixw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
      await client.connect();
      const database = client.db("BurgryFoodDB");
      const Services = database.collection("Services");
      const Orders = database.collection("Orders");
      const Reviews = database.collection("Reviews");


      app.get(`/services`,async(req,res)=>{
          const cursor=Services.find({})
          const result=await cursor.toArray()
          res.json(result)
      })

      app.get(`/services/:id`,async(req,res)=>{
          const id=req.params.id;
          const query={_id:ObjectId(id)}
          const result=await Services.findOne(query)
          res.json(result)
      })

      app.post(`/orders`,async(req,res)=>{
          const newOrder=req.body;
          const result=await Orders.insertOne(newOrder)
          res.json(result)
      })
        
     app.get(`/reviews`,async(req,res)=>{
         const cursor=Reviews.find({})
         const result=await cursor.toArray()
         res.json(result)
     })


     
    } finally {
    //   await client.close(); 
    }
  }
  run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Burgry-food server start hear, alhmadolliah')
})

app.listen(port, () => {
  console.log(`Burgry-food server start hear, alhmadolliah`,port)
})