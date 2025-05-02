import React from 'react';
import { createRoot } from 'react-dom/client';
import NoMockApp from './no-mock-app';
import CreateNFT from './create-nft';
import './index.css';

// Determine which component to render based on path
const isCreateNFTPath = window.location.pathname.includes('/create-nft');

const root = createRoot(document.getElementById('root')!);
root.render(
  <>
    {isCreateNFTPath ? <CreateNFT /> : <NoMockApp />}
  </>
);
