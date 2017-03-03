/**
 * Created by erikphillips on 3/3/17.
 */


var expect = require('chai').expect;
var should = require('should');
var request = require('request');
var util = require('util');

var baseUrl = "https://localhost:2001";

describe("return new test - describe statement", function () {
    it('return new test - it statement', function ( done ) {
        var appid = "/erikdev";
        var deviceid = "/1234";

        request.get({url: baseUrl + '/appmodel' + appid + deviceid},
            function (error, response, body) {
                // expect(response.statusCode).to.equal(200);
                // console.log(error);
                done();
            });
    });
});
