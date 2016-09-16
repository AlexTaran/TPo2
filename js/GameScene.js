function GameScene(gameName, dims, target, obstacles) {
  this.LOOK_MAX_LATITUDE = degToRad(60.0);
  this.MOUSE_SENSITIVITY = 0.004;

  this.gameName = gameName;
  this.dims = dims;
  this.target = target;
  this.obstacles = typeof obstacles !== 'undefined' ? obstacles : [];

  this.projector = createAppropriateProjector(this.dims);

  this.gameState = null;
  this.cellsAppear = null;
  this.scoreCounter = null;
  // possible values for state are: "game", "menu", "win", "fail", "options"
  // possible values for gamesubstate are: "wait", "animation"
  this.sceneState = {state: "game", gamesubstate: "wait"};

  this.lookRadius = {
    min:     this.projector.calcMinLookRadius(),
    current: this.projector.calcMinLookRadius() * 2,
    max:     this.projector.calcMinLookRadius() * 4,
    target:  this.projector.calcMinLookRadius() * 2,
  };

  this.lookLatitude = 0.0;
  this.lookLongtitude = 0.0;
  this.lookVelocityX = 0.0;
  this.lookVelocityY = 0.0;
  
  this.mvMatrix = mat4.create();
  this.pMatrix = mat4.create();
  
  this.currentlyPressedKeys = {};
  this.Mouse = {
    down: false,
    lastX: null,
    lastY: null,
    historyX: [],
    historyY: [],
    velocityX: null,
    velocityY: null
  };

  this.appearKoef = 0.0;
  this.buttons = [
    {name: "menu",    tileColorId: 32, shininess: 0.0, btn: new ColorTextRect("Menu/Pause", 0.875, 0.95, 0.25, 0.1)},
    {name: "tip",     tileColorId: 64, shininess: 0.0, btn: new ColorTextRect("Tip", 0.7, 0.95, 0.1, 0.1)},
  ];
  this.tipTimer = 8.0;
  if (this.dims.length >= 3) {
    this.buttons = this.buttons.concat([
      {name: "zoomIn",  tileColorId: 8,  shininess: 0.0, btn: new ColorTextRect("+", 0.925, 0.05, 0.05, 0.1)},
      {name: "zoomOut", tileColorId: 16, shininess: 0.0, btn: new ColorTextRect("-", 0.975, 0.05, 0.05, 0.1)},
    ]);
  }
  this.selectedButton = -1;

  this.buttonsLists = {
    menu: [
      {name: "resume",  tileColorId: 8,  shininess: 0.0, btn: new ColorTextRect("Resume",   0.5, 0.6, 0.4, 0.1)},
      {name: "restart", tileColorId: 16, shininess: 0.0, btn: new ColorTextRect("Restart",  0.5, 0.5, 0.4, 0.1)},
      {name: "options", tileColorId: 32, shininess: 0.0, btn: new ColorTextRect("Options",  0.5, 0.4, 0.4, 0.1)},
      {name: "endgame", tileColorId: 64, shininess: 0.0, btn: new ColorTextRect("End game", 0.5, 0.3, 0.4, 0.1)},
    ],
    win: [
      {name: "resume",   tileColorId: 128, shininess: 0.0, btn: new ColorTextRect("Continue playing", 0.5, 0.6, 0.4, 0.1)},
      {name: "restart",  tileColorId: 256, shininess: 0.0, btn: new ColorTextRect("Play again",       0.5, 0.5, 0.4, 0.1)},
      {name: "endgame",  tileColorId: 512, shininess: 0.0, btn: new ColorTextRect("Back to menu",     0.5, 0.4, 0.4, 0.1)},
      {name: "tweet",                      shininess: 0.0, btn: new ColorTextRect("Click to tweet!", 0.5, 0.2, 0.5, 0.1)},
    ],
    fail: [
      {name: "restart",  tileColorId: 128, shininess: 0.0, btn: new ColorTextRect("Try again",    0.5, 0.6, 0.4, 0.1)},
      {name: "endgame",  tileColorId: 256, shininess: 0.0, btn: new ColorTextRect("Back to menu", 0.5, 0.5, 0.4, 0.1)},
      {name: "tweet",                      shininess: 0.0, btn: new ColorTextRect("Click to tweet!", 0.5, 0.3, 0.5, 0.1)},
    ],
    options: [
      {name: "back", tileColorId: 8, shininess: 0.0, btn: new ColorTextRect("Back", 0.5, 0.1, 0.4, 0.1)},
    ],
  };

}

GameScene.prototype.getCurrentRenderingButtonList = function() {
  if (this.sceneState.state in this.buttonsLists) {
    return this.buttonsLists[this.sceneState.state];
  } else {
    return [];
  }
}

GameScene.prototype.calcMenuAlpha = function() {
  if (["menu", "win", "fail", "options"].indexOf(this.sceneState.state) > -1) {
    if (this.sceneState.substate == "appearing") {
      return this.sceneState.animation;
    } else if (this.sceneState.substate == "wait") {
      return 1.0;
    } else if (this.sceneState.substate == "fading") {
      return 1.0 - this.sceneState.animation;
    }
  } else {
    return 0.0;
  }
};

// All except menu :)
GameScene.prototype.calcOverallAlpha = function() {
  var overallAlpha = null;
  if (["menu", "win", "fail"].indexOf(this.sceneState.state) > -1) {
    if (this.sceneState.substate == "appearing") {
      if (this.sceneState.pressedButtonName == "back") {
        overallAlpha = 0.2; // if we go from options, screen is already shadowed
      } else {
        overallAlpha = 1.0 - this.sceneState.animation * 0.8;
      }
    } else if (this.sceneState.substate == "wait") {
      overallAlpha = 0.2;
    } else if (this.sceneState.substate == "fading") {
      if (this.sceneState.pressedButtonName == "resume") {
        overallAlpha = 0.2 + this.sceneState.animation * 0.8;
      } else if (this.sceneState.pressedButtonName == "restart") {
        overallAlpha = 0.2 - this.sceneState.animation * 0.2;
      } else if (this.sceneState.pressedButtonName == "options") {
        overallAlpha = 0.2;
      } else if (this.sceneState.pressedButtonName == "endgame") {
        overallAlpha = 0.2 - this.sceneState.animation * 0.2;
      }
    }
  } else if (this.sceneState.state == "game") {
    overallAlpha = 1.0;
  } else if (this.sceneState.state == "options") {
    overallAlpha = 0.2;
  }
  overallAlpha *= gameAppearEasing(this.appearKoef);
  return overallAlpha;
}

GameScene.prototype.calcArrowUpDirection = function() {
  var d45 = Math.PI / 4;
  if (this.lookLongtitude <= d45 || this.lookLongtitude > d45 * 7) {
    return {axisId:2, dir: -1};
  } else if (this.lookLongtitude > d45 && this.lookLongtitude <= d45 * 3) {
    return {axisId:0, dir: 1};
  } else if (this.lookLongtitude > d45 * 3 && this.lookLongtitude <= d45 * 5) {
    return {axisId:2, dir: 1};
  } else {
    return {axisId:0, dir: -1};
  }
}

GameScene.prototype.calc4thPositiveDirectionIn4D = function() {
  if (this.lookLongtitude <= Math.PI) {
    return {axisId:3, dir: 1};
  } else {
    return {axisId:3, dir: -1};
  }
}

GameScene.prototype.handleKeyDown = function(event) {
  this.currentlyPressedKeys[event.keyCode] = true;
  //console.log(event.keyCode);
  if (this.sceneState.state == "game" && this.sceneState.gamesubstate == "wait") {
    moveKeys = {}
    if (this.dims.length == 2) {
      moveKeys[KeyboardSettings.xPos] = {axisId:0, dir: 1};
      moveKeys[KeyboardSettings.xNeg] = {axisId:0, dir:-1};
      moveKeys[KeyboardSettings.yPos] = {axisId:1, dir: 1};
      moveKeys[KeyboardSettings.yNeg] = {axisId:1, dir:-1};
    } else if (this.dims.length >= 3) {
      moveKeys[KeyboardSettings.zPos] = {axisId:1,dir: 1};
      moveKeys[KeyboardSettings.zNeg] = {axisId:1,dir:-1};
      moveKeys[KeyboardSettings.yPos] = this.calcArrowUpDirection();
      moveKeys[KeyboardSettings.yNeg] = this.calcArrowDownDirection();
      moveKeys[KeyboardSettings.xPos] = this.calcArrowRightDirection();
      moveKeys[KeyboardSettings.xNeg] = this.calcArrowLeftDirection();
      if (this.dims.length == 4) {
        var mk = this.calc4thPositiveDirectionIn4D();
        moveKeys[KeyboardSettings.a4Pos] = mk;
        moveKeys[KeyboardSettings.a4Neg] = {axisId:mk.axisId,dir:(-1)*mk.dir};
      } else if (this.dims.length >= 5) {
        var a4Pos = this.calcArrowRightDirection(); 
        a4Pos.axisId = (a4Pos.axisId==0)?3:4;
        moveKeys[KeyboardSettings.a4Pos] = a4Pos;
        moveKeys[KeyboardSettings.a4Neg] = {axisId:a4Pos.axisId,dir:(-1)*a4Pos.dir};
        var a5Pos = this.calcArrowUpDirection(); 
        a5Pos.axisId = (a5Pos.axisId==0)?3:4;
        moveKeys[KeyboardSettings.a5Pos] = a5Pos;
        moveKeys[KeyboardSettings.a5Neg] = {axisId:a5Pos.axisId,dir:(-1)*a5Pos.dir};
        if (this.dims.length == 6) {
          moveKeys[KeyboardSettings.a6Pos] = {axisId:5,dir: 1};
          moveKeys[KeyboardSettings.a6Neg] = {axisId:5,dir:-1};
        }
      }
    }
    if (event.keyCode in moveKeys) {
      this.sceneState.dir = moveKeys[event.keyCode].dir;
      this.sceneState.axisId = moveKeys[event.keyCode].axisId;
      this.sceneState.interp = this.gameState.moveInterpolate(this.sceneState.axisId, this.sceneState.dir);
      if (!this.sceneState.interp.allZero) {
        this.sceneState.gamesubstate = "animation";
        this.sceneState.animation = 0.0;
      }
    }
  } else if (this.sceneState.state == "options") {
    this.sceneState.optionsScreen.handleKeyDown(event);
  }
}

GameScene.prototype.handleKeyUp = function(event) {
  this.currentlyPressedKeys[event.keyCode] = false;
}

GameScene.prototype.handleMouseDown = function(event) {
  this.Mouse.down = true;
  if (this.sceneState.state == "game") {
    this.Mouse.lastX = event.clientX;
    this.Mouse.lastY = event.clientY;
    var timeNow = new Date().getTime();
    this.Mouse.historyX = [{x: this.Mouse.lastX, t: timeNow}];
    this.Mouse.historyY = [{x: this.Mouse.lastY, t: timeNow}];
    this.lookVelocityX = 0.0;
    this.lookVelocityY = 0.0;
    if (this.selectedButton != -1) {
      if (this.buttons[this.selectedButton].name == "menu") {
        this.sceneState.state = "menu";
        this.sceneState.substate = "appearing";
        this.sceneState.animation = 0.0;
        for (var i = 0; i < this.buttonsLists.menu.length; ++i) {
          this.buttonsLists.menu[i].shininess = 0.0;
        }
        this.selectedButton = -1;
      } else if (this.buttons[this.selectedButton].name == "tip") {
        this.tipTimer = 8.0;
      }
    }
  } else if (["menu", "fail", "win", "options"].indexOf(this.sceneState.state) > -1) {
    var buttonList = this.getCurrentRenderingButtonList();
    if (this.selectedButton != -1 && ["appearing", "wait"].indexOf(this.sceneState.substate) > -1) {
      this.sceneState.pressedButtonName = buttonList[this.selectedButton].name;
      if (this.sceneState.pressedButtonName == "tweet") {
        if (this.sceneState.state == "win") {
          window.open(this.generateTweetURL(true), "_blank");
        } else if (this.sceneState.state == "fail") {
          window.open(this.generateTweetURL(false), "_blank");
        }
      } else {
        this.sceneState.substate = "fading";
        this.sceneState.animation = 0.0;
        this.selectedButton = -1;
      }
    }
    if (this.sceneState.state == "options") {
      this.sceneState.optionsScreen.handleMouseDown(event);
    }
  }
}

GameScene.prototype.generateTweetURL = function(winFlag) {
  var original_referer = encodeURIComponent("http://alextaran.net/webgl/TPo2.html");
  var url = original_referer;
  var text = encodeURIComponent("I've scored " + this.scoreCounter.target + " points in " + this.gameName + " TPo2 challenge! Try you too! #TPo2 at");
  if (winFlag) {
    text = encodeURIComponent("I've successfully completed " + this.gameName + " TPo2 challenge! Try you too! #TPo2 at");
  }
  return "https://twitter.com/intent/tweet?original_referer=" + original_referer + "&text=" + text + "&tw_p=tweetbutton&url=" + url + "&via=Alex_MIPT";
}

GameScene.prototype.handleMouseUp = function(event) {
  this.Mouse.down = false;

  if (this.sceneState.state == "game") {
    this.lookVelocityX = 0.0;
    this.lookVelocityY = 0.0;
    var timeNow = new Date().getTime();
    while(this.Mouse.historyX.length > 1 && (timeNow - this.Mouse.historyX[0].t) / 1000. > 0.05) {
      this.Mouse.historyX.splice(0, 1);
      this.Mouse.historyY.splice(0, 1);
    }
    if (this.Mouse.historyX.length > 1) {
      var avgX = 0.0;
      var avgY = 0.0;
      var avgT = 0.0;
      for (var i = 1; i < this.Mouse.historyX.length; ++i) {
        avgX += this.Mouse.historyX[i].x - this.Mouse.historyX[i-1].x;
        avgT += this.Mouse.historyX[i].t - this.Mouse.historyX[i-1].t;
        avgY += this.Mouse.historyY[i].x - this.Mouse.historyY[i-1].x;
      }
      this.Mouse.historyX.splice(0, 1);
      this.Mouse.historyY.splice(0, 1);
      avgX /= this.Mouse.historyX.length;
      avgY /= this.Mouse.historyX.length;
      avgT /= this.Mouse.historyX.length;
      if (avgT > 1e-5) {;
        this.lookVelocityX = avgX / avgT;
        this.lookVelocityY = avgY / avgT;
      }
      this.lookVelocityX = Math.min(5.0, this.lookVelocityX);
      this.lookVelocityY = Math.min(5.0, this.lookVelocityY);
    }
  } else if (["menu", "win", "fail"].indexOf(this.sceneState.state) > -1) {
    //TODO
  }
}

GameScene.prototype.updateSelectedButton = function() {
  this.selectedButton = -1;
  var buttonList = null;
  if (this.sceneState.state == "game") {
    buttonList = this.buttons;
  } else if (["menu", "win", "fail", "options"].indexOf(this.sceneState.state) > -1) {
    if (this.sceneState.substate == "fading") {
      return;
    }
    if (this.sceneState.state == "options" && this.sceneState.optionsScreen.validateOptions() == false) {
      buttonList = [];
    } else {
      buttonList = this.getCurrentRenderingButtonList();
    }
  }
  if (buttonList != null) {
    for (var i = 0; i < buttonList.length; ++i) {
      if (buttonList[i].btn.isPointInRect(this.Mouse.glX, this.Mouse.glY)) {
        this.selectedButton = i;
        return;
      }
    }
  }
}

GameScene.prototype.handleMouseMove = function(event) {
  var canvasRect = canvas.getBoundingClientRect();
  this.Mouse.glX = (event.clientX - canvasRect.left) / canvasRect.width;
  this.Mouse.glY = 1.0 - (event.clientY - canvasRect.top) / canvasRect.height;
  this.updateSelectedButton();

  if (this.sceneState.state == "game") {
    // Handle rotation
    if (!this.Mouse.down && this.selectedButon != -1) {
      this.Mouse.lastX = event.clientX;
      this.Mouse.lastY = event.clientY;
      return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - this.Mouse.lastX;
    var deltaY = newY - this.Mouse.lastY;

    this.lookLatitude += deltaY * this.MOUSE_SENSITIVITY;
    if (this.lookLatitude > this.LOOK_MAX_LATITUDE) {
      this.lookLatitude = this.LOOK_MAX_LATITUDE;
    }
    if (this.lookLatitude < -this.LOOK_MAX_LATITUDE) {
      this.lookLatitude = -this.LOOK_MAX_LATITUDE;
    }

    this.lookLongtitude += deltaX * this.MOUSE_SENSITIVITY;
    while (this.lookLongtitude < 0.0) {
      this.lookLongtitude += 2 * Math.PI;
    }
    while (this.lookLongtitude > 2 * Math.PI) {
      this.lookLongtitude -= 2 * Math.PI;
    }

    this.Mouse.lastX = newX;
    this.Mouse.lastY = newY;

    var timeNow = new Date().getTime();
    this.Mouse.historyX = this.Mouse.historyX.concat([{x: this.Mouse.lastX, t: timeNow}]);
    this.Mouse.historyY = this.Mouse.historyY.concat([{x: this.Mouse.lastY, t: timeNow}]);
    while (this.Mouse.historyX.length > 1 && (timeNow - this.Mouse.historyX[0].t) / 1000. > 0.2) {
      this.Mouse.historyX.splice(0, 1);
      this.Mouse.historyY.splice(0, 1);
    }
  } else if (["menu", "win", "fail"].indexOf(this.sceneState.state) > -1) {
    // TODO
  } else if (this.sceneState.state == "options") {
    this.sceneState.optionsScreen.handleMouseMove(this.Mouse.glX, this.Mouse.glY);
  }
}

GameScene.prototype.calcArrowDownDirection = function() {
  var o = this.calcArrowUpDirection();
  o.dir *= -1;
  return o;
}

GameScene.prototype.calcArrowRightDirection = function() {
  var o = this.calcArrowUpDirection();
  o.axisId = 2 - o.axisId;
  o.dir *= -1 * (1 - o.axisId);
  return o;
}

GameScene.prototype.calcArrowLeftDirection = function() {
  var o = this.calcArrowRightDirection();
  o.dir *= -1;
  return o;
}

GameScene.prototype.renderGameState = function(gameState, overallAlpha) {
  var matrix = mat4.create();
  gl.useProgram(Programs.cellinterp);
  gl.enableVertexAttribArray(Programs.cellinterp.attribs.pos);
  gl.enableVertexAttribArray(Programs.cellinterp.attribs.tc);

  gl.uniformMatrix4fv(Programs.cellinterp.uniforms.projection_matrix, false, this.pMatrix);
  gl.uniform1i(Programs.cellinterp.uniforms.tex1, 0);
  gl.uniform1i(Programs.cellinterp.uniforms.tex2, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.cubeVertexPositionBuffer);
  gl.vertexAttribPointer(Programs.cellinterp.attribs.pos, VBOs.cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.cubeVertexTexCoordBuffer);
  gl.vertexAttribPointer(Programs.cellinterp.attribs.tc, VBOs.cubeVertexTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, VBOs.cubeIndexBuffer);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var iterFlag = true;
  for (var idx = zeroArray(this.gameState.dims.length); iterFlag; iterFlag = multiIndexIncrement(idx, this.gameState.dims)) {
    cell = this.gameState.getAt(idx);
    if (cell < 0) {
      continue;
    }
    var flattenedAddr = gameState.flattenAddr(idx);
    var interp = null;
    if (this.sceneState.gamesubstate == "animation") {
      interp = this.sceneState.interp[flattenedAddr];
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, Textures.getTextureForTile(0));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, Textures.getTextureForTile(0));
    gl.uniform4fv(Programs.cellinterp.uniforms.col_num1,  multiplyAlpha(Textures.getNumberColorForTile(0),     overallAlpha));
    gl.uniform4fv(Programs.cellinterp.uniforms.col_back1, multiplyAlpha(Textures.getBackgroundColorForTile(0), overallAlpha));
    gl.uniform4fv(Programs.cellinterp.uniforms.col_num2,  multiplyAlpha(Textures.getNumberColorForTile(0),     overallAlpha));
    gl.uniform4fv(Programs.cellinterp.uniforms.col_back2, multiplyAlpha(Textures.getBackgroundColorForTile(0), overallAlpha));
    gl.uniform1f(Programs.cellinterp.uniforms.interp, 0.0);
    mat4.set(this.mvMatrix, matrix);
    var src_position = this.projector.project(idx);
    mat4.translate(matrix, src_position);
    mat4.scale(matrix, rep3(0.25));
    gl.uniformMatrix4fv(Programs.cellinterp.uniforms.modelview_matrix, false, matrix);
    gl.drawElements(gl.TRIANGLES, VBOs.cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    if (cell != 0) {
      mat4.scale(matrix, rep3(4.0));
      mat4.scale(matrix, rep3(this.cellsAppear[flattenedAddr]));
      var animKoef = 0.0;
      var dst_position = src_position.concat(); // just copying
      if (this.sceneState.gamesubstate == "animation") {
        var dst_idx = idx.concat(); // copy
        dst_idx[this.sceneState.axisId] += interp.offset;
        dst_position = this.projector.project(dst_idx);
        animKoef = Math.sin(Math.PI / 2 * this.sceneState.animation);
      }
      mat4.translate(matrix, [
          (dst_position[0] - src_position[0]) * animKoef,
          (dst_position[1] - src_position[1]) * animKoef,
          (dst_position[2] - src_position[2]) * animKoef]);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, Textures.getTextureForTile(cell));
      gl.uniform4fv(Programs.cellinterp.uniforms.col_num1,  multiplyAlpha(Textures.getNumberColorForTile(cell),     overallAlpha));
      gl.uniform4fv(Programs.cellinterp.uniforms.col_back1, multiplyAlpha(Textures.getBackgroundColorForTile(cell), overallAlpha));
      gl.activeTexture(gl.TEXTURE1);
      if (interp != null && interp.merge == true) {
        mat4.scale(matrix, rep3(scaleAnimationEasing(this.sceneState.animation)));
        gl.bindTexture(gl.TEXTURE_2D, Textures.getTextureForTile(cell * 2));
        gl.uniform4fv(Programs.cellinterp.uniforms.col_num2,  multiplyAlpha(Textures.getNumberColorForTile(cell * 2),     overallAlpha));
        gl.uniform4fv(Programs.cellinterp.uniforms.col_back2, multiplyAlpha(Textures.getBackgroundColorForTile(cell * 2), overallAlpha));
        gl.uniform1f(Programs.cellinterp.uniforms.interp, mergeInterpolationEasing(this.sceneState.animation));
      } else {
        gl.bindTexture(gl.TEXTURE_2D, Textures.getTextureForTile(cell));
        gl.uniform4fv(Programs.cellinterp.uniforms.col_num2,  multiplyAlpha(Textures.getNumberColorForTile(cell),     overallAlpha));
        gl.uniform4fv(Programs.cellinterp.uniforms.col_back2, multiplyAlpha(Textures.getBackgroundColorForTile(cell), overallAlpha));
        gl.uniform1f(Programs.cellinterp.uniforms.interp, 0.0);
      }
      gl.uniformMatrix4fv(Programs.cellinterp.uniforms.modelview_matrix, false, matrix);
      gl.drawElements(gl.TRIANGLES, VBOs.cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
  }
  gl.disable(gl.BLEND);
  gl.useProgram(null);
}

function multiplyAlpha(color, ka) {
  return [color[0], color[1], color[2], color[3] * ka];
}

	   
GameScene.prototype.drawScene = function() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0.0, 0.0, 0.0, 0.5);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //renderBasis();
  var aspectRatio = gl.viewportWidth / gl.viewportHeight 
  var overallAlpha = this.calcOverallAlpha();
  this.projector.calcProjectionMatrix(this.pMatrix);
  mat4.identity(this.mvMatrix);
  if (this.dims.length >= 3) {
    mat4.translate(this.mvMatrix, [0.0, 0.0, -this.lookRadius.current]);
    mat4.rotate(this.mvMatrix, this.lookLongtitude, [0, 1, 0]);
    mat4.rotate(this.mvMatrix, this.lookLatitude,   [Math.cos(this.lookLongtitude), 0, Math.sin(this.lookLongtitude)]);
    this.renderGameState(this.gameState, overallAlpha);
    FONT_RENDERER.renderText("Zoom:", 0.895, 0.0, 0.1, [1.0, 1.0, 1.0, overallAlpha], {v: "down", h: "right"});
  } else if (this.dims.length <= 2) {
    //mat4.ortho(-aspectRatio, aspectRatio, -1.0, 1.0, -0.5, 0.5, this.pMatrix);
    mat4.identity(this.mvMatrix);
    this.renderGameState(this.gameState, overallAlpha);
  }

  FONT_RENDERER.renderText("You are playing " + this.gameName + " challenge", 0.01, 0.99, 0.07, [1.0, 1.0, 1.0, overallAlpha], {v: "up", h: "left"});
  this.renderScoreCounter(overallAlpha);
  this.renderTip(tipEasing(this.tipTimer) * overallAlpha);

  for (var i = 0; i < this.buttons.length; ++i) {
    var col = Textures.getBackgroundColorForTile(this.buttons[i].tileColorId);
    this.buttons[i].btn.color = [col[0], col[1], col[2], this.buttons[i].shininess * overallAlpha];
    this.buttons[i].btn.textColor[3] = overallAlpha;
    this.buttons[i].btn.render();
  }

  var buttonsList = this.getCurrentRenderingButtonList();

  var menuAlpha = this.calcMenuAlpha(); 
  for (var i = 0; i < buttonsList.length; ++i) {
    if (buttonsList[i].name == "tweet") { // this is very special button :)
      var col = [0.33, 0.67, 0.93]; // true twitter color
      buttonsList[i].btn.color = [col[0], col[1], col[2], (0.6 + buttonsList[i].shininess * 0.4) * menuAlpha];
    } else {
      var col = Textures.getBackgroundColorForTile(buttonsList[i].tileColorId);
      buttonsList[i].btn.color = [col[0], col[1], col[2], buttonsList[i].shininess * menuAlpha];
    }
    buttonsList[i].btn.textColor[3] = menuAlpha;
    buttonsList[i].btn.render();
  }
  if (this.sceneState.state == "menu") {
    FONT_RENDERER.renderText("Pause", 0.5, 0.8, 0.2, [1.0, 1.0, 1.0, menuAlpha], {v: "center", h: "center"});
  } else if (this.sceneState.state == "win") {
    FONT_RENDERER.renderText("CHALLENGE COMPLETED!", 0.5, 0.8, 0.2, [1.0, 1.0, 1.0, menuAlpha], {v: "center", h: "center"});
    FONT_RENDERER.renderText(this.scoreCounter.target, 0.5, 0.2, 0.2, [1.0, 1.0, 1.0, menuAlpha], {v: "center", h: "center"});
  } else if (this.sceneState.state == "fail") {
    var failText = "Fail :(";
    if (this.gameState.isSoClose()) {
      failText = "So close! ;)";
    }
    FONT_RENDERER.renderText(failText, 0.5, 0.8, 0.2, [1.0, 1.0, 1.0, menuAlpha], {v: "center", h: "center"});
    FONT_RENDERER.renderText(this.scoreCounter.target, 0.5, 0.2, 0.2, [1.0, 1.0, 1.0, menuAlpha], {v: "center", h: "center"});
  } else if (this.sceneState.state == "options") {
    FONT_RENDERER.renderText("Options", 0.5, 1.0, 0.18, [1.0, 1.0, 1.0, menuAlpha], {v:'up', h:'center'});
    this.sceneState.optionsScreen.render(menuAlpha);
  }
}

GameScene.prototype.renderScoreCounter = function(alpha) {
  var FONT_SIZE = 0.1;
  var PREFIX = "Score: ";
  FONT_RENDERER.renderText(PREFIX + this.scoreCounter.current.toString(), 0.01, 0.0, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "down", h: "left"});
  for (var i = 0; i < this.scoreCounter.flyingPoints.length; ++i) {
    var params = this.scoreCounter.flyingPoints[i];
    FONT_RENDERER.renderText("+" + params.points.toString(), 0.01 + FONT_RENDERER.measureText(PREFIX, FONT_SIZE), FONT_SIZE + params.animation * 0.1, FONT_SIZE,
        multiplyAlpha(params.color, alpha * (1.0 - params.animation)), {v: "down", h: "left"});
  }
}

GameScene.prototype.renderTip = function(alpha) {
  var FONT_SIZE = 0.06;
  var AXES = {
    0: {name: 'X', keys: ['xNeg',   'xPos']},
    1: {name: 'Y', keys: ['yNeg',   'yPos']},
    2: {name: 'Z', keys: ['zNeg',   'zPos']},
    3: {name: 'W', keys: ['a4Neg', 'a4Pos']},
    4: {name: 'V', keys: ['a5Neg', 'a5Pos']},
    5: {name: 'T', keys: ['a6Neg', 'a6Pos']},
  };
  var currY = 0.9;
  FONT_RENDERER.renderText("Merge tiles and reach " + this.gameState.target + " tile!",
      0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
  currY -= FONT_SIZE;
  FONT_RENDERER.renderText("When two tiles with the same number touch, they merge into one!",
      0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
  currY -= FONT_SIZE + 0.02;
  FONT_RENDERER.renderText("Use your keyboard to move and merge tiles:",
      0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
  for (var i = 0; i < this.dims.length; ++i) {
    if (this.dims[i] == 1) {
      continue;
    }
    currY -= FONT_SIZE;
    FONT_RENDERER.renderText("Axis " + AXES[i].name + ": keys " +
        KeyboardInfo.getKeyNameByCode(KeyboardSettings[AXES[i].keys[0]]) + " and " +
        KeyboardInfo.getKeyNameByCode(KeyboardSettings[AXES[i].keys[1]]),
        0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
  }
  currY -= FONT_SIZE + 0.02;
  FONT_RENDERER.renderText("You can also redefine controls in Menu -> Options.",
      0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
  if (this.dims.length >= 3) {
    currY -= FONT_SIZE;
    FONT_RENDERER.renderText("Drag your mouse to rotate the field.",
        0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
  }
  currY -= FONT_SIZE;
  FONT_RENDERER.renderText("Good luck!",
      0.01, currY, FONT_SIZE, [1.0, 1.0, 1.0, alpha], {v: "up", h: "left"});
}

GameScene.prototype.gameRestart = function() {
  this.gameState = new GameState(this.dims, this.target, this.obstacles);
  this.scoreCounter = new ScoreCounter();
  this.sceneState = {state: "game", gamesubstate: "wait"};
  this.cellsAppear = zeroArray(this.gameState.field.length);
  for (var i = 0; i < 6; ++i) {
    var cellId = this.gameState.addNewRandomCell();
    this.cellsAppear[cellId] = 0.0;
  }
  this.lookLatitude = 0.4;
  this.lookLongtitude = 0.0;
  this.lookVelocityX = 2.8;
  this.lookVelocityY = -0.07;

  this.appearKoef = 0.0;
}

function scaleAnimationEasing(x) { // x is from 0.0 to 1.0
  if (x < 0.4) {
    return 1.0 + Math.sin(Math.PI / 2 * x / 0.4) * 0.01;
  } else if (x < 0.7) {
    return 1.01 + Math.sin(Math.PI / 2 * (x - 0.4) / 0.3) * 0.1;
  } else {
    return 1.01 + Math.cos(Math.PI / 2 * (x - 0.7) / 0.3) * 0.1;
  }
}

function mergeInterpolationEasing(x) { // x is from 0.0 to 1.0
  if (x < 0.6) {
    return 0.0;
  } else {
    return Math.sin(Math.PI * ((x-0.6)/0.4 - 0.5))/2 + 0.5;
  }
}

GameScene.prototype.animate = function(elapsed) {
  // Animate buttons
  // firstly, always fade background buttons:

  if (this.sceneState.state == "game") {
    for (var i = 0; i < this.buttons.length; ++i) {
      if (this.selectedButton == i) {
        this.buttons[i].shininess = 1.0;
        if (this.Mouse.down) {
          if (this.buttons[i].name == "zoomIn") {
            this.lookRadius.target -= (this.lookRadius.max - this.lookRadius.min) * elapsed / 1000.0 / 3.0;
            this.lookRadius.target = Math.max(this.lookRadius.target, this.lookRadius.min);
          } else if (this.buttons[i].name == "zoomOut") {
            this.lookRadius.target += (this.lookRadius.max - this.lookRadius.min) * elapsed / 1000.0 / 3.0;
            this.lookRadius.target = Math.min(this.lookRadius.target, this.lookRadius.max);
          }
        }
      } else {
        this.buttons[i].shininess -= elapsed / 1000.;
        this.buttons[i].shininess = Math.max(0.0, this.buttons[i].shininess);
      }
    }
  } else if (["menu", "win", "fail", "options"].indexOf(this.sceneState.state) > -1) {
    var buttonList = this.getCurrentRenderingButtonList();
    for (var i = 0; i < buttonList.length; ++i) {
      if (this.selectedButton == i) {
        buttonList[i].shininess = 1.0;
      } else {
        buttonList[i].shininess -= elapsed / 1000.;
        buttonList[i].shininess = Math.max(0.0, buttonList[i].shininess);
      }
    }
    
    // and always fade background buttons
    for (var i = 0; i < this.buttons.length; ++i) {
      this.buttons[i].shininess -= elapsed / 1000.;
      this.buttons[i].shininess = Math.max(0.0, this.buttons[i].shininess);
    }
    if (this.sceneState.state == "options") {
      this.sceneState.optionsScreen.animate(elapsed);
    }
  }

  this.lookRadius.current += (this.lookRadius.target - this.lookRadius.current) * Math.pow(0.04, elapsed / 1000.0);
  // Animate others
  if (this.sceneState.gamesubstate == "animation") {
    this.sceneState.animation += elapsed * 3 / 1000.0;
    if (this.sceneState.animation > 1.0) {
      var points = this.gameState.move(this.sceneState.axisId, this.sceneState.dir);
      if (points > 0) {
        this.scoreCounter.addPoints(points, [1.0, 1.0, 1.0, 1.0]);
      }
      for (var i = 0; i < this.gameState.field.length; ++i) {
        if (this.gameState.field[i] != 0) {
          this.cellsAppear[i] = 1.0;
        } else {
          this.cellsAppear[i] = 0.0;
        }
      }
      if (this.gameState.hasFreeCells()) {
        this.cellsAppear[this.gameState.addNewRandomCell()] = 0;
      }
      this.sceneState.gamesubstate = "wait";
      // here we check if we won or lost!
      if (this.gameState.isWinnerState()) {
        this.sceneState.state = "win";
        this.sceneState.substate = "appearing";
        this.sceneState.animation = 0.0;
      } else if (this.gameState.isLoserState()) {
        this.sceneState.state = "fail";
        this.sceneState.substate = "appearing";
        this.sceneState.animation = 0.0;
      }
    }
  }
  for (var i = 0; i < this.gameState.field.length; ++i) {
    if (this.gameState.field[i] != 0) {
      this.cellsAppear[i] = Math.min(1.0, this.cellsAppear[i] + elapsed * 5 / 1000.0);
    } else {
      this.cellsAppear[i] = 0.0;
    }
  }
  this.lookLatitude   += this.lookVelocityY * elapsed / 1000.0;
  this.lookLongtitude += this.lookVelocityX * elapsed / 1000.0;
  if (this.lookLatitude > this.LOOK_MAX_LATITUDE) {
    this.lookLatitude = this.LOOK_MAX_LATITUDE;
  }
  if (this.lookLatitude < -this.LOOK_MAX_LATITUDE) {
    this.lookLatitude = -this.LOOK_MAX_LATITUDE;
  }
  while (this.lookLongtitude < 0.0) {
    this.lookLongtitude += 2 * Math.PI;
  }
  while (this.lookLongtitude > 2 * Math.PI) {
    this.lookLongtitude -= 2 * Math.PI;
  }
  fadeKoef = Math.pow(0.4, elapsed / 1000.0);
  this.lookVelocityX *= fadeKoef;
  this.lookVelocityY *= fadeKoef;

  this.tipTimer -= elapsed / 1000.0;
  if (this.tipTimer <= 0.0) {
    this.tipTimer = 0.0;
  }

  
  if (this.sceneState.state == "menu") {
    if (this.sceneState.substate == "appearing") {
      this.sceneState.animation += elapsed / 1000.0;
      if (this.sceneState.animation > 1.0) {
        this.sceneState.substate = "wait";
      }
    } else if (this.sceneState.substate == "fading") {
      this.sceneState.animation += elapsed / 1000.0;
      if (this.sceneState.animation > 1.0) {
        if (this.sceneState.pressedButtonName == "resume") {
          this.sceneState.state = "game";
        } else if (this.sceneState.pressedButtonName == "options") {
          this.sceneState.state = "options";
          this.sceneState.substate = "appearing";
          this.sceneState.animation = 0.0;
          this.sceneState.optionsScreen = new OptionsScreen((this.dims.length==2 && this.dims[1]==1)?1:this.dims.length);
        } else if (this.sceneState.pressedButtonName == "endgame") {
          CURRENT_SCENE = new MainMenuScene(false);
        } else if (this.sceneState.pressedButtonName == "restart") {
          CURRENT_SCENE.gameRestart();
        }
      }
    }
  } else if (["win", "fail"].indexOf(this.sceneState.state) > -1) {
    if (this.sceneState.substate == "appearing") {
      this.sceneState.animation += elapsed / 1000.0;
      if (this.sceneState.animation > 1.0) {
        this.sceneState.substate = "wait";
      }
    } else if (this.sceneState.substate == "fading") {
      this.sceneState.animation += elapsed / 1000.0;
      if (this.sceneState.animation > 1.0) {
        if (this.sceneState.pressedButtonName == "resume") {
          this.gameState.setInfiniteGame();
          this.sceneState.state = "game";
        } else if (this.sceneState.pressedButtonName == "endgame") {
          CURRENT_SCENE = new MainMenuScene(false);
        } else if (this.sceneState.pressedButtonName == "restart") {
          CURRENT_SCENE.gameRestart();
        }
      }
    }
  } else if (this.sceneState.state == "options") {
    if (this.sceneState.substate == "appearing") {
      this.sceneState.animation += elapsed / 1000.0;
      if (this.sceneState.animation > 1.0) {
        this.sceneState.substate = "wait";
      }
    } else if (this.sceneState.substate == "fading") {
      this.sceneState.animation += elapsed / 1000.0;
      if (this.sceneState.animation > 1.0) {
        if (this.sceneState.pressedButtonName == "back") {
          saveKeyboardSettings();
          this.sceneState.state = "menu";
          this.sceneState.substate = "appearing";
          this.sceneState.animation = 0.0;
        }
      }
    }
  }

  this.scoreCounter.animate(elapsed);
  
  // Handle appearKoef independently of all
  this.appearKoef += elapsed / 1000.0;
  this.appearKoef = Math.min(1.0, this.appearKoef);
}


function gameAppearEasing(x) {
  return Math.sin(x * Math.PI / 2);
}

function tipEasing(x) {
  if (x < 1.0) {
    return Math.sin(x * Math.PI / 2);
  } else {
    return 1.0;
  }
}
