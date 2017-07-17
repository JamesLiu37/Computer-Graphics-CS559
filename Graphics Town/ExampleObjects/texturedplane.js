/**
 * Created by Yusef.
 */

/**
 A Very Simple Textured Plane using native WebGL. 

 Notice that it is possible to only use twgl for math. 

 Also, due to security restrictions the image was encoded as a Base64 string. 
 It is very simple to use somthing like this (http://dataurl.net/#dataurlmaker) to create one
 then its as simple as 
     var image = new Image()
     image.src = <base64string>


 **/

var grobjects = grobjects || [];


(function() {
    "use strict";
	{ // VERTEX AND FRAGMENT SHADERS
    var vertexSource = ""+
        "precision highp float;" +
        "attribute vec3 aPosition;" +
        "attribute vec2 aTexCoord;" +		
		"attribute vec3 aNormal;"+		
        "varying vec2 fTexCoord;" +
		"varying vec3 fPosition;" +
		"varying vec3 fNormal;" +
		"varying mat4 mvMatrix;" +
        "uniform mat4 pMatrix;" +
        "uniform mat4 vMatrix;" +
        "uniform mat4 mMatrix;" +
		
        "void main(void) {" +
        "  gl_Position = pMatrix * vMatrix * mMatrix * vec4(aPosition, 1.0);" +
		"  fPosition = (vMatrix * mMatrix * vec4(aPosition, 1.0)).xyz;" +
        "  fTexCoord = aTexCoord;" +
		"  fNormal = aNormal;" +
		"  mvMatrix = vMatrix * mMatrix;" +
        "}";

    var fragmentSource = "" +
        "precision highp float;" +
        "varying vec2 fTexCoord;" +
		"varying vec3 fNormal;" +
		"varying vec3 fPosition;" +
		"varying mat4 mvMatrix;" +
        "uniform sampler2D uTexture;" + 
	  "const vec3  lightV    = vec3(0.0,0.0,1.0);" +
      "const float lightI    = 1.0;" +
      "const float ambientC  = 0.15;" +
      "const float diffuseC  = 0.6;" +
      "const float specularC = 1.0;" +
      "const float specularE = 100.0;" +
      "const vec3  lightCol  = vec3(1.0,1.0,1.0);" +
      "const vec3  objectCol = vec3(1.0,0.6,0.0);" +
      "vec2 blinnPhongDir(vec3 lightDir, vec3 n, float lightInt, float Ka," +
        "float Kd, float Ks, float shininess) {" +
        "vec3 s = normalize(lightDir);" +
        "vec3 v = normalize(-fPosition);" +
        "vec3 h = normalize(v+s);"+
        "float diffuse = Ka + Kd * lightInt * max(0.0, dot(n, s));" +
        "float spec =  Ks * pow(max(0.0, dot(n,h)), shininess);" +
        "return vec2(diffuse, spec);" +
      "}" +
        "void main(void) {" +
        "vec3 texColor=texture2D(uTexture,fTexCoord).xyz;" +
        "vec3 n = (mvMatrix * vec4(fNormal, 0.0)).xyz;" +
        "vec3 ColorS  = blinnPhongDir(lightV,n,0.0   ,0.0,     0.0,     specularC,specularE).y*lightCol;" +
        "vec3 ColorAD = blinnPhongDir(lightV,n,lightI,ambientC,diffuseC,0.0,      1.0      ).x*texColor;" +
        "gl_FragColor = vec4(ColorAD+ColorS,1.0);" +
        "}";

	}
		{var vertices = new Float32Array([ // VERTEX COORDINATES
-.5,-.5,-.5,  .5,-.5,-.5,  .5, .5,-.5,        -.5,-.5,-.5,  .5, .5,-.5, -.5, .5,-.5,    // z = 0
-.5,-.5, .5,  .5,-.5, .5,  .5, .5, .5,        -.5,-.5, .5,  .5, .5, .5, -.5, .5, .5,    // z = 1
-.5,-.5,-.5,  .5,-.5,-.5,  .5,-.5, .5,        -.5,-.5,-.5,  .5,-.5, .5, -.5,-.5, .5,    // y = 0
-.5, .5,-.5,  .5, .5,-.5,  .5, .5, .5,        -.5, .5,-.5,  .5, .5, .5, -.5, .5, .5,    // y = 1
-.5,-.5,-.5, -.5, .5,-.5, -.5, .5, .5,        -.5,-.5,-.5, -.5, .5, .5, -.5,-.5, .5,    // x = 0
.5,-.5,-.5,  .5, .5,-.5,  .5, .5, .5,         .5,-.5,-.5,  .5, .5, .5,  .5,-.5, .5     // x = 1
]);

	var normals = new Float32Array([
	0,0,-1,	0,0,-1,	0,0,-1,		0,0,-1,	0,0,-1,	0,0,-1,	
	0,0,1,	0,0,1,	0,0,1,		0,0,1,	0,0,1,	0,0,1,
	0,-1,0,	0,-1,0,	0,-1,0,		0,-1,0,	0,-1,0,	0,-1,0,	
	0,1,0,	0,1,0,	0,1,0,		0,1,0,	0,1,0,	0,1,0,	
	-1,0,0,	-1,0,0,	-1,0,0,		-1,0,0,	-1,0,0,	-1,0,0,
	1,0,0,	1,0,0,	1,0,0,		1,0,0,	1,0,0,	1,0,0
	]);
 
   var uvs = new Float32Array([ // TEXTURE COORDINATES
.75, 1,	.5,1,	.5,0,			.75,1,	.5,0,	.75,0,		// z- back
0,1,	.25, 1,	.25,0,			0, 1,	.25,0,	0,0,		// z+ front	
0,1,	1,1,	1,0,			0,1,	1,0,	0,0,		// y- bottom
0,0,	1,0,	1,1,			0,0,	1,1,	0,1,		// y+ top
.75,1,	.75,0,	1,0,			.75,1,	1,0,	1,1,		// x- left
.5,1,  .5,0,  	.25,0,        	.5,1,  .25,0,  .25,1     	// x+ right

]);}

    //useful util function to simplify shader creation. type is either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    var createGLShader = function (gl, type, src) {
        var shader = gl.createShader(type)
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log("warning: shader failed to compile!")
            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    } 
	
    var myImage = new Image();
	myImage.src = myImageSrcString;
	
	var webImage = new Image();
	webImage.src = webImageSrcString;
	
	var bumpImage = new Image();
	bumpImage.src = bumpImageSrcString;
	
	var decalImage = new Image();
	decalImage.src = decalImageSrcString;
	
	//useful util function to return a glProgram from just vertex and fragment shader source.
    var createGLProgram = function (gl, vSrc, fSrc) {
        var program = gl.createProgram();
        var vShader = createGLShader(gl, gl.VERTEX_SHADER, vSrc);
        var fShader = createGLShader(gl, gl.FRAGMENT_SHADER, fSrc);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
            console.log("warning: program failed to link");
            return null;

        }
        return program;
    }

    //creates a gl buffer and unbinds it when done. 
    var createGLBuffer = function (gl, data, usage) {
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, usage);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        return buffer;
    }

    var findAttribLocations = function (gl, program, attributes) {
        var out = {};
        for(var i = 0; i < attributes.length;i++){
            var attrib = attributes[i];
            out[attrib] = gl.getAttribLocation(program, attrib);
        }
        return out;
    }

    var findUniformLocations = function (gl, program, uniforms) {
        var out = {};
        for(var i = 0; i < uniforms.length;i++){
            var uniform = uniforms[i];
            out[uniform] = gl.getUniformLocation(program, uniform);
        }
        return out;
    }

    var enableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.enableVertexAttribArray(location);
        }
    }

    //always a good idea to clean up your attrib location bindings when done. You wont regret it later. 
    var disableLocations = function (gl, attributes) {
        for(var key in attributes){
            var location = attributes[key];
            gl.disableVertexAttribArray(location);
        }
    }

    //creates a gl texture from an image object. Sometiems the image is upside down so flipY is passed to optionally flip the data.
    //it's mostly going to be a try it once, flip if you need to. 
    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        /**gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);*/

//gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
// Prevents s-coordinate wrapping (repeating).
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// Prevents t-coordinate wrapping (repeating).
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);



        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }
	
	// CONSTRUCTOR: No args currently accepted
     var TexturedPlane = function () {
        this.name = "Textured Cube"
        this.position = new Float32Array([0, 0, 0]);
		this.axis = new Float32Array([0,0,0]);
		this.source = "";
        this.scale = new Float32Array([1, 1]);
        this.program = null;
        this.attributes = null;
        this.uniforms = null;
        this.buffers = [null, null, null];
        this.texture = null;
		this.decalTexture = null;
		this.bgTexture = null;
		this.mode = 0; // use default fragment shader
		// 1 = use bump map fragment shader
    }

    TexturedPlane.prototype.init = function (drawingState) {
        var gl = drawingState.gl;
		
		if (this.mode == 0)
			this.program = createGLProgram(gl, vertexSource, fragmentSource);
		else if (this.mode == 1)
			this.program = createGLProgram(gl, vertexSource, bumpFS);
		else if (this.mode == 2){
			this.program = createGLProgram(gl, vertexSource, decalFS);
			this.decalTexture = createGLTexture(gl, decalImage, false);
			this.bgTexture = createGLTexture(gl, bumpImage, false);
		}
        this.attributes = findAttribLocations(gl, this.program, ["aPosition", "aTexCoord", "aNormal"]);
        this.uniforms = findUniformLocations(gl, this.program, ["pMatrix", "vMatrix", "mMatrix", "uTexture", "u2Texture", "u3Texture"]);

		var textureImage = new Image();
		textureImage.src = this.source;
		this.texture = createGLTexture(gl, textureImage, false);

        this.buffers[0] = createGLBuffer(gl, vertices, gl.STATIC_DRAW);
        this.buffers[1] = createGLBuffer(gl, uvs, gl.STATIC_DRAW);
		this.buffers[2] = createGLBuffer(gl, normals, gl.STATIC_DRAW);
    }

    TexturedPlane.prototype.center = function () {
        return this.position;
    }

    TexturedPlane.prototype.draw = function (drawingState) {
        var gl = drawingState.gl;

        gl.useProgram(this.program);
        gl.disable(gl.CULL_FACE);
		
        var modelM = twgl.m4.translation(this.position);
		
		var theta = Number(drawingState.realtime)/900.0;
		twgl.m4.axisRotate(modelM, this.axis, theta, modelM);

        gl.uniformMatrix4fv(this.uniforms.pMatrix, gl.FALSE, drawingState.proj);
        gl.uniformMatrix4fv(this.uniforms.vMatrix, gl.FALSE, drawingState.view);
        gl.uniformMatrix4fv(this.uniforms.mMatrix, gl.FALSE, modelM);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.uTexture, 0);
		if (this.mode == 2){
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, this.decalTexture);
			gl.uniform1i(this.uniforms.u2Texture, 1);
			gl.activeTexture(gl.TEXTURE2);
			gl.bindTexture(gl.TEXTURE_2D, this.bgTexture);
			gl.uniform1i(this.uniforms.u3Texture, 2);
		}



        enableLocations(gl, this.attributes)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.attributes.aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(this.attributes.aTexCoord, 2, gl.FLOAT, false, 0, 0);
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.vertexAttribPointer(this.attributes.aNormal, 3, gl.FLOAT, false, 0, 0);

        

        gl.drawArrays(gl.TRIANGLES, 0, 36);

        disableLocations(gl, this.attributes);
    }


    var cube1 = new TexturedPlane();
		cube1.name = "textured cube 1";
		cube1.source = myImage.src;		
		cube1.position = [2,1,2];
		cube1.axis = [1,0,0]; // X-axis
		
	var cube2 = new TexturedPlane();
		cube2.name = "textured cube 2";
		cube2.source = webImage.src; 
        cube2.position = [-2,1,-2];
		cube2.axis = [1,0,0]; // X-axis
		
	var cube3 = new TexturedPlane();
		cube3.name = "bump map cube";
		cube3.source = bumpImage.src; 
        cube3.position = [-2,1,2];
		cube3.axis = [0,1,0]; // Y-axis
		cube3.mode = 1;
		
	var cube4 = new TexturedPlane();
		cube4.name = "decal cube";
		cube4.source = webImage.src; 
        cube4.position = [2,1,-2];
		cube4.axis = [0,1,1];
		cube4.mode = 2;		

    grobjects.push(cube1);
	grobjects.push(cube2);
	grobjects.push(cube3);
	grobjects.push(cube4);

	
})();