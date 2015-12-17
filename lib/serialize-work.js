export default function serializeWork(cb) {
  return '(' + cb.toString() + '());';
}
