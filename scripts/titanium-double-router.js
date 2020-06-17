var lock = false;

const titaniumDoubleRouter = extendContent(Router, "titanium-double-router", {
	load() {
		this.super$load();

		this.regions = [];
		for (var i = 0; i < 2; i++) {
			this.regions[i] = Core.atlas.find(this.name + "_" + i);
		}
	},

	draw(tile) {
		Draw.rect(this.regions[tile.x % 2], tile.drawx(), tile.drawy());
	},

	generateIcons() {
		return [Core.atlas.find(this.name)];
	},

	calcOffset(tile) {
		var x = tile.x;
		return x + ((x % 2) ? -1 : 1);
	},

	canPlaceOn(tile){
		const x = this.calcOffset(tile);
		const other = Vars.world.tile(x, tile.y);
		return other.block() == "air"
	},

	placed(tile) {
		this.super$placed(tile);
		const x = this.calcOffset(tile);
		Call.setTile(Vars.world.tile(x, tile.y), this, tile.team, 0);
	},

	removed(tile) {
		this.super$removed(tile);
		const x = this.calcOffset(tile);
		const key = tile.x + "," + tile.y;
		/* Prevent trying to delete the other half infinitely */
		if (!lock) {
			lock = true;
			Call.setTile(Vars.world.tile(x, tile.y), Blocks.air, tile.team, 0);
			lock = false;
		}
	}
});

module.exports = titaniumDoubleRouter;
