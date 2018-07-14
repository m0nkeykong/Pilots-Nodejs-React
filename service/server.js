const express       = require('express'),      
      app           = express(),      
      producerCtrl  = require('./controllers/producer.ctrl'),
      consumerCtrl  = require('./controllers/consumer.ctrl'),
      projectCtrl   = require('./controllers/project.ctrl'),      
      port          = process.env.PORT || 3000;

// GET = READ
// POST = CREATE
// PUT = UPDATE
// DELETE = DELETE

app.use('/producer', producerCtrl);
app.use('/consumer', consumerCtrl);
app.use('/project', projectCtrl);

//  refers root to API file
app.use('/', express.static('./public')); 
app.use('/assets', express.static(`${__dirname}/public`));

//  Catch the first req and wait to access route
app.use(function(req,res,next) {    
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// handle unknown page request
app.all('*', (req, res, next) => {
  res.status(404).send({ "Message": `This page was not found` });
});

app.listen(port,  () => {      
  console.log(`Listening on port ${port}`);  
});