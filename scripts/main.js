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

const routorio = global.routorio = {};

const add = (type, names) => {
	for (var i in names) {
		var name = names[i];
		try {
			routorio[name] = require("routorio/" + type + "/" + name);
		} catch (e) {
			Log.err("Failed to load routorio script @/@.js: @ (@#@)",
				type, name, e, e.fileName,
				new java.lang.Integer(e.lineNumber));
			routorio[name] = null;
		}
	}
};

/* Items */
add("items", ["beryllium", "neutron", "liquid"]);

/* Blocks */
add("routers", ["op", "half", "double",
	"inverted", "clear", "explosive",
	"phase", "ubuntium", "electric",
	"surge", "solar", "alien",
	"arc", "vulcan", "fusion",
	"holorouter", "sprouter", "rainbow",
	"lobotorout", "crouter", "xmas"]);
add("payloads", ["payload-conduit",
	"routoid-assembler", "routoid-liquefactor"]);
add("combat", ["combat", "multirouter"]);

/* Units */
add("units", ["router-chainer", "sexy-router",
	"routerpede", "reverout"]);

/* Misc */
add("misc", ["manual", "icon"]);
