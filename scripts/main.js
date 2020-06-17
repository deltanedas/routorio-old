this.global.routorio = {};
function add(names) {
	for (var i in names) {
		var name = names[i];
		try {
			this.global.routorio[name] = require(name);
		} catch (e) {
			Log.err("Failed to load routorio script {0}.js: {1}", name, e);
		}
	}
}

// Blocks
add(["router", "double-router", "titanium-double-router",
	"inverted-router", "clear-router", "explosive-router",
	"combat-router", "arc-router", "ubuntium-router",
	"surge-router"]);

// Units
add(["reverout", "routerpede"]);
