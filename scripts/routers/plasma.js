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

const plasma = extend(Router, "plasma-router", {
	spread(tile, life) {
		// FIXME
		tile.setNet(this);
		tile.build.life = life;
	},

	canDestroy(block) {
		// natural walls can't be destroyed by plasma, but anything else can
		return !(block instanceof StaticWall);
	}
});

// number of "actions" that can be done by fresh plasma
plasma.lifetime = 10;
// spreads twice per second
plasma.cooldown = 0.5 * 60;
// chance to spread to an adjacent block
plasma.spreadChance = 0.25;

plasma.buildType = () => extend(Router.RouterBuild, plasma, {
	updateTile() {
		this.super$updateTile();
		this.time += this.delta();

		if (this.time > plasma.cooldown) {
			this.time = 0;
			for (var i = 0; i < this.proximity.size; i++) {
				var other = this.proximity.get(i);
				if (other && plasma.canDestroy(other.block)) {
					this.spread(other.tile);
				}
			}
		}

		if (this.life <= 0) {
			this.kill();
		}
	},

	spread(tile) {
		if (Mathf.chance(plasma.spreadChance)) {
			plasma.spread(tile, --this.life);
		}
	},

	getLife() { return this._life; },
	setLife(set) { this._life = set; },

	_life: plasma.lifetime,
	time: 0,
});

module.exports = plasma;
