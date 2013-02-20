/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


// Special function stack.
// 
// The stack is assumed to contain items of form:
//   [fn,a,b,c,...]
// and unwinding will pop the item and then call:
//   item[0](item)
//
// This is a way to undo things that were done previously without
// using closures or classes.


$dlb_id_au$.utils.stack = function(){

  var module = {};

  module.Stack = function() {
    this.stack = [];
  };

  // Unwinds a stack.
  //

  module.Stack.prototype.unwind = function() {
    if(this.stack.length>0) {
      while(this.pop()){};
    }
  };

  module.Stack.prototype.pop = function() {
    var item;
    if(this.stack.length>0) {
      item = this.stack.pop();
      item[0](item);
      return item;
    }
    return null;
  };

  module.Stack.prototype.push = function(arr) {
    if(typeof(arr[0])!='function') {
      throw new Error("focus.stack.push: bad first argument.");
    }
    this.stack.push(arr);
  };

  return module;

}();
