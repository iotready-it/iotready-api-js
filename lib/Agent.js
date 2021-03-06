'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _superagentPrefix = require('superagent-prefix');

var _superagentPrefix2 = _interopRequireDefault(_superagentPrefix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Agent = function () {
	function Agent(baseUrl) {
		(0, _classCallCheck3.default)(this, Agent);

		this.prefix = (0, _superagentPrefix2.default)(baseUrl);
	}

	(0, _createClass3.default)(Agent, [{
		key: 'get',
		value: function get(uri, auth, query, context) {
			return this.request({ uri: uri, auth: auth, method: 'get', query: query, context: context });
		}
	}, {
		key: 'head',
		value: function head(uri, auth, query, context) {
			return this.request({ uri: uri, auth: auth, method: 'head', query: query, context: context });
		}
	}, {
		key: 'post',
		value: function post(uri, data, auth, context) {
			return this.request({ uri: uri, data: data, auth: auth, method: 'post', context: context });
		}
	}, {
		key: 'put',
		value: function put(uri, data, auth, context) {
			return this.request({ uri: uri, data: data, auth: auth, method: 'put', context: context });
		}
	}, {
		key: 'delete',
		value: function _delete(uri, data, auth, context) {
			return this.request({ uri: uri, data: data, auth: auth, method: 'delete', context: context });
		}

		/**
   *
   * @param {String} uri           The URI to request
   * @param {String} method        The method used to request the URI, should be in uppercase.
   * @param {String} data          Arbitrary data to send as the body.
   * @param {Object} auth          Authorization
   * @param {String} query         Query parameters
   * @param {Object} form          Form fields
   * @param {Object} files         array of file names and file content
   * @parma {Object} context       the invocation context, describing the tool and project.
   * @return {Promise} A promise. fulfilled with {body, statusCode}, rejected with { statusCode, errorDescription, error, body }
   */

	}, {
		key: 'request',
		value: function request(_ref) {
			var uri = _ref.uri,
			    method = _ref.method,
			    _ref$data = _ref.data,
			    data = _ref$data === undefined ? undefined : _ref$data,
			    auth = _ref.auth,
			    _ref$query = _ref.query,
			    query = _ref$query === undefined ? undefined : _ref$query,
			    _ref$form = _ref.form,
			    form = _ref$form === undefined ? undefined : _ref$form,
			    _ref$files = _ref.files,
			    files = _ref$files === undefined ? undefined : _ref$files,
			    _ref$context = _ref.context,
			    context = _ref$context === undefined ? undefined : _ref$context,
			    _ref$raw = _ref.raw,
			    raw = _ref$raw === undefined ? false : _ref$raw;

			var requestFiles = this._sanitizeFiles(files);
			return this._request({ uri: uri, method: method, data: data, auth: auth, query: query, form: form, context: context, files: requestFiles, raw: raw });
		}

		/**
   *
   * @param {String} uri           The URI to request
   * @param {String} method        The method used to request the URI, should be in uppercase.
   * @param {String} data          Arbitrary data to send as the body.
   * @param {Object} auth          Authorization
   * @param {String} query         Query parameters
   * @param {Object} form          Form fields
   * @param {Object} files         array of file names and file content
   * @param {Object} context       the invocation context
   * @return {Promise} A promise. fulfilled with {body, statusCode}, rejected with { statusCode, errorDescription, error, body }
   */

	}, {
		key: '_request',
		value: function _request(_ref2) {
			var uri = _ref2.uri,
			    method = _ref2.method,
			    data = _ref2.data,
			    auth = _ref2.auth,
			    query = _ref2.query,
			    form = _ref2.form,
			    files = _ref2.files,
			    context = _ref2.context,
			    raw = _ref2.raw;

			var req = this._buildRequest({ uri: uri, method: method, data: data, auth: auth, query: query, form: form, context: context, files: files });

			if (raw) {
				return req;
			}
			return this._promiseResponse(req);
		}

		/**
   * Promises to send the request and retreive the response.
   * @param {Request} req The request to send
   * @returns {Promise}   The promise to send the request and retrieve the response.
   * @private
   */

	}, {
		key: '_promiseResponse',
		value: function _promiseResponse(req) {
			var _this = this;

			return new _promise2.default(function (fulfill, reject) {
				return _this._sendRequest(req, fulfill, reject);
			});
		}

		/**
   * Sends the given request, calling the fulfill or reject methods for success/failure.
   * @param {object} request   The request to send
   * @param {function} fulfill    Called on success with the response
   * @param {function} reject     Called on failure with the failure reason.
   * @private
   * @returns {undefined} Nothing
   */

	}, {
		key: '_sendRequest',
		value: function _sendRequest(request, fulfill, reject) {
			request.end(function (error, res) {
				var body = res && res.body;
				if (error) {
					var uri = request.url;
					var statusCode = error.status;
					var errorDescription = (statusCode ? 'HTTP error ' + statusCode : 'Network error') + ' from ' + uri;
					var shortErrorDescription = void 0;
					if (body && body.error_description) {
						errorDescription += ' - ' + body.error_description;
						shortErrorDescription = body.error_description;
					}
					var reason = new Error(errorDescription);
					(0, _assign2.default)(reason, { statusCode: statusCode, errorDescription: errorDescription, shortErrorDescription: shortErrorDescription, error: error, body: body });
					reject(reason);
				} else {
					fulfill({
						body: body,
						statusCode: res.statusCode
					});
				}
			});
		}
	}, {
		key: '_buildRequest',
		value: function _buildRequest(_ref3) {
			var uri = _ref3.uri,
			    method = _ref3.method,
			    data = _ref3.data,
			    auth = _ref3.auth,
			    query = _ref3.query,
			    form = _ref3.form,
			    files = _ref3.files,
			    context = _ref3.context,
			    _ref3$makerequest = _ref3.makerequest,
			    makerequest = _ref3$makerequest === undefined ? _superagent2.default : _ref3$makerequest;

			var req = makerequest(method, uri);
			if (this.prefix) {
				req.use(this.prefix);
			}
			this._authorizationHeader(req, auth);
			if (context) {
				this._applyContext(req, context);
			}
			if (query) {
				req.query(query);
			}
			if (files) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = (0, _getIterator3.default)((0, _entries2.default)(files)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
						    name = _step$value[0],
						    file = _step$value[1];

						// API for Form Data is different in Node and in browser
						var options = {
							filepath: file.path
						};
						if (this.isForBrowser(makerequest)) {
							options = file.path;
						}
						req.attach(name, file.data, options);
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				if (form) {
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = (0, _getIterator3.default)((0, _entries2.default)(form)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
							    name = _step2$value[0],
							    value = _step2$value[1];

							req.field(name, value);
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2.return) {
								_iterator2.return();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}
				}
			} else if (form) {
				req.type('form');
				req.send(form);
			} else if (data) {
				req.send(data);
			}
			return req;
		}
	}, {
		key: 'isForBrowser',
		value: function isForBrowser() {
			var makerequest = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _superagent2.default;

			// superagent only has the getXHR method in the browser version
			return !!makerequest.getXHR;
		}
	}, {
		key: '_applyContext',
		value: function _applyContext(req, context) {
			if (context.tool) {
				this._addToolContext(req, context.tool);
			}
			if (context.project) {
				this._addProjectContext(req, context.project);
			}
		}
	}, {
		key: '_addToolContext',
		value: function _addToolContext(req, tool) {
			var value = '';
			if (tool.name) {
				value += this._toolIdent(tool);
				if (tool.components) {
					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = (0, _getIterator3.default)(tool.components), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var component = _step3.value;

							value += ', ' + this._toolIdent(component);
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}
				}
			}
			if (value) {
				req.set('X-iotready-Tool', value);
			}
		}
	}, {
		key: '_toolIdent',
		value: function _toolIdent(tool) {
			return this._nameAtVersion(tool.name, tool.version);
		}
	}, {
		key: '_nameAtVersion',
		value: function _nameAtVersion(name, version) {
			var value = '';
			if (name) {
				value += name;
				if (version) {
					value += '@' + version;
				}
			}
			return value;
		}
	}, {
		key: '_addProjectContext',
		value: function _addProjectContext(req, project) {
			var value = this._buildSemicolonSeparatedProperties(project, 'name');
			if (value) {
				req.set('X-iotready-Project', value);
			}
		}

		/**
   * Creates a string like primaryPropertyValue; name=value; name1=value
   * from the properties of an object.
   * @param {object} obj               The object to create the string from
   * @param {string} primaryProperty   The name of the primary property which is the default value and must be defined.
   * @private
   * @return {string} The formatted string representing the object properties and the default property.
   */

	}, {
		key: '_buildSemicolonSeparatedProperties',
		value: function _buildSemicolonSeparatedProperties(obj, primaryProperty) {
			var value = '';
			if (obj[primaryProperty]) {
				value += obj[primaryProperty];
				for (var prop in obj) {
					if (prop !== primaryProperty && obj.hasOwnProperty(prop)) {
						value += '; ' + prop + '=' + obj[prop];
					}
				}
			}
			return value;
		}

		/**
   * Adds an authorization header.
   * @param {Request} req     The request to add the authorization header to.
   * @param {object|string}  auth    The authorization. Either a string authorization bearer token,
   *  or a username/password object.
   * @returns {Request} req   The original request.
   */

	}, {
		key: '_authorizationHeader',
		value: function _authorizationHeader(req, auth) {
			if (auth) {
				if (auth.username !== undefined) {
					req.auth(auth.username, auth.password);
				} else {
					req.set({ Authorization: 'Bearer ' + auth });
				}
			}
			return req;
		}

		/**
   *
   * @param {Array} files converts the file names to file, file1, file2.
   * @returns {object} the renamed files.
   */

	}, {
		key: '_sanitizeFiles',
		value: function _sanitizeFiles(files) {
			var requestFiles = void 0;
			if (files) {
				requestFiles = {};
				(0, _keys2.default)(files).forEach(function (k, i) {
					var name = i ? 'file' + (i + 1) : 'file';
					requestFiles[name] = {
						data: files[k],
						path: k
					};
				});
			}
			return requestFiles;
		}
	}]);
	return Agent;
}();

exports.default = Agent;
module.exports = exports['default'];
//# sourceMappingURL=Agent.js.map