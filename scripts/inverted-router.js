print("inverted")
const invertedRouter = extendContent(Conveyor, "inverted-router", {
	draw(tile){
		const entity = tile.entity;
		const rot = entity.clogHeat <= 0.5 ? ((Time.time() * this.speed * 8 * entity.timeScale) % 4) : 0;
		Draw.rect(this.region, tile.drawx(), tile.drawy(), rot); // Instead of an animated texture, it rotates when active
	},

	// items are hidden like in a router
	drawLayer(tile){},

	generateIcons(){
		return [this.region];
	}
});
print("router")