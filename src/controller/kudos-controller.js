const kudoService = require('../service/kudo-service');

async function getLeaderboard(req, res) {
  const { offset, limit, orderBy, fromDate, toDate } = req.query;
  let kudoList = await kudoService.search(
    offset,
    limit,
    orderBy,
    fromDate,
    toDate,
  );

  res.json({
    data: kudoService.createLeaderBoard(kudoList),
  });
}

module.exports = {
  getLeaderboard,
};
