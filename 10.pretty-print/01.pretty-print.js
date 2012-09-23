/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based utils library.
Copyright (C) 2012 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


// Pretty print module for javascript.
//
// Probably a tidier way to write module.pp
// would have been to write a generic recursive
// function that walks through arrays and objects.
// Then pass a function/closure in.

$dlb_id_au$.utils.pretty_print = function() {

  var module = {};

  // Configuration settings for 'p' (the pretty printer).
  //
  // See module.p below.

  module.CONFIG = {

    // Number of levels to recurse before stopping.

    max_levels:10,

    // If on=true, print js structures with linebreaks
    // and indentation in an agreeable way.

    extended:{
      on:false,
      // Newline to use if extended.  
      newline:'\r\n',
      // Indentation character/s to use.
      // If we nest n times, indentation will be n*indent.
      indent:'  '
    },

    // If set to integer, shorten long values.
    //
    // Set to false or null otherwise.

    length:false

  };

  // Events fired by eachr.

  module.EVENTS = {

    // Called at beginning of array.
    arrayStart:0,
    // Called at end of array.
    arrayEnd:1,

    // Called before processing each item in array.
    arrayItemStart:2,
    arrayItemStartFirst:4,
    // Called after processing each item in array.
    arrayItemEnd:3,

    // Similar to array (above).
    objectStart:10,
    objectEnd:11,
    objectItemStart:12,
    objectItemStartFirst:14,
    objectItemEnd:13,

    // Items encountered in array of js object.
    item:20,

    // Called for the first array or object item.
    firstItem:21
  };


  // Recurse through a javascript entity and fire events (callback
  // function called with an event parameter) as we go.
  //
  // By "entity" we mean pretty much anything in js.
  // 
  // Eachr looks for normal js objects and arrays and recurses
  // through these, firing appropriate events.
  // Events that are fired are like:
  // "we're starting an array",
  // "we're ending an array"
  // etc
  //
  // Params:
  // @fn    The callback
  // @level Set on recursion, values are >=1 where
  //        1 is first level of recursion, etc.
  // @max   Max level after which we stop recursing.
  // 
  // Notes
  // We have to set a limit on recursion otherwise
  // we could get in infinite loops involving things
  // that reference eachother.

  module.eachr = function(thing,fn,max,level) {
    if(!level) level = 0; // We should be top level.
    //if(!max) max = module.CONFIG.max_levels;
    if(!max) throw new Error('eachr: max nesting level must be set.');
    if(level > max) {
      return;
    }
    switch(typeof(thing)) {
    case 'object':
      if(thing instanceof Array) {
        fn(module.EVENTS.arrayStart,null,thing,level);
        for(var i=0;i<thing.length;i++) {
          if(i==0) {
            fn(module.EVENTS.arrayItemStartFirst,
               i,thing[i],level);
          }
          fn(module.EVENTS.arrayItemStart,
             i,thing[i],level);
          module.eachr(thing[i],fn,max,level+1);
          fn(module.EVENTS.arrayItemEnd,i,thing[i],level);
        }
        fn(module.EVENTS.arrayEnd,null,thing,level);
      }
      // There are "objects" that aren't instanceof Object
      // such as strings, functions, rhino java objects etc.
      //
      // Skip DOM elements.
      // TODO: Is there a better way to decide what to recurse on?

      else if(thing instanceof Object && !thing.nodeType) {
        var first=true,n,empty=true;
        // Check if object is empty.
        for(n in thing) {
          if(thing.hasOwnProperty(n)) {
            empty = false;
            break;
          }
        }
        if(empty) {
          fn(module.EVENTS.objectStart,null,thing,level,{empty:true});
        } else {
          fn(module.EVENTS.objectStart,null,thing,level);
        }
        for(n in thing) {
          if(thing.hasOwnProperty(n)) {
            if(first) {
              fn(module.EVENTS.objectItemStartFirst,
                 n,thing[n],level);
              first = false;
            }
            fn(module.EVENTS.objectItemStart,
               n,thing[n],level);
            module.eachr(thing[n],fn,max,level+1);
            fn(module.EVENTS.objectItemEnd,n,thing[n],level);
          }
        }
        if(empty) {
          fn(module.EVENTS.objectEnd,null,thing,level,{empty:true});
        } else {
          fn(module.EVENTS.objectEnd,null,thing,level);
        }
      }
      else {
        // Rhino java objects might end up here?
        fn(module.EVENTS.item,null,thing,level);
      }
      break;
    default:
      fn(module.EVENTS.item,null,thing,level);
      break;
    };
  };

  (function() {

    var to_string = function(thing) {
      if(thing.toString) {
        return thing.toString();
      } else {
        return thing+'';
      }
    };

    var print_string = function(thing) {
      return '"'+thing+'"';
    };

    // Generate a string representing a js thing.
    //
    // No attempt is made to remove or even add newlines
    // or add or squeeze spacing.
    //
    // NOTE: don't camelcase! toString is an inbuilt
    // method!!!

    module.to_string = function(thing) {
      var s;

      if(thing == undefined) {
        return 'undefined';
      }
      if(thing == null) {
        return 'null';
      }
      if(thing === false) {
        return 'false';
      }
      if(thing === true) {
        return 'true';
      }

      switch(typeof(thing)) {
      case 'object':
        if(thing instanceof Array) {
          return thing.toString();
        }
        else if(thing instanceof Object) {
          return thing.toString();
        }
        else if(thing instanceof String) {
          return print_string(thing);
        }
        // Rhino
        else if(java && java.lang) {
          if(thing['class']===java.lang.Class)
            return to_string(thing);
          else
            return to_string(thing['class']);
        }
        else {
          to_string(thing);
        }
        break;

      case 'xml': // E4X
        return thing.toXMLString();
        break;
      case 'function':
        return thing.toString();
        break;
      case 'string':
        return print_string(thing);
        break;
      default:
        return to_string(thing);
        break;
      };
    };


  })();

  (function(){

    // Callback for eachr.
    var handler;

    // The config used by 'p'.
    var config;

    // The result string produced by 'p'.
    var str;

    // Pretty print a js entity.
    //
    // You can pass in your own configurations in the same
    // format as module.CONFIG.
    // In this way you can create your own variations:
    // eg
    //   var pp = function(thing) {
    //       return p(thing,{extended:{on:true,...},...});
    //   };

    module.p = function(thing,conf) {
      if(conf) {
        config = conf;
        // If conf is missing bits, put in defaults:
        if(!config.extended)
          config.extended={on:false};
        if(!config.max_levels)
          config.max_levels = 10;
      } else {
        config = module.CONFIG;
      }
      str = ''; // Reset str.
      module.eachr(thing,handler,config.max_levels);
      return str;
    };


    (function(){

      // Flag for indicating first item in array or object.

      var firstItem = false;

      // This function is designed to be called by eachr and
      // builds string 'str'.
      //
      // Params:
      // @thing The js thing associated with an eachr event if
      //        eachr passes it
      // @index Index of array or key of js object
      // @level Level of nesting
      // @hint  Additional information passed by eachr such as if
      //        the object is empty

      handler = function(event,index,thing,level,hint) {

        switch(event) {

          // ARRAYS:
        case module.EVENTS.arrayStart:
          if(level>=config.max_levels) {
            str+='[...';
          } else {
            str+='[';
          }
          break;
        case module.EVENTS.arrayItemStartFirst:
          firstItem = true;
          break;
        case module.EVENTS.arrayItemStart:

          // Don't print the array's insides.
          if(level>=config.max_levels) {
            if(firstItem) firstItem = false;
          }

          else {
            if(firstItem) firstItem = false;
            // Prepend comman to next entry.
            // Don't add linebreak, indent for arrays.
            else str+=',';
          }

          break;
        case module.EVENTS.arrayItemEnd:
          break;
        case module.EVENTS.arrayEnd:
          str+=']';
          break;

          // OBJECTS:
        case module.EVENTS.objectStart:
          if(level>config.max_levels) {
            // Nothing
          } else {
            if(hint && hint.empty) {
              str+='{';
            } else if(level==config.max_levels) {
              // Don't linebreak *at all* if we
              // are at the max level.
              str+='{...';
            } else {
              str+='{'+linebreak()+indent(level);
            }
          }
          break;
        case module.EVENTS.objectItemStartFirst:
          firstItem = true;
          break;
        case module.EVENTS.objectItemStart:
          if(level>=config.max_levels) {
            if(firstItem) firstItem = false;
          }
          else {
            if(firstItem) {
              firstItem = false;
            } else {
              // Add comma after previous item, break
              // and indent.
              str+=','+linebreak()+indent(level);
            }
            // Now print the key (index).
            // The value will get printed on the 'item' event.
            str+=index+':';
          }

          break;
        case module.EVENTS.objectItemEnd:
          break;
        case module.EVENTS.objectEnd:
          if(level>config.max_levels) {
            // Nothing
          }
          else if(level==config.max_levels) {
            str+='}';
          }
          else {
            if(hint && hint.empty) {
              str+='}';
            } else {
              str+=linebreak()+indent(level-1)+'}';
            }
          }
          //str+='}';
          break;

          // Print the actual thing.
        case module.EVENTS.item:
          str+=filter(module.to_string(thing));
          break;

        default:
          break;
        };
      };

      // Tidy up string in various ways.

      var filter = function(str) {
        if(!config.extended.on || config.length) {
          // Remove newlines and squeeze:
          str = str.replace(/\r?\n/g,'').replace(/  */g,' ');
          // Squeeze spaces around syntactical stuff:
          str = str.replace(/(\W) /g,'$1');
          str = str.replace(/ (\W)/g,'$1');
        }
        if(config.length) {
          var limit,len,remove;
          limit = config.length;
          len = str.length;
          remove = str.length-limit;
          if(str.length>limit) {
            str =
              '|'+
              str.substring(0,len/2-remove/2)+
              '...'+
              str.substring(len/2+remove/2,len)
              +'|';
          }
        }
        return str;
      };

      var indent = function(level) {
        var indent;
        if(config.extended.on) {
          for(indent='',i=0;i<level+1;i++) {
            if(config.extended.indent) {
              indent += config.extended.indent;
            }
            else {
              indent += module.CONFIG.extended.indent;
            }
          }
          return indent;
        } else {
          return '';
        }
      };

      var linebreak = function() {
        if(config.extended.on) {
          if(config.extended.newline)
            return config.extended.newline;
          else
            return module.CONFIG.extended.newline;
        } else {
          return '';
        }
      };

    })();
    
  })();

  return module;

}();

