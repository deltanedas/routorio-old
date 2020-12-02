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

/* Factory for routorio's units */

const UnitPlan = UnitFactory.UnitPlan;
const routorio = this.global.routorio;

const chainer = extendContent(UnitFactory, "router-chainer", {
	init() {
		// TODO: Use reconstructor for sexy -> chain -> reverout?
		// TODO: balance unit costs in respect to dagger -> crawler -> azimuth
		chainer.plans = Seq.with(
			new UnitPlan(routorio["sexy-router"], 60 * 5,
				ItemStack.with(Items.silicon, 5, Items.copper, 6)),
			new UnitPlan(routorio.routerpede, 60 * 20,
				ItemStack.with(Items.silicon, 30, Items.graphite, 80)),
			new UnitPlan(routorio.reverout, 60 * 30,
				ItemStack.with(Items.silicon, 120, Items.titanium, 70, Items.graphite, 160)));

		this.super$init();
	},

	load() {
		this.super$load();
		this.topRegion = this.outRegion = Core.atlas.find("clear");

		this.region = Core.atlas.find(this.name + "-base");
		this.router = Core.atlas.find("router");
		this.surge = Core.atlas.find("routorio-surge-router");

		this.laser = Core.atlas.find("laser");
		this.laserEnd = Core.atlas.find("laser-end");
	}
});

chainer.buildType = () => extendContent(UnitFactory.UnitFactoryBuild, chainer, {
	draw() {
		const dx = this.x, dy = this.y;
		Draw.rect(chainer.region, dx, dy);
		Draw.z(Layer.turret);

		this.rot = Mathf.lerp(this.rot, Math.min(this.efficiency(), 1) * this.timeScale, 0.02);
		const rot = Time.time * this.rot;
		const chaining = this.cons.valid();

		this.dist = Mathf.lerp(this.dist, this.plan
			? this.plan.type.size / 40
			: 4 * this.rot + 8, 0.04);

		for (var i = 0; i < 8; i++) {
			var angle = rot + 360 * i / 8;
			var x = dx + Angles.trnsx(angle, this.dist);
			var y = dy + Angles.trnsy(angle, this.dist);

			if (chaining) {
				Drawf.laser(this.team, chainer.laser, chainer.laserEnd,
					// imaginary = hide laser
					x, y, dx, dy, Math.sqrt(Math.sin(angle / 50) / 5));
				// Surge routers face the center when at max dist
				Draw.rect(chainer.surge, x, y, angle); //Mathf.slerp(0, angle,this.dist / 24));
			} else {
				Draw.rect(chainer.router, x, y);
			}
		}
	},

	// Routers start by folding out
	dist: 0,
	rot: 0
});

module.exports = chainer;
