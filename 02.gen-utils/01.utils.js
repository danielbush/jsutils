/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

/*
  map/each
  ========
  map/each functions are self-explanatory and probably unnecessary
  given the right version of js or the use of a library like
  underscore.js.

  Recursive iteration and mapping
  ===============================

  eachr
  -----
  each will iterate through object and arrays.
  eachr will do likewise, but will recurse on the values found during
  this iteration.
  During each call, eachr will pass the current object it is looking
  at to the function supplied to it, then recursing on that object's
  elements, then call the same function again afterwards.
  A flag is passed to the function to tell it which phase.

  mapr
  ----
  Similar to eachr but if you alter the object passed
  to the function, it will alter a clone.  mapr will
  always recurse on the original.  If you add fields to
  an object or elements to an array, these will be on
  the clone.

*/


$dlb_id_au$.utils.gen_utils = function() {

  var module = {};

  // Make a new object whose prototype is `o`.
  //
  // Taken from Douglas Crockford:
  // http://javascript.crockford.com/prototypal.html

  module.object = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
  };

  // Transform `thing` using `fn`.
  //
  // If `fn` not provided, `map` will act like
  // a shallow clone, creating a copy of the object
  // but using the same members as the original.

  module.map = function(thing,fn) {
    var m;
    if(thing.length) {
      m = [];
      module.each(thing,function(n,key){
        if(fn) {
          m.push(fn(n,key));
        } else {
          m.push(n);
        }
      });
      return m;
    }
    else if(typeof(thing)=='object') {
      m = {};
      module.each(thing,function(n,key){
        if(fn) {
          m[key] = fn(n,key);
        } else {
          m[key] = n;
        }
      });
      return m;
    }
  };

  // Iterate through array or object.

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

  // Recurse on nested objects and arrays passing the
  // object or array to `fn` both before and after
  // recursing on its members.
  //
  // Usage:
  //   eachr(thing,null,fn)
  // The other arguments are used when recursing.
  //
  // `fn` is called like this
  //   fn(thing,index.before,p)
  // If `fn` returns true, then stop recursing.
  // 
  // For example, if the object is a DOM element
  // you probably don't want to recurse on it.
  // (You may want to recurse on it using a DOM tree walker
  // instead).
  // Use `each` to iterate through each object inside `fn`.
  //
  // We pass `nested` because this just a handy thing
  // to see when debugging the recursion.
  //
  // If you want to modify the thing you are recursing
  // on, you should probably attempt this only when
  // the before flag is false.
  // If you want to transform the thing you are recursing
  // on but don't want to alter it, consider using
  // mapr.

  module.eachr = function(thing,fn,index,nested,p) {
    var r;
    // The outer call should not set `nested`.
    // We set it to zero.
    if(!nested) nested=0;
    if(thing instanceof Array) {
      r = fn(thing,index,true,nested,p);
      if(!r) {
        for(var i=0;i<thing.length;i++) {
          module.eachr(thing[i],fn,i,nested+1,thing);
        }
      }
      r = fn(thing,index,false,nested,p);
    }
    else if(typeof(thing) == 'object') {
      r = fn(thing,index,true,nested,p);
      if(!r) {
        for(var n in thing) {
          if(thing.hasOwnProperty(n)) {
            module.eachr(thing[n],fn,n,nested+1,thing);
          }
        }
      }
      r = fn(thing,index,false,nested,p);
    } else {
      r = fn(thing,index,true,nested,p);
    }
  };

  (function(){

    // Similar to eachr: recurse on `thing` but generate a copy of
    // `thing` as we recurse.
    //
    // `fn` only sees the copy so you can add properties
    // to it etc and not affect the original which
    // is in the process of being recursed on.
    //
    // The return value of `fn` is not used to transform
    // the mapping, instead following eachr semantics.
    // To transform existing elements in the clone,
    // alter `thing` and assign it to `p[index]`.
    //
    // The intention is that `thing` is a nested combination
    // of object and array literals (or something of that nature).

    module.mapr = function(thing,fn,index,nested,p) {
      var r,o;
      if(!nested) nested=0;

      // eg {prop:null}
      if(!thing) return thing;

      // Pass `o` to `fn` but recurse on `thing`.
      // Also note that we pass `o` as `p` when
      // recursing.

      if(thing instanceof Array) {
        o = clone(thing,p,index);
        r = fn(o,index,true,nested,p);
        if(!r) {
          for(var i=0;i<thing.length;i++) {
            module.mapr(thing[i],fn,i,nested+1,o);
          }
        }
        r = fn(o,index,false,nested,p);
      }
      else if(typeof(thing) == 'object') {
        o = clone(thing,p,index);
        r = fn(o,index,true,nested,p);
        if(!r) {
          for(var n in thing) {
            if(thing.hasOwnProperty(n)) {
              module.mapr(thing[n],fn,n,nested+1,o);
            }
          }
        }
        r = fn(o,index,false,nested,p);
      }
      else {
        r = fn(thing,index,true,nested,p);
      }

      return o;
    };

    var clone = function(thing,p,pindex) {

      // Shallow clone:
      var o = module.map(thing);

      // p is the ancestor of o but it
      // was a shallow clone of `thing`, so
      // p's members are the originals.
      // So what we are doing here is replacing
      // them with o.

      if(p) {
        p[pindex] = o;
      }
      return o;
    };

  })();

  // Merge b into a.
  //
  // a,b should be objects.
  // Arrays are not handled as arrays(!).
  // Generally, a and b are probably
  // object literals that you are working
  // with.
  //
  // For convenience `a` is returned.
  // 

  module.merge = function(a,b) {
    module.each(b,function(bval,bname){
      a[bname] = bval;
    });
    return a;
  };

  // Run fn n-times; if fn returns false, then halt.

  module.dotimes = function(n,fn) {
    var result;
    for(var i=0;i<n;i++) {
      result = fn(i);
      if(result===false) return;
    }
  };

  // Join elements in arr where arr is result of
  // String.prototype.split.
  // 
  // `unsplit`: will be run on every empty gap in the array
  //            including before and after
  // `process`: is called only for non-blank gaps
  // `o`      : is an optional object you can pass in which will be
  //            passed on to `unsplit` and `process`
  //
  // DEPRECATED
  // Use interleave.

  module.join = function(arr,unsplit,process,o) {
    var i,l=arr.length;
    for(i=0;i<l;i++) {
      if(arr[i]!=='') {
        process(arr[i],o);
      }
      //process(arr[i],o);
      if(i!=l-1) {
        unsplit(o);
      }
    }
    return o;
  };

  module.when = function(condfn,fn,timeout,interval) {
    var wid,elapsed=0;
    if(!timeout) timeout = 0; // forever
    if(!interval) interval = 300;
    wid = setInterval(function(){
      if(condfn()) {
        fn();
        window.clearInterval(wid);
      }
      if(timeout > 0) {
        elapsed+=interval;
        if(elapsed > timeout) {
          window.clearInterval(wid);
        }
      }
    },interval);
    return wid;
  };

  // Take array and interleave members in pairs.
  // 
  // If arr is [1,2,3] then
  // interleave([1,2,3],true) => [[1,2],[2,3]]
  // interleave([1,2,3],fn,true) => [fn(1,2),fn(2,3)]
  // interleave([1,2,3],fn) => nil, side effect: fn(1,2),fn(2,3)
  //
  // MOTIVATION
  // For example, joining items in a linked list or join text
  // with a delimiter.  (See tests.)
  // Both examples don't rely on interleave to return or
  // transform its input.
  // So, if you want that, you need to set map=true.
  //
  // If you do
  //   interleave.call(someObject,...)
  // then
  //   fn will be called: fn.call(this,...)
  // 
  // This can allow you to accumulate results.
  // eg To join an array into a comma-delimited string.

  module.interleave = function(arr,fn,map) {
    var i,r,arr2;
    if(!fn) {
      fn = function() {
        return [arguments[0],arguments[1]];
      };
    }
    if(map) {
      arr2=[];
    }

    for(i=0;i<arr.length;i++) {
      if(i==(arr.length-1)) {
        break;
      }
      r = fn.call(this,arr[i],arr[i+1]);
      if(map) {
        arr2.push(r);
      }
    }
    if(!map) {
      return;
    } else {
      return arr2;
    }
  };

  return module;

}();

