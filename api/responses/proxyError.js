/**
 * Proxy Error Handler
 *
 * Converts SuperAgent proxy error to Sails
 */

module.exports = function proxyError (data) {

  // Get access to `req`, `res`, & `sails`
  var res = this.res;

  // Set status code
  res.status(data.status);
  return res.jsonx( data.body );


};

