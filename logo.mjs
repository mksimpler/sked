let max = {x: 8, y: 4}

for (let circle of document.querySelectorAll("circle"))
{
	for (let x of "xy")
	{
		let m = max[x] - 2
		let c = "c" + x
		let prev = (circle.getAttribute(c)||"0") + "px"
		let animate = () =>
		{
			let animation = circle.animate([{[c]: prev}, {[c]: prev = `${Math.random() * m - m/2}px`}], {duration: Math.random() * 8000 + 8000, easing: `ease-in-out`})
			animation.addEventListener("finish", animate)
		}
		animate()
	}
	
	let ch = () => (Math.random() * (0xFF - 0xBB) + 0xBB)
	
	let prev = "transparent"
	let animate = () =>
	{
		let animation = circle.animate([{fill: prev}, {fill: prev = `rgb(${ch()}, ${ch()}, ${ch()})`}], {duration: Math.random() * 8000 + 4000, easing: `ease-in-out`})
		animation.addEventListener("finish", animate)
	}
	animate()
}
