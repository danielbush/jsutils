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

$dlb_id_au$.utils.listtree2.list = function(o) {

  var module = {};
  var LABELS   = $dlb_id_au$.utils.listtree2.DEFAULT_LABELS;
  var PREVIOUS = LABELS.previous;
  var NEXT     = LABELS.next;

  // What labels to use.
  if(o && o.labels) {
    PREVIOUS = (o.labels.previous ? o.labels.previous : PREVIOUS);
    NEXT = (o.labels.next ? o.labels.next : NEXT);
  }

  // Join assumes we're just dealing with a linked list.
  //
  // Even though join is an edit operation, it doesn't handle
  // parent/child relationships and it is fundamental to linked lists
  // and testing, so we define it here.
  // 
  // join(H,A)
  // join([...])

  module.join = function() {
    var list,i;
    var head;
    switch(arguments.length) {
    case 1:
      list = arguments[0];
      for(i=0,head=list[i];i<list.length-1;i++) {
        module.join(list[i],list[i+1]);
      }
      return head;
    case 2:
      head = arguments[0];
      arguments[0][NEXT]= arguments[1];
      arguments[1][PREVIOUS] = arguments[0];
      return head;
    default:
      return null;
    }
  };

  // Join a before b, potentially changing all of a's links to fit
  // into the list that b is in.

  module.joinBefore = function(a,b){
    if(b[PREVIOUS]) {
      module.join(b[PREVIOUS],a);
    }
    module.join(a,b);
    return a;
  };

  // Join a after b, potentially changing all of a's links to fit
  // into the list that b is in.

  module.joinAfter = function(a,b){
    if(b[NEXT]) {
      module.join(a,b[NEXT]);
    }
    module.join(b,a);
    return a;
  };

  // Unjoin entry from its list.
  //
  // By default, we don't scrub e's NEXT/PREVIOUS references.
  // It can be quite useful to have these around when
  // performing things related to the unjoin (eg detaching node
  // in a hierarchy).

  module.unjoin = function(e) {
    var p=e[PREVIOUS],n=e[NEXT];
    if(p && n) {
      p[NEXT] = n;
      n[PREVIOUS] = p;
      return e;
    }
    else if(p) { // e was tail
      p[NEXT] = null;
      return e;
    }
    else if(n) { // e was head
      n[PREVIOUS] = null;
      return e;
    }
    return e;
  };

  // Find first entry of the list.

  module.first = function(entry) {
    for(;entry[PREVIOUS];entry=entry[PREVIOUS]);
    return entry;
  };

  // Find last entry of the list.

  module.last = function(entry) {
    for(;entry[NEXT];entry=entry[NEXT]);
    return entry;
  };


  // Walk through tokens and only stop if test returns truthy.
  // `token` itself is tested.
  // 
  // The truthy is returned.
  // If no truthy is returned, walk will walk to end of
  // list and return null.
  // If test returns null/false (falsey) then walk
  // will keep walking.

  module.walk = function(token,fn) {
    if(!token) return null;
    var n,r,t = token;
    do {
      n = t[NEXT];
      if(fn && (r=fn(t))) return r;
    } while(t=n)
    return null;
  };

  // Walk through tokens in the previous direction.
  //
  // See 'walk'.

  module.walkback = function(token,fn) {
    if(!token) return null;
    var r,t = token;
    do {
      if(fn && (r=fn(t))) return r;
    } while(t=t[PREVIOUS])
    return null;
  };

  // Find nth next token (eol tokens are included).
  // 
  // - return null if we go past the last token
  // - INCLUDES placemarkers; 'next' literally
  //   just walks 'n' tokens whatever they are
  // - so far, only used as a helper in one test

  module.nth = function(token,n,fn) {
    var i = 0;
    var t = token;
    var r;
    if(n===0) {
      if(!fn) {
        return token;
      } else {
        r = fn(t);
        if(r) {
          return r;
        } else {
          return null;
        }
      }
    }
    if(n>0) {
      while(t=t[NEXT]) {
        if(!fn) {
          if(++i==n) {
            return t;
          }
        } else {
          r = fn(t);
          if(r) {
            if(++i==n) {
              return r;
            }
          }
        }
        if(i>n) {
          return null;
        }
      }
    } else if(n<0) {
      while(t=t[PREVIOUS]) {
        if(!fn) {
          if(--i==n) {
            return t;
          }
        } else {
          r = fn(t);
          if(r) {
            if(--i==n) {
              return r;
            }
          }
        }
        if(i<n) {
          return null;
        }
      }
    }
    return null;
  };

  // Find the next thing after 'token'.
  //
  // Same as 'nth' with n=1.
  // A predicate function can be passed.

  module.next = function(token,fn) {
    return module.nth(token,1,fn);
  };

  // Find the previous thing before 'token'.
  // 
  // Same as 'nth' with n=-1.
  // A predicate function can be passed.

  module.previous = function(token,fn) {
    return module.nth(token,-1,fn);
  };

  // Find the the very first thing.
  //
  // A predicate function can be passed, in which case the last thing
  // that passes the test is returned.

  module.veryfirst = function(token,fn) {
    if(!fn) {
      return module.first(token);
    }
    if(!token) return null;
    var r,t = token;
    var last = null;
    do {
      if(fn && (r=fn(t))) {
        last = r;
      }
    } while(t=t[PREVIOUS])
    return last;
  };

  // Find the the very last thing.
  //
  // See 'first'.

  module.verylast = function(token,fn) {
    if(!fn) {
      return module.last(token);
    }
    if(!token) return null;
    var n,r,t = token;
    var last = null;
    do {
      n = t[NEXT];
      if(fn && (r=fn(t))) {
        last = r;
      }
    } while(t=n)
    return last;
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
    if(n===0) {
      return start;
    }
    if(!n) n = 1;
    if(n>0) {
      if(start[NEXT]) {
        return start[NEXT];
      } else {
        return module.first(start);
      }
    }
    if(n<0) {
      if(start[PREVIOUS]) {
        return start[PREVIOUS];
      } else {
        return module.last(start);
      }
    }
  };

  return module;

};
