/* Faster, more forceful payload conduit */

const cond = extendContent(PayloadConveyor, "payload-conduit", {
	load() {
		this.super$load();
		this.realEdge = this.edgeRegion;
		// Don't draw edge glass under the payload
		this.edgeRegion = Core.atlas.find("clear");

		this.glassRegion = Core.atlas.find(this.name + "-glass");
	},

	icon(cicon) {
		return Core.atlas.find(this.name + "-icon");
	},

	icons: () => [Core.atlas.find(this.name + "-icon")]
});

cond.buildType = () => extendContent(PayloadConveyor.PayloadConveyorBuild, cond, {
	draw() {
		this.super$draw();
		Draw.rect(cond.glassRegion, this.x, this.y, this.rotation * 90);

		for (var i = 0; i < 4; i++) {
			if (!this.blends(i)) {
				Draw.rect(cond.realEdge, this.x, this.y, i * 90);
			}
		}
	}
});

module.exports = cond;
