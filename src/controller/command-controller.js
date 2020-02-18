const commandService = require('../service/command-service');

async function search(req, res) {
  const {
    offset, limit, orderBy, fromDate, toDate,
  } = req.query;

  const commands = await commandService.search(
    offset,
    limit,
    orderBy,
    fromDate,
    toDate,
  );

  res.json({
    data: commands,
  });
}

module.exports = {
  search,
};
