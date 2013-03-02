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

  // Make an entry / make a tree.
  //
  // This could be the root entry in the tree.
  // Entries are just extended list entry objects.
  // If 'entry' is passed, it will be converted to a entry.
  // 
  // The chief innovations we apply to list entries are:
  // 1) entry.parentEntry
  //    Note the nested call to makeEntry in the makeEntry callback
  //    and how we set parentEntry to the parent node.
  // 2) entry.list
  //    A list of entries.
  //
  // Operations like append and insertBefore are performed on
  // 'list'.

  module.makeEntry = function(entry) {

    if(!entry) {
      entry = list.makeEntry();
    }

    entry.parentEntry = null;
    entry.list = new List({
      makeEntry:{
        entry:entry, // Avoid closure.
        run:function(entry){
          var e;
          e = module.makeEntry(entry);
          // Use this.entry to avoid closure, hopefully :)
          e.parentEntry = this.entry;
          return e;
        }
      }
    });

    return entry;
  };

  // Walk a tree of entries depth-first.

  module.walk = function(entry,visit,postVisit,fn) {
    if(visit) {
      visit(entry);
    }
    if(entry.list && entry.list.head) {
      list.walk(entry.list.head,function(entry){
        module.walk(entry,visit,postVisit,fn);
      });
    }
    if(postVisit) {
      postVisit(entry);
    }
  };

  return module;

}();
