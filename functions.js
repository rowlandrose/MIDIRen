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
      midi_output.sendMessage([128, current_t3_num+12, 30]);
      midi_output.sendMessage([129, current_t3_num, 30]);
      midi_output.sendMessage([130, current_t3_num-12, 30]);
    }

    midi_output.sendMessage([144, current_t3_num+12, 30]);
    midi_output.sendMessage([145, current_t3_num, 30]);
    midi_output.sendMessage([146, current_t3_num-12, 30]);

  } else if(t3_char == '-') {

    // If prev char was 'x', then send midi note off
    if(t3_char_prev == 'x' || t3_char_prev == '>'
      || current_pattern_t3 != prev_t3_p) {
      midi_output.sendMessage([128, current_t3_num+12, 30]);
      midi_output.sendMessage([129, current_t3_num, 30]);
      midi_output.sendMessage([130, current_t3_num-12, 30]);
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
