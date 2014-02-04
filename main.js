var context = new webkitAudioContext(),
    oscillator = context.createOscillator();

oscillator.connect(context.destination); // Connect to speakers
//oscillator.start(0); // Start generating sound immediately

oscillator.type = 0; // Tell the oscillator to use a sine wave

oscillator.frequency.value = 900; // in hertz

var randomizeFrequency = function(oscillator){
	newFrequency = Math.floor((Math.random() * 1000) + 500);
	oscillator.frequency.value = newFrequency;
	console.log('new frequency:', newFrequency);
}

var changeFrequency = function(oscillator, frequency){
	oscillator.frequency.value = frequency;
	console.log('new frequency:', frequency);
}

//window.setInterval(function(){randomizeFrequency(oscillator)}, 500);

/*
	Create the agent
 */

var piper = {}

piper.instrument = context.createOscillator();
piper.instrument.connect(context.destination);
piper.instrument.type = 0;
piper.instrument.frequency.value = 900;

piper.play = function(){piper.instrument.start(0)};
piper.stop = function(){piper.instrument.stop(0)};

piper.velocity = 0;

/*
	Main loop
 */

var nextStep = function(){
	piper.velocity = Math.random()*100 - 50;
	console.log('new velocity:', piper.velocity);
	piper.instrument.frequency.value += piper.velocity;

	console.log('new frequency:', piper.instrument.frequency.value);
}

piper.play();
window.setInterval(function(){nextStep()}, 100);

