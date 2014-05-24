var fs = require('fs');
var async = require('async');
var restify = require('restify');
var server = restify.createServer();
var NeDB = require('nedb');

var projectsDb = new NeDB({ filename: 'data/projects.db', autoload: true });
var employeesDb = new NeDB({ filename: 'data/employees.db', autoload: true });
var workitemsDb = new NeDB({ filename: 'data/workitems.db', autoload: true });
var contractsDb = new NeDB({ filename: 'data/contracts.db', autoload: true });

server.use(restify.CORS());
server.pre(restify.pre.userAgentConnection());
server.use(restify.acceptParser(server.acceptable));
server.use(restify.bodyParser());
server.use(restify.queryParser());

// Statische Fake-Daten um z.B. projects und employees importieren
function importData(db, sourcefile, done){
    db.count({}, function (err, count) {
        if(err){
            throw err;
        }
        if(count > 0) {
            done();
        }
        else {
            fs.readFile(sourcefile, { encoding: 'utf-8' }, function(err, json){
                if(err){
                    throw err;
                }
                var data = JSON.parse(json);
                db.insert(data, done);
            });
        }
    });
}

function getMultiHandler(req, res, next, err, doc){
  if(err){
    res.send(500, err);
  }
  else {
    res.send(200, doc);
  }
  return next();
}

function getSingleHandler(req, res, next, err, doc){
  if(err){
    res.send(500, err);
  }
  if(doc && doc.length > 0){
    res.send(200, doc[0]);
  }
  else {
    res.send(404, new Error('Not found'));
  }
  return next();
}


// Validierung
function defined(value){
  return (typeof value !== 'undefined' && value !== null);
}
function validate(doc){
  var errors = [];
  if(!defined(doc.project_id)){
    errors.push({ project_id: 'missing' });
  }
  if(!defined(doc.employee_id)){
    errors.push({ employee_id: 'missing' });
  }
  if(!defined(doc.description)){
    errors.push({ description: 'missing' });
  }
  if(!defined(doc.start_date)){
    errors.push({ start_date: 'missing' });
  }
  if(!defined(doc.time)){
    errors.push({ time: 'missing' });
  }
  if(!defined(doc.phase)){
    errors.push({ phase: 'missing' });
  }
  if(!defined(doc.contract)){
    errors.push({ contract: 'missing' });
  }
  return errors;
}

function getWorkitemsQuery(urlQuery)
{
    var query = new Object();
    if(defined(urlQuery.employee_id))
    {
        query.employee_id = parseInt(urlQuery.employee_id);
    }
    if(defined(urlQuery.min_start_date) && defined(urlQuery.max_start_date))
    {
        query.start_date = {
            $gte: parseInt(urlQuery.min_start_date),
            $lte: parseInt(urlQuery.max_start_date)
        }
    }
    return query;
}

async.parallel([
  importData.bind(null, projectsDb, __dirname + '/projects.json'),
  importData.bind(null, employeesDb, __dirname + '/employees.json'),
  importData.bind(null, workitemsDb, __dirname + '/workitems.json'),
  importData.bind(null, contractsDb, __dirname + '/contracts.json')
], function(){

  server.get('/echo', function(req, res, next){
    res.send({ echo: req.params.value });
    next();
  });

  server.get('/employees', function(req, res, next){
    employeesDb.find(req.query, getMultiHandler.bind(null, req, res, next));
  });

  server.get('/employees/:_id', function(req, res, next){
    employeesDb.find({ _id: req.params._id },
      getSingleHandler.bind(null, req, res, next));
  });

  server.get('/projects', function(req, res, next){
    projectsDb.find(req.query, getMultiHandler.bind(null, req, res, next));
  });

  server.get('/projects/:_id', function(req, res, next){
    projectsDb.find({ _id: req.params._id },
      getSingleHandler.bind(null, req, res, next));
  });

  server.get('/workitems', function(req, res, next){
    var dbQuery = getWorkitemsQuery(req.query);
    workitemsDb.find(dbQuery, getMultiHandler.bind(null, req, res, next));
  });

  server.get('/workitems/:_id', function(req, res, next){
    workitemsDb.find({ _id: req.params._id },
      getSingleHandler.bind(null, req, res, next));
  });

  server.post('/workitems', function(req, res, next){
    var doc = req.body;
    var errors = validate(doc);
    if(errors.length > 0){
      res.send(400, { 'invalid': errors });
      console.log('Fehler 400:', errors);
    }
    workitemsDb.insert(doc, function(err, newDoc){
      if(err){
        res.send(500, err);
        console.log('Fehler 500: ', err);
      }
      res.send(201, newDoc);
      return next();
    });
  });

  server.patch('/workitems/:_id', function(req, res, next){
    var update = req.body;
    var errors = validate(update);
    if(errors.length > 0){
      res.send(400, { 'invalid': errors });
      console.log('Fehler 400:', errors);
    }
    workitemsDb.update({ _id: req.params._id }, update, {}, function(err, num, doc){
      if(err){
        res.send(500, err);
        console.log('Fehler 500: ', err);
      }
      res.send('Ok');
      return next();
    });
  });

  server.del('/workitems/:_id', function(req, res, next){
    workitemsDb.remove({ _id: req.params._id }, {}, function(err, num){
      if(err){
        res.send(500, err);
        console.log('Fehler 500: ', err);
      }
      res.send(200, num);
      return next();
    });
  });

    server.get('/contracts', function(req, res, next){
    contractsDb.find(req.query, getMultiHandler.bind(null, req, res, next));
  });

  server.get('/contracts/:_id', function(req, res, next){
    contractsDb.find({ _id: req.params._id },
      getSingleHandler.bind(null, req, res, next));
  });

});


server.listen(1337, function(){
  console.log('Server listening @', server.url);
});
