/*
	Copyright (c) deltanedas 2024

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

/* Like an impact reactor, but a router.
   Blendbits are 3 least significant nibbles, edges, outer corners and inner corners.
   The fourth nibble is unused. */

var fusion, liquid;

const networks = require("routorio/lib/network");

const connected = require("routorio/lib/connected");
const magnet = global.routorio.magnet;
const neut = global.routorio.neutron;
const plasma = global.routorio.plasma;

fusion = connected.new(LiquidRouter, "fusion-router", {
	init() {
		this.super$init();

		for (var cons of this.consumers) {
			// scale liquid router used with warmup
			if (cons instanceof ConsumeLiquid) {
				cons.multiplier = build => build.network.heat;
			}
		}
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
		this.addBar("poweroutput", ent => ent.powerBar());
		this.addBar("warmup", ent => ent.warmupBar());
	},

	getDependencies(cons) {
		this.super$getDependencies(cons);

		liquid = Vars.content.getByName(ContentType.liquid, "routorio-liquid-router");
		cons.get(liquid);
	},

	enableDrawStatus: false,
	powerGeneration: 50,

	heatRate: 0.00005,
	coolRate: -0.00004,
	// rate that warmup is lost at when below fuseHeat
	warmdownRate: -0.0001,
	shake: 0.5,

	// heat level required to start fusion + keep warmup at 1
	fuseHeat: 0.2,

	// 2 mins per router for a neutron router
	fuseTime: 120 * 60,
	// 1 min for a blocked fusion router to blow
	meltdownTime: 60 * 60,
	// Make room for plasma
	explosionRadius: 5,
	explosionDamage: 4000,
	// 40% of tiles in the blast radius are ignited
	plasmaChance: 0.4,

	plasma1: Color.valueOf("#379af1"),
	plasma2: Color.valueOf("#b24de7")
}, {
	updateTile() {
		this.super$updateTile();
		const delta = this.delta();
		const warmup = this.warmup();
		const network = this.network;

		// intentionally updating the network per-router so each router's failures can have an effect
		if (network.heat < fusion.fuseHeat) {
			network.warmup = Math.max(warmup + delta * fusion.warmdownRate, 0);
		}

		// rapidly cool if there is no fuel
		const fuel = this.liquids.currentAmount() / fusion.liquidCapacity;
		network.heat -= delta * Math.pow(1 - fuel, 3);
		// slowly cool if there is no power or missing safety equipment (magnets)
		network.heat = Mathf.clamp(network.heat + delta * (this.fusing() ? fusion.heatRate : fusion.coolRate));

		if (network.heat >= fusion.fuseHeat) {
			this.fuseTime += delta * network.heat;
			// Blocking output will violently shake the screen as a warning
			Effect.shake(fusion.shake * this.fuseTime / fusion.fuseTime, fusion.shake, this);
			if (this.items.total() == 0) {
				if (this.fuseTime >= fusion.fuseTime) {
					this.items.add(neut, 1);
					this.fuseTime -= fusion.fuseTime;
				}
			} else if (this.fuseTime >= fusion.meltdownTime) {
				this.kill();
			}
		}

		if (!this.lastItem && this.items.any()) {
			this.lastItem = this.items.first();
		}

		this.dumpNet();
	},

	draw() {
		if (this.liquids.currentAmount() > 0.001) {
			this.drawLiquid();
		}

		this.drawEdges();
		this.drawCorners();
		Draw.rect(fusion.topRegion, this.x, this.y);
	},

	drawLiquid() {
		// TODO: bloom for heat > fuseHeat
		const network = this.network;
		const heat = network.heat;
		const warmup = network.warmup;
		const flux = Mathf.absin(Time.time + this.index * 173, 6 - 5 * warmup, warmup);
		const base = Tmp.c1.set(liquid.color).lerp(fusion.plasma1, warmup);
		Draw.color(base, fusion.plasma2, flux);
		var alpha = 0.9 * this.liquids.currentAmount() / fusion.liquidCapacity;
		alpha += Math.sin(0.1 * Time.time * Math.pow(warmup + 2, warmup + 1) + flux) / 5;
		Draw.alpha(alpha);
		Fill.rect(this.x, this.y, Vars.tilesize, Vars.tilesize);
		Draw.reset();
	},

	onDestroyed() {
		this.super$onDestroyed();

		this.meltdown();
	},

	meltdown() {
		const heat = this.network.heat;
		if (heat < 0.5 || !Vars.state.rules.reactorExplosions) {
			return;
		}

		Effect.shake(40, 5, this);
		Sounds.explosionbig.at(this.tile);

		// 4-8 shockwaves centered around the reactor
		const max = 8 * heat;
		for (var i = 0; i < max; i++) {
			const x = this.x + Angles.trnsx(360 * i / max, 20);
			const y = this.y + Angles.trnsy(360 * i / max, 20);
			Fx.reactorExplosion.at(x, y);
		}

		const rad = fusion.explosionRadius;
		const rad2 = rad * rad;
		Damage.damage(this.x, this.y, rad * Vars.tilesize,
			fusion.explosionDamage * 4);

		// fill some of the explosion with plasma routers
		const cx = this.tileX(), cy = this.tileY();
		const minX = cx - rad, minY = cy - rad;
		const maxX = cx + rad, maxY = cy + rad;
		for (var y = minY; y < maxY; y++) {
			for (var x = minX; x < maxX; x++) {
				if (!Mathf.chance(fusion.plasmaChance))
					continue;

				if (Mathf.dst2(x, y, cx, cy) <= rad2) {
					Vars.world.tile(x, y).setBlock(plasma, this.team, 0);
				}
			}
		}
	},

	onRemoved() {
		this.super$onRemoved();

		this.meltdown();

		const network = this.network;
		Core.app.post(() => {
			if (network) network.refresh();

			// Server doesn't care about drawing, stop
			if (Vars.ui) this.reblendAll();
		});
	},

	acceptLiquid(source, type) {
		return type == liquid && (this.liquids.currentAmount() < fusion.liquidCapacity);
	},

	acceptStack: () => 0,
	acceptItem: () => false,

	// Searches reactor outputs instead of prox
	dumpNet() {
		const network = this.network;
		if (!network || !network.last || this.items.total() == 0) return;

		var ended = false;
		var node = network.last;
		while (!ended) {
			var output = node.to, source = node.from;
			node = node.next;
			if (output.acceptItem(source, neut)) {
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
		if (b.type.status == StatusEffects.shocked) {
			const mul = this.power.status * this.liquids.currentAmount() / fusion.liquidCapacity;
			const network = this.network;
			network.warmup = Math.min(network.warmup + mul * (b.damage / 250), 1);
			if (network.warmup > 0.999) {
				// Convert excess warmup into heat, eventually starting fusion
				network.heat = Math.min(network.heat + mul * (b.damage / 500), 1);
			}

			// More electromagnets = less damage
			// 1x1 fusion is completely safe so if you want bigger you need a few menders for the edges
			// benefit of bigger is that it will warm up much faster
			b.damage *= 1 - (this.magnets / 4);
		}
		return this.super$collision(b);
	},

	// FIXME: this is ran 6 times for a block place
	onProximityUpdate() {
		this.super$onProximityUpdate();

		const network = this.network;
		const prox = this.proximity;
		// Remove potentially broken tiles
		const outputs = [];
		this.magnets = 0;

		/* Add back the remaining tiles */
		for (var i = 0; i < prox.size; i++) {
			var near = prox.get(i);
			if (near.block.hasItems && near.block != fusion) {
				if (near.block.id == magnet.id) {
					this.magnets++;
				}
				outputs.push(near);
			}
		}
		this.outputs = outputs;

		// Very slow
		if (network) network.rebuildOutputs();
	},

	read(read, version) {
		this.super$read(read, version);

		this.blendBits = read.s();
		if (version < 4) {
			read.b();
			read.b();

			// (Slowly) remerge every network
			Core.app.post(() => {
				this.network.refresh();
			});
		} else {
			this.networkId = read.s();
			if (this.networkId == -1)
				this.networkId = null;
		}
		this.fuseTime = read.f();
	},

	write(write) {
		this.super$write(write);
		write.s(this.blendBits);
		write.s(this.networkId === undefined ? -1 : this.networkId);
		write.f(this.fuseTime);
	},

	version: () => 4,

	getPowerProduction() {
		return this.network.heat * fusion.powerGeneration;
	},

	powerBar() {
		const base = fusion.consPower.usage;
		return new Bar(
			() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(Math.max(this.powerProduction - base, 0) * 60 * this.timeScale, 1)),
			() => fusion.plasma2,
			() => this.network.heat);
	},
	warmupBar() {
		return new Bar(
			"warmup",
			fusion.plasma1,
			() => this.network.warmup);
	},

	fusing() {
		// min 2 electromagnets for routorus edges
		return this.magnets >= 2
			&& this.network.warmup > 0.999
			&& this.liquids.currentAmount() > 1
			&& this.power.status > 0.9;
	},

	/* Public fields */
	getNetwork() {
		if (this._networkId === null) {
			this._networkId = networks.create(this);
		}

		return networks.get(this._networkId);
	},
	getNetworkId() { return this._networkId; },
	setNetworkId(set) { this._networkId = set; },
	getIndex() { return this._index; },
	setIndex(set) { this._index = set; },
	getOutputs() { return this._outputs; },
	setOutputs(set) { this._outputs = set; },

	_networkId: null,
	_index: 0,
	_outputs: [],
	fuseTime: 0
});

module.exports = fusion;
