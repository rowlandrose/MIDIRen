// Constants
var MIDI_IO_PORT = 1; // midi port UX16 happens to be on
var BEATS_PER_MEASURE = 4;
var BPM = 120;
var PPQ = 1; // Pulse Per Quarter-note (beat), 4 = sixteenth notes
var MS_PER_TICK = 1000 / (BPM / 60) / PPQ;
var NS_PER_TICK = MS_PER_TICK * 1000000;

var MEASURES_BEFORE_QUIT = 10;

var midi = require('midi'); // Include midi library

console.log('Testing basic beat generation');

////////////////////
// Handle midi input
var midi_input = new midi.input();

midi_input.on('message', function(deltaTime, message) {

  console.log('m:' + message + ' d:' + deltaTime);
  midi_output.sendMessage(message);
});

midi_input.openPort(MIDI_IO_PORT);

// Close the port when done.
//midi_input.closePort();

/////////////////////
// Handle midi output
var midi_output = new midi.output();
midi_output.openPort(MIDI_IO_PORT);

var time = process.hrtime();
var midi_output_timeout;
var prev_tick = MS_PER_TICK;

run_output_timeout(0);

function run_output_timeout() {

  midi_output_timeout = setTimeout(function() {

    midi_output.sendMessage([148, 57, 127]);
    setTimeout(function(){ midi_output.sendMessage([148, 57, 0]); }, 250);

    var diff = process.hrtime(time);
    time = process.hrtime();

    prev_tick = prev_tick - ((diff[1] - NS_PER_TICK) / 1000000);

    run_output_timeout();

  }, prev_tick);
}

// Close the port when done.
//midi_output.closePort();
