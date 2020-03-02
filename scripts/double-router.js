const doubleRouter = extendContent(Router, "double-router", {
	draw(tile){
		Draw.rect(
			Core.atlas.find("routorio-double-router_" + tile.x % 2),
			tile.drawx(),
			tile.drawy());
	},

	generateIcons(){
		return [Core.atlas.find("routorio-double-router")];
	}
});
