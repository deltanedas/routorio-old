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

const surge = extendContent(Router, "surge-router", {});

surge.sparkChance = 0.1;

surge.entityType = () => extendContent(Router.RouterEntity, surge, {
	updateTile() {
		// Only route items when there is power, but the amount doesn't matter
		if (this.cons.valid()) {
			this.super$updateTile();
		}
	},

	// Add random spark effects
	handleItem(source, item) {
		this.super$handleItem(source, item);

		print(surge.sparkChance)
		print(Mathf.chance(surge.sparkChance))
		if (Vars.ui && Mathf.chance(surge.sparkChance)) {
			Fx.lancerLaserCharge.at(this.x + Mathf.range(2), this.y + Mathf.range(2),
				Math.random(0, 360), Items.surgealloy.color);
		}
	}
});

module.exports = surge;
