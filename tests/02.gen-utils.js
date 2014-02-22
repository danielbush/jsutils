// See dev-globals.js .

tests.items.push(with_tests$('01.utils',function(M){

  var utils = $dlb_id_au$.utils;

  M.tests("eachr",function(M){

    // TODO: hard to test object literals since
    // order is not guaranteed.  Instead of pushing
    // to an array, we should probably use object
    // literal.

    // Start with an array since order is guaranteed:
    var o = [
      {field1a:'val1a',field1b:['val1b','val1c']},
      ['val2a','val2b',{field2c:'val2c',field2d:[1,2,3]}]
    ];
    var a = [],b = [];
    var result = utils.gen_utils.eachr(o,null,function(thing,index,before){
      if(before) {
        a.push([index,thing]);
      } else {
        b.push([index,thing]);
      }
    });

    M.test('Return value is not defined.',function(){
      it(result).should.not_exist();
    });
    M.test('Outer index is not set',function(){
      it(a[0][0]).should.not_exist();
    });
    M.test('First object passed in is the object itself',function(){
      it(a[0][1][0]['field1a']).should.be('val1a');
    });
    M.test('Next value is next nested object',function(){
      it(a[1][1]['field1b'][0]).should.be('val1b');
    });
  });

  M.tests("mapr",function(M){
    M.test("it should clone (not be exact copy",function(){
      var o = {a:1,b:[1,2,3],c:[4,5,6]};
      var result = utils.gen_utils.mapr(o,null,function(){});
      it(result.a).should.be(1);
      it(result).should.not_be(o);
    });

    M.test("it should transform the original",function(){
      var o = {a:1,b:[1,2,3],c:[4,5,6]};
      var result = utils.gen_utils.mapr(o,null,function(thing){
        thing.a = 24;
      });
      it(result.a).should.be(24);
      it(o.a).should.be(1);
    });
  });

  M.tests("when",function(M){
    M.test('timeout test (check console log for results)',function(){
      var SIGNAL = false;
      var RESULT = 0;
      var condfn,fn,that=this;
      condfn = function() {
        if(SIGNAL) return true;
      };
      fn = function() {
        RESULT+=1;
      };
      utils.gen_utils.when(condfn,fn,0,100);
      it(RESULT).should.be(0); // not called yet.
      SIGNAL = true;
      // TODO: setTimeout is asynchronous.  unitjs can't handle this,
      // and the assertion is not counted.  Atm, we're just updating
      // the console.log.
      setTimeout(function(){
        console.log('RESULT should be 1, is:'+RESULT);
        //that.assertEquals("fn should now be called.",1,RESULT);
      },200);
    });
  });

}));


