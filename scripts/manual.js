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
	rtfm.addPage("Arc Reoucter", [
		"# Power generation",
		"Arc routers generate power only when items move, so a clogged arc router is dead.",
		"This means that they may take some time to fully shut down.",
		"Hint: you can control item flow with copper conveyors and electric routers",

		"# Fuel",
		"[sky]Arc Routers[] will only accept core-storable materials as fuel.",
		"Item conductivity determines [red]lightning arc[] length and count.",

		"# Bars",
		"[sky]Arc routers[] display the current [red]Arcing[] and [coral]Fuel burnup[] chances.",

		"# Affinities",
		"The [sky]Arc Router[]'s stats change when adjacent to these blocks:",
		"    Moderouter: [red]Arcing Chance increased[], [yellow]Power [green]multiplied[]",
		"    [sky]Arc Router[]: [red]Arcing Chance[] and [yellow]Power[] [orange]increased[], [coral]Fuel Burnup [red]multiplied[]",
		"    Plastanium: [red]Arcing Chance[] [green]decreased[]",
		"    Phase Fabric: [coral]Fuel burnup[] [green]halved[]",
		"    Surge Alloy: [yellow]Power[] [green]increased[], [red]Arcing Chance multiplied[]");
	]);
	module.exports = true;
} catch (e) {
	module.exports = false;
}
