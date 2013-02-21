/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Basic linked list operations.
// 
// The only thing assumed here are entries with next/previous
// referring to other entries.

$dlb_id_au$.utils.listops = function() {

  var module = {};

  module.makeEntry = function() {
    return {
      next:null,
      previous:null,
      // Place to hang functions or data associated with this list
      // item.
      data:{}
    };
  };


  // Insert new entry before existing one.
  //
  // insertBefore(e1) => insert new entry before e1
  // insertBefore(e1,e2) => insert e1 before e2

  module.insertBefore = function(e1,e2) {
    var t,n;
    if(!e2) {
      e2 = e1; e1 = module.makeEntry();
    }
    n = e2.previous;

    e2.previous = e1;
    e1.next = e2;

    if(n) n.next = e1;
    e1.previous = n;

    return e1;
  };

  // Append entry to end of list.
  // 
  // insertAfter(e1) => insert new entry after e1
  // insertAfter(e1,e2) => insert e1 after e2

  module.insertAfter = function(e1,e2) {
    var t,n;
    if(!e2) {
      e2 = e1; e1 = module.makeEntry();
    }

    n = e2.next;

    e2.next = e1;
    e1.previous = e2;

    if(n) n.previous = e1;
    e1.next = n;

    return e1;
  };


  // Remove element from it's surrounding list and return it.

  module.remove = function(entry) {
    var next,previous;
    previous = entry.previous;
    next = entry.next;
    if(previous) {
      previous.next = next;
    }
    if(next) {
      next.previous = previous;
    }
    return entry;
  };

  // Walk a linked list starting at 'start'.
  //
  // If 'fn' returns truthy, then stop.

  module.walk = function(start,fn) {
    var n,i;
    for(i=0,n=start;n;i++,n=n.next) {
      if(fn(n,i)) {
        break;
      }
    }
  };

  // Walk a linked list backwards starting at 'start'.
  //
  // If 'fn' returns truthy, then stop.

  module.walkback = function(start,fn) {
    var n,i;
    for(i=0,n=start;n;i++,n=n.previous) {
      if(fn(n,i)) {
        break;
      }
    }
  };


  return module;

}();
