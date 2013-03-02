// See dev-globals.js .

tests.items.push(with_tests$('lists and trees',function(M){

  var List = utils.list3.List;
  var tree = utils.tree;

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

  M.tests('tree tests',function(M){

    var tree0 = function(){return tree.makeEntry();};
    var tree1 = function(){var t = tree0(); t.list.append(); return t;};
    var tree2 = function(){var t = tree1(); t.list.append(); return t;};

    M.test('making and appending/inserting...',function(){
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

}));


