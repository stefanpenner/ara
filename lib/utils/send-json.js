export default function sendJSON(obj) {
  process.send(JSON.stringify(obj));
}
