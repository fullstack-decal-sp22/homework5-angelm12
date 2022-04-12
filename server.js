const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded())

const mongoose = require('mongoose')

const db = mongoose.connection
const url = "mongodb://127.0.0.1:27017/apod"

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })

const Schema = mongoose.Schema
const apodSchema = Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
}, {collection: 'images'}) 

const APOD = mongoose.model('APOD', apodSchema)

app.get("/", function (req, res) {
  // GET "/" should return a list of all APOD images stored in our database
  APOD.find().then((apods) => {
    res.json({ message: 'List of APOD returned', apods: apods})
})
});

app.get("/favorite", function (req, res) {
  // GET "/favorite" should return our favorite image by highest rating
    APOD.find().sort({'rating': 'desc'}).exec((error, images) => {
    if (error) {
      console.log(error)
      res.send(500)
    } else {
      res.json({favorite: images[0]})
    }
  })
})

app.post("/add", function (req, res) {
  // POST "/add" adds an APOD image to our database
  const apod = new APOD({
    title: req.body.title,
    url: req.body.url,
    rating: req.body.rating
  })
  apod.save((error, document) => {
    if (error) {
      res.json({status: "issue adding"});
    } else {
      res.json({content: req.body});
    }
  })
});

app.delete("/delete", function (req, res) {
  // DELETE "/delete" deletes an image according to the title
  APOD.deleteOne({ title: req.body.title }, (error) => {
    if (error) {
        res.json({status: "issue deleting"})
    } else {
        res.json({status: "Deleted!"})
    }
})
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})