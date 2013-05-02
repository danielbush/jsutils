
$dlb_id_au$.utils.listtree.data2 = function() {

  var module = {};
  var object = $dlb_id_au$.utils.gen_utils.object;
  var facets = $dlb_id_au$.utils.facets;

  module.makeEntry = function() {
    return {
      next$:null,
      previous$:null,
      parentEntry$:null,
      firstChild$:null
    };
  };

  // Create facet function for utils listtree:
  module.facet = facets.makeFacet2('list',module.makeEntry);

  // Standard deref function:
  module.facet.deref = facets.deref;

  return module;

}();

