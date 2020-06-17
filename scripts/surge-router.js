const surge = extendContent(Router, "surge-router", {
	update(tile) {
		const ent = tile.entity;
		// Only route items when there is power
		if (ent.cons.valid()) {
			ent.cons.trigger();
			this.super$update(tile);
		}
	},

	// Add random spark effects
	handleItem(item, tile, source) {
		this.super$handleItem(item, tile, source);

		if (Vars.ui && Mathf.chance(this.sparkChance)) {
			Effects.effect(Fx.lancerLaserCharge, Items.surgealloy.color, tile.drawx(), tile.drawy(), Mathf.random(0, 360));
		}
	}
});
surge.sparkChance = 0.1;

module.exports = surge;
