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

(() => {

const chainer = extendContent(UnitFactory, "router-chainer", {
	load() {
		this.super$load();
		this.topRegion = Core.atlas.find("clear");
		this.router = Core.atlas.find("router");

		this.surge = Core.atlas.find("routorio-surge-router");
		this.laser = Core.atlas.find("laser");
		this.laserEnd = Core.atlas.find("laser-end");
	},

	icon(cicon) {
		if (!this.iconRegion) {
			this.iconRegion = Core.atlas.find(this.name + "-icon");
		}
		return this.iconRegion;
	},
	generateIcons() {
		return [this.iconRegion];
	},

	drawLayer(tile) {
		const dx = tile.drawx(), dy = tile.drawy();
		const ent = tile.ent();

		ent.progress = Mathf.lerp(ent.progress, Math.min(ent.efficiency(), 1), 0.02);
		const rot = Time.time() * ent.progress * ent.timeScale;
		const chaining = ent.cons.valid();

		ent.dist = Mathf.lerp(ent.dist, chaining ? 24 : 4 * ent.progress + 8, 0.04);

		for (var i = 0; i < 8; i++) {
			var angle = rot + 360 * i / 8;
			var x = dx + Angles.trnsx(angle, ent.dist);
			var y = dy + Angles.trnsy(angle, ent.dist);

			if (chaining) {
				Drawf.laser(this.laser, this.laserEnd,
					// ni = hide laser
					x, y, dx, dy, Math.sqrt(Math.sin(angle / 50) / 5));
				// Surge routers face the center when at max dist
				Draw.rect(this.surge, x, y, Mathf.slerp(0, angle, ent.dist / 24));
			} else {
				Draw.rect(this.router, x, y);
			}
		}
	}
});

chainer.entityType = prov(() => {
	const ent = extend(UnitFactory.UnitFactoryEntity, {
		getProgress() {return this._progress;},
		setProgress(set) {this._progress = set;},

		getDist() {return this._dist;},
		setDist(set) {this._dist = set;}
	});

	ent._progress = 0;
	// Routers start by folding out
	ent._dist = 0;

	return ent;
});

chainer.unitType = this.global.routorio.routerpede;

module.exports = chainer;

})();
