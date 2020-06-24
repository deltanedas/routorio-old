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
const offset = 1.6 * Vars.tilesize;

const dist = (2 * offset^2)^0.5

const rotors = [
	1, 1,
	1, -1,
	-1, -1,
	-1, 1
];

const reverout = new JavaAdapter(UnitType, {
	load() {
		this.super$load();
		this.weapon.region = Core.atlas.find("clear");
		this.region = Core.atlas.find(this.name);
		this.rotor = Core.atlas.find("router");
	}
}, "reverout", prov(() => extend(FlyingUnit, {
	drawOver() {
		const r = this.rotation;
		const sin = Mathf.sin(r) * dist;
		const cos = Mathf.cos(r) * dist;
		var x, y;

		for (var i = 0; i < 8; i += 2) {
			x = rotors[i] * offset;
			y = rotors[i + 1] * offset;
			Draw.rect(reverout.rotor,
				this.x + Angles.trnsx(r, x, y),
				this.y + Angles.trnsy(r, x, y),
				r + Time.time() * 20);
		}
	}
})));

module.exports = reverout;
