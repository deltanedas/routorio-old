const clear = extendContent(Router, "clear-router", {
	draw(tile){
		const entity = tile.entity;
		Draw.rect(Core.atlas.find("routorio-clear-router-bottom"), tile.drawx(), tile.drawy());
		if (entity.items != null && entity.items.total() > 0) {
			Draw.rect(entity.items.first().icon(Cicon.full), tile.drawx(), tile.drawy());
		}
		Draw.rect(Core.atlas.find("routorio-clear-router-top"), tile.drawx(), tile.drawy());
	}
});