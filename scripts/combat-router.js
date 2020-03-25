const combatRouter = extendContent(BurstTurret, "combat-router", {
	load() {
		this.super$load();
		this.facade = Core.atlas.find("routorio-totally-4-distributors");
	},

	draw(tile) {
		Draw.rect(tile.team == Vars.player.team ? this.baseRegion : this.facade, tile.drawx(), tile.drawy());
	},

	drawLayer(tile) {
		if (tile.team == Vars.player.team) {
			this.super$drawLayer(tile);
		}
	}
});