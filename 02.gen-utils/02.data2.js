
$dlb_id_au$.utils.data2 = function() {

  var module = {};
  var object = $dlb_id_au$.utils.gen_utils.object;

  module.makeEntry = function() {
    return {
      next$:null,
      previous$:null,
      parentEntry$:null,
      children$:{
        head:null
      },
      data$:{}
    };
  };

  return module;

}();
