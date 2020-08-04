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

// How to colour the -top texture
const colour = new Color(1, 1, 1, 0.5);

const clear = extendContent(Router, "clear-router", {
	load() {
		this.super$load();
		this.bottomRegion = Core.atlas.find("routorio-clear-router-bottom");
		this.topRegion = Core.atlas.find("routorio-clear-router-top");
	},

	drawBase(tile){
		const building = tile.bc();
		Draw.rect(this.bottomRegion, tile.drawx(), tile.drawy());
		if (building.items.total() != 0) {
			Draw.rect(building.items.first().icon(Cicon.full), tile.drawx(), tile.drawy());
		}
		Draw.color(colour);
		Draw.rect(this.topRegion, tile.drawx(), tile.drawy());
		Draw.color();
	}
});

module.exports = clear;
