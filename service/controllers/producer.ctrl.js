var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    Producer = require('../models/producer'),        //producer schema
    Project = require('../models/project'),          //project schema
    onlyNotEmpty = require('../controllers/onlyNotEmpty'); //function that checks and validates fields - used for update empty params issue
const mongoose = require("mongoose");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


//get all producers
router.get('/', (req, res) => {
  Producer.find({}, (err, docs) => {
      if (err){
        console.log(err);
        return res.status(500).send({ "Message":"Internal server error"});
      } 
      console.log(docs);
      res.status(200).send(docs);
  });
});

//create a producer
router.post('/createProfile', (req, res) => {
  const newProducer = new Producer(req.body);
  newProducer.save(err => {
      if (err){
        console.log(err);
        return res.status(500).send({ "Message": "Internal server error" });
      } 
    console.log(newProducer);
    res.status(200).send(`User ${req.body.user_name} has been created successfully`);
    });
});

//get producer profile
router.get('/getProfile/:id', (req, res) =>{
  Producer.findById({_id: req.params.id}, (err, docs) => {
    if (err){
      console.log(err);
      return res.status(400).send({ "Message": "User ID was not found in the system" });
    }
    console.log(docs);
    res.status(200).json(docs);
  })
});

//update producer profile
router.put('/updateProfile/:id', onlyNotEmpty, (req, res) => {
  Producer.findByIdAndUpdate(req.params.id, req.bodyNotEmpty, { new: true }, 
    (err, docs) => {
      if (err) {
      console.log(err);
        return res.status(400).send({ "Message": "User ID was not found in the system" });
    }
    console.log(docs);
    res.status(200).send(`User ${docs.user_name} has been updated successfully`);
  });
});

//delete producer profile - also deletes all producer's projects
router.delete('/deleteProfile/:id', (req, res) => {
  //first, get all producer's projects and delete them
  Producer.findById({ _id: req.params.id }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "User ID was not found in the system" });
    }
    docs.Projects.forEach((value, key) => {
      Project.findOneAndRemove({_id: value}, (err, docs) => {
        if (err){
          console.log(err);
          return res.status(400).send({ "Message": "Project ID was not found in the system" });
        }
        console.log(`Project ${docs.title} has been deleted`);
      });
    });
  });
  //now after deleteing all the producer's projects, we can safely delte the producer's profile
  Producer.findByIdAndRemove(req.params.id, (err, docs) => {
    if (err){
      console.log(err);
      return res.status(400).send({ "Message": "User ID was not found in the system." });
    } 
    console.log(`User ${docs.user_name} has been deleted successfully`);
    res.status(204).send(`User ${docs.user_name} has been deleted successfully`);
  });
});

module.exports = router;
