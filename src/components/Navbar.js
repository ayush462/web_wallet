import React from 'react';
import './Navbar.css';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

function Navbar() {
  return (
    <div className='nav'>
      <nav className='navbar'>
        <ul>
          <li>Walletify</li>
          <li>
            <a
              href="https://www.linkedin.com/in/ayush-kumar-1697b5289/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedin size="30px" color='white' />
            </a>
            <a
              href="https://github.com/ayush462"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size="30px" color='white'/>
            </a>
            </li>
          
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
