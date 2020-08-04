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
	},

	update(tile) {
		if (this.activeFor(tile.entity)) {
			this.super$update(tile);
		}
	},

	buildConfiguration(tile, parent) {
		const ent = tile.entity;
		const table = parent.fill(this.backgrond);

		const modeb = table.addImageButton(this.buttons.modes[ent.mode],
			Styles.clearTransi, () => {
			tile.configure(-1);
			modeb.style.imageUp = this.buttons.modes[ent.mode]
		}).size(40).get();

		const opb = table.addImageButton(this.buttons.operations[ent.operation],
			Styles.clearTransi, () => {
			// Cycle through operations
			tile.configure(-2);
			opb.style.imageUp = this.buttons.operations[ent.operation]
		}).size(40).get();

		const numberf = table.addField(ent.number, text => {
			try {
				var set = parseInt(text);
			} catch (e) {
				set = 0 / 0;
			}
			if (!isNaN(set)) {
				set = Mathf.clamp(set, 0, maxNumber);
				numberf.text = set;
				tile.configure(set);
			}
		}).width(120).get();
	},

	configured(tile, player, n) {
		const ent = tile.entity;
		/* Number */
		if (n >= 0) {
			ent.number = Math.min(n, maxNumber);
			return;
		}

		/* Cycle through modes */
		if (n == -1) {
			ent.mode = (ent.mode + 1) % modeCount;
		}

		/* Cycle through operations */
		if (n == -2) {
			ent.operation = (ent.operation + 1) % operationCount;
		}
	},

	activeFor(entity) {
		const number = Math.round(this.getPowerFor(entity));

		switch (entity.operation) {
		case operations.equals:
			return number == entity.number;
		case operations.greater:
			return number > entity.number;
		case operations.less:
			return number < entity.number;
		case operations.not:
			return number != entity.number;
		}
		return false;
	},

	// Get comparison number from the mode
	getPowerFor(entity) {
		switch (entity.mode) {
		case modes.buffer:
			return entity.power.status * maxNumber;
		case modes.rate:
			return entity.power.graph.getPowerBalance() * 60;
		}
		return 0;
	}
});

elec.entityType = () => {
	const ent = extendContent(Router.RouterEntity, elec, {
		write(stream) {
			this.super$write(stream);
			var lhs = this._mode << 15;
			lhs |= this._operation << 13;
			stream.writeShort(this._number | lhs);
		},

		read(stream, version) {
			this.super$read(stream, version);
			const raw = stream.readShort();
			this._mode = raw >> 15 & 0x01;
			this._operation = (raw >> 13) & 0x03
			this._number = raw & maxNumber;
		},

		/* Variable accessors */
		getMode() {return this._mode;},
		setMode(set) {this._mode = set;},
		getOperation() {return this._operation;},
		setOperation(set) {this._operation = set;},
		getNumber() {return this._number;},
		setNumber(set) {this._number = set;}
	});

	/* Default configuration */
	ent._mode = modes.buffer;
	ent._operation = operations.equals;
	ent._number = maxNumber;

	return ent;
};

elec.consumes.powerBuffered(maxNumber);

module.exports = elec
