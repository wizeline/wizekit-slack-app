const kudoService = require('../service/kudo-service');

async function getLeaderBoard(req, res) {
  const {
    offset, limit, orderBy, fromDate, toDate,
  } = req.query;
  const kudoList = await kudoService.search(
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
  getLeaderBoard,
};
