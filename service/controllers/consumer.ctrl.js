var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  Consumer = require('../models/consumer'),                     //  consumer schema
  Project = require('../models/project'),                       //  project schema
  onlyNotEmpty = require('../controllers/onlyNotEmpty');        //  function that checks and validates fields - used for update empty params issue
const mongoose = require("mongoose"),
  VIP = 1;      //  for exaple in presentation

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// check if user is becoming VIP
function isVIP() {
  return new Promise((resolve, reject) => {
    Consumer.find({}, (err, Consumers) => {
      if (err)
        console.log(err);
      Consumers.forEach((consumer) => {
        var total = 0, ok = 0;
        checkPositiveVotes(consumer).then((result) => {
          ok += result.ok;
          total += result.total;
        }, (err) => { console.log(err); }).then((result) => {
          checkNegativeVotes(consumer).then((result) => {
            ok += result.ok;
            total += result.total;
          }, (err) => { console.log(err); }).then((result) => {
            updateifSuccess(consumer, ok, total).then((result) => {
              resolve(result);
            }, (err) => { console.log(err); reject(err); });
          });
        })
      });
    });
  });
}

// check all positive votes
function checkPositiveVotes(consumer) {
  return new Promise((resolve, reject) => {
    var ok = 0, total = 0;
    if (!consumer.positive_votes.length) resolve({ "ok": ok, "total": total });
    consumer.positive_votes.forEach((projectID) => {
      Project.findOne({ _id: projectID }, (err, proj) => {
        if (err)
          reject(err);
        else {
          if (proj.goal_status >= proj.goal)
            ok++;
          total++;
        }
        resolve({ "ok": ok, "total": total });
      });
    });
  });
}

// check all negative votes
function checkNegativeVotes(consumer) {
  return new Promise((resolve, reject) => {
    var ok = 0, total = 0;
    if (!consumer.negative_votes.length) resolve({ "ok": ok, "total": total });
    consumer.negative_votes.forEach((projectID) => {
      Project.findOne({ "_id": projectID }, (err, proj) => {
        if (err)
          reject(err);
        else {
          if ((new Date() > proj.deadline) && (proj.goal_status < proj.goal))
            ok++;
          total++;
        }
        resolve({ "ok": ok, "total": total });
      });
    });
  });
}

// check algorithem
function updateifSuccess(consumer, ok, total) {
  return new Promise((resolve, reject) => {
    let percentage = parseInt(ok) / parseInt(total);
    if (ok >= VIP && percentage >= 0.8) {
      Consumer.findByIdAndUpdate({ _id: consumer._id }, { "vip": true }, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    } resolve(true);
  });
}

//  Show all Consumers list - DONE
router.get('/', (req, res) => {
  Consumer.find({}, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ "Message": `Internal server error` });
    }
    console.log(docs);
    res.status(200).send(docs);
  });
});

//  Consumer create his profile - DONE
router.post('/createProfile', (req, res) => {
  Consumer(req.body).save(err => {
    if (err) {
      console.log(err);
      return res.status(500).send({ "Message": `Internal server error` });
    }
    console.log(`User ${req.body.user_name} has been created successfully`);
    res.status(200).send(`User ${req.body.user_name} has been created successfully`);
  });
});

//  Consumer show hif profile - DONE
router.get('/getProfile/:id', (req, res) => {
  Consumer.findById({ _id: req.params.id }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": `User ID was not found in the system` });
    }
    console.log(docs);
    res.status(200).send(docs);
  });
});

//  Consumer update his profile - DONE
router.put('/updateProfile/:id', onlyNotEmpty, (req, res) => {
  Consumer.findByIdAndUpdate(req.params.id, req.bodyNotEmpty, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": `User ID was not found in the system` });
    }
    console.log(docs);
    res.status(200).send(docs);
  });
});

//  Consumer delete his profile - DONE
router.delete('/deleteProfile/:id', (req, res) => {
  Consumer.findByIdAndRemove({ _id: req.params.id }, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": `User ID was not found in the system` });
    }
    console.log(`Consumer: ${docs.user_name} deleted successfully`);
    res.status(200).send(docs);
  });
});

//  Consumer vote for project - Done
router.put('/voteProject/:id/:status', (req, res) => {
  Consumer.findOne({
    $and: [
      { _id: { $eq: req.params.id } },
      {
        $or: [
          { "positive_votes": { $in: [req.body.projId] } },
          { "negative_votes": { $in: [req.body.projId] } }]
      }]
  }, (err, doc) => {
    console.log(doc);
    //  User not yet voted for this project
    if (!doc) {
      // Positive vote (+1)
      if (req.params.status == true) {
        // Update vote list in user profile
        Consumer.findByIdAndUpdate(req.params.id, { $push: { "positive_votes": req.body.projId } }, { new: true }, (err, userdoc) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ "Message": `User ID was not found in the system` });
          }
          //  Update vote list in project profile
          console.log(`${userdoc.user_name} Start voting +1 right now`);
          Project.findOneAndUpdate({ _id: req.body.projId }, { $inc: { "goal_status": 1 }, $push: { "positive_voters": req.params.id } }, (err, projdoc) => {
            if (err) {
              console.log(err);
              return res.status(400).send({ "Message": `Project ID was not found in the system` });
            }
            isVIP().then(function (result) {
              console.log(`Consumer: ${userdoc.user_name} Voted +1 Successfully for project ${projdoc.title} `);
              res.status(200).send(`Consumer: ${userdoc.user_name} Voted +1 Successfully for project ${projdoc.title} `);
            }, function (err) { console.log(err) });


          })
        });
      }
      //  Negative vote (-1)
      if (req.params.status == false) {
        // Update vote list in user profile
        Consumer.findByIdAndUpdate(req.params.id, { $push: { "neagtive_votes": req.body.projId } }, { new: true }, (err, userdoc) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ "Message": `User ID was not found in the system` });
          }
          //  Update vote list in project profile
          console.log(`${userdoc.user_name} Start voting -1 right now`);
          Project.findByIdAndUpdate(req.body.projId, { $push: { "neagtive_voters": req.params.id } }, { new: true }, (err, projdoc) => {
            if (err) {
              console.log(err);
              return res.status(400).send({ "Message": `Project ID was not found in the system` });
            }
            isVIP();
            console.log(`Consumer: ${userdoc.user_name} Voted -1 Successfully for project ${projdoc.title} `);
            res.status(200).send(`Consumer: ${userdoc.user_name} Voted -1 Successfully for project ${projdoc.title} `);
          })
        });
      }
    }
    //  User already voted for this project
    else return res.status(400).send({ "Message": `Consumer already voted for the project` });
  });
});

//  Consumer Subscribe to project - DONE
router.put('/subscribe/:id', (req, res) => {
  Consumer.findById({ _id: req.params.id }, { "subscriptions": { $elemMatch: { $in: req.body.projId } } }, (err, doc) => {
    //  User note yet Subscribed to this project
    if (doc[Subscriptions] != req.body.projId) {
      Consumer.findByIdAndUpdate({ _id: req.params.id }, { $push: { "subscriptions": req.body.projId } }, { new: true }, (err, userdoc) => {
        if (err) {
          console.log(err);
          return res.status(400).send({ "Message": `User ID was not found in the system` });
        }
        Project.findByIdAndUpdate({ _id: req.body.projId }, { $push: { "subscribers": req.params.id } }, { new: true }, (err, projdoc) => {
          if (err) {
            console.log(err);
            return res.status(400).send({ "Message": `Project ID was not found in the system` });
          }
          console.log(`Consumer: ${userdoc.user_name} Successfully Subscribed for project ${projdoc.title} `);
          res.status(200).send(`Consumer: ${userdoc.user_name} Successfully Subscribed for project ${projdoc.title} `);
        })
      });
    }
  })
});

//  UnSubscribe to project - DONE
router.delete('/unsubscribe/:id', (req, res) => {
  Consumer.findByIdAndUpdate({ _id: req.params.id }, { $pull: { "subscriptions": req.body.projId } }, { new: true }, (err, userdoc) => {
    if (err) {
      console.log(err);
      return res.status(400).send({ "Message": `User ID was not found in the system` });
    }
    Project.findByIdAndUpdate({ _id: req.body.projId }, { $pull: { "subscribers": req.params.id } }, { new: true }, (err, projdoc) => {
      if (err) {
        console.log(err);
        return res.status(400).send({ "Message": `Project ID was not found in the system` });
      }
      console.log(`Consumer: ${userdoc.user_name} Successfully UnSubscribed for project ${projdoc.title} `);
      res.status(200).send(`Consumer: ${userdoc.user_name} Successfully UnSubscribed for project ${projdoc.title} `);
    })
  });
});

module.exports = router;
