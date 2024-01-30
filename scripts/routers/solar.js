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

const solar = extend(Router, "solar-router", {
	setStats() {
		this.super$setStats();
		this.stats.add(this.generationType, this.powerGeneration * 60, StatUnit.powerSecond);
	},

	setBars() {
		this.super$setBars();
		this.addBar("power", entity => new Bar(
			() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(entity.powerProduction * 60 * entity.timeScale, 1)),
			() => Pal.powerBar,
			() => entity.powerProduction / this.powerGeneration
		));
	},

	efficiency() {
		const rules = Vars.state.rules;
		const mul = rules.solarPowerMultiplier;
		if (mul >= 0) return mul;

		return rules.lighting ? 1 - rules.ambientLight.a : 1
	}
});

solar.baseExplosiveness = 5;
solar.generationType = Stat.basePowerGeneration;
solar.powerGeneration = 1 / 6;

solar.buildType = () => extend(Router.RouterBuild, solar, {
	updateTile() {
		this.super$updateTile();
		this.sun = Math.max(this.sun - 0.003 * this.delta(), 0);
	},

	handleItem(source, item) {
		this.super$handleItem(source, item);
		this.sun = Math.min(this.sun + 0.1, 1);
	},

	getPowerProduction() {
		return solar.powerGeneration * this.sun * solar.efficiency();
	},

	sun: 0
});

module.exports = solar;
