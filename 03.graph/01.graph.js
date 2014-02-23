/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2014 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

$dlb_id_au$.utils.graph = function() {

  var module = {};

  // Graph object.
  //
  // Main features:
  // - a vertex can be any object you want to put in the graph
  // - id's the vertex when it is added to the graph ('add_vertex')
  // - generates extended vertex info associated with the vertex
  //   with the same id
  // - allows you to specify the id property name used for the vertex
  //   (by default it is 'id') (extended vertex info always uses
  //   'id').
  // - for any 2 vertices v1,v2 we can have
  //   - any number of undirected edges
  //   - any number of directed edges
  //   - data (eg weights) can be stored against the edges
  // - you don't create edges explicitly; they are created
  //   when you call add_edge.
  // - the 2 main datastructures are this.v$ and this.e$; these
  //   are hashed by id.
  // - index_edge and unindex_edge are the 2 main functions that
  //   try to provide just enough indexing to make navigating
  //   and exploring the graph useful and efficient.  They
  //   could be overridden or augmented perhaps.

  module.Graph = function(vs,es,options) {
    var i,e;
    var idlabel = 'id';
    if(options) {
      if(options.idlabel) {
        idlabel = options.idlabel;
      }
    }

    this.idlabel = idlabel;
    this.idx = 0;

    // Extended vertex info store here.
    // Indexed by id.
    this.v$ = {};

    // Edges are stored here:
    // Indexed by id.
    this.e$ = {};

    // Store indexes for this graph.
    this.indexes = {};

    if(vs) {
      for(i=0;i<vs.length;i++) {
        this.add_vertex(vs[i]);
      }
    }
    if(es) {
      for(i=0;i<es.length;i++) {
        e = es[i];
        if(!e instanceof Array) {
          throw new Error("Members of 'es' must be arrays.");
        }
        if(e.length<2 || e.length>4) {
          throw new Error("Members of 'es' have 2-4 arguments: v1,v2,directed,data.");
        }
        this.add_edge.apply(this,e);
      }
    }
  };

  module.Graph.prototype = {

    // Return all vertices.

    vertices:function() {
      return this.v$;
    },

    // Add vertex v (an object) to this graph.
    //
    // The vertex will not be connected to anything.

    add_vertex:function(v) {
      var id = this.idlabel;
      var idx = ++this.idx;
      var v$ = {id:idx,v:v,undirected:{},incoming:{},outgoing:{}};
      v[id] = idx; // Put id in actual vertex.
      this.v$[v[id]] = v$;
      return v$;
    },

    // Get extended vertex info for vertex v using the id assigned to
    // this vertex (set by add_vertex).

    get_vertex:function(vid) {
      return this.v$[vid];
    },

    remove_vertex:function(vid) {
      var v;
      v = this.get_vertex(vid);
      if(!v) return;
      delete(this.v$[vid]);
      // TODO: get rid of edges?
    },

    // ------------------------------------------------------------

    // Return all edges.

    edges:function() {
      return this.e$;
    },

    // Add an edge.
    //
    // add_edge(v1,v2) => create undirected edge
    // add_edge(v1,v2,false) => create undirected edge
    // add_edge(v1,v2,true) => create directed edge
    // add_edge(v1,v2,true,{weight:2}) => create directed edge with
    // weight

    add_edge:function(v1,v2,directed,data) {
      var e = {v1:v1,v2:v2,directed:directed,data:data};
      var id = this.idlabel;
      e[id] = ++this.idx;
      this.e$[e[id]] = e;
      this.index_edge(e);
      return e;
    },

    get_edge:function(eid) {
      return this.e$[eid];
    },

    remove_edge:function(eid) {
      var e;
      e = this.get_edge(eid);
      if(!e) return;
      delete(this.e$[eid]);
      this.unindex_edge(e);
    },

    // ------------------------------------------------------------
    // Indexing...

    // Add relationship to indexes.

    index_edge:function(e) {
      var id = this.idlabel;
      var v1$ = this.v$[e.v1[id]];
      var v2$ = this.v$[e.v2[id]];
      if(e.directed) {
        v1$.outgoing[v2$[id]] = v1$.outgoing[v2$[id]] || [];
        v2$.incoming[v1$[id]] = v2$.incoming[v1$[id]] || [];

        v1$.outgoing[v2$[id]].push(e);
        v2$.incoming[v1$[id]].push(e);
      } else {
        v1$.undirected[v2$[id]] = v1$.undirected[v2$[id]] || [];
        v2$.undirected[v1$[id]] = v2$.undirected[v1$[id]] || [];

        v1$.undirected[v2$[id]].push(e);
        v2$.undirected[v1$[id]].push(e);
      }
    },

    // Removes edge from index.
    //
    // Should more or less undo 'index_edge'.

    unindex_edge:function(e) {
    }

  };

  return module;

}();
