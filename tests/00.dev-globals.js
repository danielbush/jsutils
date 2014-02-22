/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

var data        = $dlb_id_au$.unitJS.data;
var with_tests$ = $dlb_id_au$.unitJS.with$.with_tests$;
var with_tests  = $dlb_id_au$.unitJS.with$.with_tests;
var run         = $dlb_id_au$.unitJS.run.run;
var print       = $dlb_id_au$.unitJS.print.print;
var it          = $dlb_id_au$.unitJS.shoulds.it;
var error_for   = $dlb_id_au$.unitJS.shoulds.error_for;

var tests = data.makeTests(); 
tests.name = 'All';

// Run tests:
window.onload = function() {

  var div,results;

  div = document.getElementById('container');
  if(!div) {
    console.log("Can't find div#container.");
    return;
  }
  if(!tests) {
    console.log("'tests' global variable not set. Did you you include test module?");
    return;
  }

  run(tests);
  results = print(tests);
  div.appendChild(results.node);

};

