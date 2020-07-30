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

/* Passback-less router with a cool design.
   Blendbits are 3 least significant nibbles, edges, outer corners and inner corners.
   The fourth nibble is unused. */

(() => {

var phase;

/* Horrible, slow thing that has O(n) lag when modifying a network.
   TODO: Save what each tile added, then remove and rebuild that tile. */
const NetworkGraph = {
	new(entity) {
		const ret = Object.create(NetworkGraph);
		ret.routers = ObjectSet.with(entity);
		ret.last = 0;
		ret.rebuild(entity);
		return ret;
	},

	addNetwork(net) {
		const routers = net.routers.asArray();
		for (var i = 0; i < routers.size; i++) {
			this.routers.add(routers.get(i));
			routers.get(i).network = this;
		}
	},

	refresh() {
		const routers = this.routers.asArray();
		for (var i = 0; i < routers.size; i++) {
			var ent = routers.get(i);
			if (ent.block == phase) {
				ent.network = null;
			}
		}

		ent = this.routers.first();
		this.routers.clear();
		this.rebuild(ent);
	},

	rebuild(root) {
		for (var i in dirs) {
			var tile = root.tile.getNearby(i);
			if (!tile) return;
			tile = tile.link();

			if (tile.block() == phase) {
				var ent = tile.entity;
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
	}
};

const diags = [
	[-1, 1],
	[1, 1],
	[1, -1],
	[-1, -1]
];

const all = [
	[-1, 1],  [0, 1],  [1, 1],
	[-1, 0],           [1, 0],
	[-1, -1], [0, -1], [1, -1]
];

const dirs = require("routorio/lib/dirs");

phase = extendContent(Router, "phase-router", {
	load() {
		this.super$load();
		// Center dot
		this.region = Core.atlas.find(this.name + "-base");

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

	draw(tile) {
		if (tile.entity.power.status < 1) {
			// Inactive state, draw disconnected version
			Draw.rect(this.icon(Cicon.full), tile.drawx(), tile.drawy());
		} else {
			this.super$draw(tile);
			this.drawEdges(tile);
			this.drawCorners(tile);
		}

		this.drawShine(tile);
	},

	drawEdges(tile) {
		const bits = tile.entity.blendBits;
		const dx = tile.drawx(), dy = tile.drawy();

		for (var i = 0; i < 4; i++) {
			// First nibble has the edges
			if ((bits & (1 << i)) == 0) {
				Draw.rect(this.edgeRegions[i >> 1], dx, dy, 90 * -i);
			}
		}
	},

	drawCorners(tile) {
		const bits = tile.entity.blendBits;
		const dx = tile.drawx(), dy = tile.drawy();

		for (var i = 0; i < 4; i++) {
			if ((bits & (256 << i)) != 0) {
				// Third nibble has the inner corners, which take priority
				Draw.rect(this.icornerRegions[i], dx, dy);
			} else if ((bits & (16 << i)) == 0) {
				// Second nibble has the outer corners
				Draw.rect(this.cornerRegions[i], dx, dy);
			}
		}
	},

	/* DeflectorWall stuff */

	drawShine(tile) {
		const ent = tile.ent();
		var hit = ent.hit;
		hit += Mathf.clamp(Math.sin(Time.time() / 10 + tile.x + tile.y) / 10, 0, 0.75);
		if (Mathf.zero(hit)) return;

		Draw.color(Color.white);
		Draw.alpha(hit / 2);
		Draw.blend(Blending.additive);
		Fill.rect(tile.drawx(), tile.drawy(), Vars.tilesize, Vars.tilesize);
		Draw.blend();
		Draw.reset();

		ent.hit = Mathf.clamp(hit - Time.delta() / this.hitTime);
	},

	/* TODO: make this actually deflect stuff */
	handleBulletHit(ent, b) {
		this.super$handleBulletHit(ent, b);
		if (b.damage > this.maxDamageDeflected(ent) || b.isDeflected()) {
			return;
		}

		const penX = Math.abs(ent.x - b.x), penY = Math.abs(ent.y - b.y);
		b.hitbox(this.rect2);
		const pos = Geometry.raycastRect(b.x - b.velocity().x * Time.delta(), b.y - b.velocity().y * Time.delta(),
			b.x + b.velocity().x * Time.delta(), b.y + b.velocity().y * Time.delta(),
			this.rect.setSize(Vars.tilesize + this.rect2.width * 2 + this.rect2.height * 2)
				.setCenter(ent.x, ent.y));

		if (pos) {
			b.set(pos.x, pos.y);
		}

		b[penX > penY ? "x" : "y"] *= -1;

		b.resetOwner(ent, ent.team);
		b.scaleTime(1);
		b.deflect();

		ent.hit = 1;
	},

	maxDamageDeflected: ent => ent.power.status >= 1 ? 30 : 10,

	/* PhaseRouter */

	placed(tile) {
		this.super$placed(tile);

		// Server doesn't care about drawing, stop
		if (!Vars.ui) return;

		this.reblendAll(tile);
		this.reblend(tile);
	},

	removed(tile) {
		this.super$removed(tile);

		const net = tile.entity.network;
		Core.app.post(run(() => {
			if (net) net.refresh();

			// Server doesn't care about drawing, stop
			if (!Vars.ui) return;
			this.reblendAll(tile);
		}));
	},

	reblendAll(tile) {
		for (var i in all) {
			var other = tile.getNearby(all[i][0], all[i][1]);
			if (other && other.block() == phase) {
				this.reblend(other);
			}
		}
	},

	reblend(tile) {
		// All edges and outer corners by default
		var bits = 0;

		for (var i = 0; i < 4; i++) {
			var prev = this.adjacent(tile, (i + 3) % 4);
			var current = this.adjacent(tile, i);;
			if (current || prev) {
				// Can't be a corner
				bits |= 16 << i;
				if (current) {
					// Can't be a straight edge
					bits |= 1 << i;
					if (prev && this.interior(tile, i)) {
						// It's a bend, show inner corner
						bits |= 256 << i;
					}
				}
			}
		}

		Effects.effect(Fx.placeBlock, tile.drawx(), tile.drawy());
		tile.entity.blendBits = bits;
	},

	adjacent(tile, i) {
		const other = tile.getNearby(dirs[i].x, dirs[i].y);
		return other && other.block() == this;
	},

	/* Whether a router is a corner of a square or just a bend */
	interior(tile, i) {
		const diag = tile.getNearby(diags[i][0], diags[i][1]);
		return diag && diag.block() != this;
	},

	/* Round-robin all outputs in this network */
	handleItem(item, tile, source) {
		const ent = tile.ent();
		const network = ent.network;
		const routers = network.routers.asArray();
		const max = routers.size + network.last;

		for (var i = network.last; i < max; i++) {
			var index = i % routers.size;
			var router = routers.get(index);
			print("Try router " + router)
			for (var o in router.outputs) {
				var output = router.outputs[o];
				print("Try out " + output)
				if (output.block().acceptItem(item, output, router.tile)) {
					output.block().handleItem(item, output, router.tile);
					network.last = index + 1;
					return;
				}
			}
		}

		Log.err("Handled unhandlable item " + item + " for " + tile + " from " + source);
		Call.removeTile(tile);
	},

	acceptItem(item, tile, source) {
		const ent = tile.ent();
		if (ent.power.status < 1) return false;
		if (!ent.network) {
			ent.network = NetworkGraph.new(ent);
		}
	print("Network size " + ent.network.routers.size);

		const routers = ent.network.routers.asArray();
		for (var i = 0; i < routers.size; i++) {
			var router = routers.get(i);
			for (var o in router.outputs) {
				var output = router.outputs[o];
				if (output.block().acceptItem(item, output, router.tile)) {
					print("yes " + output)
					return true;
				}
			}
		}
		return false;
	},

	onProximityUpdate(tile) {
		this.super$onProximityUpdate(tile);

		const ent = tile.entity;
		const prox = ent.proximity();
		ent.outputs = [];

		/* Rebuild the outputs */
		for (var i = 0; i < prox.size; i++) {
			var near = prox.get(i);
			if (near.block().hasItems && near.block() != this) {
				ent.outputs.push(near);
			}
		}
	}
});

phase.hitTime = 10;
// Temporary variables
phase.rect = new Rect(); phase.rect2 = new Rect();

phase.entityType = prov(() => {
	const ent = extendContent(Router.RouterEntity, phase, {
		read(stream, version) {
			this.super$read(stream, version);
			this._blendBits = stream.readShort();
		},

		write(stream) {
			this.super$write(stream);
			stream.writeShort(this._blendBits);
		},

		setNetwork(set) {this._network = set;},
		getNetwork() {return this._network;},
		setOutputs(set) {this._outputs = set;},
		getOutputs() {return this._outputs;},
		setBlendBits(set) {this._blendBits = set;},
		getBlendBits() {return this._blendBits;},
		setHit(set) {this._hit = set;},
		getHit() {return this._hit;}
	});

	ent._network = null;
	ent._outputs = [];
	ent._blendBits = 0;
	ent._hit = 0;
	return ent;
});

module.exports = phase;

})();
