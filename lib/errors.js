'use strict';

const STATUS_CODES = module.exports = Object.assign({}, require('http').STATUS_CODES);

const M_REJECT_CHARS = /[^a-zA-Z0-9_]/g;
const NOTHING = String();

/**
 * HTTP Error classes
 * @module
 */

/*
 * Reverse-map status codes to messages
 */
Object.keys(STATUS_CODES).forEach((code) => {
  const message = STATUS_CODES[code];
  const name = message.replace(M_REJECT_CHARS, '_').toUpperCase();

  STATUS_CODES[name] = Number(code);
});

/**
 * A generic HTTP Error
 */
class HTTPError extends Error {
  /**
   * @param  {Number} code     An HTTP status code
   * @param  {String} message  An error message
   * @param  {Object} metadata Contextual data to be included in the error
   */
  constructor(code, message, metadata) {
    super();

    this.code = Number(code) || STATUS_CODES.INTERNAL_SERVER_ERROR;
    this.name = STATUS_CODES[String(this.code)].replace(M_REJECT_CHARS, NOTHING);
    this.message = message || STATUS_CODES[this.code];
    this.metadata = metadata || {};
  }

  /**
   * Generate a JSON serializable Object
   *
   * @return {Object} A JSON-serializable Object
   */
  toJSON() {
    return ({
      code: this.code,
      name: this.name,
      message: this.message,
      metadata: this.metadata
    });
  }

  /**
   * Generate a useful string for debugging
   * @return {String}
   */
  toString() {
    return `${this.name} (${this.code}): ${this.message}, ${JSON.stringify(this.metadata)}`;
  }

  /**
   * An error renderer control layer
   *
   * @param  {Error}                err  An Error that manifested in the request
   * @param  {HTTP.IncomingMessage} req  The HTTP Request handle
   * @param  {HTTP.ServerResponse}  res  The HTTP Response handle
   */
  static handler(err, req, res) {
    // Wrap instances of Error in an HTTPError
    if (!(err instanceof HTTPError)) {
      err = new HTTPError(err.code || STATUS_CODES.INTERNAL_SERVER_ERROR, err.message);
    }

    const content = Buffer(JSON.stringify(err, null, 2), 'utf8'); // eslint-disable-line new-cap

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Length', content.length);
    res.writeHead(err.code || STATUS_CODES.INTERNAL_SERVER_ERROR);

    res.write(content);
    res.end();

    Log.debug(err);
  }
}

exports = module.exports = HTTPError;

/**
 * An HTTP 400 response
 * @extends HTTPError
 */
class RequestError extends HTTPError {
  /**
   * @constructor
   * @param {String}  reason
   * @param {Object}  metadata
   */
  constructor(reason, metadata) {
    super(STATUS_CODES.BAD_REQUEST, reason, metadata);
  }
}

exports.RequestError = RequestError;

/**
 * An HTTP 401 response
 * @extends HTTPError
 */
class AuthorizationError extends HTTPError {
  /**
   * @constructor
   * @param {String}  reason
   * @param {Object}  metadata
   */
  constructor(reason, metadata) {
    super(STATUS_CODES.UNAUTHORIZED, reason, metadata);
  }
}

exports.AuthorizationError = AuthorizationError;

/**
 * An HTTP 404 response
 * @extends HTTPError
 */
class NotFoundError extends HTTPError {
  /**
   * @constructor
   * @param {String}  method
   * @param {String}  path
   * @param {Object}  metadata
   */
  constructor(method, path, metadata) {
    super(STATUS_CODES.NOT_FOUND, `${method} ${path}`, Object.assign({method, path}, metadata));
  }
}

exports.NotFoundError = NotFoundError;
