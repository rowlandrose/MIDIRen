// Adafruit Untz (standard 4-trellis) as a controller for the MIDIRen sequencer
//   running on a Raspberry Pi 2
// https://github.com/rowlandrose/MIDIRen
// Simply sends midi cc values (0 to 63) at a value of 127 when pressed and 0
//   when released.
// LEDs will light up when the same midi cc is recieved via midi at a value of
//   127, and turn off at a value of 0.
// Instruction on building and setting up an Adafruit Untz to be a midi device:
// https://learn.adafruit.com/untztrument-trellis-midi-instrument/first-steps

#include <Wire.h>
#include <Adafruit_Trellis.h>
#include <Adafruit_UNTZtrument.h>

#define LED     13 // Pin for heartbeat LED (shows code is working)
#define CHANNEL 16  // MIDI channel number

// A standard UNTZtrument has four Trellises in a 2x2 arrangement
// (8x8 buttons total).  addr[] is the I2C address of the upper left,
// upper right, lower left and lower right matrices, respectively,
// assuming an upright orientation, i.e. labels on board are in the
// normal reading direction.
Adafruit_Trellis     T[4];
Adafruit_UNTZtrument untztrument(&T[0], &T[1], &T[2], &T[3]);
const uint8_t        addr[] = { 0x70, 0x71,
                                0x72, 0x73 };

#define N_BUTTONS ((sizeof(T) / sizeof(T[0])) * 16)

uint8_t       heart        = 0;  // Heartbeat LED counter
unsigned long prevReadTime = 0L; // Keypad polling timer

void setup() {
  pinMode(LED, OUTPUT);
  usbMIDI.setHandleControlChange(OnControlChange);
  untztrument.begin(addr[0], addr[1], addr[2], addr[3]);

#ifdef __AVR__
  // Default Arduino I2C speed is 100 KHz, but the HT16K33 supports
  // 400 KHz.  We can force this for faster read & refresh, but may
  // break compatibility with other I2C devices...so be prepared to
  // comment this out, or save & restore value as needed.
  TWBR = 12;
#endif
  untztrument.clear();
  untztrument.writeDisplay();
}

void loop() {
  unsigned long t = millis();
  if((t - prevReadTime) >= 20L) { // 20ms = min Trellis poll time
    if(untztrument.readSwitches()) { // Button state change?
      for(uint8_t i=0; i<N_BUTTONS; i++) { // For each button...


        if(untztrument.justPressed(i)) {
          usbMIDI.sendControlChange(i, 127, CHANNEL);
          //untztrument.setLED(i);
        } else if(untztrument.justReleased(i)) {
          usbMIDI.sendControlChange(i, 0, CHANNEL);
          //untztrument.clrLED(i);
        }
      }
      untztrument.writeDisplay();
    }
    prevReadTime = t;
    digitalWrite(LED, ++heart & 32); // Blink = alive
  }
  //while(usbMIDI.read()); // Discard incoming MIDI messages
  usbMIDI.read();
}

void OnControlChange(byte ch, byte control, byte value)
{
  if(ch == CHANNEL) {
    if(value > 0) {
      untztrument.setLED(control);
    } else {
      untztrument.clrLED(control);
    }
    untztrument.writeDisplay();
  }
}
