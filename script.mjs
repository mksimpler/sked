let hex = string => parseInt(string, 0x10)

let input = document.querySelector("#file")

let characters = document.querySelector("#characters")
let scales = document.querySelectorAll("[data-offset]")

let buffer
let view

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

input.addEventListener("change", async () =>
{
	let file = input.files[0]
	if (!file) return
	
	load.hidden = true
	buffer = await file.arrayBuffer()
	view = new DataView(buffer)
	input.value = ""
	main.hidden = false
})

for (let button of document.querySelectorAll("[data-preset]"))
{
	let url = button.dataset.preset
	button.addEventListener("click", async () =>
	{
		load.hidden = true
		buffer = await (await fetch(url)).arrayBuffer()
		view = new DataView(buffer)
		main.hidden = false
	})
}

for (let input of scales)
{
	input.type = "number"
	input.step = "any"
	input.min = "0"
	input.step = "0.05"
	input.title = ""
	
	let average
	
	let initial
	let previous
	
	let update = () =>
	{
		if (average.checked)
		{
			let total = 0
			
			let options = characters.querySelectorAll("option:checked")
			for (let option of options)
				total += getFloat(hex(input.dataset.offset) + hex(option.value))
			
			initial = total / options.length
			if (initial === initial) input.valueAsNumber = round(initial)
			else input.value = ""
			previous = initial
		}
		else
		{
			let offset = hex(input.dataset.offset)
			
			let options = characters.querySelectorAll("option:checked")
			
			let value = view.getUint32(offset + hex(options[options.length - 1].value))
			
			let i = options.length - 2
			
			while (i >= 0)
			{
				if (value !== view.getUint32(offset + hex(options[i].value))) break
				i--
			}
			if (i < 0) input.valueAsNumber = round(getFloat(offset + hex(options[options.length - 1].value)))
			else input.value = ""
		}
	}
	
	characters.addEventListener("input", update)
	
	input.addEventListener("input", () =>
	{
		let value = input.valueAsNumber
		
		let axisOffset = hex(input.dataset.offset)
		
		for (let option of characters.querySelectorAll("option:checked"))
		{
			let offset = axisOffset + hex(option.value)
			if (average.checked)
				setFloat(offset, value / initial * getFloat(offset))
			else
				setFloat(offset, value)
		}
		
		initial = value
	})
	
	let fieldset = input.closest("fieldset")
	if (fieldset)
	{
		input.addEventListener("dblclick", () => input.classList.toggle("free"))
		setTimeout(() =>
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
		
		let rounded = Math.round(float * scale) / scale
		floatView.setFloat32(0, rounded)
		if (floatView.getFloat32(0) === short)
			return rounded
	}
	// Should never get here. (Hopefully.)
}

let compound = document.querySelectorAll("legend > input")

document.querySelector("#download").addEventListener("click", () =>
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
	input.step = "any"
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
	
	let initial
	let previous
	
	let update = () =>
	{
		if (average.checked)
		{
			let total = 0
			let count = 0
			
			for (let subInput of inputs)
			if (!subInput.matches(".free"))
			for (let option of characters.querySelectorAll("option:checked"))
			{
				count++
				total += getFloat(hex(subInput.dataset.offset) + hex(option.value))
			}
			
			initial = total / count
			if (initial === initial) input.valueAsNumber = round(initial)
			else input.value = ""
			previous = initial
		}
		else
		{
			let i = inputs.length - 1
			while (i >= 0)
			{
				if (!inputs[i].matches(".free")) break
				i--
			}
			
			let value = inputs[i].valueAsNumber
			while (i > 0)
			{
				i--
				if (inputs[i].matches(".free")) continue
				if (inputs[i].valueAsNumber !== value) break
			}
			if (i <= 0) input.valueAsNumber = value
			else input.value = ""
		}
	}
	
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
	
	let inputs = input.closest("fieldset").querySelectorAll(":not(legend) > input")
	
	input.addEventListener("input", () =>
	{
		let value = input.valueAsNumber
		if (value !== value) return
		
		if (average.checked && value < 0.1)
		{
			value = 0.1
			input.valueAsNumber = value
		}
		
		for (let subInput of inputs)
		if (!subInput.matches(".free"))
		{
			if (average.checked)
			{
				let current = subInput.valueAsNumber
				if (current === current)
					subInput.valueAsNumber = value / previous * current
			}
			else
			{
				subInput.valueAsNumber = value
			}
		}
		
		previous = value
	})
	
	input.addEventListener("change", () =>
	{
		let value = input.valueAsNumber
		
		for (let subInput of inputs)
		if (!subInput.matches(".free"))
		for (let option of characters.querySelectorAll("option:checked"))
		{
			let offset = hex(subInput.dataset.offset) + hex(option.value)
			if (average.checked)
				setFloat(offset, value / initial * getFloat(offset))
			else
				setFloat(offset, value)
		}
		
		initial = value
	})
	
	for (let subInput of inputs)
	{
		subInput.addEventListener("input", update)
		subInput.addEventListener("dblclick", update)
	}
	characters.addEventListener("input", update)
}

let preview

let details = document.querySelector("#preview")
details.addEventListener("toggle", async () =>
{
	if (!preview) preview = await import("./preview.mjs")
	if (details.open) preview.enable()
	else preview.disable()
})
