"use strict";

var util = require('util')

function inspect(obj) {
  return util.inspect(obj, false, null)
}

module.exports = {
  inspect: inspect
}
