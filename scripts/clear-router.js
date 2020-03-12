/* Config, feel free to edit */

// How to colour the -top texture
const colour = new Color(1, 1, 1,
	0.5); // <--- Opacity
// Enable the forbidden router snek
const snek = false;

/* Clear router code do not eat */

const def = {
	load() {
		this.super$load();
		this.bottomRegion = Core.atlas.find("routorio-clear-router-bottom");
		this.topRegion = Core.atlas.find("routorio-clear-router-top");
	},

	draw(tile){
		const entity = tile.ent();
		Draw.rect(this.bottomRegion, tile.drawx(), tile.drawy());
		if (entity.items.total() != 0) {
			Draw.rect(entity.items.first().icon(Cicon.full), tile.drawx(), tile.drawy());
		}
		Draw.color(colour);
		Draw.rect(this.topRegion, tile.drawx(), tile.drawy());
		Draw.color();
	}
}

// If snek is enabled, add the code
if (snek) {
	Object.assign(def, {
		// Same as vanilla but without anti-snek
		update(tile){
			const entity = tile.entity;

			if (entity.lastItem == null && entity.items.total() > 0) {
				entity.items.clear();
			}

			if (entity.lastItem != null) {
				entity.time += 1 / this.speed * Time.delta();
				const target = this.getTileTarget(tile, entity.lastItem, entity.lastInput, false);

				if (target !== null && entity.time >= 1) { // <--- snek check was here
					this.getTileTarget(tile, entity.lastItem, entity.lastInput, true);
					target.block().handleItem(entity.lastItem, target, Edges.getFacingEdge(tile, target));
					entity.items.remove(entity.lastItem, 1);
					entity.lastItem = null;
				}
			}
		}
	});
}
const clear = extendContent(Router, "clear-router", def);