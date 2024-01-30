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

const inverted = extend(Conveyor, "inverted-router", {
	load() {
		this.super$load();

		this.region = Core.atlas.find(this.name);
	},

	drawPlanRegion(plan, list) {
		const scl = Vars.tilesize * plan.animScale;
		Draw.rect(this.region, plan.drawx(), plan.drawy(), scl, scl);
	},

	icons() {
		return [this.region]
	}
});

inverted.buildType = () => extend(Conveyor.ConveyorBuild, inverted, {
	draw(tile) {
		const rot = Time.time * inverted.speed * 8 * this.timeScale;
		// Instead of an animated texture, it rotates when active
		Draw.rect(this.region, this.x, this.y, rot);
	}
});

module.exports = inverted;
