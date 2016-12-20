1. lives in current process (ask) <--- all actors have the same protocol
2. lives in sub-process (receive, transform)

var system = new System();
var Babel = system.actorOf('./actors/babel');
// ActorClassReference
// guardian actor (owner)

var ESlint = system.actorOf('./actors/eslint');

babel.send('1+1').then(function(result) {
  console.log(code, result.code);
  console.log(code, result.map);
  babel.kill();
});

// 0 -> J (jobs) number of subprocess <--
// queue of work
// some "pool" here is an actor, and here is work. Make it happen.

// // hide the fact that there many babel, 
// poolOfBabel.send(work).then(function(result) {NV

// });

// poolOfJshint is actually the same processes as babel.


// TODO:
//
// * ask the "system" to transpile many files (work)
// * the system should (based on JOB count) fulfill those work orders

var Babel = system.actorOf('./actors/babel');

var pool = new system.Pool({ type: 'process', jobs: 6 });

pool.schedule(Babel, { code: '1+1' }).then(result => {
  console.log(code, result.code);
  console.log(code, result.map);
})

pool.schedule(Babel, { code: '1+1' }).then(result => {
  console.log(code, result.code);
  console.log(code, result.map);
});

pool.schedule(Babel, { code: '1+1' }).then(result => {
  console.log(code, result.code);
  console.log(code, result.map);
});

let work = pool.schedule(ESlint, { code: '1+1' });

// work {
//   cancel() { },
//   eventualValue() { },
// };

work.kill();

work.eventualValue().then(result => {
  console.log(code, result.code);
  console.log(code, result.map);
});

pool.kill().then(function() {

}); <-- reject if not able to kill
