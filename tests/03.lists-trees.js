// See dev-globals.js .

tests.items.push(with_tests$('lists and trees',function(M){

  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var data2 = $dlb_id_au$.utils.data2;
  var entryops = $dlb_id_au$.utils.entryops;
  var List = $dlb_id_au$.utils.list3.List;
  var tree = $dlb_id_au$.utils.tree;

  M.tests('list3',function(M){

    var list0 = function(){return new List();};
    var list1 = function(){var l = list0(); l.append(); return l;};
    var list2 = function(){var l = list1(); l.append(); return l;};
    var list3 = function(){var l = list2(); l.append(); return l;};

    M.test('append',function(){
      var list = list0();
      var e,e2,e3;

      e = list.append();
      this.assert('Append to empty list.',list.head==e);
      this.assert('Append to empty list.',list.tail==e);

      e2 = list.append()
      this.assert('Append to non-empty list.',list.tail==e2);
      this.assert('Append to non-empty list.',list.head==e);
      this.assert('Append to non-empty list.',e.next==e2);
      this.assert('Append to non-empty list.',e2.previous==e);
    });

    M.test('insertBefore',function(){
      var list,h,t,e;
      list = list2();
      h = list.head; t = list.tail;
      e = list.insertBefore(list.head);
      this.assert('insertBefore 1-arg',list.head==e);
      this.assert('insertBefore 1-arg',e.next == h);
      this.assert('insertBefore 1-arg',h.next == t);

      list = list2();
      h = list.head; t = list.tail;
      e = list.insertBefore(list.tail);
      this.assert('insertBefore 1-arg',list.head==h);
      this.assert('insertBefore 1-arg',h.next == e);
      this.assert('insertBefore 1-arg',e.next == t);
    });

    M.test('insertAfter',function(){
      var list,h,t,e;

      list = list2();
      h = list.head; t = list.tail;
      e = list.insertAfter(list.tail);
      this.assert('insertAfter 1-arg',list.head==h);
      this.assert('insertAfter 1-arg',h.next == t);
      this.assert('insertAfter 1-arg',t.next == e);
      this.assert('insertAfter 1-arg',list.tail == e);

      list = list2();
      h = list.head; t = list.tail;
      e = list.insertAfter(list.head);
      this.assert('insertAfter 1-arg',list.head==h);
      this.assert('insertAfter 1-arg',h.next == e);
      this.assert('insertAfter 1-arg',e.next == t);
      this.assert('insertAfter 1-arg',list.tail == t);

    });

  });

  M.tests('Tree tests',function(M){

    var tree0 = function(){return tree.makeEntry();};
    var tree1 = function(){var t = tree0(); t.list.append(); return t;};
    var tree2 = function(){var t = tree1(); t.list.append(); return t;};

    M.test('Making entries and appending/inserting...',function(){
      var n,n2;
      n = tree.makeEntry();
      n2 = n.list.append();
      this.assert(
        "Appended entries have parentEntry set to entry.",
        n2.parentEntry==n
      );
      this.assert(
        "We can access the list of an entry by getting its parentEntry.",
        n2.parentEntry.list==n.list
      );
      console.log(n2);
      this.assert(
        "List operations create new entries with 'list' property.",
        !!n2.list
      );

      n2 = n.list.append();
      n2.data.a = true;
      n2 = n.list.insertAfter(n2);
      n2.data.b = true;
      this.assert(
        "We can insert after.",
        n2.data.b &&
        n2.previous.data.a
      );
      
      // Append one independent tree into another.
      n = tree2(); n.data.n = true;
      n2 = tree2(); n2.data.n2 = true;
      n2.list.head.data.n2first = true;
      n.list.append(n2);
      console.log(n);
      this.assert(
        "Append one tree as child of another.",
        n.list.tail == n2
      );
      this.assert(
        "Access the list of a child entry.",
        n.list.tail.list.head.data.n2first
      );
      
    });

    M.test('walking...',function(){
      var n,n2;
      var visit='',postVisit='';

      n = tree2();
      n.data.id='n';
      n.list.head.data.id='nh';
      n.list.tail.data.id='nt';
      n2 = tree2();
      n2.data.id='n2';
      n2.list.head.data.id='n2h';
      n2.list.tail.data.id='n2t';

      n.list.append(n2);
      
      tree.walk(
        n,
        function(entry){visit+=entry.data.id+'-';},
        function(entry){postVisit+=entry.data.id+'-';}
      );

      this.assertEquals(
        "pre-visit output",
        visit,'n-nh-nt-n2-n2h-n2t-'
      );
      this.assertEquals(
        "post-visit output",
        postVisit,'nh-nt-n2h-n2t-n2-n-'
      );

    });

  });

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

        entryops.insertAfter(e1,e2);
        this.assert(e2.next$==e1);
        this.assert(e1.previous$==e2);

        entryops.insertBefore(e1,e2);
        this.assert(e1.next$==e2);
        this.assert(e2.previous$==e1);
        
      });

      M.test('1 arg ops',function(){
        var e1,e2;
        e1 = data2.makeEntry();

        e2 = entryops.insertBefore(e1);
        this.assert(e2.next$==e1);
        this.assert(e1.previous$==e2);

        e1 = data2.makeEntry();
        e2 = entryops.insertAfter(e1);
        this.assert(e1.next$==e2);
        this.assert(e2.previous$==e1);

      });
      
    });

    M.tests('Building a tree...',function(M){
      M.test('2 arg...',function(){
        var e,e1,e2,e3;

        e1 = data2.makeEntry();
        e2 = data2.makeEntry();
        entryops.appendChild(e2,e1);
        this.assert(e1.children$.head==e2);
        this.assert(e2.parentEntry$==e1);

        e3 = data2.makeEntry();
        entryops.appendChild(e3,e1);
        this.assert(e1.children$.head==e2);
        this.assert(e1.children$.head.next$==e3);
        this.assert(e3.parentEntry$==e1);

        e = entryops.insertAfter(e3);
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

        e = entryops.insertBefore(e3);
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
        e2 = entryops.appendChild(e1);
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
          entryops.insertAfter(e2,e1);
        }
        e1 = e2;
      }
      return head;
    };

    // Return root node of tree.

    var makeTestTree = function() {
      var m = makeTestEntry;
      var root = m();
      m.children$.head = makeTestList(2);
      entryops.sibwalk(m.children$.head,function(e){
        e.children$.head = makeTestList(2)
        //entryops.sibwalk()
      });
      return root;
    };

    M.test('Walking, finding, counting...',function(){
      var str = '';
      var head = makeTestList(4);
      entryops.sibwalk(head,function(entry){
        str += entry.data$.tag + ' ';
      });
      this.assertEquals('1 2 3 4 ',str);
      this.assertEquals(4,entryops.count(head));
      this.assertEquals(head,entryops.head(head.next$));
      this.assertEquals(
        head.next$.next$.next$,
        entryops.tail(head)
      );
      
    });

  });

}));


