import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Pact from 'pact-lang-api';
import { Container, Row, Col, Button } from 'react-bootstrap';

// const NETWORK_ID = 'testnet04';
// const CHAIN_ID = '1';
const API_HOST = `http://localhost:8080`;

const getVotes = (candidate) => {
  const cmd = {
    pactCode: `(simple-vote.getVotes "${candidate}")`
  };
  return Pact.fetch.local(cmd, API_HOST);
}

const submitVote = async () => {

}

function App() {
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);

  useEffect(() => {
    getVotes('A').then(response => {
      setVotesA(response.result.data)
    })

    getVotes('B').then(response => {
      setVotesB(response.result.data)
    })
  }, []);

  return (
    <div className="App mt-5">
      <Container>
        <h2>Election Demo</h2>
        <Row>
          <Col className="text-center">
            <h5>Candidate A</h5>
            <p>Votes: {votesA}</p>
            <Button className="mt-2">Vote</Button>
          </Col>
          <Col className="text-center">
            <h5>Candidate B</h5>
            <p>Votes: {votesB}</p>
            <Button className="mt-2">Vote</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
