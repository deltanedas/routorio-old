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

const bery = this.global.routorio.beryllium;

const ubuntium = extendContent(Router, "ubuntium-router", {
});

// Chance for an item to be turned into Beryllium.
ubuntium.chance = 1 / 30;

ubuntium.buildType = () => extendContent(Router.RouterBuild, ubuntium, {
	handleItem(source, item) {
		if (Mathf.chance(ubuntium.chance)) {
			item = bery;
		}
		this.super$handleItem(source, item);
	}
});

module.exports = ubuntium;
