const spook = extendContent(Router, "routergeist", {});

spook.buildType = () => new JavaAdapter(Router.RouterBuild, ControlBlock, {
	created() {
		this.player = UnitTypes.block.create(this.team);
		this.player.tile(this);
	},

	getTileTarget(item, from, set) {
		if (!this.player.isPlayer() || !this.player.isShooting) return null;

		const rot = Math.floor(Mathf.angle(this.player.aimX() - this.x,
			this.player.aimY() - this.y) / 90);
		if (set) this.rotation = rot;
		const other = this.tile.getNearbyEntity(rot);
		return (other != null && other.acceptItem(this, item)) ? other : null;
	},

	unit() {
		return this.player;
	},

	player: Nulls.blockUnit
}, spook);

module.exports = spook;
