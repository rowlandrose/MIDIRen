function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

function init_preset() {

  // clone selected preset into 'pdata'
  pdata = clone( presets[selected_preset] );

  // Init velocity screen
  for(var i = 0; i < 6; i++) {
    var m_cc = velocity_track_to_mr_cc(i + 1, pdata.track_velocity[i]);
    mr_set_velocity(m_cc);
  }
  // Init pattern screen
  for(var i = 0; i < 6; i++) {
    var m_cc = pattern_track_to_mr_cc(i + 1, pdata.track_pattern[i]);
    mr_set_pattern(m_cc);
  }
  // Init note/random screen
  for(var i = 0; i < 6; i++) {
    var m_cc = note_ran_track_to_mr_cc(i + 1, pdata.track_note_ran[i]);
    mr_set_note_ran(m_cc);
  }
  // Init root note screen
  mr_set_root_note(root_note_to_mr_cc(pdata.root_note));
  // Init chord prog screen
  mr_set_chord_prog(chord_prog_to_mr_cc(pdata.chord_prog));
  // Init preset screen
  mr_set_preset(preset_to_mr_cc(selected_preset));
  // Init BPM screen
  mr_set_bpm(999);

  current_chord = chord_progressions[pdata.chord_prog][prog_spot];
  current_root = pdata.root_note + chord_positions[current_chord];
}

function tap_bpm() {
  // have another process make this blink with the tempo
  // Does a running average of the last four taps, min bpm 30
  // reset to wait for tap 1 after 2 sec of no taps
  if(bpm_tap_prev_time[0] > 0) {

    var diff = process.hrtime(bpm_tap_prev_time);

    var nano_diff = diff[0] * 1000000000 + diff[1];

    if( nano_diff <  2000000000) { // 2 seconds

      if(bpm_tap_arr.length == 4) {
        bpm_tap_arr.shift();
      }

      bpm_tap_arr.push( 60 / (nano_diff / 1000000000) );

      if(bpm_tap_arr.length == 4) {

        var sum = bpm_tap_arr[0] + bpm_tap_arr[1]
        sum += bpm_tap_arr[2] + bpm_tap_arr[3];
        pdata.bpm = Math.floor(sum / 4);
      }

    } else {
      bpm_tap_arr = [];
    }
  }
  bpm_tap_prev_time = process.hrtime();
}

function blink_bpm() {

  if(mr_bpm_sn == mr_current_sn) {

    midiren_output.sendMessage([175 + MIDIREN_CH, 61, 127]);
    setTimeout(function() {

      if(mr_bpm_sn == mr_current_sn) {
        midiren_output.sendMessage([175 + MIDIREN_CH, 61, 0]);
      }
    }, 10);
  }
}

function ms_per_tick() {
  return 1000 / (pdata.bpm / 60) / PPQ;
}

function ns_per_tick() {
  return ms_per_tick() * 1000000;
}

function run_output_timeout() {

  midi_output_timeout = setTimeout(function() {

    //////////////////////
    // MIDI Logic Per Tick
    if(midiren_play){
      midi_logic_per_tick();
    }

    if(bpm_clock >= PPQ) {

      blink_bpm();
      bpm_clock = 0;
    }
    bpm_clock++;

    // Offsets next tick by detected offset.
    // Offset detected as difference in time vs expected time
    var diff = process.hrtime(time);
    time = process.hrtime();
    prev_tick = prev_tick - ((diff[1] - ns_per_tick()) / 1000000);
    run_output_timeout();

  }, prev_tick);
}

function midi_logic_per_tick() {

  // current_pulse > 0 ----> makes sure that the bd hits on 0, sounds better
  // Random Track 1
  if(Math.floor(Math.random() * 7) + 1 <= pdata.track_note_ran[0] && current_pulse > 0){
    r_applied_t1 = Math.floor(Math.random() * 16);
  } else {
    r_applied_t1 = current_pulse;
  }
  // Random Track 2
  if(Math.floor(Math.random() * 7) + 1 <= pdata.track_note_ran[1]){
    r_applied_t2 = Math.floor(Math.random() * 16);
  } else {
    r_applied_t2 = current_pulse;
  }
  ///////////////////
  // Track 1 - NES BD
  if(p_t1_bd[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([158, 57, pdata.track_velocity[0]]);
    setTimeout(function(){ midi_output.sendMessage([158, 57, 0]); }, 250);
  }
  ///////////////////
  // Track 1 - NES SN
  if(p_t1_sn[current_pattern_t1].charAt(r_applied_t1) == 'x') {

    midi_output.sendMessage([158, 60, pdata.track_velocity[0]]);
    setTimeout(function(){ midi_output.sendMessage([158, 60, 0]); }, 250);
  }
  /////////////////////////////////
  // Track 2 - Other NES Percussion
  var t2_char = p_t2[current_pattern_t2].charAt(r_applied_t2);
  var t2_num = p_t2_letter_to_notenum[t2_char];
  if(t2_num > 0) {

    // Timeout on initial message so BD and SN can trigger, NES quirk
    setTimeout(function(){
      midi_output.sendMessage([158, t2_num, pdata.track_velocity[1]]);
    }, 10);
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
      midi_output.sendMessage([138, prev_played_num_t3+12, 30]);
      midi_output.sendMessage([139, prev_played_num_t3, 30]);
      midi_output.sendMessage([140, prev_played_num_t3-12, 30]);
    }

    midi_output.sendMessage([154, current_t3_num+12, pdata.track_velocity[2]]);
    midi_output.sendMessage([155, current_t3_num, pdata.track_velocity[2]]);
    midi_output.sendMessage([156, current_t3_num-12, pdata.track_velocity[2]]);

    prev_played_num_t3 = current_t3_num;

  } else if(t3_char == '-') {

    // If prev char was 'x', then send midi note off
    if(t3_char_prev == 'x' || t3_char_prev == '>'
      || current_pattern_t3 != prev_t3_p) {
      midi_output.sendMessage([138, prev_played_num_t3+12, 30]);
      midi_output.sendMessage([139, prev_played_num_t3, 30]);
      midi_output.sendMessage([140, prev_played_num_t3-12, 30]);
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
      midi_output.sendMessage([133, prev_played_num_t4, 127]);
    }

    midi_output.sendMessage([149, current_t4_num, pdata.track_velocity[3]]);

    prev_played_num_t4 = current_t4_num;

  } else if(t4_char == '-') {

    // If prev char was 'x', then send midi note off
    if(t4_char_prev == 'x' || t4_char_prev == '>'
      || current_pattern_t4 != prev_t4_p) {
      midi_output.sendMessage([133, prev_played_num_t4, 127]);
    }
  }
  prev_t4_p = current_pattern_t4;

  //////////////
  // Pulse Logic
  if(current_pulse + 1 == BEATS_PER_MEASURE * PPQ) {

    current_pulse = 0;

    current_pattern_t1 = pdata.track_pattern[0];
    current_pattern_t2 = pdata.track_pattern[1];
    current_pattern_t3 = pdata.track_pattern[2];
    current_pattern_t4 = pdata.track_pattern[3];
    current_pattern_t5 = pdata.track_pattern[4];
    current_pattern_t6 = pdata.track_pattern[5];

    current_note_t3 = pdata.track_note_ran[2];
    current_note_t4 = pdata.track_note_ran[3];
    current_note_t5 = pdata.track_note_ran[4];
    current_note_t6 = pdata.track_note_ran[5];

    prog_spot++;
    if(prog_spot >= chord_progressions[pdata.chord_prog].length) {
      prog_spot = 0;
    }
    current_chord = chord_progressions[pdata.chord_prog][prog_spot];
    current_root = pdata.root_note + chord_positions[current_chord];
  } else {
    current_pulse++;
  }

  light_pattern_jump();
}

function light_pattern_jump() {

  if(current_pulse % (PPQ / 2) == 0) {

    if(que_jump > 0) {
      jump_pos = jump_ccs.indexOf(que_jump);
      current_pulse = jump_pos * (PPQ / 2);
      midi_panic();
      que_jump = 0;
    }

    jump_pos = Math.floor(current_pulse / (PPQ / 2));

    var cc_level = 0;
    for(var i = 0; i < jump_ccs.length; i++) {
      if(jump_pos == i) {
        cc_level = 127;
      } else {
        cc_level = 0;
      }
      midiren_output.sendMessage([175 + MIDIREN_CH, jump_ccs[i], cc_level]);
    }
  }
}

function midi_panic() {

  // Single note off on channel 6 (Shruthi-1)
  /*for(var i = 0; i <= 127; i++) {
    midi_output.sendMessage([133, i, 30]);
  }*/
  midi_output.sendMessage([133, prev_played_num_t4, 127]);

  // Single note off message on channels 11-13 (NES)
  midi_output.sendMessage([138, 0, 30]);
  midi_output.sendMessage([139, 0, 30]);
  midi_output.sendMessage([140, 0, 30]);
}

// MIDIRen set functions
// Sets variable and changes LEDs on MIDIRen if neccessary

function mr_set_preset(mr_cc) {

  var ps_s = [
    [42,36,30,24,18,12,6,0],
    [43,37,31,25,19,13,7,1],
    [44,38,32,26,20,14,8,2],
    [45,39,33,27,21,15,9,3],
    [46,40,34,28,22,16,10,4],
    [47,41,35,29,23,17,11,5]
  ];

  // Build preset screen and update selected preset
  var prev_preset = selected_preset;
  var do_init = false;

  for(var i = 0; i < track_ccs.length; i++) {
    for(var j = 0; j < track_ccs[i].length; j++) {
      if(track_ccs[i][j] === parseInt(mr_cc)) {

        selected_preset = ps_s[i][j];
        if(prev_preset != selected_preset) {
          do_init = true;
        }
        mrs[mr_preset_sn][mr_cc] = 127;
      } else {
        mrs[mr_preset_sn][track_ccs[i][j]] = 0;
      }
    }
  }

  if(mr_preset_sn == mr_current_sn) {
    mr_screen_refresh();
  }

  if(do_init) {
    init_preset();
  }
}

function mr_set_bpm(mr_cc) {

  var digit_1 = [0,1,2,3,16,17,4,5,6,7];
  var digit_2 = [8,9,10,11,24,25,12,13,14,15];
  var digit_3 = [32,33,34,35,48,49,36,37,38,39];

  if(mr_cc == 40 && !ext_bpm) {
    pdata.bpm -= 10;
  } else if(mr_cc == 41 && !ext_bpm) {
    pdata.bpm -= 5;
  } else if(mr_cc == 42 && !ext_bpm) {
    pdata.bpm -= 1;
  } else if(mr_cc == 43 && !ext_bpm) {
    pdata.bpm += 1;
  } else if(mr_cc == 56 && !ext_bpm) {
    pdata.bpm += 5;
  } else if(mr_cc == 57 && !ext_bpm) {
    pdata.bpm += 10;
  } else if(mr_cc == 44) {
    midiren_play = true;
    prog_spot = 0;
    current_pulse = 0;
    current_chord = chord_progressions[pdata.chord_prog][prog_spot];
    current_root = pdata.root_note + chord_positions[current_chord];
    // light up initial jump position
    light_pattern_jump();
  } else if(mr_cc == 45) {
    midiren_play = false;
    midi_panic();
    // Clear all jump cc's
    for(var i = 0; i < jump_ccs.length; i++) {
      midiren_output.sendMessage([175 + MIDIREN_CH, jump_ccs[i], 0]);
    }
  } else if(mr_cc == 46) {
    ext_bpm = true;
    clearTimeout(midi_output_timeout);
  } else if(mr_cc == 47) {
    ext_bpm = false;
    run_output_timeout(0);
  } else if(mr_cc == 60) {
    pdata.bpm = presets[selected_preset].bpm;
  } else if(mr_cc == 61 && !ext_bpm) {
    tap_bpm();
  } else if(digit_1.indexOf(mr_cc) != -1 && !ext_bpm) {

    var temp_bpm = pdata.bpm % 100;
    pdata.bpm = temp_bpm + (100 * digit_1.indexOf(mr_cc));

  } else if(digit_2.indexOf(mr_cc) != -1 && !ext_bpm) {

    var temp_bpm_h = Math.floor(pdata.bpm / 100) * 100;
    var temp_bpm_ones = pdata.bpm % 10;
    pdata.bpm = temp_bpm_h + (10 * digit_2.indexOf(mr_cc)) + temp_bpm_ones;

  } else if(digit_3.indexOf(mr_cc) != -1 && !ext_bpm) {

    var temp_bpm = Math.floor(pdata.bpm / 10) * 10;
    pdata.bpm = temp_bpm + digit_3.indexOf(mr_cc);
  }

  // Correct BPM if too big or too small
  if(pdata.bpm < 30) {
    pdata.bpm = 30;
  } else if(pdata.bpm > 500) {
    pdata.bpm = 500;
  }

  // Update bpm screen
  for(var i = 0; i < digit_1.length; i++) {

    var temp_bpm_h = Math.floor(pdata.bpm / 100);

    if(temp_bpm_h == i) {
      mrs[mr_bpm_sn][digit_1[i]] = 127;
    } else {
      mrs[mr_bpm_sn][digit_1[i]] = 0;
    }
  }
  for(var i = 0; i < digit_2.length; i++) {

    var temp_bpm = pdata.bpm % 100;
    temp_bpm = Math.floor(temp_bpm / 10);

    if(temp_bpm == i) {
      mrs[mr_bpm_sn][digit_2[i]] = 127;
    } else {
      mrs[mr_bpm_sn][digit_2[i]] = 0;
    }
  }
  for(var i = 0; i < digit_3.length; i++) {

    var temp_bpm = pdata.bpm % 10;

    if(temp_bpm == i) {
      mrs[mr_bpm_sn][digit_3[i]] = 127;
    } else {
      mrs[mr_bpm_sn][digit_3[i]] = 0;
    }
  }
  if(midiren_play) {
    mrs[mr_bpm_sn][44] = 127;
    mrs[mr_bpm_sn][45] = 0;
  } else {
    mrs[mr_bpm_sn][44] = 0;
    mrs[mr_bpm_sn][45] = 127;
  }
  if(ext_bpm) {
    mrs[mr_bpm_sn][46] = 127;
    mrs[mr_bpm_sn][47] = 0;
  } else {
    mrs[mr_bpm_sn][46] = 0;
    mrs[mr_bpm_sn][47] = 127;
  }

  if(mr_bpm_sn == mr_current_sn) {
    mr_screen_refresh();
  }
}

function mr_set_chord_prog(mr_cc) {

  var chord_progs = [
    [42,36,30,24,18,12,6,0],
    [43,37,31,25,19,13,7,1],
    [44,38,32,26,20,14,8,2],
    [45,39,33,27,21,15,9,3],
    [46,40,34,28,22,16,10,4],
    [47,41,35,29,23,17,11,5]
  ];

  // Build chord prog screen and update root note
  for(var i = 0; i < track_ccs.length; i++) {
    for(var j = 0; j < track_ccs[i].length; j++) {
      if(track_ccs[i][j] === parseInt(mr_cc)) {
        pdata.chord_prog = chord_progs[i][j];
        prog_spot = 999;
        mrs[mr_chord_prog_sn][mr_cc] = 127;
      } else {
        mrs[mr_chord_prog_sn][track_ccs[i][j]] = 0;
      }
    }
  }

  if(mr_chord_prog_sn == mr_current_sn) {
    mr_screen_refresh();
  }
}

function mr_set_root_note(mr_cc) {

  var root_notes = [
    [24,30,36,42,48,54,60,66],
    [25,31,37,43,49,55,61,67],
    [26,32,38,44,50,56,62,68],
    [27,33,39,45,51,57,63,69],
    [28,34,40,46,52,58,64,70],
    [29,35,41,47,53,59,65,71]
  ];

  // Build root note screen and update root note
  for(var i = 0; i < track_ccs.length; i++) {
    for(var j = 0; j < track_ccs[i].length; j++) {
      if(track_ccs[i][j] === parseInt(mr_cc)) {
        pdata.root_note = root_notes[i][j];
        mrs[mr_root_note_sn][mr_cc] = 127;
      } else {
        mrs[mr_root_note_sn][track_ccs[i][j]] = 0;
      }
    }
  }

  if(mr_root_note_sn == mr_current_sn) {
    mr_screen_refresh();
  }
}

function mr_set_note_ran(mr_cc) {

  var track_num = 1;
  var note_ran_num = 0;

  switch(mr_cc) {

    // Track 1
    case 44:
      track_num = 1;
      note_ran_num = 0;
      break;
    case 40:
      track_num = 1;
      note_ran_num = 1;
      break;
    case 36:
      track_num = 1;
      note_ran_num = 2;
      break;
    case 32:
      track_num = 1;
      note_ran_num = 3;
      break;
    case 12:
      track_num = 1;
      note_ran_num = 4;
      break;
    case 8:
      track_num = 1;
      note_ran_num = 5;
      break;
    case 4:
      track_num = 1;
      note_ran_num = 6;
      break;
    case 0:
      track_num = 1;
      note_ran_num = 7;
      break;

    // Track 2
    case 45:
      track_num = 2;
      note_ran_num = 0;
      break;
    case 41:
      track_num = 2;
      note_ran_num = 1;
      break;
    case 37:
      track_num = 2;
      note_ran_num = 2;
      break;
    case 33:
      track_num = 2;
      note_ran_num = 3;
      break;
    case 13:
      track_num = 2;
      note_ran_num = 4;
      break;
    case 9:
      track_num = 2;
      note_ran_num = 5;
      break;
    case 5:
      track_num = 2;
      note_ran_num = 6;
      break;
    case 1:
      track_num = 2;
      note_ran_num = 7;
      break;

    // Track 3
    case 46:
      track_num = 3;
      note_ran_num = 0;
      break;
    case 42:
      track_num = 3;
      note_ran_num = 1;
      break;
    case 38:
      track_num = 3;
      note_ran_num = 2;
      break;
    case 34:
      track_num = 3;
      note_ran_num = 3;
      break;
    case 14:
      track_num = 3;
      note_ran_num = 4;
      break;
    case 10:
      track_num = 3;
      note_ran_num = 5;
      break;
    case 6:
      track_num = 3;
      note_ran_num = 6;
      break;
    case 2:
      track_num = 3;
      note_ran_num = 7;
      break;

    // Track 4
    case 47:
      track_num = 4;
      note_ran_num = 0;
      break;
    case 43:
      track_num = 4;
      note_ran_num = 1;
      break;
    case 39:
      track_num = 4;
      note_ran_num = 2;
      break;
    case 35:
      track_num = 4;
      note_ran_num = 3;
      break;
    case 15:
      track_num = 4;
      note_ran_num = 4;
      break;
    case 11:
      track_num = 4;
      note_ran_num = 5;
      break;
    case 7:
      track_num = 4;
      note_ran_num = 6;
      break;
    case 3:
      track_num = 4;
      note_ran_num = 7;
      break;

    // Track 5
    case 60:
      track_num = 5;
      note_ran_num = 0;
      break;
    case 56:
      track_num = 5;
      note_ran_num = 1;
      break;
    case 52:
      track_num = 5;
      note_ran_num = 2;
      break;
    case 48:
      track_num = 5;
      note_ran_num = 3;
      break;
    case 28:
      track_num = 5;
      note_ran_num = 4;
      break;
    case 24:
      track_num = 5;
      note_ran_num = 5;
      break;
    case 20:
      track_num = 5;
      note_ran_num = 6;
      break;
    case 16:
      track_num = 5;
      note_ran_num = 7;
      break;

    // Track 6
    case 61:
      track_num = 6;
      note_ran_num = 0;
      break;
    case 57:
      track_num = 6;
      note_ran_num = 1;
      break;
    case 53:
      track_num = 6;
      note_ran_num = 2;
      break;
    case 49:
      track_num = 6;
      note_ran_num = 3;
      break;
    case 29:
      track_num = 6;
      note_ran_num = 4;
      break;
    case 25:
      track_num = 6;
      note_ran_num = 5;
      break;
    case 21:
      track_num = 6;
      note_ran_num = 6;
      break;
    case 17:
      track_num = 6;
      note_ran_num = 7;
      break;

    default:
      // no change
  }
  pdata.track_note_ran[track_num - 1] = note_ran_num; // set new pattern

  // Update note/random screen. Clear then set for target track.
  for(var i = 0; i < track_ccs[track_num - 1].length; i++) {
    mrs[mr_note_ran_sn][track_ccs[track_num - 1][i]] = 0;
  }
  mrs[mr_note_ran_sn][mr_cc] = 127;

  if(mr_note_ran_sn == mr_current_sn) {
    mr_screen_refresh();
  }
}

function mr_set_pattern(mr_cc) {

  var track_num = 1;
  var pattern_num = 0;

  switch(mr_cc) {

    // Track 1
    case 44:
      track_num = 1;
      pattern_num = 0;
      break;
    case 40:
      track_num = 1;
      pattern_num = 1;
      break;
    case 36:
      track_num = 1;
      pattern_num = 2;
      break;
    case 32:
      track_num = 1;
      pattern_num = 3;
      break;
    case 12:
      track_num = 1;
      pattern_num = 4;
      break;
    case 8:
      track_num = 1;
      pattern_num = 5;
      break;
    case 4:
      track_num = 1;
      pattern_num = 6;
      break;
    case 0:
      track_num = 1;
      pattern_num = 7;
      break;

    // Track 2
    case 45:
      track_num = 2;
      pattern_num = 0;
      break;
    case 41:
      track_num = 2;
      pattern_num = 1;
      break;
    case 37:
      track_num = 2;
      pattern_num = 2;
      break;
    case 33:
      track_num = 2;
      pattern_num = 3;
      break;
    case 13:
      track_num = 2;
      pattern_num = 4;
      break;
    case 9:
      track_num = 2;
      pattern_num = 5;
      break;
    case 5:
      track_num = 2;
      pattern_num = 6;
      break;
    case 1:
      track_num = 2;
      pattern_num = 7;
      break;

    // Track 3
    case 46:
      track_num = 3;
      pattern_num = 0;
      break;
    case 42:
      track_num = 3;
      pattern_num = 1;
      break;
    case 38:
      track_num = 3;
      pattern_num = 2;
      break;
    case 34:
      track_num = 3;
      pattern_num = 3;
      break;
    case 14:
      track_num = 3;
      pattern_num = 4;
      break;
    case 10:
      track_num = 3;
      pattern_num = 5;
      break;
    case 6:
      track_num = 3;
      pattern_num = 6;
      break;
    case 2:
      track_num = 3;
      pattern_num = 7;
      break;

    // Track 4
    case 47:
      track_num = 4;
      pattern_num = 0;
      break;
    case 43:
      track_num = 4;
      pattern_num = 1;
      break;
    case 39:
      track_num = 4;
      pattern_num = 2;
      break;
    case 35:
      track_num = 4;
      pattern_num = 3;
      break;
    case 15:
      track_num = 4;
      pattern_num = 4;
      break;
    case 11:
      track_num = 4;
      pattern_num = 5;
      break;
    case 7:
      track_num = 4;
      pattern_num = 6;
      break;
    case 3:
      track_num = 4;
      pattern_num = 7;
      break;

    // Track 5
    case 60:
      track_num = 5;
      pattern_num = 0;
      break;
    case 56:
      track_num = 5;
      pattern_num = 1;
      break;
    case 52:
      track_num = 5;
      pattern_num = 2;
      break;
    case 48:
      track_num = 5;
      pattern_num = 3;
      break;
    case 28:
      track_num = 5;
      pattern_num = 4;
      break;
    case 24:
      track_num = 5;
      pattern_num = 5;
      break;
    case 20:
      track_num = 5;
      pattern_num = 6;
      break;
    case 16:
      track_num = 5;
      pattern_num = 7;
      break;

    // Track 6
    case 61:
      track_num = 6;
      pattern_num = 0;
      break;
    case 57:
      track_num = 6;
      pattern_num = 1;
      break;
    case 53:
      track_num = 6;
      pattern_num = 2;
      break;
    case 49:
      track_num = 6;
      pattern_num = 3;
      break;
    case 29:
      track_num = 6;
      pattern_num = 4;
      break;
    case 25:
      track_num = 6;
      pattern_num = 5;
      break;
    case 21:
      track_num = 6;
      pattern_num = 6;
      break;
    case 17:
      track_num = 6;
      pattern_num = 7;
      break;

    default:
      // no change
  }
  pdata.track_pattern[track_num - 1] = pattern_num; // set new pattern

  // Update pattern screen. Clear then set for target track.
  for(var i = 0; i < track_ccs[track_num - 1].length; i++) {
    mrs[mr_pattern_sn][track_ccs[track_num - 1][i]] = 0;
  }
  mrs[mr_pattern_sn][mr_cc] = 127;

  if(mr_pattern_sn == mr_current_sn) {
    mr_screen_refresh();
  }
}

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
      if(pdata.track_velocity[track_num-1] > 0) {
        prev_velocity[track_num-1] = pdata.track_velocity[track_num-1];
      } else if(prev_velocity[track_num-1] > 0) {
        var num = prev_velocity[track_num-1];
        prev_velocity[track_num-1] = 0;
        mr_set_velocity(velocity_track_to_mr_cc(track_num,num));
        return;
      }
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
      velocity = 15;
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
      velocity = 30;
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
      velocity = 60;
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
      if(pdata.track_velocity[track_num-1] > 0) {
        prev_velocity[track_num-1] = pdata.track_velocity[track_num-1];
      } else if(prev_velocity[track_num-1] > 0) {
        var num = prev_velocity[track_num-1];
        prev_velocity[track_num-1] = 0;
        mr_set_velocity(velocity_track_to_mr_cc(track_num,num));
        return;
      }
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
      velocity = 15;
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
      velocity = 30;
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
      velocity = 60;
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
      if(pdata.track_velocity[track_num-1] > 0) {
        prev_velocity[track_num-1] = pdata.track_velocity[track_num-1];
      } else if(prev_velocity[track_num-1] > 0) {
        var num = prev_velocity[track_num-1];
        prev_velocity[track_num-1] = 0;
        mr_set_velocity(velocity_track_to_mr_cc(track_num,num));
        return;
      }
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
      velocity = 15;
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
      velocity = 30;
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
      velocity = 60;
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
      if(pdata.track_velocity[track_num-1] > 0) {
        prev_velocity[track_num-1] = pdata.track_velocity[track_num-1];
      } else if(prev_velocity[track_num-1] > 0) {
        var num = prev_velocity[track_num-1];
        prev_velocity[track_num-1] = 0;
        mr_set_velocity(velocity_track_to_mr_cc(track_num,num));
        return;
      }
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
      velocity = 15;
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
      velocity = 30;
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
      velocity = 60;
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
      if(pdata.track_velocity[track_num-1] > 0) {
        prev_velocity[track_num-1] = pdata.track_velocity[track_num-1];
      } else if(prev_velocity[track_num-1] > 0) {
        var num = prev_velocity[track_num-1];
        prev_velocity[track_num-1] = 0;
        mr_set_velocity(velocity_track_to_mr_cc(track_num,num));
        return;
      }
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
      velocity = 15;
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
      velocity = 30;
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
      velocity = 60;
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
      if(pdata.track_velocity[track_num-1] > 0) {
        prev_velocity[track_num-1] = pdata.track_velocity[track_num-1];
      } else if(prev_velocity[track_num-1] > 0) {
        var num = prev_velocity[track_num-1];
        prev_velocity[track_num-1] = 0;
        mr_set_velocity(velocity_track_to_mr_cc(track_num,num));
        return;
      }
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
      velocity = 15;
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
      velocity = 30;
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
      velocity = 60;
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
  pdata.track_velocity[track_num - 1] = velocity; // set new velocity

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

    if(typeof mrs[mr_current_sn][i] !== 'undefined') {
      midiren_output.sendMessage([175 + MIDIREN_CH, i, mrs[mr_current_sn][i]]);
    }
  }
}

function mr_option_refresh() {

  var option_arr = [19,23,27,31,51,55,59,63];

  for(var i = 0; i < option_arr.length; i++) {
    if(mr_current_sn == i) {
      midiren_output.sendMessage([175 + MIDIREN_CH, option_arr[i], 127]);
    } else {
      midiren_output.sendMessage([175 + MIDIREN_CH, option_arr[i], 0]);
    }
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
  } else if(track_num == 1 && velocity == 60) {
    return 32;
  } else if(track_num == 1 && velocity == 30) {
    return 36;
  } else if(track_num == 1 && velocity == 15) {
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
  } else if(track_num == 2 && velocity == 60) {
    return 33;
  } else if(track_num == 2 && velocity == 30) {
    return 37;
  } else if(track_num == 2 && velocity == 15) {
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
  } else if(track_num == 3 && velocity == 60) {
    return 34;
  } else if(track_num == 3 && velocity == 30) {
    return 38;
  } else if(track_num == 3 && velocity == 15) {
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
  } else if(track_num == 4 && velocity == 60) {
    return 35;
  } else if(track_num == 4 && velocity == 30) {
    return 39;
  } else if(track_num == 4 && velocity == 15) {
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
  } else if(track_num == 5 && velocity == 60) {
    return 48;
  } else if(track_num == 5 && velocity == 30) {
    return 52;
  } else if(track_num == 5 && velocity == 15) {
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
  } else if(track_num == 6 && velocity == 60) {
    return 49;
  } else if(track_num == 6 && velocity == 30) {
    return 53;
  } else if(track_num == 6 && velocity == 15) {
    return 57;
  } else if(track_num == 6 && velocity == 0) {
    return 61;
  }

  return 0;
}

function pattern_track_to_mr_cc(track_num, pattern_num) {

  if(track_num == 1 && pattern_num == 7) {
    return 0;
  } else if(track_num == 1 && pattern_num == 6) {
    return 4;
  } else if(track_num == 1 && pattern_num == 5) {
    return 8;
  } else if(track_num == 1 && pattern_num == 4) {
    return 12;
  } else if(track_num == 1 && pattern_num == 3) {
    return 32;
  } else if(track_num == 1 && pattern_num == 2) {
    return 36;
  } else if(track_num == 1 && pattern_num == 1) {
    return 40;
  } else if(track_num == 1 && pattern_num == 0) {
    return 44;
  } else if(track_num == 2 && pattern_num == 7) {
    return 1;
  } else if(track_num == 2 && pattern_num == 6) {
    return 5;
  } else if(track_num == 2 && pattern_num == 5) {
    return 9;
  } else if(track_num == 2 && pattern_num == 4) {
    return 13;
  } else if(track_num == 2 && pattern_num == 3) {
    return 33;
  } else if(track_num == 2 && pattern_num == 2) {
    return 37;
  } else if(track_num == 2 && pattern_num == 1) {
    return 41;
  } else if(track_num == 2 && pattern_num == 0) {
    return 45;
  } else if(track_num == 3 && pattern_num == 7) {
    return 2;
  } else if(track_num == 3 && pattern_num == 6) {
    return 6;
  } else if(track_num == 3 && pattern_num == 5) {
    return 10;
  } else if(track_num == 3 && pattern_num == 4) {
    return 14;
  } else if(track_num == 3 && pattern_num == 3) {
    return 34;
  } else if(track_num == 3 && pattern_num == 2) {
    return 38;
  } else if(track_num == 3 && pattern_num == 1) {
    return 42;
  } else if(track_num == 3 && pattern_num == 0) {
    return 46;
  } else if(track_num == 4 && pattern_num == 7) {
    return 3;
  } else if(track_num == 4 && pattern_num == 6) {
    return 7;
  } else if(track_num == 4 && pattern_num == 5) {
    return 11;
  } else if(track_num == 4 && pattern_num == 4) {
    return 15;
  } else if(track_num == 4 && pattern_num == 3) {
    return 35;
  } else if(track_num == 4 && pattern_num == 2) {
    return 39;
  } else if(track_num == 4 && pattern_num == 1) {
    return 43;
  } else if(track_num == 4 && pattern_num == 0) {
    return 47;
  } else if(track_num == 5 && pattern_num == 7) {
    return 16;
  } else if(track_num == 5 && pattern_num == 6) {
    return 20;
  } else if(track_num == 5 && pattern_num == 5) {
    return 24;
  } else if(track_num == 5 && pattern_num == 4) {
    return 28;
  } else if(track_num == 5 && pattern_num == 3) {
    return 48;
  } else if(track_num == 5 && pattern_num == 2) {
    return 52;
  } else if(track_num == 5 && pattern_num == 1) {
    return 56;
  } else if(track_num == 5 && pattern_num == 0) {
    return 60;
  } else if(track_num == 6 && pattern_num == 7) {
    return 17;
  } else if(track_num == 6 && pattern_num == 6) {
    return 21;
  } else if(track_num == 6 && pattern_num == 5) {
    return 25;
  } else if(track_num == 6 && pattern_num == 4) {
    return 29;
  } else if(track_num == 6 && pattern_num == 3) {
    return 49;
  } else if(track_num == 6 && pattern_num == 2) {
    return 53;
  } else if(track_num == 6 && pattern_num == 1) {
    return 57;
  } else if(track_num == 6 && pattern_num == 0) {
    return 61;
  }

  return 0;
}

function note_ran_track_to_mr_cc(track_num, note_ran_num) {

  if(track_num == 1 && note_ran_num == 7) {
    return 0;
  } else if(track_num == 1 && note_ran_num == 6) {
    return 4;
  } else if(track_num == 1 && note_ran_num == 5) {
    return 8;
  } else if(track_num == 1 && note_ran_num == 4) {
    return 12;
  } else if(track_num == 1 && note_ran_num == 3) {
    return 32;
  } else if(track_num == 1 && note_ran_num == 2) {
    return 36;
  } else if(track_num == 1 && note_ran_num == 1) {
    return 40;
  } else if(track_num == 1 && note_ran_num == 0) {
    return 44;
  } else if(track_num == 2 && note_ran_num == 7) {
    return 1;
  } else if(track_num == 2 && note_ran_num == 6) {
    return 5;
  } else if(track_num == 2 && note_ran_num == 5) {
    return 9;
  } else if(track_num == 2 && note_ran_num == 4) {
    return 13;
  } else if(track_num == 2 && note_ran_num == 3) {
    return 33;
  } else if(track_num == 2 && note_ran_num == 2) {
    return 37;
  } else if(track_num == 2 && note_ran_num == 1) {
    return 41;
  } else if(track_num == 2 && note_ran_num == 0) {
    return 45;
  } else if(track_num == 3 && note_ran_num == 7) {
    return 2;
  } else if(track_num == 3 && note_ran_num == 6) {
    return 6;
  } else if(track_num == 3 && note_ran_num == 5) {
    return 10;
  } else if(track_num == 3 && note_ran_num == 4) {
    return 14;
  } else if(track_num == 3 && note_ran_num == 3) {
    return 34;
  } else if(track_num == 3 && note_ran_num == 2) {
    return 38;
  } else if(track_num == 3 && note_ran_num == 1) {
    return 42;
  } else if(track_num == 3 && note_ran_num == 0) {
    return 46;
  } else if(track_num == 4 && note_ran_num == 7) {
    return 3;
  } else if(track_num == 4 && note_ran_num == 6) {
    return 7;
  } else if(track_num == 4 && note_ran_num == 5) {
    return 11;
  } else if(track_num == 4 && note_ran_num == 4) {
    return 15;
  } else if(track_num == 4 && note_ran_num == 3) {
    return 35;
  } else if(track_num == 4 && note_ran_num == 2) {
    return 39;
  } else if(track_num == 4 && note_ran_num == 1) {
    return 43;
  } else if(track_num == 4 && note_ran_num == 0) {
    return 47;
  } else if(track_num == 5 && note_ran_num == 7) {
    return 16;
  } else if(track_num == 5 && note_ran_num == 6) {
    return 20;
  } else if(track_num == 5 && note_ran_num == 5) {
    return 24;
  } else if(track_num == 5 && note_ran_num == 4) {
    return 28;
  } else if(track_num == 5 && note_ran_num == 3) {
    return 48;
  } else if(track_num == 5 && note_ran_num == 2) {
    return 52;
  } else if(track_num == 5 && note_ran_num == 1) {
    return 56;
  } else if(track_num == 5 && note_ran_num == 0) {
    return 60;
  } else if(track_num == 6 && note_ran_num == 7) {
    return 17;
  } else if(track_num == 6 && note_ran_num == 6) {
    return 21;
  } else if(track_num == 6 && note_ran_num == 5) {
    return 25;
  } else if(track_num == 6 && note_ran_num == 4) {
    return 29;
  } else if(track_num == 6 && note_ran_num == 3) {
    return 49;
  } else if(track_num == 6 && note_ran_num == 2) {
    return 53;
  } else if(track_num == 6 && note_ran_num == 1) {
    return 57;
  } else if(track_num == 6 && note_ran_num == 0) {
    return 61;
  }

  return 0;
}

function root_note_to_mr_cc(note) {

  var root_notes = [
    [24,30,36,42,48,54,60,66],
    [25,31,37,43,49,55,61,67],
    [26,32,38,44,50,56,62,68],
    [27,33,39,45,51,57,63,69],
    [28,34,40,46,52,58,64,70],
    [29,35,41,47,53,59,65,71]
  ];

  for(var i = 0; i < root_notes.length; i++) {
    for(var j = 0; j < root_notes[i].length; j++) {
      if(root_notes[i][j] == note) {
        return track_ccs[i][j];
      }
    }
  }
  return 0;
}

function chord_prog_to_mr_cc(chord_prog) {

  var chord_progs = [
    [42,36,30,24,18,12,6,0],
    [43,37,31,25,19,13,7,1],
    [44,38,32,26,20,14,8,2],
    [45,39,33,27,21,15,9,3],
    [46,40,34,28,22,16,10,4],
    [47,41,35,29,23,17,11,5]
  ];

  for(var i = 0; i < chord_progs.length; i++) {
    for(var j = 0; j < chord_progs[i].length; j++) {
      if(chord_progs[i][j] == chord_prog) {
        return track_ccs[i][j];
      }
    }
  }
  return 0;
}

function preset_to_mr_cc(ps) {

  var ps_s = [
    [42,36,30,24,18,12,6,0],
    [43,37,31,25,19,13,7,1],
    [44,38,32,26,20,14,8,2],
    [45,39,33,27,21,15,9,3],
    [46,40,34,28,22,16,10,4],
    [47,41,35,29,23,17,11,5]
  ];

  for(var i = 0; i < ps_s.length; i++) {
    for(var j = 0; j < ps_s[i].length; j++) {
      if(ps_s[i][j] == ps) {
        return track_ccs[i][j];
      }
    }
  }
  return 0;
}
