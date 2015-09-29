var midi = require('midi');

var midi_input = new midi.input();

var input_port_count = midi_input.getPortCount();
for(var i = 0; i < input_port_count; i++) {

  var port_name = midi_input.getPortName(i);
  console.log(i+': '+midi_input.getPortName(i));
}

midi_input.on('message', function(deltaTime, message) {

  console.log('here1');

});

midi_input.openPort(1);
midi_input.ignoreTypes(true, false, true);
