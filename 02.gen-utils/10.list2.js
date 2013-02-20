/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Generic linked list.
//
// Supports push/pop operations.

$dlb_id_au$.utils.list2 = function(){

  var module = {};

  module.List = function() {
    this.head = null;
    this.tail = null;
    this.length = 0;
    // Place to hang functions or data associated with this list.
    this.data = {};
  };

  module.makeEntry = function() {
    return {
      next:null,
      previous:null,
      // Place to hang functions or data associated with this list
      // item.
      data:{}
    };
  };

  //------------------------------------------------------------
  // List operations:

  // Get ith element from list.

  module.List.prototype.get = function(i) {
    var n,j;
    for(j=0,n=this.head;n;n=n.next,j++) {
      if(j==i) return n;
    }
  };

  // Insert new entry at the ith position.
  //
  // If i > length, then add as the last item.
  // Use module.push to insert at last position.

  module.List.prototype.insert = function(i,entry) {
    var m,n;

    if(i>=this.length) {
      return this.push();
    }

    if(entry) {
      n = entry;
    } else {
      n = module.makeEntry();
    }
    m = module.get(i);
    if(!m) throw new Error("insert: corrupt list");
    this.root.insertBefore(m);

    // <-- [m.previous] --1-- *[n] --2-- [m] -->

    // 1
    m.previous.next = n;
    n.previous = m.previous;

    // 2
    n.next = m;
    m.previous = n;

    this.length++;
    return n;
  };

  // Append entry to end of list.

  module.List.prototype.push = function(entry) {
    var t,n;
    if(entry) {
      n = entry;
    } else {
      n = module.makeEntry();
    }
    if(this.length>0) {
      t = this.tail;
      this.tail = n;
      t.next = this.tail;
      this.tail.previous = t;
    } else {
      this.length = 0;
      this.head = this.tail = n;
    }
    this.length++;
    return n;
  };

  // Pop last element from list.

  module.List.prototype.pop = function() {
    var p;
    if(this.length>0) {
      p = this.tail.previous;
      this.length--;
      if(p) {
        this.tail = p;
      }
      else {
        this.length = 0;
        this.head = this.tail = null;
      }
      this.tail = p;
    }
  };

  // Remove ith element from list and return it.
  //
  // Return null if we can't get it.

  module.List.prototype.remove = function(i) {
    var next,previous;
    var n  = this.get(i);
    if(n) {
      previous = n.previous;
      next = n.next;
      previous.next = next;
      next.previous = previous;
      return n;
    } else {
      return null;
    }
  };

  module.List.prototype.clear = function() {
    this.length = 0;
    this.head = null;
    this.tail = null;
  };


  module.List.prototype.walk = function(fn) {
    var n,i;
    for(i=0,n=this.head;n;i++,n=n.next) {
      if(fn(n,i)) {
        break;
      }
    }
  };

  module.incr = function(curr,max) {
    curr+=1;
    return curr%=max;
  };

  module.decr = function(curr,max) {
    curr-=1;
    curr%=max;
    if(curr<0) {
      curr*=-1;
    }
    return curr;
  };

  return module;

}();
