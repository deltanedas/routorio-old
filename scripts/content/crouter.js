const crouter = extendContent(StackConveyor, "crouter", {
	load() {
		this.super$load();

		this.baseRegion = Core.atlas.find(this.name + "-base");
		// For drawRequest
		this.regions[0] = this.baseRegion;
	},

	blends(tile, rot, otherx, othery, otherrot, other) {
		/* Function overloading is very messy with rhino */
		if (other == undefined && othery != undefined) {
			const directional = otherx;
			const direction = othery;
			const checkWorld = otherrot;

			const realDir = direction % 4;
			if (directional && directional[realDir]) {
				const req = directional[realDir];
				if (this.blends(tile, rot, req.x, req.y, req.rotation, req.block)) {
					return true;
				}
			}
			if (!checkWorld) return false;

			otherx = direction;
			othery = undefined;
		}

		if (othery == undefined) {
			const direction = otherx;
			other = tile.nearbyBuild(direction % 4);
			if (!other || other.team != tile.team()) return false;

			otherx = other.tileX();
			othery = other.tileY();
			otherrot = other.rotation;
			other = other.block;
		}

		// Blend with roomba and roomba router only
		return other instanceof StackConveyor;
	}
});

crouter.buildType = () => extendContent(StackConveyor.StackConveyorBuild, crouter, {
	draw() {
		Draw.rect(crouter.baseRegion, this.x, this.y);

		for (var i = 0; i < 4; i++) {
			if ((this.blendprox & (1 << i)) == 0) {
				Draw.rect(crouter.edgeRegion, this.x, this.y, i * 90);
			}
		}
	},

	updateTile() {
		// Instead of having a cooldown, require the router to be full and depend on ALL inputs
		if (this.items.total() < crouter.itemCapacity) return;

		if (!this.lastItem) {
			this.lastItem = this.items.first();
		}

		const other = this.getTileTarget(true);
		if (!other || other.link != -1) return;

		other.items.add(this.items);
		this.items.clear();
		other.lastItem = this.lastItem;

		other.link = this.tile.pos();
		this.link = -1;

		this.cooldown = crouter.recharge;
		other.cooldown = 1;
	},

	onProximityUpdate() {
		this.super$onProximityUpdate();

		// We don't care about state, only remake blendprox

		this.blendprox = 0;
		for (var i = 0; i < 4; i++) {
			if (crouter.blends(this.tile, 0, i)) {
				this.blendprox |= (1 << i);
			}
		}
	},

	acceptItem(source, item) {
		if (source == this) return true;
		if (this.cooldown > crouter.recharge - 1) return false;
		return (this.items.total() > 0 && !this.items.has(item))
			|| (this.items.total() >= this.getMaximumAccepted(item));
			// ignore source direction and state
	},

	// routing is mechanical idk
	shouldIdleSound: () => true,

	getTileTarget(set) {
		// TODO: controllable roomba router?

		const prox = this.proximity;
		var counter = this.rotation;
		for (var i = 0; i < prox.size; i++) {
			var other = prox.get((counter + i) % prox.size);
			if (set) this.rotation = (this.rotation + 1) % prox.size;
			if (other.block instanceof StackConveyor && this.outputsItem(other)) {
				return other;
			}
		}
		return null;
	},

	outputsItem(other) {
		return (other.block == crouter || other.front() != this)
			&& (other.items.total() == 0);
	}
});

module.exports = crouter;
