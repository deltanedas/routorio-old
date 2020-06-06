// Chance for an item to be turned into Beryllium.
const amazonChance = 1 / 30;

const ubu = extendContent(Router, "ubuntium-router", {
	init() {
		this.super$init();
		this.beryllium = Vars.content.getByName(ContentType.item, "routorio-beryllium");
	},

	handleItem(item, tile, source) {
		if (Mathf.chance(amazonChance)) {
			item = this.beryllium;
		}
		this.super$handleItem(item, tile, source);
	}
});
