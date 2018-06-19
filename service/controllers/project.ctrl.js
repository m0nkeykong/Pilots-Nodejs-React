var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    Project = require("../models/project"),          //project schema
    Producer = require('../models/producer'),        //producer schema
    onlyNotEmpty = require('../controllers/onlyNotEmpty');
const mongoose = require("mongoose");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

//get all projects
router.get('/', (req, res) => {
  Project.find({}, (err, docs) => {
      if (err){
        console.log(err);
        return res.status(500).send({"Message":"Internal server error"});
      } 
      console.log(docs);
      res.status(200).send(docs);
  });
});

//create a project - handle ownder id in GUI
router.post('/createProject/:owner', (req, res) => {
  const newProject = new Project(req.body);
  newProject.owner = req.params.owner;
  newProject.save(err => {
      if (err){
        console.log(err);
        return res.status(400).send({ "Message": "There was a problem creating the project, please try again" });
      }
      //after creating the project, we need to attach it into user's profile
      Producer.findByIdAndUpdate(newProject.owner, { $push: { projects: newProject._id }}, { new: true },
        (err, docs) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ "Message": "There was a problem updating the project, please try again." });
          }
          console.log(`Project ${newProject.title} has been added by ${docs._id}`);
      });

      //now, send details to client
      res.status(200).send(`Project ${newProject.title} has been created successfully`);
    });
});

//get project using id
router.get('/getById/:id', (req, res) => {
  Project.findById({ _id: req.params.id }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "Project ID was not found in the system" });
    }
    console.log(docs);
    res.status(200).json(docs);
  })
});

//get project by producer
router.get('/getByOwner/:owner', (req, res) => {
  Project.find({ owner: req.params.owner }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "Owner ID was not found in the system" });
    }
    console.log(docs);
    res.status(200).json(docs);
  })
});

//get project by category
router.get('/getByCategory/:category', (req, res) => {
  Project.find({ category: req.params.category }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "Project with this category does not exist in the system" });
    }
    console.log(docs);
    res.status(200).json(docs);
  })
});

//get project by positive votes number
router.get('/getByVotes/:positive_voters', (req, res) => {
  Project.find({ "positive_voters": { $size: req.params.positive_voters } }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "There are no projects with this amount of positive votes in the system" });
    }
    console.log(docs);
    res.status(200).json(docs);
  })
});

//update project data
router.put('/updateProject/:id', onlyNotEmpty, (req, res) => {
  Project.findByIdAndUpdate(req.params.id, req.bodyNotEmpty, { new: true }, 
    (err, docs) => {
      if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "There was a problem updating the project, please try again." });
    }
    console.log(docs);
    res.status(200).send(`Project ${docs.title} has been updated successfully`);
  });
});

//remove project - also deletes it from producer's db
router.delete('/deleteProject/:id', (req, res) => {
  //find the project
  Project.findById({ _id: req.params.id }, (err, proj) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "Project ID was not found in the system" });
    }
    //first, delete the project from producer
    Producer.findByIdAndUpdate(proj.owner, { $pull: { projects: { $in: proj._id } } }, { new: true },
        (err, docs) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ "Message": "There was a problem updating the project, please try again." });
          }
          console.log(`Project ${proj._id} has been removed from producer ${docs._id}`);
    });
  });
  //now, we can delete the project from the db
  Project.findByIdAndRemove(req.params.id, (err, project) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": "There was a problem deleting the project." });
    }
    console.log(`project ${project.title} has been deleted successfully`);
    res.status(200).send(`project ${project.title} has been deleted successfully`); //doesnt send response!!@!#!
  });
});

module.exports = router;

// GET = READ
// POST = CREATE
// PUT = UPDATE
// DELETE = DELETE