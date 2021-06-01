'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _Defaults = require('./Defaults');

var _Defaults2 = _interopRequireDefault(_Defaults);

var _EventStream = require('./EventStream');

var _EventStream2 = _interopRequireDefault(_EventStream);

var _Agent = require('./Agent');

var _Agent2 = _interopRequireDefault(_Agent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * iotready Cloud API wrapper.
 *
 * Most iotready methods take a single unnamed argument object documented as
 * `options` with key/value pairs for each option.
 */
var iotready = function () {
	/**
  * Contructor for the Cloud API wrapper.
  *
  * Create a new iotready object and call methods below on it.
  *
  * @param  {Object} options Options for this API call Options to be used for all requests (see [Defaults](../src/Defaults.js))
  */
	function iotready() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		(0, _classCallCheck3.default)(this, iotready);

		// todo - this seems a bit dangerous - would be better to put all options/context in a contained object
		(0, _assign2.default)(this, _Defaults2.default, options);
		this.context = {};
		this.agent = new _Agent2.default(this.baseUrl);
	}

	(0, _createClass3.default)(iotready, [{
		key: '_isValidContext',
		value: function _isValidContext(name, context) {
			return (name === 'tool' || name === 'project') && context !== undefined;
		}
	}, {
		key: 'setContext',
		value: function setContext(name, context) {
			if (context !== undefined) {
				if (this._isValidContext(name, context)) {
					this.context[name] = context;
				} else {
					throw Error('uknown context name or undefined context: ' + name);
				}
			}
		}

		/**
   * Builds the final context from the context parameter and the context items in the api.
   * @param  {Object} context       The invocation context, this takes precedence over the local context.
   * @returns {Object} The context to use.
   * @private
   */

	}, {
		key: '_buildContext',
		value: function _buildContext(context) {
			return (0, _assign2.default)(this.context, context);
		}

		/**
   * Login to iotready Cloud using an existing iotready acccount.
   * @param  {Object} options Options for this API call
   * @param  {String} options.username      Username for the iotready account
   * @param  {String} options.password      Password for the iotready account
   * @param  {Number} options.tokenDuration How long the access token should last in seconds
   * @returns {Promise} A promise
   */

	}, {
		key: 'login',
		value: function login(_ref) {
			var username = _ref.username,
			    password = _ref.password,
			    _ref$tokenDuration = _ref.tokenDuration,
			    tokenDuration = _ref$tokenDuration === undefined ? this.tokenDuration : _ref$tokenDuration,
			    context = _ref.context;

			return this.request({ uri: '/oauth/token', form: {
					username: username,
					password: password,
					grant_type: 'password',
					client_id: this.clientId,
					client_secret: this.clientSecret,
					expires_in: tokenDuration
				}, method: 'post', context: context });
		}

		/**
   * Create Customer for Product.
   * @param  {Object} options Options for this API call
   * @param  {String} options.email         Username for the iotready account
   * @param  {String} options.password      Password for the iotready account
   * @param  {String} options.product       Create the customer in this product ID or slug
   * @returns {Promise} A promise
   */

	}, {
		key: 'createCustomer',
		value: function createCustomer(_ref2) {
			var email = _ref2.email,
			    password = _ref2.password,
			    product = _ref2.product,
			    context = _ref2.context;

			var uri = '/v1/products/' + product + '/customers';
			return this.request({ uri: uri, form: {
					email: email,
					password: password,
					grant_type: 'client_credentials',
					client_id: this.clientId,
					client_secret: this.clientSecret
				}, method: 'post', context: context });
		}

		/**
   * Login to iotready Cloud using an OAuth client.
   * @param  {Object} options Options for this API call
   * @param  {Object} options.context   Context information.
   * @returns {Promise} A promise
   */

	}, {
		key: 'loginAsClientOwner',
		value: function loginAsClientOwner(_ref3) {
			var context = _ref3.context;

			return this.request({ uri: '/oauth/token', form: {
					grant_type: 'client_credentials',
					client_id: this.clientId,
					client_secret: this.clientSecret
				}, method: 'post', context: context });
		}

		/**
   * List devices claimed to the account or product
   * @param  {Object} options Options for this API call
   * @param  {String} [options.deviceId]   (Product only) Filter results to devices with this ID (partial matching)
   * @param  {String} [options.deviceName] (Product only) Filter results to devices with this name (partial matching)
   * @param  {Array.<string>} [options.groups]   (Product only) A list of full group names to filter results to devices belonging to these groups only.
   * @param  {String} [options.sortAttr]   (Product only) The attribute by which to sort results. See API docs for options.
   * @param  {String} [options.sortDir]    (Product only) The direction of sorting. See API docs for options.
   * @param  {Number} [options.page]       (Product only) Current page of results
   * @param  {Number} [options.perPage]    (Product only) Records per page
   * @param  {String} [options.product]    List devices in this product ID or slug
   * @param  {String} options.auth         Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'listDevices',
		value: function listDevices(_ref4) {
			var deviceId = _ref4.deviceId,
			    deviceName = _ref4.deviceName,
			    groups = _ref4.groups,
			    sortAttr = _ref4.sortAttr,
			    sortDir = _ref4.sortDir,
			    page = _ref4.page,
			    perPage = _ref4.perPage,
			    product = _ref4.product,
			    auth = _ref4.auth,
			    context = _ref4.context;

			var uri = void 0,
			    query = void 0;

			if (product) {
				uri = '/v1/products/' + product + '/devices';
				groups = Array.isArray(groups) ? groups.join(',') : undefined;
				query = { deviceId: deviceId, deviceName: deviceName, groups: groups, sortAttr: sortAttr, sortDir: sortDir, page: page, per_page: perPage };
			} else {
				uri = '/v1/devices';
			}

			return this.get(uri, auth, query, context);
		}

		/**
   * Get detailed informationa about a device
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId  Device ID or Name
   * @param  {String} [options.product] Device in this product ID or slug
   * @param  {String} options.auth      Access token
   * @returns {Promise} A promise
   */

	}, {
		key: 'getDevice',
		value: function getDevice(_ref5) {
			var deviceId = _ref5.deviceId,
			    product = _ref5.product,
			    auth = _ref5.auth,
			    context = _ref5.context;

			var uri = this.deviceUri({ deviceId: deviceId, product: product });
			return this.get(uri, auth, undefined, context);
		}

		/**
   * Claim a device to the account. The device must be online and unclaimed.
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'claimDevice',
		value: function claimDevice(_ref6) {
			var deviceId = _ref6.deviceId,
			    requestTransfer = _ref6.requestTransfer,
			    auth = _ref6.auth,
			    context = _ref6.context;

			return this.post('/v1/devices', {
				id: deviceId,
				request_transfer: !!requestTransfer
			}, auth, context);
		}

		/**
   * Add a device to a product or move device out of quarantine.
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID
   * @param  {Object} options.file    A file that contains a single-column list of device IDs, device serial numbers, device IMEIs, or devie ICCIDs.
   *                                  Node: Either a path or Buffer. Browser: a File or Blob.
   * @param  {String} options.product  Add to this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'addDeviceToProduct',
		value: function addDeviceToProduct(_ref7) {
			var deviceId = _ref7.deviceId,
			    product = _ref7.product,
			    file = _ref7.file,
			    auth = _ref7.auth,
			    context = _ref7.context;

			var files = void 0,
			    data = void 0;

			if (file) {
				files = { file: file };
			} else if (deviceId) {
				data = { id: deviceId };
			}

			return this.request({
				uri: '/v1/products/' + product + '/devices',
				method: 'post',
				data: data,
				files: files,
				auth: auth,
				context: context
			});
		}

		/**
   * Unclaim / Remove a device from your account or product, or deny quarantine
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID or Name
   * @param  {String} options.product  Remove from this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'removeDevice',
		value: function removeDevice(_ref8) {
			var deviceId = _ref8.deviceId,
			    product = _ref8.product,
			    auth = _ref8.auth,
			    context = _ref8.context;

			var uri = this.deviceUri({ deviceId: deviceId, product: product });
			return this.delete(uri, undefined, auth, context);
		}

		/**
   * Unclaim a product device its the owner, but keep it in the product
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID or Name
   * @param  {String} options.product  Remove from this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'removeDeviceOwner',
		value: function removeDeviceOwner(_ref9) {
			var deviceId = _ref9.deviceId,
			    product = _ref9.product,
			    auth = _ref9.auth,
			    context = _ref9.context;

			var uri = '/v1/products/' + product + '/devices/' + deviceId + '/owner';
			return this.delete(uri, undefined, auth, context);
		}

		/**
   * Rename a device
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID or Name
   * @param  {String} options.name     Desired Name
   * @param  {String} [options.product] Rename device in this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'renameDevice',
		value: function renameDevice(_ref10) {
			var deviceId = _ref10.deviceId,
			    name = _ref10.name,
			    product = _ref10.product,
			    auth = _ref10.auth,
			    context = _ref10.context;

			return this.updateDevice({ deviceId: deviceId, name: name, product: product, auth: auth, context: context });
		}

		/**
   * Instruct the device to turn on/off the LED in a rainbow pattern
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID or Name
   * @param  {Boolean} options.signal   Signal on or off
   * @param  {String} [options.product] Device in this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'signalDevice',
		value: function signalDevice(_ref11) {
			var deviceId = _ref11.deviceId,
			    signal = _ref11.signal,
			    product = _ref11.product,
			    auth = _ref11.auth,
			    context = _ref11.context;

			return this.updateDevice({ deviceId: deviceId, signal: signal, product: product, auth: auth, context: context });
		}

		/**
   * Store some notes about device
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId  Device ID or Name
   * @params {String} options.notes     Your notes about this device
   * @param  {String} [options.product] Device in this product ID or slug
   * @param  {String} options.auth      Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'setDeviceNotes',
		value: function setDeviceNotes(_ref12) {
			var deviceId = _ref12.deviceId,
			    notes = _ref12.notes,
			    product = _ref12.product,
			    auth = _ref12.auth,
			    context = _ref12.context;

			return this.updateDevice({ deviceId: deviceId, notes: notes, product: product, auth: auth, context: context });
		}

		/**
   * Update multiple device attributes at the same time
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId       Device ID or Name
   * @param  {String} [options.name]         Desired Name
   * @param  {Boolean} options.signal        Signal device on or off
   * @params {String} [options.notes]        Your notes about this device
   * @param  {Boolean} [options.development] (Product only) Set to true to mark as development, false to return to product fleet
   * @params {Number} [options.desiredFirmwareVersion] (Product only) Lock the product device to run this firmware version.
   *                                              Pass `null` to unlock firmware and go back to released firmware.
   * @params {Boolean} [options.flash]       (Product only) Immediately flash firmware indicated by desiredFirmwareVersion
   * @param  {String} [options.product]      Device in this product ID or slug
   * @param  {String} options.auth           Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'updateDevice',
		value: function updateDevice(_ref13) {
			var deviceId = _ref13.deviceId,
			    name = _ref13.name,
			    signal = _ref13.signal,
			    notes = _ref13.notes,
			    development = _ref13.development,
			    desiredFirmwareVersion = _ref13.desiredFirmwareVersion,
			    flash = _ref13.flash,
			    product = _ref13.product,
			    auth = _ref13.auth,
			    context = _ref13.context;

			if (signal !== undefined) {
				signal = signal ? '1' : '0';
			}

			var uri = this.deviceUri({ deviceId: deviceId, product: product });
			var data = product ? { name: name, signal: signal, notes: notes, development: development, desired_firmware_version: desiredFirmwareVersion, flash: flash } : { name: name, signal: signal, notes: notes };
			return this.put(uri, data, auth, context);
		}

		/**
   * Generate a claim code to use in the device claiming process.
   * To generate a claim code for a product, the access token MUST belong to a
   * customer of the product.
   * @param  {Object} options Options for this API call
   * @param  {String} [options.iccid] ICCID of the SIM card used in the Electron
   * @param  {String} [options.product] Device in this product ID or slug
   * @param  {String} options.auth  Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'getClaimCode',
		value: function getClaimCode(_ref14) {
			var iccid = _ref14.iccid,
			    product = _ref14.product,
			    auth = _ref14.auth,
			    context = _ref14.context;

			var uri = product ? '/v1/products/' + product + '/device_claims' : '/v1/device_claims';
			return this.post(uri, { iccid: iccid }, auth, context);
		}

		/**
   * Get the value of a device variable
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID or Name
   * @param  {String} options.name     Variable name
   * @param  {String} [options.product] Device in this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'getVariable',
		value: function getVariable(_ref15) {
			var deviceId = _ref15.deviceId,
			    name = _ref15.name,
			    product = _ref15.product,
			    auth = _ref15.auth,
			    context = _ref15.context;

			var uri = product ? '/v1/products/' + product + '/devices/' + deviceId + '/' + name : '/v1/devices/' + deviceId + '/' + name;
			return this.get(uri, auth, undefined, context);
		}

		/**
   * Call a device function
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId Device ID or Name
   * @param  {String} options.name     Function name
   * @param  {String} options.argument Function argument
   * @param  {String} [options.product] Device in this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'postFunction',
		value: function postFunction(_ref16) {
			var deviceId = _ref16.deviceId,
			    name = _ref16.name,
			    argument = _ref16.argument,
			    product = _ref16.product,
			    auth = _ref16.auth,
			    context = _ref16.context;

			var uri = product ? '/v1/products/' + product + '/devices/' + deviceId + '/' + name : '/v1/devices/' + deviceId + '/' + name;
			return this.post(uri, { args: argument }, auth, context);
		}

		/**
   * Get a stream of events
   * @param  {Object} options Options for this API call
   * @param  {String} [options.deviceId] Device ID or Name, or `mine` to indicate only your devices.
   * @param  {String} [options.name]     Event Name
   * @param  {String} [options.org]     Organization Slug
   * @param  {String} [options.product] Events for this product ID or slug
   * @param  {String} options.auth     Access Token
   * @returns {Promise} If the promise resolves, the resolution value will be an EventStream object that will
   * emit 'event' events.
   */

	}, {
		key: 'getEventStream',
		value: function getEventStream(_ref17) {
			var deviceId = _ref17.deviceId,
			    name = _ref17.name,
			    org = _ref17.org,
			    product = _ref17.product,
			    auth = _ref17.auth;

			var uri = '/v1/';
			if (org) {
				uri += 'orgs/' + org + '/';
			}

			if (product) {
				uri += 'products/' + product + '/';
			}

			if (deviceId) {
				uri += 'devices/';
				if (!(deviceId.toLowerCase() === 'mine')) {
					uri += deviceId + '/';
				}
			}

			uri += 'events';

			if (name) {
				uri += '/' + encodeURIComponent(name);
			}

			return new _EventStream2.default('' + this.baseUrl + uri, auth).connect();
		}

		/**
   * Publish a event to the iotready Cloud
   * @param  {Object} options Options for this API call
   * @param  {String} options.name      Event name
   * @param  {String} options.data      Event data
   * @param  {Boolean} options.isPrivate Should the event be publicly available?
   * @param  {String} [options.product]  Event for this product ID or slug
   * @param  {String} options.auth      Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'publishEvent',
		value: function publishEvent(_ref18) {
			var name = _ref18.name,
			    data = _ref18.data,
			    isPrivate = _ref18.isPrivate,
			    product = _ref18.product,
			    auth = _ref18.auth,
			    context = _ref18.context;

			var uri = product ? '/v1/products/' + product + '/events' : '/v1/devices/events';
			var postData = { name: name, data: data, private: isPrivate };
			return this.post(uri, postData, auth, context);
		}

		/**
   * List products the account has access to
   * @param  {Object} options Options for this API call
   * @param  {String} options.auth Access Token
   * @returns {Promise} A promise
   */

	}, {
		key: 'listProducts',
		value: function listProducts(_ref19) {
			var auth = _ref19.auth,
			    context = _ref19.context;

			return this.get('/v1/products', auth, undefined, context);
		}

		/**
   * Get detailed information about a product
   * @param  {Object} options Options for this API call
   * @param  {String} options.product  Product ID or slug
   * @param  {String} options.auth     Access token
   * @returns {Promise} A promise
   */

	}, {
		key: 'getProduct',
		value: function getProduct(_ref20) {
			var product = _ref20.product,
			    auth = _ref20.auth,
			    context = _ref20.context;

			return this.get('/v1/products/' + product, auth, undefined, context);
		}

		/**
   * API URI to access a device
   * @param  {Object} options Options for this API call
   * @param  {String} options.deviceId  Device ID to access
   * @param  {String} [options.product] Device only in this product ID or slug
   * @private
   * @returns {string} URI
   */

	}, {
		key: 'deviceUri',
		value: function deviceUri(_ref21) {
			var deviceId = _ref21.deviceId,
			    product = _ref21.product;

			return product ? '/v1/products/' + product + '/devices/' + deviceId : '/v1/devices/' + deviceId;
		}
	}, {
		key: 'get',
		value: function get(uri, auth, query, context) {
			context = this._buildContext(context);
			return this.agent.get(uri, auth, query, context);
		}
	}, {
		key: 'head',
		value: function head(uri, auth, query, context) {
			context = this._buildContext(context);
			return this.agent.head(uri, auth, query, context);
		}
	}, {
		key: 'post',
		value: function post(uri, data, auth, context) {
			context = this._buildContext(context);
			return this.agent.post(uri, data, auth, context);
		}
	}, {
		key: 'put',
		value: function put(uri, data, auth, context) {
			context = this._buildContext(context);
			return this.agent.put(uri, data, auth, context);
		}
	}, {
		key: 'delete',
		value: function _delete(uri, data, auth, context) {
			context = this._buildContext(context);
			return this.agent.delete(uri, data, auth, context);
		}
	}, {
		key: 'request',
		value: function request(args) {
			args.context = this._buildContext(args.context);
			return this.agent.request(args);
		}
	}]);
	return iotready;
}();

// Aliases for backwards compatibility


iotready.prototype.removeAccessToken = iotready.prototype.deleteAccessToken;

exports.default = iotready;
module.exports = exports['default'];
//# sourceMappingURL=iotready.js.map