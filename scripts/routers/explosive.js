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

const explode = extend(Router, "explosive-router", {});

explode.radius = 10;
explode.damage = 100;

explode.buildType = () => extend(Router.RouterBuild, explode, {
	onProximityUpdate() {
		this.super$onProximityUpdate();

		for (var i in dirs) {
			var near = this.tile.nearby(i);
			if (near && near.block() instanceof Router) {
				this.snekDetected();
				// Prevent stack overflow from explosive routers exploding
				Core.app.post(() => this.tile.remove());
			}
		}
	},

	onDestroyed() {
		this.super$onDestroyed();
		this.snekDetected();
	},

	/* Call when a snek is found and must be eliminated */
	snekDetected() {
		const x = this.x, y = this.y;
		Core.app.post(() => {
			Damage.damage(x, y, explode.radius * Vars.tilesize, explode.damage);
		});

		if (!Vars.ui) return;

		Sounds.explosionbig.at(this.tile);
		Effect.shake(40, 16, x, y);
		Fx.nuclearShockwave.at(x, y);
		for (var i = 0; i < 4; i++) {
			Time.run(Math.random(40), () => {
				Fx.nuclearcloud.at(x + Mathf.range(4), y + Mathf.range(4));
			});
		}
	}
});

module.exports = explode;
