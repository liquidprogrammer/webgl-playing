import {State, Input} from './types'
import * as Code from './code'

let codeUpdateAndRender = Code.updateAndRender

let prevTime = 0

let canvas = document.createElement('canvas')
let gl = canvas.getContext('webgl')!
if (!gl) {
	let div = document.createElement('div')
	div.setAttribute('style', 'width: 100%; height: 100%; background: red;')
	div.innerText = 'NO WEBGL SUPPORT'
	document.body.appendChild(div)
} else {
	// NOTE: all this values are needed only to set the defaults
	const state: State = {
		gl: null!, // NOTE: this is by design, it will be initialized further
		app: null!,

		canvasW: 0,
		canvasH: 0,
		widthOverHeight: 0,
		displayW: 0,
		displayH: 0,

		initialized: false,
		reloaded: false,
	}

	let resizeCanvas = () => {
		state.canvasW = document.documentElement.clientWidth
		state.canvasH = document.documentElement.clientHeight
		state.widthOverHeight = state.canvasW / state.canvasH
		// TODO: devicePixelRatio is not supported everywhere, may be we need to
		// check backingStorePixelRatio too (google that)
		// TODO: may be we don't really need that. This value can be huge (3-5) and we will draw much more pixels because of that
		state.displayW = state.canvasW * window.devicePixelRatio
		state.displayH = state.canvasH * window.devicePixelRatio

		canvas.style.cssText = `width: ${state.canvasW}px; height: ${state.canvasH}px;`
	}
	window.addEventListener("resize", resizeCanvas)
	resizeCanvas()
	document.body.appendChild(canvas)

	let input: Input = {
		dt: 0,
		pointer: {
			clientX: 0,
			clientY: 0,
			isDown: false,
			wasDown: false,
		},
		wheel: {
			clientX: 0,
			clientY: 0,
			deltaY: 0,
		}
	}

	canvas.addEventListener('mousedown', event => {
		input.pointer.clientX = event.clientX
		input.pointer.clientY = event.clientY
		input.pointer.isDown = true
		input.pointer.wasDown = true
	})
	canvas.addEventListener('mouseup', () => {
		input.pointer.isDown = false
	})
	canvas.addEventListener('mousemove', event => {
		input.pointer.clientX = event.clientX
		input.pointer.clientY = event.clientY
	})

	canvas.addEventListener('wheel', (e) => {
		e.preventDefault()

		input.wheel.clientX = e.clientX
		input.wheel.clientY = e.clientY
		input.wheel.deltaY += e.deltaY
	})

	// TODO: process keyboard events
	// TODO: process gamepad events
	// TODO: generalize all inputs to one format

	if (module.hot) {
		module.hot.accept('./code', () => {
			codeUpdateAndRender = require('./code').updateAndRender
			state.reloaded = true
		})
	}

	let tick = (time: number) => {
		time *= 0.001
		if (!prevTime) {
			prevTime = time
		}
		let dt = time - prevTime

		codeUpdateAndRender(gl, state, input)

		state.reloaded = false
		input.pointer.wasDown = input.pointer.isDown
		input.wheel.deltaY = 0

		requestAnimationFrame(tick)
	}
	requestAnimationFrame(tick)
}
