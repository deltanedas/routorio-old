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

try {
	const rtfm = require("rtfm/library");

	rtfm.addSection("Routorio", {
		"Arc Reoucter": [
			"# Power generation",
			"Arc routers generate power only when items move, so a clogged arc router is dead.",
			"This means that they may take some time to fully shut down.",
			"[stat]Hint: you can control item flow with copper conveyors and electric routers.[]",

			"# Fuel",
			"[sky]Arc Routers[] will only accept core-storable materials as fuel.",
			"Item conductivity determines [red]lightning arc[] length and count.",
			"Arcs do a lot of damage so make sure to have lots of menders on-site.",

			"# Bars",
			"[sky]Arc routers[] display the current [red]Arcing[] and [coral]Fuel burnup[] chances.",

			"# Affinities",
			"The [sky]Arc Router[]'s stats change when adjacent to these blocks:",
			"    Moderouter: [red]Arcing Chance increased[], [yellow]Power [green]multiplied[]",
			"    [sky]Arc Router[]: [red]Arcing Chance[] and [yellow]Power[] [orange]increased[], [coral]Fuel Burnup [red]multiplied[]",
			"    Plastanium: [red]Arcing Chance[] [green]decreased[]",
			"    Phase Fabric: [coral]Fuel burnup[] [green]halved[]",
			"    Surge Alloy: [yellow]Power[] [green]increased[], [red]Arcing Chance multiplied[]"
		],

		"$block.routorio-electric-router.name": [
			"# Configuration",
			"There are 3 parts to an electric router: mode, operation and number.",
			"Mode is simple, it's either power stored in the router (battery) or power rate. (power node)",
			"Operaration is what it sounds like, which mathematical operator to use.",
			"The number at the end is the comparison number.\n",
			"The result is a simple expression like \"active if storage greater than 4k\""
		]
	});

	module.exports = true;
} catch (e) {
	Log.warn("Please install [#00aaff]DeltaNedas/rtfm[] to view routorio's manual pages.");
	module.exports = false;
}
