import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { getVotes } from './election';
import WalletModal from './WalletModal';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [votesA, setVotesA] = useState(0);
  const [votesB, setVotesB] = useState(0);
  const [votesC, setVotesC] = useState(0);
  const [voteFor, setVoteFor] = useState('');
  const [modalVisibility, setModalVisibility] = useState(false);

  const getAllVotes = () => {
    getVotes('1').then(response => {
      setVotesA(response.result.data)
    });

    getVotes('2').then(response => {
      setVotesB(response.result.data)
    });

    getVotes('3').then(response => {
      setVotesC(response.result.data)
    });
  }

  useEffect(() => {
    getAllVotes();
  }, []);

  return (
    <div className="App mt-5">
      <Container>
        <h2>Election Demo</h2>
        <Row className="mt-5">
          <Col className="text-center">
            <h5>Candidate A</h5>
            <p>Votes: {votesA}</p>
            <Button className="mt-2" onClick={() =>  { setVoteFor('1'); setModalVisibility(true)} }>Vote for A</Button>
          </Col>
          <Col className="text-center">
            <h5>Candidate B</h5>
            <p>Votes: {votesB}</p>
            <Button className="mt-2" onClick={() => { setVoteFor('2'); setModalVisibility(true)} }>Vote for B</Button>
          </Col>
          <Col className="text-center">
            <h5>Candidate C</h5>
            <p>Votes: {votesC}</p>
            <Button className="mt-2" onClick={() => { setVoteFor('3'); setModalVisibility(true)} }>Vote for C</Button>
          </Col>
        </Row>

        <WalletModal
          show={modalVisibility}
          hideModal={() => setModalVisibility(false)}
          candidate={voteFor}
          updateVotes={() => getAllVotes()}
        />
      </Container>
    </div>
  );
}

export default App;
