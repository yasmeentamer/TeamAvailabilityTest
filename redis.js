

const redis = require('redis');

// Connect to Redis
const client = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(console.error);

// Test saving and getting data
async function testRedis() {
  await client.set('myKey', 'Hello Redis!');
  const value = await client.get('myKey');
  console.log('Value from Redis:', value);
}

testRedis();
