// Patterns
var p_t1_bd = [
  'x---x---x---x---',
  'x--x---x-x-x----',
  'x--x--x--x--x-x-',
  'x------x-x------',
  'x---x--x--x-----',
  'x--x--x-----x---',
  'x---x----x--x---',
  'x----x--x----x--'
];
var p_t1_sn = [
  '----x-------x---',
  '----x-------x---',
  '----x--x--x-----',
  '---x--------x---',
  '----x---x---x---',
  '----x--x---x----',
  '-----x-------x--',
  '----x---x-------'
];

// Constants
var MIDI_IO_PORT = 1; // midi port UX16 happens to be on
var BEATS_PER_MEASURE = 4;
var BPM = 120;
var EXT_BPM = true;
var PPQ = 4; // Pulse Per Quarter-note (beat), 4 = sixteenth notes
var CLOCK_PPQ = 24; // PPQ of incoming MIDI timing clock messages
var CLOCK_PER_CLICK = Math.floor(CLOCK_PPQ / PPQ);
var MS_PER_TICK = 1000 / (BPM / 60) / PPQ;
var NS_PER_TICK = MS_PER_TICK * 1000000;

var midi = require('midi'); // Include midi library

var current_clock = CLOCK_PER_CLICK;
var current_pulse = 0;
var current_pattern_t1 = 0;

console.log('Testing basic beat generation');

var midi_output = new midi.output();
midi_output.openPort(MIDI_IO_PORT);

var midi_input = new midi.input();

midi_input.on('message', function(deltaTime, message) {

  // MIDI Thru
  midi_output.sendMessage(message);

  //console.log(message);

  // Get Pattern for Track 1
  if(message[0] == 180 && message[1] == 24) {
    current_pattern_t1 = message[2];
  }

  // Sync to external BPM
  if(EXT_BPM && message[0] == 248) {

    if(current_clock == CLOCK_PER_CLICK) {

      current_clock = 0;
      midi_logic_per_tick();
    }
    current_clock++;
  }
});

midi_input.openPort(MIDI_IO_PORT);
midi_input.ignoreTypes(true, false, true);

// Close the port when done.
//midi_input.closePort();

var time = process.hrtime();
var midi_output_timeout;
var prev_tick = MS_PER_TICK;

if(!EXT_BPM) {
  run_output_timeout(0);
}

function run_output_timeout() {

  midi_output_timeout = setTimeout(function() {

    //////////////////////
    // MIDI Logic Per Tick
    midi_logic_per_tick();

    // Offsets next tick by detected offset.
    // Offset detected as difference in time vs expected time
    var diff = process.hrtime(time);
    time = process.hrtime();
    prev_tick = prev_tick - ((diff[1] - NS_PER_TICK) / 1000000);
    run_output_timeout();

  }, prev_tick);
}

function midi_logic_per_tick() {

  if(p_t1_bd[current_pattern_t1].charAt(current_pulse) == 'x') {

    midi_output.sendMessage([148, 57, 127]);
    setTimeout(function(){ midi_output.sendMessage([148, 57, 0]); }, 250);
  }
  if(current_pulse + 1 == BEATS_PER_MEASURE * PPQ) {
    current_pulse = 0;
  } else {
    current_pulse++;
  }
}

// Close the port when done.
//midi_output.closePort();
