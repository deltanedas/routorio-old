const doubleRouter = extendContent(Router, "double-router", {
	draw(tile){
		Draw.rect(
			Core.atlas.find(this.name + "_" + tile.x % 2),
			tile.drawx(),
			tile.drawy());
	},

	generateIcons(){
		return [Core.atlas.find(this.name)];
	}
});

module.exports = doubleRouter;
