import Worker from '../worker';
export default function() {
   return new Worker(__dirname + '/runner.js');
}
