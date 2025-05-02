import React, { useState, useRef, useEffect } from 'react';
import * as web3 from '@solana/web3.js';
import * as mplTokenMetadata from '@metaplex-foundation/mpl-token-metadata';
import * as metaplexJs from '@metaplex-foundation/js';
import { Metaplex } from '@metaplex-foundation/js';

interface Attribute {
  trait_type: string;
  value: string;
}

// Wallet provider interface for better wallet compatibility
interface WalletProvider {
  isPhantom?: boolean;
  isSolflare?: boolean;
  connect: (options?: any) => Promise<any>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (transaction: web3.Transaction) => Promise<{ signature: string }>;
  signTransaction: (transaction: web3.Transaction) => Promise<web3.Transaction>;
  publicKey?: web3.PublicKey;
  isConnected: boolean;
}

// Add CSS styles at the top of the component
const styles = {
  container: {
    backgroundColor: '#121212', 
    minHeight: '100vh', 
    color: 'white',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column'
  },
  walletButton: {
    width: '180px',
    padding: '8px 10px',
    fontSize: '12px',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center'
  }
};

export default function CreateNFT() {
  // State for form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [collection, setCollection] = useState('');
  const [royalty, setRoyalty] = useState(5);
  const [attributes, setAttributes] = useState<Attribute[]>([{ trait_type: '', value: '' }]);
  
  // State for image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for minting process
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStatus, setMintingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionLink, setTransactionLink] = useState<string | null>(null);
  const [mintedNftLink, setMintedNftLink] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string>('phantom');
  const [walletProviders, setWalletProviders] = useState<WalletProvider[]>([]);
  const [network, setNetwork] = useState<string>('devnet');
  
  // Add watchlist state
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // Solana connection
  const connection = new web3.Connection(
    network === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com',
    'confirmed'
  );
  
  // Check for available wallets on component mount
  useEffect(() => {
    detectWallets();
    checkWalletConnection();
  }, []);

  // Detect available wallet providers
  const detectWallets = () => {
    const providers: WalletProvider[] = [];
    const windowObj = window as any;
    
    // Check for Phantom
    if (windowObj.solana && windowObj.solana.isPhantom) {
      providers.push(windowObj.solana);
      setDebugInfo('Phantom wallet detected');
    }
    
    // Check for Solflare
    if (windowObj.solflare && windowObj.solflare.isSolflare) {
      providers.push(windowObj.solflare);
      setDebugInfo(prev => prev + '\nSolflare wallet detected');
    }
    
    setWalletProviders(providers);
    if (providers.length === 0) {
      setDebugInfo('No compatible wallets detected. Please install Phantom or Solflare wallet.');
    }
  };

  // Get current wallet provider based on selection
  const getCurrentWalletProvider = (): WalletProvider | null => {
    const windowObj = window as any;
    
    if (selectedWallet === 'phantom' && windowObj.solana) {
      return windowObj.solana;
    } else if (selectedWallet === 'solflare' && windowObj.solflare) {
      return windowObj.solflare;
    }
    
    return null;
  };

  // Debug function to log wallet information
  const debugWallet = () => {
    const walletProvider = getCurrentWalletProvider();
    
    if (!walletProvider) {
      setDebugInfo(`${selectedWallet} wallet extension not detected - please install it`);
      return;
    }

    try {
      setDebugInfo(`${selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)} detected: isConnected=${walletProvider.isConnected}, publicKey=${walletProvider.publicKey?.toString() || 'not connected'}, network=${network}`);
    } catch (error) {
      setDebugInfo(`Error checking wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Function to check if wallet is connected
  const checkWalletConnection = async () => {
    try {
      const walletProvider = getCurrentWalletProvider();
      
      if (walletProvider) {
        if (walletProvider.isConnected) {
          setIsWalletConnected(true);
          setWalletAddress(walletProvider.publicKey?.toString() || '');
          setDebugInfo(`Wallet connected: ${walletProvider.publicKey?.toString()}`);
        } else {
          setIsWalletConnected(false);
          setDebugInfo(`Wallet not connected`);
        }
      } else {
        setDebugInfo(`${selectedWallet} wallet not detected`);
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setDebugInfo(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Function to connect wallet
  const connectWallet = async () => {
    try {
      const walletProvider = getCurrentWalletProvider();
      
      if (walletProvider) {
        try {
          setDebugInfo(`Attempting to connect ${selectedWallet} wallet...`);
          // Force a popup by not using onlyIfTrusted
          const response = await walletProvider.connect();
          setIsWalletConnected(true);
          setWalletAddress(response.publicKey.toString());
          setDebugInfo(`Wallet connected: ${response.publicKey.toString()}`);
        } catch (error) {
          console.error('Error connecting to wallet:', error);
          setDebugInfo(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
          alert(`Failed to connect to ${selectedWallet} wallet. Please try again.`);
        }
      } else {
        setDebugInfo(`${selectedWallet} wallet not found! Please install the extension`);
        if (selectedWallet === 'phantom') {
          window.open('https://phantom.app/', '_blank');
        } else if (selectedWallet === 'solflare') {
          window.open('https://solflare.com/', '_blank');
        }
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setDebugInfo(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Change wallet provider
  const changeWalletProvider = (wallet: string) => {
    setSelectedWallet(wallet);
    setIsWalletConnected(false);
    setWalletAddress('');
    setDebugInfo(`Switched to ${wallet} wallet`);
  };

  // Change network
  const changeNetwork = (net: string) => {
    setNetwork(net);
    setDebugInfo(`Switched to ${net}`);
  };
  
  // Function to handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };
  
  // Function to handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageFile(files[0]);
    }
  };
  
  // Function to process the selected image file
  const handleImageFile = (file: File) => {
    if (!file.type.match('image.*')) {
      alert('Please select an image file.');
      return;
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        setImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Function to add a new attribute field
  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };
  
  // Function to update an attribute
  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };
  
  // Function to remove an attribute
  const removeAttribute = (index: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes.splice(index, 1);
    setAttributes(updatedAttributes);
  };
  
  // Function to create NFT using Metaplex
  const createNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !description || !imageFile) {
      alert('Please fill in all required fields and upload an image.');
      return;
    }
    
    // Check wallet connection
    if (!isWalletConnected) {
      alert('Please connect your wallet to create an NFT.');
      return;
    }
    
    const walletProvider = getCurrentWalletProvider();
    if (!walletProvider) {
      alert(`${selectedWallet} wallet not found! Please install the extension.`);
      return;
    }
    
    // Clear previous transaction links
    setTransactionLink(null);
    setMintedNftLink(null);
    setDebugInfo('');
    
    // Start minting process
    setIsMinting(true);
    
    try {
      // Step 1: Upload image
      setMintingStatus('Uploading image...');
      setProgress(10);
      setDebugInfo('Uploading image...');
      
      // In a real implementation, we would upload to Arweave here
      // For this demo, we'll use a placeholder image URL
      const imageUrl = 'https://arweave.net/yNxQnKJCo1q4Y4M0R7XIyf3XG3AP_bKKxZWP_MTn_Fc';
      await simulateStep(500);
      
      // Step 2: Create metadata
      setMintingStatus('Creating NFT metadata...');
      setProgress(30);
      
      // Filter out empty attributes
      const validAttributes = attributes.filter(attr => 
        attr.trait_type.trim() !== '' && attr.value.trim() !== ''
      );
      
      // Step 3: Creating the NFT using Metaplex
      setMintingStatus('Creating NFT on Solana blockchain...');
      setProgress(50);
      setDebugInfo('Creating Metaplex connection...');
      
      try {
        // Alert user about transaction
        alert(`Please check your ${selectedWallet} wallet for the transaction approval popup!`);
        setDebugInfo(`⚠️ SENDING TRANSACTION TO ${selectedWallet.toUpperCase()} - CHECK YOUR WALLET FOR A POPUP! ⚠️`);
        
        // Create a connection to the Solana cluster
        const endpoint = network === 'devnet' 
          ? 'https://api.devnet.solana.com' 
          : 'https://api.mainnet-beta.solana.com';
        
        const connection = new web3.Connection(endpoint, 'confirmed');
        
        // Create a wallet adapter for Metaplex
        const walletAdapter = {
          publicKey: new web3.PublicKey(walletAddress),
          signTransaction: async (transaction: web3.Transaction) => {
            return await walletProvider.signTransaction(transaction);
          },
          signAllTransactions: async (transactions: web3.Transaction[]) => {
            const signed: web3.Transaction[] = [];
            for (const tx of transactions) {
              signed.push(await walletProvider.signTransaction(tx));
            }
            return signed;
          },
          signMessage: async (message: Uint8Array) => {
            throw new Error("Method not implemented.");
          },
        };
        
        // Initialize Metaplex
        const metaplex = Metaplex.make(connection)
          .use(metaplexJs.keypairIdentity(web3.Keypair.generate())) // Temporary keypair for initialization
          .use(metaplexJs.walletAdapterIdentity(walletAdapter)); // Use our wallet adapter
        
        setDebugInfo(prev => prev + '\nMetaplex initialized, preparing NFT...');
        
        // Prepare NFT metadata
        const { uri } = await metaplex.nfts().uploadMetadata({
          name: name,
          description: description,
          image: imageUrl,
          attributes: validAttributes.map(attr => ({
            trait_type: attr.trait_type,
            value: attr.value
          })),
          collection: collection ? { name: collection } : undefined,
          properties: {
            files: [
              {
                uri: imageUrl,
                type: "image/png"
              }
            ]
          },
          seller_fee_basis_points: royalty * 100, // Convert percentage to basis points
        });
        
        setDebugInfo(prev => prev + '\nMetadata uploaded, creating NFT...');
        setProgress(60);
        
        // Create the NFT
        const { nft, response } = await metaplex.nfts().create({
          uri: uri,
          name: name,
          sellerFeeBasisPoints: royalty * 100,
          maxSupply: 1, // Specify it's a unique NFT
        });
        
        console.log('NFT created!', nft);
        setDebugInfo(prev => prev + `\nNFT created successfully with signature: ${response.signature}`);
        
        // Create transaction link
        const explorerLink = `https://explorer.solana.com/tx/${response.signature}?cluster=${network}`;
        setTransactionLink(explorerLink);
        
        // Create NFT link
        const nftExplorerLink = `https://explorer.solana.com/address/${nft.address.toString()}?cluster=${network}`;
        setMintedNftLink(nftExplorerLink);
        
        // Update status
        setMintingStatus('NFT created successfully! 🎉');
        setProgress(100);
        
      } catch (walletError) {
        console.error('Wallet transaction error:', walletError);
        setDebugInfo(`⚠️ WALLET ERROR: ${walletError instanceof Error ? walletError.message : 'Unknown wallet error'}`);
        throw new Error(`Wallet transaction failed: ${walletError instanceof Error ? walletError.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert(`Error creating NFT: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsMinting(false);
      setProgress(0);
      return;
    }
  };
  
  // Function to simulate an async operation
  const simulateStep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  // Function to reset the form
  const resetForm = () => {
    setName('');
    setDescription('');
    setCollection('');
    setRoyalty(5);
    setAttributes([{ trait_type: '', value: '' }]);
    setImageFile(null);
    setImagePreview(null);
    setProgress(0);
    setMintingStatus('');
    setTransactionLink(null);
    setMintedNftLink(null);
    setDebugInfo('');
  };
  
  // Shortened address display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // Function to go back to home
  const goToHome = () => {
    window.location.href = '/';
  };
  
  // Function to toggle watchlist
  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    
    // You would typically save this to localStorage or a database
    if (!isInWatchlist) {
      setDebugInfo(prev => prev + '\nAdded to watchlist!');
      // Store in localStorage as example
      if (mintedNftLink) {
        const watchlist = JSON.parse(localStorage.getItem('nftWatchlist') || '[]');
        watchlist.push({
          name: name,
          link: mintedNftLink,
          date: new Date().toISOString()
        });
        localStorage.setItem('nftWatchlist', JSON.stringify(watchlist));
      }
    } else {
      setDebugInfo(prev => prev + '\nRemoved from watchlist');
      // Remove from localStorage
      if (mintedNftLink) {
        const watchlist = JSON.parse(localStorage.getItem('nftWatchlist') || '[]');
        const updatedWatchlist = watchlist.filter((item: any) => item.link !== mintedNftLink);
        localStorage.setItem('nftWatchlist', JSON.stringify(updatedWatchlist));
      }
    }
  };
  
  return (
    <div style={styles.container}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'center',
        padding: '20px', 
        borderBottom: '1px solid #333',
        alignItems: 'center',
        flexWrap: 'wrap',
        flexDirection: 'column',
        gap: '15px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '24px',
          cursor: 'pointer',
          background: 'linear-gradient(to right, #9945FF, #14F195)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          border: '1px solid #333'
        }}
        onClick={() => window.history.back()}
        >
          ←
        </div>
        
        <div 
          style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            background: 'linear-gradient(to right, #9945FF, #14F195)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'center'
          }}
          onClick={() => window.location.href = '/'}
        >
          HypeFlow
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, auto)',
            gap: '10px',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}>
            <select 
              value={network}
              onChange={(e) => changeNetwork(e.target.value)}
              style={{
                backgroundColor: '#333',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                minWidth: '100px',
              }}
            >
              <option value="devnet">Devnet</option>
              <option value="mainnet-beta">Mainnet</option>
            </select>
            
            <select 
              value={selectedWallet}
              onChange={(e) => changeWalletProvider(e.target.value)}
              style={{
                backgroundColor: '#333',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                minWidth: '100px',
              }}
            >
              <option value="phantom">Phantom</option>
              <option value="solflare">Solflare</option>
            </select>
            
            <button 
              className="connect-wallet-btn"
              style={{ 
                ...styles.walletButton,
                backgroundColor: '#333',
                color: 'white'
              }}
              onClick={debugWallet}
            >
              Check Wallet
            </button>
            
            <button 
              className={selectedWallet === 'phantom' ? 'connect-phantom-btn' : 'connect-solflare-btn'}
              style={{ 
                ...styles.walletButton,
                background: isWalletConnected ? '#14F195' : 'linear-gradient(to right, #9945FF, #14F195)',
                color: isWalletConnected ? 'black' : 'white',
                fontWeight: 'bold'
              }}
              onClick={connectWallet}
              disabled={isWalletConnected}
            >
              {isWalletConnected ? 
                `Connected: ${shortenAddress(walletAddress)}` : 
                `Connect ${selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1)}`}
            </button>
          </div>
        </div>
        
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '24px',
          cursor: 'pointer',
          background: 'linear-gradient(to right, #9945FF, #14F195)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          border: '1px solid #333'
        }}
        onClick={() => window.location.href = '/marketplace'}
        >
          →
        </div>
      </header>
      
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ 
          textAlign: 'center',
          marginBottom: '40px',
          background: 'linear-gradient(to right, #9945FF, #14F195)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Create Your NFT {network === 'devnet' ? '(Devnet)' : '(Mainnet)'}
        </h1>
        
        {walletProviders.length === 0 && (
          <div style={{
            backgroundColor: '#f44336',
            padding: '15px',
            color: 'white',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, marginBottom: '10px', fontWeight: 'bold' }}>No wallet extensions detected!</p>
            <p style={{ margin: 0 }}>
              Please install {' '}
              <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                Phantom
              </a>
              {' '} or {' '}
              <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>
                Solflare
              </a>
              {' '} wallet to create NFTs.
            </p>
          </div>
        )}
        
        {network === 'mainnet-beta' && (
          <div style={{
            backgroundColor: '#ff9800',
            padding: '15px',
            color: 'white',
            borderRadius: '5px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, marginBottom: '10px', fontWeight: 'bold' }}>⚠️ Mainnet Mode Active ⚠️</p>
            <p style={{ margin: 0 }}>
              You are creating a real NFT on Solana mainnet. This will cost real SOL.
            </p>
          </div>
        )}
        
        {debugInfo && (
          <div style={{
            backgroundColor: '#1E1E1E',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px',
            border: '1px solid #444',
            fontSize: '14px',
            color: '#F9F9F9',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Debug Info:</div>
            {debugInfo}
          </div>
        )}
        
        {!isMinting || progress < 100 ? (
          <form onSubmit={createNFT}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                NFT Name *
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Awesome NFT #1"
                required
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #333',
                  backgroundColor: '#1A1A1A',
                  color: 'white'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Description *
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your NFT..."
                required
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #333',
                  backgroundColor: '#1A1A1A',
                  color: 'white',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                NFT Image *
              </label>
              <div
                style={{ 
                  border: '2px dashed #333',
                  padding: '20px',
                  textAlign: 'center',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#14F195';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#333';
                }}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                ) : (
                  <p>Drag & drop your image here or click to select</p>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              {imageFile && (
                <p style={{ fontSize: '14px', color: '#14F195' }}>
                  File selected: {imageFile.name}
                </p>
              )}
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Collection Name
              </label>
              <input 
                type="text" 
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                placeholder="e.g. My Awesome Collection"
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #333',
                  backgroundColor: '#1A1A1A',
                  color: 'white'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Royalty Percentage (0-10%)
              </label>
              <input 
                type="number" 
                value={royalty}
                onChange={(e) => setRoyalty(Math.min(10, Math.max(0, Number(e.target.value))))}
                min="0"
                max="10"
                style={{ 
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #333',
                  backgroundColor: '#1A1A1A',
                  color: 'white'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Attributes
              </label>
              {attributes.map((attr, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '10px',
                  marginBottom: '10px',
                  alignItems: 'center'
                }}>
                  <input 
                    type="text" 
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    placeholder="Trait Type (e.g. Background)"
                    style={{ 
                      flex: 1,
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #333',
                      backgroundColor: '#1A1A1A',
                      color: 'white'
                    }}
                  />
                  <input 
                    type="text" 
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    placeholder="Value (e.g. Blue)"
                    style={{ 
                      flex: 1,
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #333',
                      backgroundColor: '#1A1A1A',
                      color: 'white'
                    }}
                  />
                  {attributes.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeAttribute(index)}
                      style={{ 
                        backgroundColor: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        padding: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button 
                type="button"
                onClick={addAttribute}
                style={{ 
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                + Add Attribute
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '30px'
            }}>
              <button 
                type="button"
                onClick={() => window.location.href = '/'}
                style={{ 
                  padding: '12px 24px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  border: 'none',
                  fontSize: '16px',
                  backgroundColor: '#333',
                  color: 'white'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isMinting || !isWalletConnected || walletProviders.length === 0}
                style={{ 
                  padding: '12px 24px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  cursor: isMinting || !isWalletConnected || walletProviders.length === 0 ? 'default' : 'pointer',
                  border: 'none',
                  fontSize: '16px',
                  background: isMinting || !isWalletConnected || walletProviders.length === 0 ? '#666' : 'linear-gradient(to right, #9945FF, #14F195)',
                  color: 'white',
                  opacity: isMinting || !isWalletConnected || walletProviders.length === 0 ? 0.7 : 1
                }}
              >
                {isMinting ? 'Creating NFT...' : 'Create NFT'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ 
            marginTop: '30px',
            padding: '30px',
            backgroundColor: '#1A1A1A',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '72px',
              marginBottom: '20px'
            }}>
              🎉
            </div>
            <h2 style={{
              marginBottom: '20px',
              background: 'linear-gradient(to right, #9945FF, #14F195)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              NFT Created Successfully!
            </h2>
            <p style={{ marginBottom: '30px', fontSize: '16px' }}>
              Your NFT has been minted and will appear in the marketplace soon.
            </p>
            
            {transactionLink && (
              <div style={{ marginBottom: '15px' }}>
                <a 
                  href={transactionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    backgroundColor: '#333',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '14px'
                  }}
                >
                  View Transaction ↗
                </a>
              </div>
            )}
            
            {mintedNftLink && (
              <div style={{ marginBottom: '15px' }}>
                <a 
                  href={mintedNftLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    backgroundColor: '#333',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontSize: '14px',
                    marginRight: '10px'
                  }}
                >
                  View NFT on Explorer ↗
                </a>
                
                <button
                  onClick={toggleWatchlist}
                  style={{ 
                    display: 'inline-block',
                    padding: '10px 15px',
                    background: isInWatchlist ? '#14F195' : '#333',
                    color: isInWatchlist ? 'black' : 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {isInWatchlist ? '✓ Added to Watchlist' : '+ Add to Watchlist'}
                </button>
              </div>
            )}
            
            <button
              onClick={resetForm}
              style={{ 
                padding: '12px 24px',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                fontSize: '16px',
                marginRight: '10px',
                backgroundColor: '#333',
                color: 'white',
              }}
            >
              Create Another NFT
            </button>
            
            <button
              onClick={goToHome}
              style={{ 
                padding: '12px 24px',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                border: 'none',
                fontSize: '16px',
                background: 'linear-gradient(to right, #9945FF, #14F195)',
                color: 'white',
              }}
            >
              Back to Home
            </button>
          </div>
        )}
        
        {isMinting && progress < 100 && (
          <div style={{ 
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#1A1A1A',
            borderRadius: '5px'
          }}>
            <p style={{ marginBottom: '15px' }}>{mintingStatus}</p>
            <div style={{ 
              width: '100%',
              height: '8px',
              backgroundColor: '#333',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(to right, #9945FF, #14F195)',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
      </div>
      
      <footer style={{ 
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #333',
        marginTop: 'auto',
        fontSize: '14px',
        color: '#999'
      }}>
        © HypeFlow all rights reserved 2025
      </footer>
    </div>
  );
} 