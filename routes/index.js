var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var syncRequest = require('sync-request');
var xml2js = require('xml2js');

function getDialupAPIPayload(shouldConnect) {
  var action = shouldConnect ? 1 : 0;
  return '<?xml version="1.0" encoding="UTF-8"?><request><Action>'+action+'</Action></request>';
}

var config = {
  host: '10.13.13.1'
};

var endpoints = {
  dialup: 'http://' + config.host +'/api/dialup/dial',
  status: 'http://' + config.host +'/api/monitoring/status',
  usageStats: 'http://' + config.host + '/api/monitoring/traffic-statistics'
};



/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.resolve(__dirname+'/../index.html'));
});

function makeConnectHandler(shouldConnect) {
  return function(req, res, next) {
  request.post({
	  url: endpoints.dialup,
	  headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'User-Agent': 'request',
		'Content-Length': 75,
		'Host': config.host
	  },
	  body: getDialupAPIPayload(shouldConnect)
	},
	function(error, response) { console.log(response); }
  );
  res.sendStatus(200);
};
}

router.post('/api/connect', makeConnectHandler(true));

router.post('/api/disconnect', makeConnectHandler(false));

function hwAPIGetRequest(endpoint, responseHandler) {
	var hwResponse = syncRequest('GET', endpoint);
	xml2js.parseString(hwResponse.getBody(),
			function(err, result){
				console.log(result);
				responseHandler(result);
			});
	
}
function makeStatusHandler(expectedStatus) {
	return function(req, res, next) {
		hwAPIGetRequest(endpoints.status,
			function(result){
				res.send(result.response.ConnectionStatus == expectedStatus);
		});
	};
}
router.get('/api/is-disconnected', makeStatusHandler(902));
router.get('/api/is-connected', makeStatusHandler(901));
router.get('/api/used-bandwidth', function(req, res, next) {
	hwAPIGetRequest(endpoints.usageStats,
		function(result) {
			res.send(result.response.TotalDownload);
		});
	});


module.exports = router;
