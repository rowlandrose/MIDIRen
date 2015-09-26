function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

function run_output_timeout() {

  midi_output_timeout = setTimeout(function() {

    //////////////////////
    // MIDI Logic Per Tick
    if(midiren_play){
      midi_logic_per_tick();
    }

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
  ///////////////////
  // Track 1 - NES BD
  if(p_t1_bd[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([158, 57, 127]);
    setTimeout(function(){ midi_output.sendMessage([158, 57, 0]); }, 250);
  }
  ///////////////////
  // Track 1 - NES SN
  if(p_t1_sn[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([158, 60, 127]);
    setTimeout(function(){ midi_output.sendMessage([158, 60, 0]); }, 250);
  }
  /////////////////////////////////
  // Track 2 - Other NES Percussion
  var t2_char = p_t2[current_pattern_t2].charAt(r_applied_t2);
  var t2_num = p_t2_letter_to_notenum[t2_char];
  if(t2_num > 0) {

    // Timeout on initial message so BD and SN can trigger, NES quirk
    setTimeout(function(){ midi_output.sendMessage([158, t2_num, 127]); }, 10);
    setTimeout(function(){ midi_output.sendMessage([158, t2_num, 0]); }, 250);
  }
  //////////////////////////
  // Track 3 - NES Mega Inst
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

    // If prev char was 'x', then send midi note off
    if(t3_char_prev == 'x' || t3_char_prev == '>'
      || current_pattern_t3 != prev_t3_p) {
      midi_output.sendMessage([138, current_t3_num+12, 30]);
      midi_output.sendMessage([139, current_t3_num, 30]);
      midi_output.sendMessage([140, current_t3_num-12, 30]);
    }

    midi_output.sendMessage([154, current_t3_num+12, 30]);
    midi_output.sendMessage([155, current_t3_num, 30]);
    midi_output.sendMessage([156, current_t3_num-12, 30]);

  } else if(t3_char == '-') {

    // If prev char was 'x', then send midi note off
    if(t3_char_prev == 'x' || t3_char_prev == '>'
      || current_pattern_t3 != prev_t3_p) {
      midi_output.sendMessage([138, current_t3_num+12, 30]);
      midi_output.sendMessage([139, current_t3_num, 30]);
      midi_output.sendMessage([140, current_t3_num-12, 30]);
    }
  }
  prev_t3_p = current_pattern_t3;

  //////////////////////
  // Track 4 - Shruthi-1=
  var t4_char = p_t4[current_pattern_t4].charAt(current_pulse);

  var prev_pulse = current_pulse - 1;
  if(prev_pulse < 0) {
    prev_pulse = (BEATS_PER_MEASURE * PPQ) - 1;
  }
  var t4_char_prev = p_t4[current_pattern_t4].charAt(prev_pulse);

  if(t4_char == 'x') {

    var chord_n = p_t4_n[current_note_t4].charAt(current_pulse);

    if(chord_n == 'r') {
      chord_n = Math.floor(Math.random() * 9) + 1;
    } else {
      chord_n = parseInt(chord_n);
    }

    var chord_spot = chord_n % chord_notes[current_chord].length;
    var translated_num = chord_notes[current_chord][chord_spot];
    var chord_octaves = Math.floor(chord_n / chord_notes[current_chord].length);
    translated_num += chord_octaves * 12;
    current_t4_num = translated_num + current_root;

    // If prev char was 'x', then send midi note off
    if(t4_char_prev == 'x' || t4_char_prev == '>'
      || current_pattern_t4 != prev_t4_p) {
      midi_output.sendMessage([133, current_t4_num, 30]);
    }

    midi_output.sendMessage([149, current_t4_num, 30]);

  } else if(t4_char == '-') {

    // If prev char was 'x', then send midi note off
    if(t4_char_prev == 'x' || t4_char_prev == '>'
      || current_pattern_t4 != prev_t4_p) {
      midi_output.sendMessage([133, current_t4_num, 30]);
    }
  }
  prev_t4_p = current_pattern_t4;

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

function midi_panic() {

  // All notes off on channel 14 (Shruthi-1)
  for(var i = 0; i <= 127; i++) {
    midi_output.sendMessage([133, i, 30]);
  }
  // Single note off message on channels 1-3 (NES)
  midi_output.sendMessage([138, 0, 30]);
  midi_output.sendMessage([139, 0, 30]);
  midi_output.sendMessage([140, 0, 30]);
}

// MIDIRen set functions
// Sets variable and changes LEDs on MIDIRen if neccessary
function mr_set_velocity(mr_cc) {

  var track_num = 1;
  var rows_tall = 1;
  var velocity = 0;
  var on_ccs = [];
  var off_ccs = [];
  switch(mr_cc) {

    // Track 1
    case 44:
      track_num = 1;
      velocity = 0;
      on_ccs.push(44);
      off_ccs.push(40);
      off_ccs.push(36);
      off_ccs.push(32);
      off_ccs.push(12);
      off_ccs.push(8);
      off_ccs.push(4);
      off_ccs.push(0);
      break;
    case 40:
      track_num = 1;
      velocity = 44;
      on_ccs.push(44);
      on_ccs.push(40);
      off_ccs.push(36);
      off_ccs.push(32);
      off_ccs.push(12);
      off_ccs.push(8);
      off_ccs.push(4);
      off_ccs.push(0);
      break;
    case 36:
      track_num = 1;
      velocity = 57;
      on_ccs.push(44);
      on_ccs.push(40);
      on_ccs.push(36);
      off_ccs.push(32);
      off_ccs.push(12);
      off_ccs.push(8);
      off_ccs.push(4);
      off_ccs.push(0);
      break;
    case 32:
      track_num = 1;
      velocity = 71;
      on_ccs.push(44);
      on_ccs.push(40);
      on_ccs.push(36);
      on_ccs.push(32);
      off_ccs.push(12);
      off_ccs.push(8);
      off_ccs.push(4);
      off_ccs.push(0);
      break;
    case 12:
      track_num = 1;
      velocity = 85;
      on_ccs.push(44);
      on_ccs.push(40);
      on_ccs.push(36);
      on_ccs.push(32);
      on_ccs.push(12);
      off_ccs.push(8);
      off_ccs.push(4);
      off_ccs.push(0);
      break;
    case 8:
      track_num = 1;
      velocity = 99;
      on_ccs.push(44);
      on_ccs.push(40);
      on_ccs.push(36);
      on_ccs.push(32);
      on_ccs.push(12);
      on_ccs.push(8);
      off_ccs.push(4);
      off_ccs.push(0);
      break;
    case 4:
      track_num = 1;
      velocity = 113;
      on_ccs.push(44);
      on_ccs.push(40);
      on_ccs.push(36);
      on_ccs.push(32);
      on_ccs.push(12);
      on_ccs.push(8);
      on_ccs.push(4);
      off_ccs.push(0);
      break;
    case 0:
      track_num = 1;
      velocity = 127;
      on_ccs.push(44);
      on_ccs.push(40);
      on_ccs.push(36);
      on_ccs.push(32);
      on_ccs.push(12);
      on_ccs.push(8);
      on_ccs.push(4);
      on_ccs.push(0);
      break;

    // Track 2
    case 45:
      track_num = 2;
      velocity = 0;
      on_ccs.push(45);
      off_ccs.push(41);
      off_ccs.push(37);
      off_ccs.push(33);
      off_ccs.push(13);
      off_ccs.push(9);
      off_ccs.push(5);
      off_ccs.push(1);
      break;
    case 41:
      track_num = 2;
      velocity = 44;
      on_ccs.push(45);
      on_ccs.push(41);
      off_ccs.push(37);
      off_ccs.push(33);
      off_ccs.push(13);
      off_ccs.push(9);
      off_ccs.push(5);
      off_ccs.push(1);
      break;
    case 37:
      track_num = 2;
      velocity = 57;
      on_ccs.push(45);
      on_ccs.push(41);
      on_ccs.push(37);
      off_ccs.push(33);
      off_ccs.push(13);
      off_ccs.push(9);
      off_ccs.push(5);
      off_ccs.push(1);
      break;
    case 33:
      track_num = 2;
      velocity = 71;
      on_ccs.push(45);
      on_ccs.push(41);
      on_ccs.push(37);
      on_ccs.push(33);
      off_ccs.push(13);
      off_ccs.push(9);
      off_ccs.push(5);
      off_ccs.push(1);
      break;
    case 13:
      track_num = 2;
      velocity = 85;
      on_ccs.push(45);
      on_ccs.push(41);
      on_ccs.push(37);
      on_ccs.push(33);
      on_ccs.push(13);
      off_ccs.push(9);
      off_ccs.push(5);
      off_ccs.push(1);
      break;
    case 9:
      track_num = 2;
      velocity = 99;
      on_ccs.push(45);
      on_ccs.push(41);
      on_ccs.push(37);
      on_ccs.push(33);
      on_ccs.push(13);
      on_ccs.push(9);
      off_ccs.push(5);
      off_ccs.push(1);
      break;
    case 5:
      track_num = 2;
      velocity = 113;
      on_ccs.push(45);
      on_ccs.push(41);
      on_ccs.push(37);
      on_ccs.push(33);
      on_ccs.push(13);
      on_ccs.push(9);
      on_ccs.push(5);
      off_ccs.push(1);
      break;
    case 1:
      track_num = 2;
      velocity = 127;
      on_ccs.push(45);
      on_ccs.push(41);
      on_ccs.push(37);
      on_ccs.push(33);
      on_ccs.push(13);
      on_ccs.push(9);
      on_ccs.push(5);
      on_ccs.push(1);
      break;

    // Track 3
    case 46:
      track_num = 3;
      velocity = 0;
      on_ccs.push(46);
      off_ccs.push(42);
      off_ccs.push(38);
      off_ccs.push(34);
      off_ccs.push(14);
      off_ccs.push(10);
      off_ccs.push(6);
      off_ccs.push(2);
      break;
    case 42:
      track_num = 3;
      velocity = 44;
      on_ccs.push(46);
      on_ccs.push(42);
      off_ccs.push(38);
      off_ccs.push(34);
      off_ccs.push(14);
      off_ccs.push(10);
      off_ccs.push(6);
      off_ccs.push(2);
      break;
    case 38:
      track_num = 3;
      velocity = 57;
      on_ccs.push(46);
      on_ccs.push(42);
      on_ccs.push(38);
      off_ccs.push(34);
      off_ccs.push(14);
      off_ccs.push(10);
      off_ccs.push(6);
      off_ccs.push(2);
      break;
    case 34:
      track_num = 3;
      velocity = 71;
      on_ccs.push(46);
      on_ccs.push(42);
      on_ccs.push(38);
      on_ccs.push(34);
      off_ccs.push(14);
      off_ccs.push(10);
      off_ccs.push(6);
      off_ccs.push(2);
      break;
    case 14:
      track_num = 3;
      velocity = 85;
      on_ccs.push(46);
      on_ccs.push(42);
      on_ccs.push(38);
      on_ccs.push(34);
      on_ccs.push(14);
      off_ccs.push(10);
      off_ccs.push(6);
      off_ccs.push(2);
      break;
    case 10:
      track_num = 3;
      velocity = 99;
      on_ccs.push(46);
      on_ccs.push(42);
      on_ccs.push(38);
      on_ccs.push(34);
      on_ccs.push(14);
      on_ccs.push(10);
      off_ccs.push(6);
      off_ccs.push(2);
      break;
    case 6:
      track_num = 3;
      velocity = 113;
      on_ccs.push(46);
      on_ccs.push(42);
      on_ccs.push(38);
      on_ccs.push(34);
      on_ccs.push(14);
      on_ccs.push(10);
      on_ccs.push(6);
      off_ccs.push(2);
      break;
    case 2:
      track_num = 3;
      velocity = 127;
      on_ccs.push(46);
      on_ccs.push(42);
      on_ccs.push(38);
      on_ccs.push(34);
      on_ccs.push(14);
      on_ccs.push(10);
      on_ccs.push(6);
      on_ccs.push(2);
      break;

    // Track 4
    case 47:
      track_num = 4;
      velocity = 0;
      on_ccs.push(47);
      off_ccs.push(43);
      off_ccs.push(39);
      off_ccs.push(35);
      off_ccs.push(15);
      off_ccs.push(11);
      off_ccs.push(7);
      off_ccs.push(3);
      break;
    case 43:
      track_num = 4;
      velocity = 44;
      on_ccs.push(47);
      on_ccs.push(43);
      off_ccs.push(39);
      off_ccs.push(35);
      off_ccs.push(15);
      off_ccs.push(11);
      off_ccs.push(7);
      off_ccs.push(3);
      break;
    case 39:
      track_num = 4;
      velocity = 57;
      on_ccs.push(47);
      on_ccs.push(43);
      on_ccs.push(39);
      off_ccs.push(35);
      off_ccs.push(15);
      off_ccs.push(11);
      off_ccs.push(7);
      off_ccs.push(3);
      break;
    case 35:
      track_num = 4;
      velocity = 71;
      on_ccs.push(47);
      on_ccs.push(43);
      on_ccs.push(39);
      on_ccs.push(35);
      off_ccs.push(15);
      off_ccs.push(11);
      off_ccs.push(7);
      off_ccs.push(3);
      break;
    case 15:
      track_num = 4;
      velocity = 85;
      on_ccs.push(47);
      on_ccs.push(43);
      on_ccs.push(39);
      on_ccs.push(35);
      on_ccs.push(15);
      off_ccs.push(11);
      off_ccs.push(7);
      off_ccs.push(3);
      break;
    case 11:
      track_num = 4;
      velocity = 99;
      on_ccs.push(47);
      on_ccs.push(43);
      on_ccs.push(39);
      on_ccs.push(35);
      on_ccs.push(15);
      on_ccs.push(11);
      off_ccs.push(7);
      off_ccs.push(3);
      break;
    case 7:
      track_num = 4;
      velocity = 113;
      on_ccs.push(47);
      on_ccs.push(43);
      on_ccs.push(39);
      on_ccs.push(35);
      on_ccs.push(15);
      on_ccs.push(11);
      on_ccs.push(7);
      off_ccs.push(3);
      break;
    case 3:
      track_num = 4;
      velocity = 127;
      on_ccs.push(47);
      on_ccs.push(43);
      on_ccs.push(39);
      on_ccs.push(35);
      on_ccs.push(15);
      on_ccs.push(11);
      on_ccs.push(7);
      on_ccs.push(3);
      break;

    // Track 5
    case 60:
      track_num = 5;
      velocity = 0;
      on_ccs.push(60);
      off_ccs.push(56);
      off_ccs.push(52);
      off_ccs.push(48);
      off_ccs.push(28);
      off_ccs.push(24);
      off_ccs.push(20);
      off_ccs.push(16);
      break;
    case 56:
      track_num = 5;
      velocity = 44;
      on_ccs.push(60);
      on_ccs.push(56);
      off_ccs.push(52);
      off_ccs.push(48);
      off_ccs.push(28);
      off_ccs.push(24);
      off_ccs.push(20);
      off_ccs.push(16);
      break;
    case 52:
      track_num = 5;
      velocity = 57;
      on_ccs.push(60);
      on_ccs.push(56);
      on_ccs.push(52);
      off_ccs.push(48);
      off_ccs.push(28);
      off_ccs.push(24);
      off_ccs.push(20);
      off_ccs.push(16);
      break;
    case 48:
      track_num = 5;
      velocity = 71;
      on_ccs.push(60);
      on_ccs.push(56);
      on_ccs.push(52);
      on_ccs.push(48);
      off_ccs.push(28);
      off_ccs.push(24);
      off_ccs.push(20);
      off_ccs.push(16);
      break;
    case 28:
      track_num = 5;
      velocity = 85;
      on_ccs.push(60);
      on_ccs.push(56);
      on_ccs.push(52);
      on_ccs.push(48);
      on_ccs.push(28);
      off_ccs.push(24);
      off_ccs.push(20);
      off_ccs.push(16);
      break;
    case 24:
      track_num = 5;
      velocity = 99;
      on_ccs.push(60);
      on_ccs.push(56);
      on_ccs.push(52);
      on_ccs.push(48);
      on_ccs.push(28);
      on_ccs.push(24);
      off_ccs.push(20);
      off_ccs.push(16);
      break;
    case 20:
      track_num = 5;
      velocity = 113;
      on_ccs.push(60);
      on_ccs.push(56);
      on_ccs.push(52);
      on_ccs.push(48);
      on_ccs.push(28);
      on_ccs.push(24);
      on_ccs.push(20);
      off_ccs.push(16);
      break;
    case 16:
      track_num = 5;
      velocity = 127;
      on_ccs.push(60);
      on_ccs.push(56);
      on_ccs.push(52);
      on_ccs.push(48);
      on_ccs.push(28);
      on_ccs.push(24);
      on_ccs.push(20);
      on_ccs.push(16);
      break;

    // Track 6
    case 61:
      track_num = 6;
      velocity = 0;
      on_ccs.push(61);
      off_ccs.push(57);
      off_ccs.push(53);
      off_ccs.push(49);
      off_ccs.push(29);
      off_ccs.push(25);
      off_ccs.push(21);
      off_ccs.push(17);
      break;
    case 57:
      track_num = 6;
      velocity = 44;
      on_ccs.push(61);
      on_ccs.push(57);
      off_ccs.push(53);
      off_ccs.push(49);
      off_ccs.push(29);
      off_ccs.push(25);
      off_ccs.push(21);
      off_ccs.push(17);
      break;
    case 53:
      track_num = 6;
      velocity = 57;
      on_ccs.push(61);
      on_ccs.push(57);
      on_ccs.push(53);
      off_ccs.push(49);
      off_ccs.push(29);
      off_ccs.push(25);
      off_ccs.push(21);
      off_ccs.push(17);
      break;
    case 49:
      track_num = 6;
      velocity = 71;
      on_ccs.push(61);
      on_ccs.push(57);
      on_ccs.push(53);
      on_ccs.push(49);
      off_ccs.push(29);
      off_ccs.push(25);
      off_ccs.push(21);
      off_ccs.push(17);
      break;
    case 29:
      track_num = 6;
      velocity = 85;
      on_ccs.push(61);
      on_ccs.push(57);
      on_ccs.push(53);
      on_ccs.push(49);
      on_ccs.push(29);
      off_ccs.push(25);
      off_ccs.push(21);
      off_ccs.push(17);
      break;
    case 25:
      track_num = 6;
      velocity = 99;
      on_ccs.push(61);
      on_ccs.push(57);
      on_ccs.push(53);
      on_ccs.push(49);
      on_ccs.push(29);
      on_ccs.push(25);
      off_ccs.push(21);
      off_ccs.push(17);
      break;
    case 21:
      track_num = 6;
      velocity = 113;
      on_ccs.push(61);
      on_ccs.push(57);
      on_ccs.push(53);
      on_ccs.push(49);
      on_ccs.push(29);
      on_ccs.push(25);
      on_ccs.push(21);
      off_ccs.push(17);
      break;
    case 17:
      track_num = 6;
      velocity = 127;
      on_ccs.push(61);
      on_ccs.push(57);
      on_ccs.push(53);
      on_ccs.push(49);
      on_ccs.push(29);
      on_ccs.push(25);
      on_ccs.push(21);
      on_ccs.push(17);
      break;

    default:
      // no change
  }
  pdata.track_velocity[track_num] = velocity; // set new velocity

  // Build velocity screen
  for(var i = 0; i < on_ccs.length; i++) {
    mrs[mr_velocity_sn][on_ccs[i]] = 127;
  }
  for(var i = 0; i < off_ccs.length; i++) {
    mrs[mr_velocity_sn][off_ccs[i]] = 0;
  }

  if(mr_velocity_sn == mr_current_sn) {
    mr_screen_refresh();
  }
}

function mr_screen_refresh() {
  // Loop through mrs[mr_current_sn] and send midi cc data to MIDIRen
  for(var i = 0; i < mrs[mr_current_sn].length; i++) {

    midiren_output.sendMessage([175 + MIDIREN_CH, i, mrs[mr_current_sn][i]]);
  }
}

function velocity_track_to_mr_cc(track_num, velocity) {

  if(track_num == 1 && velocity == 127) {
    return 0;
  } else if(track_num == 1 && velocity == 113) {
    return 4;
  } else if(track_num == 1 && velocity == 99) {
    return 8;
  } else if(track_num == 1 && velocity == 85) {
    return 12;
  } else if(track_num == 1 && velocity == 71) {
    return 32;
  } else if(track_num == 1 && velocity == 57) {
    return 36;
  } else if(track_num == 1 && velocity == 44) {
    return 40;
  } else if(track_num == 1 && velocity == 0) {
    return 44;
  } else if(track_num == 2 && velocity == 127) {
    return 1;
  } else if(track_num == 2 && velocity == 113) {
    return 5;
  } else if(track_num == 2 && velocity == 99) {
    return 9;
  } else if(track_num == 2 && velocity == 85) {
    return 13;
  } else if(track_num == 2 && velocity == 71) {
    return 33;
  } else if(track_num == 2 && velocity == 57) {
    return 37;
  } else if(track_num == 2 && velocity == 44) {
    return 41;
  } else if(track_num == 2 && velocity == 0) {
    return 45;
  } else if(track_num == 3 && velocity == 127) {
    return 2;
  } else if(track_num == 3 && velocity == 113) {
    return 6;
  } else if(track_num == 3 && velocity == 99) {
    return 10;
  } else if(track_num == 3 && velocity == 85) {
    return 14;
  } else if(track_num == 3 && velocity == 71) {
    return 34;
  } else if(track_num == 3 && velocity == 57) {
    return 38;
  } else if(track_num == 3 && velocity == 44) {
    return 42;
  } else if(track_num == 3 && velocity == 0) {
    return 46;
  } else if(track_num == 4 && velocity == 127) {
    return 3;
  } else if(track_num == 4 && velocity == 113) {
    return 7;
  } else if(track_num == 4 && velocity == 99) {
    return 11;
  } else if(track_num == 4 && velocity == 85) {
    return 15;
  } else if(track_num == 4 && velocity == 71) {
    return 35;
  } else if(track_num == 4 && velocity == 57) {
    return 39;
  } else if(track_num == 4 && velocity == 44) {
    return 43;
  } else if(track_num == 4 && velocity == 0) {
    return 47;
  } else if(track_num == 5 && velocity == 127) {
    return 16;
  } else if(track_num == 5 && velocity == 113) {
    return 20;
  } else if(track_num == 5 && velocity == 99) {
    return 24;
  } else if(track_num == 5 && velocity == 85) {
    return 28;
  } else if(track_num == 5 && velocity == 71) {
    return 48;
  } else if(track_num == 5 && velocity == 57) {
    return 52;
  } else if(track_num == 5 && velocity == 44) {
    return 56;
  } else if(track_num == 5 && velocity == 0) {
    return 60;
  } else if(track_num == 6 && velocity == 127) {
    return 17;
  } else if(track_num == 6 && velocity == 113) {
    return 21;
  } else if(track_num == 6 && velocity == 99) {
    return 25;
  } else if(track_num == 6 && velocity == 85) {
    return 29;
  } else if(track_num == 6 && velocity == 71) {
    return 49;
  } else if(track_num == 6 && velocity == 57) {
    return 53;
  } else if(track_num == 6 && velocity == 44) {
    return 57;
  } else if(track_num == 6 && velocity == 0) {
    return 61;
  }

  return 0;
}
