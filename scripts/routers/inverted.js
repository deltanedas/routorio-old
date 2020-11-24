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

const inverted = extendContent(Conveyor, "inverted-router", {
	drawBase(tile) {
		const build = tile.build;
		const rot = Time.time() * this.speed * 8 * build.timeScale;
		// Instead of an animated texture, it rotates when active
		Draw.rect(this.region, tile.drawx(), tile.drawy(), rot);
	},

	drawRequestRegion(req, list) {
		const scl = Vars.tilesize * req.animScale;
		Draw.rect(this.region, req.drawx(), req.drawy(), scl, scl);
	},

	icons() {
		return [Core.atlas.find(this.name)];
	}
});

module.exports = inverted;
