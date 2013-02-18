/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


// [TODO]
// Who: danb, Sat Jan 19 18:05:15 EST 2013
// [1a] be able to create structures with default values; atm when we
// make an instance of a schema, we have to specify something in order
// for it to be there.
// [1b] Suppose we have a nested definition with an object or array, it
// would be nice to be able to have a blank array or object present.
// Or would it? The situation like [3] below can arise, where we have
// an existing instance of an ND (nested definition), that we want to
// insert into something -- see [3].
// [2] add controlled vocab or enum-like values; just for V's not
// definitions.  Example: a boolean type which forces you to only use
// true/false, or a range, or a set of allowed values.
// [3] where we have a nested definition ND in some definition D that we
// use as a definition in its own right, is there some way we can
// update D with an existing instance of ND.  Atm, if we use
// withInstance, we're basically having to iterate through the whole
// thing generate a copy into an instance of D.

$dlb_id_au$.domutils.schema3 = function(){

  var module = {};
  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var pretty    = $dlb_id_au$.utils.pretty_print.p;

  var isValue = function(thing) {
    if(!thing) return true;
    if(typeof(thing)=='object') return false;
    // What's left: primitives (number, boolean), functions etc
    // These should all be treated like values (ie we don't recurse
    // on them).
    return true;
  }

  // Generates a make function that makes an object according to
  // (schema-like) definition 'defn'.
  //
  // See examples at bottom.
  //
  // How to understand this function:
  // - we call gen on a schema defn (D)
  // - there are 4 types of defns
  //   - array, D = [D|V]
  //   - keyed array (_key_), {_key_:D|V}
  //   - assoc array 
  //     {a:D|V,b:D|V,...} where a,b are specified set of keys
  //   - values (V) (eg null,1,true,functions etc)
  //     This is like a terminal symbol in a grammar.
  // - each definition except for V, may be recursively defined
  //   - so arrays could be arrays of nested defns (ND), similarly
  //     keyed arrays etc
  //   - D|V means "either D or V"
  // - gen will take definition D and create 'make' M and
  //   'withInstance' W functions for that defn;
  //   but it will also recurse on the nested definition/s in D
  //
  // So, we have a 'make' function M.
  // Associated with M are
  // - 'o', a container which allows us to add methods/data and
  //   which is passed to the function given to 'make'
  // - a definition D that was passed to 'gen' which created 'make'
  // - a 'result' representing an instance of D that 'make' creates
  //   (or receives) and then returns
  // - note that D will have a nested definition ND
  // - 'o' may have method/s that generate an instance of ND and
  //   update 'result' with this result.
  //
  // HOW TO REALLY THINK ABOUT THIS:
  // I'd recommend understanding how the recursion works for
  // arrays, keyed arrays and values.
  // Arrays and keyed arrays use 'push' and 'addKey' respectively.
  // Then look at how the assoc array definition extends this behaviour.
  // With assoc array, we have specified keys that we can use which we add
  // to 'o', sort of like setters for those keys.
  // The method 'add' is used after the key ie o[key].add .
  // If you see 'add' it is adding a specified key.
  // So we have: o[key].add(...recurse...).
  // If the ND is an array or keyed array we add convenience functions:
  //   o[key].push(...)
  //   o[key].addKey(...)
  // respectively.

  module.gen = function(defn) {
    var o = {};
    var result;
    var newResult;

    // D = array

    if(defn instanceof Array) {
      if(defn.length!=1) {
        throw new Error("Array definitions must contain one item.");
      }
      newResult = function(){return [];}

      // ND = value
      if(isValue(defn[0])) {
        o.set = function(v) {
          module.typeCheck$(defn[0],v,defn);
          result.push(v);
        }
      }

      // ND = non-value
      else {
        o.defn = defn[0];
        o.m = module.gen(o.defn);
        o.push = function(fn) {
          result.push(o.m.make(fn));
        };
        o.map = function(thing,fn){
          gen_utils.each(thing,function(v,k){
            result.push(o.m.make(function(o){fn(o,v,k);}));
          });
        };
      }
    }

    // D = keyed array

    else if(typeof(defn)=='object' && defn && defn.hasOwnProperty('_key_')) {
      newResult = function(){return {};}

      // ND = value
      if(isValue(defn['_key_'])) {
        o.case = 0;
        o.addKey = function(key,v) {
          result[key] = v;
        };
      }

      // ND = non-value
      else {
        o.case = 1;
        o.defn = defn['_key_'];
        o.m = module.gen(o.defn);
        o.addKey = function(key,fn) {
          result[key] = o.m.make(fn,result[key]);
        };
        o.map = function(thing,fn,keyfn){
          gen_utils.each(thing,function(v,k){
            var key = keyfn?keyfn(v,k):k;
            result[key] = o.m.make(function(o){fn(o,v,k);},result[key]);
          });
        };
      }
    }

    // D = assoc array (with specified keys)

    else if(typeof(defn)=='object' && defn) {
      newResult = function(){return {};}
      if(!result) result = {};

      // ND = for each key, the value in that key:
      gen_utils.each(defn,function(v,k){
        o[k] = {
          key:k
        };

        // ND = value
        if(isValue(v)) {
          o[k].set = function(v2) {
            module.typeCheck$(v,v2,defn,
                              'Specificied keys, offending key is:'+this.key);
            result[this.key] = v2;
          }
        }

        // ND = non-value
        else {
          o[k].defn = v;
          o[k].m = module.gen(o[k].defn);
          // If we don't merge, subsequent calls to o[k].add will wipe
          // previous ones.
          o[k].add = function(fn){
            if(!result[this.key]) {
              result[this.key] = o[this.key].m.make(fn);
            }
            else {
              // merge(a,b) => "merge b into a"
              gen_utils.merge(result[this.key],
                              o[this.key].m.make(fn,result[this.key]));
            }
          };

          // Convenience: shortcut for nested definition that is a
          // keyed array.

          if(typeof(v)=='object' && v && v.hasOwnProperty('_key_')) {
            o[k].addKey = function(key,fn){
              o[this.key].add(function(o){
                o.addKey(key,fn);
              });
            };
            o[k].map = function(thing,fn,keyfn){
              o[this.key].add(function(o){
                o.map(thing,fn,keyfn);
              });
            };
          }

          // Convenience: shortcut for nested definition that is an
          // array.

          else if(v instanceof Array) {
            o[k].push = function(fn){
              o[this.key].add(function(o){
                o.push(fn);
              });
            };
            o[k].map = function(thing,fn){
              o[this.key].add(function(o){
                o.map(thing,fn);
              });
            };
          }

        }
      });
    }

    // D = V

    else {
      newResult = function(){return null;}
      o.set = function(v) {
        module.typeCheck$(defn,v,defn);
        result = v;
      }
    }

    // Return a schema object for this definition which has make and
    // withInstance methods.

    return {

      // Make can work with an existing result if you pass it in.
      // 
      // Otherwise, it will generate a new structure.

      make:function(fn,result2) {
        if(!result2) {
          result = newResult();
        } else {
          result = result2;
        }
        fn(o);
        return result;
      },
      withInstance:function(i,fn) {
        result = i;
        fn(o);
        return result;
      }
    };

  };

  // Test type of V in defintion D, for use with gen/make above.
  //
  // IMPORTANT: only test for functions at the moment otherwise we
  // allow.  Also, only test for functions if an actual_value was
  // given (ie not null or undefined).
  //
  // When we do o['property1'].set (etc) within a call to 'make' check
  // the type if a specific one was used in the definition.
  // Most obvious one is if a definition specifies a function as a
  // value.

  module.typeCheck = function(defn_value,actual_value) {
    var dtype = typeof(defn_value);
    var atype = typeof(actual_value);
    if(
        // An actual value was defined:
        actual_value &&
        // Defn is a function:
        (dtype=='function') &&
        // The actual type of actual value isn't a function;
        (dtype!=atype) )
    {
      return false;
    }
    return true;
  };

  module.typeCheck$ = function(defn_value,actual_value,defn,additional_msg) {
    var result = module.typeCheck.apply(null,arguments);
    if(!result) {
      throw new Error(
        "Typecheck: value supplied doesn't match type used in definition.  "
          +"Type should be:"+typeof(defn_value)+". "
          +"You used value:<"+actual_value+">. "
          +"In defn: "+pretty(defn)+". "
          +(additional_msg ? additional_msg : "")
      );
    }
  };

  // A set is a set of related definitions -- maybe ones used by a
  // particular thing.
  //
  // Instances created from a set will have 2 additional properties:
  // _set_ (the set name) and _type_ (the type name of the
  // definition).
  //
  // Also see receiversFor, which requires _set_ and _type_ to be set.

  module.withNewSet = function(name,fn) {
    var set = {
      name:name,
      types:{}
    };
    var o = {
      // Add a signal to this set with _type_ attribute set.
      add:function(type,defn) {
        set.types[type] = {
          defn:defn,
          type:type,
          schema:module.gen(defn),
          make:function(fn){
            var s = this.schema.make(fn);
            s._type_ = this.type;
            s._set_ = set.name;
            return s;
          },
          withInstance:function(i,fn){
            return this.schema.withInstance(i,fn);
          }
        };
      }
    };
    fn(o);
    return set;
  };

  // Allows you to define a set of receive functions for each type of
  // schema in a set.
  //
  // IMPORTANT: you must create data using the set which will set
  // _type_ and _set_ attributes on the data.  receiversFor must be
  // able to match these.

  module.receiversFor = function(set,receivers,catchallfn) {
    gen_utils.each(receivers,function(v,k){
      if(!set.types[k]) {
        throw new Error("Receiver type: "+k+" is not in the specified set.");
      }
    });
    return function(o) {
      var receiver;
      if(!o._set_) {
        throw new Error("receiversFor expects data with a _set_ attribute.");
      }
      if(!o._type_) {
        throw new Error("receiversFor expects data with a _type_ attribute.");
      }
      if(set.name != o._set_) {
        throw new Error("Received set "+o._set_+" and not "+set.name+".");
      }
      if(receiver = receivers[o._type_]) {
        return receiver.call(this,o);
      }
      else {
        if(catchallfn) {
          return catchallfn(o);
        }
      }
    };
  };

  return module;

}();

$dlb_id_au$.domutils.schema3_tests = function(){

  var module = {};

  var gen_utils = $dlb_id_au$.domutils.gen_utils;
  var schema3   = $dlb_id_au$.domutils.schema3;
  return;

  module.withExample1 = function(fn) {
    // These are some test definitions, don't include the label!
    fn({
      a01:1,
      a02:null,
      b01:[],
      b02:[2],
      b03:[{}],
      b04:[{x:2,y:3}],
      b05:[[{x:1}]],
      c01:{},
      c02:{x:2,y:3},
      d01:{_key_:1},
      d02:{_key_:{x:1,y:2}},
      d03:{_key_:{_key_:{x:1}}},
      e01:{x:2,y:{_key_:{x:1}}},
      e02:{x:2,y:{_key_:null}},
      e03:{x:2,y:{a:{b:2}}},
      f01:{x:[{y:null}]}
    });
  };

  //return;

  // Test sets and receivers:

  module.withExample1(function(o){
    var s,r;
    var set = schema3.withNewSet('set1',function(o){
      o.add('foo',{
        a:[{b:null}]
      });
    });
    s = set.types.foo.make(function(o){
      o.a.add(function(o){
        o.push(function(o){
          o.b.set(10);
        })
      });
      // Shortcut:
      o.a.push(function(o){
        o.b.set('using push!');
      });
    });
    console.log(s);

    r = schema3.receiversFor(set,{
      foo:function(o){
        console.log('received:');
        console.log(o);
      }
    });
    r(s);
  });

  // Test various defns:

  module.withExample1(function(o){
    var m,s;

    console.log('a01');
    m = schema3.gen(o.a01);
    s = m.make(function(o){
      o.set(8);
    });
    console.log(s);

    console.log('b04');
    m = schema3.gen(o.b04);
    s = m.make(function(o){
      o.push(function(o){
        o['x'].set(24);
      });
    });
    m.withInstance(s,function(o){
      o.push(function(o){
        o['x'].set(27);
      });
    });
    console.log(s);

    console.log('b04 map');
    m = schema3.gen(o.b04);
    s = m.make(function(o){
      o.map({a:1,b:2},function(o,v,k){
        o.x.set(v);
        o.y.set(k);
      });
    });
    console.log(s);

    console.log('b05');
    m = schema3.gen(o.b05);
    s = m.make(function(o){
      o.push(function(o){
        o.push(function(o){
          o['x'].set(113);
        });
        o.push(function(o){
          o['x'].set(114);
        });
      });
      o.push(function(o){
        o.push(function(o){
          o['x'].set(115);
        });
      });
    });
    console.log(s);
    m.withInstance(s,function(o){
      o.push(function(o){
        o.push(function(o){
          o['x'].set(2020);
        });
      })
    });
    console.log(s);

    console.log('c02');
    m = schema3.gen(o.c02);
    s = m.make(function(o){
      o['x'].set(4);
      o['y'].set(7);
    });
    console.log(s);

    console.log('c02 2');
    s = m.make(function(o){
      o['x'].set(44);
    });
    console.log(s);

    console.log('d02');
    m = schema3.gen(o.d02);
    s = m.make(function(o){
      o.addKey('foo',function(o){
        o['x'].set('x1');
        o['y'].set('y1');
      });
      o.addKey('foo2',function(o){
        o['x'].set(12);
      });
    });
    console.log(s);

    console.log('d02 map');
    m = schema3.gen(o.d02);
    s = m.make(function(o){
      o.map({a:1,b:2},function(o,v,k){
        o['x'].set(v);
        o['y'].set(k);
      });
    });
    console.log(s);

    console.log('d03');
    m = schema3.gen(o.d03);
    s = m.make(function(o){
      o.addKey('foo',function(o){
        o.addKey('bar',function(o){
          o['x'].set(112);
        });
      });
      o.addKey('foo2',function(o){
        o.addKey('baaaar',function(o){
          o['x'].set(12);
        });
      });
    });
    console.log(s);

    console.log('e01');
    m = schema3.gen(o.e01);
    s = m.make(function(o){
      o['x'].set(42);
      o['y'].add(function(o){
        o.addKey('foo',function(o){
          o.x.set(10);
        });
        o.addKey('fur',function(o){
          o.x.set(12);
        });
      });
      o['y'].add(function(o){
        o.addKey('foo2',function(o){
          o.x.set(11);
        });
      });
      o['y'].addKey('bar',function(o){
        o.x.set(25);
      });
      o['y'].addKey('bar2',function(o){
        o.x.set(25);
      });
    });
    console.log(s);

    console.log('e01 2 shortcut');
    s = m.make(function(o){
      o['x'].set(42);
      o['y'].add(function(o){
        o.addKey('foo',function(o){
          o.x.set(10);
        });
      });
      o['y'].addKey('foo2',function(o){
        o.x.set(11);
      });
    });
    console.log(s);

    console.log('e01 3 map');
    s = m.make(function(o){
      o['x'].set(42);
      o['y'].map({a:1,b:2},function(o,v,k){
        o.x.set(v);
      });
      o['y'].map(
        {c:1,d:2},
        function(o,v,k){o.x.set(k);},
        function(v,k){return v;}
      );
    });
    console.log(s);

    console.log('e02');
    m = schema3.gen(o.e02);
    s = m.make(function(o){
      o['x'].set(12);
      o['y'].add(function(o){
        o.addKey('foo','f*k');
      });
      o['y'].addKey('bar',"f*k2");
    });
    console.log(s);

    console.log('e03');
    m = schema3.gen(o.e03);
    s = m.make(function(o){
      o['x'].set(122);
      o['y'].add(function(o){
        o['a'].add(function(o){
          o['b'].set(123);
        });
      });
    });
    console.log(s);

    console.log('f01');
    m = schema3.gen(o.f01);
    s = m.make(function(o){
      o['x'].push(function(o){
        o.y.set(50);
      });
      o['x'].map([1,2,3],function(o,v,k){
        o.y.set(v);
      });
    });
    console.log(s);

  });

  return module;

}();
