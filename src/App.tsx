// Import React and useState hook
import { useState, useEffect } from 'react';

// Define types for Phantom wallet
interface PhantomWindow extends Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toBase58: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: Function) => void;
    removeListener: (event: string, callback: Function) => void;
    isConnected: boolean;
    publicKey?: { toBase58: () => string };
  }
}

// Card types for marketplace
type CardStatus = 'minting' | 'progress' | 'sold';
type CategoryTab = 'trending' | 'recently' | 'gradually' | 'minted' | 'watchlist';

interface NFTCard {
  id: number;
  title: string;
  description: string;
  price: number;
  status: CardStatus;
  rating: number; // 1-5
  isBoosted: boolean;
  progress?: number; // 0-100 percentage
  image?: string; // URL to NFT image
  mint?: string; // NFT mint address
}

// Helius API types
// @ts-ignore
interface HeliusNFT {
  id: string;
  content: {
    metadata: {
      name: string;
      description: string;
      image: string;
    }
  };
  grouping: {
    collection?: {
      name?: string;
    }
  };
  mint: string;
  ownership: {
    owner: string;
  };
}

// NFT cache interface
interface NFTCache {
  timestamp: number;
  data: NFTCard[];
}

// Add at the beginning of the file where other styles are defined
const styles = {
  card: {
    width: '100%',
    maxWidth: '280px',
    background: '#1A1A1A',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative' as const,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  cardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  progressBar: {
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '8px',
    justifyContent: 'flex-end',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  gradientLine: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #9945FF, #14F195)',
  }
};

function App() {
  // State for tracking wallet connection and address
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  // State for active category tab
  const [activeTab, setActiveTab] = useState<CategoryTab>('trending');
  
  // State for minting status
  const [mintingCards, setMintingCards] = useState<number[]>([]);
  
  // State for filters
  const [activeChain, setActiveChain] = useState('all');
  
  // State for loaded NFTs
  const [nftCards, setNftCards] = useState<NFTCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock NFT data as fallback
  const mockNftCards: NFTCard[] = [
    { id: 1, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'minting', rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=1' },
    { id: 2, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'progress', progress: 70, rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=2' },
    { id: 3, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'sold', rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=3' },
    { id: 4, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'progress', progress: 75, rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=4' },
    { id: 5, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'progress', progress: 75, rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=5' },
    { id: 6, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'minting', rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=6' },
    { id: 7, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'sold', rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=7' },
    { id: 8, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'progress', progress: 75, rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=8' },
    { id: 9, title: 'NFTART', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut incididunt ut labore et dolore magna aliqua.', price: 150, status: 'sold', rating: 3, isBoosted: true, image: 'https://picsum.photos/300/300?random=9' },
  ];

  // Chain logo SVGs
  const ChainLogos = {
    Solana: () => (
      <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <path fill="#9945FF" d="M93.94 42.63H13.78l20.28-20.22h80.16l-20.28 20.22zM93.94 105.59H13.78l20.28-20.21h80.16l-20.28 20.21zM93.94 74.19H13.78L34.06 54h80.16l-20.28 20.19z"/>
      </svg>
    ),
    Ethereum: () => (
      <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <path fill="#8A92B2" d="M64 0l-4.24 14.42v66.44l4.24 4.21 32.31-19.09z"/>
        <path fill="#62688F" d="M64 0L31.69 66l32.31 19.08V0z"/>
        <path fill="#454A75" d="M64 92.42l-.4.49v24.76l.4 1.16 32.34-45.51z"/>
        <path fill="#8A92B2" d="M64 118.83V92.42L31.69 73.33z"/>
        <path fill="#62688F" d="M64 85.08l32.31-19.09L64 49.6z"/>
        <path fill="#454A75" d="M31.69 66l32.31 19.08V49.6z"/>
      </svg>
    ),
    BNB: () => (
      <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
        <path fill="#F0B90B" d="M63.7 0l19.3 19.3-35 35-19.3-19.3zm0 39.3l19.3 19.3-35 35-19.3-19.3zm-39.3 0l19.3 19.3-35 35-19.3-19.3zm78.6 0l19.3 19.3-35 35-19.3-19.3z"/>
        <path fill="#F0B90B" d="M24.4 39.3l19.3 19.3-35 35-19.3-19.3zm78.6 0l19.3 19.3-35 35-19.3-19.3z"/>
      </svg>
    )
  };
  
  // Check if wallet is connected on initial load
  useEffect(() => {
    const checkWalletConnection = async () => {
      const { solana } = window as PhantomWindow;
      
      if (solana?.isPhantom) {
        // Set connected state based on Phantom wallet
        if (solana.isConnected && solana.publicKey) {
          setIsConnected(true);
          setWalletAddress(solana.publicKey.toBase58());
        }
        
        // Setup listeners for connection events
        const handleConnect = () => {
          if (solana.publicKey) {
            const walletPublicKey = solana.publicKey.toBase58();
            setWalletAddress(walletPublicKey);
            setIsConnected(true);
            console.log('Wallet connected:', walletPublicKey);
          }
        };
        
        const handleDisconnect = () => {
          setIsConnected(false);
          setWalletAddress('');
          console.log('Wallet disconnected');
        };
        
        // Add event listeners
        solana.on('connect', handleConnect);
        solana.on('disconnect', handleDisconnect);
        
        // Clean up listeners on unmount
        return () => {
          solana.removeListener('connect', handleConnect);
          solana.removeListener('disconnect', handleDisconnect);
        };
      }
    };
    
    checkWalletConnection();
  }, []);
  
  // Fetch NFTs from Helius
  useEffect(() => {
    // Check cache first before fetching
    const cachedData = getCachedNFTs();
    if (cachedData) {
      console.log("Using cached NFT data");
      setNftCards(cachedData);
      // Still fetch in background to update cache
      fetchNFTs(false);
    } else {
      fetchNFTs(true);
    }
  }, [activeTab, activeChain]); // Refetch when category or chain changes

  // Cache helper functions
  const cacheNFTs = (data: NFTCard[]) => {
    const cache: NFTCache = {
      timestamp: Date.now(),
      data: data
    };
    localStorage.setItem('nft_cache', JSON.stringify(cache));
  };

  const getCachedNFTs = (): NFTCard[] | null => {
    try {
      const cachedData = localStorage.getItem('nft_cache');
      if (!cachedData) return null;
      
      const parsedCache: NFTCache = JSON.parse(cachedData);
      // Check if cache is less than 30 minutes old
      if (Date.now() - parsedCache.timestamp < 30 * 60 * 1000) {
        return parsedCache.data;
      }
      return null;
    } catch (e) {
      console.error("Error reading cache:", e);
      return null;
    }
  };

  // Function to fetch NFTs from Helius RPC
  const fetchNFTs = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    
    console.log("Fetching NFTs...");
    
    // Generate high quality mock data
    const generateMockNFTs = (count = 9): NFTCard[] => {
      // NFT collection names and themes
      const collections = [
        { name: "Solana Monkeys", theme: "Colorful cartoon monkeys in different outfits and poses", price: 85 },
        { name: "DeGods", theme: "Artistic interpretations of godlike figures with unique traits", price: 320 },
        { name: "y00ts", theme: "Cute yeti-like characters with various accessories", price: 150 },
        { name: "Okay Bears", theme: "Cartoon bears with different expressions and clothing", price: 90 },
        { name: "Solana Degen Apes", theme: "Detailed ape illustrations with futuristic elements", price: 75 },
        { name: "Aurory", theme: "Fantasy creatures in a vibrant digital world", price: 48 },
        { name: "Claynosaurz", theme: "Clay-styled dinosaur characters in different colors", price: 32 },
        { name: "Famous Fox Federation", theme: "Stylized fox illustrations with unique traits", price: 25 },
        { name: "Shadowy Super Coder", theme: "Mysterious coding characters in the shadows", price: 112 }
      ];
      
      // Status and progress distributions
      const statuses: CardStatus[] = ['minting', 'progress', 'sold'];
      
      // Generate the NFTs
      return Array.from({ length: count }, (_, i) => {
        const collection = collections[i % collections.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const progress = status === 'progress' ? 10 + Math.floor(Math.random() * 90) : undefined;
        
        return {
          id: i + 1,
          title: collection.name,
          description: collection.theme,
          price: collection.price + Math.floor(Math.random() * 50),
          status,
          progress,
          rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars (quality collections)
          isBoosted: Math.random() > 0.5,
          image: `https://picsum.photos/seed/${collection.name.replace(/\s+/g, '')}_${i}/400/400`,
          mint: `mint_address_${i}_${Date.now()}`
        };
      });
    };
    
    try {
      // First try looking for NFTs in HeliusAPI (with a shorter timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        // Pick a random wallet to try
        const sampleWallets = [
          '4dgi5B8CSERZz46UhfFxm9oW1xZXYpzPjSwYxpTurbTR',
          'BAqk6CfTi1hM1F98CuVkZQ2JhRhR6rumaqWYU6SFyxoD',
          'LiKVLf53Y7Wpy6PV8snwBVDhA7YBEVxyjeHSLu7nGCn',
          'Gpzh6xTLUXdmEZyJQr3t9XrHF5WxAYsGQowzYM4wmgD',
          'AaYEE8sQpGkM366HibpVHuTj7BXzCxG4mMVyBMS6r6Vj' // Another wallet with NFTs
        ];
        
        const randomWallet = sampleWallets[Math.floor(Math.random() * sampleWallets.length)];
        console.log(`Trying Helius API with wallet ${randomWallet}...`);
        
        const heliusResponse = await fetch('https://mainnet.helius-rpc.com/?api-key=288226ba-2ab1-4ba5-9cae-15fa18dd68d1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'my-id',
            method: 'getAssetsByOwner',
            params: {
              ownerAddress: randomWallet,
              page: 1,
              limit: 9,
            },
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const heliusData = await heliusResponse.json();
        console.log(`Helius response:`, heliusData);
        
        if (heliusData.result?.items?.length > 0) {
          console.log(`Found ${heliusData.result.items.length} NFTs from Helius!`);
          
          // Process and use the Helius data
          const transformedNfts = heliusData.result.items.map((nft: any, index: number) => {
            const statusOptions: CardStatus[] = ['minting', 'progress', 'sold'];
            const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            
            // Extract image URL, handling various formats
            let imageUrl = '';
            try {
              if (nft.content?.metadata?.image) {
                imageUrl = nft.content.metadata.image;
                // Fix for IPFS URLs
                if (imageUrl.startsWith('ipfs://')) {
                  imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
                }
              } else {
                imageUrl = `https://picsum.photos/seed/helius${index}/400/400`;
              }
            } catch (e) {
              imageUrl = `https://picsum.photos/seed/helius${index}/400/400`;
            }
            
            return {
              id: index + 1,
              title: nft.content?.metadata?.name || 'Solana NFT',
              description: nft.content?.metadata?.description || 'Exclusive Solana NFT collection.',
              price: Math.floor(Math.random() * 200) + 50,
              image: imageUrl,
              mint: nft.id || nft.mint,
              status: randomStatus,
              rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
              isBoosted: Math.random() > 0.5,
              progress: randomStatus === 'progress' ? Math.floor(Math.random() * 90) + 10 : undefined
            };
          });
          
          setNftCards(transformedNfts);
          cacheNFTs(transformedNfts);
          setIsLoading(false);
          return;
        } else {
          console.log("No NFTs found from Helius, using enhanced mock data");
        }
      } catch (heliusError) {
        console.error("Error fetching from Helius:", heliusError);
      }
      
      // If we got here, we need to use mock data
      console.log("Generating enhanced mock NFT data...");
      const mockData = generateMockNFTs(9);
      setNftCards(mockData);
      cacheNFTs(mockData);
    } catch (error) {
      console.error("Error in NFT fetching process:", error);
      
      // Ultimate fallback - use basic mock data with stable URLs
      const basicMockData = mockNftCards.map((card, i) => ({
        ...card,
        image: `https://picsum.photos/seed/fallback${i}/400/400`
      }));
      
      setNftCards(basicMockData);
      cacheNFTs(basicMockData);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle wallet connection
  const connectWallet = async () => {
    const { solana } = window as PhantomWindow;
    
    if (solana?.isPhantom) {
      try {
        if (isConnected) {
          // Disconnect wallet if already connected
          await solana.disconnect();
          setIsConnected(false);
          setWalletAddress('');
        } else {
          // Connect to wallet
          const response = await solana.connect();
          const walletPublicKey = response.publicKey.toBase58();
          setWalletAddress(walletPublicKey);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error connecting to Phantom wallet:", error);
      }
    } else {
      // Redirect to Phantom wallet if not installed
      window.open('https://phantom.app/', '_blank');
    }
  };
  
  // Shortened wallet address display
  const shortenAddress = (address: string) => {
    return address.slice(0, 4) + '...' + address.slice(-4);
  };
  
  // Render star rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? '#FFD700' : '#555', fontSize: '16px' }}>★</span>
      );
    }
    return stars;
  };
  
  // Render status indicator
  const renderStatus = (card: NFTCard) => {
    switch (card.status) {
      case 'minting':
        return (
          <div style={{ width: '100%', backgroundColor: '#333', height: '24px', borderRadius: '4px', marginTop: '8px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: `100%`, backgroundColor: '#FF4545', height: '100%', borderRadius: '4px' }}></div>
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              left: '0', 
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px', 
              color: 'white',
              fontWeight: 'bold'
            }}>
              Sold Out
            </div>
          </div>
        );
      case 'progress':
        return (
          <div style={{ width: '100%', backgroundColor: '#333', height: '24px', borderRadius: '4px', marginTop: '8px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              width: `${card.progress}%`, 
              background: 'linear-gradient(to right, #9945FF, #14F195)', 
              height: '100%', 
              borderRadius: '4px' 
            }}></div>
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              left: '0', 
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px', 
              color: 'white',
              fontWeight: 'bold',
              zIndex: 2
            }}>
              {card.progress}/999
            </div>
          </div>
        );
      case 'sold':
        return (
          <div style={{ width: '100%', backgroundColor: '#333', height: '24px', borderRadius: '4px', marginTop: '8px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ 
              width: '100%', 
              backgroundColor: '#FF4545', 
              height: '100%', 
              borderRadius: '4px' 
            }}></div>
            <div style={{ 
              position: 'absolute', 
              top: '0', 
              left: '0', 
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px', 
              color: 'white',
              fontWeight: 'bold'
            }}>
              Sold Out
            </div>
          </div>
        );
    }
  };

  // Handle mint button click
  const handleMint = (card: NFTCard) => {
    if (!isConnected) {
      alert("Please connect your wallet to mint NFTs");
      return;
    }
    
    if (card.status === 'sold') {
      alert("Sorry, this NFT is already sold out!");
      return;
    }
    
    // Add card to minting state
    if (!mintingCards.includes(card.id)) {
      setMintingCards([...mintingCards, card.id]);
      
      // Simulate minting process
      setTimeout(() => {
        alert(`Successfully minted ${card.title}!`);
        setMintingCards(mintingCards.filter(id => id !== card.id));
      }, 2000);
    }
  };

  // Render Mint button based on status
  const renderMintButton = (card: NFTCard) => {
    const isMinting = mintingCards.includes(card.id);
    
    // For both 'sold' and 'minting' statuses, show a non-clickable "Sold Out" button
    if (card.status === 'sold' || card.status === 'minting') {
      return (
        <button style={{ 
          background: '#FF4545', 
          border: 'none',
          borderRadius: '5px',
          padding: '5px 10px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'default',
          color: 'white'
        }}>
          Sold Out
        </button>
      );
    }
    
    return (
      <button style={{ 
        background: isMinting ? '#999' : '#14F195', 
        border: 'none',
        borderRadius: '5px',
        padding: '5px 10px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: isMinting ? 'default' : 'pointer',
        color: 'black',
        position: 'relative',
        overflow: 'hidden'
      }}
      disabled={isMinting}
      onClick={() => handleMint(card)}>
        {isMinting ? (
          <span>Minting...</span>
        ) : 'Mint'}
        
        {isMinting && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '30%',
            background: 'rgba(255,255,255,0.3)',
            animation: 'mintingAnimation 1s infinite linear',
            transform: 'skewX(-20deg)'
          }}/>
        )}
      </button>
    );
  };
  
  // Handle category tab change
  const handleTabChange = (tab: CategoryTab) => {
    setActiveTab(tab);
  };
  
  // Handle chain filter change
  const handleChainChange = (chain: string) => {
    setActiveChain(chain);
  };

  // Refresh NFT data
  const handleRefresh = () => {
    fetchNFTs();
  };

  return (
    <div style={{ 
      backgroundColor: '#121212', 
      minHeight: '100vh', 
      color: 'white',
      width: '100%',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}> 
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '20px 20px', 
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        borderBottom: '1px solid #333',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          background: 'linear-gradient(to right, #9945FF, #14F195)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          cursor: 'pointer'
        }}
        onClick={handleRefresh}
        >
          OwerFlowNFT
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            borderRadius: '25px',
            border: '1px solid #333',
            padding: '10px 15px',
            marginRight: '10px',
            flexWrap: 'wrap',
            gap: '10px',
            position: 'relative'
          }}
          className="chain-selector"
          >
            <span 
              style={{ 
                fontWeight: activeChain === 'all' ? 'bold' : 'normal', 
                borderBottom: activeChain === 'all' ? '2px solid #14F195' : 'none', 
                marginRight: '10px',
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '2px'
              }}
              className={activeChain === 'all' ? 'active-chain' : ''}
              onClick={() => handleChainChange('all')}
            >
              All Chain
              {activeChain === 'all' && (
                <div style={styles.gradientLine}></div>
              )}
            </span>
            <span 
              style={{ 
                marginRight: '10px',
                cursor: 'pointer',
                opacity: activeChain === 'solana' ? 1 : 0.7,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                paddingBottom: '2px'
              }}
              className={activeChain === 'solana' ? 'active-chain' : ''}
              onClick={() => handleChainChange('solana')}
            >
              <ChainLogos.Solana />
              {activeChain === 'solana' && (
                <div style={styles.gradientLine}></div>
              )}
            </span>
            <span 
              style={{ 
                marginRight: '10px',
                cursor: 'pointer', 
                opacity: activeChain === 'ethereum' ? 1 : 0.7,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                paddingBottom: '2px'
              }}
              className={activeChain === 'ethereum' ? 'active-chain' : ''}
              onClick={() => handleChainChange('ethereum')}
            >
              <ChainLogos.Ethereum />
              {activeChain === 'ethereum' && (
                <div style={styles.gradientLine}></div>
              )}
            </span>
            <span 
              style={{ 
                cursor: 'pointer',
                opacity: activeChain === 'bnb' ? 1 : 0.7,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                paddingBottom: '2px'
              }}
              className={activeChain === 'bnb' ? 'active-chain' : ''}
              onClick={() => handleChainChange('bnb')}
            >
              <ChainLogos.BNB />
              {activeChain === 'bnb' && (
                <div style={styles.gradientLine}></div>
              )}
            </span>
          </div>
          
          <nav style={{ 
            display: 'flex', 
            gap: '20px', 
            marginRight: '15px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
          className="nav-links"
          >
            <button style={{ 
              cursor: 'pointer',
              fontWeight: 'bold',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#232323',
              color: '#14F195',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              border: 'none',
              fontSize: '14px'
            }} 
            onClick={() => alert("Categories section coming soon!")}
            className="categories-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M4 6H20M4 12H20M4 18H20" stroke="#14F195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Categories
            </button>
            <span style={{ cursor: 'pointer' }} onClick={() => alert("Boost section coming soon!")}>Boost</span>
            <span style={{ cursor: 'pointer' }} onClick={() => alert("Tools section coming soon!")}>Tools</span>
            <span style={{ cursor: 'pointer' }} onClick={() => alert("Apply section coming soon!")}>Apply</span>
          </nav>
          
          <button 
            style={{ 
              background: isConnected ? '#14F195' : 'linear-gradient(to right, #9945FF, #14F195)', 
              padding: '10px 20px',
              borderRadius: '25px',
              border: 'none',
              color: isConnected ? 'black' : 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={connectWallet}
            className="connect-wallet-btn"
          >
            {isConnected ? (walletAddress ? shortenAddress(walletAddress) : 'Connected') : 'Connect Wallet'}
          </button>
        </div>
      </header>
      
      <div style={{ 
        padding: '10px 20px', 
        borderBottom: '1px solid #333',
        overflowX: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          minWidth: 'max-content'
        }}>
          <span style={{ 
            padding: '10px 5px', 
            fontWeight: activeTab === 'trending' ? 'bold' : 'normal',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleTabChange('trending')}
          >
            Trending
            {activeTab === 'trending' && (
              <div style={styles.gradientLine}></div>
            )}
          </span>
          <span style={{ 
            padding: '10px 5px',
            fontWeight: activeTab === 'recently' ? 'bold' : 'normal',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleTabChange('recently')}
          >
            Recently
            {activeTab === 'recently' && (
              <div style={styles.gradientLine}></div>
            )}
          </span>
          <span style={{ 
            padding: '10px 5px',
            fontWeight: activeTab === 'gradually' ? 'bold' : 'normal',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleTabChange('gradually')}
          >
            Gradually
            {activeTab === 'gradually' && (
              <div style={styles.gradientLine}></div>
            )}
          </span>
          <span style={{ 
            padding: '10px 5px',
            fontWeight: activeTab === 'minted' ? 'bold' : 'normal',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleTabChange('minted')}
          >
            Minted Out
            {activeTab === 'minted' && (
              <div style={styles.gradientLine}></div>
            )}
          </span>
          <span style={{ 
            padding: '10px 5px',
            fontWeight: activeTab === 'watchlist' ? 'bold' : 'normal',
            cursor: 'pointer',
            position: 'relative'
          }}
          onClick={() => handleTabChange('watchlist')}
          >
            Watchlist
            {activeTab === 'watchlist' && (
              <div style={styles.gradientLine}></div>
            )}
          </span>
        </div>
      </div>
      
      <main style={{ 
        padding: '20px 20px', 
        width: '100%', 
        maxWidth: '1400px', 
        margin: '0 auto',
        boxSizing: 'border-box',
        flex: '1'
      }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div className="loading-spinner"></div>
            <p>Loading NFTs...</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px', 
            width: '100%'
          }}
          className="nft-grid"
          >
            {/* NFT Cards Grid */}
            {nftCards.map((card) => (
              <div key={card.id} style={{ 
                border: '1px solid #333', 
                borderRadius: '15px', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#1E1E1E',
                padding: '0',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              className="nft-card"
              onClick={() => {
                if (!mintingCards.includes(card.id)) {
                  alert(`Viewing details for ${card.title}`);
                }
              }}
              >
                <div style={{ 
                  padding: '15px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    backgroundColor: '#333', 
                    borderRadius: '8px',
                    backgroundImage: card.image ? `url(${card.image})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}></div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                    <h3 style={{ margin: '0', display: 'flex', alignItems: 'center' }}>
                      {card.title}
                      <span style={{
                        marginLeft: '5px',
                        color: '#14F195',
                        fontSize: '16px'
                      }}>✓</span>
                    </h3>
                    <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#999' }}>150L</div>
                  </div>
                  
                  <p style={{ 
                    color: '#999', 
                    fontSize: '14px', 
                    margin: '0', 
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {card.description}
                  </p>
                  
                  {renderStatus(card)}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: '25px' // Increased to accommodate status text
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Price</div>
                      <div style={{ fontWeight: 'bold' }}>{card.price} SOL</div>
                    </div>
                    <div onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when clicking the mint button
                    }}>
                      {renderMintButton(card)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '10px'
                  }}>
                    <div>{renderStars(card.rating)}</div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        backgroundColor: '#BB7A00', 
                        padding: '3px 8px', 
                        borderRadius: '3px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        alert("Boosted collections are promoted by creators");
                      }}
                      >Boosted</span>
                      <span style={{ 
                        backgroundColor: '#0066BB', 
                        padding: '3px 8px', 
                        borderRadius: '3px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        alert("Trending collections are popular right now");
                      }}
                      >Trending</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Add footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #333',
        fontSize: '14px',
        color: '#999'
      }}>
        © OwerFlowNFT all rights reserved 2025
      </footer>
      
      <style>
        {`
          @keyframes mintingAnimation {
            0% {
              transform: translateX(-100%) skewX(-20deg);
            }
            100% {
              transform: translateX(400%) skewX(-20deg);
            }
          }
          
          .nft-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto;
            border-radius: 50%;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-top-color: #14F195;
            animation: spinner 1s linear infinite;
          }
          
          @keyframes spinner {
            to {
              transform: rotate(360deg);
            }
          }
          
          /* Mobile Responsiveness */
          @media screen and (max-width: 768px) {
            header {
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            
            .chain-selector {
              margin-right: 0;
              justify-content: center;
              margin-bottom: 10px;
            }
            
            .nav-links {
              margin-right: 0;
              justify-content: center;
              margin-bottom: 10px;
            }
            
            .connect-wallet-btn {
              width: 100%;
              max-width: 250px;
            }
            
            .nft-grid {
              grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            }
          }
          
          @media screen and (max-width: 480px) {
            .nft-grid {
              grid-template-columns: 1fr;
            }
          }
          
          .categories-button:hover {
            background-color: #2a2a2a;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>
    </div>
  )
}

export default App
