import Navbar from './components/Navbar.js';
import './App.css';
import { useState, useEffect } from 'react';
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import { Buffer } from 'buffer';
import { Toaster } from "react-hot-toast";
import toast from 'react-hot-toast';
import Phrase from './components/Phrase.js';
import nacl from "tweetnacl";
import { FaEye, FaEyeSlash, FaRegUserCircle, FaCopy, FaTrash } from 'react-icons/fa';
import { CiWallet } from 'react-icons/ci';


if (!window.Buffer) {
  window.Buffer = Buffer;
}

function App() {
  const [mnemonic, setMnemonic] = useState('');
  const [solanaKeys, setSolanaKeys] = useState([]);
  const [keyIndex, setKeyIndex] = useState(0);
  const [visibleKeyIndex, setVisibleKeyIndex] = useState(null); // Track which key's visibility is toggled

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('mnemonicPhrase');
    const storedKeys = localStorage.getItem('solanaKeys');
    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
    if (storedKeys) {
      setSolanaKeys(JSON.parse(storedKeys));
    }
  }, []);

  useEffect(() => {
    if (mnemonic) {
      localStorage.setItem('mnemonicPhrase', mnemonic);
    }
    if (solanaKeys.length > 0) {
      localStorage.setItem('solanaKeys', JSON.stringify(solanaKeys));
    }
  }, [mnemonic, solanaKeys]);

  function generateSolanaKeys(mnemonic, index) {
    const seed = mnemonicToSeedSync(mnemonic);
    const path = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
    const publicKey = Keypair.fromSecretKey(keypair.secretKey).publicKey.toBase58();
    const privateKey = Buffer.from(keypair.secretKey).toString('hex');

    setSolanaKeys((prevKeys) => [...prevKeys, { publicKey, privateKey }]);
  }

  function generatePhraseHandler() {
    const generatedMnemonic = generateMnemonic();
    setMnemonic(generatedMnemonic);
    setSolanaKeys([]);
    setKeyIndex(0);
    toast.success("Random phrase generated");
  }

  function createNewKeyPair() {
    setKeyIndex((prevIndex) => prevIndex + 1);
    generateSolanaKeys(mnemonic, keyIndex);
    toast.success("New wallet created successfully");
  }

  function deleteKeyPair(index) {
    const updatedKeys = solanaKeys.filter((key, keyIndex) => keyIndex !== index);
    setSolanaKeys(updatedKeys);
    toast.success("Wallet deleted successfully");
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  }

  function toggleVisibility(index) {
    setVisibleKeyIndex(visibleKeyIndex === index ? null : index); // Toggle visibility for the clicked index
  }

  return (
    <div className="app">
      
      <Navbar />

      <div className="heading" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
        <CiWallet style={{ fontSize: "2rem" }} />
        <h1 style={{ fontSize: "2rem", margin: "0" }}>WALLET</h1>
      </div>

      <div className='subheading'>
        <h2>Generate your phrase</h2>
        <button onClick={generatePhraseHandler}>Generate</button>
      </div>

      <Phrase phrase={mnemonic} />

      <div className='subheading'>
        <h2>Create your Wallet</h2>
        <button onClick={createNewKeyPair}>Create</button>
      </div>

      {solanaKeys.length > 0 && (
        <div className="solana-keys">
          <h2>Your Solana Wallet Keys</h2>
          {solanaKeys.map((key, index) => (
            <div key={index} className="key-container">
              <div>
                <h2
                  className="account"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "1.5rem",
                    margin: "10px 0",
                    justifyContent: "center"
                  }}
                >
                  <FaRegUserCircle style={{ fontSize: "1.5rem" }} />
                  Account {index + 1}
                </h2>
                <strong>Public Key :</strong>
                <span>{key.publicKey}
                  <FaCopy
                    onClick={() => copyToClipboard(key.publicKey)}
                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                    title="Copy Public Key"
                  />
                </span>
              </div>
              <div>
                <strong>Private Key :</strong>
                <span>
                  {visibleKeyIndex === index ? key.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                  {visibleKeyIndex === index ? (
                    <FaEyeSlash
                      onClick={() => toggleVisibility(index)}
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      title="Hide Private Key"
                    />
                  ) : (
                    <FaEye
                      onClick={() => toggleVisibility(index)}
                      style={{ marginLeft: '10px', cursor: 'pointer' }}
                      title="Show Private Key"
                    />
                  )}
                  <FaCopy
                    onClick={() => copyToClipboard(key.privateKey)}
                    style={{ marginLeft: '10px', cursor: 'pointer' }}
                    title="Copy Private Key"
                  />
                </span>
              </div>
              <button className="delete-button" onClick={() => deleteKeyPair(index)}>
                <FaTrash />
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <Toaster />
      
    </div>
  );
}

export default App;
