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

	rtfm.addSection("Routorio", [
		"Arc Reoucter",
		"$block.routorio-electric-router.name"
	]);

	module.exports = true;
} catch (e) {
	if (!Vars.headless) {
		Log.warn("Please install [#00aaff]DeltaNedas/rtfm[] to view routorio's manual pages.");
	}
	module.exports = false;
}
