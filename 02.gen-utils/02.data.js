
$dlb_id_au$.utils.data = function() {

  var module = {};

  // Entry data structure.
  //
  // Intended for use with linked lists and trees.
  // (See subsequent modules.)

  module.makeEntry = function() {

    return {

      next:null,
      previous:null,

      // Another entry that contains this entry.
      // 
      // parentEntry.list will contain this entry.

      parentEntry:null,

      // A list of entries associated with this entry.
      // 
      // This entry would be the parentEntry of these entries.

      list:null,

      // Place to hang functions or data associated with this list
      // item.

      data:{}
    };

  };

  return module;

}();

