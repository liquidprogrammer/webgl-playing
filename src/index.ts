import {State, Input} from './types'
import * as Code from './code'

let codeUpdateAndRender = Code.updateAndRender

let prevTime = 0

// NOTE: all this values are needed only to set the defaults
const STATE: State = {
	gl: null!, // NOTE: this is by design, it will be initialized further
	app: null!,

	initialized: false,
	reloaded: false,
}

if (module.hot) {
	module.hot.accept('./code', () => {
		codeUpdateAndRender = require('./code').updateAndRender
		STATE.reloaded = true
	})
}

function tick(time: number): void {
	time *= 0.001
	if (!prevTime) {
		prevTime = time
	}
	let dt = time - prevTime
	let input: Input = {
		dt: dt
	}
	codeUpdateAndRender(STATE, input)
	STATE.reloaded = false

	requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
