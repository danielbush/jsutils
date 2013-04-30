/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Suppose you have several different objects of different types but
// you all want them to have something common.  Maybe you want them to
// all be entries in a list.
// In java you could make them implement an interface for list
// entries.
// Another oop approach is to subclass some sort of list entry class.
// Another freestyle (duck typing) approach, we just assume that the
// object will have the required properties and/or methods.
// Facets (below) use a form of delegation.
// We create a separate object to be the list entry (or whatever it is
// you want), and make it a property of the actual object we are
// dealing with.
//
// An example:
// 'o' is an object.
// 'makeFn' is a function that creates an object.
// 
//   var fooType = makeFacet('foo',makeFn);
//   var fooInstance = fooType(o);
//   // Do something with fooInstance.
//   // eg apply foo operations on fooInstance.
//   
//   // Get 'o' back.
//   o = deref(fooInstance);
//
// You can incorporate facets into the creation/instantiation of your
// objects so you don't explicity have to call fooType above to create
// the facet.
//
// Subsequently, you need to call fooType on the given object to get
// the fooType object.
//
// Why?
// Reduction in method or field name clashes.
// The facet is stored as a field in the existing object.
//   fn = makeFacet('bar',fn)
//   fn(o) => o.$$bar=<bar object>
// I've always liked (java) interfaces.  Interfaces are "flat".  They
// specify what something should do but leave the implementation free.
// Facets aren't interfaces.  But they are just a way to allow a
// single object 'o' to take on multiple identities with little chance
// of clashing.
// eg
// An object could behave like a list entry with 'next'/'previous'
// properties. A facet could be full blown instantiated object.
// Whatever is returned by makeFn.
//
// Facets are a formalisation of a very simple idea you could easily
// do yourself.
// Simply add the facet to a field of your choosing:
//   o.field1 = makeFn(...)
// The above does not add a field to the result of makeFn so that you
// can refer to 'o'.  Facets do this by setting a '$$parent' property.
//   o.field1.$$parent = o
// And that's pretty much it.



$dlb_id_au$.utils.facets = function() {

  var module = {};

  // Return a function that takes an object (o) and adds a facet (f)
  // to it.
  //
  // f is an object stored in $$typeName, a property of o.

  module.makeFacet = function(typeName,makeFn) {
    typeName = '$$' + typeName;
    return function(o,params) {
      if(!o[typeName]) {
        o[typeName] = makeFn.apply(null,params);
        o[typeName].$$parent = o;
      }
      return o[typeName];
    };
  };

  // Return 2 functions.
  //
  // A facet-making function for typename/makefn and a test function
  // to test for the facet in some object.

  module.makeFacet2 = function(typeName,makeFn) {
    typeName = '$$' + typeName;
    return {
      make:function(o,params) {
        if(!o[typeName]) {
          o[typeName] = makeFn.apply(null,params);
          o[typeName].$$parent = o;
        }
        return o[typeName];
      },
      test:function(o) {
        return o[typeName];
      }
    };
  };

  module.deref = function(o) {
    return o.$$parent;
  };

  return module;

}();

