const glob = require('glob');
const url = require('url');
const Koa = require('koa');
var pathToRegexp = require('path-to-regexp');
const Result = require('./result');

class MockServer {
  constructor(addr, pattern, resultCls) {
    this.addr = addr;
    this.pattern = pattern;
    this.resultCls = this.resultCls || Result;
  }

  getMockFiles() {
    return new Promise((resolve, reject) => {
      glob(this.pattern, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }

  getMockData(file) {
    return new Promise((resolve, reject) => {
      delete require.cache[require.resolve(file)];
      resolve(require(file));
    });
  }

  async handler(ctx) {
    let conf = {};
    const files = await this.getMockFiles();

    for (let file of files) {
      const c = await this.getMockData(file);
      Object.assign(conf, c || {});
    }

    for (let k of Object.keys(conf)) {
      const route = k.split(/\s+/);
      if (route.length !== 2) {
        continue;
      }

      let keys = [];
      const re = pathToRegexp(route[1], keys);

      const path = re.exec(ctx.path);

      if (path == null) {
        continue;
      }

      ctx.req.params = {};

      if (keys.length > 0) {
        keys.forEach((key, i) => {
          ctx.req.params[key.name] = path[i + 1];
        });
      }

      let data = conf[k];

      if (typeof data === 'function') {
        data = await data(ctx);
      }

      if (!(data instanceof this.resultCls)) {
        data = new this.resultCls(data);
      }

      ctx.status = data.getStatus();

      data.setDebug({
        route: k,
        path: ctx.path,
        params: ctx.req.params
      });

      ctx.body = data.getAll();

      return;
    }
  }

  start() {
    const app = new Koa();
    app.use(this.handler.bind(this));
    console.log(`Mock server is listening on ${this.addr}`);
    app.listen(url.parse(this.addr).port, url.parse(this.addr).hostname);
  }
}

module.exports = MockServer;
