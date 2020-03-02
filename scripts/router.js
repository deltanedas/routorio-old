// Turns router into a UV locked distributor quarter.

const opRouter = extendContent(Router, "op-router", {
	draw(tile){
		Draw.rect(
			Core.atlas.find("routorio-router_" + tile.x % 2 + "_" + tile.y % 2),
			tile.drawx(),
			tile.drawy());
	},

	generateIcons(){
		return [Core.atlas.find("routorio-distributor")]; // Vanilla distributor texture
	}
});