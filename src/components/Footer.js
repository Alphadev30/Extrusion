import React from 'react';

const Footer = () => {
  const footerStyles = {
    backgroundColor: '#f8f9fa',
    padding: '0px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
  };

  const linkStyles = {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  return (
    <div style={footerStyles}>
      <p>Made by Alphadev with love.</p>
      <a
        href="https://github.com/Alphadev30"
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyles}
      >
        Visit GitHub
      </a>
    </div>
  );
};

export default Footer;
