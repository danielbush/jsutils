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

$dlb_id_au$.utils.editops = function() {

  var module = {};
  var data = $dlb_id_au$.utils.data2;
  var findops = $dlb_id_au$.utils.findops;

  // Determine if entry is head of parent list.

  var isHead = function(entry) {
    if(entry.parentEntry$) {
      return (entry.parentEntry$.children$.head == entry);
    }
  };


  // Insert new entry before existing one.
  //
  // insertBefore(e1) => insert new entry before e1
  // insertBefore(e1,e2) => insert e1 before e2

  module.insertBefore = function(e1,e2) {
    var t,n;
    if(!e2) {
      e2 = e1; e1 = data.makeEntry();
    }
    n = e2.previous$;

    e2.previous$ = e1;
    e1.next$ = e2;

    if(n) n.next$ = e1;
    e1.previous$ = n;

    e1.parentEntry$ = e2.parentEntry$;

    // Update parent's children.
    if(isHead(e2)) {
      e2.parentEntry$.children$.head = e1;
    }

    return e1;
  };

  // Append entry to end of list.
  // 
  // insertAfter(e1) => insert new entry after e1
  // insertAfter(e1,e2) => insert e1 after e2

  module.insertAfter = function(e1,e2) {
    var t,n;
    if(!e2) {
      e2 = e1;
      e1 = data.makeEntry();
    }

    n = e2.next$;

    e2.next$ = e1;
    e1.previous$ = e2;

    if(n) n.previous$ = e1;
    e1.next$ = n;

    e1.parentEntry$ = e2.parentEntry$;

    return e1;
  };


  // Remove element from it's surrounding list and return it.

  module.remove = function(entry) {
    var next,previous;
    previous = entry.previous$;
    next = entry.next$;
    if(previous) {
      previous.next$ = next;
    }
    if(next) {
      next.previous$ = previous;
    }

    // Update parent's children.
    if(isHead(entry)) {
      entry.parentEntry$.children$.head = entry.next;
    }

    return entry;
  };


  module.appendChild = function(ec,ep) {
    var tail;
    if(!ep) {
      ep = ec;
      ec = data.makeEntry();
    }
    if(!ep.children$.head) {
      ep.children$.head = ec;
      ec.parentEntry$ = ep;
    } else {
      tail = findops.tail(ep.children$.head);
      module.insertAfter(ec,tail);
    }
    return ec;
  };

  return module;

}();
