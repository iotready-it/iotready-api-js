import Defaults from './Defaults';
import EventStream from './EventStream';
import Agent from './Agent';

/**
 * iotready Cloud API wrapper.
 *
 * Most iotready methods take a single unnamed argument object documented as
 * `options` with key/value pairs for each option.
 */
class iotready {
	/**
	 * Contructor for the Cloud API wrapper.
	 *
	 * Create a new iotready object and call methods below on it.
	 *
	 * @param  {Object} options Options for this API call Options to be used for all requests (see [Defaults](../src/Defaults.js))
	 */
	constructor(options = {}){
		// todo - this seems a bit dangerous - would be better to put all options/context in a contained object
		Object.assign(this, Defaults, options);
		this.context = {};
		this.agent = new Agent(this.baseUrl);
	}

	_isValidContext(name, context){
		return (name==='tool' || name==='project') && context!==undefined;
	}

	setContext(name, context){
		if (context!==undefined){
			if (this._isValidContext(name, context)){
				this.context[name] = context;
			} else {
				throw Error('uknown context name or undefined context: '+name);
			}
		}
	}

	/**
	 * Builds the final context from the context parameter and the context items in the api.
	 * @param  {Object} context       The invocation context, this takes precedence over the local context.
	 * @returns {Object} The context to use.
	 * @private
	 */
	_buildContext(context){
		return Object.assign(this.context, context);
	}

	/**
	 * Login to iotready Cloud using an existing iotready acccount.
	 * @param  {Object} options Options for this API call
	 * @param  {String} options.username      Username for the iotready account
	 * @param  {String} options.password      Password for the iotready account
	 * @param  {Number} options.tokenDuration How long the access token should last in seconds
	 * @returns {Promise} A promise
	 */
	login({ username, password, tokenDuration = this.tokenDuration, context }){
		return this.request({ uri: '/oauth/token', form: {
			username,
			password,
			grant_type: 'password',
			client_id: this.clientId,
			client_secret: this.clientSecret,
			expires_in: tokenDuration
		}, method: 'post', context });
	}

	/**
	 * Create Customer for Product.
	 * @param  {Object} options Options for this API call
	 * @param  {String} options.email         Username for the iotready account
	 * @param  {String} options.password      Password for the iotready account
	 * @param  {String} options.product       Create the customer in this product ID or slug
	 * @returns {Promise} A promise
	 */
	createCustomer({ email, password, product, context }){
		const uri =`/v1/products/${product}/customers`;
		return this.request({ uri: uri, form: {
			email,
			password,
			grant_type: 'client_credentials',
			client_id: this.clientId,
			client_secret: this.clientSecret
		}, method: 'post', context });
	}

	/**
	 * Login to iotready Cloud using an OAuth client.
	 * @param  {Object} options Options for this API call
	 * @param  {Object} options.context   Context information.
	 * @returns {Promise} A promise
	 */
	loginAsClientOwner({ context }){
		return this.request({ uri: '/oauth/token', form: {
			grant_type: 'client_credentials',
			client_id: this.clientId,
			client_secret: this.clientSecret
		}, method: 'post', context });
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
	listDevices({ deviceId, deviceName, groups, sortAttr, sortDir, page, perPage, product, auth, context }){
		let uri, query;

		if (product){
			uri = `/v1/products/${product}/devices`;
			groups = Array.isArray(groups) ? groups.join(',') : undefined;
			query = { deviceId, deviceName, groups, sortAttr, sortDir, page, per_page: perPage };
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
	getDevice({ deviceId, product, auth, context }){
		const uri = this.deviceUri({ deviceId, product });
		return this.get(uri, auth, undefined, context);
	}

	/**
	 * Claim a device to the account. The device must be online and unclaimed.
	 * @param  {Object} options Options for this API call
	 * @param  {String} options.deviceId Device ID
	 * @param  {String} options.auth     Access Token
	 * @returns {Promise} A promise
	 */
	claimDevice({ deviceId, requestTransfer, auth, context }){
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
	addDeviceToProduct({ deviceId, product, file, auth, context }){
		let files, data;

		if (file){
			files = { file };
		} else if (deviceId){
			data = { id: deviceId };
		}

		return this.request({
			uri: `/v1/products/${product}/devices`,
			method: 'post',
			data,
			files,
			auth,
			context
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
	removeDevice({ deviceId, product, auth, context }){
		const uri = this.deviceUri({ deviceId, product });
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
	removeDeviceOwner({ deviceId, product, auth, context }){
		const uri = `/v1/products/${product}/devices/${deviceId}/owner`;
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
	renameDevice({ deviceId, name, product, auth, context }){
		return this.updateDevice({ deviceId, name, product, auth, context });
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
	signalDevice({ deviceId, signal, product, auth, context }){
		return this.updateDevice({ deviceId, signal, product, auth, context });
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
	setDeviceNotes({ deviceId, notes, product, auth, context }){
		return this.updateDevice({ deviceId, notes, product, auth, context });
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
	updateDevice({ deviceId, name, signal, notes, development, desiredFirmwareVersion, flash, product, auth, context }){
		if (signal !== undefined){
			signal = signal ? '1' : '0';
		}

		const uri = this.deviceUri({ deviceId, product });
		const data = product ?
			{ name, signal, notes, development, desired_firmware_version: desiredFirmwareVersion, flash } :
			{ name, signal, notes };
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
	getClaimCode({ iccid, product, auth, context }){
		const uri = product ? `/v1/products/${product}/device_claims` : '/v1/device_claims';
		return this.post(uri, { iccid }, auth, context);
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
	get({ deviceId, name, product, auth, context }){
		const uri = product ?
			`/v1/products/${product}/devices/${deviceId}/${name}` :
			`/v1/devices/${deviceId}/${name}`;
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
	post({ deviceId, name, argument, product, auth, context }){
		const uri = product ?
			`/v1/products/${product}/devices/${deviceId}/${name}` :
			`/v1/devices/${deviceId}/${name}`;
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
	getEventStream({ deviceId, name, org, product, auth }){
		let uri = '/v1/';
		if (org){
			uri += `orgs/${org}/`;
		}

		if (product){
			uri += `products/${product}/`;
		}

		if (deviceId){
			uri += 'devices/';
			if (!(deviceId.toLowerCase() === 'mine')){
				uri += `${deviceId}/`;
			}
		}

		uri += 'events';

		if (name){
			uri += `/${encodeURIComponent(name)}`;
		}

		return new EventStream(`${this.baseUrl}${uri}`, auth).connect();
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
	publishEvent({ name, data, isPrivate, product, auth, context }){
		const uri = product ? `/v1/products/${product}/events` : '/v1/devices/events';
		const postData = { name, data, private: isPrivate };
		return this.post(uri, postData, auth, context);
	}

	/**
	 * List products the account has access to
	 * @param  {Object} options Options for this API call
	 * @param  {String} options.auth Access Token
	 * @returns {Promise} A promise
	 */
	listProducts({ auth, context }){
		return this.get('/v1/products', auth, undefined, context);
	}

	/**
	 * Get detailed information about a product
	 * @param  {Object} options Options for this API call
	 * @param  {String} options.product  Product ID or slug
	 * @param  {String} options.auth     Access token
	 * @returns {Promise} A promise
	 */
	getProduct({ product, auth, context }){
		return this.get(`/v1/products/${product}`, auth, undefined, context);
	}

	/**
	 * API URI to access a device
	 * @param  {Object} options Options for this API call
	 * @param  {String} options.deviceId  Device ID to access
	 * @param  {String} [options.product] Device only in this product ID or slug
	 * @private
	 * @returns {string} URI
	 */
	deviceUri({ deviceId, product }){
		return product ? `/v1/products/${product}/devices/${deviceId}` : `/v1/devices/${deviceId}`;
	}

	get(uri, auth, query, context){
		context = this._buildContext(context);
		return this.agent.get(uri, auth, query, context);
	}

	head(uri, auth, query, context){
		context = this._buildContext(context);
		return this.agent.head(uri, auth, query, context);
	}

	post(uri, data, auth, context){
		context = this._buildContext(context);
		return this.agent.post(uri, data, auth, context);
	}

	put(uri, data, auth, context){
		context = this._buildContext(context);
		return this.agent.put(uri, data, auth, context);
	}

	delete(uri, data, auth, context){
		context = this._buildContext(context);
		return this.agent.delete(uri, data, auth, context);
	}

	request(args){
		args.context = this._buildContext(args.context);
		return this.agent.request(args);
	}
}

// Aliases for backwards compatibility
iotready.prototype.removeAccessToken = iotready.prototype.deleteAccessToken;

export default iotready;
