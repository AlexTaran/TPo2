KeyboardInfo = {
  getKeyNameByCode: function(code) {
    if ( (code >= 'A'.charCodeAt(0) && code <= 'Z'.charCodeAt(0)) || 
         (code >= '0'.charCodeAt(0) && code <= '9'.charCodeAt(0))) {
      return String.fromCharCode(code);
    }
    switch(code) {
      case  8: return "Bksp";
      case  9: return "Tab";
      case 13: return "Enter";
      case 16: return "Shift";
      case 17: return "Ctrl";
      case 18: return "Alt";
      case 20: return "CapsLK";
      case 27: return "Esc";
      case 32: return "Space";
      case 33: return "PgUp";
      case 34: return "PgDown";
      case 35: return "End";
      case 36: return "Home";
      case 37: return "Left";
      case 38: return "Up";
      case 39: return "Right";
      case 40: return "Down";
      case 45: return "Ins";
      case 46: return "Del";
      default: return "#" + code.toString();
    }
  }
};
