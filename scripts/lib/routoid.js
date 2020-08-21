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

const mat = new Mat();
mat.setToRotation(45);

const routorio = this.global.routorio;

const routoid = {
	draw() {
		// Rotate shadow and router by 45 degrees
		const old = Draw.trans();
		Draw.trans(mat);
		Drawf.shadow(this.x, this.y, 16);
		Draw.rect(this.region, this.x, this.y, this.rotation);
		Draw.trans(old);
	},

	set(x, y, r) {
		this.x = x;
		this.y = y;
		this.rotation = r;
	},

	init(name) {
		this.name = name;
		this.region = routorio.holorouter.get(name);
		this.set(0, 0, 0);
	}
};

module.exports = routoid;
