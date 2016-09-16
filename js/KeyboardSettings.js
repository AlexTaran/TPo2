var KeyboardSettings = {
  xPos: KeyCodes.rightArrow,
  xNeg: KeyCodes.leftArrow,
  yPos: KeyCodes.upArrow,
  yNeg: KeyCodes.downArrow,
  zPos: KeyCodes.pageUp,
  zNeg: KeyCodes.pageDown,
  a4Pos: 68, // D (like Right)
  a4Neg: 65, // A (like Left)
  a5Pos: 87, // W (like Up)
  a5Neg: 83, // S (like Down)
  a6Pos: 82, // R (like pageUp)
  a6Neg: 70, // F (like pageDown)
};


function saveKeyboardSettings() {
  set_cookie("KEYBOARD_SETTINGS", KeyboardSettings, 300);
}

function loadKeyboardSettings() {
  var settings = get_cookie("KEYBOARD_SETTINGS");
  if (settings != null) {
    KeyboardSettings = settings;
  }
}
