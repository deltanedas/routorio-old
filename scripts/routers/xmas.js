importPackage(Packages.java.time);
const r = global.routorio;

function isDec() {
	return LocalDate.now().monthValue == 12;
}

const xmas = extend(Router, "xmas-router", {
	load() {
		this.super$load();

		this.description = Core.bundle.get("block." + this.name + ".description." + (this.ready() ? "ready" : "early"));

		const variants = [];
		for (var i = 0; i < 6; i++) {
			variants[i] = Core.atlas.find(this.name + "_" + (i + 1));
		}
		this.variantRegions = variants;
	},

	init() {
		this.super$init();

		// Wrapping paper is worthless when opening
		if (this.ready()) {
			//this.requirements = [];
		}

		for (var block of Vars.content.blocks().items) {
			if (block instanceof Router && block.id != this.id) {
				this.routers.push(block);
			}
		}
	},

	icon(cicon) {
		return this.variantRegions[0];
	},

	icons() {
		return [Core.atlas.find(this.name + "_1")];
	},

	canPlaceOn(tile, time) {
		return isDec() && !this.ready();
	},

	ready() {
		return isDec() && LocalDate.now().dayOfMonth > 24;
	},

	open(tile, team) {
		const x = tile.x;
		const y = tile.y;
		var router;
		// Select a random researched router
		while (!router) {
			var index = Mathf.random(0, this.routers.length - 1);
			router = this.routers[Math.floor(index)];
			// if router is too advanced or is too big
			if (!router.unlockedNow() || !Build.validPlace(router, team, x, y, 0)) {
				router = null;
			}
		}

		tile.setNet(router, team, 0);
	},

	/* Predefine non-Router routers */
	routers: [
		r.fusion,
		r.inverted
	]
});

// Save server JavaAdapter lag
if (!Vars.headless) {
	xmas.buildType = () => extend(Router.RouterBuild, xmas, {
		draw() {
			Draw.rect(this.region, this.x, this.y);
		},

		created() {
			this.super$created();
			const index = Mathf.randomSeed(this.pos(), 0, xmas.variantRegions.length - 1);
			this.region = xmas.variantRegions[Math.floor(index)];
		},

		region: null
	});
}

// Break after xmas eve to open
Events.on(BlockBuildEndEvent, e => {
	if (!e.breaking || Vars.net.client()) return;
	// just in case something with no building is destroyed
	if (!e.tile.build) return;
	const block = e.tile.build.cblock;
	if (!block || block.id != xmas.id) return;
	if (!xmas.ready()) return;

	Core.app.post(() => {
		xmas.open(e.tile, e.team);
	});
});

module.exports = xmas;
