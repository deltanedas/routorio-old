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

const planets = {};

// Router's mean colour
const colour = Color.valueOf("#6e7080");

const routerosSectors = routeros => {
	const lavaflow = new SectorPreset("lavaflow", routeros, 0);
	lavaflow.captureWave = 40;
};

const routeros = new Planet("routeros", Planets.serpulo, 3, 6);
routeros.generator = extend(SerpuloPlanetGenerator, {
});
routeros.mesh = new HexMesh(routeros, 3);
routeros.atmosphereColor = colour;
routeros.startSector = 0;
planets.routeros = routeros;
routerosSectors(routeros);

module.exports = planets;
