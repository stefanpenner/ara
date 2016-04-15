var ara = require('./dist/ara');
var Worker = ara.Worker;
var maxCPU = ara.maxCPU;
var Promise = require('rsvp').Promise;

function log(task) {
  return task.then(function(value) {
    console.log('result', value);
  }).catch(function(reason) {
    console.log('oMG fail', reason);
  }).finally(function() {
    console.log('finally');
  });
}

function work() {
  var result = require("babel-core").transform("1+1");

  return {
    code: result.code,
    map:result.map
  };
}

var start = Date.now();

var workers = new Array(maxCPU);
for (var i = 0; i < maxCPU; i++) {
  workers[i] = new Worker('./dist/runner');
}

function runWork(worker) {
  return worker.run(work);
}

function simulate() {
  return Promise.all(workers.map(runWork))
}

simulate().then(function() {
  console.log('first', Date.now() - start);
  workers.forEach(function(w) {
    console.log(w.toJSON());
    w.totalTime = 0;
  });
  start = Date.now();
}).then(simulate).then(simulate).then(simulate)
       .finally(function() {
  workers.map(function(w) {
    w.terminate();
  });

  workers.forEach(function(w) {
    console.log(w.toJSON());
    w.totalTime = 0;
  });
  console.log('total', Date.now() - start);
});

// var pool = new Pool({ processes: 4 });

// pool.run(work);

// Promise.all([
//   log(pool.run(work)),
//   log(pool.run(work))
// ]).finally(function() {
//    w.terminate();
// });

