/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2014 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

$dlb_id_au$.utils.listtree2.data = function() {

  var module = {};

  module.makeEntry = function() {
    return {
      nextSibling:null,
      previousSibling:null,
      parentNode:null,
      firstChild:null
    };
  };

  // Takes an array of nested arrays and converts to a tree.
  //
  // Don't have a major reason to do this, other than it seemed like
  // an easy recursive procedure to write and it may be handy when
  // creating fixtures for tests.
  //
  // Note how we inject the join and appendChild functions.
  //
  // If you want to make lists, see list.join.
  // I do not see any point in re-writing it here.
  // You can of course pass list.join and edit.appendChild
  // to this function, (or not as you prefer).
  //
  // Examples:
  // [a b c] => tree with root a and children b,c
  // [a [b d e] c] => as previous, but b has children d,e.
  // 
  // The recursive definition of 'arr' is:
  //   arr := [root,child[,child,...] ]
  // where root must be a non-array
  // and child can be a non-array or another arr.
  //
  // 'join'/'appendChild' are used to join/append entries in the tree.

  module.makeTree = function(arr,join,appendChild) {
    var i;
    if(!(arr instanceof Array)) {
      throw new Error("Unexpected non-array.");
    }
    var root = arr[0];
    var child,prevchild;
    if(root instanceof Array) {
      throw new Error("Can't use array as first item.");
    }

    for(i=1;i<arr.length;i++) {
      if(arr[i] instanceof Array) {
        module.makeTree(arr[i],join,appendChild);
        child = arr[i][0];
      } else {
        child = arr[i];
      }
      if(appendChild) {
        appendChild(child,root);
      }
      if(prevchild && join) {
        join(prevchild,child);
      }
      prevchild = child;
    }
    return root;
  };

  return module;

}();

