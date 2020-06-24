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
const explosionRadius = 10;
const explosionDamage = 100;

const rot = [0, 1, 1, 0, 0, -1, -1, 0];

const explosiveRouter = extendContent(Router, "explosive-router", {
	onProximityUpdate(tile) {
		this.super$onProximityUpdate(tile);
		var near;

		for (var i = 0; i < 8; i += 2) {
			near = Vars.world.tile(tile.x + rot[i], tile.y + rot[i + 1]);
			if (near && near.block() instanceof Router) {
				this.snekDetected(near);
				// Prevent stack overflow from explosive routers exploding
				Core.app.post(run(() => tile.remove()));
			}
		}
	},

	onDestroyed(tile) {
		this.super$onDestroyed(tile);
		this.snekDetected(tile);
	},

	/* Call when a snek is found and must be eliminated */
	snekDetected(tile) {
		Sounds.explosionbig.at(tile);
		const wx = tile.worldx(), wy = tile.worldy();
		Effects.shake(40, 16, wx, wy);
		Effects.effect(Fx.nuclearShockwave, wx, wy);
		for (var i = 0; i < 4; i++) {
			Time.run(Mathf.random(40), run(() => {
				Effects.effect(Fx.nuclearcloud, wx, wy);
			}));
		}
		Damage.damage(wx, wy, explosionRadius * Vars.tilesize, explosionDamage);
	}
});

module.exports = explosiveRouter;
