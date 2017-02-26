// Made with Visual Studio 2017 RC
// Based on course web materials
function setup() {
    var canv = document.getElementById('canvId');
    var slider = document.getElementById('sliderId');
    var ctx = canv.getContext('2d');
    ctx.lineWidth=2
    ctx.translate(115, 115);
    slider.value = 1;
    function draw() {
        clearCanvas();
        var speed = slider.value;
        ctx.beginPath();
        ctx.moveTo(100, 0);
        // Connect 7 equally-spaced points on circle of radius 100
        // x = 100 * cos(angle), y = -100 * sin(angle)
        // angle = 360 / i, where i is an integer from 0 to 6
        ctx.lineTo(-90, -43);
        ctx.lineTo(62, 78);
        ctx.lineTo(-22, -97);
        ctx.lineTo(-22, 97);
        ctx.lineTo(62, -78);
        ctx.lineTo(-90, 43);
        ctx.closePath();
        ctx.strokeStyle = "#1050FF";
        ctx.stroke();
        ctx.rotate(.005 * speed);
        window.requestAnimationFrame(draw);
    };
    window.requestAnimationFrame(draw)
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