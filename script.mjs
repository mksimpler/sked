let hex = string => parseInt(string, 0x10)

let input = document.querySelector("#file")

let characters = document.querySelector("#characters")
let scales = document.querySelectorAll("[data-offset]")

let buffer
let view

export let setBuffer = value =>
{
	buffer = value
	view = new DataView(buffer)
	for (let f of start) f()
}

let floatView = new DataView(new ArrayBuffer(4))
let setFloat = (offset, float) =>
{
	floatView.setFloat32(0, float)
	view.setUint8(offset + 0, floatView.getUint8(3))
	view.setUint8(offset + 1, floatView.getUint8(2))
	view.setUint8(offset + 2, floatView.getUint8(1))
	view.setUint8(offset + 3, floatView.getUint8(0))
}
let getFloat = offset =>
{
	floatView.setUint8(0, view.getUint8(offset + 3))
	floatView.setUint8(1, view.getUint8(offset + 2))
	floatView.setUint8(2, view.getUint8(offset + 1))
	floatView.setUint8(3, view.getUint8(offset + 0))
	return floatView.getFloat32(0)
}

let load = document.querySelector("#load")
let main = document.querySelector("main > div")

let start = []

if (input)
	input.addEventListener("change", async () =>
	{
		let file = input.files[0]
		if (!file) return
		
		load.hidden = true
		setBuffer(await file.arrayBuffer())
		input.value = ""
		main.hidden = false
	})

for (let button of document.querySelectorAll("[data-preset]"))
{
	let url = button.dataset.preset
	button.addEventListener("click", async () =>
	{
		load.hidden = true
		setBuffer(await (await fetch(url)).arrayBuffer())
		main.hidden = false
	})
}

let getOffsets = inputs =>
{
	let optionOffsets = [...characters.querySelectorAll("option:checked")].map(option => hex(option.value))
	let inputOffsets = inputs.map(input => hex(input.dataset.offset))
	
	return inputOffsets.flatMap(offset1 => optionOffsets.map(offset2 => offset1 + offset2))
}

let updateInput = (input, inputs, average, setCurrent) =>
{
	let offsets = getOffsets(inputs)
	
	input.disabled = !offsets.length
	
	if (input.disabled)
	{
		input.value = ""
		return
	}
	
	if (average)
	{
		let value = offsets.map(offset => getFloat(offset)).reduce((a, b) => a + b, 0) / offsets.length
		if (value === value) input.valueAsNumber = round(value)
		else input.value = ""
		input.disabled = value < 0.05
		setCurrent(value)
	}
	else
	{
		let value = view.getUint32(offsets[0])
		for (let offset of offsets)
		{
			if (value !== view.getUint32(offset))
			{
				input.value = ""
				return
			}
		}
		input.valueAsNumber = round(getFloat(offsets[0]))
	}
}

let updateFile = (input, inputs, average, initial) =>
{
	let value = input.valueAsNumber
	let offsets = getOffsets(inputs)
	if (average) for (let offset of offsets) setFloat(offset, value / initial * getFloat(offset))
	else for (let offset of offsets) setFloat(offset, value)
}

let later = []

let modeChangeListenerMap = new Map()

for (let input of scales)
{
	input.type = "number"
	input.min = "0"
	input.step = "0.05"
	input.title = ""
	
	let average
	
	let initial
	
	let update = () => updateInput(input, [input], average.checked, value => initial = value)
	let reflect = () => { updateFile(input, [input], average.checked, initial) ; initial = input.valueAsNumber }
	start.push(update)
	
	characters.addEventListener("input", update)
	
	input.addEventListener("input", () =>
	{
		if (average.checked && input.valueAsNumber < 0.05) input.valueAsNumber = 0.05
		reflect()
	})
	
	let fieldset = input.closest("fieldset")
	if (fieldset)
	{
		let listeners = []
		modeChangeListenerMap.set(input, listeners)
		
		let toggleMode = () =>
		{
			input.classList.toggle("free")
			for (let listener of listeners) listener()
		}
		
		let lastTap = NaN
		let t = -1
		input.addEventListener("pointerdown", () => t = setTimeout(toggleMode, 500))
		input.addEventListener("pointerup", () =>
		{
			clearTimeout(t)
			
			let now = performance.now()
			if (lastTap > now - 500) toggleMode()
			else lastTap = now
		})
		
		input.addEventListener("keyup", event =>
		{
			let {code, ctrlKey} = event
			if (code === "Space" && ctrlKey)
			{
				toggleMode()
				event.preventDefault()
			}
		})
		
		later.push(() =>
		{
			average = fieldset.querySelector(`legend > input[type="checkbox"]`)
			average.addEventListener("change", update)
		})
	}
	else
	{
		average = {checked: false}
	}
}

// Derived from this: https://stackoverflow.com/a/35708911
// Note that the problem is a little different, since we’re trying to find the double precision number whose shortest decimal representation round‐trips back to the given “single precision number” (represented as a double precision).
// Whereas the problem in the question is to find the shortest string that round‐trips.
// (Hopefully this makes sense and works, and there are no edge‐cases.)
let powers = [6, 7, 8, 9]
let round = float =>
{
	floatView.setFloat32(0, float)
	let short = floatView.getFloat32(0)
	for (let power of powers)
	{
		let scale = 10 ** power
		
		let rounded = Math.round(short * scale) / scale
		floatView.setFloat32(0, rounded)
		if (floatView.getFloat32(0) === short)
			return rounded
	}
	// Should never get here. (Hopefully.)
}

let compound = document.querySelectorAll("legend > input")

let download = document.querySelector("#download")
if (download)
	download.addEventListener("click", () =>
	{
		let a = document.createElement("a")
		document.body.append(a)
		let url = URL.createObjectURL(new Blob([buffer]))
		a.href = url
		a.download = "plbodyscl.bin"
		a.click()
		URL.revokeObjectURL(url)
		a.remove()
	})

let i = 0

for (let input of compound)
{
	i++
	
	input.type = "number"
	input.min = "0"
	input.step = "0.05"
	input.title = ""
	
	let average = document.createElement("input")
	average.type = "checkbox"
	average.id = "c" + i
	average.title = "average mode"
	
	let label = document.createElement("label")
	label.textContent = "="
	label.htmlFor = "c" + i
	label.classList.add("button")
	label.title = "toggle mode"
	
	input.after(" ", average, label)
	
	let inputs = [...input.closest("fieldset").querySelectorAll(":not(legend) > input")]
	
	let initial
	let previous
	
	let update = () => updateInput(input, inputs.filter(input => !input.matches(".free")), average.checked, value => initial = previous = value)
	let reflect = () => { updateFile(input, inputs.filter(input => !input.matches(".free")), average.checked, initial) ; initial = previous = input.valueAsNumber}
	start.push(update)
	
	average.addEventListener("click", () =>
	{
		if (average.checked)
		{
			label.textContent = "÷"
			input.min = "0.1"
		}
		else
		{
			label.textContent = "="
			input.min = "0"
		}
		update()
	})
	
	input.addEventListener("input", () =>
	{
		let value = input.valueAsNumber
		
		if (average.checked && value < 0.05) value = input.valueAsNumber = 0.05
		
		for (let subInput of inputs)
		if (!subInput.matches(".free"))
		{
			if (average.checked)
			{
				let current = subInput.valueAsNumber
				if (current === current)
					subInput.valueAsNumber = round(value / previous * current)
			}
			else
			{
				if (value === value) subInput.valueAsNumber = round(value)
				else subInput.value = ""
			}
		}
		
		previous = value
	})
	
	input.addEventListener("change", reflect)
	
	for (let subInput of inputs)
	{
		subInput.addEventListener("input", update)
		modeChangeListenerMap.get(subInput).push(update)
	}
	characters.addEventListener("input", update)
}

for (let f of later) f()

let preview

let canvas = document.querySelector("#canvas")
let details = document.querySelector("#preview")
if (details)
	details.addEventListener("toggle", async () =>
	{
		document.body.classList.toggle("preview", details.open)
		canvas.hidden = !details.open
		if (!preview) preview = await import("./preview.mjs")
		if (details.open) preview.enable()
		else preview.disable()
	})
