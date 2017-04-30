/**
 * Proxy Error Handler
 *
 * Converts SuperAgent proxy error to Sails
 */

module.exports = function proxyError (data) {

  // Get access to `req`, `res`, & `sails`
  var res = this.res;

  // Handle peer down first

  var code = data.originalError && data.originalError.code;

  if (code == 'ECONNREFUSED'){
    return res.serverError({ error: 'peer down'});
  }

  // Set status code
  res.status(data.status);
  return res.jsonx( data.body );


};

