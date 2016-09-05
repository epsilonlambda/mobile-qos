var panda = (function(reconnectionDelay) {
	var endpoints = {
		connect: '/api/connect',
		disconnect: '/api/disconnect',
		isConnected: '/api/is-connected',
		isDisconnected: '/api/is-disconnected'
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

	function callbackOnPollSuccess(pollEndpoint, interval, cb) {
		function poller () {
			$.get(pollEndpoint, function(data) {
				if(data === true) {
					cb();
				} else {
					setTimeout(poller, interval);
				}
			});
		};
		
		return poller;
	}

	function reconnect(cb, disconnectCb) {
		disconnect(
			function() {
				callbackOnPollSuccess(endpoints.isDisconnected, 2000,
					function() {
						if(disconnectCb !== undefined)
							disconnectCb();
						connect(
							function() {
								callbackOnPollSuccess(endpoints.isConnected, 2000, cb)();
							});
					})();
			});
	}

	return {
		reconnect: reconnect
	};
})(30000);

window.epsilam = {
	panda: panda
};
