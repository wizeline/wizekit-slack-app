const kudoService = require('../service/kudo-service');
const commandService = require('../service/command-service');
const { datastore } = require('../config/datastore');

async function search(req, res) {
  const kudoList = await kudoService.search(req);
  const commandIDs = kudoList && kudoList.length ? Array.from(new Set(kudoList.map(k => k.commandId))) : [];
  const commands = await commandService.findByIds(commandIDs);
  res.json({
    data: kudoList.map(k => {
      k.text = commands.find(c => c[datastore.KEY].id === k.commandId );
      return k;
    }),
  });
}

module.exports = {
  search,
};
