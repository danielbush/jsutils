// See dev-globals.js .

tests.items.push(

  with_tests$('pp tests',function(M){

    var utils = $dlb_id_au$.utils;

    M.test('pp example',function(){
      var str;
      var pp = utils.pretty_print.p;
      str = pp({a:1});
      // 'pp of an object'
      it(str).should.be('{a:1}');
      str = pp([1,'a']);
      //'pp of an array'
      it(str).should.be('[1,"a"]');
    });

  })

);


