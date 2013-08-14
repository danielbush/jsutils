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

$dlb_id_au$.utils.listtree.findops = function() {

  var module = {};
  var data = $dlb_id_au$.utils.listtree.data2;

  module.count = function(start) {
    var i,n;
    for(i=0,n=start;n;n=n.next$) {
      i++;
    }
    return i;
  };

  // Find tail entry of the current row.

  module.tail = function(start) {
    var n,tail=start;
    for(n=start;n;n=n.next$) {
      tail = n;
    }
    return tail;
  };

  // Find head entry of the current row.

  module.head = function(start) {
    var n,head=start;
    for(n=start;n;n=n.previous$) {
      head = n;
    }
    return head;
  };

  // Find nth entry (zero-based) from start or return null.
  //
  // If n=0, return start.
  //
  // If flag is true, the head of start is used in place of start and
  // n is assumed to be >= 0, not negative. This is just a
  // convenience, so you don't have to call module.head on start
  // yourself.
  // Why bother? It allows us to treat a linked list a bit like an
  // indexed array.

  module.nth = function(n,start,flag) {
    var i;
    var found = null;
    var head = start;
    if(flag) {
      if(n>=0) {
        head = module.head(start);
      }
      else if(n<0) {
        return null;
      }
    } 

    if(n==0) {
      found = head;
    }
    else if(n>0) {
      for(found=head,i=1;i<=n;i++) {
        found = found.next$;
        if(!found) {
          found = null;
          break;
        }
      }
    }
    else if(n<0) {
      for(found=head,i=-1;i>=n;i--) {
        console.log(i);
        found = found.previous$;
        if(!found) {
          found = null;
          break;
        }
      }
    }
    return found;
  };

  // Get next entry in list.

  module.next = function(start) {
    return start.next$;
  };

  // Get previous entry in list.

  module.previous = function(start) {
    return start.previous$;
  };

  // Get the first child.

  module.firstChild = function(entry) {
    return entry.firstChild$;
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

  // Cycle through a list (siblings).
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

  // Find first node in tree.

  module.first = function(start) {
    var root = start;
    module.walkParents(start,function(p){
      root = p;
    });
    // In case of multi-root tree:
    root = module.head(root);
    return root;
  };

  // Find last node in tree.
  //
  // This is the last node to be pre-visited.
  //
  // @see module.head , module.tail for flat lists

  module.last = function(start) {
    var tail;
    tail = module.tail(start);
    if(tail.firstChild$) {
      return module.last(tail.firstChild$)
    } else {
      return tail;
    }
  };

  // Find the next node to be pre-visited after start.

  module.cycleNext = function(start) {
    var found = null;

    var preVisit = function(e){
      if(e==start) return;
      found = e;
      return true;
    };
    // Walk subtree of start ignoring start.
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

  module.cyclePrevious = function(start) {
    var found = null;
    if(!start.parentEntry$) {
      return module.last(start);
    }
    //console.log(start.tag);
    var preVisit = function(e){
      //console.log('looking at '+e.tag);
      if(e==start) return;
      found = e;
      return true;
    };
    console.log('walkBefore');
    // Walk subtree of start ignoring start.
    module.walkBefore(start,null,preVisit);
    // Now ascend...
    if(!found) {
      //console.log('walkback');
      module.walkback(start,preVisit);
    }
    //console.log('STOP');
    return found;
  };

  // Walk a tree of entries with entry as root depth-first.

  module.walk = function(entry,visit,postVisit) {
    var r,e;
    if(visit) {
      r = visit(entry);
      if(r) return r;
    }
    if(e=entry.firstChild$) {
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
  //
  // TIP
  // Linearise the tree by turning it into an outline.
  // walkback/postVisit will visit this outline in reverse order.
  // Whereas walk/previst visit this outline in forward order.

  module.walkback = function(entry,visit,postVisit) {
    var e,r;
    if(visit) {
      r = visit(entry);
      if(r) return r;
    }
    if(e=entry.firstChild$) {
      e = module.tail(e);
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
  // Same direction as walkback.  See walkback.

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
