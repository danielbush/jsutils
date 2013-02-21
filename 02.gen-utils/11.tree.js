/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

$dlb_id_au$.utils.tree = function(){

  var module = {};

  var List   = $dlb_id_au$.utils.list3.List;
  var list   = $dlb_id_au$.utils.listops;

  // Make a node / make a tree.
  //
  // This could be the root node in the tree.
  // Nodes are just extended list entry objects.
  // If 'entry' is passed, it will be converted to a node.
  // 
  // The chief innovations we apply to list entries are:
  // 1) node.parentNode
  //    Note the nested call to makeNode in the makeEntry callback
  //    and how we set parentNode to the parent node.
  // 2) node.children
  //    A list of children.
  //
  // Operations like append and insertBefore are performed on
  // 'children'.

  module.makeNode = function(entry) {
    var node;

    if(entry) {
      node = entry;
    } else {
      node = list.makeEntry();
    }

    node.children = new List({
      node:node, // Avoid closure.
      makeEntry:function(entry){
        var n;
        n = module.makeNode(entry);
        // Use this.node to avoid closure, hopefully :)
        n.parentNode = this.node;
        return n;
      }
    });

    node.parentNode = null;
    return node;
  };

  // Walk a tree of nodes depth-first.

  module.walk = function(node,visit,postVisit,fn) {
    if(visit) {
      visit(node);
    }
    if(node.children && node.children.head) {
      list.walk(node.children.head,function(node){
        module.walk(node,visit,postVisit,fn);
      });
    }
    if(postVisit) {
      postVisit(node);
    }
  };

  return module;

}();
