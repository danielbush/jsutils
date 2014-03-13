/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2014 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Defines tree operations similar to w3 DOM
// - insertBefore
// - insertAfter
// - appendChild
//
// "Joining precedes attaching" ie
// All siblings are list.join'ed before appending to a parent.
// You can customise the attachment behaviour to a parentNode by
// overriding attach_hook (see set_attach_hook).
//
// You have to call this module to generate a particular version
// and then you can call set_attach_hook.
// So, you could have multiple versions of this module with
// different set_attach_hook behaviours.

$dlb_id_au$.utils.listtree2.edit = function(o) {

  var module = {};
  var list    = $dlb_id_au$.utils.listtree2.list(o);
  var tree    = $dlb_id_au$.utils.listtree2.tree(o);
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

  // Enums associated with attach_hook.

  module.ATTACHTYPE = {
    // Inserting before something.
    BEFORE:0,
    // Inserting after something.
    AFTER:1,
    // Appending to the end of parent (parent is passed as 2nd arg).
    APPEND:2,
    // Removing this entry (parent is passed as 2nd arg).
    DELETE:3
  };

  // Default attach_hook.
  //
  // Defines tree operations similar to the DOM.
  //
  // It can be overridden, see set_attach_hook.
  // 
  // IMPORTANT
  // * attach_hook's job is to manage the ancestor/descendent
  //   relationships and sibling relationships.
  // * if you override this, give careful thought to
  //   * appending a node to itself or its descendents
  //     * if you permit this, remember that you won't be
  //       able to have a single firstChild property
  // * operations will only link siblings if FIRSTCHILD is set.
  //   FIRSTCHILD is effectively a reference to the head of the list,
  //   hence its importance.
  // 

  module.attach_hook = function(ec,e,ATTACHTYPE) {
    var parentNode,before,after,append,remove;

    switch(ATTACHTYPE) {
    case module.ATTACHTYPE.APPEND:
      parentNode = e;
      append = true;
      break;
    case module.ATTACHTYPE.BEFORE:
      parentNode = e[PARENT];
      before = e;
      break;
    case module.ATTACHTYPE.AFTER:
      parentNode = e[PARENT];
      after = e;
      break;
    case module.ATTACHTYPE.DELETE:
      parentNode = e;
      remove = true;
      break;
    default:
      throw new Error("Invalid ATTACHTYPE:'"+ATTACHTYPE+"'");
    }

    // The 2nd arg (e) should exist except possibly when in DELETE
    // mode where we allow multiple deletes.
    if(!e) {
      if(!remove) {
        throw new Error("attach_hook called with invalid 2nd argument.");
      }
    }
    else {

      // Allow no circularity.

      var hash = {};
      tree.walkParents(e,function(ee){

        // Is the parent chain cycling?
        if(hash[ee]) {
          throw new Error("Circular parent relationship detected");
        }
        hash[ee] = ee;

        // Is the thing we're inserting before/after or being appended to,
        // a descendent of us?
        if(ee==ec) {
          throw new Error("Can't have self as ancestor.");
        }
      });

      // We can't append or insert before/after ourselves.
      if(ec==e) {
        throw new Error("Can't have self as ancestor.");
      }
    }


    // Update the list where ec was previously joined to...
    list.unjoin(ec);

    // Now update it's parent node...
    ec[PARENT] = parentNode;

    // Now link it in to new location...
    if(before) {
      // Are we before the first child?
      if(parentNode && (parentNode[FIRSTCHILD]==e)) {
        parentNode[FIRSTCHILD] = ec;
      }
      list.joinBefore(ec,before);
    }
    if(after) {
      list.joinAfter(ec,after);
    }
    if(append) {
      // Are we the only child?
      if(parentNode && (!parentNode[FIRSTCHILD])) {
        parentNode[FIRSTCHILD] = ec;
      } else {
        var last = list.last(parentNode[FIRSTCHILD]);
        list.joinAfter(ec,last);
      }
    }
    if(remove) {
      // Were we the first child?
      if(parentNode) {
        if(parentNode[FIRSTCHILD]==ec) {
          parentNode[FIRSTCHILD]=ec[NEXT];
        }
      }
      ec[PARENT] = null;
      list.unjoin(ec);
    }

  };

  // An implementation of the browser DOM attach hook.
  //
  // Pass this to set_attach_hook to use it.

  module.dom_attach_hook = function(ec,e,ATTACHTYPE) {
    switch(ATTACHTYPE) {
    case module.ATTACHTYPE.BEFORE:
      e.parentNode.insertBefore(ec,e);
      break;
    case module.ATTACHTYPE.AFTER:
      if(e.nextSibling) {
        e.parentNode.insertBefore(ec,e.nextSibling);
      } else {
        e.parentNode.appendChild(ec);
      }
      break;
    case module.ATTACHTYPE.APPEND:
      e.appendChild(ec);
      break;
    case module.ATTACHTYPE.DELETE:
      e.removeChild(ec);
      break;
    default:
      throw new Error("Invalid ATTACHTYPE: '"+ATTACHTYPE+"'");
    }
  };

  // So we can recover it.
  module.attach_hook$        = module.attach_hook;
  module.default_attach_hook = module.attach_hook;

  // For convenience, allow the user of this module to permanently
  // override the attach_hook.
  //
  // To revert to default attach hook, just call
  //   set_attach_hook();

  module.set_attach_hook = function(fn) {
    if(fn) {
      module.attach_hook = fn;
    } else {
      // Reset.
      module.attach_hook = module.attach_hook$;
    }
  };

  // Insert e1 before e2.
  //
  // insertBefore(e1,e2) => insert e1 before e2

  module.insertBefore = function(e1,e2) {
    module.attach_hook(e1,e2,module.ATTACHTYPE.BEFORE);
    return e1;
  };

  // Insert e1 after e2.
  // 
  // insertAfter(e1,e2) => insert e1 after e2

  module.insertAfter = function(e1,e2) {
    module.attach_hook(e1,e2,module.ATTACHTYPE.AFTER);
    return e1;
  };

  // Append ec to ep.
  //
  // appendChild = insertAfter everything else.

  module.appendChild = function(ec,ep) {
    module.attach_hook(ec,ep,module.ATTACHTYPE.APPEND);
    return ec;
  };

  // Remove element from it's surrounding list and return it.
  //
  // We should be able to call removeChild any number of times on an
  // already-removed entry.  If the attach_hook implementation removes
  // nodes before inserting them at another part of the tree (which is
  // what the DOM does), we can't detect this, so we simply ignore
  // entries that already have no parent.

  module.removeChild = function(entry) {
    module.attach_hook(entry,entry[PARENT],module.ATTACHTYPE.DELETE);
    return entry;
  };


  return module;

};
