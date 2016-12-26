export default function serializeError(error) {
  return {
    name:    error.name,
    message: error.message,
    stack:   error.stack
  };
}
