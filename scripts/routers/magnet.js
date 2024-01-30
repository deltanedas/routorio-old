/*
	Copyright (c) deltanedas 2024

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

const magnet = extend(Router, "magnet-router", {});

magnet.sparkChance = 0.1;

magnet.buildType = () => extend(Router.RouterBuild, magnet, {
	updateTile() {
		// Only route items when there is power, but the amount doesn't matter
		// magnet routers serve as a heavy initial power cost
		if (this.efficiency > 0.0) {
			this.super$updateTile();
		}
	},

	// Add random spark effects when routing
	handleItem(source, item) {
		this.super$handleItem(source, item);

		if (Vars.ui && Mathf.chance(magnet.sparkChance)) {
			Fx.lancerLaserCharge.at(this.x + Mathf.range(2), this.y + Mathf.range(2),
				Math.random(0, 360), Items.surgeAlloy.color);
		}
	}
});

module.exports = magnet;
