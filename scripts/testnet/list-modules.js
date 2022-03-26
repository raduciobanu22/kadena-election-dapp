const Pact = require('pact-lang-api');
const fs = require('fs');

const NETWORK_ID = 'testnet04';
const CHAIN_ID = '0';
const API_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${NETWORK_ID}/chain/${CHAIN_ID}/pact`;
const KEY_PAIR = Pact.crypto.genKeyPair();

const creationTime = () => Math.round((new Date).getTime() / 1000) - 15;

listModules();

async function listModules() {
  const cmd = {
    keyPairs: KEY_PAIR,
    pactCode: Pact.lang.mkExp('list-modules'),
    meta: Pact.lang.mkMeta("", "", 0.0001, 6000, creationTime(), 600)
  };
  const response = await Pact.fetch.local(cmd, API_HOST);
  console.log(response.result.data);
};
