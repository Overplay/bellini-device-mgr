const _ = require('lodash');
const util = require('util');

let source = [ { msg: 'a msg', id: 'asdf' }, { msg: 'b msg', id: 'dfgh' }, { msg: 'c msg', id: 'ghj' }];

_.pullAllWith(source, [{ msg: 'a msg', id: 'asdf' }], _.isEqual);

console.log(util.inspect(source));

