/*
	Copyright (c) deltanedas 2024

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

const dirs = require("routorio/lib/dirs");

var networks;

const fusionName = "routorio-fusion-router";

const FusionNetwork = {
	new(entity, id) {
		const ret = Object.create(FusionNetwork);
		ret.routers = ObjectSet.with(entity);
		ret.id = id;
		// Linked list nodes
		ret.rebuild(entity);
		ret.rebuildOutputs();
		return ret;
	},

	read(stream, id) {
		const ret = Object.create(FusionNetwork);
		ret.id = id;

		ret.heat = stream.readFloat();
		ret.warmup = stream.readFloat();

		const count = stream.readShort();
		ret.routers = new ObjectSet(count);
		for (var i = 0; i < count; i++) {
			var pos = stream.readInt();
			ret.routers.add(Vars.world.build(pos));
		}

		ret.rebuildOutputs();
		return ret;
	},

	write(stream) {
		stream.writeFloat(this.heat);
		stream.writeFloat(this.warmup);

		const routers = this.routers.toSeq();
		stream.writeShort(routers.size);
		for (var i = 0; i < routers.size; i++) {
			var block = routers.get(i);
			stream.writeInt(block.tile.pos());
		}
	},

	combine(other) {
		const ours = this.routers.size;
		const routers = other.routers.toSeq();
		for (var i = 0; i < routers.size; i++) {
			this.routers.add(routers.get(i));
			routers.get(i).networkId = this.id;
		}

		const theirs = routers.size;
		const total = ours + theirs;
		this.warmup = (this.warmup * ours + other.warmup * theirs) / total;
		this.heat = (this.heat * ours + other.heat * theirs) / total;
	},

	rename(id) {
		this.routers.each(build => {
			build.networkId = id
		});
	},

	refresh() {
		const routers = this.routers.toSeq();
		if (!routers.size) return;

		for (var i = 0; i < routers.size; i++) {
			var ent = routers.get(i);
			if (ent.block.name == fusionName) {
				ent.networkId = null;
			}
		}

		ent = routers.peek();
		this.routers.clear();
		this.rebuild(ent);
		this.rebuildOutputs();

		networks.prune();
	},

	rebuild(root) {
		for (var i in dirs) {
			var tile = root.tile.nearby(i);
			if (!tile) return;

			if (tile.block().name == fusionName) {
				var ent = tile.build;
				if (this.routers.add(ent)) {
					if (ent.networkId !== null) {
						if (ent.networkId == this.id) return;

						var other = networks.get(ent.networkId);
						this.combine(other);
						other.routers.clear();
					}

					ent.networkId = this.id;
					this.rebuild(ent);
				}
			}
		}
	},

	rebuildOutputs() {
		const routers = this.routers.toSeq();

		var last, indices = 0;
		for (var i = 0; i < routers.size; i++) {
			var router = routers.get(i);
			// FIXME: have this iterate in a defined order
			router.index = indices++;
			for (var output of router.outputs) {
				var node = {
					to: output,
					from: router,
					prev: node
				};

				if (last) {
					last.next = node;
				} else {
					this.last = this.begin = node;
				}
				last = node;
			}
		}
		// no outputs
		if (!node) return;

		// outputs!
		this.end = node;
		this.end.next = this.begin;
		this.begin.prev = node;
	},

	empty() {
		return this.routers.size == 0;
	},

	begin: null,
	end: null,
	last: null,

	warmup: 0,
	heat: 0
};

networks = {
	// create a new network and return its id
	create(build) {
		const id = this._next++;
		this._map[id] = FusionNetwork.new(build, id);
		this._count++;
		return id;
	},

	// get a network from its id
	get(id) {
		return this._map[id];
	},

	remove(id) {
		if (id + 1 == this._next)
			this._next--;

		delete this._map[id];
		this._count--;
	},

	rename(old, id) {
		if (old == id)
			return false;

		const network = this._map[old];
		delete this._map[old];
		network.rename(id);
		this._map[id] = network;
		return true;
	},

	flatten() {
		// this index is guaranteed to either be unused or used by the same network being processed
		// so renames never overwrite other networks
		var empty = 0;
		for (var i = 0; i < this._next; i++) {
			if (this._map[i] === undefined)
				continue;

			// if the network was renamed this index is guaranteed to be unused now
			// if not then the next index is the one being processed next
			this.rename(i, empty);
			empty++;
		}

		// guaranteed to be unused since its flattened
		_next = empty;
	},

	clear() {
		this._map = {};
		this._count = 0;
		this._next = 0;
	},

	prune() {
		for (var id in this._map) {
			if (this._map[id].empty()) {
				this.remove(id);
			}
		}
	},

	_map: {},
	_count: 0,
	_next: 0
};

const chunk = extend(SaveFileReader.CustomChunk, {
	write(stream) {
		stream.writeByte(0);
		stream.writeShort(networks._count);

		for (var i = 0; i < networks._count; i++) {
			networks._map[i].write(stream);
		}
	},

	read(stream) {
		// assume its flattened before writing
		const version = stream.readByte();
		networks._count = stream.readShort();
		networks._next = networks._count;

		for (var i = 0; i < networks._count; i++) {
			networks._map[i] = FusionNetwork.read(stream, i);
		}
	}
});

Events.on(SaveWriteEvent, e => {
	// this event is fired before actually writing the data, so flatten beforehand
	networks.prune();
	networks.flatten();
});

Events.on(WorldLoadEvent, e => {
	networks.clear();
});

var highest = SaveIO.saveWriter.version;
for (var i = 7; i <= highest; i++) {
	SaveIO.getSaveWriter(i).addCustomChunk("routorio_networks", chunk);
}

module.exports = networks;
