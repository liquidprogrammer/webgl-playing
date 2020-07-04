var STATE = {
  width: 0,
  height: 0,
  displayWidth: 0,
  displayHeight: 0,
  perspectiveM: [],
  rects: null,
  verticies: null,
};
var canvas = document.createElement("canvas");
function resizeCanvas() {
	resizeCanvas0(STATE, canvas, 65, 1, 2000)
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
document.body.appendChild(canvas);

var ctx = canvas.getContext("2d");

resizeCtx(ctx, STATE);

function drawRect(ctx, rect) {
	var color = rect.color
	ctx.fillStyle = color.rgba
	// NOTE: just to simulate matrix transforms
	ctx.fillRect(rect.x + 100, rect.y + 50, rect.w, rect.h)
}

var _r = createRects(20000, false)
STATE.rects = _r.rects
STATE.verticies = _r.verticies

simulate(STATE.rects, STATE.verticies)

var prevTime = 0
var clearColor = 'rgba(123, 123, 123, 1)'

function drawScene(ctx, dt) {
	ctx.fillStyle = clearColor
	ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

	var m = m3.projection(STATE.width, STATE.height)
	m = m3.multiply(m, m3.translation(100, 50))
	m = m3.multiply(m, m3.rotation(0))
	m = m3.multiply(m, m3.scaling(1, 1))

	simulate(STATE.rects, STATE.verticies)
	
	for (var i = 0; i < STATE.rects.length; i++) {
		var rect = STATE.rects[i]
		drawRect(ctx, rect)
	}

	requestAnimationFrame((time) => {
		if (!prevTime) {
			prevTime = time
		}
		var dt = time - prevTime
		prevTime = time
		drawScene(ctx, dt)
	})
}
drawScene(ctx, 0)
