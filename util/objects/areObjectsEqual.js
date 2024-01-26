function areObjectsEqual(firstObj, secondObj) {
  const keysFirstObject = Object.keys(firstObj);
  const keysSecondObject = Object.keys(secondObj);

  if (keysFirstObject.length !== keysSecondObject.length) return false;

  for (const key of keysFirstObject) {
    if (typeof firstObj[key] === 'object' && typeof secondObj[key] === 'object') {
      if (!areObjectsEqual(firstObj[key], secondObj[key])) {
        return false;
      }
    } else if (firstObj[key] !== secondObj[key]) {
      return false;
    }
  }

  return true;
}

module.exports = areObjectsEqual;
