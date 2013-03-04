// See dev-globals.js .

tests.items.push(

  with_tests$('pp tests',function(M){

    var utils = $dlb_id_au$.utils;

    M.test('pp example',function(){
      var str;
      var pp = utils.pretty_print.p;
      str = pp({a:1});
      this.assertEquals('pp of an object','{a:1}',str);
      str = pp([1,'a']);
      this.assertEquals('pp of an array','[1,"a"]',str);
    });

  })

);


