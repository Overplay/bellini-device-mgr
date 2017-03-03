/**
 * Created by erikphillips on 3/3/17.
 */


var expect = require('chai').expect;
var should = require('should');
var request = require('request');
var util = require('util');

var baseUrl = "https://swapi.co/api";

// describe('A basic test', function () {
//     it('it should pass when everything is okay', function () {
//         expect(true).to.be.true;
//     });
// });

describe("return new test - describe statement", function () {
    it('return new test - it statement', function ( done ) {
        request.get({url: baseUrl + '/people/1/' },
            function (error, response, body) {
                expect(response.statusCode).to.equal(200);
                console.log(body);
                done();
            });
    });
});
