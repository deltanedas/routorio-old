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

const dirs = require("routorio/lib/dirs");

const clear = this.global.routorio["clear-router"]

const alien = extendContent(Router, "alien-router", {});
alien.buildType = () => extendContent(Router.RouterBuild, alien, {
	updateTile() {
		this.super$updateTile();

		const items = this.items;
		if (Mathf.chance(alien.spreadChance)) {
			const fed = items.get(Items.thorium) > 0;
			if (fed) items.take();
			this.spread(fed);
		}
	},

	spread(fed) {
		for (var i in dirs) {
			var dir = Math.round(Mathf.random(0, 3));

			var other = this.tile.getNearby(dir);
			if (!other) continue;

			if (other.block() == Blocks.air ||
				(other.block() instanceof Router
				&& other.block().id != alien.id)) {
				if (fed) {
					Core.app.post(() => {
						Call.setTile(other, alien, this.team, 0);
					});
				}
				return;
			}
		}

		// This alien router couldn't spread and is a failure
		Core.app.post(() => {
			Call.setTile(this.tile, clear, this.team, 0);
		});
	}
});

alien.spreadChance = 0.02;

module.exports = alien;
