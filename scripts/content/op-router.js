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

/* Turns router into a UV locked distributor quarter. */

(() => {

const opRouter = extendContent(Router, "op-router", {
	load() {
		this.super$load();
		this.regions = [];
		for (var i = 0; i < 4; i++) {
			this.regions[i] = Core.atlas.find(this.name + "_" + i);
		}
	},

	getRegion(tile) {
		return this.regions[(tile.x % 2) + 2 * (tile.y % 2)];
	},

	draw(tile){
		Draw.rect(this.getRegion(tile), tile.drawx(), tile.drawy());
	},

	generateIcons(){
		return [Core.atlas.find("routorio-distributor")]; // Vanilla distributor texture
	}
});

module.exports = opRouter;

})();
