import { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, Form } from 'react-bootstrap';
import { signTx, sendTx, listenTx, CHAIN_ID } from './election';

function WalletModal({updateVotes, hideModal, ...props}) {
    const [account, setAccount] = useState('');
    const [signTxButtonDisabled, setSignTxButtonDisabled] = useState(false);
    const [sendTxButtonVisible, setSendTxButtonVisible] = useState(false);
    const [signedCmd, setSignedCmd] = useState('');

    const handleSignTxClick = async (account, candidateId) => {
      setSignTxButtonDisabled(true);
      const cmd = await signTx(account, candidateId);
      if (!cmd) {
        setSignTxButtonDisabled(false);
        setSendTxButtonVisible(false);
        return;
      }
      setSendTxButtonVisible(true);
      setSignedCmd(cmd);
    }

    const handleSendTxClick = async () => {
      hideModal();
      reset();

      const response = await sendTx(signedCmd);
      const tx = await toast.promise(
        listenTx(response.requestKeys[0]),
        {
          pending: {
            render({data}) {
              return <p style={{lineBreak: 'anywhere'}}>Waiting for transaction to be mined: {response.requestKeys[0]}</p>
            }
          },
          success: 'Transaction mined! ⛓🕸',
          error: 'Request error!'
        }
      );

      if (tx.result.status === "failure") {
        toast.error(`Transaction error: ${tx.result.error.message}`)
      }

      if (tx.result.status === "success") {
        toast.success(`Transaction result: ${tx.result.data}`);
      }

      updateVotes();
    }

    const reset = () => {
      setAccount('');
      setSignTxButtonDisabled(false);
      setSendTxButtonVisible(false);
      setSignedCmd('');
    }

    return (
      <Modal {...props} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Connect to a wallet (Chain {CHAIN_ID})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are voting for {props.candidate}</p>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>KDA Account</Form.Label>
              <Form.Control type="text" placeholder="Enter account" onChange={(event) => setAccount(event.target.value)} />
              <Form.Text className="text-muted">
                Make sure this is an account you have access to in Chainweaver
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {reset(); hideModal(); }}>
            Cancel
          </Button>
          {!sendTxButtonVisible
           && <Button variant="primary" disabled={signTxButtonDisabled} onClick={() => handleSignTxClick(account, props.candidate)}>
                Sign Transaction (Chainweaver)
              </Button>
          }
          {sendTxButtonVisible
           && <Button variant="primary" onClick={() => handleSendTxClick(signedCmd)}>
                Send Transaction
              </Button>
          }
        </Modal.Footer>
      </Modal>
    )
  }

export default WalletModal;