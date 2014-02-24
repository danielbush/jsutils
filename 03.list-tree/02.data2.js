/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2014 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

$dlb_id_au$.utils.listtree.data2 = function() {

  var module = {};
  var object = $dlb_id_au$.utils.gen_utils.object;

  module.makeEntry = function() {
    return {
      next$:null,
      previous$:null,
      parentEntry$:null,
      firstChild$:null
    };
  };

  return module;

}();

