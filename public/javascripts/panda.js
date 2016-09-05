var panda = (function(reconnectionDelay) {
	var endpoints = {
		connect: '/api/connect',
		disconnect: '/api/disconnect'
	};

	function changeConnectionState(connected, cb) {
		$.post( connected ? endpoints.connect : endpoints.disconnect,
			cb);
	}

	function connect(cb) {
		changeConnectionState(true, cb);
	}

	function disconnect(cb) {
		changeConnectionState(false, cb);
	}

	function reconnect(cb) {
		disconnect(
			function() {
				setTimeout(
					function() {
						connect(cb);
					}, reconnectionDelay);
			});
	}

	return {
		reconnect: reconnect
	};
})(30000);

window.epsilam = {
	panda: panda
};
