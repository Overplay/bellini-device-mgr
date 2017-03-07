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

    // it("simple post request using appid=emp deviceid=1", function (done) {
    //     var req = request.post("/appmodel/emp/2");
    //     req.send({
    //         "appId":"erikdev",
    //         "deviceId":"1234",
    //         "data": {"red": 10}
    //     });
    //     req.end(function (err, res) {
    //         if (err) {
    //             throw err
    //         }
    //
    //         assert.equal(res.status, 200, "expecting a 200 status");
    //         assert.property(res.body, "forAppId", "checking for appid field");
    //         assert.property(res.body, "forAppId", "erik", "checking appid");
    //
    //         done();
    //     })
    // });

    describe("Normal AppData Flow", function () {
        it("POST request to add new entry into database", function ( done ) {
            var req = request.post("/appmodel/test/1");
            req.send({
                "appId": "test",
                "deviceId": "1",
                "data": {"red": 10}
            });
            req.end(function (err, res) {

                assert.isNull(err, "null error check");
                assert.equal(res.status, 200, "check for 200 status");

                assert.isObject(res.body, "check for returned body");
                assert.property(res.body, "forAppId", "check for appid property");
                assert.property(res.body, "forDeviceId", "check for deviceid property");
                assert.property(res.body, "forAppId", "test", "check appid value");
                assert.property(res.body, "forDeviceId", 1, "check for deviceid value");

                done();
            });
        });

        it("PUT request to change the entry in the database", function ( done ) {
            var req = request.put("/appmodel/test/1");
            req.send({
                "appId": "test",
                "deviceId": "1",
                "data": {"red": 20}
            });
            req.end(function (err, res) {
                assert.isNull(err, "null error check");
                assert.equal(res.status, 200, "check for 200 status");

                assert.isObject(res.body[0], "check for returned body");
                assert.property(res.body[0], "forAppId", "check for appid property");
                assert.property(res.body[0], "forDeviceId", "check for deviceid property");
                assert.property(res.body[0], "forAppId", "test", "check appid value");
                assert.property(res.body[0], "forDeviceId", 1, "check for deviceid value");

                assert.deepProperty(res.body[0], "data.red", "check for data.red");
                assert.deepPropertyVal(res.body[0], "data.red", 20, "check data.red value");

                done();
            });
        });

        it("GET request to verify entry in the database", function ( done ) {
            var req = request.get("/appmodel/test/1");
            req.end(function (err, res) {
                assert.isNull(err, "null error check");
                assert.equal(res.status, 200, "check for 200 status");

                assert.isObject(res.body, "check for returned body");
                assert.property(res.body, "forAppId", "check for appid property");
                assert.property(res.body, "forDeviceId", "check for deviceid property");
                assert.property(res.body, "forAppId", "test", "check appid value");
                assert.property(res.body, "forDeviceId", 1, "check for deviceid value");

                assert.deepProperty(res.body, "data.red", "check for data.red");
                assert.deepPropertyVal(res.body, "data.red", 20, "check data.red value");

                done();
            });
        });

        it("DELETE request to remove the entry from the database", function ( done ) {
            var req = request.delete("/appmodel/test/1");
            req.end(function (err, res) {
                assert.isNull(err, "null error check");
                assert.equal(res.status, 200, "check for 200 status");

                assert.isObject(res.body[0], "check for returned body");
                assert.property(res.body[0], "forAppId", "check for appid property");
                assert.property(res.body[0], "forDeviceId", "check for deviceid property");
                assert.property(res.body[0], "forAppId", "test", "check appid value");
                assert.property(res.body[0], "forDeviceId", 1, "check for deviceid value");

                done();
            });
        });
    });

    describe("GET Error Checking", function () {
        it("GET request to verify no entry in database", function ( done ) {
            var req = request.get("/appmodel/test/1");
            req.end(function (err, res) {

                assert.equal(res.status, 400, "check for 400 status (not found)");

                done();
            });
        });
    });

    describe("POST Error Checking", function () {
        it("POST request to add entry to database", function ( done ) {
            var req = request.post("/appmodel/test/1");
            req.send({
                "appId": "test",
                "deviceId": "1",
                "data": {"red": 10}
            });
            req.end(function (err, res) {

                assert.isNull(err, "null error check");
                assert.equal(res.status, 200, "check for 200 status");

                assert.isObject(res.body, "check for returned body");
                assert.property(res.body, "forAppId", "check for appid property");
                assert.property(res.body, "forDeviceId", "check for deviceid property");
                assert.property(res.body, "forAppId", "test", "check appid value");
                assert.property(res.body, "forDeviceId", 1, "check for deviceid value");

                done();
            });
        });

        it("POST request to add duplicate entry to database", function ( done ) {
            var req = request.post("/appmodel/test/1");
            req.send({
                "appId": "test",
                "deviceId": "1",
                "data": {"red": 10}
            });
            req.end(function (err, res) {

                assert.isNull(err, "null error check");
                assert.equal(res.status, 400, "check for 400 status (bad request)");

                done();
            });
        });

        it("DELETE request to clean up after posts", function ( done ) {
            var req = request.delete("/appmodel/test/1");
            req.end(function (err, res) {
                assert.isNull(err, "null error check");
                assert.equal(res.status, 200, "check for 200 status");

                assert.isObject(res.body[0], "check for returned body");
                assert.property(res.body[0], "forAppId", "check for appid property");
                assert.property(res.body[0], "forDeviceId", "check for deviceid property");
                assert.property(res.body[0], "forAppId", "test", "check appid value");
                assert.property(res.body[0], "forDeviceId", 1, "check for deviceid value");

                done();
            });
        });
    });

    describe("PUT Error Checking", function () {
        it("PUT request to modify non-existent entry in database", function ( done ) {
            var req = request.put("/appmodel/test/1");
            req.send({
                "appId": "test",
                "deviceId": "1",
                "data": {"red": 20}
            });
            req.end(function (err, res) {

                assert.isNull(err, "null error check");
                assert.equal(res.status, 400, "check for 400 status (not found)");

                done();
            });
        });
    });

    describe("DELETE Error Checking", function () {
        it("DELETE request to remove non-existent entry in database", function ( done ) {
            it("DELETE request to clean up after posts", function ( done ) {
                var req = request.delete("/appmodel/test/1");
                req.end(function (err, res) {

                    assert.isNull(err, "null error check");
                    assert.equal(res.status, 400, "check for 400 status (not found)");

                    done();
                });
            });
        });
    });
});
