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

/* Connected router textures.
   Blendbits are 3 least significant nibbles, edges, outer corners and inner corners.
   The fourth nibble is unused. */

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

const block = {
	loadConnect() {
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
};

const building = block => {return {
	draw() {
		this.super$draw();
		this.drawEdges();
		this.drawCorners();
	},

	drawEdges() {
		const bits = this.blendBits;
		const x = this.x, y = this.y;

		for (var i = 0; i < 4; i++) {
			// First nibble has the edges
			if ((bits & (1 << i)) == 0) {
				Draw.rect(block.edgeRegions[i >> 1], x, y, 90 * -i);
			}
		}
	},

	drawCorners() {
		const bits = this.blendBits;
		const x = this.x, y = this.y;

		for (var i = 0; i < 4; i++) {
			if ((bits & (256 << i)) != 0) {
				// Third nibble has the inner corners, which take priority
				Draw.rect(block.icornerRegions[i], x, y);
			} else if ((bits & (16 << i)) == 0) {
				// Second nibble has the outer corners
				Draw.rect(block.cornerRegions[i], x, y);
			}
		}
	},

	placed() {
		this.super$placed();

		// Server doesn't care about drawing, stop
		if (!Vars.ui) return;

		this.reblendAll();
		this.reblend();
	},

	onRemoved() {
		this.super$onRemoved();

		Core.app.post(() => {
			this.removed();

			// Server doesn't care about drawing, stop
			if (!Vars.ui) return;
			this.reblendAll();
		});
	},

	removed(){},

	reblendAll() {
		for (var i in all) {
			var other = this.tile.getNearby(all[i][0], all[i][1]);
			if (other && other.block() == this.block) {
				var ent = other.bc();
				ent.reblend();
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

		Fx.placeBlock.at(this.x, this.y);
		this.blendBits = bits;
	},

	adjacent(i) {
		const other = this.tile.getNearby(dirs[i].x, dirs[i].y);
		return other && other.block() == this.block;
	},

	/* Whether a router is a corner of a square or just a bend */
	interior(i) {
		const diag = this.tile.getNearby(diags[i][0], diags[i][1]);
		return diag && diag.block() != this.block;
	},

	read(read, version) {
		this.super$read(read, version);
		this.blendBits = read.s();
	},

	write(write) {
		this.super$write(write);
		write.s(this.blendBits);
	}
};};

module.exports = {
	new(type, def, block) {
		const base = typeof(this[type]) == "function"
			? this[type](block)
			: Object.create(this[type]);
		return Object.assign(base, def);
	},
	block: block,
	building: building
};
