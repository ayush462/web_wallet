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
import { FaEye, FaEyeSlash, FaRegUserCircle, FaCopy, FaTrash } from 'react-icons/fa';
import { CiWallet } from 'react-icons/ci';
import { SiSolana } from 'react-icons/si';
import axios from 'axios';

if (!window.Buffer) {
  window.Buffer = Buffer;
}

function App() {
  const [mnemonic, setMnemonic] = useState('');
  const [solanaKeys, setSolanaKeys] = useState([]);
  const [keyIndex, setKeyIndex] = useState(0);
  const [visibleKeyIndex, setVisibleKeyIndex] = useState(null); // Track which key's visibility is toggled
  const [balances, setBalances] = useState([]); // Store balance for each account separately
  const [loadingStates, setLoadingStates] = useState([]); // Store loading state for each account separately

  const ALCHEMY_API_KEY = 'EX3OL0QRMrMcpyvMCdxd1lKVTxtJNb6u'; // Replace with your Alchemy API key
  const SOLANA_RPC_URL = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;  // You can use Alchemy RPC URL if available

  useEffect(() => {
    const storedMnemonic = localStorage.getItem('mnemonicPhrase');
    const storedKeys = localStorage.getItem('solanaKeys');
    const storedBalances = localStorage.getItem('balances'); // Fetch balances from localStorage

    if (storedMnemonic) {
      setMnemonic(storedMnemonic);
    }
    if (storedKeys) {
      setSolanaKeys(JSON.parse(storedKeys));
    }
    if (storedBalances) {
      setBalances(JSON.parse(storedBalances)); // Set balances if available
    }
  }, []);

  useEffect(() => {
    if (mnemonic) {
      localStorage.setItem('mnemonicPhrase', mnemonic);
    }
    if (solanaKeys.length > 0) {
      localStorage.setItem('solanaKeys', JSON.stringify(solanaKeys));
    }
    if (balances.length > 0) {
      localStorage.setItem('balances', JSON.stringify(balances)); // Save balances to localStorage
    }
  }, [mnemonic, solanaKeys, balances]); // Update localStorage whenever balances change

  function generateSolanaKeys(mnemonic, index) {
    const seed = mnemonicToSeedSync(mnemonic); // Generate seed from mnemonic
    const path = `m/44'/501'/${index}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    // Use Solana's Keypair.fromSeed to derive keys
    const keypair = Keypair.fromSeed(derivedSeed);

    const publicKey = keypair.publicKey.toBase58();
    const privateKey = Buffer.from(keypair.secretKey).toString('hex');

    setSolanaKeys((prevKeys) => [...prevKeys, { publicKey, privateKey }]);
    setBalances((prevBalances) => [...prevBalances, null]); // Initialize balance as null for the new account
    setLoadingStates((prevLoadingStates) => [...prevLoadingStates, false]); // Initialize loading state as false
  }

  function generatePhraseHandler() {
    const generatedMnemonic = generateMnemonic();
    setMnemonic(generatedMnemonic);
    setSolanaKeys([]);
    setKeyIndex(0);
    setBalances([]); // Clear balances when generating new phrase
    setLoadingStates([]); // Clear loading states
    toast.success("Random phrase generated");
  }

  function createNewKeyPair() {
    const newIndex = keyIndex + 1; // Increment index first
    setKeyIndex(newIndex);        // Update the key index
    generateSolanaKeys(mnemonic, newIndex); // Use the incremented index
    toast.success("New wallet created successfully");
  }


  function deleteKeyPair(index) {
    const updatedKeys = solanaKeys.filter((key, keyIndex) => keyIndex !== index);
    setSolanaKeys(updatedKeys);
    setBalances(updatedKeys.map(() => null)); // Remove the balance for the deleted account
    setLoadingStates(updatedKeys.map(() => false)); // Reset the loading state for the deleted account
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

  // Fetch the balance of the Solana wallet
  async function fetchBalance(publicKey, index) {
    const updatedLoadingStates = [...loadingStates];
    updatedLoadingStates[index] = true; // Set loading state to true for the selected index
    setLoadingStates(updatedLoadingStates);

    try {
      const response = await axios.post(SOLANA_RPC_URL, {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [publicKey]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }

      });


      if (response.data.result) {
        const lamports = response.data.result.value;
        const sol = lamports / 1e9; // Convert lamports to SOL
        const updatedBalances = [...balances];
        updatedBalances[index] = sol; // Store the balance for the selected account
        setBalances(updatedBalances);
        toast.success("Balance fetched successfully")
      } else {
        toast.error('Error fetching balance');
      }
    } catch (error) {
      toast.error('Error fetching balance');
    } finally {
      updatedLoadingStates[index] = false; // Set loading state to false after fetching
      setLoadingStates(updatedLoadingStates);
    }
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

                  }}
                >
                  <FaRegUserCircle style={{ fontSize: "1.5rem" }} />
                  Account {index + 1}
                </h2>

                {balances[index] !== null && (
                  <div className="balance-container" style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: "1.5rem", fontWeight: "bold" }}></strong>

                    <div
                      style={{
                        fontSize: "2rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginTop: '-10px',
                        display: 'inline-flex',  // Ensures the icon and text stay in the same line
                        alignItems: 'center',    // Vertically centers the icon and text
                      }}
                    >
                      <SiSolana color='#03E1FF' style={{ marginRight: '8px' }} /> {/* Margin between icon and text */}
                      {balances[index]} SOL
                    </div>
                  </div>
                )}


                <strong>Public Key:</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={key.publicKey}
                    readOnly
                    style={{ width: '100%', padding: '5px', fontSize: '1rem', borderRadius: '5px', border: 'none' }}
                  />
                  <FaCopy
                    onClick={() => copyToClipboard(key.publicKey)}
                    style={{ cursor: 'pointer' }}
                    title="Copy Public Key"
                  />
                </div>
                <button className='balance-button' onClick={() => fetchBalance(key.publicKey, index)}>
                  {loadingStates[index] ? 'Loading...' : 'Get Balance'}
                </button>
              </div>
              <div>
                <strong>Private Key:</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="text"
                    value={visibleKeyIndex === index ? key.privateKey : '•••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                    readOnly
                    style={{ width: '100%', padding: '5px', fontSize: '1rem', borderRadius: '5px', border: 'none' }}
                  />
                  {visibleKeyIndex === index ? (
                    <FaEyeSlash
                      onClick={() => toggleVisibility(index)}
                      style={{ cursor: 'pointer' }}
                      title="Hide Private Key"
                    />
                  ) : (
                    <FaEye
                      onClick={() => toggleVisibility(index)}
                      style={{ cursor: 'pointer' }}
                      title="Show Private Key"
                    />
                  )}
                  <FaCopy
                    onClick={() => copyToClipboard(key.privateKey)}
                    style={{ cursor: 'pointer' }}
                    title="Copy Private Key"
                  />
                </div>
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
