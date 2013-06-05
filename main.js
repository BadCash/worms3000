// On ready
$(function(){
	'use strict';

	
	function Config(){
		for( var s in this.sounds ){
			this.sounds[s].audio.volume = this.sounds[s].volume;
			this.sounds[s].audio.loop = this.sounds[s].loop || false;
		}

		this.wormFillStyle = ct.createRadialGradient(0, 0, this.wormSize/5, 0, 0, this.wormSize);
		this.wormFillStyle.addColorStop(0, '#AAF');
		this.wormFillStyle.addColorStop(1, '#00B');
		
		this.segmentTypes['segmentneck'].fillStyle = ct.createRadialGradient(0, 0, this.wormSize/5, 0, 0, this.wormSize);
		this.segmentTypes['segmentneck'].fillStyle.addColorStop(0, '#77C');
		this.segmentTypes['segmentneck'].fillStyle.addColorStop(1, '#008');

		this.segmentTypes['segmenttail'].fillStyle = ct.createRadialGradient(0, 0, this.wormSize/5, 0, 0, this.wormSize);
		this.segmentTypes['segmenttail'].fillStyle.addColorStop(0, '#F00');
		this.segmentTypes['segmenttail'].fillStyle.addColorStop(1, '#300');

		this.foodTypes[0].fillStyle = ct.createRadialGradient(0, 0, this.foodTypes[0].size/5, 0, 0, this.foodTypes[0].size);
		this.foodTypes[0].fillStyle.addColorStop(0, '#FFF');
		this.foodTypes[0].fillStyle.addColorStop(1, '#0F0');

		this.foodTypes[1].fillStyle = ct.createRadialGradient(0, 0, this.foodTypes[1].size/5, 0, 0, this.foodTypes[1].size);
		this.foodTypes[1].fillStyle.addColorStop(0, '#0F0');
		this.foodTypes[1].fillStyle.addColorStop(1, '#030');
	}
	Config.prototype = {
		gameWidth: 640,
		gameHeight: 640,
		wormSize: 16,
		wormStartLength: 10, // Currently the startsegments all become "necks", not "tails"
		startSpeed: 0.15, // Pixels/ms
		startX: 320,
		startY: 320,
		startDirection: Math.PI,
		wormFillStyle: '#00F', 
		segmentTypes: {
			segmentneck: { strokeStyle: '', fillStyle: '#FF0' },
			segmenttail: { strokeStyle: '', fillStyle: '#F0F' },
		},
		foodTypes: [ { strokeStyle: '#000', fillStyle: '#00F', size: 10 },
					  { strokeStyle: '#000', fillStyle: '#0F0', size: 20 } ],
		minFoodChangeDirection: 0, // Radians/ms
		maxFoodChangeDirection: Math.PI*0.0003, // Radians/ms
		enemyTypes: [ { strokeStyle: '#FFF', fillStyle: '#F00' }, 
					   { strokeStyle: '#F00', fillStyle: '#FA0' } ], 
		enemyRotationSpeed: Math.PI*0.00005, // Radians/ms
		minEnemySpawnDelay: 5, // Min number of seconds until new enemy spawns (after old one dies)
		maxEnemySpawnDelay: 30, // Max number of seconds until new enemy spawns (after old one dies)
		enemySpawnChance: 30, // Move this closer to 0 to make it more likely that an enemy will spawn before maxEnemySpawnDelay
		minEnemySize: 16,
		maxEnemySize: 40,
		minEnemySpeed: 0.05,
		maxEnemySpeed: 0.3,
		minEnemyChangeDirection: 0, // Radians/ms
		maxEnemyChangeDirection: Math.PI*0.0003, // Radians/ms
		foodSizes: [10, 20],
		posQueueLength: 5,
		segmentFlyToScoreSpeed: 2,
		soundsLoaded: false,
		sounds: {
			buttonhover: {
				audio: new Audio("audio/Mouse_Cl-MBD123-8915_hifi.ogg"),
				volume: 0.5
			},
			buttonclick: {
				audio: new Audio("audio/Mouse_Cl-MBD123-8915_hifi.ogg"),
				volume: 0 // Off
			},
			eat: {
				audio: new Audio("audio/eat.ogg"),
				volume: 1.0
			},
			die: {
				audio: new Audio("audio/Drum_Ech-E77-7332_hifi.ogg"),
				volume: 1.0
			},
			deathSpin: {
				audio: new Audio("audio/cartoon189.ogg"),//Alien_al-Egon_Pub-8693_hifi.ogg"),
				volume: 1.0,
				loop: true
			},
			segmentFlyToScore: {
				audio: new Audio("audio/RewardSo-Mark_E_B-8078_hifi.ogg"),
				volume: 1.0,
				loop: false
			},
			startScreenMusic: {
				audio: new Audio("audio/One_Last-Sir_Shir-10333_hifi.ogg"),
				volume: 0.3,
				loop: true
			},
			gameOverScreenMusic: {
				audio: new Audio("audio/One_Last-Sir_Shir-10333_hifi.ogg"),
				volume: 0.3,
				loop: true
			},
			gameNormalMusic: {
				audio: new Audio("audio/Gift_of_-Sir_Shir-10365_hifi.ogg"),
				volume: 0.1,
				loop: true
			},
			gameFastMusic: {
				audio: new Audio("audio/One_Last-Sir_Shir-10333_hifi.ogg"),
				volume: 0.5,
				loop: true
			},
		}
	}
    
  
	var canvas, ct, width, height, score, config, enemySpawnDelay;
	
	
	// Here we initialize things that only need to be initialized ONCE 
	// Things that need to be reinitialized on every gamestart we put in
	// Game.init()
	canvas = document.getElementById('canvas1');
	canvas.style.display = 'block';
	ct = canvas.getContext('2d');
	config = new Config();  
	width = canvas.width = config.gameWidth;
	height = canvas.height = config.gameHeight;
  
  
  
/**
 * Start screen
 */
window.StartScreen = (function(){

	function getHighscores(){
		$('#hsheader th').toggleClass('header_loading', true);
		
		$.ajax({
			url: 'ajax.php?method=getHighscores',
			dataType: 'json',
			type: 'POST',
			data: {
			},
			success: function(data){
				console.log('getHighscores returned successfully.');    
				console.log(data);	
				
				$('#hsheader th').toggleClass('header_loading', false);
				
				// Clear old items
				$('#highscores').find('tr:not(#hsheader):not(#hsfooter)').remove();
								
				for( var i=0; i<data.highscores.length; i++ ){
					console.log( data.highscores[i] );
						
					var newItem = $('#template_highscore').clone();
					newItem.attr('id', 'highscore_'+data.highscores[i].id);
					newItem.find('.time').text(data.highscores[i].time);
					newItem.find('.name').text(data.highscores[i].name);
					newItem.find('.score').text(data.highscores[i].score);
					$('#highscores').find('#hsheader').after( newItem );					
					
				}
				
				$('#hsfooter th').text('Total number of players: '+data.highscores.length);
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('getHighscores failed: ' + textStatus + ', ' + errorThrown);  
			},
		});
		
	}
	
	
	function loadMusic(){
		var counter = 0;
		console.log( 'Loading music...' );
		
		for(var sound in config.sounds ) {
			var audio = config.sounds[sound].audio;
			console.log( 'Loading audio file...' );
			
			audio.addEventListener("loadeddata", function() {
				console.log( 'Audio file loaded!' );
				counter++;
				var percent = Math.floor((counter/Object.keys(config.sounds).length)*100);
				
				$('#startbutton').text( "Loading... " + percent + "%" );
				
				if(percent == 100){
					$('#startbutton').text('Play');
					$('#startbutton').attr('disabled', false);
					$('#startbutton').toggleClass('processing', false);
					$('#startbutton').data('enabled', 'true');
					config.sounds.startScreenMusic.audio.play();
					config.soundsLoaded = true;
				}
					
			});
		}
	}
	

	function hide(){
		$('#startscreen').hide();
		config.sounds.startScreenMusic.audio.pause();
	}
	
	function show(){
		$('#startscreen').show();
		if( !config.soundsLoaded ) loadMusic()
		else config.sounds.startScreenMusic.audio.play();

		getHighscores();
	}
		
	$('#startbutton').click( function(event){
		if( $(this).data('enabled') == 'true' ){
			StartScreen.hide();
			Game.show();
		}
	});	
	
	return {
		'hide': hide,
		'show': show,
		'getHighscores': getHighscores
	}
})();

  
  
/**
 * Worms, the Game
 */

window.Game = (function(){


	var gameObjects, scoreLabel, isGameOver, animRequest, td, lastGameTick, worm;



	function Point(x, y){
		this.x = x || 0,
		this.y = y || 0
	}
	Point.prototype = {

		// Return the distance between two points
		distance: function(v){
			return  Math.sqrt(
						Math.pow(Math.abs(this.x-v.x), 2) + 
						Math.pow(Math.abs(this.y-v.y), 2)
					);
		}

	}


	function Worm(){
		this.objectType = 'worm';
		this.size = config.wormSize;
		this.position = new Point(config.startX, config.startY);
		this.direction = config.startDirection;
		this.speed = config.startSpeed;
		this.opponent = false;
		this.tail = null;
		this.gameOverAnimPhase = 0;
	}
	Worm.prototype = {
		
		update: function(){
		
			if( isGameOver ){
				this.updateGameOver();
				return;
			}

			if (Key.isDown(Key.LEFT, Key.A))   this.rotateLeft();
			if (Key.isDown(Key.RIGHT, Key.D))  this.rotateRight();
			if (Key.isDown(Key.S)) gameOverAnim();

			
			if( this.tail !== null ){
				this.tail.update( new Point(this.position.x, this.position.y) );
			}

			this.move(td, ct);
		},
		
		move: function(){
			var movePixels = this.speed*td; // Speed is measured in pixels/ms
			
			this.position.x += movePixels * Math.cos(this.direction);
			this.position.y += movePixels * Math.sin(this.direction);
			
			this.keepInGameArea();
		},
		
		rotateLeft:  function(amount) { this.direction -= amount || Math.PI/30; },
		rotateRight: function(amount) { this.direction += amount || Math.PI/30; },

		keepInGameArea: function(){
			if( this.position.x<-this.size ) this.position.x = width+this.size;
			if( this.position.x>width+this.size ) this.position.x = -this.size;
			if( this.position.y<-this.size ) this.position.y = height+this.size;
			if( this.position.y>height+this.size ) this.position.y = -this.size;
		},
		
		draw: function(){
			
			if( this.tail != null ){
				this.tail.draw();
			}
			
			ct.save();
				ct.translate(this.position.x, this.position.y);
				ct.beginPath();
				ct.arc(0, 0, this.size, 0, 2*Math.PI);
				ct.fillStyle = config.wormFillStyle;
				ct.fill();

				ct.beginPath();
				var x = Math.cos(this.direction+Math.PI/5)*this.size*0.8;
				var y = Math.sin(this.direction+Math.PI/5)*this.size*0.8;
				ct.arc(x, y, this.size*0.3, 0, 2*Math.PI);
				ct.fillStyle = "#FFFFFF";
				ct.fill();
				
				ct.beginPath();
				var x = Math.cos(this.direction-Math.PI/5)*this.size*0.8;
				var y = Math.sin(this.direction-Math.PI/5)*this.size*0.8;
				ct.arc(x, y, this.size*0.3, 0, 2*Math.PI);
				ct.fillStyle = "#FFFFFF";
				ct.fill();
				
				ct. save()
					ct.translate(x,y);
					ct.beginPath();
					var x = Math.cos(this.direction+Math.PI/10)*this.size*0.125;
					var y = Math.sin(this.direction+Math.PI/10)*this.size*0.125;
					ct.arc(x, y, this.size*0.1, 0, 2*Math.PI);
					ct.fillStyle = "#000000";
					ct.fill();
				ct.restore();
			
				ct.save();
					ct.translate(Math.cos(this.direction+Math.PI/5)*this.size*0.8, Math.sin(this.direction+Math.PI/5)*this.size*0.8);
					ct.beginPath();
					var x = Math.cos(this.direction+Math.PI/10)*this.size*0.125;
					var y = Math.sin(this.direction+Math.PI/10)*this.size*0.125;
					ct.arc(x, y, this.size*0.1, 0, 2*Math.PI);
					ct.fillStyle = "#000000";
					ct.fill();
				ct.restore();
			ct.restore();
		},
		
		updateGameOver: function(){
		
			if( this.gameOverAnimPhase == 0 ){
				if( this.tail !== null ){
					this.rotateLeft(Math.PI/5);
					this.size = this.size * 1.01;
					
					var lastSegment = this.getTailSegment(null);
					
					if( lastSegment.speed == 0 ){
						lastSegment.direction = Math.atan2(lastSegment.size+lastSegment.position.y, lastSegment.position.x-20)+Math.PI;
						lastSegment.speed = config.segmentFlyToScoreSpeed;
					}
					
					lastSegment.move();
					
					//this.tail.update( new Point(this.position.x, this.position.y) );
					
					//if( this.tail.position.x == this.position.x && this.position.y == this.position.y ){
					if( lastSegment.position.y <= -lastSegment.size ){
/*						var tmp = this.tail;
						this.tail = this.tail.tail;
						tmp = null;
						
*/
						
						playAudio(config.sounds.segmentFlyToScore.audio);
/*						
						config.sounds.segmentFlyToScore.audio.paused;
						config.sounds.segmentFlyToScore.audio.currentTime = 0;
						config.sounds.segmentFlyToScore.audio.play();
*/
						var secondLast = this.getTailSegment(this.tailLength()-2);
						lastSegment = null;	
						secondLast.tail = null;
						
						score += 100;
					}
					
					console.log( this.tailLength() );
				}
				else if( this.size<width || this.size<height ){
					this.rotateLeft(Math.PI/5);
					this.size = this.size * 1.2;
				}
				else{
					gameOver();
				}
			}
		},
		
		drawGameOver: function(){
			this.draw();
		},
		
		// Return tail segment at position <index>, with the first tail segment at index = 0. 
		// If index is null then return last tail segment. If the worm doesn't have a tail segment the worm itself is 
		// the last tail segment. If index is -1 supplied the worm itself is returned.
		getTailSegment: function( index ){		
			var next = this;
			var i=-1;

			if( index === null ){
				return this.getTailSegment(this.tailLength()-1);
			}
			
			while( (i<index && next!=null && next!=undefined) ){
				next = next.tail;
				i++;
			}
				
			return next;
		},
		
		// Returns the length of the tail (not including the head)
		tailLength: function(){
			var next = this.tail;
			var i=0;
			
			while( next!=null && next!=undefined ){
				next = next.tail;
				i++;
			}
			
			return i;
		}

	}




	function Segment(size, startPos){
		this.objectType = 'segmenttail'; // This is may be changed to segmentneck when spawned in collisionDetection()
		this.size = size;
		this.position = new Point( startPos.x, startPos.y );
		this.direction = 0;
		this.speed = 0;
		this.posQueue = [];
		this.tail = null;
	}
	Segment.prototype = {

		getStat: function(){
			var stat = ' ('+this.posQueue.length+') ';
			if( this.tail != null ){
				stat += this.tail.getStat();
			}
			return stat;
		},

		update: function(newPos){
			if( this.tail != null ){
				this.tail.update(this.position);
			}
			
			if( this.posQueue.length < config.posQueueLength ){
				this.posQueue.push( newPos );
			}
			else{
				this.position = this.posQueue.shift();
				this.posQueue.push( newPos );
			}

		},
		
		move: function(){ // This is actually only used when making the segments "fly" to the scoreboard after the user dies
			var movePixels = this.speed*td; // Speed is measured in pixels/ms			
			this.position.x += movePixels * Math.cos(this.direction);
			this.position.y += movePixels * Math.sin(this.direction);
		},
				
		draw: function(){
			if( this.tail != null ){
				this.tail.draw();
			}
				
			ct.save();
			ct.translate(this.position.x, this.position.y);
			ct.beginPath();
			ct.arc(0, 0, this.size, 0, 2*Math.PI);
			ct.fillStyle = config.segmentTypes[this.objectType].fillStyle;
			ct.fill();
			ct.restore();
		}

	}




	function Food(foodType, startPos, startSpeed, startDirection){
		this.objectType = 'food';
		this.foodType = foodType;
		this.subType = 'normal';
		this.size = config.foodTypes[foodType].size;
		this.position = startPos;
		this.speed = startSpeed;
		this.direction = startDirection;
		this.changeDirection = My.randomFloat(config.minFoodChangeDirection, config.maxFoodChangeDirection);
	}
	Food.prototype = {
		
		update: function(){
			this.direction += this.changeDirection*td;
			this.move();
		},
		
		move: function(){
			var movePixels = this.speed*td; // Speed is measured in pixels/ms
			this.position.x += movePixels * Math.cos(this.direction);
			this.position.y += movePixels * Math.sin(this.direction);
			this.keepInGameArea();
		},
		
		rotateLeft:  function() { this.direction -= Math.PI/30; },
		rotateRight: function() { this.direction += Math.PI/30; },

		keepInGameArea: function(){
			if( this.position.x<-this.size ) this.position.x = width+this.size;
			if( this.position.x>width+this.size ) this.position.x = -this.size;
			if( this.position.y<-this.size ) this.position.y = height+this.size;
			if( this.position.y>height+this.size ) this.position.y = -this.size;
		},
		
		draw: function(){
			ct.save();
			ct.translate(this.position.x, this.position.y);
			ct.beginPath();
			ct.arc(0, 0, this.size, 0, 2*Math.PI);
			ct.fillStyle = config.foodTypes[this.foodType].fillStyle;
			ct.fill();
			ct.strokeStyle = config.foodTypes[this.foodType].strokeStyle;
			ct.stroke();
			ct.restore();
		}

	}


	function Enemy(enemyType, size, startPos, startSpeed, startDirection){
		this.objectType = 'enemy';
		this.enemyType = enemyType;
		this.size = size;
		this.position = startPos;
		this.speed = startSpeed;
		this.direction = startDirection;
		this.rotation = 0;
		this.changeDirection = My.randomFloat(config.minEnemyChangeDirection, config.maxEnemyChangeDirection);
		this.zigzagAngle=Math.PI/10;
		this.rotate = 0;
	}
	Enemy.prototype = {
		
		update: function(){
			this.direction += this.changeDirection*td;
			this.move();
		},
		
		move: function(){
			var movePixels = this.speed*td; // Speed is measured in pixels/ms
			this.position.x += movePixels * Math.cos(this.direction);
			this.position.y += movePixels * Math.sin(this.direction);
			this.dontKeepInGameArea();
		},
		
		dontKeepInGameArea: function(){
			if( ( this.position.x<-this.size ) || 
			( this.position.x>width+this.size ) ||
			( this.position.y<-this.size ) ||
			( this.position.y>height+this.size ) ){
				console.log( 'Enemy outside game area' );
				for( var i=0; i<gameObjects.length; i++ ){
					if( gameObjects[i] === this ){
						console.log( 'Enemy removed' );
						gameObjects[i] = null;
						enemySpawnDelay = Date.now();
					}
				}
			}
		},
		
		draw: function(){
			var x1, y1;
			
			ct.save();
			ct.beginPath();
			ct.translate(this.position.x, this.position.y);
			
			x1=Math.cos(this.rotate)*this.size;
			y1=-Math.sin(this.rotate)*this.size;
			ct.moveTo( x1, y1 );
			
			// This takes care of rounding errors and makes sure we dont draw one line too many
			//                                         vvvvvv 
			for( var i=this.rotate; i<(this.rotate+(Math.PI*2))-(this.zigzagAngle*0.9); i+=this.zigzagAngle ){
				x1=Math.cos(i+0.5*this.zigzagAngle)*(this.size*0.8);
				y1=-Math.sin(i+0.5*this.zigzagAngle)*(this.size*0.8);
				ct.lineTo( x1,y1 );

				x1=Math.cos(i+this.zigzagAngle)*this.size;
				y1=-Math.sin(i+this.zigzagAngle)*this.size;
				ct.lineTo( x1,y1 );
			}

			ct.closePath();
			
			ct.fillStyle = config.enemyTypes[this.enemyType].fillStyle;
			ct.fill();
			ct.strokeStyle = config.enemyTypes[this.enemyType].strokeStyle;
			ct.stroke();
			ct.restore();
		
			this.rotate += config.enemyRotationSpeed*td;
		}

	}

  
	var init = function() {
	
		gameObjects = [];
		scoreLabel = $('#statusbar #score');
		isGameOver = false;
		animRequest = null;
		td = 0;
		worm = 0;
		lastGameTick = Date.now();
		score = 0;
		enemySpawnDelay = Date.now();


		
		
		worm = new Worm();
		gameObjects.push( worm );

		spawnFood(1);
		
		for( var i=0; i<config.wormStartLength-1; i++ ){
			spawnSegment(worm);
		}
	};

	var update = function() {
		/*
		var t = 'OBJECTS: ';
		for( var i=0; i<gameObjects.length; i++ ){
			if( gameObjects[i] !== null ){
				t += gameObjects[i].objectType + ', ';
			}
		}
		console.log( t );
		*/
		for( var i=0; i<gameObjects.length; i++ ){
			if( gameObjects[i] !== null && (
				gameObjects[i].objectType == 'worm' || 
				gameObjects[i].objectType == 'food' || 
				gameObjects[i].objectType == 'enemy') ){
					gameObjects[i].update();
			}
		}
		
		if( !isGameOver ){
			collisionDetection();

			// Should we spawn a new enemy?
			// When a new enemy is spawned we set enemySpawnDelay to -1 to signal that we don't want
			// more enemies. When an enemy dies we set enemySpawnDelay to Date.now() to start counting again
			if( enemySpawnDelay != -1 && 
			((Date.now()-enemySpawnDelay > config.minEnemySpawnDelay*1000 && My.random(0, config.enemySpawnChance) == 0) ||
			(Date.now()-enemySpawnDelay > config.maxEnemySpawnDelay*1000) ) ){
				spawnEnemy(1);
			}
		}

		// Remove nulled objects here
		for( var i=0; i<gameObjects.length; i++ ){
			if( gameObjects[i] === null ){
				console.log( 'REMOVED GAMEOBJECT AT INDEX '+i );
				gameObjects.splice( i, 1 ); 
				i--;
			}
		}
		
		updateStatusbar();
	};

	var render = function(td) {
		ct.clearRect(0,0,width,height);

//		for( var i=gameObjects.length-1; i>=0; i-- ){ // Looping backwards to make sure worm is always drawn on top
		for( var i=0; i<gameObjects.length; i++ ){
			if( gameObjects[i] !== null && (
				gameObjects[i].objectType == 'worm' || 
				gameObjects[i].objectType == 'food' || 
				gameObjects[i].objectType == 'enemy') ){
					gameObjects[i].draw();
			}
		}	
	};
  
  
  
  
	var collisionDetection = function(){		
		
		for( var i=0; i<gameObjects.length; i++ ){
			for( var n=i+1; n<gameObjects.length; n++ ){
				if( gameObjects[i] != null && gameObjects[n] != null ){
						var types = [gameObjects[i].objectType, gameObjects[n].objectType];
						
						// Is a player eating some food?
						if( types.indexOf('worm') > -1 && types.indexOf('food') > -1 &&
						objectsTouching( gameObjects[i], gameObjects[n] )
						){
							console.log( 'Eating some food...' );
							
							// Determine which of the objects is the food and which one is the worm
							var iFood = gameObjects[i].objectType == 'food' ? i : n;
							var iWorm = iFood == n ? i : n;

							// What did we eat?!?
							if( gameObjects[iFood].subType == 'normal' ){
								playAudio(config.sounds.eat.audio);
								
								// Increase player score
								score += gameObjects[iFood].size;							
								
								// Null the object. If we remove it here we'll run into problems with missing objects in the for-loops...
								gameObjects[iFood] = null;
								
								// Extend player worm
								spawnSegment(gameObjects[iWorm]);
								
								// Spawn new food
								spawnFood(1);
							}
							
						}
						// Ooops, did we die?
						else if( objectsTouching( gameObjects[i], gameObjects[n] ) &&
						( types.indexOf('worm') > -1 && types.indexOf('segmenttail') > -1 ||
						types.indexOf('worm') > -1 && types.indexOf('enemy') > -1 )
						){
							playAudio(config.sounds.die.audio);
							console.log( 'You\'re dead...' );							
							
							// Did we collide with our tail?
							if( types.indexOf('segmenttail') > -1 ){
								// Determine which of the objects is the segment and which one is the worm
								var iSegment = gameObjects[i].objectType == 'segmenttail' ? i : n;
								var iWorm = iSegment == n ? i : n;

								gameObjects[iSegment].fillStyle = '#FFFF00';
								gameObjects[iSegment].draw();
							}
							
							// Start the game over animation
							gameOverAnim();
						}
				}
			}
		}
		
	}
  
  
	// Returns true if the two objects (circles) are overlapping
	var objectsTouching = function(obj1, obj2){
		var d = Math.sqrt(
					Math.pow(Math.abs(obj1.position.x-obj2.position.x), 2) + 
					Math.pow(Math.abs(obj1.position.y-obj2.position.y), 2)
				);
				
		return (d < obj1.size + obj2.size );
	}	

	
	var spawnSegment = function(worm){
		var lastSegment = worm.getTailSegment(null);
		console.log( 'Spawning segment ('+lastSegment.position.x+', '+lastSegment.position.y+')' );
		lastSegment.tail = new Segment( lastSegment.size, lastSegment.position );
		
		if( objectsTouching(worm, lastSegment.tail) ){
			console.log( '...it\'s a neck segment!' );
			lastSegment.tail.objectType = 'segmentneck';
		}
		else
			console.log( '...it\'s a tail segment!' );				

		gameObjects.push(lastSegment.tail);
	}
	
  
  
	var spawnFood = function(count){
		for( var i=0; i<count; i++ ){
			var foodType = My.random(0,config.foodTypes.length-1);
			var obj = new Food(foodType, new Point(My.random(0, width), My.random(0, height)), My.randomFloat(0, 0.2), My.randomFloat(0, Math.PI*2) );
			gameObjects.push( obj );
		}
	}
  
	var spawnEnemy = function(count){
		enemySpawnDelay = -1;
	
		for( var i=0; i<count; i++ ){
			// Randomize size
			var spawnSize = My.random(config.minEnemySize, config.maxEnemySize);
			
			// Spawn in opposite direction of player movement
			var spawnDirection = worm.direction+Math.PI;
			
			// Walk in spawnDirection until we are just outside the canvas
			var spawnPos = new Point(worm.position.x, worm.position.y);
			var tmpX = worm.position.x;
			var tmpY = worm.position.y;
			while( (tmpX<width+spawnSize && tmpX>-spawnSize) && (tmpY<height+spawnSize && tmpY>-spawnSize) ){
				spawnPos.x = tmpX;
				spawnPos.y = tmpY;
				tmpX += Math.cos(spawnDirection);
				tmpY += Math.sin(spawnDirection);
			}
		
			// Spawn
			console.log( 'Spawning enemy with size '+spawnSize+'px at ('+spawnPos.x+', '+spawnPos.y+')');
			var enemyType = My.random(0,config.enemyTypes.length-1);
			var enemy = new Enemy(enemyType, spawnSize, spawnPos, My.randomFloat(config.minEnemySpeed, config.maxEnemySpeed), spawnDirection+Math.PI );// We want to go in the same direction as the player, otherwise we move away from the canvas!
			gameObjects.push( enemy );
		}
	}
	
	var updateStatusbar = function(){
		scoreLabel.text( score );
	}
  
	var gameOverAnim = function(){
		isGameOver = true;
		worm.speed = 0;

		// Remove everything except the worm and tail
		for( var t=0; t<gameObjects.length; t++ ){
			if( gameObjects[t] !== null &&
				gameObjects[t].objectType != 'worm' && 
				gameObjects[t].objectType != 'segmenttail' &&
				gameObjects[t].objectType != 'segmentneck' ){
					gameObjects.splice(t, 1);
					t--;
			}
		}
		
		config.sounds.gameNormalMusic.audio.pause();
		config.sounds.gameFastMusic.audio.pause();
		config.sounds.deathSpin.audio.play();
				
		console.log( gameObjects.length );
	}
	
	var gameOver = function(){		
		cancelRequestAnimFrame( animRequest );
		animRequest = null; // Signal to game loop that animation is cancelled so we don't render() again
				
		config.sounds.deathSpin.audio.pause();
		
		Game.hide();
		GameOverScreen.show(score);
	}



	var gameLoop = function() {
		var now = Date.now();
		td = now-lastGameTick; // Timediff in milliseconds since last frame / gametick
		lastGameTick = now;
		animRequest = requestAnimFrame(gameLoop);
		
		update();
		
		// Render only if animation request has not been cancelled, which can happen during update()
		if( animRequest !== null ){
			render();
		}
	}

	
	var hide = function(){
		$('#gamescreen').hide();
		config.sounds.gameNormalMusic.audio.pause();		
	}
	
	var show = function(){
		$('#gamescreen').show();
		config.sounds.gameNormalMusic.audio.play();
		Game.init();
		Game.gameLoop();
	}
	
	return {
		'init': init,
		'gameLoop': gameLoop,
		'objectsTouching': objectsTouching,
		'spawnSegment': spawnSegment,
		'hide': hide,
		'show': show
	}
})();




/**
 * Gameover screen
 */
window.GameOverScreen = (function(){

	function sendHighscore(name, score){
		$('#savescorebutton').toggleClass('processing', true);
		$('#savescorebutton').attr('disabled', true);
		$('#savescorebutton').text('Saving score...');

		$.ajax({
			url: 'ajax.php?method=sendHighscore',
			dataType: 'json',
			type: 'POST',
			data: {
				name: name,
				score: score
			},
			success: function(data){
				console.log('sendHighscore returned successfully.');    
				StartScreen.show();
				hide();
				$('#savescorebutton').toggleClass('processing', false);
				$('#savescorebutton').attr('disabled', false);
				$('#savescorebutton').text('Save my score');
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log('sendHighscore failed: ' + textStatus + ', ' + errorThrown);  
				$('#savescorebutton').toggleClass('processing', false);
				$('#savescorebutton').attr('disabled', false);
				$('#savescorebutton').text('Save my score');
			},
		});
		
	}

	function hide(){
		$('#gameoverscreen').hide();
		config.sounds.gameOverScreenMusic.audio.pause();
	}
	
	function show(score){
		$('#gameoverscreen #yourscore').text( score );
		$('#gameoverscreen').show();
		config.sounds.gameOverScreenMusic.audio.play();
	}
	
	
		
	$('#savescorebutton').click( function(event){
		$('#savescoreform input[type=submit]').click();
	});
	

	$('#savescoreform').submit( function(event){
		event.preventDefault();
		console.log( 'Sending highscore...' );
		sendHighscore( $('#savescoreform #name').val(), score );
	});	

	$('#viewhighscorebutton').click( function(event){
		hide();
		StartScreen.show();
	});	

	$('#playagainbutton').click( function(event){
		hide();
		Game.show();
	});	
	
	return {
		'hide': hide,
		'show': show,
		'sendHighscore': sendHighscore
	}
})();

/** 
 * Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */ 
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();



/**
 * Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
 */
window.cancelRequestAnimFrame = (function(){
  return  window.cancelRequestAnimationFrame || 
          window.webkitCancelRequestAnimationFrame || 
          window.mozCancelRequestAnimationFrame    || 
          window.oCancelRequestAnimationFrame      || 
          window.msCancelRequestAnimationFrame     || 
          window.clearTimeout;
})();



/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
window.Key = {
  pressed: {},

  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40,
  SPACE:  32,
  A:      65,
  S:      83,
  D:      68,
  w:      87,
  
  isDown: function(keyCode, keyCode1) {
    return this.pressed[keyCode] || this.pressed[keyCode1];
  },
  
  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  }
};
window.addEventListener('keyup',   function(event) { Key.onKeyup(event); },   false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

/**
 * Helper function for playing audio. If an audio object is already playing, this function
 * creates a new audio object and starts playing the new one immediately. This makes it easy to
 * play the same sound multiple times even if the previous one(s) have not yet finished playing.
 **/
function playAudio(audio){
	if( !audio.paused ){
		
		audio.pause();
		audio.currentTime = 0;
		audio.play();
		/* This version starts a new sound, the other one simply restarts the sound if it's already playing
		var tmp = new Audio(audio.src);
		tmp.volume = audio.volume;
		tmp.loop = audio.loop;
		tmp.play();
		*/
	}
	else{
		audio.play();
	}
}
	
	
	$('.bigbutton').on( 'mouseover', function(event){
		playAudio(config.sounds.buttonhover.audio);
	});
	
	$('.bigbutton').on( 'click', function(event){
		playAudio(config.sounds.buttonclick.audio);
	});
	
	
	StartScreen.show();
	
	console.log('Ready to play.');  
});
