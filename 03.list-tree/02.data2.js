
$dlb_id_au$.utils.listtree.data2 = function() {

  var module = {};
  var object = $dlb_id_au$.utils.gen_utils.object;
  var facets = $dlb_id_au$.utils.facets;

  module.makeEntry = function() {
    return {
      next$:null,
      previous$:null,
      parentEntry$:null,
      children$:{
        head:null
      }
    };
  };

  // Create facet function for utils listtree:
  var listfacet = facets.makeFacet2('list',module.makeEntry);
  module.list = listfacet.make;
  module.isList = listfacet.test;

  // Standard deref function:
  module.deref = facets.deref;

  return module;

}();

