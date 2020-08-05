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

var phase;

const NetworkGraph = {
	new(entity) {
		const ret = Object.create(NetworkGraph);
		ret.routers = ObjectSet.with(entity);
		// Linked list nodes
		ret.rebuild(entity);
		ret.rebuildOutputs();
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
		this.rebuildOutputs();
	},

	rebuild(root) {
		for (var i in dirs) {
			var tile = root.tile.getNearby(i);
			if (!tile) return;
			tile = tile.link();

			if (tile.block() == phase) {
				var ent = tile.building;
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

		var last;
		for (var i = 0; i < routers.size; i++) {
			var router = routers.get(i);
			for (var o in router.outputs) {
				var node = {
					to: router.outputs[o],
					from: router.tile,
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
	last: null
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
	}
});

phase.hitTime = 10;
// Temporary variables
phase.rect = new Rect(); phase.rect2 = new Rect();

phase.entityType = () => {
	const ent = extendContent(Router.RouterEntity, phase, {
		draw() {
			if (this.power.status < 1) {
				// Inactive state, draw disconnected version
				Draw.rect(phase.icon(Cicon.full), this.x, this.y);
			} else {
				this.super$draw();
				this.drawEdges();
				this.drawCorners();
			}

			this.drawShine();
		},

		drawEdges() {
			const bits = this.blendBits;
			const x = this.x, y = this.y;

			for (var i = 0; i < 4; i++) {
				// First nibble has the edges
				if ((bits & (1 << i)) == 0) {
					Draw.rect(phase.edgeRegions[i >> 1], x, y, 90 * -i);
				}
			}
		},

		drawCorners() {
			const bits = this.blendBits;
			const x = this.y, y = this.y;

			for (var i = 0; i < 4; i++) {
				if ((bits & (256 << i)) != 0) {
					// Third nibble has the inner corners, which take priority
					Draw.rect(phase.icornerRegions[i], x, y);
				} else if ((bits & (16 << i)) == 0) {
					// Second nibble has the outer corners
					Draw.rect(phase.cornerRegions[i], x, y);
				}
			}
		},

		/* DeflectorWall stuff */

		drawShine() {
			var hit = this.hit;
			hit += Mathf.clamp(Math.sin(Time.time() / 10 + this.x + this.y) / 10, 0, 0.75);
			if (Mathf.zero(hit)) return;

			Draw.color(Color.white);
			Draw.alpha(hit / 2);
			Draw.blend(Blending.additive);
			Fill.rect(this.x, this.y, Vars.tilesize, Vars.tilesize);
			Draw.blend();
			Draw.reset();

			this.hit = Mathf.clamp(hit - Time.delta() / this.hitTime);
		},

		/* TODO: make this actually deflect stuff */
		collision(b) {
			this.super$collision(b);
			if (b.damage > this.maxDamageDeflected() || b.isDeflected()) {
				return true;
			}

			const penX = Math.abs(this.x - b.x), penY = Math.abs(this.y - b.y);
			b.hitbox(phase.rect2);
			const pos = Geometry.raycastRect(b.x - b.velocity().x * Time.delta(), b.y - b.velocity().y * Time.delta(),
				b.x + b.velocity().x * Time.delta(), b.y + b.velocity().y * Time.delta(),
			phase.rect.setSize(Vars.tilesize + phase.rect2.width * 2 + phase.rect2.height * 2)
				.setCenter(this.x, this.y));

			if (pos) {
				b.set(pos.x, pos.y);
			}

			b[penX > penY ? "x" : "y"] *= -1;

			b.resetOwner(this, this.team);
			b.scaleTime(1);
			b.deflect();

			this.hit = 1;
			return false
		},

		maxDamageDeflected() {
			return this.power.status * 20 + 10;
		},

		/* PhaseRouter */

		placed() {
			this.super$placed();

			// Server doesn't care about drawing, stop
			if (!Vars.ui) return;

			this.reblendAll();
			this.reblend();
		},

		onRemoved() {
			this.super$onRemoved();

			const net = this.network;
			Core.app.post(() => {
				if (net) net.refresh();

				// Server doesn't care about drawing, stop
				if (!Vars.ui) return;
				this.reblendAll();
			});
		},

		reblendAll() {
			for (var i in all) {
				var other = this.tile.getNearby(all[i][0], all[i][1]);
				if (other && other.block() == phase) {
					other.reblend();
				}
			}
		},

		reblend() {
			// All edges and outer corners by default
			var bits = 0;

			for (var i = 0; i < 4; i++) {
				var prev = this.adjacent((i + 3) % 4);
				var current = this.adjacent(i);
				if (current || prev) {
					// Can't be a corner
					bits |= 16 << i;
					if (current) {
						// Can't be a straight edge
						bits |= 1 << i;
						if (prev && this.interior(i)) {
							// It's a bend, show inner corner
							bits |= 256 << i;
						}
					}
				}
			}

			if (this.power.status >= 1) {
				Fx.placeBlock.at(this.x, this.y);
			}
			this.blendBits = bits;
		},

		adjacent(i) {
			const other = this.tile.getNearby(dirs[i].x, dirs[i].y);
			return other && other.block() == phase;
		},

		/* Whether a router is a corner of a square or just a bend */
		interior(i) {
			const diag = this.tile.getNearby(diags[i][0], diags[i][1]);
			return diag && diag.block() != phase;
		},

		/* Round-robin all outputs in this network */
		handleItem(source, item) {
			const network = this.network;

			var ended = false;
			var node = network.last;
			while (!ended) {
				var output = node.to, source = node.from;
				node = node.next;
				if (output.acceptItem(source, item)) {
					output.handleItem(source, item);
					network.last = node;
					return;
				}

				ended = node == network.last;
			}
			// acceptItem said yes but handleItem said no
		},

		acceptItem(source, item) {
			if (this.power.status < 1) return false;
			if (!this.network) {
				this.network = NetworkGraph.new(this);
			}

			const net = this.network;
			var node = net.begin;
			do {
				var output = node.to, source = node.from;
				node = node.next;

				if (output.acceptItem(source, item)) {
					return true;
				}
			} while (node != net.begin);

			return false;
		},

		onProximityUpdate() {
			this.super$onProximityUpdate();

			const net = this.network;
			const prox = this.proximity;
			// Remove potentially broken tiles
			this.outputs = [];

			/* Add back the remaining tiles */
			for (var i = 0; i < prox.size; i++) {
				var near = prox.get(i);
				if (near.block.hasItems && near.block != phase) {
					this.outputs.push(near);
				}
			}

			// Very slow
			if (net) net.rebuildOutputs();
		},
		read(stream, version) {
			this.super$read(stream, version);
			this.blendBits = stream.s();
		},

		write(stream) {
			this.super$write(stream);
			stream.s(this.blendBits);
		}
	});

	ent.network = null;
	ent.outputs = [];
	ent.blendBits = 0;
	ent.hit = 0;

	return ent;
};


module.exports = phase;
