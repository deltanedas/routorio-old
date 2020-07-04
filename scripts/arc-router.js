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
// This script contains every arc reoucter module

const directions = [
	{x: 0, y: 1},
	{x: 1, y: 0},
	{x: 0, y: -1},
	{x: -1, y: 0}
];

const arcMultipliers = {
	// Conductors increase arcs
	lead: () => 2,
	copper: () => 2,
	titanium: () => 3,
	silicon: () => 3,
	"surge-alloy": () => 4,
	// Plastanium reduces arcs
	plastanium: () => Mathf.round(Mathf.random(0, 1))
};

function adjacent(tile, valid) {
	var adj = 0;
	var near, dir;
	for (var i in directions) {
		dir = directions[i];
		near = Vars.world.tile(tile.x + dir.x, tile.y + dir.y);
		if (!near) continue;
		if (near.block() instanceof BlockPart) {
			near = near.link();
		}
		if (valid(near.block())) adj++;
	}
	return adj;
}

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
			cons: 0.15
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
			cons: 1.2
		}
	},
	// increase arcing and power dramatically
	surge: {
		apply: tile => adjacent(tile,
			block => block.id == this.global.routorio["surge-router"].id
				|| block instanceof SurgeWall),
		bonuses: {
			gen: 2
		},
		modifiers: {
			arc: 1.6
		}
	},
	// decrease arcing
	plast: {
		apply: tile => adjacent(tile, block => block.insulated),
		bonuses: {
			arc: -0.02
		}
	},
	// bonuses applied for adjacent Moderouters
	mod: {
		apply: tile => adjacent(tile, block => block.id == mod.id),
		bonuses: {
			arc: 0.02,
			gen: 0.25
		},
		modifiers: {
			gen: 1.4
		}
	}
};

// Moderouters increase power and arc chance but not item consumption
// Just here to make it easy to check for it.
mod = extendContent(Router, "moderouter", {
});

arc = extendContent(Router, "arc-router", {
	setBars() {
		this.super$setBars();
		this.bars.add("power", func(entity => new Bar(
			prov(() => Core.bundle.format("bar.poweroutput",
				Strings.fixed(this.getPowerProduction(entity.tile) * entity.timeScale * 60, 1))),
			prov(() => Pal.powerBar),
			floatp(() => entity.progress)
		)));

		this.bars.add("arc-chance", func(entity => new Bar(
			prov(() => Core.bundle.format("bar.arc-chance",
				Strings.fixed(entity.rates.arc * 100, 2))),
			prov(() => Pal.lancerLaser),
			floatp(() => entity.rates.arc)
		)));
	},

	setStats() {
		this.super$setStats();

		// base
		this.stats.add(BlockStat.basePowerGeneration, rates.base.bonuses.gen * 60, StatUnit.powerSecond);
		this.stats.add(BlockStat.powerDamage, Core.bundle.get("stat.arc-chance"), rates.base.bonuses.arc * 100);
		this.stats.add(BlockStat.input, Core.bundle.get("stat.cons"), rates.base.bonuses.cons * 100);
	},

	handleItem(item, tile, source) {
		// Only accept core-storable items
		if (item.type == ItemType.material) {
			if (!this.consume(tile, item)) {
				this.super$handleItem(item, tile, source);
			}
		}
	},

	getPowerProduction: tile => tile.entity.rates.gen * tile.entity.progress,

	update(tile) {
		this.super$update(tile);
		const ent = tile.entity;
		ent.progress = Math.max(ent.progress - 0.005, 0);
	},

	draw(tile) {
		Draw.color(this.minColor, this.maxColor, tile.entity.progress);
		this.super$draw(tile);
		Draw.color();
	},

	consume(tile, item) {
		const ent = tile.entity;
		const rates = ent.rates;
		var consumed = false;

		if (Mathf.chance(rates.arc)) {
			this.arc(tile, item);
		}
		if (Mathf.chance(rates.cons)) {
			if (Vars.ui) {
				Effects.effect(Fx.lancerLaserCharge, item.color, tile.drawx(), tile.drawy(), Mathf.random(0, 360));
			}
			ent.items.take();
			consumed = true;
		}
		ent.progress = Math.min(ent.progress + 0.2, 1);
		return consumed;
	},

	arc(tile, item) {
		const rates = tile.entity.rates;
		var mul = arcMultipliers[item.name];
		if (mul === undefined) {
			mul = 1;
		} else {
			mul = mul();
		}
		for (var i = 0; i < mul; i++) {
			Lightning.create(Team.derelict, item.color, 7.5, tile.drawx(), tile.drawy(), Mathf.random(0, 360), Mathf.random(5, 20 * mul));
		}
	},

	calculateRates(tile) {
		const ent = tile.entity;
		Object.assign(ent.rates, rates.base.bonuses);

		var rate, mul;
		for (var r in rates) {
			rate = rates[r];
			mul = rate.apply(tile);
			if (mul == 0) continue;

			// Do modifiers first to prevent absurd rates
			if (rate.modifiers) {
				for (var m in rate.modifiers) {
					ent.rates[m] *= Math.pow(rate.modifiers[m], mul);
				}
			}

			if (rate.bonuses) {
				for (var b in rate.bonuses) {
					ent.rates[b] += rate.bonuses[b] * mul;
				}
			}
		}
	},

	onProximityUpdate(tile) {
		this.super$onProximityUpdate(tile);
		this.calculateRates(tile);
	},

	onDestroyed(tile) {
		this.super$onDestroyed(tile);
		// Spawn lots of arcs
		for (var i = 0; i < 10; i++) {
			this.arc(tile, Items.surgealloy);
		}
	}
});
arc.flags = EnumSet.of(BlockFlag.producer);
arc.minColor = Color.white;
arc.maxColor = new Color(1.35, 1.35, 1.5);
arc.entityType = prov(() => {
	const ent = extendContent(Router.RouterEntity, arc, {
		getRates() {return this._rates},
		setRates(set) {this._rates = set},
		getProgress() {return this._progress},
		setProgress(set) {this._progress = set}
	});
	ent._rates = Object.create(rates.base.bonuses);
	ent._progress = 0;
	return ent;
});

// Append as to not override other mods.
Blocks.plastaniumWall.description += Core.bundle.get("routorio-plastanium-wall-desc");
Blocks.plastaniumWallLarge.description += Core.bundle.get("routorio-plastanium-wall-desc");
Blocks.surgeWall.description += Core.bundle.get("routorio-surge-wall-desc");
Blocks.surgeWallLarge.description += Core.bundle.get("routorio-surge-wall-desc");

module.exports = {
	rates: rates,
	moderouter: mod,
	arcRouter: arc,
	arcMultipliers: arcMultipliers
};
