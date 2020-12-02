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

const dirs = require("routorio/lib/dirs");

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
		if (!routers.size) return;

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
			var tile = root.tile.nearby(i);
			if (!tile) return;

			if (tile.block() == phase) {
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

		var last;
		for (var i = 0; i < routers.size; i++) {
			var router = routers.get(i);
			for (var o in router.outputs) {
				var node = {
					to: router.outputs[o],
					from: router,
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

const connected = require("routorio/lib/connected");

phase = connected.new(Router, "phase-router", {
	load() {
		this.loadConnected();

		// Center dot
		this.region = Core.atlas.find(this.name + "-base");
	}
}, {
	draw() {
		if (this.power.status < 1) {
			// Inactive state, draw disconnected version
			Draw.rect(phase.icon(Cicon.full), this.x, this.y);
		} else {
			this.super$draw();
			this.drawEdges();
			this.drawCorners();
			this.drawShine();
		}
	},

	drawShine() {
		const shine = (Math.sin((Time.time / 6 + this.x + this.y) / 10) + 1) / 16;
		if (shine < 0.01) return;

		Draw.color(Color.white)
		Draw.alpha(shine);
		Draw.blend(Blending.additive);
		Fill.rect(this.x, this.y, Vars.tilesize, Vars.tilesize);
		Draw.blend();
		Draw.reset();
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
			// Work on sorter, core, conveyor etc. all at the same time
			if ((near.block.acceptsItems || near.block.hasItems) && near.block != phase) {
				this.outputs.push(near);
			}
		}

		// Very slow
		if (net) net.rebuildOutputs();
	},

	read(read, version) {
		this.super$read(read, version);
		this.blendBits = read.s();
	},
	write(write) {
		this.super$write(write);
		write.s(this.blendBits);
	},

	/* Public fields */
	getNetwork() { return this._network; },
	setNetwork(set) { this._network = set; },
	getOutputs() { return this._outputs; },
	setOutputs(set) { this._outputs = set; },

	_network: null,
	_outputs: []
});

module.exports = phase;
