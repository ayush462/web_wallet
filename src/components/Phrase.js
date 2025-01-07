import React, { useState } from 'react';
import "./Phrase.css";
import { Buffer } from 'buffer';
import toast from 'react-hot-toast';
import {FaCopy,FaEye,FaEyeSlash} from 'react-icons/fa'

if (!window.Buffer) {
    window.Buffer = Buffer;
}

function Phrase({ phrase }) {
    const [isBlurred, setIsBlurred] = useState(true);

    // Split the phrase into words
    const words = phrase.split(' ');

    // Handle copy to clipboard
    const copyToClipboard = () => {
        const phraseText = phrase;
        navigator.clipboard.writeText(phraseText).then(() => {
            toast.success("Copied to clipboard");
            
        }).catch((err) => {
            toast.error("Failed to copy")
        });
    };

    // Toggle blur effect on mnemonic text
    const toggleBlur = () => {
        setIsBlurred(!isBlurred);
    };

    return (

        <div>
        <div className="phrase-container">

            <div className="phrase-row" style={{ filter: isBlurred ? 'blur(5px)' : 'none' }}>
                {words.map((word, index) => (
                    <div className="word-card" key={index}>
                        <span className="word-number">{index + 1}</span>
                        <span className="word-text">{word}</span>
                    </div>
                ))}
            </div>

        </div>
        <div className='phrase-operation'>
            <button onClick={copyToClipboard}><FaCopy/></button>
            <button onClick={toggleBlur}>
                    {isBlurred ? <FaEye/> : <FaEyeSlash/>}
            </button>
        </div>
        </div>
    );
}

export default Phrase;
