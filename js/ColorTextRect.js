function ColorTextRect(text, x, y, w, h) {
  this.text = text;
  this.x = x;
  this.y = y;
  this.width = w;
  this.height = h;
  this.color = [0.0, 0.0, 0.0, 0.0];
  this.textColor = [1.0, 1.0, 1.0, 1.0];

  // private
  this.projection_matrix = mat4.create();
  this.modelview_matrix = mat4.create();
}


ColorTextRect.prototype.render = function() {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(Programs.ucolor);
  gl.enableVertexAttribArray(Programs.ucolor.attribs.pos);
  mat4.identity(this.projection_matrix);
  mat4.ortho(0.0, 1.0, 0.0, 1.0, -0.5, 0.5, this.projection_matrix);
  gl.uniformMatrix4fv(Programs.ucolor.uniforms.projection_matrix, false, this.projection_matrix);
    
  mat4.identity(this.modelview_matrix);
  mat4.translate(this.modelview_matrix, [this.x-this.width/2, this.y - this.height/2, -0.01]);
  mat4.scale(this.modelview_matrix,     [this.width, this.height, 0.0]);
  gl.uniformMatrix4fv(Programs.ucolor.uniforms.modelview_matrix, false, this.modelview_matrix);
    
  gl.uniform4fv(Programs.ucolor.uniforms.col, this.color);

  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.squareVertexPositionBuffer);
  gl.vertexAttribPointer(Programs.ucolor.attribs.pos, VBOs.squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, VBOs.squareVertexPositionBuffer.numItems);
    
  gl.useProgram(null);
  gl.disable(gl.BLEND);
  this.renderText();
}

ColorTextRect.prototype.renderText = function() {
  FONT_RENDERER.renderText(this.text, this.x, this.y, this.height, this.textColor, {v:'center', h:'center'});
}


ColorTextRect.prototype.isPointInRect = function(glX, glY) {
  if (glX >= this.x - this.width/2  && glX <= this.x + this.width/2 &&
      glY >  this.y - this.height/2 && glY <  this.y + this.height/2) {
    return true;
  } else {
    return false;
  }
}
