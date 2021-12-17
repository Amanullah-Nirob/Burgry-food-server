const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId=require(`mongodb`).ObjectId
const app = express()
const port = process.env.PORT || 5000
const SSLCommerzPayment = require('sslcommerz')
const { v4: uuidv4 } = require('uuid');


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.amixw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
      await client.connect();
      const database = client.db("BurgryFoodDB");
      const Services = database.collection("Services");
      const Orders = database.collection("Orders");
      const Reviews = database.collection("Reviews");
      const User = database.collection("User");
      const Payment = database.collection("Payment");

      app.get(`/services`,async(req,res)=>{
          const cursor=Services.find({})
          const result=await cursor.toArray()
          res.json(result)
      })

     app.post(`/services`,async(req,res)=>{
      const newProduct=req.body
      const result=await Services.insertOne(newProduct)
      res.json(result)
     })


     app.delete(`/services/:id`,async(req,res)=>{
       const id=req.params.id;
       const query={_id:ObjectId(id)}
       const result=await Services.deleteOne(query)
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

      app.get(`/orders`,async(req,res)=>{
        const cursor= Orders.find({})
         const result=await cursor.toArray()
         res.json(result)
      })



      app.get(`/orders/:email`,async(req,res)=>{
        const email=req.params.email
          const cursor=Orders.find({email:email})
         const result=await cursor.toArray()
         res.json(result)
      })

      app.delete(`/orders/:id`,async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        const result=await Orders.deleteOne(query)
        res.json(result)
      })


      app.put(`/orders/:id`,async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)}
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            status:'approve'
          },
        };

        const result=await Orders.updateOne(query,updateDoc,options)
        res.json(result)
      })


     app.get(`/reviews`,async(req,res)=>{
         const cursor=Reviews.find({})
         const result=await cursor.toArray()
         res.json(result)
     })

    app.post(`/reviews`,async(req,res)=>{
      const newReview=req.body
      const result=await Reviews.insertOne(newReview)
      res.json(result)
    })

     app.post(`/User`,async(req,res)=>{
       const newUser=req.body;
       const result=await User.insertOne(newUser)
       res.json(result)
     })

     app.put(`/User`,async(req,res)=>{
       const newAdminUser=req.body;
       const query={email:newAdminUser.email}
       const options = { upsert: true };
       const updateDoc = {
        $set: {
          admin:'admin'
        },
      };
      const result=await User.updateOne(query,updateDoc,options)
      res.json(result)

    })


      app.get(`/User/:email`,async(req,res)=>{
         const email=req.params.email;
          const query=await User.findOne({email:email})
          let admin=false
           if(query?.admin==='admin'){
            admin=true
           }
      res.json({admin:admin})

      })


// ===========================================================================================================================
      //sslcommerz init 
app.post('/init', async(req, res) => {
  const order=req.body
  const data = {
      total_amount: order.total_amount,
      currency: 'BDT',
      tran_id: uuidv4(),
      status:'pending',
      success_url: 'https://burgry-food.web.app/success',
      fail_url: 'http://localhost:5000/fail',
      cancel_url: 'http://localhost:5000/cancel',
      ipn_url: 'http://localhost:5000/ipn',
      shipping_method: 'Courier',
      product_name: order.product_name,
      product_category: 'Electronic',
      cus_name: order.cus_name,
      product_profile: 'general',
      cus_email: order.cus_email,
      product_img:order.product_img,
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '01711111111',
      cus_fax: '01711111111',
      ship_name: 'Customer Name',
      ship_add1: 'Dhaka',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
      multi_card_name: 'mastercard',
      value_a: 'ref001_A',
      value_b: 'ref002_B',
      value_c: 'ref003_C',
      value_d: 'ref004_D'
  };
  const result=await Payment.insertOne(data)
  const sslcommer = new SSLCommerzPayment(process.env.STORE_ID, process.env.PASSWORD,false) //true for live default false for sandbox
  sslcommer.init(data).then(data => {
      //process the response that got from sslcommerz 
      //https://developer.sslcommerz.com/doc/v4/#returned-parameters
    
   if(data.GatewayPageURL){
     res.json(data.GatewayPageURL)
   }
   else{
     res.status(400).json({
       message:`not success`
     })
   }

  });
})



    app.post(`/success`,async(req,res)=>{
    const query={tran_id: req.body.tran_id}
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        val_id:req.body.val_id,
        status:'successfully',
      },
    };
    const result=await Payment.updateOne(query,updateDoc,options)
      res.status(200).redirect('https://burgry-food.web.app/success')
    })


    app.post(`/fail`,async(req,res)=>{
      const query={tran_id:req.body.tran_id}
      const order=await Payment.deleteOne(query)
      res.status(400).redirect('https://burgry-food.web.app/')
    })
    app.post(`/cancel`,async(req,res)=>{
      const query={tran_id:req.body.tran_id}
      const order=await Payment.deleteOne(query)
      res.status(200).redirect('https://burgry-food.web.app/')
    })


    app.post(`/ipn`,async(req,res)=>{
      res.status(200).json(req.body)
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