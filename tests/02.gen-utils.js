// See dev-globals.js .

tests.items.push(with_tests$('01.utils',function(M){

  var utils = $dlb_id_au$.utils;
  var gen_utils = $dlb_id_au$.utils.gen_utils;

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
    var result = utils.gen_utils.eachr(o,function(thing,index,before){
      if(before) {
        a.push([index,thing]);
      } else {
        b.push([index,thing]);
      }
    });

    M.test("it should not return a value",function(){
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
    M.test("it should stop recursing if fn returns truthy");
  });

  M.tests("mapr",function(M){
    M.test("it should return a clone of the original",function(){
      var o = {a:1,b:[1,2,3],c:[4,5,6]};
      var result = utils.gen_utils.mapr(o,function(){});
      it(result.a).should.be(1);
      it(result).should.not_be(o);
    });

    M.test("it should transform the original",function(){
      var o = {a:1,b:[1,2,3],c:[4,5,6]};
      var result = utils.gen_utils.mapr(o,function(thing){
        thing.a = 24;
      });
      it(result.a).should.be(24);
      it(o.a).should.be(1);
    });

    M.test("it can stop recursing if fn returns truthy");
    M.test("it should stop recursing if fn returns truthy");
  });

  M.tests("interleave",function(M){
    M.test("it should call fn in an interleaved manner",function(){
      var a = [1,2,3,4];
      var r = [];
      gen_utils.interleave(a,function(x,y){
        r.push([x,y]);
      });
      it(r).should.be([[1,2],[2,3],[3,4]]);
    });
    M.test("it should return a transformation",function(){
      var a = [1,2,3,4];
      var r;
      r = gen_utils.interleave(a,function(x,y){
        return [x,y];
      },true);
      it(r).should.be([[1,2],[2,3],[3,4]]);
    });
    M.test("it can be used to join strings with delimiter (tests calling with 'this')",function(){
      var a = ["hi","there","yo"];
      var o = {str:''};
      var DELIM = ' ';
      gen_utils.interleave.call(o,a,function(x,y){
        if(o.str=='') {
          o.str+=x+DELIM+y;
        } else {
          o.str+=DELIM+y;
        }
      });
      it(o.str).should.be("hi there yo");
    });
    M.test("it can be used to join linked lists (ibid)",function(){
      var entries = [{id:1},{id:2},{id:3}];
      var join = function(a,b) {
        a.next = b;
        b.previous = a;
      };
      gen_utils.interleave(entries,function(a,b){
        join(a,b);
      });
      it(entries[0].next).should.be(entries[1]);
      it(entries[1].next).should.be(entries[2]);
      it(entries[2].previous).should.be(entries[1]);
      it(entries[1].previous).should.be(entries[0]);
      it(entries[2].next).should.not_exist();
      it(entries[0].previous).should.not_exist();
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


