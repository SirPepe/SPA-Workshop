var restify = require('restify');
var fs = require('fs');
var server = restify.createServer();


// Statische Fake-Daten für Projekte und Personen
function sendJSON(filename){
  return function(req, res, next){
    fs.readFile(filename, { encoding: 'utf-8' }, function(err, data){
      if(err) throw err;
      res.send(JSON.parse(data));
      return next();
    });
  };
}
server.get('/projects', sendJSON('projects.json'));
server.get('/employees', sendJSON('employees.json'));


// Tatsächliche REST-API
server.get('/items', function(req, res, next){});
server.post('/items', function(req, res, next){});
server.get('/items/:id', function(req, res, next){});
server.patch('/items/:id', function(req, res, next){});
server.del('/items/:id', function(req, res, next){});


server.listen(1337, function(){
  console.log('Server listening @', server.url);
});
