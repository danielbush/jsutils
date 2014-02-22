// See dev-globals.js .

tests.items.push(with_tests$('lists and trees',function(M){

  var gen_utils = $dlb_id_au$.utils.gen_utils;

  var data2     = $dlb_id_au$.utils.listtree.data2;
  var findops   = $dlb_id_au$.utils.listtree.findops;
  var editops   = $dlb_id_au$.utils.listtree.editops;

  M.tests('data2 list/tree ops',function(M){

    M.test('Make entry...',function(){
      var e = data2.makeEntry();
      it(e.next$).should.not_exist();
    });

    M.tests('Building a list...',function(M){

      M.test('2 arg ops',function(){
        var e1,e2;
        e1 = data2.makeEntry();
        e2 = data2.makeEntry();

        editops.insertAfter(e1,e2);
        it(e2.next$).should.be(e1);
        it(e1.previous$).should.be(e2);

        editops.insertBefore(e1,e2);
        it(e1.next$).should.be(e2);
        it(e2.previous$).should.be(e1);
        
      });

      M.test('1 arg ops',function(){
        var e1,e2;
        e1 = data2.makeEntry();

        e2 = editops.insertBefore(e1);
        it(e2.next$).should.be(e1);
        it(e1.previous$).should.be(e2);

        e1 = data2.makeEntry();
        e2 = editops.insertAfter(e1);
        it(e1.next$).should.be(e2);
        it(e2.previous$).should.be(e1);

      });
      
    });

    M.tests('Building a tree...',function(M){

      M.test('2 arg...',function(){
        var e,e1,e2,e3;

        e1 = data2.makeEntry();
        e2 = data2.makeEntry();
        editops.appendChild(e2,e1);
        it(e1.firstChild$).should.be(e2);
        it(e2.parentEntry$).should.be(e1);

        e3 = data2.makeEntry();
        editops.appendChild(e3,e1);
        it(e1.firstChild$).should.be(e2);
        it(e1.firstChild$.next$).should.be(e3);
        it(e3.parentEntry$).should.be(e1);

        e = editops.insertAfter(e3);
        it(e3.next$).should.be(e);

        //"insertAfter: New entry's parent is same as e3's.",
        it(e.parentEntry$).should.be(e3.parentEntry$);
        it(e.parentEntry$).should.be(e1);

        e = editops.insertBefore(e3);
        //"insertBefore: New entry's parent is same as e3's.",
        it(e.parentEntry$).should.be(e3.parentEntry$);
        it(e.parentEntry$).should.be(e1);

      });

      M.test('1 arg...',function(){
        e1 = data2.makeEntry();
        e2 = editops.appendChild(e1);
        it(e1.firstChild$).should.be(e2);
        it(e2.parentEntry$).should.be(e1);
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
        it(entry.tag).should.be(2);
        entry = findops.cycle(entry);
        it(entry.tag).should.be(3);
        entry = findops.cycle(entry);
        it(entry.tag).should.be(4);
        entry = findops.cycle(entry);
        // 'Should loop back.'
        it(entry.tag).should.be(1);
      });

      M.test('cycling back',function() {
        var tail = findops.tail(makeTestList(4));
        var entry = findops.cycle(tail,-1);
        it(entry.tag).should.be(3);
        var entry = findops.cycle(entry,-1);
        it(entry.tag).should.be(2);
        var entry = findops.cycle(entry,-1);
        it(entry.tag).should.be(1);
        var entry = findops.cycle(entry,-1);
        // 'Should loop back.'
        it(entry.tag).should.be(4);
      });

      M.test('sibwalking',function() {
        var str = '';
        var head = makeTestList(4);
        findops.sibwalk(head,function(entry){
          str += entry.tag + ' ';
        });
        it(str).should.be('1 2 3 4 ');
        it(findops.count(head)).should.be(4);
        it(findops.head(head.next$)).should.be(head);
        it(findops.tail(head)).should.be(head.next$.next$.next$);
      });

      M.test('next/previous',function() {
        var head = makeTestList(4);
        var n;
        it((n=findops.next(head)).tag).should.be(2);
        it(findops.previous(n).tag).should.be(1);
      });

      M.test('find nth',function() {
        var head = makeTestList(4);
        var tail = findops.tail(head);
        var n;
        //'n>0 / flag=true'
        it((n=findops.nth(0,head,true)).tag).should.be(1);
        it((n=findops.nth(1,head,true)).tag).should.be(2);
        it((n=findops.nth(2,head,true)).tag).should.be(3);
        it((n=findops.nth(3,head,true)).tag).should.be(4);

        // 'n>0 / flag=true / non-head start'
        it((n=findops.nth(1,head.next$,true)).tag).should.be(2);
        // 'n>0 / flag=false / non-head start'
        it((n=findops.nth(1,head.next$,false)).tag).should.be(3);

        // 'From non-head position.'
        it((n=findops.nth(2,tail,true)).tag).should.be(3);

        // 'n<0 / flag=false'
        it((n=findops.nth(-1,tail,false)).tag).should.be(3);
      });

      M.tests('tree walking',function(M) {

        M.test('basic walk/walkback',function(){
          var tree = makeTestTree(2,2);
          var str = '';
          var str2 = '';
          findops.walk(tree,function(e){
            str+=e.tag+' ';
          });
          it(str).should.be('0 1 2 3 4 5 6 ');

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
          it(str).should.be('0 4 6 5 1 3 2 ');
          it(str2).should.be('6 5 4 3 2 1 0 ');
        });

        M.test('walkAfter/walkBefore',function(){
          var tree = makeTestTree(2,2);
          var e,str;

          e = tree.firstChild$.firstChild$.next$;
          it(e.tag).should.be(3);

          str = '';
          findops.walkAfter(e,function(e){
            str += e.tag + ' ';
          });
          it(str).should.be('4 5 6 ');

          // 'just checking'
          it(e.tag).should.be(3);
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
          //'previsit order'
          it(str).should.be('2 ');
          //'postvisit order'
          it(str2).should.be('2 1 0 ');

          //'just checking'
          it(e.tag).should.be(2);
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
          it(str).should.be('');
          it(str2).should.be('1 0 ');
        });

        M.test('breaking behaviour',function(){
          // Test that returning true will halt the walk.
          var tree = makeTestTree(2,2);
          var e,str;

          e = tree.firstChild$.next$.firstChild$;
          it(e.tag).should.be(5);

          str = '';
          findops.walkBefore(e,function(e){
            if(e.tag==3) return true;
            str += e.tag + ' ';
          });
          it(str).should.be('1 ');

        });

        M.test('parent walking',function() {
          var tree = makeTestTree(2,2);
          var entry = tree.firstChild$.firstChild$;
          var result = [];
          it(entry.tag).should.be(2);
          findops.walkParents(entry,function(p){
            result.push(p);
          });
          it(result[0].tag).should.be(1);
          it(result[1].tag).should.be(0);
        });

        M.test('first',function() {
          var tree = makeTestTree(2,2);
          var e = findops.first(tree);
          it(e.tag).should.be(0);
        });

        M.test('last',function() {
          var tree = makeTestTree(2,2);
          var e = findops.last(tree);
          it(e.tag).should.be(6);
        });


        M.test('cycleNext',function() {
          var tree = makeTestTree(2,2);
          var e;
          e = findops.cycleNext(tree);
          it(e.tag).should.be(1);
          e = findops.cycleNext(e);
          it(e.tag).should.be(2);
          e = findops.cycleNext(e);
          it(e.tag).should.be(3);
          e = findops.cycleNext(e);
          it(e.tag).should.be(4);
          e = findops.cycleNext(e);
          it(e.tag).should.be(5);
          e = findops.cycleNext(e);
          it(e.tag).should.be(6);
          e = findops.cycleNext(e);
          // 'Should cycle back to root.'
          it(e.tag).should.be(0);
        });

        M.test('cyclePrevious',function() {
          var tree = makeTestTree(2,2);
          var e;
          e = findops.cyclePrevious(tree);
          it(e.tag).should.be(6);
          e = findops.cyclePrevious(e);
          it(e.tag).should.be(5);
          e = findops.cyclePrevious(e);
          it(e.tag).should.be(4);
          e = findops.cyclePrevious(e);
          it(e.tag).should.be(3);
          e = findops.cyclePrevious(e);
          it(e.tag).should.be(2);
          e = findops.cyclePrevious(e);
          it(e.tag).should.be(1);
          e = findops.cyclePrevious(e);
          it(e.tag).should.be(0);
          e = findops.cyclePrevious(e);
          //'Should wrap.'
          it(e.tag).should.be(6);
        });

      });
      
    });

  });

}));


