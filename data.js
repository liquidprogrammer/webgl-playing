var F_3D_VERTICES = new Float32Array([
  // left column front
  0,   0,  0,
  0, 150,  0,
  30,   0,  0,
  0, 150,  0,
  30, 150,  0,
  30,   0,  0,

  // top rung front
  30,   0,  0,
  30,  30,  0,
  100,   0,  0,
  30,  30,  0,
  100,  30,  0,
  100,   0,  0,

  // middle rung front
  30,  60,  0,
  30,  90,  0,
  67,  60,  0,
  30,  90,  0,
  67,  90,  0,
  67,  60,  0,

  // left column back
    0,   0,  30,
   30,   0,  30,
    0, 150,  30,
    0, 150,  30,
   30,   0,  30,
   30, 150,  30,

  // top rung back
   30,   0,  30,
  100,   0,  30,
   30,  30,  30,
   30,  30,  30,
  100,   0,  30,
  100,  30,  30,

  // middle rung back
   30,  60,  30,
   67,  60,  30,
   30,  90,  30,
   30,  90,  30,
   67,  60,  30,
   67,  90,  30,

  // top
    0,   0,   0,
  100,   0,   0,
  100,   0,  30,
    0,   0,   0,
  100,   0,  30,
    0,   0,  30,

  // top rung right
  100,   0,   0,
  100,  30,   0,
  100,  30,  30,
  100,   0,   0,
  100,  30,  30,
  100,   0,  30,

  // under top rung
  30,   30,   0,
  30,   30,  30,
  100,  30,  30,
  30,   30,   0,
  100,  30,  30,
  100,  30,   0,

  // between top rung and middle
  30,   30,   0,
  30,   60,  30,
  30,   30,  30,
  30,   30,   0,
  30,   60,   0,
  30,   60,  30,

  // top of middle rung
  30,   60,   0,
  67,   60,  30,
  30,   60,  30,
  30,   60,   0,
  67,   60,   0,
  67,   60,  30,

  // right of middle rung
  67,   60,   0,
  67,   90,  30,
  67,   60,  30,
  67,   60,   0,
  67,   90,   0,
  67,   90,  30,

  // bottom of middle rung.
  30,   90,   0,
  30,   90,  30,
  67,   90,  30,
  30,   90,   0,
  67,   90,  30,
  67,   90,   0,

  // right of bottom
  30,   90,   0,
  30,  150,  30,
  30,   90,  30,
  30,   90,   0,
  30,  150,   0,
  30,  150,  30,

  // bottom
  0,   150,   0,
  0,   150,  30,
  30,  150,  30,
  0,   150,   0,
  30,  150,  30,
  30,  150,   0,

  // left side
  0,   0,   0,
  0,   0,  30,
  0, 150,  30,
  0,   0,   0,
  0, 150,  30,
  0, 150,   0])

var F_3D_COLORS = new Uint8Array([
      // left column front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

      // top rung front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

      // middle rung front
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,
    200,  70, 120,

      // left column back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

      // top rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

      // middle rung back
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,
    80, 70, 200,

      // top
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,
    70, 200, 210,

      // top rung right
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,
    200, 200, 70,

      // under top rung
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,
    210, 100, 70,

      // between top rung and middle
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,
    210, 160, 70,

      // top of middle rung
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,
    70, 180, 210,

      // right of middle rung
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,
    100, 70, 210,

      // bottom of middle rung.
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,
    76, 210, 100,

      // right of bottom
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,
    140, 210, 80,

      // bottom
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,
    90, 130, 110,

      // left side
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220,
    160, 160, 220])


{
	var positions = F_3D_VERTICES
	var matrix = m4.xRotation(Math.PI);
	matrix = m4.multiply(matrix, m4.translation(-50, -75, -15));

	for (var ii = 0; ii < positions.length; ii += 3) {
    	var vector = m4.vectorMultiply([positions[ii + 0], positions[ii + 1], positions[ii + 2], 1], matrix);
    	positions[ii + 0] = vector[0];
    	positions[ii + 1] = vector[1];
    	positions[ii + 2] = vector[2];
	}
}

function createRects(count, isBad) {
	var vertPerItem = 12
	var verticies = new Float32Array(vertPerItem * count)

	var rects = []
	for (var i = 0; i < count; i++) {
		rects.push({
			verticies: isBad ? new Float32Array(vertPerItem) : null,
			vertPerItem: vertPerItem,
			offset: isBad ? 0 : i * vertPerItem,
			color: {
				r: 0,
				g: 0,
				b: 0,
				a: Math.random() > 0.5 ? 1 : 0.5
			}
		})
	}

	return {
		rects: rects,
		verticies: verticies
	}
}

function to255range(color) {
	return (color * 255) | 0
}

function toRgba(color) {
	return `rgba(${to255range(color.r)}, ${to255range(color.g)}, ${to255range(color.b)}, ${color.a})`
}

var testColor = 'rgba(123, 234, 123, 1)'

function simulate(rects, verticies) {
	for (var i = 0; i < rects.length; i++) {
		var rect = rects[i]

		var x = randomInt(300)
		var y = randomInt(300)
		var w = randomInt(300)
		var h = randomInt(300)
		rect.x = x
		rect.y = y
		rect.w = w
		rect.h = h
		rect.color.r = Math.random()
		rect.color.g = Math.random()
		rect.color.b = Math.random()
		rect.color.rgba = toRgba(rect.color)
		//rect.color.rgba = testColor

		var offset = rect.offset
		var verts
		if (rect.verticies) {
			// NOTE: bad version, verticies per object, hard pressure for GPU data channel
			verts = rect.verticies
		} else {
			verts = verticies
		}

		var x1 = x
		var x2 = x + w
		var y1 = y
		var y2 = y + h
		verts[offset + 0] = x1
		verts[offset + 1] = y1
		verts[offset + 2] = x2
		verts[offset + 3] = y1
		verts[offset + 4] = x1
		verts[offset + 5] = y2
		verts[offset + 6] = x1
		verts[offset + 7] = y2
		verts[offset + 8] = x2
		verts[offset + 9] = y1
		verts[offset + 10] = x2
		verts[offset + 11] = y2
	}
}
