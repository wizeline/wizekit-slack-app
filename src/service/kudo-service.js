const { datastore } = require('../config/datastore');
const { getToDate } = require('../util/date-util');
const KUDOS_KIND = 'KUDOS';
const MAX_GIVE_PER_DAY = 10;
/**
 * List of Kudos objects.
 * @param {Array} kudos
 */
async function save(kudos) {
  if (kudos.length === 0) {
    return [];
  }
  const currentTimestamp = new Date().toJSON();
  const entities = kudos.map(kudo => {
    const key = datastore.key([KUDOS_KIND]);
    return {
      key,
      data: {
        ...kudo,
        createdAt: currentTimestamp,
      },
    };
  });

  const response = await datastore.save(entities);
  return response[0];
}

async function search(
  offset = 0,
  limit = 100,
  orderBy = 'commandCreatedDate',
  fromDate = '1999-01-01',
  toDate,
) {
  const rToDate = getToDate(toDate);
  const query = datastore
    .createQuery(KUDOS_KIND)
    .filter('commandCreatedDate', '<', rToDate)
    .filter('commandCreatedDate', '>', fromDate)
    .limit(limit)
    .order(orderBy, {
      descending: true,
    })
    .offset(offset);
  const response = await datastore.runQuery(query);
  return response[0];
}

function createLeaderBoard(kudoList) {
  const kudoByDate = kudoList.reduce((a, kudo) => {
    const dateKey = kudo.commandCreatedDate.split('T')[0];
    if (a[dateKey]) {
      a[dateKey].push(kudo);
    } else {
      a[dateKey] = [kudo];
    }
    return a;
  }, {});

  const kudoGiverByDate = {};
  const giverCounter = {};
  const receiverCounter = {};

  Object.keys(kudoByDate).map(key => {
    kudoGiverByDate[key] = {};
    kudoGiverByDate[key].givers = kudoByDate[key].reduce((a, kudo) => {
      const { giver } = kudo;
      if (a[giver] && a[giver].length < MAX_GIVE_PER_DAY) {
        a[giver].push(kudo);
      } else if (!a[giver]) {
        a[giver] = [kudo];
      }
      return a;
    }, {});

    Object.keys(kudoGiverByDate[key].givers).forEach(username => {
      const kudos = kudoGiverByDate[key].givers[username];
      if (giverCounter[username] === undefined) {
        giverCounter[username] = kudos.length;
      } else {
        giverCounter[username] += kudos.length;
      }
      kudos.forEach(kudo => {
        if (receiverCounter[kudo.receiver] === undefined) {
          receiverCounter[kudo.receiver] = 1;
        } else {
          receiverCounter[kudo.receiver] += 1;
        }
      });
    });
  });

  return {
    kudos: kudoList,
    summary: {
      giverCounter,
      receiverCounter,
    },
  };
}

module.exports = {
  save,
  search,
  createLeaderBoard,
};
