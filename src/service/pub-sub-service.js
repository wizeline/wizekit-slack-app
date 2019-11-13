const { name: originName } = require('../../package.json');
const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: process.env.GCP_PROJECT
});

const TOPIC_NAME = process.env.PUB_SUB_TOPIC || originName + '-topic';
const topic = pubsub.topic(TOPIC_NAME);

topic.get((err, topic, apiResponse) => {
  if(err){
    return topic.create((err, topic, apiResponse) => {
      if (!err) {
        console.log("Topic is created.");
      }
    });
  }
  console.log("Topic " + TOPIC_NAME + ' is existed.');
});

async function publishEvent(eventName, payload) {
  const dataBuffer = Buffer.from(JSON.stringify(payload));
  const customAttributes = {
    eventName,
    origin: originName
  };

  const messageId = await pubsub
    .topic(TOPIC_NAME)
    .publish(dataBuffer, customAttributes);

  console.info(`Message ${messageId} published.`);
}

module.exports = {
  publishEvent
};
