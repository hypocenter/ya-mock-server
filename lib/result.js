class Result {
  constructor(payload, code = 0, msg = null) {
    this.payload = payload;
    this.code = code;
    this.msg = msg;

    this._status = 200;
    this._debug = {};
  }

  getAll() {
    return {
      code: this.code,
      msg: this.msg,
      data: this.payload,
      _debug: this._debug
    };
  }

  setStatus(status) {
    this._status = parseInt(status, 10);
    return this;
  }

  getStatus() {
    return this._status;
  }

  setDebug(debug) {
    this._debug = Object.assign(this._debug, debug || {});
    return this;
  }
}

module.exports = Result;
