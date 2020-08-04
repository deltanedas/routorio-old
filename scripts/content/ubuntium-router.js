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

// Chance for an item to be turned into Beryllium.
const amazonChance = 1 / 30;

const ubuntium = extendContent(Router, "ubuntium-router", {
	init() {
		this.super$init();
		this.beryllium = Vars.content.getByName(ContentType.item, "routorio-beryllium");
	}
});

ubuntium.entityType = () => extendContent(Router.RouterEntity, ubuntium, {
	handleItem(source, item) {
		if (Mathf.chance(amazonChance)) {
			item = ubuntium.beryllium;
		}
		this.super$handleItem(source,item);
	}
});

module.exports = ubuntium;
