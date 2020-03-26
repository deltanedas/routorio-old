const offset = 1.6 * Vars.tilesize;

const dist = (2 * offset^2)^0.5

const rotors = [
	1, 1,
	1, -1,
	-1, -1,
	-1, 1
];

const drone = extendContent(UnitType, "drone", {
	load() {
		this.weapon.region = Core.atlas.find("clear");
		this.region = Core.atlas.find(this.name);
		this.rotor = Core.atlas.find("router");
	},

	draw(unit) {
		const r = unit.rotation;
		const sin = Mathf.sin(r) * dist;
		const cos = Mathf.cos(r) * dist;
		var x, y;
		for (var i = 0; i < 8; i += 2) {
			x = rotors[i] * offset;
			y = rotors[i + 1] * offset;
			Draw.rect(this.rotor,
				unit.x + Angles.trnsx(r, x, y),
				unit.y + Angles.trnsy(r, x, y),
				r + Time.time() * 20);
		}
	},

	drawStats(unit) {
		if (this.drawCell){
			const health = unit.healthf();
			const rot = unit.rotation - 90;
			Draw.color(Color.black, unit.team.color, health + Mathf.absin(Time.time(), Math.max(health * 5, 1), 1 - health));
			Draw.rect(unit.getPowerCellRegion(),
				unit.x + Angles.trnsx(rot, 0, -5.5),
				unit.y + Angles.trnsy(rot, 0, -5.5),
				rot);
			Draw.color();
		}

		if (this.drawItems) {
			unit.drawBackItems();
		}

		if (this.lightEmitted > 0) {
			unit.drawLight(this.lightEmitted);
		}
	}
});
drone.constructor = prov(() => new FlyingUnit());