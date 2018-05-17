const { Result } = require('../../index');

module.exports = {
  'GET /api/user/:id': ctx => ({
    id: ctx.req.params.id,
    name: 'hypo'
  }),
};
