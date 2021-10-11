const pollServiceDb = require('../service/poll-service-db');

async function search(req, res) {
  const {
    offset, limit,
  } = req.query;

  const commands = await pollServiceDb.search(
    offset,
    limit,
  );

  res.json({
    data: commands,
  });
}

module.exports = {
  search,
};
