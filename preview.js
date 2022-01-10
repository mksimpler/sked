import
{
	PerspectiveCamera,
	Scene,
	Color,
	WebGLRenderer,
	PolarGridHelper,
	LoadingManager,
	AmbientLight,
}
from "./three/build/three.module.js"

import {OrbitControls} from "./three/examples/jsm/controls/OrbitControls.js"
import {MMDLoader} from "./three/examples/jsm/loaders/MMDLoader.js"
import {DDSLoader} from "./three/examples/jsm/loaders/DDSLoader.js"

let manager = new LoadingManager()
manager.addHandler(/\.dds$/, new DDSLoader())

let camera = new PerspectiveCamera(45, 1, 1, 0x10000)
camera.position.z = 30

let scene = new Scene()

let canvas = document.querySelector("canvas")
let renderer = new WebGLRenderer({canvas, antialias: true, alpha: true})
renderer.setPixelRatio(devicePixelRatio)

scene.add(new AmbientLight(0xFFFFFF, 0.8))

let gridHelper = new PolarGridHelper(30, 10)
gridHelper.position.y = -10
scene.add(gridHelper)

let loader = new MMDLoader(manager)

loader.load("model/SKRyounaUniform.pmx", char => { scene.add(char) ; char.position.y -= 10 ; loaded() })

let controls = new OrbitControls(camera, canvas)

canvas.addEventListener("keypress", ({code}) =>
{
	switch (code)
	{
		case "KeyW": controls.target.y += 0.25 ; break
		case "KeyS": controls.target.y -= 0.25 ; break
		default: return
	}
	controls.update()
}, true)

let frame

let loop = () =>
{
	frame = requestAnimationFrame(loop)
	renderer.render(scene, camera)
}

let resized = () =>
{
	let {width, height} = canvas.getBoundingClientRect()
	canvas.width = width
	canvas.height = height
	renderer.setSize(width, height)
	canvas.removeAttribute("style")
	camera.aspect = width / height
	camera.updateProjectionMatrix()
}

resized()

addEventListener("resize", resized)

export let enable = () => { resized() ; loop() }
export let disable = () => cancelAnimationFrame(frame)

let correspondences =
{
	"Root": ["00C", "010", "014"], // body

	"Left Chest": ["0E4", "0E8", "0EC"], // breast
	"Right Chest": ["0CC", "0D0", "0D4"],

	"Left Forearm Twist": ["114", "118", "11C"], // elbows
	"Right Forearm Twist": ["0FC", "100", "104"],

	"Left Leg Twist": ["144", "148", "14C"], // thighs
	"Right Leg Twist": ["12C", "130", "134"],

	"Left Knee Twist": ["174", "178", "17C"], // knee
	"Right Knee Twist": ["15C", "160", "164"],

	"Head": ["0B4", "0B8", "0BC"],
	"Neck": ["09C", "0A0", "0A4"],

	"Hips": ["03C", "040", "044"],
}

let characters = document.querySelector("#characters")

let loaded = () =>
{
	for (let name in correspondences)
	{
		let offsets = correspondences[name]
		
		let object = scene.getObjectByName(name)
		
		let update = (i, value) =>
		{
			if (value !== value) value = 1
			object.scale.setComponent(i, value)
		}
		
		for (let i = 0 ; i < 3 ; i++)
		{
			let input = document.querySelector(`[data-offset="${offsets[i]}"]`)
			update(i, input.valueAsNumber)
			input.addEventListener("input", () => update(i, input.valueAsNumber))
			characters.addEventListener("input", () => update(i, input.valueAsNumber))
			
			let fieldset = input.closest("fieldset")
			if (!fieldset) continue
			let compound = fieldset.querySelector("legend > input")
			compound.addEventListener("input", () => update(i, input.valueAsNumber))
		}
	}
}
