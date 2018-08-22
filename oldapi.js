var request = require("request");
var util = require("util");

// Variable setup
var baseUrl = "https://apiurl";
var token;
var expirationDate;

// Checks token for expiration
if (!token || !expirationDate || expirationDate < Date.now()) {
    getToken(function(err, id_token) {
        if (err) {
            res.status(501).send({
                "exception": "get token error"
            });
            res.end();
        } else {
            token = "bearer " + id_token;
            req.authToken = token;
            expirationDate = Date.now() + 60 * 14 * 1000;
            next();
        }
    });

} else {
    req.authToken = token;
    next();
}

/**
 * Gets items on timeseries api
 * @param req Request arg to function   
 * @param res Response arg to function
 * @param next Callback arg
 */
function getNumericTimeSeries(req, res, next) {

    var apiServerUrl = baseUrl;
    if (instanceId) {
        apiServerUrl = apiServerUrl + "/timesseriesurl(%s)";
        apiServerUrl = util.format(apiServerUrl, instanceId);
    } else {
        apiServerUrl = apiServerUrl + "/timesseriesurl";
    }
    if (req.parameterUrlPart) {
        apiServerUrl += req.parameterUrlPart;
    }
    
    request(
    {
      method: 'GET',
      uri: apiServerUrl,
      headers: {
        'Content-Type':'application/json',
        'Authorization':req.authToken
      }
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
          parseResponse(response, function (err, parsedBody) {
              if (err) {
                  return next(err);
              }
              res.send(parsedBody);
          });
      } else {
         next(error);
      }
    }
  );
}

/**
 * Gets items on graph api
 * @param req Request arg to function   
 * @param res Response arg to function
 * @param next Callback arg
 */
function getGraphItem(req, res, next) {
    var apiServerUrl = baseUrl;
    if (instanceId) {
        apiServerUrl = apiServerUrl + "/Graphs/Items(%s)";
        apiServerUrl = util.format(apiServerUrl, instanceId);
    } else {
        apiServerUrl = apiServerUrl + "/Graphs/Items";
    }
    if (req.parameterUrlPart) {
        apiServerUrl += req.parameterUrlPart;
    }
    console.log("oData query url: " + apiServerUrl);
    request(
        {
            method: 'GET',
            uri: apiServerUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.authToken
            }
        },
        function (error, response, body) {
            res.status((error && error.status) || (response && response.statusCode));
            if (error == null) {
                parseResponse(response, function (err, parsedBody) {
                    if (err) {
                        return next(err);
                    }
                    res.send(parsedBody);
                });
            } else {
                next(error);
            }
        }
    );
}

/**
 * Gets token from Auth0
 * @param callback Callback for getting token
 */
function getToken(callback) {
    var form = {
        "client_id": "{client_id}",
        "username": "{client_username}",
        "password": "{client_password}",
        "grant_type": "password"
    };
    request({
            method: 'POST',
            uri: "https://auth.url",
            form: form,
            headers: {
                'Authorization': "{{ token placeholder }}"
            }
        },
        function(error, response, body) {
            if (error == null) {
                var parsedBody = JSON.parse(body);
                return callback(null, parsedBody.id_token);
            } else {
                return callback(error);
            }
        }
    );
}

/**
 * API response parser
 * @param response Response object to function
 * @param callback Callback function
 */
function parseResponse(response, callback) {
	try {
		var parsedBody = JSON.parse(response.body);
		if (!parsedBody.error) {
			parsedBody = this.formatResponseBody(parsedBody);
			return callback(null, parsedBody);
		} else {
			var err;
			if (parsedBody.error.message) {
				err = new Error(parsedBody.error.message);
			} else {
				err = parsedBody.error;
			}
			err.status = response.statusCode;
			return callback(err);
		}
	} catch (err) {
		
		var err = new Error(response.body);
		err.status = response.statusCode;
		return callback(err);
	}
}

