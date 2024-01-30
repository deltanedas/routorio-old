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

const fruit = extend(Router, "routerfruit", {
});

const sprout = extend(Router, "sprouter", {
	load() {
		this.super$load();
		this.region = Core.atlas.find("routorio-sprouter-plant");
	},

	canPlaceOn(tile, team) {
		return tile.floor() == Blocks.dirt && tile.block() == Blocks.air;
	},

	// Take 40m to 80m of sunlight with no fertilizer
	growTime: () => 60 * (60 + Mathf.range(20)),

	// 30s per item eaten
	itemValue: 30,
	// 10% chance to eat an item
	eatChance: 1 / 10
});

sprout.buildType = () => extend(Router.RouterBuild, sprout, {
	updateTile() {
		// TODO: Use daytime and falloff at dusk/dawn
		// TODO: Water nearby will speed up growth and fertilization
		this.super$updateTile();
//		if (idk) {
			this.growth += Time.delta / 60;
//		}
		if (this.growth >= this.growTime) {
			this.growth = 0;
			this.tile.setBlock(fruit, this.team, this.rotation);
		}
	},

	draw() {
		Drawf.shadow(this.x, this.y, 32 * this.size());
		Draw.rect(sprout.region, this.x, this.y);

		const scl = Vars.tilesize * this.growth / this.growTime;
		const rot = Mathf.lerp(this.lastRot, scl * 180, 0.02);
		this.lastRot = rot;
		Draw.rect(fruit.region, this.x, this.y, scl, scl, rot);
	},

	handleItem(source, item) {
		if (Mathf.chance(sprout.eatChance)) {
			this.growth += sprout.itemValue;
			this.heal(1);
			if (Vars.ui) {
				Fx.healBlockFull.at(this.x, this.y, this.size(), Blocks.mender.baseColor, sprout);
			}
		} else {
			this.super$handleItem(source, item);
		}
	},

	size() {
		// 0.5 to 1 based on the growth
		return 0.5 + (this.growth / this.growTime) / 2;
	},

	read(read, version) {
		this.super$read(read, version);
		this.growth = read.s();
		this.growTime = read.s();
	},

	write(write) {
		this.super$write(write);
		write.s(this.growth);
		write.s(this.growTime);
	},

	growTime: sprout.growTime(),
	growth: 0,
	// Smoothly rotate when fed
	lastRot: 0
});

module.exports = {
	sprouter: sprout,
	routerfruit: fruit
};
