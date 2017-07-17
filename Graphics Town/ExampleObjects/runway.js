/**
 * Created by gleicher on 10/9/2015.
 */

/**
 this is even simpler than the simplest object - it's a ground plane underneath
 the objects (at Z=0) - just a big plane. all coloring handled in the vertex
 shader. no normals. it's just a checkerboard that is simple.

 no normals, but a funky shader

 however, I am going to do it with TWGL to keep the code size down
 **/

// this defines the global list of objects
    // if it exists already, this is a redundant definition
    // if it isn't create a new array
var grobjects = grobjects || [];

// a global variable to set the ground plane size, so we can easily adjust it
// in the html file (before things run
// this is the +/- in the X and Z direction (so things will go from -5 to +5 by default)
var groundPlaneSize = groundPlaneSize || 7;

// now, I make a function that adds an object to that list
// there's a funky thing here where I have to not only define the function, but also
// run it - so it has to be put in parenthesis
(function() {
    "use strict";

    // putting the arrays of object info here as well
	
	var vertexPos = [
        -groundPlaneSize*.1, .0005, -groundPlaneSize,
         groundPlaneSize*.1, .0005, -groundPlaneSize,
         groundPlaneSize*.1, .0005,  groundPlaneSize,
        -groundPlaneSize*.1, .0005, -groundPlaneSize,
         groundPlaneSize*.1, .0005,  groundPlaneSize,
        -groundPlaneSize*.1, .0005,  groundPlaneSize
    ];

    // since there will be one of these, just keep info in the closure
    var shaderProgram = undefined;
    var buffers = undefined;
	
	    var runway = {
        // first I will give this the required object stuff for it's interface
        // note that the init and draw functions can refer to the fields I define
        // below
        name : "Runway",
        // the two workhorse functions - init and draw
        // init will be called when there is a GL context
        // this code gets really bulky since I am doing it all in place
        init : function(drawingState) {
            // an abbreviation...
            var gl = drawingState.gl;
            if (!shaderProgram) {
                shaderProgram = twgl.createProgramInfo(gl,["ground-vs","runway-fs"]);
            }
            var arrays = { vpos : {numComponents:3, data:vertexPos }};
            buffers = twgl.createBufferInfoFromArrays(gl,arrays);
       },
        draw : function(drawingState) {
            var gl = drawingState.gl;
            gl.useProgram(shaderProgram.program);
            twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
            twgl.setUniforms(shaderProgram,{
                view:drawingState.view, proj:drawingState.proj
            });
            twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
        },
        center : function(drawingState) {
            return [0,0,0];
        }

    };

    // now that we've defined the object, add it to the global objects list
	grobjects.push(runway);
})();