
$dlb_id_au$.utils.data = function() {

  var module = {};
  var object = $dlb_id_au$.utils.gen_utils.object;


  // Entry data structure.
  //
  // Intended for use with linked lists and trees.
  // (See subsequent modules.)

  module.makeEntry = function() {
    var e;
    e = object(entryMethods);

    // List properties:
    e.next = null;
    e.previous = null;

    // Tree properties:
    // 
    // Another entry that contains this entry.
    // parentEntry.list will contain this entry.
    e.parentEntry = null;

    // A list of entries associated with this entry.
    // This entry would be the parentEntry of these entries.
    e.list = null;

    // Data associated with the entry should be stored here.
    e.data = {};

    return e;
  };

  var entryMethods = {

    // Users of lists (whether a tree or some higher level structure
    // that you've invented) should not modify the entry directly.
    // All data should be stored somewhere in the 'data' property of the
    // entry.
    // To formalise this, we have this function.
    // You can live without, but by having it, it reminds us about the
    // convention / protocol we are using here.
    //
    // Example:
    //   // Create an appended entry from a list.
    //   entry = list.append();
    //   // Use getData:
    //   o = entry.getData('foo');
    //   o.blah = someData;

    getData:function(key) {
      if(!this.data) {
        this.data = {};
      }
      if(!this.data[key]) {
        this.data[key] = {};
      }
      return this.data[key];
    }

  };

  return module;

}();

