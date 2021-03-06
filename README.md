

WORMS3000
=================

Introduction
------------
Worms3000 is a HTML5 Canvas game based on the classic arcade snake game. The game idea is basically that the player
controls a "snake" or a "worm" which moves continually forward but can be controlled to turn. If the snake collides
with itself the game is over. Every now and then some "food" will pop up somewhere on the screen which the snake can 
eat. This makes the snake longer, and makes it more difficult to avoid colliding the snake into its tail.



Variation
---------
There are many versions of the classic snake game available both online, in arcades and in mobile devices. The game really
got a wide spread when Nokia started to ship the game in their phones. Most implementations stick to the games simplicity - 
square shapes, a fixed grid, X/Y-movement and static food. 

This version of the game tries to take it a few steps beyond that
8 bit-feeling - instead of just being able to move straight up/down or left/right, the player can actually steer the snake 
in any direction. Simply push the left- or right- arrow keys to turn, and the snake will make a smooth turn. Keep the key 
pressed down and you'll go in a full circle. Other features of this version are that the "food" moves and that sometimes 
enemies appear...




Implementation
--------------
This version of the game is based on HTML5-canvas. It uses the canvas to draw the game, but the menus are built in
HTML. The techniques used include Javascript, PHP, HTML5 Canvas, requestAnimationFrame, HTML5 Audio, AJAX and jQuery.



Play the game
-------------
The game is available online at http://magnuswikhog.com/worms3000/worms.html or at http://www.student.bth.se/~mawi13/javascript/kmom0710/worms3000/worms.html



Source code
-----------
The source code is available on GitHub at http://www.github.com/badcash/worms3000


Installation
------------
This game can be downloaded and played directly in your browser. There are, however, a couple of things to keep in
mind. First, your browser must obviously support HTML5 Canvas and HTML Audio. Secondly, while it is possible to simply
run the game in your browser directly from your local computer, the highscore feature won't be available since it uses AJAX and PHP 
to store and retrieve the highscores. 

To install the game on your webserver simply download the sourcecode from GitHub and place it in a folder on your webserver. 

**IMPORTANT NOTE: When installing the game on a webserver keep in mind that you have to make the highscores.txt file writable for
PHP to be able to store the highscores!**

