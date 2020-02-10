const userService = require('../service/user-service');

async function search(req, res) {
  const { cursor, limit, include_locale } = req.query;
  const usersResponse = await userService.search(
    limit,
    include_locale,
    cursor
  );
  res.json({
    data: usersResponse,
  });
}

module.exports = {
  search,
};
