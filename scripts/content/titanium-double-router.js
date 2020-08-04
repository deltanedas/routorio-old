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

var lock = false;

const titanium = extendContent(Router, "titanium-double-router", {
	load() {
		this.super$load();

		this.regions = [];
		for (var i = 0; i < 2; i++) {
			this.regions[i] = Core.atlas.find(this.name + "_" + i);
		}
	},

	draw(tile) {
		Draw.rect(this.regions[tile.x % 2], tile.drawx(), tile.drawy());
	},

	generateIcons() {
		return [Core.atlas.find(this.name)];
	},

	calcOffset: x => x + ((x % 2) ? -1 : 1),

	canPlaceOn(tile){
		const x = this.calcOffset(tile.x);
		const other = Vars.world.tile(x, tile.y);
		return other.block() == "air"
	},

	placed(tile) {
		this.super$placed(tile);
		const x = this.calcOffset(tile.x);
		Call.setTile(Vars.world.tile(x, tile.y), this, tile.team, 0);
	},

	removed(tile) {
		this.super$removed(tile);
		const x = this.calcOffset(tile.x);

		/* Prevent trying to delete the other half infinitely */
		if (!lock) {
			lock = true;
			Call.setTile(Vars.world.tile(x, tile.y), Blocks.air, tile.team, 0);
			lock = false;
		}
	}
});

module.exports = titanium;
