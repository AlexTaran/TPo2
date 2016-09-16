function FontRenderer(font, texture) {
  this.font = font;
  this.texture = texture;
  this.projection_matrix = mat4.create();
  this.modelview_matrix = mat4.create();
  this.texture_matrix = mat4.create();
}

FontRenderer.prototype.measureText = function(text, h) {
  var width = 0.0;
  var aspectRatio = gl.viewportWidth / gl.viewportHeight;    
  for(var i = 0; i < text.length; ++i) {
    if (text[i] in this.font.chars) {
      var charparams = this.font.chars[text[i]];
      width += h / aspectRatio * charparams.w/charparams.h;
    }
  }
  return width;
}

FontRenderer.prototype.renderText = function(text, x, y, h, color, justify) {
  justify = typeof justify !== 'undefined' ? justify : {h: 'left', v: 'bottom'};
  var vj = {up:1.0, center:0.5, bottom:0.0, down:0.0}[justify.v];
  var hj = {right:1.0, center:0.5, left:0.0}[justify.h];

  var aspectRatio = gl.viewportWidth / gl.viewportHeight;    
  gl.disable(gl.DEPTH_TEST);
  gl.useProgram(Programs.font);
  gl.uniform4fv(Programs.font.uniforms.col, color);
  
  gl.enableVertexAttribArray(Programs.font.attribs.pos);
  gl.enableVertexAttribArray(Programs.font.attribs.tc);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  mat4.ortho(0.0, 1.0, 0.0, 1.0, -0.5, 0.5, this.projection_matrix);
  gl.uniformMatrix4fv(Programs.font.uniforms.projection_matrix, false, this.projection_matrix);

  gl.activeTexture(gl.TEXTURE0);
  gl.uniform1i(Programs.font.uniforms.tex, 0);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.squareVertexPositionBuffer);
  gl.vertexAttribPointer(Programs.font.attribs.pos, VBOs.squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.squareVertexTexcoordBuffer);
  gl.vertexAttribPointer(Programs.font.attribs.tc,  VBOs.squareVertexTexcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
 
  mat4.identity(this.modelview_matrix);
  var curr_ofs_x = -hj * this.measureText(text, h);
  for(var i = 0; i < text.length; ++i) {
    if (text[i] in this.font.chars) {
      var charparams = this.font.chars[text[i]];
      mat4.identity(this.modelview_matrix);
      mat4.translate(this.modelview_matrix, [x + curr_ofs_x, y - h * vj, 0.0]);
      mat4.scale(this.modelview_matrix, [h / aspectRatio * charparams.w/charparams.h, h, 1.0]);
      gl.uniformMatrix4fv(Programs.font.uniforms.modelview_matrix, false, this.modelview_matrix);

      mat4.identity(this.texture_matrix);
      mat4.translate(this.texture_matrix, [charparams.x/this.font.texW, 1. - (charparams.y + charparams.h)/this.font.texH, 0.0]);
      mat4.scale    (this.texture_matrix, [charparams.w/this.font.texW, charparams.h/this.font.texH, 1.0]);
      gl.uniformMatrix4fv(Programs.font.uniforms.texture_matrix, false, this.texture_matrix);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, VBOs.squareVertexPositionBuffer.numItems);
      curr_ofs_x += h / aspectRatio * charparams.w/charparams.h;
    } //else {
      //curr_ofs_x += h/aspectRatio * this.font.chars['n'].w / this.font.chars['n'].h;
    //}
  }
  gl.disable(gl.BLEND);
  gl.useProgram(null);
  gl.enable(gl.DEPTH_TEST);
}
