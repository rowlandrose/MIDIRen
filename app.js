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
  if(port_name.substr(0, 4) == 'UX16') {
    UX16_midi_port = i;
  } else if(port_name.substr(0, 14) == 'TeeOnArdu MIDI') {
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

    } else if(
      message[1] == 18 ||
      message[1] == 22 ||
      message[1] == 26 ||
      message[1] == 30 ||
      message[1] == 50 ||
      message[1] == 54 ||
      message[1] == 58 ||
      message[1] == 62
    ) {
      // pattern jump
      que_jump = message[1];
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
