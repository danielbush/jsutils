

tests.items.push(with_tests$('list-tree 2',function(s){

  var gen_utils = $dlb_id_au$.utils.gen_utils;

  var data      = $dlb_id_au$.utils.listtree2.data;
  var list      = $dlb_id_au$.utils.listtree2.list();
  var tree      = $dlb_id_au$.utils.listtree2.tree();
  var edit      = $dlb_id_au$.utils.listtree2.edit();

  var make      = function(prev,next,par,first) {
    var e = data.makeEntry();
    e.previousSibling = prev;
    e.nextSibling = next;
    e.parentNode = par;
    e.firstChild = first;
    return e;
  };

  s.tests("data",function(s) {
    s.tests("makeTree",function(s){

      var a,b,c,d,e,f,g,h;
      s.setup(function() {
        a={id:1},b={id:2},c={id:3},d={id:4};
        e={id:5},f={id:6},g={id:7},h={id:8};
      });
      var join = function(a,b) {
        a.next = b;
        b.previous = a;
      };
      var append = function(child,ancestor) {
        child.parentNode = ancestor;
        if(!ancestor.firstChild) {
          ancestor.firstChild = child;
        }
      };

      s.test("it should handle single entries",function(){
        var root = data.makeTree([{id:1}]);
        it(root.id).should.be(1);
      });
      s.test("it should make a simple depth-2 tree from one array",function(){
        var root = data.makeTree([a,b,c,d],join,append);
        it(root.id).should.be(1);
        it(root.firstChild.id).should.be(2);
        it(root.firstChild.next.id).should.be(3);
        it(root.firstChild.next.next.id).should.be(4);
        it(d.previous.id).should.be(3);
        it(b.parentNode.id).should.be(1);
        it(d.parentNode.id).should.be(1);
      });
      s.test("it should make arbitrary depth trees",function(){
        var D = [a,[b],[c,[e,f,[g,h]]],d]
        var root = data.makeTree(D,join,append);
        it(a.firstChild.id).should.be(2);
        it(b.firstChild).should.not_exist();
        it(b.next.id).should.be(3);
        it(c.firstChild.id).should.be(5);
        it(e.firstChild.id).should.be(6);
        it(f.next.id).should.be(7);
        it(g.firstChild.id).should.be(8);
      });

      s.test("it should fail if not passed an array",function(){
        var e = error_for(function(){data.makeTree({})});
        it(e).should.exist();
        it(e.message).should.match(/non-array/i);
      });
      s.test("it should fail if first item of any array is array",function(){
        var e = error_for(function(){data.makeTree([[a],b])});
        it(e).should.exist();
        it(e.message).should.match(/Can't use/i);

        e = error_for(function(){data.makeTree([a,[[b]] ]);});
        it(e).should.exist();
        it(e.message).should.match(/Can't use/i);
      });
    });
  });
  s.tests("list ops",function(s) {

    s.tests('join',function(s){

      s.test("it should join 2 items",function(){
        var a={id:1},b={id:2};
        list.join(a,b);
        it(a.nextSibling).should.be(b);
        it(b.previousSibling).should.be(a);
      });

      s.test("it can be used with interleave to join an array",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        gen_utils.interleave([a,b,c,d],function(x,y){
          list.join(x,y);
        });
        it(a.nextSibling).should.be(b);
        it(b.previousSibling).should.be(a);
        it(a.previousSibling).should.not_exist();
        it(d.nextSibling).should.not_exist();
      });

      s.test("it should join items in an array",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        list.join([a,b,c,d]);
        it(a.nextSibling.nextSibling.nextSibling).should.be(d);
        it(d.previousSibling.previousSibling.previousSibling).should.be(a);
      });

      s.test("it should return the head of the list",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(head).should.be(a);
      });

    });

    s.tests('joinBefore / joinAfter',function(s){
      s.test("it should join node into the list of the second operand",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        var n = {id:5};
        list.joinBefore(n,b);
        it(a.nextSibling).should.be(n);
        it(b.previousSibling).should.be(n);
        it(n.previousSibling).should.be(a);
        it(n.nextSibling).should.be(b);

        a={id:1},b={id:2},c={id:3},d={id:4};
        head = list.join([a,b,c,d]);
        n = {id:5};
        list.joinAfter(n,b);
        it(b.nextSibling).should.be(n);
        it(c.previousSibling).should.be(n);
        it(n.previousSibling).should.be(b);
        it(n.nextSibling).should.be(c);
      });
    });

    s.tests('unjoin',function(s){
      s.test("it should unjoin item in the middle of a list",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(a.nextSibling).should.be(b);
        list.unjoin(b);
        it(a.nextSibling).should.be(c);
        it(c.previousSibling).should.be(a);
      });
      s.test("it should handle the head and null terminate",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        list.unjoin(a);
        it(b.previousSibling).should.be(null);
      });
      s.test("it should handle the tail and null terminate",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        list.unjoin(d);
        it(c.nextSibling).should.be(null);
      });
      s.test("by default, it should leave the node's references intact",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        list.unjoin(b);
        it(b.previousSibling).should.be(a);
        it(b.nextSibling).should.be(c);
      });
    });

    s.tests('first / last',function(s) {

      s.tests('without test fn',function(s){

        s.test("first should find the very first item in linked list",function(){
          var head,r,m;
          var o = [{id:1},{id:2},{id:3}];
          head = list.join(o);
          it(list.first(o[2])).should.be(o[0]);
        });

        s.test("last should find the very last item in linked list",function(){
          var head,r,m;
          var o = [{id:1},{id:2},{id:3}];
          head = list.join(o);
          it(list.last(o[0])).should.be(o[2]);
        });

      });


    });

    s.tests('walk / walkback',function(s) {

      s.test("it should pass the current item in and return the result of the test",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        r = list.walk(a,function(e){if(e.id==3) return e;});
        it(r.id).should.be(3);
        r = list.walkback(d,function(e){if(e.id==2) return e;});
        it(r).should.be(b);
      });

      s.test("returns null/false if nothing passes the test",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        r = list.walk(a,function(e){return;});
        it(r).should.be(null);
        r = list.walk(d,function(e){return;});
        it(r).should.be(null);
      });

    });

    s.tests('nth',function(s) {

      s.test("without fn, it should find the nth thing and return it",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(list.nth(head,0)).should.be(head);
        it(list.nth(head,1)).should.be(b);
        it(list.nth(head,2)).should.be(c);
        it(list.nth(d,0)).should.be(d);
        it(list.nth(d,-1)).should.be(c);
        it(list.nth(d,-2)).should.be(b);
      });

      s.test("with fn, it should find the nth thing that passes the test and return it",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4},e={id:5},f={id:6};
        var head = list.join([a,b,c,d,e,f]);
        var fn;
        fn = function(e){if((e.id%2)==0) return e.id;};
        it(list.nth(a,0,fn)).should.be(null);
        it(list.nth(b,0,fn)).should.be(2);
        it(list.nth(a,1,fn)).should.be(2);
        it(list.nth(a,2,fn)).should.be(4);

        // Going backwards:
        it(list.nth(f,0,fn)).should.be(6);
        it(list.nth(e,0,fn)).should.be(null);
        it(list.nth(f,-1,fn)).should.be(4);
        it(list.nth(f,-2,fn)).should.be(2);
      });

    });

    s.tests('next / previous',function(s) {

      s.test("without fn, it should find the 1st thing after current token",function(){
        var a={id:1},b={id:2},c={id:3},d={id:4},e={id:5},f={id:6};
        var head = list.join([a,b,c,d,e,f]);
        var fn;
        fn = function(e){if((e.id%2)==0) return e.id;};
        it(list.next(a)).should.be(b);
        it(list.previous(f)).should.be(e);
      });

      s.tests("with fn",function(s) {

        s.test("it should find the 1st tested thing after current token",function(){
          var a={id:1},b={id:2},c={id:3},d={id:4},e={id:5},f={id:6};
          var head = list.join([a,b,c,d,e,f]);
          var fn = function(e) {if(e.id==3) return e;};
          it(list.next(a,fn)).should.be(c);
          it(list.previous(f,fn)).should.be(c);
        });

        s.test("it should return null if it exhausts",function(){
          var a={id:1},b={id:2},c={id:3},d={id:4},e={id:5},f={id:6};
          var head = list.join([a,b,c,d,e,f]);
          var fn = function(e){};
          it(list.next(a,fn)).should.be(null);
          it(list.previous(f,fn)).should.be(null);
        });

      });

    });

    s.tests('veryfirst / verylast',function(s) {
      s.tests('with test fn',function(s){

        s.test("first will find the very first item that passes test",function(){
          var a={id:1},b={id:2},c={id:3},d={id:4};
          var head = list.join([a,b,c,d]);
          var fn = function(e){if(e.id==2) return e;};
          it(list.veryfirst(d,fn)).should.be(b);
        });

        s.test("last will find the very last item that passes test",function(){
          var a={id:1},b={id:2},c={id:3},d={id:4};
          var head = list.join([a,b,c,d]);
          var fn = function(e){if(e.id==3) return e;};
          it(list.verylast(a,fn)).should.be(c);
        });

        s.test("should test inclusively and exhaustively",function(){
          var a={id:1},b={id:2},c={id:3},d={id:4};
          var head = list.join([a,b,c,d]);
          var fn = function(e){if(e.id==3) return e;};
          var ARR=[];

          list.veryfirst(d,function(e){ARR.push(e.id);});
          it(ARR).should.be([4,3,2,1]);
          ARR = [];
          list.verylast(a,function(e){ARR.push(e.id);});
          it(ARR).should.be([1,2,3,4]);
        });

      });
    });

    s.tests('cycle',function(s) {
      s.test("when at the end moving +1 it should cycle to the beginning",function(s){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(list.cycle(d,1)).should.be(a);
      });
      s.test("when at the beginning moving -1 it should cycle to the end",function(s){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(list.cycle(a,-1)).should.be(d);
      });
      s.test("by default should cycle +1",function(s){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(list.cycle(a)).should.be(b);
        it(list.cycle(b)).should.be(c);
      });
      s.test("cycle 0 should return the same thing",function(s){
        var a={id:1},b={id:2},c={id:3},d={id:4};
        var head = list.join([a,b,c,d]);
        it(list.cycle(a,0)).should.be(a);
      });
    });

  });

  s.tests("tree ops",function(s) {

    var a,b,c,d,e,f,g,h;

    s.setup(function(){
      edit.set_attach_hook();
      a={id:1},b={id:2},c={id:3},d={id:4},
      e={id:5},f={id:6},g={id:7},h={id:8};
    });

    var makeTree = function(arr) {
      return data.makeTree(
        arr,
        list.join,
        function(child,anc){
          if(!anc.firstChild) {
            anc.firstChild = child;
          }
          child.parentNode = anc;
        }
      );
    };

    var tree0 = function(){
      return data.makeTree(
        [a],
        list.join,
        function(child,anc){
          if(!anc.firstChild) {
            anc.firstChild = child;
          }
          child.parentNode = anc;
        }
      );
    };

    var tree1 = function(){
      return data.makeTree(
        [a, [b,e], [c,f], d ],
        list.join,
        function(child,anc){
          if(!anc.firstChild) {
            anc.firstChild = child;
          }
          child.parentNode = anc;
        }
      );
    };

    var tree2 = function(){
      return data.makeTree(
        [a,b,c,d,e,f],
        list.join,
        function(child,anc){
          if(!anc.firstChild) {
            anc.firstChild = child;
          }
          child.parentNode = anc;
        }
      );
    };

    s.tests('walkParents',function(s) {
      s.tests("with fn",function(s){
        s.test("it should exhaustively walk ancestors",function(){
          var T = tree1();
          var arr = [];
          tree.walkParents(f,function(e){arr.push(e.id);})
          it(arr).should.be([3,1]);
        });
        s.test("it can be used to return the root ancestor",function(){
          var T = tree1();
          var r = tree.walkParents(f,function(entry){if(!entry.parentNode) return entry;})
          it(r).should.be(a);
        });
      });
    });


    s.tests('first / last',function(s) {
      s.tests("first",function(s){
        s.test("it should find the root of the tree the entry is in",function(){
          var T = tree1();
          it(tree.first(e)).should.be(a);
          it(tree.first(d)).should.be(a);
        });
      });
      s.tests("last",function(s){
        s.test("it should find last node to be previsited",function(){
          var T = tree1();
          it(tree.last(a)).should.be(d);
          it(tree.last(b)).should.be(d);
          it(tree.last(c)).should.be(d);
          it(tree.last(d)).should.be(d);
          it(tree.last(e)).should.be(d);
          it(tree.last(f)).should.be(d);
        });
      });
    });

    s.tests('walk / walkReverse',function(s) {
      s.tests('walk',function(s){

        s.test("it should halt if we return truhty",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(n){
            pre.push(n.id);
            if(n == e) return true;
          };
          var postvisit = function(n){
            post.push(n.id);
            if(n == e) return true;
          };
          tree.walk(a,previsit);
          it(pre).should.be([1,2,5]);

          tree.walk(a,null,postvisit);
          it(post).should.be([5]);
        });

        s.test("it should previsit and postvisit",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(entry){pre.push(entry.id);};
          var postvisit = function(entry){post.push(entry.id);};
          tree.walk(a,previsit,postvisit);
          it(pre).should.be([1,2,5,3,6,4]);
          it(post).should.be([5,2,6,3,4,1]);
        });
        s.test("it only recurses down",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(entry){pre.push(entry.id);};
          var postvisit = function(entry){post.push(entry.id);};
          tree.walk(b,previsit,postvisit);
          it(pre).should.be([2,5]);
          it(post).should.be([5,2]);
        });
      });
      s.tests('walkReverse',function(s){

        s.test("it should halt if we return truhty",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(n){
            pre.push(n.id);
            if(n == e) return true;
          };
          var postvisit = function(n){
            post.push(n.id);
            if(n == e) return true;
          };
          tree.walkReverse(a,null,postvisit);
          it(post).should.be([1,4,3,6,2,5]);

          tree.walkReverse(a,previsit,null);
          it(pre).should.be([4,6,3,5]);
        });

        s.test("postvisit is called before previsit",function(){
          // "post" and "pre" positions remain the same regardless
          // of direction.
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(entry){pre.push(entry.id);};
          var postvisit = function(entry){post.push(entry.id);};
          tree.walkReverse(a,postvisit,previsit);
          it(pre).should.be([1,4,3,6,2,5]);
          it(post).should.be([4,6,3,5,2,1]);
        });
        s.test("it only recurses down",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(entry){pre.push(entry.id);};
          var postvisit = function(entry){post.push(entry.id);};
          tree.walkReverse(d,postvisit,previsit);
          it(pre).should.be([4]);
          it(post).should.be([4]);
          pre = [], post = [];
          tree.walkReverse(b,postvisit,previsit);
          it(pre).should.be([2,5]);
          it(post).should.be([5,2]);
        });
      });
    });

    s.tests('walkBefore / walkAfter',function(s) {

      s.tests("walkAfter",function(s){

        s.test("it should halt if we return truhty",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(n){
            pre.push(n.id);
            if(n == f) return true;
          };
          var postvisit = function(n){
            post.push(n.id);
            if(n == f) return true;
          };
          tree.walkAfter(b,previsit);
          it(pre).should.be([3,6]);

          tree.walkAfter(b,null,postvisit);
          it(post).should.be([6]);
        });

        s.test("it should not visit the start entry",function(){
          var T = tree1();
          var found = false;
          var fn = function(entry){if(entry==b) found = true;};
          tree.walkAfter(b,fn,fn);
          it(found).should.be(false);
        });

        s.test("it should previsit and postvisit entries after and above start entry",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(entry){pre.push(entry.id);};
          var postvisit = function(entry){post.push(entry.id);};

          tree.walkAfter(c,previsit,postvisit);
          it(pre).should.be([4]);
          it(post).should.be([4,1]);

          pre = [], post = [];
          tree.walkAfter(b,previsit,postvisit);
          it(pre).should.be([3,6,4]);
          it(post).should.be([6,3,4,1]);
        });

      });

      s.tests("walkBefore",function(s){

        s.test("it should halt if we return truhty",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(n){
            pre.push(n.id);
            if(n == a) return true;
          };
          var postvisit = function(n){
            post.push(n.id);
            if(n == a) return true;
          };
          tree.walkBefore(c,previsit);
          it(pre).should.be([5,2,1]);

          tree.walkBefore(c,null,postvisit);
          it(post).should.be([2,5]);
        });

        s.test("it should not visit the start entry",function(){
          var T = tree1();
          var found = false;
          var fn = function(entry){if(entry==b) found = true;};
          tree.walkBefore(b,fn,fn);
          it(found).should.be(false);
        });

        s.test("it should previsit and postvisit entries before and above start entry in reverse order",function(){
          var T = tree1();
          var pre = [], post = [];
          var previsit = function(entry){pre.push(entry.id);};
          var postvisit = function(entry){post.push(entry.id);};

          tree.walkBefore(c,postvisit,previsit);
          it(pre).should.be([2,5]);
          it(post).should.be([5,2,1]);

          pre = [], post = [];
          tree.walkBefore(b,postvisit,previsit);
          it(pre).should.be([]);
          it(post).should.be([1]);
        });

      });
    });

    s.tests('prenext / preprevious',function(s) {
      s.test("it should fetch next item to previsit",function(){
        var T = tree1();
        it(tree.prenext(e)).should.be(c);
        it(tree.prenext(c)).should.be(f);
        it(tree.prenext(f)).should.be(d);
        it(tree.prenext(d)).should.not_exist();

        it(tree.preprevious(d)).should.be(f);
        it(tree.preprevious(f)).should.be(c);
        it(tree.preprevious(c)).should.be(e);
        it(tree.preprevious(e)).should.be(b);
        it(tree.preprevious(b)).should.be(a);
      });
    });

    s.tests("edit ops",function(s) {

      s.tests('insertBefore',function(s){
        s.test("inserted item should inherit parent node",function(){
          var T = tree2();
          var n = {id:'n'};
          edit.insertBefore(n,c);
          it(n.parentNode).should.be(a);
        });

        s.test("it should insert entry in between other entries",function(){
          var T = tree2();
          var n = {id:'n'};
          edit.insertBefore(n,c);
          it(b.nextSibling).should.be(n);
          it(c.previousSibling).should.be(n);
        });

        s.test("it should only update firstChild if insertion is first",function(){
          var T = tree2();
          var n = {id:'n'};
          var m = {id:'m'};
          it(a.firstChild).should.be(b);
          edit.insertBefore(n,c);
          it(a.firstChild).should.be(b);
          edit.insertBefore(m,b);
          it(a.firstChild).should.be(m);
        });

      });

      s.tests('insertAfter',function(s){

        s.test("inserted item should inherit parent node",function(){
          var T = tree2();
          var n = {id:'n'};
          edit.insertAfter(n,c);
          it(n.parentNode).should.be(a);
        });

        s.test("it should insert entry in between other entries",function(){
          var T = tree2();
          var n = {id:'n'};
          edit.insertAfter(n,c);
          it(c.nextSibling).should.be(n);
          it(d.previousSibling).should.be(n);
        });

        s.test("it should never set firstChild",function(){
          var T = tree2();
          var n = {id:'n'};
          it(a.firstChild).should.be(b);
          edit.insertAfter(n,b);
          it(a.firstChild).should.be(b);
        });

        s.test("it should append if inserting after last child",function(){
          var T = tree2();
          var n = {id:'n'};
          it(f.nextSibling).should.not_exist();
          edit.insertAfter(n,f);
          it(f.nextSibling).should.be(n);
        });

      });

      s.tests('appendChild',function(s){
        s.test("it should append when no siblings available and firstchild should be set",function() {
          var T = tree0();
          var n = {id:'n'};
          edit.appendChild(n,a);
          it(n.parentNode).should.be(a);
          it(a.firstChild).should.be(n);
        });
        s.test("it should always append the last item",function(){
          var T = tree2();
          var n = {id:'n'};
          edit.appendChild(n,a);
          it(f.nextSibling).should.be(n);
          it(n.nextSibling).should.not_exist();
        });
      });

      s.tests("various conditions",function(s){

        s.test('it should handle circular (corrupted) references',function(s){
          var T = tree2();
          // Corrupt it.
          a.parentNode = b;
          var e = error_for(function(){
            edit.appendChild(c,b);
          });
          it(e).should.exist();
          it(e).should.match(/circular/i);
        });

        s.tests("it should refuse to append a node to itself",function(s){
          s.test('appendChild',function(){
            var T = tree1();
            var e = error_for(function(){edit.appendChild(a,a);});
            it(e).should.exist();
          });
        });
        s.tests("it should refuse to append a node to a descendent of that node",function(s){
          s.test("insertAfter",function(){
            var T = tree1();
            var e = error_for(function(){edit.insertAfter(a,b);});
            it(e).should.exist();
          });
          s.test("insertBefore",function(){
            var T = tree1();
            var e = error_for(function(){edit.insertBefore(a,c);});
            it(e).should.exist();
          });
          s.test("appendChild",function(){
            var T = tree1();
            var e = error_for(function(){
              edit.appendChild(a,b);
            });
            it(e).should.exist();
          });
        });

        s.tests('inserting already inserted element',function(s){
          s.test("it should remove entry first (entry should appear only once in the tree)",function(){
            var T1 = makeTree([a,b,c,d]);
            var T2 = makeTree([e,f,g,h]);
            edit.insertBefore(c,g);
            // The thing we're inserting into should update as
            // expected...
            it(f.nextSibling).should.be(c);
            it(g.previousSibling).should.be(c);
            // But what about T1?
            it(b.nextSibling).should.be(d);
            it(d.previousSibling).should.be(b);
          });
        });

        s.tests('if there is no parent...',function(s){
          s.test("we can still appendChild",function(){
            var l = list.join([a,b,c]);
            edit.appendChild(a,b);
            it(b.firstChild).should.be(a);
          });
          s.test("we can still insertBefore",function(){
            var l = list.join([a,b,c]);
            edit.insertBefore(b,a);
            it(b.nextSibling).should.be(a);
          });
          s.test("we can still insertAfter",function(){
            var l = list.join([a,b,c]);
            edit.insertAfter(a,b);
            it(b.nextSibling).should.be(a);
          });
          s.test("we can still removeChild",function(){
            var l = list.join([a,b,c]);
            edit.removeChild(b);
            it(a.nextSibling).should.be(c);
          });
        });

      });

      s.tests('removeChild',function(s){

        // This is fairly important.  When we unlink node N, we can
        // keep N's next/previous references.  But we are a little
        // stricter with parentNode.
        s.test("it should detach child",function(){
          var T = tree2();
          edit.removeChild(b);
          it(b.parentNode).should.not_exist();
        });

        s.test("it should unlink child from siblings (but keep references)",function(){
          var T = tree2();
          edit.removeChild(c);
          it(b.nextSibling).should.be(d);
          it(d.previousSibling).should.be(b);
        });

        s.test("it should update firstChild if this is removed",function(){
          var T = tree2();
          it(a.firstChild).should.be(b);
          edit.removeChild(b);
          it(a.firstChild).should.be(c);
        });

        s.test("it should be ok to remove already removed children",function(){
          var T = tree2();
          edit.removeChild(c);
          var e = error_for(function(){
            edit.removeChild(c);
          });
          it(e).should.not_exist();
        });

        s.test("it should unset parentNode",function(){
          var T = tree1();
          it(c.parentNode).should.be(a);
          edit.removeChild(c);
          it(c.parentNode).should.not_exist(a);
        });

      });

      s.tests("building trees...",function(s){
        s.test("from scratch",function(){
          var n={n:1},m={m:1},o={o:1},p={p:1};
          edit.appendChild(n,m);
          edit.insertAfter(o,n);
          it(m.firstChild.n).should.exist();
          it(n.nextSibling.o).should.exist();
          edit.insertBefore(p,n);
          it(m.firstChild.p).should.exist();
          it(p.nextSibling.n).should.exist();
        });
      });

      s.tests("overriding attach_hook",function(s) {

        s.test("it can completely override attach_hook",function(){
          var n={n:1},m={m:1},o={o:1};
          edit.set_attach_hook(function(ec,e,ATTACHTYPE){
            // Nothing.
          });
          edit.appendChild(n,m);
          it(m.firstChild).should.not_exist();
          edit.insertBefore(n,m);
          it(n.nextSibling).should.not_exist();
        });

        s.test("it can extend default_attach_hook",function(){
          var n={n:1},m={m:1},o={o:1};
          edit.set_attach_hook(function(ec,e,ATTACHTYPE){
            edit.default_attach_hook(ec,e,ATTACHTYPE);
            ec.foo = 1;
          });
          edit.appendChild(n,m);
          it(m.firstChild.n).should.exist();
          it(n.foo).should.be(1);
        });

        s.tests("DOM",function(s){
          var node = function(tagName){return document.createElement(tagName);};
          var text = function(text){return document.createTextNode(text);};
          s.test("it can appendChild",function(){
            var root,n,m,e;
            edit.set_attach_hook(edit.dom_attach_hook);
            root = node('DIV');
            edit.appendChild(n=node('DIV'),root);
            it(root.firstChild).should.be(n);
            e = error_for(function(){
              // We use DOM insertBefore...
              root.insertBefore(m=node('DIV'),n);
            });
            it(e).should.not_exist();
            it(m.nextSibling).should.be(n);
          });
          s.test("it can insertBefore",function(){
            var root,n,m,e;
            edit.set_attach_hook(edit.dom_attach_hook);
            root = node('DIV');
            edit.appendChild(n=node('DIV'),root);
            edit.insertBefore(m=node('DIV'),n);
            // Note how we use DOM childNodes....
            it(root.childNodes[0]).should.be(m);
          });
          s.test("it can insertAfter",function(){
            var root,n,m,e;
            edit.set_attach_hook(edit.dom_attach_hook);
            root = node('DIV');
            edit.appendChild(n=node('DIV'),root);
            edit.insertAfter(m=node('DIV'),n);
            // Note how we use DOM childNodes....
            it(root.childNodes[0].nextSibling).should.be(m);
          });
          s.test("it can removeChild",function(){
            var root,n,m,e;
            edit.set_attach_hook(edit.dom_attach_hook);
            root = node('DIV');
            edit.appendChild(n=node('DIV'),root);
            edit.removeChild(n);
            it(root.childNodes.length).should.be(0);
          });
        });

      });

    });

  });

  s.tests("parametrising relationship labels",function(s) {
    var a,b,c,d,e,f,g,h;
    s.setup(function() {
      a={id:1},b={id:2},c={id:3},d={id:4};
      e={id:5},f={id:6},g={id:7},h={id:8};
    });

    var o = {
      labels:{
        previous:'prev',
        next:'nxt',
        firstChild:'first',
        parentNode:'father'
      }
    };
    var mylist = $dlb_id_au$.utils.listtree2.list(o);
    var mytree = $dlb_id_au$.utils.listtree2.tree(o);
    var myedit = $dlb_id_au$.utils.listtree2.edit(o);
    // A function to quickly bake a tree using the same labels used in
    // 'o'.
    var mktree = function(arr) {
      return data.makeTree(arr,mylist.join,function(child,anc){
        if(!anc.first) {
          anc.first = child;
        }
        child.father = anc;
      });
    };

    s.tests("changing the labels for lists",function(s) {
      s.test("labels",function(){
        mylist.join([a,b,c]);
        it(a.nxt).should.be(b);
        it(b.prev).should.be(a);
      });
      s.test("editing",function(){
        mylist.join([a,b,c]);
        mylist.unjoin(b);
        it(a.nxt).should.be(c);
        it(c.prev).should.be(a);
      });
    });

    s.tests("changing the labels for trees",function(s) {
      s.test("data.makeTree",function(){
        var T = mktree([a,[b,c],d]);
        it(a.first).should.be(b);
        it(b.nxt).should.be(d);
        it(d.prev).should.be(b);
        it(b.father).should.be(a);
      });
      s.test("walking",function(){
        var T = mktree([a,[b,c],d]);
        var arr = [];
        mytree.walk(T,function(n){arr.push(n.id)});
        it(arr).should.be([1,2,3,4]);
        arr = [];
        mytree.walk(T,null,function(n){arr.push(n.id)});
        it(arr).should.be([3,2,4,1]);
      });
      s.tests("editing",function(s){
        s.test("appendChild",function(){
          var T = mktree([a]);
          myedit.appendChild(b,a);
          it(b.father).should.be(a);
        });
      });
    });
  });


}));
