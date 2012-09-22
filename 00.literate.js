// Only include this for tests and literate programming (ie dev or
// documentation).
//
// It assumes you've loaded up the test framework and the
// literate framework.

var lit           = $dlb_id_au$.literate;
var jq            = $dlb_id_au$.literate.jQuery;
var Logger        = $web17_com_au$.logger.Logger;
var P             = $web17_com_au$.pretty_print;  // Comes with logger.
var U             = $dlb_id_au$.unitJS;
var print         = U.printers.print;
var print_summary = U.printers.print_summary;
var A             = U.assertions;
var E             = U.assertions.assertEquals;

// fn links a script tag ID with test statements.
// It will show the script tag and run any test
// statements returned by 'fn'.
// 
// fn expects an id of script node.
// fn should return unitjs test statements.

var show_scripts = function(fn) {

  lit.show_scripts(

    // scriptNode = the actual script tag
    // displayNode = a node showing the script tag to the reader

    function(scriptNode,displayNode){

      var results,statements;
      var div,div_summary;
      var id = jq(scriptNode).attr('id');
      statements = fn(id);
      if(statements) {
        results = U.runner.run(statements);
        div = print(results);
        div_summary = print_summary(results);
        jq(displayNode).after(
          jq('<div class="tests" />').append(div_summary),
          jq('<div class="tests" />').append(div)
        );
      }

    },

    function(){

      // We're often working in pre-tags since
      // it is easier to write paragraphs this
      // way when being literate and using html.
      // Undo this here for the tests.

      jq('.tests').css('whiteSpace','normal');
      jq('.tests').css('fontFamily','sans-serif');
    }
  );

}
