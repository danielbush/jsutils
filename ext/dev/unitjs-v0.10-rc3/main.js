/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// Global variables used by this project.

var $dlb_id_au$ = $dlb_id_au$ || {};
$dlb_id_au$.unitJS = $dlb_id_au$.unitJS || {};
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// Main data structures used in unitjs.

$dlb_id_au$.unitJS.data = function() {

  var module = {};

  module.testStates = {

    // All tests start out like this:
    UNTESTED:'UNTESTED',

    // If there are no assertions or no sign of pass, failure or
    // error, then we use this:
    // Also if no test.fn is detected, set to this:

    NOTIMPLEMENTED:'NOTIMPLEMENTED',

    // If all assertions pass:
    PASS:'PASS',
    // If any assertion fails:
    FAIL:'FAIL',
    // If the test throws an error:
    ERROR:'ERROR'
  };

  // Main data structure.
  //
  // All unitjs installations will have a root 'tests' object.

  module.makeTests = function() {

    return {

      type:'tests',
      name:'unnamed section',

      // Summarises the overall state of this object and all its tests
      // and nested 'tests'.

      status:module.testStates.UNTESTED,

      // Can contain tests or test.

      items:[],

      // Stats.
      // 
      // @see makeStats
      // 
      // Each 'tests' object will have 2 versions:
      // - one for test objects defined in items
      // - a cumulative one for test objects and the cumulative stats of
      //   tests objects in items.

      stats:module.makeStats(),
      cumulative:module.makeStats(),

      // Setup/teardown functions to be run before/after every
      // 'test' item in 'items'.
      //
      // Your setup function should return something.
      // This will be passed as the 1st argument to the test
      // and to the teardown function.

      setup:null,
      teardown:null

    };

  };

  // Make a test.
  //
  // test.fn stores the test.
  // test.fn will have 'this' set to the assertions module.
  // eg this.assert(...).

  module.makeTest = function() {
    return {
      type:'test',
      test:'unnamed test',
      // The number of assertions that were executed.
      assertions:0,
      // Status of the test after running.
      status:module.testStates.UNTESTED,
      // The actual test.
      fn:function(){},
    };
  };

  // Used for stats and cumulative stats.
  //
  // See makeTests.

  module.makeStats = function() {
    return {
      // Count of passes, fails, errors.
      pass:0,
      fail:0,
      error:0,
      tests:0,
      assertions:0,
      not_implemented:0
    };
  };

  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// Utility functions used by various parts of unitjs.

$dlb_id_au$.unitJS.utils = function() {

  var module = {};

  module.each = function(thing,fn) {
    // thing.length handles 'arguments' object.
    if(thing.length) {
      for(var i=0;i<thing.length;i++) {
        fn(thing[i],i);
      }
    }
    else if(typeof(thing) == 'object') {
      for(var n in thing) {
        if(thing.hasOwnProperty(n)) {
          fn(thing[n],n);
        }
      }
    }
  };

  // Depth-first recursive walk of 'tests'.
  //
  // We iterate items.
  // If test, run 'visit'.
  // If tests, recurse.
  // For each invocation (ie each 'tests' instance), if 'sweep' is
  // given, iterate this over tests.items.  Note that this happens
  // after recursing on tests' nested tests.
  //
  // visit: this function will visit all 'test' and 'tests'
  // sweep:
  //   This function will iterate on items in a given 'tests' object.
  //   It can receive both 'test' and 'tests' objects (whatever is in
  //   'items').

  module.treewalk = function(tests,visit,sweep,postVisit,parentTests) {
    visit(tests,parentTests);
    if(tests.items) {
      module.each(tests.items,function(item){
        module.treewalk(item,visit,sweep,postVisit,tests);
      });
      if(sweep) {
        module.each(tests.items,function(item){
          sweep(tests,item);
        });
      }
    }
    if(postVisit) {
      postVisit(tests,parentTests);
    }
  };

  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
*/

// A singleton object that tracks things like assertion count during
// the running of a single test.
//
// Use 'reset' before running each test.
//
// It should be very easy to turn this into an instantiable object
// should we need to go down this path at some point.

$dlb_id_au$.unitJS.testLifetime = function() {

  var module = {};

  module.assertions = 0;  // must be reset on each run
  module.assertion_level = 0;

  // To be called before every assertion or it() within a test.
  module.before_assert = function(){
    module.assertion_level++;
    if(module.assertion_level==1) {
      module.assertions++;
    }
  };

  // To be called after every assertion or it() within a test.
  module.after_assert = function(){
    module.assertion_level--;
  };

  // To be called before running a test.
  module.reset = function() {
    module.assertions = 0;
    module.assertion_level = 0;
  };

  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
*/

// Utils for assisting with assertions and should.

$dlb_id_au$.unitJS.assert_utils = function() {

  var module = {};

  module.compare = function(a,b) {
    return (a===b);
  };

  // Check if both a,b are arrays.
  module.do_array_compare = function(a,b) {
    if(!a) return false;
    if(!b) return false;
    a = (a.constructor == Array);
    b = (b.constructor == Array);
    return (a && b);
  };

  // Recursively compare array of values.
  //
  // MOTIVATION
  // 
  // Two empty arrays are different (both != and !==).
  // When we're testing it's sometimes convenient
  // to be able to compare an array of values.

  module.array_compare = function(arr1,arr2) {
    var i,r;
    if(arr1.length!==arr2.length) {
      return false;
    }
    for(i=0;i<arr1.length;i++) {
      if(module.do_array_compare(arr1[i],arr2[i])) {
        r = module.array_compare(arr1[i],arr2[i]);
        if(r) {
          return true;
        } else {
          return false;
        }
      }
      else if(!module.compare(arr1[i],arr2[i])) {
        return false;
      }
    }
    return true;
  };

  /**
   * A more functional typeof.
   *
   * @param Object o
   * @return String
   */

  module.trueTypeOf = function(something) {
    var result = typeof something;
    try {
      switch (result) {
      case 'string':
      case 'boolean':
      case 'number':
        break;
      case 'object':
      case 'function':
        switch(something.constructor) {
        case String:
          result = 'String';
          break;
        case Boolean:
          result = 'Boolean';
          break;
        case Number:
          result = 'Number';
          break;
        case Array:
          result = 'Array';
          break;
        case RegExp:
          result = 'RegExp';
          break;
        case Function:
          result = 'Function';
          break;
        default:
          var m = something.constructor.toString().match(
              /function\s*([^( ]+)\(/
          );
          if (m)
            result = m[1];
          else
            break;
        }
        break;
      }
    }
    finally {
      result = result.substr(0, 1).toUpperCase() + result.substr(1);
      return result;
    }
  };

  /**
   * Return a string representation of something.
   */

  module.to_s = function(aVar) {
    var result = '<' + aVar + '>';
    if (!(aVar === null || aVar === undefined)) {
      result += ' (' + module.trueTypeOf(aVar) + ')';
    }
    return result;
  };

  // Deprecated.
  module.displayStringForValue = module.to_s;

  /*
   * Raise a failure - this should only be used when
   * an assertion fails.  
   *
   * This involves raising an error and giving it a 
   * special flag and user comment field.
   *
   * The comment field is optional and is not currently used by the
   * 'shoulds' module. 
   *
   */

  module.fail = function(comment,assertionTypeMessage) {
    var e = new Error(assertionTypeMessage);
    e.isFailure = true;
    e.comment = comment;
    throw e;
  };

  /**
   * Raise a general error.
   */

  module.error = function(errorMessage) {
    var e = new Error(errorMessage);
    e.description = errorMessage;  // FIXME: Do we need this???
    throw e;
  };


  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// This module defines the available assertions that can be made in
// your tests.
//
// DEPRECATED
// This is being replaced by the 'shoulds' module.

$dlb_id_au$.unitJS.assertions = function() {

  var module    = {};
  var utils     = $dlb_id_au$.unitJS.assert_utils;
  var STATE     = $dlb_id_au$.unitJS.data.testStates;
  var testLifetime = $dlb_id_au$.unitJS.testLifetime;

  // Wrap public assertions with a wrapper that calls
  // before/after_assert etc
  //
  // Called at end of this module.

  var wrapAssertions = function() {
    for(var i in module) {
      if(/^assert/.test(i)) {
        module[i] = function(assert_fn) {
          return function() {
            testLifetime.before_assert();
            assert_fn.apply(this,arguments);
            testLifetime.after_assert();
          };
        }(module[i]);
      }
    }
  };


  // Public assertions start here...
  //
  // Most of this code including utils is taken directly
  // from the original jsunit project.

  var _UNDEFINED_VALUE;

  var _assert = function(comment, booleanValue, assertionTypeMessage) {
    if (!booleanValue) {
      utils.fail(comment, assertionTypeMessage);
    }
  };

  module.assert = function() {
    module._validateArguments(1, arguments);
    var booleanValue = module.nonCommentArg(1, 1, arguments);

    if (typeof(booleanValue) != 'boolean')
      utils.error('Bad argument to assert(boolean)');

    _assert( module.commentArg(1, arguments), 
             booleanValue === true, 
             'Call to assert(boolean) with false');
  };

  module.assertTrue = function() {
    module._validateArguments(1, arguments);
    var booleanValue = module.nonCommentArg(1, 1, arguments);

    if (typeof(booleanValue) != 'boolean')
      utils.error('Bad argument to assertTrue(boolean)');

    _assert( module.commentArg(1, arguments), 
             booleanValue === true, 
             'Call to assertTrue(boolean) with false');
  };

  module.assertFalse = function() {
    module._validateArguments(1, arguments);
    var booleanValue = module.nonCommentArg(1, 1, arguments);

    if (typeof(booleanValue) != 'boolean')
      utils.error('Bad argument to assertFalse(boolean)');

    _assert( module.commentArg(1, arguments), 
             booleanValue === false, 
             'Call to assertFalse(boolean) with true');
  };

  module.assertEquals = function() {
    module._validateArguments(2, arguments);
    var var1 = module.nonCommentArg(1, 2, arguments);
    var var2 = module.nonCommentArg(2, 2, arguments);
    _assert( module.commentArg(2, arguments), 
             var1 === var2, 
             'Expected ' + 
             utils.displayStringForValue(var1) + 
             ' but was ' + 
             utils.displayStringForValue(var2));
  };

  module.assertNotEquals = function() {
    module._validateArguments(2, arguments);
    var var1 = module.nonCommentArg(1, 2, arguments);
    var var2 = module.nonCommentArg(2, 2, arguments);
    _assert( module.commentArg(2, arguments), 
             var1 !== var2, 
             'Expected not to be ' + 
             utils.displayStringForValue(var2));
  };

  module.assertNull = function() {
    module._validateArguments(1, arguments);
    var aVar = module.nonCommentArg(1, 1, arguments);
    _assert( module.commentArg(1, arguments), 
             aVar === null, 
             'Expected ' + 
             utils.displayStringForValue(null) + 
             ' but was ' + 
             utils.displayStringForValue(aVar));
  };

  module.assertNotNull = function() {
    module._validateArguments(1, arguments);
    var aVar = module.nonCommentArg(1, 1, arguments);
    _assert( module.commentArg(1, arguments), 
             aVar !== null, 
             'Expected not to be ' + 
             utils.displayStringForValue(null));
  };

  module.assertUndefined = function() {
    module._validateArguments(1, arguments);
    var aVar = module.nonCommentArg(1, 1, arguments);
    _assert( module.commentArg(1, arguments), 
             aVar === _UNDEFINED_VALUE, 
             'Expected ' + 
             utils.displayStringForValue(_UNDEFINED_VALUE) + 
             ' but was ' + 
             utils.displayStringForValue(aVar));
  };

  module.assertNotUndefined = function() {
    module._validateArguments(1, arguments);
    var aVar = module.nonCommentArg(1, 1, arguments);
    _assert( module.commentArg(1, arguments), 
             aVar !== _UNDEFINED_VALUE, 
             'Expected not to be ' + 
             utils.displayStringForValue(_UNDEFINED_VALUE));
  };

  module.assertNaN = function() {
    module._validateArguments(1, arguments);
    var aVar = module.nonCommentArg(1, 1, arguments);
    _assert(module.commentArg(1, arguments), isNaN(aVar),
            'Expected NaN');
  };

  module.assertNotNaN = function() {
    module._validateArguments(1, arguments);
    var aVar = module.nonCommentArg(1, 1, arguments);
    _assert(module.commentArg(1, arguments), !isNaN(aVar),
            'Expected not NaN');
  };

  // More general version of assertEquals
  // - assertEquals uses ===
  // - here we use == on strings and numbers
  //   so that object instances and literals are equal
  //   (see Notes below)
  // 
  // Notes
  // In javascript:
  //   - 1 == '1' => true
  //   - 'foo' == new String('foo')  => true
  //   - 'foo' === new String('foo') => false
  //

  module.assertObjectEquals = function() {
    module._validateArguments(2, arguments);
    var var1 = module.nonCommentArg(1, 2, arguments);
    var var2 = module.nonCommentArg(2, 2, arguments);
    var type1 = utils.trueTypeOf(var1);
    var type2 = utils.trueTypeOf(var2);
    var msg = module.commentArg(2, arguments) ? 
      module.commentArg(2, arguments):'';
    var isSame = (var1 === var2);
    var sameType = (type1 == type2);
    var isEqual = isSame || sameType;
    if(!isSame) {
      switch (type1) {
      case 'String':
        if(type2!='String') {isEqual = false; break; }
        isEqual = (var1 == var2);
        break;
      case 'Number':
        if(type2!='Number') {isEqual = false; break; }
        isEqual = (var1 == var2);
        break;
      case 'Boolean':
      case 'Date':
        isEqual = (var1 === var2);
        break;
      case 'RegExp':
      case 'Function':
        isEqual = (var1.toString() === var2.toString());
        break;
      default: //Object | Array
        var i;
        if (isEqual = (var1.length === var2.length))
          for (i in var1)
            module.assertObjectEquals(
              msg + ' found nested ' + 
                type1 + '@' + i + '\n', 
              var1[i], var2[i]);
      }
      _assert(msg, isEqual, 
              'Expected ' + utils.displayStringForValue(var1) + 
              ' but was ' + utils.displayStringForValue(var2));
    }
  };

  module.assertArrayEquals = module.assertObjectEquals;

  module.assertEvaluatesToTrue = function() {
    module._validateArguments(1, arguments);
    var value = module.nonCommentArg(1, 1, arguments);
    if (!value)
      utils.fail('',module.commentArg(1, arguments));
  };

  module.assertEvaluatesToFalse = function() {
    module._validateArguments(1, arguments);
    var value = module.nonCommentArg(1, 1, arguments);
    if (value)
      utils.fail('',module.commentArg(1, arguments));
  };

  module.assertHTMLEquals = function() {
    module._validateArguments(2, arguments);
    var var1 = module.nonCommentArg(1, 2, arguments);
    var var2 = module.nonCommentArg(2, 2, arguments);
    var var1Standardized = module.standardizeHTML(var1);
    var var2Standardized = module.standardizeHTML(var2);

    _assert( module.commentArg(2, arguments), 
             var1Standardized === var2Standardized, 
             'Expected ' + 
             utils.displayStringForValue(var1Standardized) + 
             ' but was ' + 
             utils.displayStringForValue(var2Standardized));
  };

  module.assertHashEquals = function() {
    module._validateArguments(2, arguments);
    var var1 = module.nonCommentArg(1, 2, arguments);
    var var2 = module.nonCommentArg(2, 2, arguments);
    for (var key in var1) {
      module.assertNotUndefined(
        "Expected hash had key " + key + 
          " that was not found", var2[key]);
      module.assertEquals(
        "Value for key " + key + 
          " mismatch - expected = " + var1[key] + 
          ", actual = " + var2[key], var1[key], var2[key]);
    }
    for (var key in var2) {
      module.assertNotUndefined(
        "Actual hash had key " + key + 
          " that was not expected", var1[key]);
    }
  };

  module.assertRoughlyEquals = function() {
    module._validateArguments(3, arguments);
    var expected = module.nonCommentArg(1, 3, arguments);
    var actual = module.nonCommentArg(2, 3, arguments);
    var tolerance = module.nonCommentArg(3, 3, arguments);
    module.assertTrue(
      "Expected " + expected + 
        ", but got " + actual + 
        " which was more than " + tolerance + 
        " away", Math.abs(expected - actual) < tolerance);
  };

  module.assertContains = function() {
    module._validateArguments(2, arguments);
    var contained = module.nonCommentArg(1, 2, arguments);
    var container = module.nonCommentArg(2, 2, arguments);
    module.assertTrue(
      "Expected '" + container + 
        "' to contain '" + contained + "'",
      container.indexOf(contained) != -1);
  };

  // Test if error object is a failure raised by an assertion.

  module.assertFailure = function(comment, errorObject) {
    module.assertNotNull(comment, errorObject);
    module.assert(comment, errorObject.isFailure);
    module.assertNotUndefined(comment, errorObject.comment);
  };

  // Test if error object is an error other than a failure
  // (indicating an error has been thrown which is not related
  // to an assertion/test).

  module.assertError = function(comment, errorObject) {
    module.assertNotNull(comment, errorObject);
    module.assertUndefined(comment, errorObject.isFailure);
    module.assertNotUndefined(comment, errorObject.description);
  };

  module.standardizeHTML = function(html) {
    var translator = document.createElement("DIV");
    translator.innerHTML = html;
    return translator.innerHTML;
  };

  module.argumentsIncludeComments = function(expectedNumberOfNonCommentArgs,args) {
    return args.length == expectedNumberOfNonCommentArgs + 1;
  };

  module.commentArg = function(expectedNumberOfNonCommentArgs,
                       args) {
    if (module.argumentsIncludeComments(
      expectedNumberOfNonCommentArgs,args))
      return args[0];

    return null;
  };

  module.nonCommentArg = function(desiredNonCommentArgIndex, 
                          expectedNumberOfNonCommentArgs, 
                          args) {
    return module.argumentsIncludeComments(
      expectedNumberOfNonCommentArgs, args) ?
      args[desiredNonCommentArgIndex] :
      args[desiredNonCommentArgIndex - 1];
  };
  
  module._validateArguments = function(expectedNumberOfNonCommentArgs,
                               args) {
    if (!( args.length == expectedNumberOfNonCommentArgs ||
           (args.length == expectedNumberOfNonCommentArgs + 1 && 
            typeof(args[0]) == 'string') ))
      module.error('Incorrect arguments passed to assert function');
  };


  wrapAssertions();
  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
*/

// An rspec-inspired lib for doing assertions in your tests.
//
// Intended to replace assertions.js.
//
// Provides:
//   it(...) => wrapper around some value you want to test
//   error_for(...) => returns error
//
// Example:
//   it(a).should.be(1);
//   var e = error_for(fail())
//   e.should.exist();
//   it(e.message).should.match(/blah/i);

$dlb_id_au$.unitJS.shoulds = function() {

  var module   = {};
  var utils    = $dlb_id_au$.unitJS.assert_utils;
  var testLifetime = $dlb_id_au$.unitJS.testLifetime;

  // ------------------------------------------------------------
  // Lower level stuff...

  module.Should = function(thing) {
    this.thing = thing;
  };

  module.Should.prototype = {

    // Test if something is the same 'expected'.
    //
    // Array comparison is included ie if two arrays
    // contain the same elements, they are considered identical.

    be:function(expected) {
      testLifetime.before_assert();
      if(utils.do_array_compare(this.thing,expected)) {
        if(!utils.array_compare(this.thing,expected)) {
          this._fail(expected,this.thing);
        }
      }
      else if(utils.compare(this.thing,expected)) {
      } else {
        this._fail(expected,this.thing);
      }
      testLifetime.after_assert();
    },

    not_be:function(expected) {
      testLifetime.before_assert();
      if(utils.do_array_compare(this.thing,expected)) {
        if(utils.array_compare(this.thing,expected)) {
          this._fail(expected,this.thing);
        }
      }
      else if(!utils.compare(this.thing,expected)) {
      } else {
        this._fail(expected,this.thing);
      }
      testLifetime.after_assert();
    },

    // Test if something matches regex.

    match:function(regex) {
      testLifetime.before_assert();
      if(!regex.test(this.thing)) {
        this._fail(regex,this.thing);
      }
      testLifetime.after_assert();
    },

    not_match:function(regex) {
      testLifetime.before_assert();
      if(regex.test(this.thing)) {
        this._fail(regex,this.thing);
      }
      testLifetime.after_assert();
    },

    // Test if something returns non-null or not-undefined.

    exist:function() {
      var expected = "*not null or not undefined*";
      testLifetime.before_assert();
      switch(this.thing) {
      case null: 
      case undefined: 
        this._fail(null,this.thing,expected);
        break;
      default:
        break;
      }
      testLifetime.after_assert();
    },

    not_exist:function() {
      var expected = "*either null or undefined*";
      testLifetime.before_assert();
      switch(this.thing) {
      case null: 
      case undefined: 
        break;
      default:
        this._fail(null,this.thing,expected);
        break;
      }
      testLifetime.after_assert();
    },

    _fail:function(expected,actual,expectedmsg) {
      if(expectedmsg) {
        expected = expectedmsg
      } else {
        expected = utils.to_s(expected);
      }
      var errorMsg = 'Expected ' + expected + 
        ' but was ' + utils.to_s(actual);

      utils.fail(null,errorMsg);
    }

  };

  // ------------------------------------------------------------
  // High level stuff

  // Create a should object that we can use over and over again.
  module.should = new module.Should(null);
  module.itretval = {should:module.should};

  module.it = function(thing) {
    //var should = new module.Should(thing):
    module.itretval.should.thing = thing;
    return module.itretval;
  };

  module.error_for = function(fn) {
    if(typeof fn != "function") {
      utils.fail(null,"error_for expects a function");
    }
    try {
      fn();
    } catch(e) {
      return e;
    }
    return null;
  };



  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// This module contains code for running tests and
// assembling/calculating stats.

$dlb_id_au$.unitJS.run = function() {

  var module = {};
  var data         = $dlb_id_au$.unitJS.data;
  var utils        = $dlb_id_au$.unitJS.utils;
  var doTest       = $dlb_id_au$.unitJS.assertions.doTest;
  var STATE        = $dlb_id_au$.unitJS.data.testStates;
  var testLifetime = $dlb_id_au$.unitJS.testLifetime;
  var assertions   = $dlb_id_au$.unitJS.assertions;
  var shoulds      = $dlb_id_au$.unitJS.shoulds;

  // Run a test 'test' and update it.

  module.doTest = function(test,tests) {
    var caught = false;
    var setup = null, teardown = null;
    testLifetime.reset();
    if(!test.fn) {
      test.status = STATE.NOTIMPLEMENTED;
      return;
    }
    if(tests.setup) {
      setup = tests.setup();
    }
    try {
      test.fn.call(assertions,setup);
    }
    catch(e) {
      caught = true;
      test.message = e.message;  // js error message
      test.comment = e.comment;  // assertion comment from author
      test.stack = e.stack;
      if(e.isFailure) {
        test.status = STATE.FAIL;
        test.message += '. Failure on assertion:'+(testLifetime.assertions);
      }
      else {
        test.status = STATE.ERROR;
      }
    }
    if(tests.teardown) {
      teardown = tests.teardown(setup);
    }
    test.assertions = testLifetime.assertions;
    if(!caught) {
      if(test.assertions === 0) {
        test.status = STATE.NOTIMPLEMENTED;
      } else {
        test.status = STATE.PASS;
      }
    }
    else {
    }
  };



  // Assumption here is that each 'item' in 'tests' will be passed to
  // this function in order and we can accumulate information in
  // 'tests'.
  //
  // If item is 'test', then increment the relevant counter in
  // tests.stats and tests.cumulative with the test outcome.
  // If item is 'tests', then add this to tests.cumulative.

  var sweep = function(tests,item) {
    if(!tests.stats) {
      tests.stats = data.makeStats();
    }
    if(!tests.cumulative) {
      tests.cumulative = data.makeStats();
    }
    if(item.type == 'test') {
      tests.stats.tests++;
      tests.cumulative.tests++;
      tests.cumulative.assertions += item.assertions;
      switch(item.status) {
      case STATE.PASS:
        tests.stats.pass++;
        tests.cumulative.pass++;
        break;
      case STATE.FAIL:
        tests.stats.fail++;
        tests.cumulative.fail++;
        break;
      case STATE.ERROR:
        tests.stats.error++;
        tests.cumulative.error++;
        break;
      case STATE.NOTIMPLEMENTED:
        tests.stats.not_implemented++;
        tests.cumulative.not_implemented++;
        break;
      };
    }
    if(item.type == 'tests') {
      tests.cumulative.assertions += item.cumulative.assertions;
      tests.cumulative.pass += item.cumulative.pass;
      tests.cumulative.fail += item.cumulative.fail;
      tests.cumulative.error += item.cumulative.error;
      tests.cumulative.not_implemented += item.cumulative.not_implemented;
      tests.cumulative.tests += item.cumulative.tests;
    }
  };

  var postVisit = function(item) {
    if(item.type == 'tests') {
      // Favour errors then fails.
      // Then not_implemented.
      // Then passes.
      if(item.cumulative.error>0) {
        item.status = STATE.ERROR;
      }
      else if(item.cumulative.fail>0) {
        item.status = STATE.FAIL;
      }
      else if(item.cumulative.not_implemented>0) {
        item.status = STATE.NOTIMPLEMENTED;
      }
      else if(item.cumulative.pass>0) {
        item.status = STATE.PASS;
      }
      else {
        item.status = STATE.NOTIMPLEMENTED;
      }
    }
  };

  // Run tests, recursing as required.

  module.run = function(tests) {
    utils.treewalk(
      tests,
      function(item,tests){
        if(item.type=='test') {
          module.doTest(item,tests);
        }
      },
      sweep,
      postVisit
    );
    return tests;
  };

  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// This module defines with_tests and with_tests$ functions.
//
// These functions allow you to define the order and structure of your
// tests.  You can arbitrarily nest "tests" sections, and each "tests"
// section can have 0 or more actual "test" elements.

$dlb_id_au$.unitJS.with$ = function() {

  var module = {};
  var data     = $dlb_id_au$.unitJS.data;
  var run      = $dlb_id_au$.unitJS.run.run;

  // Generate a 'tests' data structure of tests (nested 'tests' and
  // 'test' data structures).
  //
  // The tests are not executed.

  module.with_tests$ = function(name,fn,parentTests) {
    var msg;
    var tests = null;
    var o = {
      setup:function(fn) {
        tests.setup = fn;
      },
      teardown:function(fn) {
        tests.teardown = fn;
      },
      tests:function(name,fn) {
        var nestedTests = module.with_tests$(name,fn,tests);
        tests.items.push(nestedTests);
      },
      test:function(testName,fn) {
        var test = data.makeTest();
        test.test = testName;
        test.fn = fn;
        tests.items.push(test);
      }
    };
    tests = data.makeTests();
    tests.name = name;

    // Inherit setup/teardown:
    if(parentTests) {
      if(parentTests.setup) {
        tests.setup = parentTests.setup;
      }
      if(parentTests.teardown) {
        tests.teardown = parentTests.teardown;
      }
    }

    // Catch any funky stuff being done within a "tests" section.
    //
    // Sometimes people can accidentally put assertions here or
    // they do some global stuff that throws an error.

    try {
      if(typeof fn == "function") {
        fn(o);
      } else {
        // Do nothing.
      }
    } catch(e) {
      if(e.isFailure) {
        msg = "You tried to run an assertion in a 'tests' section called: '"+
          name+"'; it must be in a 'test' function.";
        console.log(msg);
        if(typeof alert != "undefined") {
          alert(msg);
        }
      } else {
        msg = "There was an error in your 'tests' section called: '"+
          name+"'; message: "+
          e.message + "; " + e.stack;
        console.log(msg);
        if(typeof alert != "undefined") {
          alert(msg);
        }
      }
    }
    return tests;
  };

  // Run module.with_tests$ and execute the tests.

  module.with_tests = function(name,fn) {
    var tests = module.with_tests$(name,fn);
    return run(tests);
  };


  return module;

}();
/*
   This is a source file for UnitJS a unit testing framework
   for javascript.
   Copyright (C) 2009-2014 Daniel Bush
   This program is distributed under the terms of the GNU
   General Public License.  A copy of the license should be
   enclosed with this project in the file LICENSE.  If not
   see <http://www.gnu.org/licenses/>.
  
   Parts of this code relating to assertions were taken from the
   JSUnit project: Edward Hieatt, edward@jsunit.net Copyright (C) 2003
   All Rights Reserved.

*/

// This module deals with iterating through a 'tests' structure and
// converting it into html (the DOM).
// 
// You could of course take the same iterations here and generate
// completely different output eg for terminal.

$dlb_id_au$.unitJS.print = function() {

  var module = {};
  var utils     = $dlb_id_au$.unitJS.utils;
  var states    = $dlb_id_au$.unitJS.data.testStates;

  (function(){

    // Generate a bunch of html nodes representing the output from
    // 'tests'.

    module.print = function(tests) {
      var d,o;

      utils.treewalk(tests,createNode,append);
      d = node('div',['-unitjs']);
      d.appendChild(tests.node);

      return {
        node:d,
        hideTests:function(reverse){
          utils.treewalk(tests,function(item){
            if(item.type == 'test') {
              if(reverse) {
                item.node.style.display = '';
              } else {
                item.node.style.display = 'none';
              }
            }
          });
        },
        hideDetails:function(reverse){
          utils.treewalk(tests,function(item){
            if(item.type == 'test') {
              if(reverse) {
                item.detailsNode.style.display = '';
              } else {
                item.detailsNode.style.display = 'none';
              }
            }
          });
        },
        showOnlyFailed:function(){
          utils.treewalk(tests,function(item){
            if(item.type == 'test') {
              var failed = (item.status == states.FAIL ||
                            item.status == states.ERROR);
              if(failed) {
                item.node.style.display = '';
                item.detailsNode.style.display = '';
              } else {
                item.node.style.display = 'none';
              }
            }
          });
        }
      };
    };


    var createNode = function(item) {
      var o;
      if(item.type == 'tests') {
        o = createTests(item);
        item.node = o.node;
        item.groupNode = o.groupNode;
      } 
      else if(item.type == 'test') {
        o = createTest(item);
        item.node = o.node;
        item.detailsNode = o.details;
        item.nameNode = o.name;
      } 
    };

    var append = function(tests,item) {
      tests.groupNode.appendChild(item.node);
    };

  })();

  // Create a DOM node with attribute class set to array of class
  // names in 'classes'.

  var node = function(tagname,classes,inner) {
    var d;
    d = document.createElement(tagname);
    if(classes) {
      utils.each(classes,function(cl){
        d.className += cl + ' ';
      });
    }
    if(inner) {
      d.innerHTML = inner;
    }
    return d;
  };

  // Create an input type=button.

  module.printButton = function(txt,click) {
    var button = node('input',null);
    button.setAttribute('type','button');
    button.setAttribute('value',txt);
    button.onclick = function(){click();};
    return button;
  };

  // Create an input type=button which toggles a reverse flag.
  //
  // 'reverse' alternates between false and true with every call.
  // 'reverse' is passed to 'click'.
  // If 'alttxt' is given, it will be used when reverse=true.

  module.toggleButton = function(txt,click,alttxt) {
    var reverse = false;
    var button = node('input',null);
    button.setAttribute('type','button');
    button.setAttribute('value',txt);
    button.onclick = function(){
      click(reverse);
      reverse=!reverse;
      if(alttxt) {
        if(reverse) {
          button.setAttribute('value',alttxt);
        } else {
          button.setAttribute('value',txt);
        }
      }
    };
    return button;
  };

  // Create div representing a 'tests' data structure.

  var createTests = function(tests) {
    var d = node('div',['tests',tests.status]);
    var d2,d3;
    var name;

    name = d2 = node('div',['name']);
    d2.innerHTML = tests.name;
    d2.appendChild(printStats(tests.cumulative));
    d2.appendChild(node('div',['clear']));
    d.appendChild(d2);

    d3 = node('div',['test-group']);
    d.appendChild(d3);

    name.onclick = function() {
      var disp = d3.style.display;
      if(disp=='none') {
        d3.style.display = '';
      } else {
        d3.style.display = 'none';
      }
    };
    d2.style.cursor = 'pointer';
    
    return {
      node:d,
      groupNode:d3
    };
  };

  // Create div representing a 'stats' data structure.

  var printStats = function(stats) {
    var d = node('div',['stats']);
    var f = function(key,val) {
      var tuple = node('span',['tuple']);
      tuple.appendChild(node('span',['key'],key));
      tuple.appendChild(node('span',['value'],String(val)));
      d.appendChild(tuple);
    };
    f('Pass:',stats.pass);
    f('fail:',stats.fail);
    f('error:',stats.error);
    f('not impl:',stats.not_implemented);
    f('tests:',stats.tests);
    f('assertions:',stats.assertions);
    return d;
  };

  // Create div representing a 'test' data structure.

  var createTest = function(test) {
    var d = node('div',['test',test.status]);
    var d2,d3;
    var name,details;
    name = d2 = node('div',['name']);
    d2.innerHTML = test.test;
    d.appendChild(d2);

    d3 = node('div',['status',test.status]);
    d3.innerHTML = test.status;
    d2.appendChild(d3);
    d2.appendChild(node('div',['clear']));

    details = d2 = node('div',['details']);
    d.appendChild(d2);

    if(test.comment) {
      d3 = node('div',['comment']);
      d3.appendChild(document.createTextNode(test.comment));
      d2.appendChild(d3);
    }
    if(test.message) {
      d3 = node('div',['message']);
      d3.appendChild(document.createTextNode(test.message));
      d2.appendChild(d3);
    }
    if(test.stack) {
      d3 = node('pre',['message']);
      d3.appendChild(document.createTextNode(test.stack));
      d2.appendChild(d3);
    }

    name.onclick = function() {
      var disp = details.style.display;
      if(disp == 'none') {
        details.style.display = '';
      } else {
        details.style.display = 'none';
      }
    };
    name.style.cursor = 'pointer';

    return {
      node:d,
      name:name,
      details:details
    };

  };

  return module;

}();
