const multi = extendContent(Router, "multirouter", {
	load() {
		this.super$load();
		this.region = Core.atlas.find("router");
	},

	drawPlace(x, y, rot, valid) {
		const tile = Vars.world.tile(x, y);
		if (!tile) return;
		this.drawRange(tile);
	},

	drawRange(tile) {
		Lines.stroke(1);
		Draw.color(Color.coral);
		Drawf.circles(tile.drawx(), tile.drawy(), this.range);
		Draw.reset();
	},

	// brazil radius
	range: 10 * Vars.tilesize
});

multi.buildType = () => extendContent(Router.RouterBuild, multi, {
	draw() {
		this.super$draw();

		Draw.z(Layer.flyingUnit);
		for (var i = 0; i < 3; i++) {
			var rot = Time.time * 3 + i * 120;
			var x = this.x + Angles.trnsx(rot, multi.range);
			var y = this.y + Angles.trnsy(rot, multi.range);
			Draw.rect(multi.region, x, y, rot + 90);
		}
		Draw.z(Layer.block);
	},

	drawSelect() {
		multi.drawRange(this.tile);
	},

	updateTile() {
		this.super$updateTile();

		Units.nearby(Team.crux, this.x, this.y, multi.range, unit => {
			if (unit.type == UnitTypes.poly || unit.type == UnitTypes.mega) {
				unit.kill();
			}
		});
	}
});

module.exports = multi;
