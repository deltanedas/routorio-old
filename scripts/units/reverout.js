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

// TODO: add little router guns
/* .===.
   |--\|
   |.o||
   |..'|
   .===.
    .=.
    |o|
    .=. */
const register = require("routorio/lib/register");

const offset = 1.6 * Vars.tilesize;
const dist = Math.sqrt(2 * offset * offset)

const routors = [
	1, 1,
	1, -1,
	-1, -1,
	-1, 1
];

const reverout = extend(UnitType, "reverout", {
	load() {
		this.super$load();
		this.region = Core.atlas.find(this.name);
		this.rotor = Core.atlas.find("router");
	}
});

reverout.constructor = () => extend(UnitEntity, {
	draw() {
		this.super$draw();

		const r = this.rotation;
		const sin = Mathf.sin(r) * dist;
		const cos = Mathf.cos(r) * dist;
		var x, y;

		for (var i = 0; i < 8; i += 2) {
			x = routors[i] * offset;
			y = routors[i + 1] * offset;
			Draw.rect(reverout.rotor,
				this.x + Angles.trnsx(r, x, y),
				this.y + Angles.trnsy(r, x, y),
				r + Time.time * 20);
		}
	},

	classId: () => reverout.classId
});

register(reverout);

module.exports = reverout;
