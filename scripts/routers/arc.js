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

/* This script contains every arc reoucter module */

const directions = require("routorio/lib/dirs");

const itemMultipliers = {
	arc: {
		// Bad materials are nukes.
		"routorio-neutron-router": 100,
		sand: 10,
		coal: 8,

		// Metals increase arcs
		lead: 2,
		copper: 2,
		scrap: 3,
		"routorio-beryllium": 2,
		titanium: 3,
		silicon: 3,
		"surge-alloy": 4,
		// Plastanium reduces arc damage and, randomly, the count
		plastanium: 0.5
	},
	power: {
		// Conductors increase power
		lead: 1.5,
		copper: 2,
		scrap: 1.25,
		titanium: 4,
		silicon: 5,
		"surge-alloy": 8
	}
};

const getMultiplier = (kind, item) => {
	const mul = itemMultipliers[kind][item.name];
	return mul || 1;
};

const adjacent = (tile, valid) => {
	var adj = 0;
	for (var i in directions) {
		var near = tile.nearby(i);
		if (near && valid(near.block())) adj++;
	}

	return adj;
};

var mod, arc;
const rates = {
	base: {
		// entity uses it once
		apply: () => 0,
		bonuses: {
			// 45 power per second
			gen: 0.75,
			// 3% chance to arc for an item
			arc: 0.03,
			// 15% chance to consume item
			burnup: 0.15
		}
	},
	// bonuses applied for adjacent Arc Routers
	chain: {
		apply: tile => adjacent(tile, block => block.id == arc.id),
		bonuses: {
			// Extra 30/s per tile adjacent for a given router
			gen: 0.50,
			arc: 0.01
		},
		modifiers: {
			burnup: 1.2
		}
	},
	// bonuses applied for adjacent Moderouters
	mod: {
		apply: tile => adjacent(tile, block => block.id == mod.id),
		bonuses: {
			arc: 0.05,
			gen: 0.25
		},
		modifiers: {
			gen: 1.4
		}
	},

	/* Special walls */
	// decrease arcing
	plast: {
		apply: tile => adjacent(tile, block => (block.insulated && block instanceof Wall)),
		bonuses: {
			arc: -0.02
		}
	},
	// decrease fuel burnup
	phase: {
		apply: tile => adjacent(tile, block => block.chanceDeflect > 0
			|| block.id == global.routorio.phase.id),
		modifiers: {
			burnup: 0.5
		}
	},

	/* Metal walls */
	// copper walls are decent conductors
	copper: {
		apply: tile => adjacent(tile, block => block.name.endsWith("copper-wall")),
		bonuses: {
			gen: 0.4
		},
		modifiers: {
			burnup: 1.2
		}
	},
	// titanium walls are better conductors but are more dangerous
	titan: {
		apply: tile => adjacent(tile, block => block.name.endsWith("titanium-wall")),
		bonuses: {
			arc: 0.08,
			gen: 0.6
		},
		modifiers: {
			burnup: 1.1
		}
	},
	// surge is an excellent conductor, increase arcing and power dramatically
	surge: {
		apply: tile => adjacent(tile, block => block.lightningChance > 0),
		bonuses: {
			gen: 2
		},
		modifiers: {
			arc: 1.6
		}
	}
};

// Moderouters increase power and arc chance but not item burnup
// Just here to make it easy to check for it.
mod = new Router("moderouter");

arc = extend(Router, "arc-router", {
	setStats() {
		this.super$setStats();
		// base stats, see bars for active stats
		this.stats.add(Stat.basePowerGeneration, rates.base.bonuses.gen * 60, StatUnit.powerSecond);
		this.stats.add(new Stat("arcChance", StatCat.power), rates.base.bonuses.arc * 100, StatUnit.percent);
		this.stats.add(new Stat("fuelBurnup", StatCat.items), rates.base.bonuses.burnup * 100, StatUnit.percent);
	},

	setBars() {
		this.super$setBars();
		this.addBar("power", entity => new Bar(
			() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(entity.powerProduction * entity.timeScale * 60, 1)),
			() => Pal.powerBar,
			() => entity._activity / entity._maxActivity
		));

		this.addBar("arc-chance", entity => new Bar(
			() => Core.bundle.format("bar.arc-chance",
				Strings.fixed(entity._rates.arc * 100, 1)),
			() => Pal.lancerLaser,
			() => entity._rates.arc / 0.35
		));

		this.addBar("fuel-burnup", entity => new Bar(
			() => Core.bundle.format("bar.fuel-burnup",
				Strings.fixed(entity._rates.burnup * 100, 1)),
			() => Items.surgeAlloy.color,
			() => entity._rates.burnup / 0.31
		));
	}
});

arc.enableDrawStatus = true;
// FIXME: casts to Enum for some reason instead of BlockFlag
//arc.flags = EnumSet.of(BlockFlag.generator);
arc.minColor = Color.white;
arc.maxColor = new Color(1.35, 1.35, 1.5);

arc.buildType = () => extend(Router.RouterBuild, arc, {
	updateTile() {
		this.super$updateTile();
		this.activity = Math.max(this.activity - 0.005 * this.delta(), 0);
	},

	handleItem(source, item) {
		if (!this.consumeFuel(item)) {
			this.super$handleItem(source, item);
		}
	},

	consumeFuel(item) {
		const rates = this.rates;
		var consumed = false;

		// fractional part is chance the rest is guaranteed arcs
		if (Mathf.chance(rates.arc)) {
			const mul = getMultiplier("arc", item);
			const chance = mul % 1;

			for (var i = 0; i < mul - chance; i++) {
				this.arc(item, mul);
			}

			if (Mathf.chance(chance)) {
				this.arc(item, mul);
			}
		}

		if (Mathf.chance(rates.burnup)) {
			if (Vars.ui) {
				Fx.lancerLaserCharge.at(this.x + Mathf.range(2), this.y + Mathf.range(2),
					Math.random(0, 360), item.color);
			}
			this.items.take();
			consumed = true;
		}

		// maxActivity uses the latest item so switching between surge and coal will instantly ruin output
		this.maxActivity = getMultiplier("power", item);
		this.activity = Math.min(this.activity + 0.2, this.maxActivity);
		return consumed;
	},

	arc(item, mul) {
		const rates = this.rates;
		const maxLength = 20 * mul;
		const x = this.x, y = this.y;

		Core.app.post(() => {
			for (var i = 0; i < Math.sqrt(mul); i++) {
				Lightning.create(Team.derelict, item.color, 10, x, y,
					Mathf.random(0, 360), Math.round(Mathf.random(5, maxLength)));
			}
		});
	},

	calculateRates() {
		Object.assign(this.rates, rates.base.bonuses);

		for (var r in rates) {
			var rate = rates[r];
			var mul = rate.apply(this.tile);
			if (mul == 0) continue;

			// Add first then multiply so moderouters aren't useless
			if (rate.bonuses) {
				for (var b in rate.bonuses) {
					this.rates[b] += rate.bonuses[b] * mul;
				}
			}

			if (rate.modifiers) {
				for (var m in rate.modifiers) {
					this.rates[m] *= Math.pow(rate.modifiers[m], mul);
				}
			}
		}
	},

	getPowerProduction() {
		return this.rates.gen * this.activity;
	},

	onProximityUpdate() {
		this.super$onProximityUpdate();
		if (!Vars.state.editor) this.calculateRates();
	},

	onDestroyed() {
		this.super$onDestroyed();
		// Spawn lots of arcs
		var mul = getMultiplier("arc", Items.surgeAlloy);
		for (var i = 0; i < 10; i++) {
			this.arc(Items.surgeAlloy, mul);
		}
	},

	/* Status - Orange */
	shouldConsume() {
		return this.activity > 0.5;
	},
	/* Status - Red */
	productionValid() {
		return this.activity > 0.02;
	},

	/* Public fields */
	get_activity() { return this.activity; },
	get_maxActivity() { return this.maxActivity; },
	get_rates() { return this.rates; },

	rates: Object.create(rates.base.bonuses),
	activity: 0,
	maxActivity: 1
});

module.exports = {
	rates: rates,
	moderouter: mod,
	arcRouter: arc,
	itemMultipliers: itemMultipliers
};
