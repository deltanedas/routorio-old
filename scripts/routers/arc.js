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

/* This script contains every arc reoucter module */

const directions = require("routorio/lib/dirs");

const arcMultipliers = {
	// Bad materials are nukes.
	"routorio-neutron-router": () => 100,
	sand: () => 10,
	coal: () => 8,

	// Conductors increase arcs
	lead: () => 2,
	copper: () => 2,
	scrap: () => 3,
	"routorio-beryllium": () => 2,
	titanium: () => 3,
	silicon: () => 3,
	"surge-alloy": () => 4,
	// Plastanium reduces arcs
	plastanium: () => Math.round(Math.random(0, 1))
};

const arcMultiplier = item => {
	const mul = arcMultipliers[item.name];
	if (mul === undefined) {
		return 1;
	}
	return mul();
};

const adjacent = (tile, valid) => {
	var adj = 0;
	for (var i in directions) {
		var near = tile.nearby(i);
		if (!near) continue;
		if (valid(near.block())) adj++;
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
		apply: tile => adjacent(tile, block => (block.insulated && block instanceof Wall)
			|| block.id == this.global.routorio.crouter.id),
		bonuses: {
			arc: -0.02
		}
	},
	// decrease fuel burnup
	phase: {
		apply: tile => adjacent(tile, block => block.deflect
			|| block.id == this.global.routorio.phase.id),
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
		apply: tile => adjacent(tile,
			block => block.id == this.global.routorio.surge.id
				|| block.lightningChance > 0),
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

arc = extendContent(Router, "arc-router", {
	setStats() {
		this.super$setStats();
		// base
		this.stats.add(Stat.basePowerGeneration, rates.base.bonuses.gen * 60, StatUnit.powerSecond);
		this.stats.add(Stat.powerDamage, Core.bundle.get("stat.arc-chance"), rates.base.bonuses.arc * 100);
		this.stats.add(Stat.input, Core.bundle.get("stat.fuel-burnup"), rates.base.bonuses.burnup * 100);
	},

	setBars() {
		this.super$setBars();
		this.bars.add("power", entity => new Bar(
			() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(entity.powerProduction * entity.timeScale * 60, 1)),
			() => Pal.powerBar,
			() => entity._progress
		));

		this.bars.add("arc-chance", entity => new Bar(
			() => Core.bundle.format("stat.arc-chance",
				Strings.fixed(entity._rates.arc * 100, 2)),
			() => Pal.lancerLaser,
			() => entity._rates.arc / 0.35
		));

		this.bars.add("fuel-burnup", entity => new Bar(
			() => Core.bundle.format("stat.fuel-burnup",
				Math.round(entity._rates.burnup * 100)),
			() => Items.surgeAlloy.color,
			() => entity._rates.burnup / 0.31
		));
	}
});

arc.enableDrawStatus = true;
arc.flags = EnumSet.of(BlockFlag.generator);
arc.minColor = Color.white;
arc.maxColor = new Color(1.35, 1.35, 1.5);

arc.buildType = () => extendContent(Router.RouterBuild, arc, {
	updateTile() {
		this.super$updateTile();
		this.progress = Math.max(this.progress - 0.005, 0);
	},

	handleItem(source, item) {
		if (!this.consumeFuel(item)) {
			this.super$handleItem(source, item);
		}
	},

	consumeFuel(item) {
		const rates = this.rates;
		var consumed = false;

		if (Mathf.chance(rates.arc * arcMultiplier(item))) {
			this.arc(item);
		}
		if (Mathf.chance(rates.burnup)) {
			if (Vars.ui) {
				Fx.lancerLaserCharge.at(this.x + Mathf.range(2), this.y + Mathf.range(2),
					Math.random(0, 360), item.color);
			}
			this.items.take();
			consumed = true;
		}
		this.progress = Math.min(this.progress + 0.2, 1);
		return consumed;
	},

	arc(item) {
		const rates = this.rates;
		const mul = arcMultiplier(item);
		const x = this.x, y = this.y;

		Core.app.post(() => {
			for (var i = 0; i < Math.sqrt(mul); i++) {
				Lightning.create(Team.derelict, item.color, 10, x, y,
					Mathf.random(0, 360), Math.round(Mathf.random(5, 20 * mul)));
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
		return this.rates.gen * this.progress;
	},

	onProximityUpdate() {
		this.super$onProximityUpdate();
		if (!Vars.state.editor) this.calculateRates();
	},

	onDestroyed() {
		this.super$onDestroyed();
		// Spawn lots of arcs
		for (var i = 0; i < 10; i++) {
			this.arc(Items.surgeAlloy);
		}
	},

	/* Status - Orange */
	shouldConsume() {
		return this.progress > 0.5;
	},
	/* Status - Red */
	productionValid() {
		return this.progress > 0.02;
	},

	/* Public fields */
	get_progress() { return this.progress; },
	get_rates() { return this.rates; },

	rates: Object.create(rates.base.bonuses),
	progress: 0
});

module.exports = {
	rates: rates,
	moderouter: mod,
	arcRouter: arc,
	arcMultipliers: arcMultipliers
};
