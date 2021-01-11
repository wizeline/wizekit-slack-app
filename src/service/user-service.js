const slackWebApi = require('../config/slack-api');
const StringUtil = require('../util/string-util');

async function getAll() {
  let next_cursor = 'inital';
  let members = [];
  while (next_cursor) {
    const usersResponse = await slackWebApi.users.list({
      limit: 1000,
      cursor: next_cursor === 'inital' ? undefined : next_cursor,
    });
    members = members.concat(extractMember(usersResponse.members));
    next_cursor = usersResponse.response_metadata.next_cursor;
  }
  return {
    members,
  };
}

function extractMember(members) {
  return members.filter(
    (member) => member.profile.email
    && member.profile.email.includes('wizeline.com'),
  ).map((member) => {
    const filtered = {};
    filtered.id = member.id;
    filtered.name = member.name;
    filtered.tz = member.tz;
    filtered.realName = member.profile.real_name;
    filtered.image = member.profile.image_192;
    return filtered;
  });
}

function extractUserList(text, excludedUser) {
  const matches = text.match(/<@\S+>/gm);
  const slackAccounts = matches && matches.length ? Array.from(new Set(matches)) : [];
  return slackAccounts.filter((ac) => ac && StringUtil.getUserName(ac) !== excludedUser);
}

function getUserNameList(slackUsers = []) {
  return slackUsers.reduce((list, slackUser) => {
    const username = StringUtil.getUserName(slackUser);
    if (username) {
      list.push(username);
    }
    return list;
  }, []);
}

module.exports = {
  search: getAll, extractUserList, getUserNameList,
};
