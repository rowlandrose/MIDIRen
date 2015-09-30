console.log('MIDIRen now running. Enjoy!');
//////////
// Include
var fs = require('fs');
eval(fs.readFileSync('./variables.js').toString());
eval(fs.readFileSync('./functions.js').toString());

var midi_input = new midi.input();

var input_port_count = midi_input.getPortCount();
for(var i = 0; i < input_port_count; i++) {

  var port_name = midi_input.getPortName(i);
  //console.log(i+': '+midi_input.getPortName(i));
  if(port_name == 'UX16 20:0') {
    UX16_midi_port = i;
  } else if(port_name == 'TeeOnArdu MIDI 24:0') {
    MIDIRen_midi_port = i;
  }
}

var midi_output = new midi.output();
midi_output.openPort(UX16_midi_port);

var midiren_output = new midi.output();
midiren_output.openPort(MIDIRen_midi_port);

var midiren_input = new midi.input();
midiren_input.on('message', function(deltaTime, message) {

  //console.log(message);
  if(message[0] == 175 + MIDIREN_CH && message[2] == 127) {

    if(message[1] == 19) {

      mr_current_sn = 0;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 23) {

      mr_current_sn = 1;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 27) {

      mr_current_sn = 2;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 31) {

      mr_current_sn = 3;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 51) {

      mr_current_sn = 4;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 55) {

      mr_current_sn = 5;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 59) {

      mr_current_sn = 6;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 63) {

      mr_current_sn = 7;
      mr_screen_refresh();
      mr_option_refresh();

    } else if(message[1] == 18) {
      // position column
    } else if(message[1] == 22) {
      // position column
    } else if(message[1] == 26) {
      // position column
    } else if(message[1] == 30) {
      // position column
    } else if(message[1] == 50) {
      // position column
    } else if(message[1] == 54) {
      // position column
    } else if(message[1] == 58) {
      // position column
    } else if(message[1] == 62) {
      // position column
    } else if(mr_current_sn == 0) {
      mr_set_velocity(message[1]);
    } else if(mr_current_sn == 1) {
      mr_set_pattern(message[1]);
    } else if(mr_current_sn == 2) {
      mr_set_note_ran(message[1]);
    } else if(mr_current_sn == 3) {
      mr_set_root_note(message[1]);
    } else if(mr_current_sn == 4) {
      mr_set_chord_prog(message[1]);
    } else if(mr_current_sn == 5) {
      mr_set_bpm(message[1]);
    } else if(mr_current_sn == 6) {
      mr_set_preset(message[1]);
    }
  }

});
midiren_input.openPort(MIDIRen_midi_port);

midi_input.on('message', function(deltaTime, message) {

  // MIDI Thru (only notes on/off and cc1 and pitch bend on channels 1-15)
  if( (message[0] >= 144 && message[0] <= 158)
    || (message[0] >= 128 && message[0] <= 142)
    || (message[0] >= 176 && message[0] <= 190)
    || (message[0] >= 224 && message[0] <= 238) ) {
    midi_output.sendMessage(message);
  }

  // Play / Pause
  if(message[0] == 191 && message[1] == 77 && message[2] > 0) {
    midiren_play = false;
    midi_panic();
    current_pulse = 0;
    prog_spot = 0;
    current_chord = chord_progressions[current_chord_progression][prog_spot];
    current_root = pdata.root_note + chord_positions[current_chord];
  }
  if(message[0] == 191 && message[1] == 78 && message[2] > 0) {
    midiren_play = true;
  }

  // Set root note for any note coming in on channel 16
  if(message[0] == 159 && message[2] > 0) {
    pdata.root_note = message[1];
  }

  // Set chord progression
  if(message[0] == 191 && message[1] == 17 && message[2] > 0) {
    current_chord_progression = 0;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 18 && message[2] > 0) {
    current_chord_progression = 1;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 19 && message[2] > 0) {
    current_chord_progression = 2;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 80 && message[2] > 0) {
    current_chord_progression = 3;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 81 && message[2] > 0) {
    current_chord_progression = 4;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 82 && message[2] > 0) {
    current_chord_progression = 5;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 83 && message[2] > 0) {
    current_chord_progression = 6;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 12 && message[2] > 0) {
    current_chord_progression = 7;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 13 && message[2] > 0) {
    current_chord_progression = 8;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 46 && message[2] > 0) {
    current_chord_progression = 9;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 71 && message[2] > 0) {
    current_chord_progression = 10;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 72 && message[2] > 0) {
    current_chord_progression = 11;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 73 && message[2] > 0) {
    current_chord_progression = 12;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 74 && message[2] > 0) {
    current_chord_progression = 13;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 75 && message[2] > 0) {
    current_chord_progression = 14;
    prog_spot = 999;
  }
  if(message[0] == 191 && message[1] == 76 && message[2] > 0) {
    current_chord_progression = 15;
    prog_spot = 999;
  }

  // Get Pattern for Track 1
  if(message[0] == 191 && message[1] == 24) {
    selected_pattern_t1 = message[2];
  }
  if(message[0] == 191 && message[1] == 113 && message[2] > 0) {
    que_pattern_t1 = selected_pattern_t1;
  }
  // Get Random for Track 1
  if(message[0] == 191 && message[1] == 3) {
    current_rand_t1 = message[2];
  }

  // Get Pattern for Track 2
  if(message[0] == 191 && message[1] == 25) {
    selected_pattern_t2 = message[2];
  }
  if(message[0] == 191 && message[1] == 114 && message[2] > 0) {
    que_pattern_t2 = selected_pattern_t2;
  }
  // Get Random for Track 2
  if(message[0] == 191 && message[1] == 9) {
    current_rand_t2 = message[2];
  }

  // Get Pattern for Track 3
  if(message[0] == 191 && message[1] == 26) {
    selected_pattern_t3 = message[2];
  }
  if(message[0] == 191 && message[1] == 115 && message[2] > 0) {
    que_pattern_t3 = selected_pattern_t3;
  }
  // Get Pattern for Track 4
  if(message[0] == 191 && message[1] == 27) {
    selected_pattern_t4 = message[2];
  }
  if(message[0] == 191 && message[1] == 116 && message[2] > 0) {
    que_pattern_t4 = selected_pattern_t4;
  }
  // Get Pattern for Track 5
  if(message[0] == 191 && message[1] == 28) {
    selected_pattern_t5 = message[2];
  }
  if(message[0] == 191 && message[1] == 117 && message[2] > 0) {
    que_pattern_t5 = selected_pattern_t5;
  }
  // Get Pattern for Track 6
  if(message[0] == 191 && message[1] == 29) {
    selected_pattern_t6 = message[2];
  }
  if(message[0] == 191 && message[1] == 118 && message[2] > 0) {
    que_pattern_t6 = selected_pattern_t6;
  }

  // Get Note Pattern for Track 3
  if(message[0] == 191 && message[1] == 14) {
    que_note_t3 = message[2];
  }
  // Get Note Pattern for Track 4
  if(message[0] == 191 && message[1] == 15) {
    que_note_t4 = message[2];
  }
  // Get Note Pattern for Track 5
  if(message[0] == 191 && message[1] == 20) {
    que_note_t5 = message[2];
  }
  // Get Note Pattern for Track 6
  if(message[0] == 191 && message[1] == 21) {
    que_note_t6 = message[2];
  }

  // Sync to external BPM
  if(ext_bpm && message[0] == 248) {

    if(current_clock >= CLOCK_PER_CLICK) {

      current_clock = 0;
      //////////////////////
      // MIDI Logic Per Tick
      if(midiren_play){
        midi_logic_per_tick();
      }
    }
    current_clock++;

    if(bpm_clock == 24) {

      blink_bpm();
      bpm_clock = 0;
    }
    bpm_clock++;
  }
});

midi_input.openPort(UX16_midi_port);
midi_input.ignoreTypes(true, false, true);

init_preset();
mr_option_refresh();

var time = process.hrtime();
var midi_output_timeout;
var prev_tick = ms_per_tick();

if(!ext_bpm) {
  run_output_timeout(0);
}

// Close the port when done.
//midi_input.closePort();

// Close the port when done.
//midi_output.closePort();
