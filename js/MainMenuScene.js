function MainMenuScene(launchFlag) {
  this.modelview_matrix = mat4.create();
  this.projection_matrix = mat4.create();
  this.backgroundColor = [0.0, 0.0, 0.0, 0.5];

  // X size, Y size, Z size
  this.backgroundCubes = [];
  this.backgroundCubesDims = [8, 6, 10];
  this.backgroundCubesOffset = 0.0;
  this.backgroundCubesDeltas = [8.0, 8.0, 8.0];
  for (var i = 0; i < this.backgroundCubesDims[0]; ++i) {
    plane = [];
    for (var j = 0; j < this.backgroundCubesDims[1]; ++j) {
      row = [];
      for (var k = 0; k < this.backgroundCubesDims[2]; ++k) {
        row = row.concat([0]);
      }
      plane = plane.concat([row]);
    }
    this.backgroundCubes = this.backgroundCubes.concat([plane]);
  }

  this.menuItemHeight = 0.1;
  this.buttons = {main:{dimchoose   : new ColorTextRect("Start Game", 0.5, 0.6, 0.4, 0.1),
                        options : new ColorTextRect("Options",    0.5, 0.5, 0.4, 0.1),
                        about   : new ColorTextRect("About",      0.5, 0.4, 0.4, 0.1)},
                  about:  {back: new ColorTextRect("Back",      0.5, 0.15, 0.4, 0.1)},
                  options:{back: new ColorTextRect("Back",      0.5, 0.1, 0.4, 0.1)},
                  dimchoose:{
                    dim1: new ColorTextRect("1D",   0.5, 0.75, 0.4, 0.1),
                    dim2: new ColorTextRect("2D",   0.5, 0.65, 0.4, 0.1),
                    dim3: new ColorTextRect("3D",   0.5, 0.55, 0.4, 0.1),
                    dim4: new ColorTextRect("4D",   0.5, 0.45, 0.4, 0.1),
                    dim5: new ColorTextRect("5D",   0.5, 0.35, 0.4, 0.1),
                    confirm_challenge: new ColorTextRect("6D",   0.5, 0.25, 0.4, 0.1),
                    back: new ColorTextRect("Back", 0.5, 0.1, 0.4, 0.1)
                  },
                  gamechoose:{
                    "LAUNCH_2048/3x3x3":  new ColorTextRect("2048/3x3x3", 0.3, 0.7, 0.4, 0.1),
                    "LAUNCH_4096/3x3x3":  new ColorTextRect("4096/3x3x3", 0.3, 0.6, 0.4, 0.1),
                    "LAUNCH_8192/3x3x3":  new ColorTextRect("8192/3x3x3", 0.3, 0.5, 0.4, 0.1),
                    "LAUNCH_16384/3x3x3": new ColorTextRect("16384/3x3x3",0.3, 0.4, 0.4, 0.1),
                    "LAUNCH_2048/4x2x3":  new ColorTextRect("2048/4x2x3", 0.7, 0.7, 0.4, 0.1),
                    "LAUNCH_4096/4x2x3":  new ColorTextRect("4096/4x2x3", 0.7, 0.6, 0.4, 0.1),
                    "LAUNCH_8192/4x2x3":  new ColorTextRect("8192/4x2x3", 0.7, 0.5, 0.4, 0.1),
                    "LAUNCH_16384/4x2x3": new ColorTextRect("16384/4x2x3",0.7, 0.4, 0.4, 0.1),
                    back:            new ColorTextRect("Back",       0.5, 0.2, 0.4, 0.1),
                  },
                  dim1: {
                    "LAUNCH_32/7":  new ColorTextRect("32 challenge on line 7",  0.5, 0.7, 0.5, 0.1),
                    "LAUNCH_128/9": new ColorTextRect("128 challenge on line 9", 0.5, 0.6, 0.5, 0.1),
                    back:           new ColorTextRect("Back",  0.5, 0.4, 0.4, 0.1),
                  },
                  dim2: {
                    "LAUNCH_2048/4x4":   new ColorTextRect("Usual 2048 on 4x4",    0.5, 0.75, 0.5, 0.1),
                    "LAUNCH_4096/4x4":   new ColorTextRect("4096 on 4x4",          0.3, 0.65, 0.4, 0.1),
                    "LAUNCH_8192/4x4":   new ColorTextRect("8192 on 4x4",          0.7, 0.65, 0.4, 0.1),
                    "LAUNCH_1024/4x4/C": new ColorTextRect("1024 without central block", 0.5, 0.55, 0.5, 0.1),
                    "LAUNCH_2048/4x4/C": new ColorTextRect("2048 without central block", 0.5, 0.45, 0.5, 0.1),
                    "LAUNCH_256/4x4/E":  new ColorTextRect("256 on only edge blocks",    0.5, 0.35, 0.5, 0.1),
                    "LAUNCH_65536/5x5":  new ColorTextRect("65536 on 5x5",               0.5, 0.25, 0.5, 0.1),
                    back:           new ColorTextRect("Back",  0.5, 0.1, 0.4, 0.1),
                  },
                  dim3: {
                    "LAUNCH_4096/3x3x3":   new ColorTextRect("4096 challenge on 3x3x3",      0.5, 0.7, 0.6, 0.1),
                    "LAUNCH_4096/4x2x3":   new ColorTextRect("4096 challenge on 4x2x3",      0.5, 0.6, 0.6, 0.1),
                    "LAUNCH_2048/3x3x3/C": new ColorTextRect("2048 on 3x3x3 without center", 0.5, 0.5, 0.6, 0.1),
                    "LAUNCH_8192/4x4x4/C": new ColorTextRect("8192 on 4x4x4 without center", 0.5, 0.4, 0.6, 0.1),
                    back:           new ColorTextRect("Back",  0.5, 0.2, 0.4, 0.1),
                  },
                  dim4: {
                    "LAUNCH_2048/2x2x2x2":  new ColorTextRect("2048 challenge on 2x2x2x2",  0.5, 0.7, 0.5, 0.1),
                    "LAUNCH_4096/3x3x2x3":  new ColorTextRect("4096 challenge on 3x3x2x3",  0.5, 0.6, 0.5, 0.1),
                    back:           new ColorTextRect("Back",  0.5, 0.4, 0.4, 0.1),
                  },
                  dim5: {
                    "LAUNCH_4096/2x2x2x2x2":  new ColorTextRect("4096 challenge on 2x2x2x2x2",  0.5, 0.7, 0.6, 0.1),
                    back:           new ColorTextRect("Back",  0.5, 0.5, 0.4, 0.1),
                  },
                  confirm_challenge:{
                    dimchoose:                 new ColorTextRect("Decline",0.3, 0.2, 0.4, 0.1),
                    "LAUNCH_8192/2x2x2x2x2x2": new ColorTextRect("Accept" ,0.7, 0.2, 0.4, 0.1)
                  },
  };
  this.clearButtonsShininesses();

  this.menuHeaders = {
    main: "The power of Two",
    about: "About this game",
    options: "Options",
    dimchoose: "Choose your dimension",
    gamechoose: "Choose game type",
    dim1: "Choose 1D game type",
    dim2: "Choose 2D game type",
    dim3: "Choose 3D game type",
    dim4: "Choose 4D game type",
    dim5: "Choose 5D game type",
    confirm_challenge: "Are you sure?"};
  this.Mouse = {};
  this.Mouse.glX = 0.0;
  this.Mouse.glY = 0.0;

  this.selectedMenuItem = -1;
  // possible states: launch_appear, main_wait, fade_to, about_wait
  if (launchFlag == true) {
    this.sceneState = {state: "launch_appear", animation: 0.0};
  } else {
    this.sceneState = {state: "main_wait", animation: 0.0};
  }
}

MainMenuScene.prototype.clearButtonsShininesses = function() {
  for (var k in this.buttons) {
    for (var bn in this.buttons[k]) {
      this.buttons[k][bn].shininess = 0.0;
    }
  }
}

MainMenuScene.prototype.getRenderHUDSet = function() {
  switch(this.sceneState.state) {
    case 'launch_appear': return 'main';
    case 'main_wait': return 'main';
    case 'about_wait': return 'about';
    case 'options_wait': return 'options';
    case 'dimchoose_wait': return 'dimchoose';
    case 'confirm_challenge_wait': return 'confirm_challenge';
    case 'fade_to':
      switch(this.sceneState.from) {
        case 'main_wait': return 'main';
        case 'about_wait': return 'about';
        case 'options_wait': return 'options';
        case 'dimchoose_wait':  return 'dimchoose';
        case 'confirm_challenge_wait': return 'confirm_challenge';
        default: return this.sceneState.from;
      } break;
    default: return this.sceneState.state;
  }
}

MainMenuScene.prototype.handleKeyDown = function(event) {
  if (this.sceneState.state == "options_wait") {
    this.sceneState.optionsScreen.handleKeyDown(event);
  }
}

MainMenuScene.prototype.handleKeyUp = function(event) {
}

MainMenuScene.prototype.handleMouseDown = function(event) {
  this.selectedMenuItem = this.determineSelectedMenuItem();
  if (this.sceneState.state == "main_wait" || this.sceneState.state == "launch_appear") {
    if (this.selectedMenuItem != -1) {
      this.sceneState.from = "main_wait";
      this.sceneState.animation = 1.0 - this.sceneState.animation;
      this.sceneState.state = "fade_to";
      if (this.selectedMenuItem == "about") {
        this.sceneState.to = "about_wait";
      } else if (this.selectedMenuItem == "dimchoose") {
        this.sceneState.to = "dimchoose_wait";
      } else if (this.selectedMenuItem == "options") {
        this.sceneState.to = "options_wait";
      }
    }
  } else if (this.sceneState.state == "about_wait") {
    if (this.selectedMenuItem == "back") {
      this.sceneState.state = "fade_to";
      this.sceneState.to = "main_wait";
      this.sceneState.from = "about_wait";
      this.sceneState.animation = 1.0 - this.sceneState.animation;
    }
  } else if (this.sceneState.state == "options_wait") {
    if (this.selectedMenuItem == "back") {
      saveKeyboardSettings();
      this.sceneState.state = "fade_to";
      this.sceneState.to = "main_wait";
      this.sceneState.from = "options_wait";
      this.sceneState.animation = 1.0 - this.sceneState.animation;
    }
    this.sceneState.optionsScreen.handleMouseDown(event);
  } else if (this.sceneState.state == "gamechoose_wait") {
    if (this.selectedMenuItem != -1) {
      this.sceneState.from = "gamechoose_wait";
      this.sceneState.animation = 1.0 - this.sceneState.animation;
      this.sceneState.state = "fade_to";
      if (this.selectedMenuItem == "back") {
        this.sceneState.to = "main_wait";
      } else {
        this.sceneState.to = this.selectedMenuItem;
      }
    }
  } else if (this.sceneState.state == "dimchoose_wait") {
    if (this.selectedMenuItem!= -1) {
      this.sceneState.from = "dimchoose_wait";
      this.sceneState.animation = 1.0 - this.sceneState.animation;
      this.sceneState.state = "fade_to";
      if (this.selectedMenuItem == "back") {
        this.sceneState.to = "main_wait";
      } else if (this.selectedMenuItem == "confirm_challenge") {
        this.sceneState.to = "confirm_challenge_wait";
      } else {
        this.sceneState.to = this.selectedMenuItem;
      }
    }
  } else if (["dim1", "dim2", "dim3", "dim4", "dim5"].indexOf(this.sceneState.state) > -1) {
    if (this.selectedMenuItem!= -1) {
      this.sceneState.from = this.sceneState.state;
      this.sceneState.animation = 1.0 - this.sceneState.animation;
      this.sceneState.state = "fade_to";
      if (this.selectedMenuItem == "back") {
        this.sceneState.to = "dimchoose_wait";
      } else {
        this.sceneState.to = this.selectedMenuItem;
      }
    }
  } else if (this.sceneState.state == "confirm_challenge_wait") {
    if (this.selectedMenuItem!= -1) {
      this.sceneState.from = "confirm_challenge_wait";
      this.sceneState.animation = 1.0 - this.sceneState.animation;
      this.sceneState.state = "fade_to";
      if (this.selectedMenuItem == "dimchoose") {
        this.sceneState.to = "dimchoose_wait";
      } else {
        this.sceneState.to = this.selectedMenuItem;
      }
    }
  }
}

MainMenuScene.prototype.handleMouseUp = function(event) {
}

MainMenuScene.prototype.handleMouseMove = function(event) {
  var canvasRect = canvas.getBoundingClientRect();
  this.Mouse.glX = (event.clientX - canvasRect.left) / canvasRect.width;
  this.Mouse.glY = 1.0 - (event.clientY - canvasRect.top) / canvasRect.height;

  if (this.sceneState.state == "options_wait") {
    this.sceneState.optionsScreen.handleMouseMove(this.Mouse.glX, this.Mouse.glY);
  }
}

MainMenuScene.prototype.determineBackgroundCubesAlpha = function() {
  if (this.sceneState.state == "fade_to" && this.sceneState.to.indexOf("LAUNCH_") == 0) {
    return 1.0 - this.sceneState.animation;
  }
  return 1.0;
}

MainMenuScene.prototype.drawScene = function() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor.apply(gl, this.backgroundColor);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  this.drawBackgroundCubes(this.determineBackgroundCubesAlpha());
  this.drawHUDs();
}

MainMenuScene.prototype.drawBackgroundCubes = function(overallAlpha) {
  mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 300.0, this.projection_matrix);

  // render background cubes
  mat4.identity(this.modelview_matrix);
  mat4.translate(this.modelview_matrix, [0.0, 0.0, 0.0]);
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  gl.useProgram(Programs.cell);
  gl.enableVertexAttribArray(Programs.cell.attribs.pos);
  gl.enableVertexAttribArray(Programs.cell.attribs.tc);

  gl.uniformMatrix4fv(Programs.cell.uniforms.projection_matrix, false, this.projection_matrix);
  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(Programs.cell.uniforms.tex, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.cubeVertexPositionBuffer);
  gl.vertexAttribPointer(Programs.cell.attribs.pos, VBOs.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.cubeVertexTexCoordBuffer);
  gl.vertexAttribPointer(Programs.cell.attribs.tc, VBOs.cubeVertexTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VBOs.cubeIndexBuffer);
  var matrix = mat4.create();

  for (var i = 0; i < this.backgroundCubesDims[0]; ++i) {
    for (var j = 0; j < this.backgroundCubesDims[1]; ++j) {
      for (var k = 0; k < this.backgroundCubesDims[2]; ++k) {
        var currCube = this.backgroundCubes[i][j][k];
        if (currCube != 0) {
          gl.bindTexture(gl.TEXTURE_2D, Textures.getTextureForTile(currCube));
          var currAlpha = backgroundCubesAlphaFunc((this.backgroundCubesOffset + k) / this.backgroundCubesDims[2]) * 0.8;
          var col_num =  multiplyAlpha(colorInterp(Textures.getNumberColorForTile(currCube), this.backgroundColor, currAlpha), overallAlpha);
          var col_back = multiplyAlpha(colorInterp(Textures.getBackgroundColorForTile(currCube), this.backgroundColor, currAlpha), overallAlpha);
          //col_back[3] = col_num[3] = backgroundCubesAlphaFunc(this.backgroundCubesOffset);
          gl.uniform4fv(Programs.cell.uniforms.col_num, col_num);
          gl.uniform4fv(Programs.cell.uniforms.col_back, col_back);
          mat4.set(this.modelview_matrix, matrix);
          mat4.translate(matrix, [
              (-this.backgroundCubesDims[0]/2 + 0.5 + i) * this.backgroundCubesDeltas[0],
              (-this.backgroundCubesDims[1]/2 + 0.5 + j) * this.backgroundCubesDeltas[1],
              (-this.backgroundCubesDims[2] +
                 this.backgroundCubesDims[2] * backgroundCubesDepthEasing((k + this.backgroundCubesOffset)/this.backgroundCubesDims[2]) ) *
                 this.backgroundCubesDeltas[2]]);
          gl.uniformMatrix4fv(Programs.cell.uniforms.modelview_matrix, false, matrix);
          gl.drawElements(gl.TRIANGLES, VBOs.cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
      }
    }
  }
  gl.useProgram(null);
  gl.disable(gl.BLEND);
}

MainMenuScene.prototype.drawHUDs = function() {
  var fadeHUD = 1.0;
  if (this.sceneState.state == "launch_appear") {
    fadeHUD = launchAppearEasing(this.sceneState.animation);
  } else if (["main_wait", "about_wait", "dimchoose_wait", "options_wait", "confirm_challenge_wait",
              "dim1", "dim2", "dim3", "dim4", "dim5"].indexOf(this.sceneState.state) > -1) {
    fadeHUD = appearEasing(this.sceneState.animation);
  } else if (this.sceneState.state == "fade_to") {
    fadeHUD = fadeEasing(this.sceneState.animation);
  }

  var HUDSet = this.getRenderHUDSet();
  var renderButtons = this.buttons[HUDSet];
  var tileColorId = 8;
  for (var buttonName in renderButtons) {

    var col = TileColors[tileColorId].back;
    renderButtons[buttonName].color = [col[0], col[1], col[2], renderButtons[buttonName].shininess * fadeHUD];
    renderButtons[buttonName].textColor = [1.0, 1.0, 1.0, fadeHUD];
    // render quad
    renderButtons[buttonName].render();
    tileColorId *= 2;
  }
  FONT_RENDERER.renderText(this.menuHeaders[HUDSet], 0.5, 1.0, 0.18, [1.0, 1.0, 1.0, fadeHUD], {v:'up', h:'center'});
  FONT_RENDERER.renderText("Alexander Taran, Spring 2014", 1.0, 0.0, 0.05, [1.0, 1.0, 1.0, fadeHUD], {v:'down', h:'right'});

  if (HUDSet == "about") {
    aboutLines = ["This game is multidimensional generalization",
                  "of the famous 2048 game.",
                  "It's written on pure JavaScript using WebGL for 3 weeks.",
                  "Thanks to Gabriele Cirulli for the original idea.",
                  "Also, thanks to my friends for testing, feedback and some ideas.",
                  "",
                  "",
                  "Please, send some feedback to alex.y.taran@gmail.com"];
    for (var i = 0; i < aboutLines.length; ++i) {
      FONT_RENDERER.renderText(aboutLines[i], 0.1, 0.76 - 0.07*i, 0.07, [1.0, 1.0, 1.0, fadeHUD], {v:'down', h:'left'});
    }
  } else if (HUDSet == "options") {
    this.sceneState.optionsScreen.render(fadeHUD);
  } else if (HUDSet == "confirm_challenge") {
    FONT_RENDERER.renderText("This skill level isn't even remotely fair.", 0.5, 0.74, 0.08, [1.0, 1.0, 1.0, fadeHUD], {v:'down', h:'center'});
    //TODO: render pics using 'common' shader
    var aspectRatio = gl.viewportWidth / gl.viewportHeight; 
    var sz = 0.2;   
    renderTexturedQuad(Textures.okay,     [1.0, 1.0, 1.0, fadeHUD], 0.33-sz/aspectRatio, 0.5-sz, 0.33+sz/aspectRatio, 0.5+sz);
    renderTexturedQuad(Textures.accepted, [1.0, 1.0, 1.0, fadeHUD], 0.67-sz/aspectRatio, 0.5-sz, 0.67+sz/aspectRatio, 0.5+sz);
  }
}

MainMenuScene.prototype.determineSelectedMenuItem = function() {
  var buttonsList = null;
  if (this.sceneState.state == "launch_appear" || this.sceneState.state == "main_wait") {
    buttonsList = this.buttons.main;
  } else if (this.sceneState.state == "about_wait") {
    buttonsList = this.buttons.about;
  } else if (this.sceneState.state == "options_wait") {
    if (this.sceneState.optionsScreen.validateOptions()) {
      buttonsList = this.buttons.options;
    } else {
      return -1;
    }
  } else if (this.sceneState.state == "dimchoose_wait") {
    buttonsList = this.buttons.dimchoose;
  } else if (this.sceneState.state == "gamechoose_wait") {
    buttonsList = this.buttons.gamechoose;
  } else if (this.sceneState.state == "confirm_challenge_wait") {
    buttonsList = this.buttons.confirm_challenge;
  } else if (["dim1", "dim2", "dim3", "dim4", "dim5"].indexOf(this.sceneState.state) > -1) {
    buttonsList = this.buttons[this.sceneState.state];
  } else {
    return this.selectedMenuItem;
  }
  for (var buttonName in buttonsList) {
    var but = buttonsList[buttonName];
    if (but.isPointInRect(this.Mouse.glX, this.Mouse.glY)) {
      return buttonName;
    }
  }
  return -1;
}

MainMenuScene.prototype.animate = function(elapsed) {
  this.backgroundCubesOffset += elapsed / 1000.0;
  while (this.backgroundCubesOffset > 1.0) {
    this.backgroundCubesOffset -= 1.0;
    // here add new back background cubes layer
    for (var i = 0; i < this.backgroundCubesDims[0]; ++i) {
      for (var j = 0; j < this.backgroundCubesDims[1]; ++j) {
        // here update single row
        this.backgroundCubes[i][j].splice(this.backgroundCubes[i][j].length - 1);
        this.backgroundCubes[i][j] = [backgroundCubesDistribution()].concat(this.backgroundCubes[i][j]);
      }
    }
  }

  // animate fade menu items
  this.selectedMenuItem = this.determineSelectedMenuItem();
  var displayButtons = this.buttons[this.getRenderHUDSet()];
  for (var buttonName in displayButtons) {
    if (this.selectedMenuItem == buttonName) {
      displayButtons[buttonName].shininess = 1.0;
    } else {
      displayButtons[buttonName].shininess -= elapsed / 1000.;
      displayButtons[buttonName].shininess = Math.max(0.0, displayButtons[buttonName].shininess);
    }
  }
  /////
  if (this.sceneState.state == "launch_appear") {
    this.sceneState.animation += elapsed / 1000.0 / 2.0;
    if (this.sceneState.animation > 1.0) {
      this.sceneState.state = "main_wait";
      this.sceneState.animation = 1.0;
    }
  } else if (["main_wait", "about_wait", "options_wait", "dimchoose_wait", "confirm_challenge_wait",
              "dim1", "dim2", "dim3", "dim4", "dim5"].indexOf(this.sceneState.state) > -1) {
    this.sceneState.animation += elapsed / 1000.0;
    this.sceneState.animation = Math.min(1.0, this.sceneState.animation);
    if (this.sceneState.state == "options_wait") {
      this.sceneState.optionsScreen.animate(elapsed);
    }
  } else if (this.sceneState.state == "fade_to") {
    this.sceneState.animation += elapsed / 1000.0;
    if (this.sceneState.animation > 1.0) {
      this.sceneState.animation = 0.0;
      this.clearButtonsShininesses();
      if (this.sceneState.to.indexOf("LAUNCH_") == 0) {
        CURRENT_SCENE = createGameSceneByName(this.sceneState.to.substr("LAUNCH_".length));
        CURRENT_SCENE.gameRestart();
      } else {
        this.sceneState.state = this.sceneState.to;
        if (this.sceneState.state == "options_wait") {
          this.sceneState.optionsScreen = new OptionsScreen();
        }
      }
    }
  }
}


function backgroundCubesAlphaFunc (x) {
  if (x < 0.2) {
    return Math.sin(x / 0.2 * Math.PI / 2)
  } else if (x < 0.8) {
    return 1.0;
  } else {
    return Math.cos( (x - 0.8) / 0.2 * Math.PI / 2);
  }
}

function colorInterp(col1, col2, x) {
  var c = []
  for (var i = 0; i < 4; ++i) {
    c = c.concat(col1[i] * x + col2[i] * (1-x));
  }
  return c;
}

function backgroundCubesDistribution() {
  if (Math.random() < 0.7) {
    return 0;
  } else {
    var curr = 2;
    while (Math.random() < 0.4 && curr < 2048) {
      curr *= 2;
    }
    return curr;
  }
}

function backgroundCubesDepthEasing(x) {
  return Math.sqrt(x);
}

function launchAppearEasing(x) {
  if (x < 0.5) {
    return 0.0;
  } else {
    return Math.sin((x - 0.5)/ 0.5 * Math.PI / 2);
  }
}

function appearEasing(x) {
  return Math.sin(x * Math.PI / 2);
}

function fadeEasing(x) {
  return Math.cos(x * Math.PI / 2);
}
