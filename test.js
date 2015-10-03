var midi = require('midi');

var midi_input = new midi.input();

var input_port_count = midi_input.getPortCount();
for(var i = 0; i < input_port_count; i++) {

  var port_name = midi_input.getPortName(i);
  console.log(i+': '+midi_input.getPortName(i));
}

midi_input.on('message', function(deltaTime, message) {



});

midi_input.openPort(1);
midi_input.ignoreTypes(true, false, true);

midi_input.closePort();


var midi_output_2 = new midi.output();
midi_output_2.openPort(2);
midi_output_2.closePort();
var midi_output_3 = new midi.output();
midi_output_3.openPort(3);
midi_output_3.closePort();
var midi_output_4 = new midi.output();
midi_output_4.openPort(4);
midi_output_4.closePort();
var midi_output_5 = new midi.output();
midi_output_5.openPort(5);
midi_output_5.closePort();
var midi_output_6 = new midi.output();
midi_output_6.openPort(6);
midi_output_6.closePort();
var midi_output_7 = new midi.output();
midi_output_7.openPort(7);
midi_output_7.closePort();
