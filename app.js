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
var p_t2 = [
  '---o--cc-o-o----',
  '---p-p-----p-p--',
  '--p-----y--p-p-p',
  '--------hhhhllll',
  'c-c-c-c-c-c-c-c-',
  '--o--coc--o--o-o',
  'c---c---c---c---',
  '--hh--l---h--l-l',
];
var p_t2_letter_to_notenum = {
  '-' : 0,
  'o' : 56,
  'c' : 55,
  'p' : 40,
  'y' : 54,
  'h' : 72,
  'l' : 71
};
// Key:
// o -> Open Hi Hat
// c -> Closed Hi Hat
// p -> Clap
// y -> Cymbol
// h -> High Tom
// l -> Low Tom

var p_t3 = [
  'x==>-xxxx==>-xxx',
  'x--xx--xxxxx-xxx',
  'x>-xx>-xx>-xx>-x',
  'x==>-x=>x==>-x=>',
  '--xxx>-xx>-xx>--',
  'xxxx----xxxx----',
  'x-x-x-x-x-x-x-x-',
  'xx--xx--xx--xx--'
];
var p_t4 = [
  'x==>-xxxx==>-xxx',
  'x--xx--xxxxx-xxx',
  'x>-xx>-xx>-xx>-x',
  'x==>-x=>x==>-x=>',
  '--xxx>-xx>-xx>--',
  'xxxx----xxxx----',
  'x-x-x-x-x-x-x-x-',
  'xx--xx--xx--xx--'
];
var p_t5 = [
  'x==>-xxxx==>-xxx',
  'x--xx--xxxxx-xxx',
  'x>-xx>-xx>-xx>-x',
  'x==>-x=>x==>-x=>',
  '--xxx>-xx>-xx>--',
  'xxxx----xxxx----',
  'x-x-x-x-x-x-x-x-',
  'xx--xx--xx--xx--'
];
var p_t6 = [
  'x==>-xxxx==>-xxx',
  'x--xx--xxxxx-xxx',
  'x>-xx>-xx>-xx>-x',
  'x==>-x=>x==>-x=>',
  '--xxx>-xx>-xx>--',
  'xxxx----xxxx----',
  'x-x-x-x-x-x-x-x-',
  'xx--xx--xx--xx--'
];
var p_t7 = [
  'x==>-xxxx==>-xxx',
  'x--xx--xxxxx-xxx',
  'x>-xx>-xx>-xx>-x',
  'x==>-x=>x==>-x=>',
  '--xxx>-xx>-xx>--',
  'xxxx----xxxx----',
  'x-x-x-x-x-x-x-x-',
  'xx--xx--xx--xx--'
];

var current_pattern_t1 = 0;
var current_pattern_t2 = 0;

var selected_pattern_t1 = 0;
var selected_pattern_t2 = 0;

var que_pattern_t1 = 0;
var que_pattern_t2 = 0;

var current_rand_t1 = 0;
var current_rand_t2 = 0;

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

console.log('Testing basic beat generation');

var midi_output = new midi.output();
midi_output.openPort(MIDI_IO_PORT);

var midi_input = new midi.input();

midi_input.on('message', function(deltaTime, message) {

  // MIDI Thru (only notes)
  if(message[0] == 148) {
    midi_output.sendMessage(message);
  }

  //console.log(message);

  // Get Pattern for Track 1
  if(message[0] == 180 && message[1] == 24) {
    selected_pattern_t1 = message[2];
  }
  if(message[0] == 180 && message[1] == 113 && message[2] > 0) {
    que_pattern_t1 = selected_pattern_t1;
  }
  // Get Random for Track 1
  if(message[0] == 180 && message[1] == 3) {
    current_rand_t1 = message[2];
  }

  // Get Pattern for Track 2
  if(message[0] == 180 && message[1] == 25) {
    selected_pattern_t2 = message[2];
  }
  if(message[0] == 180 && message[1] == 114 && message[2] > 0) {
    que_pattern_t2 = selected_pattern_t2;
  }
  // Get Random for Track 2
  if(message[0] == 180 && message[1] == 9) {
    current_rand_t2 = message[2];
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

  // current_pulse > 0 ----> makes sure that the bd hits on 0, sounds better
  // Random Track 1
  if(Math.floor(Math.random() * 7) + 1 <= current_rand_t1 && current_pulse > 0){
    r_applied_t1 = Math.floor(Math.random() * 16);
  } else {
    r_applied_t1 = current_pulse;
  }
  // Random Track 2
  if(Math.floor(Math.random() * 7) + 1 <= current_rand_t2 && current_pulse > 0){
    r_applied_t2 = Math.floor(Math.random() * 16);
  } else {
    r_applied_t2 = current_pulse;
  }
  // Track 1 BD
  console.log('r_applied_t1: '+r_applied_t1+'r_applied_t2, '+r_applied_t2);
  if(p_t1_bd[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([148, 57, 127]);
    setTimeout(function(){ midi_output.sendMessage([148, 57, 0]); }, 250);
  }
  // Track 1 SN
  if(p_t1_sn[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([148, 60, 127]);
    setTimeout(function(){ midi_output.sendMessage([148, 60, 0]); }, 250);
  }
  // Track 2
  var t2_char = p_t2[current_pattern_t2].charAt(r_applied_t2);
  var t2_notenum = p_t2_letter_to_notenum[t2_char];
  if(t2_notenum > 0) {

    // Timeout on initial message so BD and SN can trigger, NES quirk
    setTimeout(function(){ midi_output.sendMessage([148, t2_notenum, 127]); }, 15);
    setTimeout(function(){ midi_output.sendMessage([148, t2_notenum, 0]); }, 250);
  }

  // Pulse Logic
  if(current_pulse + 1 == BEATS_PER_MEASURE * PPQ) {
    current_pulse = 0;
    current_pattern_t1 = que_pattern_t1;
    current_pattern_t2 = que_pattern_t2;
  } else {
    current_pulse++;
  }
}

// Close the port when done.
//midi_output.closePort();
