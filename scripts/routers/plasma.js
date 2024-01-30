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

const plasma = extend(Block, "plasma-router", {});

// number of cooldown ticks that fresh plasma will spread
plasma.lifetime = 100;
// tries to spread 5 times per second
plasma.cooldown = 0.2 * 60;
// chance to spread to an adjacent block every cooldown tick
plasma.spreadChance = 0.25;

plasma.buildType = () => extend(Building, {
	created() {
		// proximity is initialized after this so we must wait
		Core.app.post(() => {
			// set life based on the oldest adjacent plasma
			var min = this.life;
			const prox = this.proximity;
			for (var i = 0; i < prox.size; i++) {
				var other = prox.get(i);
				if (other.life !== undefined) {
					min = Math.min(min, other.life);
				}
			}

			this.life = min - 1;
		});
	},

	updateTile() {
		this.super$updateTile();

		if (this.life <= 0) {
			this.kill();
			return;
		}

		this.time += this.delta();
		if (this.time < plasma.cooldown) return;

		this.time -= plasma.cooldown;
		this.life--;

		const cx = this.tileX(), cy = this.tileY();
		const dirs = [[cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]];
		for (var dir of dirs) {
			var tile = Vars.world.tile(dir[0], dir[1]);
			if (!tile || tile.block() instanceof StaticWall || tile.block() == plasma)
				continue;

			this.spread(tile);
		}
	},

	spread(tile) {
		if (!Mathf.chance(plasma.spreadChance))
			return;

		tile.setNet(plasma, this.team, 0);
	},

	getLife() { return this._life; },
	setLife(set) { this._life = set; },

	_life: plasma.lifetime,
	time: 0
});

module.exports = plasma;
