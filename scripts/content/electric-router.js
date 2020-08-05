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

// Configurable router, responds to changes in the power grid

const modes = {
	buffer: 0,
	rate: 1
};
const modeCount = Object.keys(modes).length;

const operations = {
	equals: 0,
	greater: 1,
	less: 2,
	not: 3
};
const operationCount = Object.keys(operations).length;

operations.min = operations.equals;
operations.max = operations.not;

// Short - mode | operation
const maxNumber = 0x1FFF;

const elec = extendContent(Router, "electric-router", {
	load() {
		this.super$load();
		this.background = new TextureRegionDrawable(Core.atlas.find("router"));

		/* Configuration buttons */
		this.buttons = {
			modes: [
				"buffer",
				"rate"
			],
			operations: [
				"equals",
				"greater",
				"less",
				"not"
			]
		};

		var buttons;
		for (var b in this.buttons) {
			buttons = this.buttons[b];
			for (var i in buttons) {
				buttons[i] = new TextureRegionDrawable(Core.atlas.find("routorio-button-" + buttons[i]));
			}
		}
	}
});

const edef = {
	updateTile() {
		if (this.active()) {
			this.super$updateTile();
		}
	},

	buildConfiguration(parent) {
		const table = parent.fill();
		table.background(elec.background);

		const modeb = table.button(elec.buttons.modes[this.mode],
			Styles.clearTransi, () => {
			// Cycle through modes
			this.mode = (this.mode + 1) % modeCount;
			this.configure(this.config());
			modeb.style.imageUp = elec.buttons.modes[this.mode]
		}).size(40).get();

		const opb = table.button(elec.buttons.operations[this.operation],
			Styles.clearTransi, () => {
			// Cycle through operations
			this.operation = (this.operation + 1) % operationCount;
			this.configure(this.config());
			opb.style.imageUp = elec.buttons.operations[this.operation]
		}).size(40).get();

		const numberf = table.field(this.number + "", text => {
			try {
				var set = parseInt(text);
			} catch (e) {
				set = 0 / 0;
			}
			if (!isNaN(set)) {
				set = Mathf.clamp(set, 0, maxNumber);
				numberf.text = set;
				this.number = set;
				this.configure(this.config());
			}
		}).width(120).get();
	},

	configured(player, raw) {
		this.mode = raw >> 15 & 0x01;
		this.operation = (raw >> 13) & 0x03
		this.number = raw & maxNumber;
	},

	active() {
		const number = Math.round(this.powerNum);

		switch (this.operation) {
		case operations.equals:
			return number == this.number;
		case operations.greater:
			return number > this.number;
		case operations.less:
			return number < this.number;
		case operations.not:
			return number != this.number;
		}
		return false;
	},

	// Get comparison number from the mode
	getPowerNum() {
		switch (this.mode) {
		case modes.buffer:
			return this.power.status * maxNumber;
		case modes.rate:
			return this.power.graph.powerBalance * 60;
		}
		return 0;
	},

	config() {
		var lhs = this.mode << 15;
		lhs |= this.operation << 13;
		return (this.number | lhs) + "";
	},

	write(stream) {
		this.super$write(stream);
		stream.s(this.config());
	},

	read(stream, version) {
		this.super$read(stream, version);
		this.configured(null, stream.s());
	}
};

elec.entityType = () => {
	const ent = extendContent(Router.RouterEntity, elec, edef);

	/* Default configuration */
	ent.mode = modes.buffer;
	ent.operation = operations.equals;
	ent.number = maxNumber;

	return ent;
};

elec.consumes.powerBuffered(maxNumber);

module.exports = elec
