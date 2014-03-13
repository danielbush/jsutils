/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2014 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Basic linked list operations.
// 
// The only thing assumed here are entries with next/previous
// referring to other entries.

$dlb_id_au$.utils.listtree2.tree = function(o) {

  var module = {};
  var list    = $dlb_id_au$.utils.listtree2.list(o);
  var LABELS  = $dlb_id_au$.utils.listtree2.DEFAULT_LABELS;
  var PREVIOUS = LABELS.previous;
  var NEXT = LABELS.next;
  var FIRSTCHILD = LABELS.firstChild;
  var PARENT = LABELS.parent;

  if(o && o.labels) {
    PREVIOUS = (o.labels.previous ? o.labels.previous : PREVIOUS);
    NEXT = (o.labels.next ? o.labels.next : NEXT);
    FIRSTCHILD = (o.labels.firstChild ? o.labels.firstChild : FIRSTCHILD);
    PARENT = (o.labels.parentNode ? o.labels.parentNode : PARENT);
  }

  // Walk the parent entries of 'entry'.
  //
  // Stop if fn returns truthy.

  module.walkParents = function(entry,fn) {
    var p,r;
    p = entry;
    while(p=p[PARENT]) {
      if(fn) {
        r = fn(p);
        if(r) return r;
      }
    }
  };

  // Find root node of start.

  module.first = function(start) {
    var root = start;
    module.walkParents(start,function(p){
      root = p;
    });
    return root;
  };

  // Find last node in tree rooted in start.
  //
  // This is the last node to be pre-visited.

  module.last = function(start) {
    var tail;
    tail = module.first(start);
    tail = list.last(tail);
    if(tail.firstChild) {
      return list.last(tail.firstChild)
    } else {
      return tail;
    }
  };

  // Walk a tree rooted in 'entry' depth-first in the forward
  // direction.
  //
  // FORWARD DIRECTION ('next')
  // If we draw firstChild to left and lastChild to right, then
  // previsit order is left of the node (on the way down) and
  // postvisit is right of the node (on the way back up).

  module.walk = function(entry,preVisit,postVisit) {
    var r,e;
    if(preVisit) {
      r = preVisit(entry);
      if(r) return r;
    }
    if(e=entry[FIRSTCHILD]) {
      for(;e;e=e[NEXT]) {
        r = module.walk(e,preVisit,postVisit);
        if(r) return r;
      }
    }
    if(postVisit) {
      r = postVisit(entry);
      if(r) return r;
    }
  };

  // Walk a tree rooted in 'entry' depth-first in the reverse
  // direction.
  //
  // IMPORTANT
  // previsit and postvisit is defined as per 'walk'.
  // So postvisit is called BEFORE previsit.

  module.walkReverse = function(entry,preVisit,postVisit) {
    var e,r;
    if(postVisit) {
      r = postVisit(entry);
      if(r) return r;
    }
    if(e=entry[FIRSTCHILD]) {
      e = list.last(e);
      for(;e;e=e[PREVIOUS]) {
        r = module.walkReverse(e,preVisit,postVisit);
        if(r) return r;
      }
    }
    // If no children...
    if(preVisit) {
      r = preVisit(entry);
      if(r) return r;
    }
  };

  // Walk after entry in FORWARD DIRECTION like 'walk', 'entry' (and
  // its subtree) is not visited.
  //
  // It's as if we've just postVisited entry.
  // If you want to visit entry and its descendents, use 'walk' since
  // walk will restrict itself to the subtree rooted in entry.
  // If you want to walk before entry going in the oppositie
  // direction consider walkReverse/walkBefore.

  module.walkAfter = function(entry,preVisit,postVisit) {
    var r;
    var e = entry;
    while(e=e[NEXT]) {
      r = module.walk(e,preVisit,postVisit);
      if(r) return r;
    }
    if(e=entry[PARENT]) {
      if(postVisit) {
        r = postVisit(e);
        if(r) return r;
      }
      r = module.walkAfter(e,preVisit,postVisit);
      if(r) return r;
    }
  };

  // Walk before entry in REVERSE DIRECTION like 'walkReverse',
  // 'entry' (and its subtree) is not visited.
  //
  // postvisit will be called before previsit.

  module.walkBefore = function(entry,preVisit,postVisit) {
    var r;
    var e = entry;
    while(e=e[PREVIOUS]) {
      // Reverse walk subtrees rooted in previous siblings...
      r = module.walkReverse(e,preVisit,postVisit);
      if(r) return r;
    }
    if(e=entry[PARENT]) {
      // previsit parent...
      if(preVisit) {
        r = preVisit(e);
        if(r) return r;
      }
      // Repeat whole process on parent...
      r = module.walkBefore(e,preVisit,postVisit);
      if(r) return r;
    }
  };

  // Find the next node to be pre-visited after start.
  //
  // Will walk *after* start and up the tree if start has siblings and
  // parentNode, but only in pre-visit order.

  module.prenext = function(start) {

    var found = null;
    var preVisit = function(e){
      if(e==start) return;
      found = e;
      return true;
    };

    // Walk subtree of start ignoring start and WITHOUT post-visiting.
    module.walk(start,preVisit);

    // Ascend after 'start' in previsit order.
    if(!found) {
      module.walkAfter(start,preVisit);
    }

    return found;
  };

  // Find previous entry previous to 'start' in previsit position.
  //
  // previsit position + reverse => postvisit
  // 
  // Basically reverse of prenext.
  // REMEMBER: previst and postvisit positions are the same
  // regardless of direction we walk!
  // 

  module.preprevious = function(start) {
    var found = null;
    var preVisit = function(e){
      if(e==start) return;
      found = e;
      return true;
    };
    module.walkBefore(start,preVisit);
    return found;
  };

  return module;

};
