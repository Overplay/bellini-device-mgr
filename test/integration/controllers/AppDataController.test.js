/**
 * Created by erikphillips on 3/3/17.
 */

// var server = require('../../../app.js');
// var chai = require('chai');
// var chaiHttp = require('chai-http');
//
// chai.use(chaiHttp);
//
var expect = require('chai').expect;
// var should = require('should');
// var request = require('request');
// var util = require('util');

var baseUrl = "http://localhost:2001";
var request = require('supertest')(baseUrl);
var assert = require('chai').assert;



describe("AppDataController Tests", function () {
    // it('GET request for appid=erik deviceid=1234', function ( done ) {
    //     var url = "/appmodel/erik/1234";
    //
    //     request.get({url: baseUrl + url}, function (error, response) {
    //         expect(response.statusCode).to.equal(200);
    //
    //         var body = JSON.parse(response.body);
    //         expect(body.forAppId).to.equal("erik");
    //         expect(body.forDeviceId).to.equal("1234");
    //
    //         done();
    //     });
    // });

    // it('GET request for appid=erik deviceid=1234 - different type', function ( done ) {
    //    chai.request(server)
    //        .get("/appmodel/erik/1234")
    //        .end(function (err, res) {
    //            console.log(res);
    //            done();
    //        });
    // });

    it("simple post request using appid=emp deviceid=1", function (done) {
        var req = request.post("/appmodel/emp/2");
        req.send({
            "appId":"erikdev",
            "deviceId":"1234",
            "data": {"red": 10}
        });
        req.end(function (err, res) {
            if (err) {
                throw err
            }

            assert.equal(res.status, 200, "expecting a 200 status");
            assert.property(res.body, "forAppId", "checking for appid field");
            assert.property(res.body, "forAppId", "erik", "checking appid");

            done();
        })
    });

    it("GET request");
    it("PUT request");
    it("POST request");
});
