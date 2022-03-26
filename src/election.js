import Pact from 'pact-lang-api';

const GAS_PRICE = 0.0000001;
const GAS_LIMIT = 400;
const TTL = 28000;
const NETWORK_ID = 'testnet04';
export const CHAIN_ID = '1';
const API_HOST = `https://api.testnet.chainweb.com/chainweb/0.0/${NETWORK_ID}/chain/${CHAIN_ID}/pact`;
const GAS_STATION='election-gas-station';

const creationTime = () => Math.round((new Date).getTime() / 1000) - 15;

export const getVotes = async (candidate) => {
  const cmd = {
    pactCode: `(free.election.getVotes "${candidate}")`,
    meta: {
      creationTime: creationTime(),
      ttl: TTL,
      gasLimit: GAS_LIMIT,
      chainId: CHAIN_ID,
      gasPrice: GAS_PRICE,
      sender: ''
    }
  };
  return Pact.fetch.local(cmd, API_HOST);
}

export const signTx = async (account, candidateId) => {
  const cmd = {
    networkId: NETWORK_ID,
    pactCode: `(free.election.vote "${account}" "${candidateId}")`,
    caps: [
      Pact.lang.mkCap("Gas payer", "Capability to allow gas payment by gas station", "free.election-gas-station.GAS_PAYER", ["", { int: 1 }, 1.0]),
      Pact.lang.mkCap("Account Owner", "Capability to validate KDA account ownership", "free.election.ACCOUNT-OWNER", [account])
    ],
    creationTime: creationTime(),
    ttl: TTL,
    gasLimit: GAS_LIMIT,
    chainId: CHAIN_ID,
    gasPrice: GAS_PRICE,
    sender: GAS_STATION,
  };
  return Pact.wallet.sign(cmd);
}

export const sendTx = async (signedCmd) => {
    const promise = Pact.wallet.sendSigned(signedCmd, API_HOST);
    return promise;
}

export const listenTx = async (requestKey) => {
    return Pact.fetch.listen({ listen: requestKey }, API_HOST);
}