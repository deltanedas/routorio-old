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

const solar = extendContent(Router, "solar-router", {
	update(tile) {
		this.super$update(tile);
		const ent = tile.entity;
		ent.progress = Math.max(ent.progress - 0.003, 0);
	},

	handleItem(item, tile, source) {
		this.super$handleItem(item, tile, source);
		const ent = tile.entity;
		ent.progress = Math.min(ent.progress + 0.1, 1);
	},

	setStats() {
		this.super$setStats();
		this.stats.add(this.generationType, this.powerGeneration * 60, StatUnit.powerSecond);
	},

	setBars() {
		this.super$setBars();

		this.bars.add("power", func(entity => new Bar(
			prov(() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(this.getPowerProduction(entity.tile) * 60 * entity.timeScale, 1))),
			prov(() => Pal.powerBar),
			floatp(() => this.efficiency(entity))
		)));
	},

	getPowerProduction(tile) {
		return this.powerGeneration * this.efficiency(tile.entity);
	},

	efficiency(ent) {
		return ent.progress * this.solarEfficiency();
	},

	solarEfficiency() {
		const rules = Vars.state.rules;
		const mul = rules.solarPowerMultiplier;
		if (mul >= 0) return mul;

		return rules.lighting ? 1 - rules.ambientLight.a : 1
	}
});

solar.baseExplosiveness = 5;
solar.generationType = BlockStat.basePowerGeneration;
solar.powerGeneration = 0.1;

solar.entityType = prov(() => {
	const ent = extendContent(Router.RouterEntity, solar, {
		getProgress() {
			return this._progress;
		},
		setProgress(set) {
			this._progress = set;
		}
	});
	ent._progress = 0;
	return ent;
});

module.exports = solar;

})();
