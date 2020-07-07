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

this.global.routorio = {};
function add(names) {
	for (var i in names) {
		var name = names[i];
		try {
			this.global.routorio[name] = require("content/" + name);
		} catch (e) {
			Log.err("Failed to load routorio script {0}.js: {1}", name, e);
		}
	}
}

// Blocks
require("manual");
add(["router", "double-router", "titanium-double-router",
	"inverted-router", "clear-router", "explosive-router",
	"combat-router", "arc-router", "ubuntium-router",
	"electric-router", "surge-router"]);

// Units
add(["reverout", "routerpede"]);
