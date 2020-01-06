// Turns router into a UV locked distributor quarter.

const opRouter = extendContent(Router, "op-router", {
	draw: function(tile){
		Draw.rect(
			Core.atlas.find("mindustorio-fake-router_" + tile.x % 2 + "_" + tile.y % 2),
			tile.drawx(),
			tile.drawy());
	},

	generateIcons: function(){
		return [Core.atlas.find("mindustorio-fake-distributor")]; // Vanilla distributor texture
	}
});