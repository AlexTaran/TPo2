
function OptionsScreen(maxdim) {
  maxdim = typeof maxdim !== 'undefined' ? maxdim : 6;
  DIM2KEYS = {
    1:[
        {name: "-X", settingsName: "xNeg",  col: TileColors[  8].back.slice(0, 3), btn: new ColorTextRect("",0.35, 0.7, 0.3, 0.1)},
        {name: "+X", settingsName: "xPos",  col: TileColors[  8].back.slice(0, 3), btn: new ColorTextRect("",0.65, 0.7, 0.3, 0.1)}, 
      ],
    2:[
        {name: "-Y", settingsName: "yNeg",  col: TileColors[ 16].back.slice(0, 3), btn: new ColorTextRect("",0.35, 0.6, 0.3, 0.1)}, 
        {name: "+Y", settingsName: "yPos",  col: TileColors[ 16].back.slice(0, 3), btn: new ColorTextRect("",0.65, 0.6, 0.3, 0.1)}, 
      ],
    3:[
        {name: "-Z", settingsName: "zNeg",  col: TileColors[ 32].back.slice(0, 3), btn: new ColorTextRect("",0.35, 0.5, 0.3, 0.1)}, 
        {name: "+Z", settingsName: "zPos",  col: TileColors[ 32].back.slice(0, 3), btn: new ColorTextRect("",0.65, 0.5, 0.3, 0.1)}, 
      ],
    4:[
        {name: "-W", settingsName: "a4Neg", col: TileColors[ 64].back.slice(0, 3), btn: new ColorTextRect("",0.35, 0.4, 0.3, 0.1)}, 
        {name: "+W", settingsName: "a4Pos", col: TileColors[ 64].back.slice(0, 3), btn: new ColorTextRect("",0.65, 0.4, 0.3, 0.1)}, 
      ],
    5:[
        {name: "-V", settingsName: "a5Neg", col: TileColors[128].back.slice(0, 3), btn: new ColorTextRect("",0.35, 0.3, 0.3, 0.1)}, 
        {name: "+V", settingsName: "a5Pos", col: TileColors[128].back.slice(0, 3), btn: new ColorTextRect("",0.65, 0.3, 0.3, 0.1)}, 
      ],
    6:[
        {name: "-T", settingsName: "a6Neg", col: TileColors[256].back.slice(0, 3), btn: new ColorTextRect("",0.35, 0.2, 0.3, 0.1)}, 
        {name: "+T", settingsName: "a6Pos", col: TileColors[256].back.slice(0, 3), btn: new ColorTextRect("",0.65, 0.2, 0.3, 0.1)}, 
      ],
  };
  this.keysRedefines = [];
  for (var i = 1; i <= maxdim; ++i) {
    this.keysRedefines = this.keysRedefines.concat(DIM2KEYS[i]);
  }
  this.clearButtonsShininesses();
  this.calcButtonsNames();

  this.selectedOptionsItem = -1;

  // possible states: idle and wait_key
  this.optionsState = {state: "idle"};
};

OptionsScreen.prototype.validateOptions = function() {
  if (this.optionsState.state == "idle") {
    for (var i = 0; i < this.keysRedefines.length; ++i) {
      if (KeyboardSettings[this.keysRedefines[i].settingsName] == -1) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

OptionsScreen.prototype.render = function(alpha) {
  for (var i = 0; i < this.keysRedefines.length; ++i) {
    var button = this.keysRedefines[i].btn;
    var col = this.keysRedefines[i].col;
    var buttonAlphaBlinkKoef = 1.0;
    if (this.optionsState.state == "wait_key" && this.optionsState.optionId == i) {
      buttonAlphaBlinkKoef *= optionsButtonBlinkEasing(this.optionsState.animation);
    }
    button.color = [col[0], col[1], col[2], button.shininess * alpha * buttonAlphaBlinkKoef];
    button.textColor = [1.0, 1.0, 1.0, alpha * buttonAlphaBlinkKoef];
    button.render();
  }
  var optHeaderText = null;
  var optHeaderAlpha = alpha;
  if (this.optionsState.state == "idle") {
    if (this.validateOptions()) {
      optHeaderText = "Here you can redefine controls";
    } else {
      optHeaderText = "Please, click and define missing controls!";
    }
  } else {
    optHeaderText = "Press key to define control for " + this.keysRedefines[this.optionsState.optionId].name + " axis";
    optHeaderAlpha *= optionsHeaderEasing(this.optionsState.animation);
  }
  FONT_RENDERER.renderText(optHeaderText, 0.5, 0.76, 0.08, [1.0, 1.0, 1.0, optHeaderAlpha], {v:'down', h:'center'}); 
}

OptionsScreen.prototype.clearButtonsShininesses = function() {
  for (var i = 0; i < this.keysRedefines.length; ++i) {
    this.keysRedefines[i].btn.shininess = 0.0;
  }
}

OptionsScreen.prototype.handleMouseMove = function(glX, glY) {
  for (var i = 0; i < this.keysRedefines.length; ++i) {
    if (this.keysRedefines[i].btn.isPointInRect(glX, glY)) {
      this.selectedOptionsItem = i;
      return;
    }
  }
  this.selectedOptionsItem = -1;
}

OptionsScreen.prototype.handleMouseDown = function(event) {
  if (this.selectedOptionsItem == -1) {
    this.optionsState.state = "idle";
  } else {
    this.optionsState.state = "wait_key";
    this.optionsState.optionId = this.selectedOptionsItem;
    this.optionsState.animation = 0.0;
  }
}

OptionsScreen.prototype.handleKeyDown = function(event) {
  if (this.optionsState.state == "wait_key") {
    var settingsName = this.keysRedefines[this.optionsState.optionId].settingsName;
    KeyboardSettings[settingsName] = event.keyCode;
    for (var i = 0; i < this.keysRedefines.length; ++i) {
      if (i != this.optionsState.optionId && KeyboardSettings[this.keysRedefines[i].settingsName] == event.keyCode) {
        KeyboardSettings[this.keysRedefines[i].settingsName] = -1;
      }
    }
    this.calcButtonsNames();
    this.optionsState.state = "idle";
  }
}

OptionsScreen.prototype.calcButtonsNames = function() {
  for (var i = 0; i < this.keysRedefines.length; ++i) {
    this.keysRedefines[i].btn.axis_name = this.keysRedefines[i].name + " :";
    var key_code = KeyboardSettings[this.keysRedefines[i].settingsName];
    if (key_code != -1) {
      this.keysRedefines[i].btn.key_name = KeyboardInfo.getKeyNameByCode(key_code);
    } else {
      this.keysRedefines[i].btn.key_name = "";
    }
    this.keysRedefines[i].btn.margin = 0.05;
    this.keysRedefines[i].btn.renderText = function() {
      FONT_RENDERER.renderText(this.axis_name, this.x - this.width/2 + this.margin, this.y, this.height, this.textColor, {v:'center', h:'left'});
      FONT_RENDERER.renderText(this.key_name, this.x + this.width/2 - this.margin, this.y, this.height, this.textColor, {v:'center', h:'right'});
    }
  }
}

OptionsScreen.prototype.animate = function(elapsed) {
  for (var i = 0; i < this.keysRedefines.length; ++i) {
    if (i == this.selectedOptionsItem) {
      this.keysRedefines[i].btn.shininess = 1.0;
    } else {
      this.keysRedefines[i].btn.shininess -= elapsed / 1000.;
      this.keysRedefines[i].btn.shininess = Math.max(0.0, this.keysRedefines[i].btn.shininess);
    }
  }
  if (this.optionsState.state == "wait_key") {
    this.keysRedefines[this.optionsState.optionId].btn.shininess = 1.0;
    this.optionsState.animation += elapsed / 1000.0;
    while (this.optionsState.animation > 1.0) {
      this.optionsState.animation -= 1.0;
    }
  }
}

function optionsHeaderEasing(x) {
  return Math.sin(x * Math.PI);
}

function optionsButtonBlinkEasing(x) {
  return Math.sin(x * Math.PI) * 0.7 + 0.3;
}
