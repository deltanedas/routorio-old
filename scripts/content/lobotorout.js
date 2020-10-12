/* Rotatable T-shaped router that doesn't output to one side. */

// TODO: Blend like a router, not a conveyor

const lobo = extendContent(Router, "lobotorout", {
	load() {
		this.super$load();
		this.region = Core.atlas.find("router");
		this.edgeRegion = Core.atlas.find(this.name + "-edge");
	}
});

lobo.buildType = () => extendContent(Router.RouterBuild, lobo, {
	draw() {
		// No rotation
		Draw.rect(lobo.region, this.x, this.y);
		Draw.rect(lobo.edgeRegion, this.x, this.y, this.rotation * 90 + 90);
	},

	// FIXME: this doesn't work at all
	getTileTarget(item, from, set) {
		const prox = this.proximity;
		var counter = this.target;
		for (var i = 0; i < prox.size; i++) {
			if (i + counter == this.rotation - 1) continue;

			const other = prox.get((i + counter) % prox.size);
			print("Other " + other)
			if (set) this.target = (this.target + 1) % prox.size;
			if (other.tile == from && from.block() == Blocks.overflowGate) continue;
			print("Good?")
			if (other.acceptItem(this, item)) return other;
			print("Next!")
		}

		return null;
	},

	read(read, version) {
		this.super$read(read, version);
		this.target = read.b();
	},

	write(write) {
		this.super$write(write);
		write.b(this.target);
	},

	target: 0
});

module.exports = lobo;
