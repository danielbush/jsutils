// See dev-globals.js .

tests.items.push(with_tests$('lists and trees',function(M){

  var gen_utils = $dlb_id_au$.utils.gen_utils;

  var data2     = $dlb_id_au$.utils.listtree.data2;
  var findops   = $dlb_id_au$.utils.listtree.findops;
  var editops   = $dlb_id_au$.utils.listtree.editops;

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
        this.assert(e1.firstChild$==e2);
        this.assert(e2.parentEntry$==e1);

        e3 = data2.makeEntry();
        editops.appendChild(e3,e1);
        this.assert(e1.firstChild$==e2);
        this.assert(e1.firstChild$.next$==e3);
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
        this.assert(e1.firstChild$==e2);
        this.assert(e2.parentEntry$==e1);
      });

    });
    
    // Make an entry and add 'd' as tag in data$.

    var makeTestEntry = function(d){
      var e = data2.makeEntry();
      e.tag = d;
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
    //   1      4
    // 2   3  5   6

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

      M.test('cycling forward',function() {
        var head = makeTestList(4);
        var entry;
        entry = findops.cycle(head);
        this.assertEquals(2,entry.tag);
        entry = findops.cycle(entry);
        this.assertEquals(3,entry.tag);
        entry = findops.cycle(entry);
        this.assertEquals(4,entry.tag);
        entry = findops.cycle(entry);
        this.assertEquals('Should loop back.',1,entry.tag);
      });

      M.test('cycling back',function() {
        var tail = findops.tail(makeTestList(4));
        var entry = findops.cycle(tail,-1);
        this.assertEquals(3,entry.tag);
        var entry = findops.cycle(entry,-1);
        this.assertEquals(2,entry.tag);
        var entry = findops.cycle(entry,-1);
        this.assertEquals(1,entry.tag);
        var entry = findops.cycle(entry,-1);
        this.assertEquals('Should loop back.',4,entry.tag);
      });

      M.test('sibwalking',function() {
        var str = '';
        var head = makeTestList(4);
        findops.sibwalk(head,function(entry){
          str += entry.tag + ' ';
        });
        this.assertEquals('1 2 3 4 ',str);
        this.assertEquals(4,findops.count(head));
        this.assertEquals(head,findops.head(head.next$));
        this.assertEquals(
          head.next$.next$.next$,
          findops.tail(head)
        );
      });

      M.test('next/previous',function() {
        var head = makeTestList(4);
        var n;
        this.assertEquals(2,(n=findops.next(head)).tag);
        this.assertEquals(1,findops.previous(n).tag);
      });
      M.test('find nth',function() {
        var head = makeTestList(4);
        var tail = findops.tail(head);
        var n;
        this.assertEquals('n>0 / flag=true',
                          1,(n=findops.nth(0,head,true)).tag);
        this.assertEquals(2,(n=findops.nth(1,head,true)).tag);
        this.assertEquals(3,(n=findops.nth(2,head,true)).tag);
        this.assertEquals(4,(n=findops.nth(3,head,true)).tag);

        this.assertEquals('n>0 / flag=true / non-head start',
                          2,(n=findops.nth(1,head.next$,true)).tag);
        this.assertEquals('n>0 / flag=false / non-head start',
                          3,(n=findops.nth(1,head.next$,false)).tag);

        this.assertEquals('From non-head position.',
                          3,(n=findops.nth(2,tail,true)).tag);

        this.assertEquals('n<0 / flag=false',
                          3,(n=findops.nth(-1,tail,false)).tag);
      });

      M.tests('tree walking',function(M) {

        M.test('basic walk/walkback',function(){
          var tree = makeTestTree(2,2);
          var str = '';
          var str2 = '';
          findops.walk(tree,function(e){
            str+=e.tag+' ';
          });
          this.assertEquals('0 1 2 3 4 5 6 ',str);

          str = '';
          findops.walkback(
            tree,
            function(e){
              str+=e.tag+' ';
            },
            function(e){
              str2+=e.tag+' ';
            }
          );
          this.assertEquals('0 4 6 5 1 3 2 ',str);
          this.assertEquals('6 5 4 3 2 1 0 ',str2);
        });

        M.test('walkAfter/walkBefore',function(){
          var tree = makeTestTree(2,2);
          var e,str;

          e = tree.firstChild$.firstChild$.next$;
          this.assertEquals(3,e.tag);

          str = '';
          findops.walkAfter(e,function(e){
            str += e.tag + ' ';
          });
          this.assertEquals('4 5 6 ',str);

          this.assertEquals('just checking',3,e.tag);
          str = '';
          str2 = '';
          findops.walkBefore(
            e,
            function(e2){
              e = e2;
              str += e2.tag + ' ';
            },
            function(e2){
              str2 += e2.tag + ' ';
            }
          );
          this.assertEquals('previsit order','2 ',str);
          this.assertEquals('postvisit order','2 1 0 ',str2);

          this.assertEquals('just checking',2,e.tag);
          str = '';
          str2 = '';
          findops.walkBefore(
            e,
            function(e){
              str += e.tag + ' ';
            },
            function(e){
              str2 += e.tag + ' ';
            }
          );
          this.assertEquals('',str);
          this.assertEquals('1 0 ',str2);
        });

        M.test('breaking behaviour',function(){
          // Test that returning true will halt the walk.
          var tree = makeTestTree(2,2);
          var e,str;

          e = tree.firstChild$.next$.firstChild$;
          this.assertEquals(5,e.tag);

          str = '';
          findops.walkBefore(e,function(e){
            if(e.tag==3) return true;
            str += e.tag + ' ';
          });
          this.assertEquals('1 ',str);

        });

        M.test('parent walking',function() {
          var tree = makeTestTree(2,2);
          var entry = tree.firstChild$.firstChild$;
          var result = [];
          this.assertEquals(2,entry.tag);
          findops.walkParents(entry,function(p){
            result.push(p);
          });
          this.assertEquals(1,result[0].tag);
          this.assertEquals(0,result[1].tag);
        });

        M.test('first',function() {
          var tree = makeTestTree(2,2);
          var e = findops.first(tree);
          this.assertEquals(0,e.tag);
        });

        M.test('last',function() {
          var tree = makeTestTree(2,2);
          var e = findops.last(tree);
          this.assertEquals(6,e.tag);
        });


        M.test('cycleNext',function() {
          var tree = makeTestTree(2,2);
          var e;
          e = findops.cycleNext(tree);
          this.assertEquals(1,e.tag);
          e = findops.cycleNext(e);
          this.assertEquals(2,e.tag);
          e = findops.cycleNext(e);
          this.assertEquals(3,e.tag);
          e = findops.cycleNext(e);
          this.assertEquals(4,e.tag);
          e = findops.cycleNext(e);
          this.assertEquals(5,e.tag);
          e = findops.cycleNext(e);
          this.assertEquals(6,e.tag);
          e = findops.cycleNext(e);
          this.assertEquals('Should cycle back to root.',0,e.tag);
        });

        M.test('cyclePrevious',function() {
          var tree = makeTestTree(2,2);
          var e;
          e = findops.cyclePrevious(tree);
          this.assertEquals(6,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals(5,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals(4,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals(3,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals(2,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals(1,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals(0,e.tag);
          e = findops.cyclePrevious(e);
          this.assertEquals('Should wrap.',6,e.tag);
        });

      });
      
    });

  });

}));


