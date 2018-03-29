const { Result } = require('../../index');

const user = {
  name: 'Admin',
  avatar: './assets/img/zorro.svg',
  email: 'hypomail@gmail.com',
  token: {
    access_token: 'fake-token'
  }
};

module.exports = {
  'GET /api/auth/user': user,

  'POST /api/auth/login': ctx => {
    if (Math.random() > 0.8) {
      return new Result(null, 1, '用户名错误');
    } else {
      return user;
    }
  }
};
