export default function serializeWork(cb) {
  return '(' + cb.toString() + '(typeof payload === "object" && payload.arg));';
}
