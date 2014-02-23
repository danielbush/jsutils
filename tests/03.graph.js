
tests.items.push(with_tests$('03.graph',function(M){

  var G = $dlb_id_au$.utils.graph;

  M.tests("describe graph",function(M){

    var vs = [
      {label:0},
      {label:1},
      {label:2},
      {label:3},
      {label:4}
    ];

    var es = [
      [vs[0],vs[1],false],
      [vs[1],vs[2],false]
    ];

    M.tests("when adding vertices",function(M){

      M.test("we should be able to specify an alternate id fieldname",function(M){
        var v$;
        g = new G.Graph(vs,null,{idlabel:'gid'});
        v$ = g.get_vertex(1);
        it(v$.v.id).should.not_exist();
        it(v$.v.gid).should.be(1);
        it(v$.id).should.be(1);
      });

      M.test("it should add vertices and return extended vertex info",function(M){
        var g,v;
        g = new G.Graph(vs);
        v = g.add_vertex({label:'new1'});
        it(v).should.exist();
        it(typeof v.incoming).should.be('object');
        it(typeof v.outgoing).should.be('object');
        it(typeof v.undirected).should.be('object');
      });

      M.test("it should id the vertex and the extended vertex info",function(){
        var g,v,v$;
        g = new G.Graph();
        v = g.add_vertex({label:'new1'});
        it(v.id).should.be(1);
        v$ = g.get_vertex(1);
        it(v$.id).should.be(1);
        v = g.add_vertex({label:'new2'});
        it(v.id).should.be(2);
      });
    });

    M.tests("when adding edges",function(M){
      M.test("it should return edge info",function(){
        var g,v,e;
        g = new G.Graph(vs);
        e = g.add_edge(vs[0],vs[1],false,{foo:123});
        it(e).should.exist();
        it(e.directed).should.be(false);
        it(e.data.foo).should.be(123);
      });

      M.test("I can store info about the edge",function(){
        var g,v,e;
        g = new G.Graph(vs);
        e = g.add_edge(vs[0],vs[1],false,{foo:123});
        it(e.data.foo).should.be(123);
      });

      M.test("it should add incoming/outgoing indices to extended vertex info",function(){
        var g,v1$,v2$,e;

        g = new G.Graph(vs);
        e = g.add_edge(vs[0],vs[1],true,{foo:123});
        v1$ = g.get_vertex(vs[0].id);
        v2$ = g.get_vertex(vs[1].id);
        it(v1$.outgoing[v2$.id]).should.be(v2$);
        it(v2$.incoming[v1$.id]).should.be(v1$);
        it(v1$.undirected[v2$.id]).should.not_exist();
        it(v2$.undirected[v1$.id]).should.not_exist();
        
        // Undirected version:
        g = new G.Graph(vs);
        e = g.add_edge(vs[0],vs[1],false,{foo:123});
        v1$ = g.get_vertex(vs[0].id);
        v2$ = g.get_vertex(vs[1].id);
        it(v1$.undirected[v2$.id]).should.be(v2$);
        it(v2$.undirected[v1$.id]).should.be(v1$);
        it(v1$.outgoing[v2$.id]).should.not_exist();
        it(v2$.incoming[v1$.id]).should.not_exist();
      });
    });

    M.tests("in general",function(M){
      M.test("I can tell if 2 vertices are connected",function(){
        // Just showing how to use the extended vertex info ...
        var g,e,v0$;
        g = new G.Graph(vs);
        e = g.add_edge(vs[0],vs[1],false,{foo:123});
        v0$ = g.get_vertex(vs[0].id); // get extended info
        it(v0$.undirected[vs[1].id]).should.be(g.get_vertex(vs[1].id));
      });
    });

  });

}));
