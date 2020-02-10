const { slackApi }  = require('../config/slack-api');

async function  search(limit = 0, include_locale = false, cursor ){
  const usersReponse =  await slackApi.users.list({
    limit,
    cursor,
    include_locale
  });

  let searchResult = {
    ... usersReponse
  };

  searchResult.members = usersReponse.members.filter(
    member =>
    member.profile.email
    && member.profile.email.includes('wizeline.com')
    && !member.deleted
  ).map(member => {
    let filtered = {};
    filtered.id = member.id;
    filtered.name = member.name;
    filtered.tz = member.tz;
    filtered.realName = member.profile.real_name;
    filtered.image = member.profile.image_192;
    return filtered;
  })

  return searchResult;
}

module.exports = {
  search
}
