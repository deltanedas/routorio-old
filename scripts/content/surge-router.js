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

const surge = extendContent(Router, "surge-router", {
	update(tile) {
		const ent = tile.entity;
		// Only route items when there is power
		if (ent.cons.valid()) {
			ent.cons.trigger();
			this.super$update(tile);
		}
	},

	// Add random spark effects
	handleItem(item, tile, source) {
		this.super$handleItem(item, tile, source);

		if (Vars.ui && Mathf.chance(this.sparkChance)) {
			Effects.effect(Fx.lancerLaserCharge, Items.surgealloy.color,
				tile.drawx(), tile.drawy(), Mathf.random(0, 360));
		}
	}
});
surge.sparkChance = 0.1;

module.exports = surge;
