const hasAllRequiredKeys = function (obj, requiredKeys) {
  const hasAllKeys = requiredKeys.every(key => key in obj);
  return hasAllKeys;
};

module.exports = hasAllRequiredKeys;
