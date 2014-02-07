webAudioExp = angular.module('webAudioExp', ['ngRoute']).
	config(function($routeProvider) {
		$routeProvider.
			when('/', {controller:'HomePageCtrl', templateUrl:'views/homePage.html'}).
			when('/theremin', {controller:'ThereminCtrl', templateUrl:'views/theremin.html'}).
			when('/binaural', {controller:'BinauralCtrl', templateUrl:'views/binaural.html'}).
			otherwise({redirectTo:'/'});
	});

var context = new webkitAudioContext();
var oscillatorList = [];

webAudioExp.controller('ThereminCtrl', ['$scope',
	function ThereminCtrl($scope){

		_.forEach(oscillatorList, function(osc){
			osc.disconnect();
		})

		function Oscillator (name) {
			this.osc = context.createOscillator();
			oscillatorList.push(this.osc);

			this.gain = context.createGainNode();
			this.pan = context.createPanner();

			this.osc.connect(this.gain);
			this.gain.connect(this.pan)
			this.pan.connect(context.destination)

			this.gain.gain.value = 0;
			this.osc.start(0); 
			this.osc.type = 0;
			this.osc.frequency.value = 800;
			this.gain.gain = .7;

			this.name = name;

		}

		var oscillator0 = new Oscillator('oscillator 0');
		var oscCount = 1;

		$scope.oscillators = [
			oscillator0
		]

		$scope.togglePlay = function(oscillator){
			oscillator.gain.gain.value = 1 - oscillator.gain.gain.value;
		}

		$scope.newOsc = function(){
			var name = 'oscillator ' + oscCount;
			var oscillator = new Oscillator(name);
			$scope.oscillators.push(oscillator);
			oscCount += 1;
		}
		var canvas, stage;

		var mouseTarget;	// the display object currently under the mouse, or being dragged
		var dragStarted;	// indicates whether we are currently in a drag operation
		var offset;
		var update = true;

		function init() {
			if (window.top != window) {
				document.getElementById("header").style.display = "none";
			}
			document.getElementById("loader").className = "loader";
			// create stage and point it to the canvas:
			canvas = document.getElementById("testCanvas");
			canvas.backgroundColor = "red";
			stage = new createjs.Stage(canvas);

			// enable touch interactions if supported on the current device:
			createjs.Touch.enable(stage);

			// enabled mouse over / out events
			stage.enableMouseOver(10);
			stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

			// load the source image:
			var image = new Image();
			image.src = "doge.png";
			image.onload = handleImageLoad;
		}

		function stop() {
			createjs.Ticker.removeEventListener("tick", tick);
		}

		function handleImageLoad(event) {
			var image = event.target;
			var bitmap;
			var container = new createjs.Container();
			stage.addChild(container);

			// create and populate the screen with random daisies:
			for(var i = 0; i < 1; i++){
				bitmap = new createjs.Bitmap(image);
				container.addChild(bitmap);
				bitmap.x = (canvas.width * Math.random()|0) * .8 + 50;
				bitmap.y = (canvas.height * Math.random()|0)* .8 + 50;
				
				$scope.oscillators[0].osc.frequency.value = (bitmap.y * 2) + 100;
				var normX = 100* (bitmap.x / canvas.width) - 50;
				$scope.oscillators[0].pan.setPosition(normX,10,-.5)//evt.stageX * 2;

				bitmap.regX = bitmap.image.width/2|0;
				bitmap.regY = bitmap.image.height/2|0;
				bitmap.scaleX = bitmap.scaleY = bitmap.scale = .8;
				bitmap.name = "bmp_"+i;
				bitmap.cursor = "pointer";

				// using "on" binds the listener to the scope of the currentTarget by default
				// in this case that means it executes in the scope of the button.
				bitmap.on("mousedown", function(evt) {
					this.parent.addChild(this);
					this.offset = {x:this.x-evt.stageX, y:this.y-evt.stageY};
					$scope.oscillators[0].gain.gain.value = 1;
				});

				bitmap.on("pressup", function(evt){
					$scope.oscillators[0].gain.gain.value = 1 - $scope.oscillators[0].gain.gain.value;
				});

				// the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
				bitmap.on("pressmove", function(evt) {
					this.x = evt.stageX+ this.offset.x;
					this.y = evt.stageY+ this.offset.y;
					// indicate that the stage should be updated on the next tick:
					update = true;

					$scope.oscillators[0].osc.frequency.value = (canvas.height - evt.stageY)*4 + 100;

					var normX = 100* (evt.stageX / canvas.width) - 50;
					$scope.oscillators[0].pan.setPosition(normX,10,-.5)//evt.stageX * 2;
				});

				bitmap.on("rollover", function(evt) {
					this.scaleX = this.scaleY = this.scale*1.2;
					update = true;
				});

				bitmap.on("rollout", function(evt) {
					this.scaleX = this.scaleY = this.scale;
					update = true;
				});

			}

			document.getElementById("loader").className = "";
			createjs.Ticker.addEventListener("tick", tick);
		}

		function tick(event) {
			// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
			if (update) {
				update = false; // only update once
				stage.update(event);
			}
		}

		init();
}
]);

webAudioExp.controller('BinauralCtrl', ['$scope',
	function BinauralCtrl($scope){
		var init = function(){
			update = true;

			$scope.oscHigh = context.createOscillator();
			$scope.oscLow = context.createOscillator();

			oscillatorList.push($scope.oscHigh);
			oscillatorList.push($scope.oscLow);

			$scope.oscHigh.frequency.value = 200;
			$scope.oscLow.frequency.value = 190;

			$scope.leftGain = context.createGainNode();
			$scope.rightGain = context.createGainNode();

			$scope.oscHigh.connect($scope.leftGain);
			$scope.oscLow.connect($scope.rightGain);

			$scope.leftGain.gain.value = $scope.rightGain.gain.value = 0;

			$scope.merge = context.createChannelMerger(2);

			$scope.leftGain.connect($scope.merge, 0, 0);
			$scope.rightGain.connect($scope.merge, 0, 1);

			$scope.merge.connect(context.destination);

			$scope.oscHigh.start(0);
			$scope.oscLow.start(0);

			$scope.playing = false;

			if (window.top != window) {
				document.getElementById("header").style.display = "none";
			}
			document.getElementById("loader").className = "loader";
			// create stage and point it to the canvas:
			canvas = document.getElementById("testCanvas");
			canvas.backgroundColor = "red";
			stage = new createjs.Stage(canvas);

			// enable touch interactions if supported on the current device:
			createjs.Touch.enable(stage);

			// enabled mouse over / out events
			stage.enableMouseOver(10);
			stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

			// load the source image:
			var image = new Image();
			image.src = "doge.png";
			image.onload = handleImageLoad;
		}

		$scope.play = function(){
			if ($scope.playing){
				$scope.leftGain.gain.value = $scope.rightGain.gain.value = 0;
				$scope.playing = false;
			} else {
				$scope.leftGain.gain.value = $scope.rightGain.gain.value = .03;
				$scope.playing = true;
			}

		}

		function stop() {
			createjs.Ticker.removeEventListener("tick", tick);
		}

		function handleImageLoad(event) {
			var image = event.target;
			var bitmap;
			var container = new createjs.Container();
			stage.addChild(container);

			// create and populate the screen with random daisies:
			for(var i = 0; i < 1; i++){
				bitmap = new createjs.Bitmap(image);
				container.addChild(bitmap);
				bitmap.x = (canvas.width * .5);
				bitmap.y = (canvas.height * .5);

				bitmap.regX = bitmap.image.width/2|0;
				bitmap.regY = bitmap.image.height/2|0;
				bitmap.scaleX = bitmap.scaleY = bitmap.scale = .8;
				bitmap.name = "bmp_"+i;
				bitmap.cursor = "pointer";

				// using "on" binds the listener to the scope of the currentTarget by default
				// in this case that means it executes in the scope of the button.
				bitmap.on("mousedown", function(evt) {
					this.parent.addChild(this);
					this.offset = {x:this.x-evt.stageX, y:this.y-evt.stageY};
				});

				// the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
				bitmap.on("pressmove", function(evt) {
					this.x = evt.stageX+ this.offset.x;
					
					// indicate that the stage should be updated on the next tick:
					update = true;

					if (!$scope.playing){$scope.play()}
					$scope.oscLow.frequency.value = $scope.oscHigh.frequency.value - Math.floor((evt.stageX / canvas.width)*25);
					$scope.$apply();
					console.log('New Tone: ', $scope.oscHigh.frequency.value - $scope.oscLow.frequency.value)
				});

				bitmap.on("rollover", function(evt) {
					this.scaleX = this.scaleY = this.scale*1.2;
					update = true;
				});

				bitmap.on("rollout", function(evt) {
					this.scaleX = this.scaleY = this.scale;
					update = true;
				});

			}

			document.getElementById("loader").className = "";
			createjs.Ticker.addEventListener("tick", tick);
		}

		function tick(event) {
			// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
			if (update) {
				update = false; // only update once
				stage.update(event);
			}
		}

		init();

	}
]);

webAudioExp.controller('HomePageCtrl', ['$scope',
	function SyncCtrl($scope){
	}
]);

function navBar($scope){
	$scope.goto = function(location){
		window.location = '/#/' + location;
	}
}

