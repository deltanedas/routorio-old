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

const phase = extendContent(Router, "phase-router", {
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

	update(tile) {
		if (tile.entity.power.status >= 1) {
			this.super$update(tile);
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

	placed(tile) {
		this.reblendAll(tile);
		this.reblend(tile);
	},

	removed(tile) {
		this.super$removed(tile);

		Core.app.post(run(() => {
			this.reblendAll(tile);
		}));
	},

	reblendAll(tile) {
		// Server doesn't care about drawing, stop
		if (!Vars.ui) return;

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
	}
});

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

		setBlendBits(set) {this._blendBits = set;},
		getBlendBits() {return this._blendBits;}
	});

	ent._blendBits = 0;
	return ent;
});

module.exports = phase;

})();
