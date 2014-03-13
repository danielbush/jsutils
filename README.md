JS Utils
========

What?
-----

This is a bunch of utilities that are not tied to the browser or the DOM which include:
* recursive eachr
* recursive mapr
* some other utilities related to the above
  * at the moment, I only have interleave because
    this function is useful for joining lists and even strings
* a pretty printer
* a double linked list implementation (03.list-tree2)
* a tree implemenation (also 03.list-tree2)
  * the tree implementation defines edit operations much like the DOM
    and includes an override mechanism to use DOM attach operations
    if you are working with DOM-trees
  * but where this really shines is in the find operations
  * we define `walk` which recurses on node and its subtree
  * and we define `walkAfter` and `walkBefore` which recurse on
    either side of node
  * we also include a `walkReverse` (which is used by `walkBefore`)
  * regardless of direction, pre- and post-visit positions always
    stay the same
* there are some other bits and pieces
  * a stack: a weird thing that I haven't found a use for
  * and callbacks, a simple idea which allows you to call a
    callback even if it hasn't been defined yet
* TODO possibly looking at adding:
  * a trie
  * a trie

list-tree2
----------
* Allows you to define your preferred labels for sibling and parent relationships.
* The default ones are: nextSibling, previousSibling, parentNode and firstChild
  * these were chosen deliberately to match the w3c DOM api

You can alter these.
If you want your labels to be: 'next','previous','first', you can do this.
You you will need to generate a new version of the module.

See the label parametrisation examples in tests/03.list-tree2.js .

Deprecated
----------
* 03.list-tree will be replaced by 03.list-tree2
    


Why?
----

There's probably no reason for you to be using this unless you are interested in the recursion or want a linked list or pretty printer.

This project is here to support other things I am working on that may be of more interest.
-- danb, Wed Feb 20 01:05:36 EST 2013

