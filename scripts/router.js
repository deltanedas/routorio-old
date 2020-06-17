// Turns router into a UV locked distributor quarter.

const opRouter = extendContent(Router, "op-router", {
	load() {
		this.super$load();
		this.regions = [];
		for (var i = 0; i < 4; i++) {
			this.regions[i] = Core.atlas.find(this.name + "_" + i);
		}
	},

	getRegion(tile) {
		return this.regions[(tile.x % 2) + 2 * (tile.y % 2)];
	},

	draw(tile){
		Draw.rect(this.getRegion(tile), tile.drawx(), tile.drawy());
	},

	generateIcons(){
		return [Core.atlas.find("routorio-distributor")]; // Vanilla distributor texture
	}
});
