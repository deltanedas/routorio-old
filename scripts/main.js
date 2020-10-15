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

const routorio = {
	research(content, parname) {
		const parent = TechTree.all.find(node => node.content == routorio[parname]);
		new TechTree.TechNode(parent, content, content.researchRequirements());
	}
};
this.global.routorio = routorio;

const add = names => {
	for (var i in names) {
		var name = names[i];
		try {
			routorio[name] = require("routorio/content/" + name);
		} catch (e) {
			Log.err("Failed to load routorio script @.js: @ (@#@)", name,
				e, e.fileName, new java.lang.Integer(e.lineNumber));
			routorio[name] = null;
		}
	}
};

add(["items"]);

// Blocks
add(["op-router", "double-router", "titanium-double-router",
	"inverted-router", "clear-router", "explosive-router",
	"combat-router", "phase-router", "ubuntium-router",
	"electric-router", "surge-router", "solar-router",
	"alien-router", "arc-router", "vulcan-router",
	"fusion-router", "holorouter", "routoid-assembler",
	"routoid-liquefactor", "sprouter", "rainbow-router",
	"routergeist", "lobotorout", "payload-conduit"]);

// Units
add(["router-chainer", "sexy-router",
	"routerpede", "reverout"]);

// Misc
require("routorio/manual");
