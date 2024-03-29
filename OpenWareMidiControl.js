var MIDI_SYSEX_MANUFACTURER        = 0x7d;     /* Educational or development use only */
var MIDI_SYSEX_OMNI_DEVICE         = 0x52;     /* OWL Open Ware Laboratory */
var MIDI_SYSEX_OWL_DEVICE          = 0x20;

var SYSEX_CONFIGURATION_AUDIO_RATE           = "FS"
var SYSEX_CONFIGURATION_AUDIO_BITDEPTH       = "BD"
var SYSEX_CONFIGURATION_AUDIO_DATAFORMAT     = "DF"
var SYSEX_CONFIGURATION_AUDIO_BLOCKSIZE      = "BS"
var SYSEX_CONFIGURATION_CODEC_SWAP           = "SW"
var SYSEX_CONFIGURATION_CODEC_BYPASS         = "BY"
var SYSEX_CONFIGURATION_CODEC_INPUT_GAIN     = "IG"
var SYSEX_CONFIGURATION_CODEC_OUTPUT_GAIN    = "OG"
var SYSEX_CONFIGURATION_CODEC_HIGHPASS       = "HP"
var SYSEX_CONFIGURATION_PC_BUTTON            = "PC"
var SYSEX_CONFIGURATION_INPUT_OFFSET         = "IO"
var SYSEX_CONFIGURATION_INPUT_SCALAR         = "IS"
var SYSEX_CONFIGURATION_OUTPUT_OFFSET        = "OO"
var SYSEX_CONFIGURATION_OUTPUT_SCALAR        = "OS"
var SYSEX_CONFIGURATION_MIDI_INPUT_CHANNEL   = "MI"
var SYSEX_CONFIGURATION_MIDI_OUTPUT_CHANNEL  = "MO"
var SYSEX_CONFIGURATION_BUS_ENABLE           = "BE"
var SYSEX_CONFIGURATION_BUS_FORWARD_MIDI     = "BM"

var OpenWareMidiSysexCommand = {
  SYSEX_PRESET_NAME_COMMAND       : 0x01,
  SYSEX_PARAMETER_NAME_COMMAND    : 0x02,
  SYSEX_CONFIGURATION_COMMAND     : 0x03,
  SYSEX_RESOURCE_NAME_COMMAND     : 0x04,
  SYSEX_DEVICE_RESET_COMMAND      : 0x7d,
  SYSEX_BOOTLOADER_COMMAND        : 0x7e,
  SYSEX_FIRMWARE_UPLOAD           : 0x10,
  SYSEX_FIRMWARE_STORE            : 0x11,
  SYSEX_FIRMWARE_RUN              : 0x12,
  SYSEX_FIRMWARE_FLASH            : 0x13,
  SYSEX_FLASH_ERASE               : 0x14,
  SYSEX_SETTINGS_RESET            : 0x15,
  SYSEX_SETTINGS_STORE            : 0x16,
  SYSEX_FIRMWARE_SAVE             : 0x17,
  SYSEX_FIRMWARE_SEND             : 0x18,
  SYSEX_FIRMWARE_VERSION          : 0x20,
  SYSEX_DEVICE_ID                 : 0x21,
  SYSEX_PROGRAM_MESSAGE           : 0x22,
  SYSEX_DEVICE_STATS              : 0x23,
  SYSEX_PROGRAM_STATS             : 0x24,
  SYSEX_BOOTLOADER_VERSION        : 0x25,
  SYSEX_PROGRAM_ERROR             : 0x30
};

/*
 MIDI Control Change Mappings
*/
var OpenWareMidiControl = {
  PATCH_PARAMETER_A      : 20, /* Parameter A */
  PATCH_PARAMETER_B      : 21, /* Parameter B */
  PATCH_PARAMETER_C      : 22, /* Parameter C */
  PATCH_PARAMETER_D      : 23, /* Parameter D */
  PATCH_PARAMETER_E      : 24, /* Expression pedal / input */
  PATCH_PARAMETER_F      : 1,  /* Extended parameter Modulation CC */
  PATCH_PARAMETER_G      : 12, /* Extended parameter Effect Ctrl 1 CC */
  PATCH_PARAMETER_H      : 13, /* Extended parameter Effect Ctrl 2 CC */

  PATCH_BUTTON           : 25, /* LED Pushbutton: 0=not pressed, 127=pressed */
  PATCH_CONTROL          : 26, /* Remote control: 0=local, 127=MIDI */
  PATCH_BUTTON_ON        : 27, /* Switch a button on: 0-127 button id */
  PATCH_BUTTON_OFF       : 28, /* Switch a button off: 0-127 button id */
  LED                    : 30, /* set/get LED value: 
				* 0-41 : off
				* 42-83 : green
				* 84-127 : red 
				*/
  LEFT_INPUT_GAIN        : 32, /* left channel input gain, -34.5dB to +12dB (92 : 0dB) */
  RIGHT_INPUT_GAIN       : 33,
  LEFT_OUTPUT_GAIN       : 34, /* left channel output gain, -73dB to +6dB (121 : 0dB) */
  RIGHT_OUTPUT_GAIN      : 35,
  LEFT_INPUT_MUTE        : 36, /* mute left input (127=muted) */
  RIGHT_INPUT_MUTE       : 37,
  LEFT_OUTPUT_MUTE       : 38, /* mute left output (127=muted) */
  RIGHT_OUTPUT_MUTE      : 39,

  REQUEST_SETTINGS       : 67, /* load settings from device (127=all settings) (30 for LED) (more to come) */
  SAVE_SETTINGS          : 68, /* save settings to device */
  FACTORY_RESET          : 70, /* reset all settings */
  DEVICE_STATUS          : 71,

  PATCH_PARAMETER_AA     : 75,
  PATCH_PARAMETER_AB     : 76,
  PATCH_PARAMETER_AC     : 77,
  PATCH_PARAMETER_AD     : 78,
  PATCH_PARAMETER_AE     : 79,
  PATCH_PARAMETER_AF     : 80,
  PATCH_PARAMETER_AG     : 81,
  PATCH_PARAMETER_AH     : 82,
  PATCH_PARAMETER_BA     : 83,
  PATCH_PARAMETER_BB     : 84,
  PATCH_PARAMETER_BC     : 85,
  PATCH_PARAMETER_BD     : 86,
  PATCH_PARAMETER_BE     : 87,
  PATCH_PARAMETER_BF     : 88,
  PATCH_PARAMETER_BG     : 89,
  PATCH_PARAMETER_BH     : 90,
  PATCH_PARAMETER_CA     : 91,
  PATCH_PARAMETER_CB     : 92,
  PATCH_PARAMETER_CC     : 93,
  PATCH_PARAMETER_CD     : 94,
  PATCH_PARAMETER_CE     : 95,
  PATCH_PARAMETER_CF     : 96,
  PATCH_PARAMETER_CG     : 97,
  PATCH_PARAMETER_CH     : 98,
  PATCH_PARAMETER_DA     : 99,
  PATCH_PARAMETER_DB     : 100,
  PATCH_PARAMETER_DC     : 101,
  PATCH_PARAMETER_DD     : 102,
  PATCH_PARAMETER_DE     : 103,
  PATCH_PARAMETER_DF     : 104,
  PATCH_PARAMETER_DG     : 105,
  PATCH_PARAMETER_DH     : 106
};
