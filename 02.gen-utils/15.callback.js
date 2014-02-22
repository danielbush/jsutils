/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Callbacks object.
//
// You can use it provide a callback (function) to something.
//   c = new Callbacks();
//   fn = c.get('myCallback');
//   // ... give fn to something
// Later (or before, it doesn't matter) you can set the function:
//   c.set('myCallback',fun,receiver)
// If receiver is given, then 'fun' is called like this:
//   fun.apply(receiver,arguments)
// If the callback is called before 'set', a message will be logged to
// console.log.

$dlb_id_au$.utils.Callbacks = function() {
  this.registry = {};
};

$dlb_id_au$.utils.Callbacks.prototype = {

  get$:function(name,fn) {
    var that=this;
    this.registry[name] = this.registry[name] || {};
    if(this.registry[name].receiver) {
      return this.registry[name];
    }
    // Otherwise, build a closure round this function:
    this.registry[name].receive = function() {
      if(that.registry[name].fn) {
        return that.registry[name].fn.apply(
          that.registry[name].receiver,
          arguments
        );
      } else {
        console.log('callback:'+name+' not created yet.');
        return false;
      }
    };
    return this.registry[name];
  },

  // Fetch the receiving function.
  get:function(name,fn,receiver) {
    return this.get$(name).receive;
  },

  set:function(name,fn,receiver) {
    var o = this.get$(name);
    o.fn = fn;
    o.receiver = (receiver?receiver:null);
    return o;
  }

};
