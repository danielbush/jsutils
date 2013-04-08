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

$dlb_id_au$.utils.findops = function() {

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

  // Cycle through a list.
  //
  // This is a convenience function.
  // 
  // TODO: handle |n| > 1 .
  // 
  // cycle(1) = go one forward
  // cycle(0) = return current entry
  // cycle(-1) = go one back
  // 
  // If the end of the list is reached at either end we loop round.
  // Also:
  // cycle() = cycle(1)
  //
  // MOTIVATION
  // To cycle through lists eg a control.

  module.cycle = function(start,n) {
    if(!n) n = 1;
    if(n==0) {
      return start;
    }
    if(n>0) {
      if(start.next$) {
        return start.next$;
      } else {
        return module.head(start);
      }
    }
    if(n<0) {
      if(start.previous$) {
        return start.previous$;
      } else {
        return module.tail(start);
      }
    }
  };

  // Find the next node to be pre-visited after start.

  module.cycleTree = function(start,n) {
    if(!n) n = 1;
    var found = null;

    var preVisit = function(e){
      if(e==start) return;
      if(!e.ignoreFocus) {
        found = e;
        return true;
      }
    };
    // Walk subtree of lastFocused ignoring lastFocused.
    module.walk(start,preVisit);
    // Now ascend...
    if(!found) {
      module.walkAfter(
        start,
        preVisit,
        // This postvisit allows us to cycle.
        function(e){
          if(!e.parentEntry$) {
            found = e;
            return true;
          }
        });
    }
    return found;
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


  // Walk after entry.
  //
  // It's as if we've just postVisited entry.
  // If you want to visit entry and its descendents, use 'walk' since
  // walk will restrict itself to the subtree rooted in entry.
  // If you want to walk before entry going in the oppositie
  // direction consider walkback/walkBefore.

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
  //
  // visit becomes postVisit and vice versa.

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

  // Walk the parent entries of 'entry'.
  //
  // Stop if fn returns truthy.

  module.walkParents = function(entry,fn) {
    var p,r;
    p = entry;
    while(p=p.parentEntry$) {
      r = fn(p);
      if(r) return r;
    }
  };

  return module;

}();
