// MIDIRen Screens
var mrs = [];
for(var i = 0; i < 8; i++) {

  mrs[i] = [];
  for(var j = 0; j < 64; j++) {
    mrs[i][j] = 0;
  }
}

var mr_velocity_sn = 0;
var mr_pattern_sn = 1;
var mr_note_ran_sn = 2;
var mr_root_note_sn = 3;
var mr_chord_prog_sn = 4;
var mr_bpm_sn = 5;
var mr_preset_sn = 6;
var mr_drum_pad_sn = 7;

var mr_current_sn = 0;
var mr_current_msec = 0;

var presets = [
  {
    'track_velocity' : [127,127,127,127,127,127],
    'track_pattern' : [0,0,0,0,0,0],
    'track_note_ran' : [0,0,0,0,0,0],
    'root_note' : 48,
    'chord_prog' : 1,
    'bpm' : 120,
    'patterns' : {
      't1_bd' : [
        'x---x---x---x---',
        'x--x---x-x-x----',
        'x--x--x--x--x-x-',
        'x------x-x------',
        'x---x--x--x-----',
        'x--x--x-----x---',
        'x---x----x--x---',
        'x----x--x----x--'
      ],
      't1_sn' : [
        '----x-------x---',
        '----x-------x---',
        '----x--x--x-----',
        '---x--------x---',
        '----x---x---x---',
        '----x--x---x----',
        '-----x-------x--',
        '----x---x-------'
      ],
      't2' : [
        '---o--cc-o-o----',
        '---p-p-----p-p--',
        '--p-----y--p-p-p',
        '--------hhhhllll',
        'c-c-c-c-c-c-c-c-',
        '--o--coc--o--o-o',
        'c---c---c---c---',
        '--hh--l---h--l-l',
      ],
      't3' : [
        'x==>-xxxx==>-xxx',
        'x--xx--xxxxx-xxx',
        'x>-xx>-xx>-xx>-x',
        'x==>-x=>x==>-x=>',
        '--xxx>-xx>-xx>--',
        'xxxx----xxxx----',
        'x-x-x-x-x-x-x-x-',
        'xx--xx--xx--xx--'
      ],
      't4' : [
        'x==>-xxxx==>-xxx',
        'x--xx--xxxxx-xxx',
        'x>-xx>-xx>-xx>-x',
        'x==>-x=>x==>-x=>',
        '--xxx>-xx>-xx>--',
        'xxxx----xxxx----',
        'x-x-x-x-x-x-x-x-',
        'xx--xx--xx--xx--'
      ],
      't5' : [
        'x==>-xxxx==>-xxx',
        'x--xx--xxxxx-xxx',
        'x>-xx>-xx>-xx>-x',
        'x==>-x=>x==>-x=>',
        '--xxx>-xx>-xx>--',
        'xxxx----xxxx----',
        'x-x-x-x-x-x-x-x-',
        'xx--xx--xx--xx--'
      ],
      't6' : [
        'x==>-xxxx==>-xxx',
        'x--xx--xxxxx-xxx',
        'x>-xx>-xx>-xx>-x',
        'x==>-x=>x==>-x=>',
        '--xxx>-xx>-xx>--',
        'xxxx----xxxx----',
        'x-x-x-x-x-x-x-x-',
        'xx--xx--xx--xx--'
      ]
    },
    'notes' : {
      't3' : [
        '1111111111111111',
        '111r111r111r111r',
        '1124117111rr1111',
        '1113311113161711',
        '5115113112115181',
        '11rr11rr11rr11rr',
        '1r1r1r1r1r1r1r1r',
        'rrrrrrrrrrrrrrrr'
      ],
      't4' : [
        '1111322241113232',
        '2233344455422334',
        '6655655333444466',
        '7776666rr6377r88',
        '2377777662rr16rr',
        '9997888677756664',
        '1113222433354446',
        'rrrrrrrrrrrrrrrr'
      ],
      't5' : [
        '1123112346546542',
        '6767545565234354',
        '8985887767877566',
        '564r564r5687rr35',
        '11rr44rr11rr44rr',
        '9876543219876543',
        '1234566789123456',
        'rrrrrrrrrrrrrrrr'
      ],
      't6' : [
        '1234123412341234',
        '1234561234561234',
        '9876987698769876',
        '7654765476547654',
        '7654327654327654',
        '7733773388266444',
        '1r1r1r1r1r1r1r1r',
        'rrrrrrrrrrrrrrrr'
      ]
    }
  }
];

var selected_preset = 0;

// clone current preset into 'pdata'
var pdata = clone( presets[selected_preset] );

// Init velocity screen
for(var i = 0; i < 6; i++) {
  var m_cc = velocity_track_to_mr_cc(i + 1, pdata.track_velocity[i]);
  mr_set_velocity(m_cc);
}


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
var UX16_MIDI_IO_PORT = 1; // midi port UX16 happens to be on
var MIDIREN_MIDI_IO_PORT = 2; // midi port MIDIRen happens to be on
var MIDIREN_CHANNEL = 16;
var BEATS_PER_MEASURE = 4;
var BPM = 120;
var EXT_BPM = false;
var PPQ = 4; // Pulse Per Quarter-note (beat), 4 = sixteenth notes
var CLOCK_PPQ = 24; // PPQ of incoming MIDI timing clock messages
var CLOCK_PER_CLICK = Math.floor(CLOCK_PPQ / PPQ);
var MS_PER_TICK = 1000 / (BPM / 60) / PPQ;
var NS_PER_TICK = MS_PER_TICK * 1000000;
var NOTE_OFFSET = -12; // Notes away from chosen root note

var midi = require('midi'); // Include midi library

var midiren_play = false;

var current_clock = CLOCK_PER_CLICK;
var current_pulse = 0;
var root_note = 48;
var current_chord_progression = 1; // 0 to 47
var prog_spot = 0;
var current_chord = chord_progressions[current_chord_progression][prog_spot];
var current_root = root_note + chord_positions[current_chord];
