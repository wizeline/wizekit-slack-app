const { slackApi }  = require('../config/slack-api');

async function  getAll(){
  let next_cursor = 'inital';
  let members = [];
  while( next_cursor ){
    let usersReponse =  await slackApi.users.list({
      limit: 1000,
      cursor: next_cursor == 'inital' ? undefined : next_cursor
    });
    members = members.concat(extractMember(usersReponse.members));
    next_cursor = usersReponse.response_metadata.next_cursor;
  }
  return {
    members
  };
}

function extractMember(members){
  return members.filter(
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
  });
}

module.exports = {
  search:getAll
}
