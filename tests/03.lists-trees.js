// See dev-globals.js .

tests.items.push(with_tests$('lists and trees',function(M){

  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var data2 = $dlb_id_au$.utils.data2;
  var findops = $dlb_id_au$.utils.findops;
  var editops = $dlb_id_au$.utils.editops;

  M.tests('data2 list/tree ops',function(M){

    M.test('Make entry...',function(){
      var e = data2.makeEntry();
      this.assert(e.next$===null); // etc
    });

    M.tests('Building a list...',function(M){

      M.test('2 arg ops',function(){
        var e1,e2;
        e1 = data2.makeEntry();
        e2 = data2.makeEntry();

        editops.insertAfter(e1,e2);
        this.assert(e2.next$==e1);
        this.assert(e1.previous$==e2);

        editops.insertBefore(e1,e2);
        this.assert(e1.next$==e2);
        this.assert(e2.previous$==e1);
        
      });

      M.test('1 arg ops',function(){
        var e1,e2;
        e1 = data2.makeEntry();

        e2 = editops.insertBefore(e1);
        this.assert(e2.next$==e1);
        this.assert(e1.previous$==e2);

        e1 = data2.makeEntry();
        e2 = editops.insertAfter(e1);
        this.assert(e1.next$==e2);
        this.assert(e2.previous$==e1);

      });
      
    });

    M.tests('Building a tree...',function(M){
      M.test('2 arg...',function(){
        var e,e1,e2,e3;

        e1 = data2.makeEntry();
        e2 = data2.makeEntry();
        editops.appendChild(e2,e1);
        this.assert(e1.children$.head==e2);
        this.assert(e2.parentEntry$==e1);

        e3 = data2.makeEntry();
        editops.appendChild(e3,e1);
        this.assert(e1.children$.head==e2);
        this.assert(e1.children$.head.next$==e3);
        this.assert(e3.parentEntry$==e1);

        e = editops.insertAfter(e3);
        this.assert(e3.next$==e);
        this.assertEquals(
          "insertAfter: New entry's parent is same as e3's.",
          e3.parentEntry$,
          e.parentEntry$
        );
        this.assertEquals(
          "insertAfter: New entry's parent is same as e3's.",
          e1,e.parentEntry$
        );

        e = editops.insertBefore(e3);
        this.assertEquals(
          "insertBefore: New entry's parent is same as e3's.",
          e3.parentEntry$,
          e.parentEntry$
        );
        this.assertEquals(
          "insertBefore: New entry's parent is same as e3's.",
          e1,
          e.parentEntry$
        );

      });

      M.test('1 arg...',function(){
        e1 = data2.makeEntry();
        e2 = editops.appendChild(e1);
        this.assert(e1.children$.head==e2);
        this.assert(e2.parentEntry$==e1);
      });

    });
    
    // Make an entry and add 'd' as tag in data$.

    var makeTestEntry = function(d){
      var e = data2.makeEntry();
      e.data$.tag = d;
      return e;
    };

    // Make a list of entries.

    var makeTestList = function(n) {
      var head,e1,e2;
      if(!n) n = 3;
      for(var i=1;i<=n;i++) {
        e2 = makeTestEntry(i);
        if(!head) head = e2;
        if(e1) {
          editops.insertAfter(e2,e1);
        }
        e1 = e2;
      }
      return head;
    };

    // Return root node of tree.
    //
    // Example: n=2, levels = 0 to 2, depth = 2
    //      0
    //   1      2
    // 3   4  5   6
    // 

    var makeTestTree = function(n,depth) {
      if(!n) n = 2;
      if(!depth) depth = 2;
      var t = function(){return makeTestEntry(seq++);};
      var seq = 0;
      var root;

      var addChildren = function(e,level) {
        var i,head,h;
        if(!level) level = 0;
        for(i=1;i<=n;i++) {
          h = editops.appendChild(t(),e);
          if(level+1>=depth) {
          } else {
            addChildren(h,level+1);
          }
          if(!head) head = h;
        }
        return head;
      };

      root = t();
      addChildren(root);
      return root;
    };

    M.tests('Walking, finding, counting...',function(M){

      M.test('sibwalking',function() {
        var str = '';
        var head = makeTestList(4);
        findops.sibwalk(head,function(entry){
          str += entry.data$.tag + ' ';
        });
        this.assertEquals('1 2 3 4 ',str);
        this.assertEquals(4,findops.count(head));
        this.assertEquals(head,findops.head(head.next$));
        this.assertEquals(
          head.next$.next$.next$,
          findops.tail(head)
        );
      });

      M.tests('tree walking',function(M) {
        M.test('basic walk/walkback',function(){
          var tree = makeTestTree(2,2);
          var str = '';
          findops.walk(tree,function(e){
            str+=e.data$.tag+' ';
          });
          this.assertEquals('0 1 2 3 4 5 6 ',str);

          str = '';
          findops.walkback(tree,function(e){
            str+=e.data$.tag+' ';
          });
          this.assertEquals('0 4 6 5 1 3 2 ',str);
        });

        M.test('walkAfter/walkBefore',function(){
          var tree = makeTestTree(2,2);
          var e,str;

          e = tree.children$.head.children$.head.next$;
          this.assertEquals(3,e.data$.tag);

          str = '';
          findops.walkAfter(e,function(e){
            str += e.data$.tag + ' ';
          });
          this.assertEquals('4 5 6 ',str);

          str = '';
          findops.walkBefore(e,function(e){
            str += e.data$.tag + ' ';
          });
          this.assertEquals('2 ',str);
        });

        M.test('breaking behaviour',function(){
          // Test that returning true will halt the walk.
          var tree = makeTestTree(2,2);
          var e,str;

          e = tree.children$.head.next$.children$.head;
          this.assertEquals(5,e.data$.tag);

          str = '';
          findops.walkBefore(e,function(e){
            if(e.data$.tag==3) return true;
            str += e.data$.tag + ' ';
          });
          this.assertEquals('1 ',str);

        });

        M.test('parent walking',function() {
          var tree = makeTestTree(2,2);
          var entry = tree.children$.head.children$.head;
          var result = [];
          this.assertEquals(2,entry.data$.tag);
          findops.walkParents(entry,function(p){
            result.push(p);
          });
          this.assertEquals(1,result[0].data$.tag);
          this.assertEquals(0,result[1].data$.tag);
        });


      });
      
    });

  });

}));


