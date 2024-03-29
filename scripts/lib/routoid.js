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

const routorio = global.routorio;

const routoid = {
	draw() {
		// .x is a function, must use getX()
		const x = this.x(), y = this.y();
		Drawf.shadow(x, y, 16);
		Draw.rect(this.region, x, y, this.rotation() + 45);
	},

	set(x, y, rotation) {
		this._x = x;
		this._y = y;
		this._rotation = rotation;
	},

	x() { return this._x; },
	y() { return this._y; },
	rotation() { return this._rotation; },

	init(breed) {
		const name = breed ? "routorio-" + breed + "-router" : "router";
		this.breed = breed;
		this.region = routorio.holorouter.get(name);
		this.set(0, 0, 0);
	},

	fits: () => true,

	isRoutoid: true
};

module.exports = routoid;
