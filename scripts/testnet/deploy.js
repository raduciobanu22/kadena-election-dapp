const Pact = require('pact-lang-api');
const fs = require('fs');

const NETWORK_ID = 'testnet04';
const CHAIN_ID = '1';
const API_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${NETWORK_ID}/chain/${CHAIN_ID}/pact`;
const CONTRACT_PATH = './pact/election.pact';

const KEY_PAIR = {
  'publicKey': 'my-public-key',
  'secretKey': 'my-private-key'
}

const pactCode = fs.readFileSync(CONTRACT_PATH, 'utf8');
const creationTime = () => Math.round((new Date).getTime() / 1000) - 15;

deployContract(pactCode);

async function deployContract(pactCode) {
  const cmd = {
    networkId: NETWORK_ID,
    keyPairs: KEY_PAIR,
    pactCode: pactCode,
    envData: {
      'election-admin-keyset': [KEY_PAIR['publicKey']],
      'upgrade': true
    },
    meta: {
      creationTime: creationTime(),
      ttl: 28000,
      gasLimit: 65000,
      chainId: CHAIN_ID,
      gasPrice: 0.000001,
      sender: KEY_PAIR.publicKey
    }
  };
  const response = await Pact.fetch.send(cmd, API_HOST);
  console.log(response);
  const txResult = await Pact.fetch.listen({ listen: response.requestKeys[0] }, API_HOST);
  console.log(txResult);
};
