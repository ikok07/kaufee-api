function deepFilterObject(obj, ...allowedFields) {
  const result = {};

  for (const s of allowedFields) {
    let from = obj,
      to = result;

    const path = s.split('.');

    const prop = path.pop();

    for (const p of path) {
      to = to[p] ??= {};
      from = from[p];
    }

    to[prop] = from[prop];
  }
  return result;
}

module.exports = deepFilterObject;
