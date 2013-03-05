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

$dlb_id_au$.utils.entryops = function() {

  var module = {};
  var data = $dlb_id_au$.utils.data2;

  module.count = function(start) {
    var i,n;
    for(i=0,n=start;n;n=n.next$) {
      i++;
    }
    return i;
  };

  module.tail = function(start) {
    var n,tail=start;
    for(n=start;n;n=n.next$) {
      tail = n;
    }
    return tail;
  };

  module.head = function(start) {
    var n,head=start;
    for(n=start;n;n=n.previous$) {
      head = n;
    }
    return head;
  };

  module.get = function(entry,key) {
    if(!entry.data$[key]) {
      entry.data$[key] = {};
    }
    return entry.data$[key];
  };

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
      tail = module.tail(ep.children$.head);
      module.insertAfter(ec,tail);
    }
    return ec;
  };

  // Walk a linked list starting at 'start'.
  //
  // If 'fn' returns truthy, then stop.

  module.sibwalk = function(start,fn) {
    var n,i;
    var r;
    for(i=0,n=start;n;i++,n=n.next$) {
      if(r=fn(n,i)) {
        return r;
      }
    }
  };

  // Walk a linked list backwards starting at 'start'.
  //
  // If 'fn' returns truthy, then stop.

  module.sibwalkback = function(start,fn) {
    var n,i;
    var r;
    for(i=0,n=start;n;i++,n=n.previous$) {
      if(r=fn(n,i)) {
        return r;
      }
    }
  };

  // Walk a tree of entries with entry as root depth-first.

  module.walk = function(entry,visit,postVisit) {
    var r,e;
    if(visit) {
      r = visit(entry);
      if(r) return r;
    }
    if(e=entry.children$.head) {
      for(;e;e=e.next$) {
        r = module.walk(e,visit,postVisit);
        if(r) return r;
      }
    }
    if(postVisit) {
      r = postVisit(entry);
      if(r) return r;
    }
  };

  // Walk past entry, don't pre/post visit entry.
  //
  // It's as if we just postVisited entry.

  module.walkAfter = function(entry,visit,postVisit) {
    var r;
    var e = entry;
    while(e=e.next$) {
      r = module.walk(e,visit,postVisit);
      if(r) return r;
    }
    if(e=entry.parentEntry$) {
      if(postVisit) {
        r = postVisit(e);
        if(r) return r;
      }
      r = module.walkAfter(e,visit,postVisit);
      if(r) return r;
    }
  };

  // Walk a tree of entries with entry as root in the opposite
  // direction.

  module.walkback = function(entry,visit,postVisit) {
    var e,r;
    if(visit) {
      r = visit(entry);
      if(r) return r;
    }
    if(e=entry.children$.head) {
      e = module.tail(e);
      console.log(e);
      for(;e;e=e.previous$) {
        r = module.walkback(e,visit,postVisit);
        if(r) return r;  // break in sibwalkback
      }
    }
    if(postVisit) {
      r = postVisit(entry);
      if(r) return r;
    }
  };


  // Walk back from entry, don't pre/post visit entry.
  //
  // Same direction as walkback.

  module.walkBefore = function(entry,visit,postVisit) {
    var r;
    var e = entry;
    while(e=e.previous$) {
      r = module.walkback(e,visit,postVisit);
      if(r) return r;
    }
    if(e=entry.parentEntry$) {
      if(postVisit) {
        r = postVisit(e);
        if(r) return r;
      }
      r = module.walkBefore(e,visit,postVisit);
      if(r) return r;
    }
  };

  return module;

}();
