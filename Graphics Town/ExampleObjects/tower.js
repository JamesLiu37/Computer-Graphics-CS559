/**
 * Created by gleicher on 10/9/15.
 */
/*
 a second example object for graphics town
 check out "simplest" first

 the airplane is more complicated since it is designed to allow making many airplanes

 we make a constructor function that will make instances of airplanes - each one gets
 added to the grobjects list

 we need to be a little bit careful to distinguish between different kinds of initialization
 1) there are the things that can be initialized when the function is first defined
    (load time)
 2) there are things that are defined to be shared by all airplanes - these need to be defined
    by the first init (assuming that we require opengl to be ready)
 3) there are things that are to be defined for each airplane instance
 */
var grobjects = grobjects || [];

// allow the two constructors to be "leaked" out
var TriPrism = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all airplanes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;

    // constructor for Planes
    TriPrism = function TriPrism(name, position, sHeight, sBase) {
        this.name = name;
        this.position = position || [0,0,0];
        this.sHeight = sHeight || 1.0;
		this.sBase = sBase || 1.0;
        this.color = [.5,.7,.5];
    }
    TriPrism.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all airplanes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["cube-vs", "cube-fs"]);
        }
		var s = 0.2; // this must match var s below!
		// this is for the Examine view
		var tx = -4*s; // center the airplane on origin
		var ty = -5*s;
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
					// Bottom base
					0, 0, 0,			1, 0, 0,			.5, 0, .866,
					// 3 side faces
					0, 0, 0, 			.5, 1, .866,		0, 1, 0,
					.5, 0, .866,		0, 0, 0,			.5, 1, .866,
					1, 0, 0,			0, 0, 0,			1, 1, 0,
					0, 0, 0,			1, 1, 0,			0, 1, 0,
					1, 0, 0,			.5, 1, .866,		1, 1, 0,
					.5, 0, .866,		1, 0, 0, 			.5, 1, .866,
					// Top lid
					0, 1, 0,			1, 1, 0,			.5, 1, .866
					
                ] },
                vnormal : {numComponents:3, data: [
					0, -1, 0,			0, -1, 0,			0, -1, 0,
					-.866, 0, .5,		-.866, 0, .5,		-.866, 0, .5,
					-.866, 0, .5,		-.866, 0, .5,		-.866, 0, .5,
					0, 0, -1,			0, 0, -1,			0, 0, -1,
					0, 0, -1,			0, 0, -1,			0, 0, -1,
					.866, 0, .5,		.866, 0, .5,		.866, 0, .5,
					.866, 0, .5,		.866, 0, .5,		.866, 0, .5,
					0, 1, 0,			0, 1, 0,			0, 1, 0
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    TriPrism.prototype.draw = function(drawingState) {
        // we make a model matrix to place the airplane in the world
        var modelM = twgl.m4.scaling([this.sBase,this.sHeight,this.sBase]);
		twgl.m4.setTranslation(modelM,this.position,modelM);
		
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
		var camera = twgl.m4.inverse(drawingState.view);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, cam: camera, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            cubecolor:this.color, model: modelM});
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    TriPrism.prototype.center = function(drawingState) {
		var tx = this.position[0];
		var ty = this.position[1];
		var tz = this.position[2];
        return [.5*this.sBase + tx, 0.5*this.sHeight + ty, .288*this.sBase + tz];
    }
})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of TriPrisms, just don't load this file.
var px = 3.5; var pz = -3.5;
grobjects.push(new TriPrism("part1",[px, 0, pz],4, 1) );
grobjects.push(new TriPrism("part2",[px - .5, 3, pz - .288],.7, 2) );
