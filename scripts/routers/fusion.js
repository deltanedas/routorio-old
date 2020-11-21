/*
	Copyright (c) DeltaNedas 2020

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// FIXME: implement fusion graph fully to fix crashes

/* Like an impact reactor, but a router.
   Blendbits are 3 least significant nibbles, edges, outer corners and inner corners.
   The fourth nibble is unused. */

var fusion, liquid;

const dirs = require("routorio/lib/dirs");

const FusionGraph = {
	new(entity) {
		const ret = Object.create(FusionGraph);
		ret.routers = ObjectSet.with(entity);
		// Linked list nodes
		ret.rebuild(entity);
		ret.rebuildOutputs();
		return ret;
	},

	addNetwork(network) {
		const routers = network.routers.asArray();
		for (var i = 0; i < routers.size; i++) {
			this.routers.add(routers.get(i));
			routers.get(i).network = this;
		}

		this.warmup = (this.warmup + network.warmup) / 2;
	},

	refresh() {
		const routers = this.routers.asArray();
		for (var i = 0; i < routers.size; i++) {
			var ent = routers.get(i);
			if (ent.block == fusion) {
				ent.network = null;
			}
		}

		ent = routers.peek();
		this.routers.clear();
		this.rebuild(ent);
		this.rebuildOutputs();
	},

	rebuild(root) {
		for (var i in dirs) {
			var tile = root.tile.nearby(i);
			if (!tile) return;

			if (tile.block() == fusion) {
				var ent = tile.bc();
				if (this.routers.add(ent)) {
					if (ent.network) {
						if (ent.network == this) return;
						this.addNetwork(ent.network);
					}
					ent.network = this;
					this.rebuild(ent);
				}
			}
		}
	},

	rebuildOutputs() {
		const routers = this.routers.asArray();

		var last, indices = 0;
		for (var i = 0; i < routers.size; i++) {
			var router = routers.get(i);
			// FIXME: have this iterate in a defined order
			router.index = indices++;
			for (var o in router.outputs) {
				var node = {
					port: port,
					prev: node
				};

				if (last) {
					last.next = node;
				} else {
					this.last = this.begin = node;
				}
				last = node;
			}
		}
		if (!node) return;

		this.end = node;
		this.end.next = this.begin;
		this.begin.prev = node;
	},

	begin: null,
	end: null,
	last: null,

	warmup: 0
};

const connected = require("routorio/lib/connected");
const surge = this.global.routorio["surge-router"];
const neut = this.global.routorio.neutron;

fusion = connected.new(LiquidRouter, "fusion-router", {
	init() {
		this.super$init();
		liquid = Vars.content.getByName(ContentType.liquid, "routorio-liquid-router");
	},

	load() {
		this.super$load();
		// Center dot
		this.topRegion = Core.atlas.find(this.name + "-top");

		/* Edges and corners which depend on the placement */
		this.edgeRegions = [
			Core.atlas.find(this.name + "-edge_0"),
			Core.atlas.find(this.name + "-edge_1")
		];

		this.cornerRegions = [];
		this.icornerRegions = [];
		for (var i = 0; i < 4; i++) {
			this.cornerRegions[i] = Core.atlas.find(this.name + "-corner_" + i);
			this.icornerRegions[i] = Core.atlas.find(this.name + "-icorner_" + i);
		}
	},

	icons() {
		return [Core.atlas.find(this.name)]
	},

	setBars() {
		this.super$setBars();
		this.bars.add("poweroutput", ent => ent.powerBar());
		this.bars.add("warmup", ent => ent.warmupBar());
	},

	enableDrawStatus: false,
	powerGeneration: 50,
	heatRate: 0.00005,
	coolRate: -0.00004,
	shake: 0.5,
	// 2 mins per router for a neutron router
	fuseTime: 120 * 60,
	// 1 min for a blocked fusion router to blow
	meltdownTime: 180 * 60,
	// Make room for plasma
	explosionRadius: 5,
	explosionDamage: 4000,
	// 40% of every air tile in the blast radius is ignited
	plasmaChance: 0.4,

	plasma1: Color.valueOf("#f19a37"),
	plasma2: Color.valueOf("#b24de7")
}, {
	updateTile() {
		this.super$updateTile();
		if (this.warmup() > 0.001 && this.warmup() < 0.9) {
			this.network.warmup = Math.max(this.warmup() + fusion.coolRate, 0);
		}
		this.heat = Mathf.clamp(this.heat + (this.valid() ? fusion.heatRate : fusion.coolRate));

		if (this.heat >= 0.2) {
			this.fuseTime += this.delta() * this.heat;
			// Blocking output will violently shake the screen as a warning
			Effect.shake(fusion.shake * this.fuseTime / fusion.fuseTime, fusion.shake, this);
			if (this.items.total() == 0) {
				if (this.fuseTime >= fusion.fuseTime) {
					this.items.add(neut, 1);
					this.fuseTime = 0;
				}
			} else if (this.fuseTime >= fusion.meltdownTime) {
				this.meltdown();
			}
		}

		if (!this.lastItem && this.items.any()) {
			this.lastItem = this.items.first();
		}

		this.dumpNet();
	},

	draw() {
		if (this.liquids.total() > 0.001) {
			this.drawLiquid();
		}

		this.drawEdges();
		this.drawCorners();
		Draw.rect(fusion.topRegion, this.x, this.y);
	},

	drawLiquid() {
		Draw.color(liquid.color, fusion.plasma2, this.warmup * this.heat * Mathf.absin(Time.time() / 100, 0.9, 1));
		var alpha = 0.9 * this.liquids.total() / fusion.liquidCapacity;
		alpha += Math.sin(0.1 * Time.time() * Math.pow(this.heat + 2, this.heat + 1) + this.index) / 5;
		Draw.alpha(alpha);
		Fill.rect(this.x, this.y, Vars.tilesize, Vars.tilesize);
		Draw.reset();
	},

	meltdown() {
		Effect.shake(40, 5, this);
		this.kill();
	},

	onDestroyed() {
		this.super$onDestroyed();

		Sounds.explosionbig.at(this.tile);
		if (this.heat < 0.5 || !Vars.state.rules.reactorExplosions) {
			return;
		}

		// 4-8 shockwaves centered around the reactor
		const max = 8 * this.heat;
		for (var i = 0; i < max; i++) {
			const x = this.x + Angles.trnsx(360 * i / max, 20);
			const y = this.y + Angles.trnsy(360 * i / max, 20);
			Fx.nuclearShockwave.at(x, y);
		}

		Damage.damage(this.x, this.y, fusion.explosionRadius * Vars.tilesize,
			fusion.explosionDamage * 4);

		// TODO: plasma routers
	},

	onRemoved() {
		this.super$onRemoved();

		const network = this.network;
		Core.app.post(() => {
			if (network) network.refresh();

			// Server doesn't care about drawing, stop
			if (!Vars.ui) return;
			this.reblendAll();
		});
	},

	acceptLiquid(source, type) {
		return type == liquid && (this.liquids.total() < fusion.liquidCapacity);
	},

	acceptStack: () => 0,
	acceptItem: () => false,

	// Searches reactor outputs instead of prox
	// TODO fix
	dumpNet() {
print([this.network, this.network ? this.network.last : "h", this.items.total()])
		const network = this.network;
		if (!network || !network.last || this.items.total() == 0) return;

		var ended = false;
		var node = network.last;
		while (!ended) {
			var output = node.to, source = node.from;
			node = node.next;
print("Try "+ output)
			if (output.acceptItem(source, neut)) {
print("yes")
				network.last = node;
				output.handleItem(source, neut);
				this.items.take();
				return;
			}
			ended = node == network.end;
		}
	},

	canDumpLiquid: (to, l) => to.block == fusion,

	/* Check for lightning to ignite */
	collision(b) {
		if (this.network && b.type.status == StatusEffects.shocked) {
			const mul = this.power.status * this.liquids.total() / fusion.liquidCapacity;
			this.network.warmup = Math.min(this.warmup() + mul * (b.damage / 250), 1);
			if (this.warmup == 1) {
				// Convert excess warmup into heat, falls off
				this.heat = Math.min(this.heat + mul * (b.damage / this.heat), 1);
			}

			// More surge routers = less damage
			b.damage *= this.magnets / 8;
		}
		return this.super$collision(b);
	},

	// FIXME: this is ran 6 times for a block place
	onProximityUpdate() {
		this.super$onProximityUpdate();

		const network = this.network;
		const prox = this.proximity;
		// Remove potentially broken tiles
		this.outputs = [];
		this.magnets = 0;

		/* Add back the remaining tiles */
		for (var i = 0; i < prox.size; i++) {
			var near = prox.get(i);
			if (near.block.hasItems && near.block != fusion) {
				print("Potential output " + near.tile)
				if (near.block.id == surge.id) {
					this.magnets++;
				}
				this.outputs.push(near);
			}
		}

		// Very slow
		if (network) network.rebuildOutputs();
	},

	read(read, version) {
		this.super$read(read, version);

		this.blendBits = read.s();
		if (version != 1) {
			this.network.warmup = read.b() / 128;
			// some weird signing shit idk
			if (this.warmup() < 0) {
				this.network.warmup = -this.warmup();
			}
		}
		// Heat is averaged between networks
		this.heat = read.b() / 128;
		if (version == 1) read.s();
		if (version > 2) {
			this.fuseTime = read.f();
		}

		// (Slowly) remerge every network
		Core.app.post(() => {
			this.network.refresh();
		});
	},

	write(write) {
		this.super$write(write);
		write.s(this.blendBits);
		write.b(this.network.warmup * 128);
		// Heat is averaged between networks
		write.b(this.heat * 128);
		write.f(this.fuseTime);
	},

	version: () => 3,

	getPowerProduction() {
		return this.heat * fusion.powerGeneration;
	},

	warmup() {
		return this.network ? this.network.warmup : 0;
	},

	powerBar() {
		const base = fusion.consumes.getPower().usage;
		return new Bar(
			() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(Math.max(this.powerProduction - base, 0) * 60 * this.timeScale, 1)),
			() => Pal.powerBar,
			() => this.heat);
	},
	warmupBar() {
		return new Bar(
			"warmup",
			fusion.plasma2,
			() => this.warmup());
	},

	valid() {
		return this.warmup() > 0.999
			&& this.liquids.total() > 1
			&& this.power.status > 0.9;
	},

	created() {
		this.super$created();
		if (!this.network) {
			this.network = FusionGraph.new(this);
		}
	},

	/* Public fields */
	getNetwork() { return this._network; },
	setNetwork(set) { this._network = set; },
	getIndex() { return this._index; },
	setIndex(set) { this._index = set; },

	_network: null,
	heat: 0,
	_index: 0,
	fuseTime: 0
});

module.exports = fusion;
