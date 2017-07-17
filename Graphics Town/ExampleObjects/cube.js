/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the cube is more complicated since it is designed to allow making many cubes

 we make a constructor function that will make instances of cubes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all cubes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each cube instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var Cube = undefined;
var SpinningCube = undefined;
var m4 = twgl.m4;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all cubes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;
	

    // constructor for Cubes
    Cube = function Cube(name, position, size, color) {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7,.8,.9];
    }
    Cube.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all cubes
        /**if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["vs", "fs"]);
        }*/
		    // Read shader source
    var vertexSource = document.getElementById("vs").text;
    var fragmentSource = document.getElementById("fs").text;

    // Compile vertex shader
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader,vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(vertexShader)); return null; }
    
    // Compile fragment shader
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader,fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(fragmentShader)); return null; }
    
    // Attach the shaders and link
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialize shaders"); }
    gl.useProgram(shaderProgram);	
		
	shaderProgram.PositionAttribute = gl.getAttribLocation(shaderProgram, "vPosition");
    gl.enableVertexAttribArray(shaderProgram.PositionAttribute);    
    shaderProgram.NormalAttribute = gl.getAttribLocation(shaderProgram, "vNormal");
    gl.enableVertexAttribArray(shaderProgram.NormalAttribute);    
    shaderProgram.ColorAttribute = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(shaderProgram.ColorAttribute);    
    shaderProgram.texcoordAttribute = gl.getAttribLocation(shaderProgram, "vTexCoord");
    gl.enableVertexAttribArray(shaderProgram.texcoordAttribute);
	shaderProgram.MVmatrix = gl.getUniformLocation(shaderProgram,"uMV");
    shaderProgram.MVNormalmatrix = gl.getUniformLocation(shaderProgram,"uMVn");
    shaderProgram.MVPmatrix = gl.getUniformLocation(shaderProgram,"uMVP");
	shaderProgram.texSampler1 = gl.getUniformLocation(shaderProgram, "texSampler1");
    gl.uniform1i(shaderProgram.texSampler1, 0);
    shaderProgram.texSampler2 = gl.getUniformLocation(shaderProgram, "texSampler2");
    gl.uniform1i(shaderProgram.texSampler2, 1);
	var vertexPos = new Float32Array(
        [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,
           1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,
           1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,
          -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,
          -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,
           1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]);
    var vertexNormals = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1, 
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0, 
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0, 
          -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0, 
           0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0, 
           0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1  ]);
    var vertexColors = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,
           1, 1, 0,   1, 1, 0,   1, 1, 0,   1, 1, 0,
           1, 0, 1,   1, 0, 1,   1, 0, 1,   1, 0, 1,
           0, 1, 1,   0, 1, 1,   0, 1, 1,   0, 1, 1 ]);
    var vertexTextureCoords = new Float32Array(
        [  .25, 0,   0, 0,   0, 1,   .25, 1,
           .25, 0,   .25, 1,  .5, 1,   .5, 0,
           0, 1,   0, 0,   1, 0,   1, 1,
           1, 0,   .75, 0,   .75, 1,   1, 1,
           1, 1,   0, 1,   0, 0,   1, 0,
           .5, 1,   .75, 1,   .75, 0,   .5, 0 ]);
    var triangleIndices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // top
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // bottom
	      20,21,22,  20,22,23 ]); // back
	var trianglePosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPos, gl.STATIC_DRAW);
    trianglePosBuffer.itemSize = 3;
    trianglePosBuffer.numItems = 24;
	var triangleNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexNormals, gl.STATIC_DRAW);
    triangleNormalBuffer.itemSize = 3;
    triangleNormalBuffer.numItems = 24;
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColors, gl.STATIC_DRAW);
    colorBuffer.itemSize = 3;
    colorBuffer.numItems = 24;
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexTextureCoords, gl.STATIC_DRAW);
    textureBuffer.itemSize = 2;
    textureBuffer.numItems = 24;
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
    var texture1 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image1 = new Image();
    var texture2 = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    var image2 = new Image();
	image1.onload = function() { loadTexture(image1,texture1); };
    image1.crossOrigin = "anonymous";
    image1.src = "https://pbs.twimg.com/profile_images/675002642196729857/A0OpcJpA.png";
	image2.onload = function() { loadTexture(image2,texture2); };
	image2.crossOrigin = "anonymous";
    image2.src = "https://farm6.staticflickr.com/5726/30206830053_87e9530b48_b.jpg";
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    /**    if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
                    -.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
                    -.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
                    -.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
                    -.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
                     .5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5     // x = 1
                ] },
                vnormal : {numComponents:3, data: [
                    0,0,-1, 0,0,-1, 0,0,-1,     0,0,-1, 0,0,-1, 0,0,-1,
                    0,0,1, 0,0,1, 0,0,1,        0,0,1, 0,0,1, 0,0,1,
                    0,-1,0, 0,-1,0, 0,-1,0,     0,-1,0, 0,-1,0, 0,-1,0,
                    0,1,0, 0,1,0, 0,1,0,        0,1,0, 0,1,0, 0,1,0,
                    -1,0,0, -1,0,0, -1,0,0,     -1,0,0, -1,0,0, -1,0,0,
                    1,0,0, 1,0,0, 1,0,0,        1,0,0, 1,0,0, 1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }*/

    };
    Cube.prototype.draw = function(drawingState) {
        /** we make a model matrix to place the cube in the world
        var modelM = m4.scaling([this.size,this.size,this.size]);
        m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);*/
		
		var tMVn = m4.translation(this.position);
		tMVn = m4.multiply(tMVn, drawingState.view);
		var tMV = m4.scaling([this.size,this.size,this.size]);
		tMV = m4.translate(this.position);
		tMV = m4.multiply(tMV, drawingState.view);
		var tMVP = m4.multiply(tMV, drawingState.proj);
		
gl.uniformMatrix4fv(shaderProgram.MVmatrix,false,tMV);
gl.uniformMatrix4fv(shaderProgram.MVNormalmatrix,false,tMVn);
gl.uniformMatrix4fv(shaderProgram.MVPmatrix,false,tMVP);
gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
gl.vertexAttribPointer(shaderProgram.PositionAttribute, trianglePosBuffer.itemSize,
gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalBuffer);
gl.vertexAttribPointer(shaderProgram.NormalAttribute, triangleNormalBuffer.itemSize,
gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(shaderProgram.ColorAttribute, colorBuffer.itemSize,
gl.FLOAT,false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
gl.vertexAttribPointer(shaderProgram.texcoordAttribute, textureBuffer.itemSize,
gl.FLOAT, false, 0, 0);
// Bind texture
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture1);
gl.activeTexture(gl.TEXTURE1);
gl.bindTexture(gl.TEXTURE_2D, texture2);
// Do the drawing
gl.drawElements(gl.TRIANGLES, triangleIndices.length, gl.UNSIGNED_BYTE, 0);
    };
    Cube.prototype.center = function(drawingState) {
        return this.position;
    }


    ////////
    // constructor for Cubes
    SpinningCube = function SpinningCube(name, position, size, color, axis) {
        Cube.apply(this,arguments);
        this.axis = axis || 'X';
    }
    SpinningCube.prototype = Object.create(Cube.prototype);
    SpinningCube.prototype.draw = function(drawingState) {
        // we make a model matrix to place the cube in the world
        var modelM = m4.scaling([this.size,this.size,this.size]);
        var theta = Number(drawingState.realtime)/200.0;
        if (this.axis == 'X') {
            m4.rotateX(modelM, theta, modelM);
        } else if (this.axis == 'Z') {
            m4.rotateZ(modelM, theta, modelM);
        } else {
            m4.rotateY(modelM, theta, modelM);
        }
        m4.setTranslation(modelM,this.position,modelM);
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    SpinningCube.prototype.center = function(drawingState) {
        return this.position;
    }


})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of cubes, just don't load this file.
grobjects.push(new Cube("cube1",[-2,0.5,   0],1) );
grobjects.push(new Cube("cube2",[ 2,0.5,   0],1, [1,1,0]));
grobjects.push(new Cube("cube3",[ 0, 0.5, -2],1 , [0,1,1]));
grobjects.push(new Cube("cube4",[ 0,0.5,   2],1));
/**
grobjects.push(new SpinningCube("scube 1",[-2,0.5, -2],1) );
grobjects.push(new SpinningCube("scube 2",[-2,0.5,  2],1,  [1,0,0], 'Y'));
grobjects.push(new SpinningCube("scube 3",[ 2,0.5, -2],1 , [0,0,1], 'Z'));
grobjects.push(new SpinningCube("scube 4",[ 2,0.5,  2],1));
*/