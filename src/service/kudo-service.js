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
  limit = 1000,
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
  const giverCount = {};
  const receiverCount = {};

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
      if (giverCount[username] === undefined) {
        giverCount[username] = kudos.length;
      } else {
        giverCount[username] += kudos.length;
      }
      kudos.forEach(kudo => {
        if (receiverCount[kudo.receiver] === undefined) {
          receiverCount[kudo.receiver] = 1;
        } else {
          receiverCount[kudo.receiver] += 1;
        }
      });
    });
  });

  return {
    kudos: kudoList,
    summary: {
      giverCount,
      receiverCount,
    },
  };
}

function createKudoList(users, commandEntity) {
  const { user_name, createdAt } = commandEntity.data;
  const { id } = commandEntity.key;
  return users.map(u => ({
    giver: user_name,
    receiver: u,
    commandId: id,
    commandCreatedDate: createdAt,
  }));
}

function getUserList(text, currentUser) {
  const matches = text.match(/<@\S+>/gm);
  const slackAccounts =
    matches && matches.length ? Array.from(new Set(matches)) : [];
  return slackAccounts
    .map(ac => {
      const user = ac.match(/^<\S+\|(.+)>$/i)[1];
      return user ? user : ac.match(/@\S+/i)[1];
    })
    .filter(ac => ac && ac !== currentUser);
}

module.exports = {
  save,
  search,
  createLeaderBoard,
  createKudoList,
  getUserList
};
