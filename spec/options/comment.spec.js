"use strict"

var Ajv = require("../ajv")
require("../chai").should()

describe("$comment option", () => {
  describe("= true", () => {
    var logCalls, consoleLog

    beforeEach(() => {
      consoleLog = console.log
      console.log = log
    })

    afterEach(() => {
      console.log = consoleLog
    })

    function log() {
      logCalls.push(Array.prototype.slice.call(arguments))
    }

    it("should log the text from $comment keyword", () => {
      var schema = {
        $comment: "object root",
        properties: {
          foo: {$comment: "property foo"},
          bar: {$comment: "property bar", type: "integer"},
        },
      }

      var ajv = new Ajv({$comment: true})
      var fullAjv = new Ajv({allErrors: true, $comment: true})

      ;[ajv, fullAjv].forEach((_ajv) => {
        var validate = _ajv.compile(schema)

        test({}, true, [["object root"]])
        test({foo: 1}, true, [["object root"], ["property foo"]])
        test({foo: 1, bar: 2}, true, [["object root"], ["property foo"], ["property bar"]])
        test({foo: 1, bar: "baz"}, false, [["object root"], ["property foo"], ["property bar"]])

        function test(data, valid, expectedLogCalls) {
          logCalls = []
          validate(data).should.equal(valid)
          logCalls.should.eql(expectedLogCalls)
        }
      })

      console.log = consoleLog
    })
  })

  describe("function hook", () => {
    var hookCalls

    function hook() {
      hookCalls.push(Array.prototype.slice.call(arguments))
    }

    it("should pass the text from $comment keyword to the hook", () => {
      var schema = {
        $comment: "object root",
        properties: {
          foo: {$comment: "property foo"},
          bar: {$comment: "property bar", type: "integer"},
        },
      }

      var ajv = new Ajv({$comment: hook})
      var fullAjv = new Ajv({allErrors: true, $comment: hook})

      ;[ajv, fullAjv].forEach((_ajv) => {
        var validate = _ajv.compile(schema)

        test({}, true, [["object root", "#/$comment", schema]])
        test({foo: 1}, true, [
          ["object root", "#/$comment", schema],
          ["property foo", "#/properties/foo/$comment", schema],
        ])
        test({foo: 1, bar: 2}, true, [
          ["object root", "#/$comment", schema],
          ["property foo", "#/properties/foo/$comment", schema],
          ["property bar", "#/properties/bar/$comment", schema],
        ])
        test({foo: 1, bar: "baz"}, false, [
          ["object root", "#/$comment", schema],
          ["property foo", "#/properties/foo/$comment", schema],
          ["property bar", "#/properties/bar/$comment", schema],
        ])

        function test(data, valid, expectedHookCalls) {
          hookCalls = []
          validate(data).should.equal(valid)
          hookCalls.should.eql(expectedHookCalls)
        }
      })
    })
  })
})