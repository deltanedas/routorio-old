const doubleRouter = extendContent(Router, "double-router", {
	draw: function(tile){
		Draw.rect(
			Core.atlas.find("mindustorio-fake-double-router_" + tile.x % 2),
			tile.drawx(),
			tile.drawy());
	},

	generateIcons: function(){
		return [Core.atlas.find("mindustorio-fake-double-router")];
	}
});
