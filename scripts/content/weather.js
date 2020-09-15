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

const storm = extendContent(Weather, "routerstorm", {
	load() {
		this.super$load();
		this.region = Core.atlas.find("router");
	},
// Call.createWeather(this.global.routorio.weather.routerstorm, 1, 1200)
	drawOver(state) {
		this.rand.seed = 0;
		Tmp.r1.setCentered(Core.camera.position.x, Core.camera.position.y,
			Core.graphics.width / Vars.renderer.minScale(), Core.graphics.height / Vars.renderer.minScale());
		Tmp.r1.grow(this.padding);
		Core.camera.bounds(Tmp.r2);
		const total = Math.floor(Tmp.r1.area() / this.density * state.intensity);

		for (var i = 0; i < total; i++) {
			var scl = this.rand.random(0.5, 1);
			var scl2 = this.rand.random(0.5, 1);
			var sscl = this.rand.random(0.2, 1);
			var x = this.rand.random(0, Vars.world.unitWidth()) + Time.time() * this.xspeed * scl2;
			var y = this.rand.random(0, Vars.world.unitHeight()) - Time.time() * this.yspeed * scl;

			x += Mathf.sin(y, this.rand.random(30, 80), this.rand.random(1, 7));

			x -= Tmp.r1.x;
			y -= Tmp.r1.y;
			x = Mathf.mod(x, Tmp.r1.width);
			y = Mathf.mod(y, Tmp.r1.height);
			x += Tmp.r1.x;
			y += Tmp.r1.y;

			var size = this.size * sscl;
			if (Tmp.r3.setCentered(x, y, size).overlaps(Tmp.r2)) {
				Draw.rect(this.region, x, y, size, size);
			}
		}
	},

	yspeed: 0.3,
	xspeed: 20,
	padding: 40,
	size: 16,
	density: 1200,

	region: null
});
storm.attrs.set(Attribute.light, -0.3);

module.exports = {
	routerstorm: storm
};
