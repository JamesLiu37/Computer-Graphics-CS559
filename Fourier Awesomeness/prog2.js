// Made with Visual Studio 2017 RC
// Based on course web materials
function setup() {
    var canv = document.getElementById('canvId');
    var slider1 = document.getElementById('slider1');
    var slider2 = document.getElementById('slider2');
    var slider3 = document.getElementById('slider3');
    var slider4 = document.getElementById('slider4');
    var slider5 = document.getElementById('slider5');
    var slider6 = document.getElementById('slider6');
    var slider7 = document.getElementById('slider7');
    var slider8 = document.getElementById('slider8');
    var degToRad = Math.PI/180.0;
    slider1.value = 100;
    slider2.value = 100;
    slider3.value = 100;
    slider4.value = 100;
    slider5.value = 100;
    slider6.value = 100;
    slider7.value = 100;
    slider8.value = 100;
    var ctx = canv.getContext('2d');
    ctx.translate(270, 270);
    ctx.lineWidth = 2;
    var ang1 = 0, ang2 = 0, ang3 = 0, ang4 = 0;
    var points = [0];
    function draw() {
        clearCanvas();
        // Scaling factors            
        var s1 = slider1.value / 100;
        var s2 = slider2.value / 100;
        var s3 = slider3.value / 100;
        var s4 = slider4.value / 100;
        var s5 = slider5.value / 100;
        var s6 = slider6.value / 100;
        var s7 = slider7.value / 100;
        var s8 = slider8.value / 100;
        var r1 = 105, r2 = 35, r3 = 21, r4 = 15 * s8;
        function line(color, length) {
            ctx.lineWidth = 3;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(length, 0);
            ctx.lineTo(0, 0);
            ctx.closePath();
            ctx.stroke();
        }
        function circle(color, length) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(0, 0, length, 0, 2 * Math.PI);            
            ctx.stroke();
        }
        ctx.lineWidth = 2;
        ctx.save(); // center circle
        ctx.rotate(ang1 * degToRad);
        ctx.scale(s2, s2); 
        line("#FF1035", r1);
        circle("#FF1035", r1);

        ctx.translate(r1, 0);
        ctx.rotate(ang2 * degToRad);
        ctx.scale(s4 / s2, s4 / s2); // cancel fx of stacking scale from s2 earlier
        line("#20A020", r2);
        circle("#20A020", r2); 

        ctx.translate(r2, 0);
        ctx.rotate(ang3 * degToRad);
        ctx.scale(s6 / s4, s6 / s4); // cancel fx of stacking scale from s4 earlier
        line("#1035FF", r3);
        circle("#1035FF", r3);

        ctx.translate(r3, 0);
        ctx.rotate(ang4 * degToRad);
        ctx.scale(s8 / s6, s8 / s6); // cancel fx of stacking scale from s6 earlier
        line("#E0D010", r4);
        circle("#E0D010", r4);

        ctx.restore(); // to center circle

        ang1 = ang1 + 1 * s1;
        ang2 = ang2 + 2 * s3;
        ang3 = ang3 + 2 * s5;
        ang4 = ang4 + 2 * s7;

        var theta1 = ang1 * degToRad;
        var theta2 = (ang1 + ang2) * degToRad;
        var theta3 = (ang1 + ang2 + ang3) * degToRad;
        var theta4 = (ang1 + ang2 + ang3 + ang4) * degToRad;

        // Coordinates of "end point" in terms of "center circle" context
        var px = r1 * s2 * Math.cos(theta1) + r2 * s4 * Math.cos(theta2)
            + r3 * s6 * Math.cos(theta3) + r4 * s8 * Math.cos(theta4);
        var py = r1 * s2 * Math.sin(theta1) + r2 * s4 * Math.sin(theta2)
            + r3 * s6 * Math.sin(theta3) + r4 * s8 * Math.sin(theta4);

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(270, py);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = "#AA10AA";
        points.unshift(py);
        var arrLength = points.length;
        for (var i = 1; i < arrLength; i++)
            ctx.fillRect(270 + i, points[i], 1, 1);
        if (arrLength > 1100) // don't want this array of points to take up too much memory
            points.splice(arrLength - 1, 1);
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
    draw();

    function clearCanvas() {
        // http://coursesweb.net/javascript/clear-canvas-context_cs
        ctx.beginPath();
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.restore();
    }
}