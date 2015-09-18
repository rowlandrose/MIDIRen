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

var p_t3_n = [
  '1111111111111111',
  '111r111r111r111r',
  '1124117111rr1111',
  '1113311113161711',
  '5115113112115181',
  '11rr11rr11rr11rr',
  '1r1r1r1r1r1r1r1r',
  'rrrrrrrrrrrrrrrr'
];
var p_t4_n = [
  '1111322241113232',
  '2233344455422334',
  '6655655333444466',
  '7776666rr6377r88',
  '2377777662rr16rr',
  '9997888677756664',
  '1113222433354446',
  'rrrrrrrrrrrrrrrr'
];
var p_t5_n = [
  '1123112346546542',
  '6767545565234354',
  '8985887767877566',
  '564r564r5687rr35',
  '11rr44rr11rr44rr',
  '9876543219876543',
  '1234566789123456',
  'rrrrrrrrrrrrrrrr'
];
var p_t6_n = [
  '1234123412341234',
  '1234561234561234',
  '9876987698769876',
  '7654765476547654',
  '7654327654327654',
  '7733773388266444',
  '1r1r1r1r1r1r1r1r',
  'rrrrrrrrrrrrrrrr'
];

// Key:
// numbers: Relative notes in a chord
// r: Random note in chord

var chord_notes = {
  'i'    :[0,3,7],
  'I'    :[0,4,7],
  'ii'   :[0,3,7],
  'ii_d' :[0,3,6],
  'III'  :[0,4,7],
  'iii'  :[0,3,7],
  'iv'   :[0,3,7],
  'IV'   :[0,4,7],
  'V'    :[0,4,7],
  'VI'   :[0,4,7],
  'vi'   :[0,3,7],
  'bVII' :[0,4,7],
  'vii_d':[0,3,6]
};
var chord_positions = {
  'i'    : 0,
  'I'    : 0,
  'ii'   : 2,
  'ii_d' : 2,
  'III'  : 3,
  'iii'  : 4,
  'iv'   : 5,
  'IV'   : 5,
  'V'    : 7,
  'VI'   : 8,
  'vi'   : 9,
  'bVII' :10,
  'vii_d':11
};

var chord_progressions = [
  ['I'],
  ['I','ii','I','IV'],
  ['I','ii','I','vii_d','I','IV'],
  ['I','vii_d','V','vii_d','I','V'],
  ['I','vi','ii','V'],
  ['I','iii','ii'],
  ['I','V'],
  ['I','IV','vii_d'],
  ['i'],
  ['i','ii_d','vii_d','V','vii_d'],
  ['i','iv','vii_d','VI','ii_d'],
  ['i','bVII','iv','i','VI','ii_d','vii_d'],
  ['i','vii_d','V','i','V','VI','ii_d'],
  ['i','ii_d','V'],
  ['i','VI','ii_d','i','vii_d'],
  ['i','ii_d','vii_d','V']
];
// Progressions generated via:
// http://www.rowlandrose.com/experiments/chord_progression_experiment/

var current_pattern_t1 = 0;
var current_pattern_t2 = 0;
var current_pattern_t3 = 0;
var current_pattern_t4 = 0;
var current_pattern_t5 = 0;
var current_pattern_t6 = 0;

var selected_pattern_t1 = 0;
var selected_pattern_t2 = 0;
var selected_pattern_t3 = 0;
var selected_pattern_t4 = 0;
var selected_pattern_t5 = 0;
var selected_pattern_t6 = 0;

var que_pattern_t1 = 0;
var que_pattern_t2 = 0;
var que_pattern_t3 = 0;
var que_pattern_t4 = 0;
var que_pattern_t5 = 0;
var que_pattern_t6 = 0;

var current_rand_t1 = 0;
var current_rand_t2 = 0;

var current_note_t3 = 0;
var current_note_t4 = 0;
var current_note_t5 = 0;
var current_note_t6 = 0;

var que_note_t3 = 0;
var que_note_t4 = 0;
var que_note_t5 = 0;
var que_note_t6 = 0;

var current_t3_num = current_pattern_t3;
var current_t4_num = current_pattern_t4;
var current_t5_num = current_pattern_t5;
var current_t6_num = current_pattern_t6;

var prev_t3_p = 0;
var prev_t4_p = 0;
var prev_t5_p = 0;
var prev_t6_p = 0;

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
var NOTE_OFFSET = -12; // Notes away from chosen root note

var midi = require('midi'); // Include midi library

var current_clock = CLOCK_PER_CLICK;
var current_pulse = 0;
var root_note = 48;
var current_chord_progression = 1; // 0 to 15
var prog_spot = 0;
var current_chord = chord_progressions[current_chord_progression][prog_spot];
var current_root = root_note + chord_positions[current_chord];

var midi_output = new midi.output();
midi_output.openPort(MIDI_IO_PORT);

var midi_input = new midi.input();

midi_input.on('message', function(deltaTime, message) {

  // MIDI Thru (only notes)
  if(message[0] == 144 || message[0] == 128) {
    midi_output.sendMessage(message);
  }

  //console.log(message);

  // Get Pattern for Track 1
  if(message[0] == 176 && message[1] == 24) {
    selected_pattern_t1 = message[2];
  }
  if(message[0] == 176 && message[1] == 113 && message[2] > 0) {
    que_pattern_t1 = selected_pattern_t1;
  }
  // Get Random for Track 1
  if(message[0] == 176 && message[1] == 3) {
    current_rand_t1 = message[2];
  }

  // Get Pattern for Track 2
  if(message[0] == 176 && message[1] == 25) {
    selected_pattern_t2 = message[2];
  }
  if(message[0] == 176 && message[1] == 114 && message[2] > 0) {
    que_pattern_t2 = selected_pattern_t2;
  }
  // Get Random for Track 2
  if(message[0] == 176 && message[1] == 9) {
    current_rand_t2 = message[2];
  }

  // Get Pattern for Track 3
  if(message[0] == 176 && message[1] == 26) {
    selected_pattern_t3 = message[2];
  }
  if(message[0] == 176 && message[1] == 115 && message[2] > 0) {
    que_pattern_t3 = selected_pattern_t3;
  }
  // Get Pattern for Track 4
  if(message[0] == 176 && message[1] == 27) {
    selected_pattern_t4 = message[2];
  }
  if(message[0] == 176 && message[1] == 116 && message[2] > 0) {
    que_pattern_t4 = selected_pattern_t4;
  }
  // Get Pattern for Track 5
  if(message[0] == 176 && message[1] == 28) {
    selected_pattern_t5 = message[2];
  }
  if(message[0] == 176 && message[1] == 117 && message[2] > 0) {
    que_pattern_t5 = selected_pattern_t5;
  }
  // Get Pattern for Track 6
  if(message[0] == 176 && message[1] == 29) {
    selected_pattern_t6 = message[2];
  }
  if(message[0] == 176 && message[1] == 118 && message[2] > 0) {
    que_pattern_t6 = selected_pattern_t6;
  }

  // Get Note Pattern for Track 3
  if(message[0] == 176 && message[1] == 14) {
    que_note_t3 = message[2];
  }
  // Get Note Pattern for Track 4
  if(message[0] == 176 && message[1] == 15) {
    que_note_t4 = message[2];
  }
  // Get Note Pattern for Track 5
  if(message[0] == 176 && message[1] == 20) {
    que_note_t5 = message[2];
  }
  // Get Note Pattern for Track 6
  if(message[0] == 176 && message[1] == 21) {
    que_note_t6 = message[2];
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
  if(Math.floor(Math.random() * 7) + 1 <= current_rand_t2){
    r_applied_t2 = Math.floor(Math.random() * 16);
  } else {
    r_applied_t2 = current_pulse;
  }
  /////////////
  // Track 1 BD
  //console.log('r_applied_t1: '+r_applied_t1+'r_applied_t2, '+r_applied_t2);
  if(p_t1_bd[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([148, 57, 127]);
    setTimeout(function(){ midi_output.sendMessage([148, 57, 0]); }, 250);
  }
  /////////////
  // Track 1 SN
  if(p_t1_sn[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([148, 60, 127]);
    setTimeout(function(){ midi_output.sendMessage([148, 60, 0]); }, 250);
  }
  //////////
  // Track 2
  var t2_char = p_t2[current_pattern_t2].charAt(r_applied_t2);
  var t2_num = p_t2_letter_to_notenum[t2_char];
  if(t2_num > 0) {

    // Timeout on initial message so BD and SN can trigger, NES quirk
    setTimeout(function(){ midi_output.sendMessage([148, t2_num, 127]); }, 10);
    setTimeout(function(){ midi_output.sendMessage([148, t2_num, 0]); }, 250);
  }
  //////////
  // Track 3
  console.log(current_pattern_t3+' '+selected_pattern_t3+' '+que_pattern_t3);
  var t3_char = p_t3[current_pattern_t3].charAt(current_pulse);

  var prev_pulse = current_pulse - 1;
  if(prev_pulse < 0) {
    prev_pulse = (BEATS_PER_MEASURE * PPQ) - 1;
  }
  var t3_char_prev = p_t3[current_pattern_t3].charAt(prev_pulse);

  if(t3_char == 'x') {

    var chord_n = p_t3_n[current_note_t3].charAt(current_pulse);

    if(chord_n == 'r') {
      chord_n = Math.floor(Math.random() * 9) + 1;
    } else {
      chord_n = parseInt(chord_n);
    }

    var chord_spot = chord_n % chord_notes[current_chord].length;
    var translated_num = chord_notes[current_chord][chord_spot];
    var chord_octaves = Math.floor(chord_n / chord_notes[current_chord].length);
    translated_num += chord_octaves * 12;
    current_t3_num = translated_num + current_root;
    //current_t3_num = current_root;

    // If prev char was 'x', then send midi note off
    if(t3_char_prev == 'x' || t3_char_prev == '>'
      || current_pattern_t3 != prev_t3_p) {
      midi_output.sendMessage([128, current_t3_num, 60]);
    }

    midi_output.sendMessage([144, current_t3_num, 60]);

  } else if(t3_char == '-') {

    // If prev char was 'x', then send midi note off
    if(t3_char_prev == 'x' || t3_char_prev == '>'
      || current_pattern_t3 != prev_t3_p) {
      midi_output.sendMessage([128, current_t3_num, 60]);
    }
  }

  prev_t3_p = current_pattern_t3;

  //////////////
  // Pulse Logic
  if(current_pulse + 1 == BEATS_PER_MEASURE * PPQ) {

    current_pulse = 0;

    current_pattern_t1 = que_pattern_t1;
    current_pattern_t2 = que_pattern_t2;
    current_pattern_t3 = que_pattern_t3;
    current_pattern_t4 = que_pattern_t4;
    current_pattern_t5 = que_pattern_t5;
    current_pattern_t6 = que_pattern_t6;

    current_note_t3 = que_note_t3;
    current_note_t4 = que_note_t4;
    current_note_t5 = que_note_t5;
    current_note_t6 = que_note_t6;

    prog_spot++;
    if(prog_spot >= chord_progressions[current_chord_progression].length) {
      prog_spot = 0;
    }
    current_chord = chord_progressions[current_chord_progression][prog_spot];
    current_root = root_note + chord_positions[current_chord];
  } else {
    current_pulse++;
  }
}

// Close the port when done.
//midi_output.closePort();
