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
var Airplane = undefined;
var CurvedAirplane = undefined;

// this is a function that runs at loading time (note the parenthesis at the end)
(function() {
    "use strict";

    // i will use this function's scope for things that will be shared
    // across all airplanes - they can all have the same buffers and shaders
    // note - twgl keeps track of the locations for uniforms and attributes for us!
    var shaderProgram = undefined;
    var buffers = undefined;
	var v3 = twgl.v3;
	var m4 = twgl.m4;

    // constructor for Planes
    Airplane = function Airplane(name, size) {
        this.name = name;
        this.size = size || 1.0;
    }
    Airplane.prototype.init = function(drawingState) {
        var gl=drawingState.gl;
        // create the shaders once - for all airplanes
        if (!shaderProgram) {
            shaderProgram = twgl.createProgramInfo(gl, ["airplane-vs", "airplane-fs"]);
        }
		var s = this.size; // this must match var s below!
		// this is for the Examine view
		var tx = -4*s; // center the airplane on origin
		var ty = -5*s;
        if (!buffers) {
            var arrays = {
                vpos : { numComponents: 3, data: [
					4+tx, 0+ty, 0,			3.65+tx, 7.5+ty, 0,		4.35+tx, 7.5+ty, 0,
					4+tx,2.3+ty,0,			2.55+tx, 6.7+ty, 0,   	5.45+tx, 6.7+ty, 0,
					4+tx,4.25+ty,0,			0+tx, 6.1+ty, 0,			8+tx, 6.1+ty, 0,
					3.75+tx,7.5+ty,0,		4+tx,9.35+ty,0,			4.25+tx,7.5+ty,0,
					4+tx,8.5+ty,0,			2.5+tx, 8.9+ty, 0,		5.5+tx,8.9+ty,0,
					3.9+tx, 9+ty, 0,		4+tx, 9.35+ty, 0,		4.1+tx,9+ty,0,
					4+tx, 7.4+ty, 0,		4+tx, 8.7+ty, 0,		4+tx, 8.6+ty, -1,
                ] },
                vnormal : {numComponents:3, data: [
					0,0,1,		0,0,1,		0,0,1,
					0,0,1,		0,0,1,		0,0,1,
					0,0,1,		0,0,1,		0,0,1,
					0,0,1,		0,0,1,		0,0,1,
					0,0,1,		0,0,1,		0,0,1,
					0,0,1,		0,0,1,		0,0,1,
					1,0,0,		1,0,0,		1,0,0,
                ]}
            };
            buffers = twgl.createBufferInfoFromArrays(drawingState.gl,arrays);
        }

    };
    Airplane.prototype.draw = function(drawingState) {		
		// we make a model matrix to place the airplane in the world
        var modelM = m4.scaling([this.size,this.size,this.size]);
		var theta = Number(drawingState.realtime)/600.0; // 1/600 = speed factor
		var r = 3.5; // flight radius
		var posX = -r*Math.cos(theta);
		var posZ = r*Math.sin(-theta);
		var posVec = [posX, 2, posZ]; // y = height
        m4.setTranslation(modelM,posVec,modelM);
		m4.rotateX(modelM, Math.PI/2, modelM); //Pitch
		m4.rotateZ(modelM, theta, modelM); // Yaw
		m4.rotateY(modelM, -Math.PI/6, modelM); // Roll
		
        // the drawing coce is straightforward - since twgl deals with the GL stuff for us
        var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            airplanecolor:[.1,.2,.7], model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
    };
    Airplane.prototype.center = function(drawingState) {
		var theta = Number(drawingState.realtime)/600.0; // 1/600 = speed factor
		var r = 3.5; // flight radius
		var posX = -r*Math.cos(theta);
		var posZ = r*Math.sin(-theta);
		var posVec = [posX, 2, posZ];
        return posVec;
    }
	
	CurvedAirplane = function CurvedAirplane(name, size, color, type) {
		Airplane.apply(this, arguments);
        this.color = color || [.1,.2,.7];
		this.type = type || 'H';
	}
	CurvedAirplane.prototype = Object.create(Airplane.prototype);
	CurvedAirplane.prototype.draw = function(drawingState) {
		var Bezier = function(t) {
			return [
				(1-t)*(1-t)*(1-t),
				3*t*(1-t)*(1-t),
				3*t*t*(1-t),
				t*t*t
			];
		}
		var BezierDerivative = function(t) {
			return [
				-3*(1-t)*(1-t),
				3*(1-3*t)*(1-t),
				3*t*(2-3*t),
				3*t*t
			  ];
		}
		var Hermite = function(t) {
			return [
				2*t*t*t-3*t*t+1,
				t*t*t-2*t*t+t,
				-2*t*t*t+3*t*t,
				t*t*t-t*t
			];
		}
		var HermiteDerivative = function(t) {
			return [
				6*t*t-6*t,
				3*t*t-4*t+1,
				-6*t*t+6*t,
				3*t*t-2*t
			];
		}
		  // This can generate both the function C(t) and the derivative C'(t),
		  // depending on the basis passed in
		function Cubic(basis,P,t){
			var b = basis(t);
			var result=v3.mulScalar(P[0],b[0]);
			v3.add(v3.mulScalar(P[1],b[1]),result,result);
			v3.add(v3.mulScalar(P[2],b[2]),result,result);
			v3.add(v3.mulScalar(P[3],b[3]),result,result);
			return result;
		}
		
		var p0, d0, p1, d1, P; var a, b, c, d;
		var time = (Number(drawingState.realtime) / 2000) % 2;
		var t  = time % 1;
		if (this.type == 'H') {
			if (time < 1){
				p0=[5,1,0];
				d0=[0,0,22];
				p1=[-5,1,0];
				d1=[0,0,-22];
			}
			else {
				p1=[5,1,0];
				d1=[0,0,22];
				p0=[-5,1,0];
				d0=[0,0,-22];
			}
			P = [p0,d0,p1,d1]; // Control points
		}
		else {
			a = [3,1,-6];
			b = [-3,1,-6];
			c = [-3,5,-6];
			d = [3,5,-6];		
			if (time < 1)
				t = 1 - t;
			P = [a, b, c, d];
		}
		
		var up; 
		//var t = drawingState.sunDirection;
		var Tmodel_trans, Tmodel_rot;
		if (this.type == 'H'){
			up = [0, 1, 0];
			Tmodel_trans=m4.translation(Cubic(Hermite,P,t));
			Tmodel_rot=m4.lookAt([0,0,0],Cubic(HermiteDerivative,P,t), up);
		}
		else {
			up = [0, 0, 1];
			Tmodel_trans=m4.translation(Cubic(Bezier,P,t));
			Tmodel_rot=m4.lookAt([0,0,0],Cubic(BezierDerivative,P,t), up);
		}
		
		var modelM = m4.scaling([this.size,this.size,this.size]);
		m4.rotateX(modelM, Math.PI/2, modelM); //Pitch
		var modelM=m4.multiply(modelM, Tmodel_rot);
		var modelM=m4.multiply(modelM, Tmodel_trans);
		
		var gl = drawingState.gl;
        gl.useProgram(shaderProgram.program);
        twgl.setBuffersAndAttributes(gl,shaderProgram,buffers);
        twgl.setUniforms(shaderProgram,{
            view:drawingState.view, proj:drawingState.proj, lightdir:drawingState.sunDirection,
            airplanecolor:this.color, model: modelM });
        twgl.drawBufferInfo(gl, gl.TRIANGLES, buffers);
	};



})();

// put some objects into the scene
// normally, this would happen in a "scene description" file
// but I am putting it here, so that if you want to get
// rid of airplanes, just don't load this file.
grobjects.push(new Airplane("Airplane",.2) );
grobjects.push(new CurvedAirplane("Hermit Airplane",.2, [.8, .08, .01] ) );
grobjects.push(new CurvedAirplane("Bezier Airplane",.2, [0, .9, .1], 'B' ) );
