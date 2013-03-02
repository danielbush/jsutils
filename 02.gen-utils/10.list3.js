/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// This module defines a List object.
// 
// 'List' represents a list and has to do some bookkeeping to
// maintain head and tail references.
//
// Lists are the basic building block for the tree structure
// introduced in a subsequent module.
// 
// In order to use list operations like append etc in a tree context,
// we add a this.callbacks.makeEntry callback that allows entries to
// be appropriately extended when calls to append etc are made.


$dlb_id_au$.utils.list3 = function(){

  var module = {};
  var data   = $dlb_id_au$.utils.data;
  var list   = $dlb_id_au$.utils.listops;

  module.List = function(cb) {
    this.head = null;
    this.tail = null;
    // Place to hang functions or data associated with this list.
    this.data = {};
    this.callbacks = cb || {};
  };

  // Make a list entry.
  // 
  // makeEntry will look for a this.callbacks.makeEntry object and
  // call it to modify the entry before returning.

  module.List.prototype.makeEntry = function() {
    var entry;
    entry = data.makeEntry();
    if(this.callbacks.makeEntry) {
      entry = this.callbacks.makeEntry.run(entry);
    }
    return entry;
  };

  // Append entry to end of list.
  // 
  // Yes, we do need an append.
  // Sort of makes insertAfter superfluous.
  // But you need this to actually add something to an empty list.

  module.List.prototype.append = function(entry) {

    var tail = this.tail, head = this.head;
    if(!entry) {
      entry = this.makeEntry();
    }

    if(!tail && !head) {
      this.head = this.tail = entry;
    }

    else if(tail && head) {
      this.tail = entry;
      tail.next = entry;
      entry.previous = tail;
    }

    else {
      // eek
      throw new Exception(
        "List looks corrupted, tail not set, but head is."
      );
    }
    return entry;
    
  };

  module.List.prototype.insertBefore = function(e1,e2) {
    if(!e1) throw new Error(
      "1-2 parameters required: insertBefore([new,]old)"
    );
    if(!e2) {
      e2 = e1; e1 = this.makeEntry();
    }
    list.insertBefore(e1,e2);
    if(this.head == e2) {
      this.head = e1;
    }
    return e1;
  };

  module.List.prototype.insertAfter = function(e1,e2) {
    if(!e1) throw new Error(
      "1-2 parameters required: insertAfter([new,]old)"
    );
    if(!e2) {
      e2 = e1; e1 = this.makeEntry();
    }
    list.insertAfter(e1,e2);
    if(this.tail == e2) {
      this.tail = e1;
    }
    return e1;
  };

  module.List.prototype.remove = function(e) {
    var n = e.next;
    var p = e.previous;
    list.remove(e);
    if(!p) {
      this.head = n;
    }
    if(!n) {
      this.tail = p;
    }
    return e;
  };

  return module;

}();

