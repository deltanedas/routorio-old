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

const melter = extendContent(PayloadAcceptor, "routoid-liquefactor", {
	init() {
		this.super$init();
		this.liquid = Vars.content.getByName(ContentType.liquid, "routorio-liquid-router");
	},

	setStats() {
		this.super$setStats();
		this.stats.add(BlockStat.productionTime, this.meltTime / 60, StatUnit.seconds);
//		this.stats.add(BlockStat.output, this.liquid, this.amount, false);
	},

	meltTime: 60 * 12,
	liquid: null,
	// 12/s
	amount: 12 / 60,

	outputsLiquid: true,
	solid: true
});

melter.buildType = () => extendContent(PayloadAcceptor.PayloadAcceptorBuild, melter, {
	updateTile() {
		this.dumpLiquid(melter.liquid);

		if (this.valid()) {
			this.cons.trigger();
			this.progress -= this.edelta();

			this.liquids.add(melter.liquid, melter.amount);
		} else if (this.payload) {
			if (Vars.ui) {
				Fx.smeltsmoke.at(this.x + Mathf.range(2), this.y + Mathf.range(2));
			}

			this.payload = null;
			this.progress = melter.meltTime;
		}
	},

	acceptsPayload(source, payload) {
		return !this.payload && payload.isRoutoid
			&& (this.liquids.total() < melter.liquidCapacity);
	},

	valid() {
		return this.consValid() && this.progress > 0.1
			&& this.liquids.get(melter.liquid) <= melter.liquidCapacity;
	},

	progress: 0
});

module.exports = melter;
