const glob = require('glob');
const fs = require('fs');
const url = require('url');
const Koa = require('koa');
const Result = require('./result');
const path = require('path');

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

      if (
        ctx.method.toLowerCase() === route[0].toLocaleLowerCase() &&
        ctx.path.startsWith(route[1])
      ) {
        let data = conf[k];

        if (typeof data === 'function') {
          data = data(ctx);
        }

        if (!(data instanceof this.resultCls)) {
          data = new this.resultCls(data);
        }

        ctx.status = data.getStatus();

        data.setDebug({
          route: k,
          path: ctx.path
        });

        ctx.body = data.getAll();

        return;
      }
    }
  }

  start() {
    const app = new Koa();
    app.use(this.handler.bind(this));
    console.log(`Mock server is listening on ${this.addr}`);
    app.listen(url.parse(this.addr).port, url.parse(this.addr).hostname);
  }
}

module.exports = MockServer
