console.log('MIDIRen now running. Enjoy!');
//////////
// Include
var fs = require('fs');
eval(fs.readFileSync('./variables.js').toString());
eval(fs.readFileSync('./functions.js').toString());

var midi_output = new midi.output();
midi_output.openPort(MIDI_IO_PORT);

var midi_input = new midi.input();

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
    current_root = root_note + chord_positions[current_chord];
  }
  if(message[0] == 191 && message[1] == 78 && message[2] > 0) {
    midiren_play = true;
  }

  // Set root note for any note coming in on channel 16
  if(message[0] == 159 && message[2] > 0) {
    root_note = message[1];
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
  if(EXT_BPM && message[0] == 248) {

    if(current_clock == CLOCK_PER_CLICK) {

      current_clock = 0;
      //////////////////////
      // MIDI Logic Per Tick
      if(midiren_play){
        midi_logic_per_tick();
      }
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

// Close the port when done.
//midi_output.closePort();
