const express       = require('express'),      
      app           = express(),      
      producerCtrl  = require('./controllers/producer.ctrl'),
      consumerCtrl  = require('./controllers/consumer.ctrl'),
      projectCtrl   = require('./controllers/project.ctrl'),      
      port          = process.env.PORT || 3000;

app.use('/producer', producerCtrl);
app.use('/consumer', consumerCtrl);
app.use('/project', projectCtrl);

app.use('/assets', express.static(`${__dirname}/public`));

//  Catch the first req and wait to access route
app.use((req,res,next) => {    
res.header("Access-Control-Allow-Origin", "*");    
res.header("Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept");    
      next();  
});

//  API RESPONSE  
app.get('/', (req, res) => {
  res.set('Content-Type', 'text/html');
  res.status(200).sendFile(`${__dirname}/public/index.html`);
});

//  Handle unknown page request
app.all('*', (req, res, next) => {
  res.status(404).send({ "Message": `This page was not found` });
});

app.listen(port,  () => {      
  console.log(`Listening on port ${port}`);  
});