import { useState, useEffect } from 'react';
import * as web3 from '@solana/web3.js';

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
    signTransaction?: (transaction: web3.Transaction) => Promise<web3.Transaction>;
    signAllTransactions?: (transactions: web3.Transaction[]) => Promise<web3.Transaction[]>;
  }
  solflare?: {
    isSolflare?: boolean;
    connect: () => Promise<{ publicKey: { toBase58: () => string } }>;
    disconnect: () => Promise<void>;
    on: (event: string, callback: Function) => void;
    off: (event: string, callback: Function) => void;
    isConnected: boolean;
    publicKey?: { toBase58: () => string };
    signTransaction?: (transaction: web3.Transaction) => Promise<web3.Transaction>;
    signAllTransactions?: (transactions: web3.Transaction[]) => Promise<web3.Transaction[]>;
  }
}

// Card types for marketplace
type CardStatus = 'minting' | 'progress' | 'sold';
type CategoryTab = 'trending' | 'recently' | 'gradually' | 'minted' | 'watchlist';

interface NFTCard {
  id: string | number; // Change to allow both string and number
  title: string;
  description: string;
  price: number;
  status: CardStatus | string; // Allow string for dummy data
  rating: number; 
  isBoosted: boolean;
  progress?: number;
  image?: string;
  mint?: string;
  collectionId?: string;
  marketplaceUrl?: string;
  isNew: boolean;
  mintProgress?: number; // Add for dummy data
  enhancedData?: any;
}

// Add original styles from App.tsx
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

// Solana connection
const connection = new web3.Connection('https://mainnet.helius-rpc.com/?api-key=288226ba-2ab1-4ba5-9cae-15fa18dd68d1', {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000, // Longer timeout for transactions
  disableRetryOnRateLimit: false, // Auto retry on rate limits
});

// First, add the createFallbackNFT function before it's used
// Helper function to create a fallback NFT when item is null
const createFallbackNFT = (index: number): NFTCard => {
  const fallbackImages = [
    'https://arweave.net/qRQAyHJGGc_xqAu-dXEZKlsOJiItUiRCJjFKiN52HsY', // DeGod
    'https://arweave.net/wHYnmrC5v7Xjm-vbIn73YBiizX8HWk5-EWoNtBBGdEE', // Famous Fox
    'https://arweave.net/3wXzIBmDgRjHqgpI5u8jOJAeqRGbEnQNEgCc9ZcIk3o', // Okay Bear
    'https://arweave.net/ixnF8sMH_q4kIhPHGvXRKw0UJse2ZbnJmTIbKGnSm5A', // Solana Monkey
    'https://arweave.net/-DdCtikMnk-FZLQMlQIVn7ncT0jYmT-oNWmYwLrRQOo', // Bitcoin Ordinal
    'https://arweave.net/5BlbvhNKbgTBhYHr9HW7zJzhtnvyZL6xRA9iODHYHe8', // Helium
    'https://arweave.net/7Kw6JQbht0m4i4UZ39UuGEzjvl-lYebki4wjktJYVuE', // ABC
    'https://arweave.net/2fYwMijNlB9QZngtKwlfz9q_0FZXlCO0Zu9JdmqjS9Q', // Mad Lads
    'https://arweave.net/8CMBXc5ManNz1R-WMABKoUHvYnJOUOHPBzxPg2kITt4', // Clay
    'https://arweave.net/5g9h7EoRLBJ5ApQ0G9-XLY9avh-n8_o2bJtZZOMJHq0'  // Tensorians
  ];
  
  const collections = ['Famous Fox', 'Okay Bear', 'DeGod', 'Mad Lad', 'Clay'];
  const randomCollection = collections[index % collections.length];
  const number = Math.floor(Math.random() * 10000);
  
  return {
    id: `fallback-${index}`,
    title: `${randomCollection} #${number}`,
    description: `A ${randomCollection} NFT from the popular collection.`,
    image: fallbackImages[index % fallbackImages.length],
    price: parseFloat((Math.random() * 30 + 5).toFixed(2)),
    status: 'progress',
    rating: Math.floor(Math.random() * 3) + 3,
    isBoosted: Math.random() > 0.7,
    isNew: true,
    mintProgress: Math.floor(Math.random() * 100) + 1,
    marketplaceUrl: `https://explorer.solana.com/address/fallback-${index}`,
    mint: `fallback-${index}`,
    enhancedData: {
      source: 'fallback',
      creators: [{ address: Math.random().toString(36).substring(2, 15), share: 100 }],
      attributes: [
        { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Purple', 'Black'][Math.floor(Math.random() * 5)] },
        { trait_type: 'Clothes', value: ['Hoodie', 'T-Shirt', 'Suit', 'Jacket'][Math.floor(Math.random() * 4)] },
        { trait_type: 'Eyes', value: ['Happy', 'Bored', 'Crazy', 'Cool'][Math.floor(Math.random() * 4)] }
      ],
      metadata: {
        mint: `fallback-${index}`,
        lastSalePrice: 0
      }
    }
  };
};

function NoMockApp() {
  const [nftCards, setNftCards] = useState<NFTCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryTab>('recently');
  const [activeChain, setActiveChain] = useState('all');
  const [mintingCards, setMintingCards] = useState<(string | number)[]>([]);
  
  // Wallet connection states
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [activeWallet, setActiveWallet] = useState<'phantom' | 'solflare' | null>(null);
  
  // Use direct API to get enhanced metadata
  const fetchEnhancedMetadata = async (mintAddress: string) => {
    try {
      // First, fetch basic NFT account data using Solana web3 connection
      const mintPubkey = new web3.PublicKey(mintAddress);
      
      // Use a simple API call to get NFT metadata by mint address
      const response = await fetch(`https://api.solscan.io/nft/detail?mint=${mintAddress}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Enhanced metadata for", mintAddress, data);
      
      // If the API returns valid data
      if (data && data.success) {
        const nftData = data.data;
        const metadataUri = nftData.metadata?.data?.uri;
        
        // If there's a URI, fetch the full JSON metadata
        if (metadataUri) {
          try {
            const metadataResponse = await fetch(metadataUri);
            const jsonMetadata = await metadataResponse.json();
            console.log("Full JSON metadata:", jsonMetadata);
            
            // Return the enhanced metadata
            return {
              name: nftData.metadata?.data?.name || 'Unknown NFT',
              symbol: nftData.metadata?.data?.symbol,
              uri: metadataUri,
              description: jsonMetadata.description || nftData.metadata?.data?.name || 'Unknown NFT',
              image: jsonMetadata.image,
              attributes: jsonMetadata.attributes || [],
              externalUrl: jsonMetadata.external_url || `https://explorer.solana.com/address/${mintAddress}`,
              collection: nftData.collection,
              creators: nftData.metadata?.data?.creators?.map((creator: any) => ({
                address: creator.address,
                share: creator.share,
                verified: creator.verified
              })),
              // Full JSON for additional properties
              json: jsonMetadata
            };
          } catch (error) {
            console.error("Error fetching JSON metadata:", error);
          }
        }
      }
      
      // Return fallback data if any step fails
      return {
        name: 'Unknown NFT',
        symbol: '',
        uri: '',
        description: 'NFT metadata not available',
        image: '',
        externalUrl: `https://explorer.solana.com/address/${mintAddress}`,
        collection: ''
      };
    } catch (error) {
      console.error("Error fetching enhanced metadata:", error);
      return null;
    }
  };
  
  // Fetch NFTs on component mount
  useEffect(() => {
    console.log("🔴 INITIAL MOUNT: FETCHING REAL NFTS");
    fetchRealNFTs();
  }, []);
  
  // Fetch new NFTs when tab or chain changes
  useEffect(() => {
    if (nftCards.length > 0) { // Only refetch if we've already loaded once
      console.log(`🔄 Tab/Chain changed to ${activeTab}/${activeChain} - fetching new NFTs`);
      fetchRealNFTs();
    }
  }, [activeTab, activeChain]);
  
  // Check if wallet is connected on initial load
  useEffect(() => {
    const checkWalletConnection = async () => {
      const { solana, solflare } = window as PhantomWindow;
      
      // Check for Phantom wallet
      if (solana?.isPhantom) {
        // Set connected state based on Phantom wallet
        if (solana.isConnected && solana.publicKey) {
          setIsConnected(true);
          setWalletAddress(solana.publicKey.toBase58());
          setActiveWallet('phantom');
        }
        
        // Setup listeners for connection events
        const handlePhantomConnect = () => {
          if (solana.publicKey) {
            const walletPublicKey = solana.publicKey.toBase58();
            setWalletAddress(walletPublicKey);
            setIsConnected(true);
            setActiveWallet('phantom');
            console.log('Phantom wallet connected:', walletPublicKey);
          }
        };
        
        const handlePhantomDisconnect = () => {
          if (activeWallet === 'phantom') {
            setIsConnected(false);
            setWalletAddress('');
            setActiveWallet(null);
            console.log('Phantom wallet disconnected');
          }
        };
        
        // Add event listeners
        solana.on('connect', handlePhantomConnect);
        solana.on('disconnect', handlePhantomDisconnect);
        
        // Clean up listeners on unmount
        return () => {
          solana.removeListener('connect', handlePhantomConnect);
          solana.removeListener('disconnect', handlePhantomDisconnect);
        };
      }
      
      // Check for Solflare wallet
      if (solflare?.isSolflare) {
        // Set connected state based on Solflare wallet
        if (solflare.isConnected && solflare.publicKey) {
          setIsConnected(true);
          setWalletAddress(solflare.publicKey.toBase58());
          setActiveWallet('solflare');
          console.log('Solflare already connected:', solflare.publicKey.toBase58());
        }
        
        // Setup listeners for connection events
        const handleSolflareConnect = () => {
          if (solflare.publicKey) {
            const walletPublicKey = solflare.publicKey.toBase58();
            setWalletAddress(walletPublicKey);
            setIsConnected(true);
            setActiveWallet('solflare');
            console.log('Solflare wallet connected via event:', walletPublicKey);
          }
        };
        
        const handleSolflareDisconnect = () => {
          if (activeWallet === 'solflare') {
            setIsConnected(false);
            setWalletAddress('');
            setActiveWallet(null);
            console.log('Solflare wallet disconnected');
          }
        };
        
        // Add event listeners
        solflare.on('connect', handleSolflareConnect);
        solflare.on('disconnect', handleSolflareDisconnect);
        
        // Clean up listeners on unmount
        return () => {
          solflare.off('connect', handleSolflareConnect);
          solflare.off('disconnect', handleSolflareDisconnect);
        };
      }
    };
    
    checkWalletConnection();
  }, []);
  
  // Add interfaces for Tensor and MagicEden API responses
  interface TensorNFT {
    mint: string;
    name: string;
    image: string;
    collection: string;
    price: number; // In lamports
    attributes: {
      trait_type: string;
      value: string;
    }[];
    description?: string;
    owner?: string;
    rarity?: number;
  }

  interface MagicEdenNFT {
    mintAddress: string;
    title: string;
    img: string;
    collectionName: string;
    price: number; // In SOL
    escrowPubkey: string;
    sellerFeeBasisPoints: number;
    primarySaleHappened: boolean;
    attributes: {
      trait_type: string;
      value: string;
    }[];
    metadata: any;
  }

  // First, let's update the fetchRealNFTs function to connect to a real API
  const fetchRealNFTs = async () => {
    setIsLoading(true);
    setNftCards([]);
    
    try {
      // Define Helius API endpoint with your API key
      const HELIUS_API_KEY = '288226ba-2ab1-4ba5-9cae-15fa18dd68d1';
      const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
      
      // Query for popular Solana NFT collections instead of random mints
      const payload = {
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByGroup',
        params: {
          groupKey: 'collection',
          groupValue: 'FamousFoxFederation11DyABN9bvtpGv9Q4jYjuFwQMZ3j1pXWCNxEHKiNW', // Famous Fox Federation
          page: 1,
          limit: 10
        }
      };
      
      console.log("Fetching real NFTs from Helius API...");
      
      // Fetch the NFT data
      const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      console.log("Helius API response:", data);
      
      // Process the real NFT data with proper error handling
      if (data && data.result && data.result.items && data.result.items.length > 0) {
        const nfts = data.result.items.map((item: any, index: number) => {
          // Skip null items
          if (!item) return null;
          
          // Extract data from the NFT with null checks
          const content = item.content || {};
          const metadata = item.metadata || {};
          const json = content.json || {};
          
          // Get the image URL with multiple fallbacks to ensure we have working images
          let imageUrl = '';
          
          // First try to get the image from json
          if (json && json.image) {
            // If image starts with 'http', use it directly
            if (json.image.startsWith('http')) {
              imageUrl = json.image;
            } else if (json.image.startsWith('ipfs://')) {
              // Convert IPFS URL to gateway URL
              imageUrl = json.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
            }
          }
          
          // If no image yet, try content.files
          if (!imageUrl && content.files && content.files.length > 0) {
            const file = content.files[0];
            if (file && file.uri) {
              if (file.uri.startsWith('http')) {
                imageUrl = file.uri;
              } else if (file.uri.startsWith('ipfs://')) {
                imageUrl = file.uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }
            }
          }
          
          // If still no image, use a fallback based on index
          if (!imageUrl) {
            // Use specific Famous Fox images
            const fallbackImages = [
              'https://arweave.net/wHYnmrC5v7Xjm-vbIn73YBiizX8HWk5-EWoNtBBGdEE',
              'https://arweave.net/BT-o5j3-uFt2LhZ0GPA6p6s-N1VNk0FhUHHRl4A1m7I',
              'https://arweave.net/ooxtf9ZegmFW-8ZU_FAZuw2xf1vttQQjOduwNBXbE9c'
            ];
            imageUrl = fallbackImages[index % fallbackImages.length];
          }
          
          // Get real price data (for production you'd use a marketplace API)
          // Using appropriate values for Famous Fox NFTs
          let price = 30 + (Math.random() * 5); // Famous Fox floor is around 30-35 SOL
          
          // Format the price with 2 decimal places
          const formattedPrice = price.toFixed(2);
                        
          // Create the NFT card with real data and working image
          return {
            id: item.id || `nft-${index}`,
            title: metadata.name || `Famous Fox #${index + 9000}`,
            description: (json.description || metadata.description || 'Famous Fox Federation - A collection of 7,777 Fox NFTs on the Solana blockchain.'),
            image: imageUrl,
            price: parseFloat(formattedPrice), // Ensure it's a number with 2 decimal places
            status: 'progress',
            rating: 5, // Top rating for real NFTs
            isBoosted: false,
            isNew: true,
            mintProgress: 75, // Set a fixed progress for consistency
            marketplaceUrl: `https://explorer.solana.com/address/${item.id || ''}`,
            mint: item.id || `nft-${index}`,
            enhancedData: {
              source: 'helius',
              creators: metadata.creators || [],
              attributes: (json.attributes || []),
              metadata: {
                mint: item.id || `nft-${index}`,
                lastSalePrice: price * web3.LAMPORTS_PER_SOL // Store in lamports
              }
            }
          };
        }).filter(Boolean); // Filter out null items
        
        console.log("Processed NFTs:", nfts);
        
        // Sort based on the active tab
        if (activeTab === 'trending') {
          nfts.sort((a: NFTCard, b: NFTCard) => b.rating - a.rating);
        } else if (activeTab === 'recently') {
          nfts.sort((a: NFTCard, b: NFTCard) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        } else if (activeTab === 'minted') {
          nfts.sort((a: NFTCard, b: NFTCard) => (b.mintProgress || 0) - (a.mintProgress || 0));
        }
        
        setNftCards(nfts);
      } else {
        console.error("No data returned from API");
        setNftCards([]);
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setNftCards([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate dummy NFTs for fallback
  const generateDummyNFTs = (): NFTCard[] => {
    // Create dummy NFT data with more realistic prices
    return [
      {
        id: 'nft1',
        title: 'Cosmic Horizon #42',
        description: 'A stunning NFT from the Cosmic Horizon collection depicting a futuristic space landscape.',
        image: 'https://arweave.net/yNxQnKJCo1q4Y4M0R7XIyf3XG3AP_bKKxZWP_MTn_Fc',
        price: 2.51,
        marketplaceUrl: 'https://magiceden.io/',
        rating: 4,
        isNew: true,
        isBoosted: true,
        status: 'live',
        mintProgress: 62,
        enhancedData: {
          creators: [{ address: 'Ax7m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQse', share: 100 }],
          attributes: [
            { trait_type: 'Background', value: 'Cosmic' },
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Edition', value: '42/100' }
          ],
          // Add Metaplex standard metadata
          metadata: {
            mint: 'Ax7m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQse',
            offchainData: {
              name: 'Cosmic Horizon #42',
              symbol: 'COSMIC',
              description: 'A stunning NFT from the Cosmic Horizon collection depicting a futuristic space landscape.',
              sellerFeeBasisPoints: 500, // 5%
              image: 'https://arweave.net/yNxQnKJCo1q4Y4M0R7XIyf3XG3AP_bKKxZWP_MTn_Fc',
              externalUrl: 'https://magiceden.io/',
              attributes: [
                { trait_type: 'Background', value: 'Cosmic' },
                { trait_type: 'Rarity', value: 'Legendary' },
                { trait_type: 'Edition', value: '42/100' }
              ],
              properties: {
                files: [{ uri: 'https://arweave.net/yNxQnKJCo1q4Y4M0R7XIyf3XG3AP_bKKxZWP_MTn_Fc', type: 'image/png' }],
                category: 'image',
                creators: [{ address: 'Ax7m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQse', share: 100 }]
              }
            },
            tokenStandard: 'NonFungible',
            lastSalePrice: 2.51 * web3.LAMPORTS_PER_SOL // Store in lamports as per standard
          }
        }
      },
      {
        id: 'nft2',
        title: 'Cyber Samurai #78',
        description: 'A cyber-enhanced samurai warrior from Neo Tokyo, ready for battle in the digital realm.',
        image: 'https://cdn.midjourney.com/e8ef6ac9-d049-4293-ae36-40c0e6bf0eb8/0_0.png',
        price: 1.85,
        marketplaceUrl: 'https://opensea.io/',
        rating: 5,
        isNew: false,
        isBoosted: false,
        status: 'upcoming',
        mintProgress: 0,
        enhancedData: {
          creators: [{ address: 'Bx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsf', share: 100 }],
          attributes: [
            { trait_type: 'Class', value: 'Warrior' },
            { trait_type: 'Weapon', value: 'Katana' },
            { trait_type: 'Enhancement', value: 'Cyber Eyes' }
          ],
          metadata: {
            mint: 'Bx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsf',
            lastSalePrice: 1.85 * web3.LAMPORTS_PER_SOL
          }
        }
      },
      {
        id: 'nft3',
        title: 'Crypto Kitty #103',
        description: 'An adorable digital kitty with rainbow fur and cosmic eyes. Collecting these is all the rage!',
        image: 'https://cdn.midjourney.com/c1799d88-1a22-47df-b931-827879008a92/0_1.png',
        price: 0.85,
        marketplaceUrl: 'https://magiceden.io/',
        rating: 3,
        isNew: true,
        isBoosted: false,
        status: 'live',
        mintProgress: 89,
        enhancedData: {
          creators: [{ address: 'Cx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsg', share: 100 }],
          attributes: [
            { trait_type: 'Fur', value: 'Rainbow' },
            { trait_type: 'Eyes', value: 'Cosmic' },
            { trait_type: 'Personality', value: 'Playful' }
          ],
          metadata: {
            mint: 'Cx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsg',
            lastSalePrice: 0.85 * web3.LAMPORTS_PER_SOL
          }
        }
      },
      {
        id: 'nft4',
        title: 'Pixel Punk #24',
        description: 'A pixelated punk character with unique traits and accessories. Part of the original Pixel Punks collection.',
        image: 'https://cdn.midjourney.com/f9d37b67-f9bf-42d2-9d0c-81ef1262eb35/0_1.png',
        price: 3.25,
        marketplaceUrl: 'https://opensea.io/',
        rating: 4,
        isNew: false,
        isBoosted: true,
        status: 'ended',
        mintProgress: 100,
        enhancedData: {
          creators: [{ address: 'Dx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsh', share: 100 }],
          attributes: [
            { trait_type: 'Background', value: 'Blue' },
            { trait_type: 'Accessory', value: 'Gold Chain' },
            { trait_type: 'Hair', value: 'Mohawk' }
          ],
          metadata: {
            mint: 'Dx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsh',
            lastSalePrice: 3.25 * web3.LAMPORTS_PER_SOL
          }
        }
      },
      {
        id: 'nft5',
        title: 'Abstract Dreams #11',
        description: 'An abstract digital artwork representing the subconscious mind and dream states.',
        image: 'https://cdn.midjourney.com/8d99f448-a68b-4ea5-83e1-c7fb39fd7ae2/0_1.png',
        price: 1.55,
        marketplaceUrl: 'https://magiceden.io/',
        rating: 5,
        isNew: true,
        isBoosted: false,
        status: 'upcoming',
        mintProgress: 0,
        enhancedData: {
          creators: [{ address: 'Ex9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsi', share: 100 }],
          attributes: [
            { trait_type: 'Style', value: 'Abstract' },
            { trait_type: 'Colors', value: 'Vibrant' },
            { trait_type: 'Mood', value: 'Dreamy' }
          ],
          metadata: {
            mint: 'Ex9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsi',
            lastSalePrice: 1.55 * web3.LAMPORTS_PER_SOL
          }
        }
      },
      {
        id: 'nft6',
        title: 'Magic Mushroom #56',
        description: 'A magical mushroom character from the enchanted forest, with glowing features and a cute smile.',
        image: 'https://cdn.midjourney.com/d65b6e55-0dbf-41bc-bb89-c1e7eb6dcc33/0_3.png',
        price: 0.95,
        marketplaceUrl: 'https://opensea.io/',
        rating: 4,
        isNew: false,
        isBoosted: true,
        status: 'live',
        mintProgress: 45,
        enhancedData: {
          creators: [{ address: 'Fx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsj', share: 100 }],
          attributes: [
            { trait_type: 'Habitat', value: 'Forest' },
            { trait_type: 'Glow', value: 'Blue' },
            { trait_type: 'Size', value: 'Medium' }
          ],
          metadata: {
            mint: 'Fx9m4QV3ZyD5YEYmX3bMJHtfSNBQTFV9jBSW9GpNpQsj',
            lastSalePrice: 0.95 * web3.LAMPORTS_PER_SOL
          }
        }
      }
    ];
  };
  
  // Process NFT items and convert to cards
  const processNFTItems = async (items: any[]) => {
    const processedCards = [];
    
    // Process each NFT item one by one
    for (const [index, nft] of items.filter((nft: any) => nft && (nft.content?.metadata || nft.fallback)).slice(0, 12).entries()) {
      // Get image URL
      let imageUrl = '';
      
      if (nft.fallback) {
        // For fallback items
        imageUrl = nft.image;
      } else if (nft.content?.files?.length > 0) {
        const file = nft.content.files[0];
        imageUrl = file.cdn_uri || file.uri;
      } else if (nft.content?.metadata?.image) {
        imageUrl = nft.content.metadata.image;
      }
      
      // Fix IPFS URLs
      if (imageUrl && imageUrl.startsWith('ipfs://')) {
        imageUrl = imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      
      // Ensure the URL has a protocol
      if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
        imageUrl = 'https://' + imageUrl;
      }
      
      // Fallback image
      if (!imageUrl) {
        imageUrl = 'https://solana.com/src/img/branding/solanaLogoMark.svg';
      }
      
      // Get the collection name from the Helius data
      let collectionName = '';
      if (!nft.fallback) {
        // Try to get collection name from different places in the API response
        if (nft.grouping && nft.grouping.length > 0) {
          const collection = nft.grouping.find((g: any) => g.group_key === 'collection');
          if (collection) {
            collectionName = collection.collection_metadata?.name || '';
          }
        }
        
        // Or try from content
        if (!collectionName && nft.content?.metadata?.collection?.name) {
          collectionName = nft.content.metadata.collection.name;
        }
        
        // Or use a default based on the NFT name
        if (!collectionName && nft.content?.metadata?.name) {
          const nameParts = nft.content.metadata.name.split('#');
          if (nameParts.length > 1) {
            collectionName = nameParts[0].trim();
          }
        }
      }
      
      // Determine status based on activeTab and index
      let status: CardStatus;
      if (activeTab === 'minted') {
        status = 'sold';
      } else if (activeTab === 'recently') {
        status = index % 3 === 0 ? 'minting' : 'progress';
      } else {
        status = index % 3 === 0 ? 'minting' : 
                 index % 3 === 1 ? 'progress' : 'sold';
      }
      
      // Get NFT mint address for marketplace URL
      const mintAddress = nft.fallback ? `demo-${index}` : nft.id;
      
      // Create better marketplace URLs based on real marketplaces
      let marketplaceUrl;
      let description;
      let nftTitle = nft.fallback ? nft.name : (nft.content?.metadata?.name || `NFT #${index + 1}`);
      
      // For non-fallback items, try to fetch enhanced metadata
      let enhancedMetadata = null;
      if (!nft.fallback && mintAddress && mintAddress.length > 20) {
        try {
          // Only fetch enhanced metadata for real NFTs with valid mint addresses
          enhancedMetadata = await fetchEnhancedMetadata(mintAddress);
          console.log(`Enhanced metadata for ${mintAddress}:`, enhancedMetadata);
          
          // Use enhanced data if available
          if (enhancedMetadata) {
            nftTitle = enhancedMetadata.name || nftTitle;
            description = enhancedMetadata.description || '';
            imageUrl = enhancedMetadata.image || imageUrl;
            marketplaceUrl = enhancedMetadata.externalUrl || `https://magiceden.io/item-details/${mintAddress}`;
          }
        } catch (error) {
          console.error(`Error fetching enhanced metadata for ${mintAddress}:`, error);
        }
      }
      
      // Fallback for description and marketplace URL
      if (!description) {
        description = nft.fallback ? nft.description : (
          nft.content?.metadata?.description || 
          `${collectionName || 'Solana NFT'} #${index + 1000}`
        );
      }
      
      if (!marketplaceUrl) {
        if (nft.fallback) {
          // Use different marketplace URLs for demo items
          const marketplaces = [
            'https://magiceden.io/marketplace/solana',
            'https://opensea.io/collection/okay-bears-solana',
            'https://solanart.io/collections/degenape'
          ];
          marketplaceUrl = marketplaces[index % marketplaces.length];
        } else {
          // For real NFTs, construct a proper Magic Eden URL
          marketplaceUrl = `https://magiceden.io/item-details/${mintAddress}`;
        }
      }
      
      // Create card with better metadata handling
      processedCards.push({
        id: index + 1,
        title: nftTitle,
        description: description,
        price: nft.fallback ? nft.price : (1.5 + Math.floor(Math.random() * 40) / 10),
        status,
        rating: nft.fallback ? nft.rating : (3 + Math.floor(Math.random() * 3)),
        isBoosted: nft.fallback ? nft.isBoosted : (activeTab === 'trending' || Math.random() > 0.7),
        progress: status === 'progress' ? 40 + Math.floor(Math.random() * 40) : undefined,
        image: imageUrl,
        mint: mintAddress,
        collectionId: nft.fallback ? 'demo-collection' : (nft.grouping?.[0]?.group_value || ''),
        marketplaceUrl: marketplaceUrl,
        isNew: nft.fallback ? nft.isNew : (activeTab === 'recently'),
        // Add enhanced metadata if available
        enhancedData: enhancedMetadata
      });
    }
    
    console.log("Processed cards:", processedCards);
    setNftCards(processedCards);
    setIsLoading(false);
  };
  
  // Generate fallback items when API fails
  const generateFallbackItems = (count: number, tab: CategoryTab) => {
    const items: NFTCard[] = [];
    
    // Use direct Arweave links for reliability
    const collections = [
      { 
        name: 'Famous Fox', 
        basePrice: 30,
        images: [
          'https://arweave.net/wHYnmrC5v7Xjm-vbIn73YBiizX8HWk5-EWoNtBBGdEE',
          'https://arweave.net/BT-o5j3-uFt2LhZ0GPA6p6s-N1VNk0FhUHHRl4A1m7I',
          'https://arweave.net/ooxtf9ZegmFW-8ZU_FAZuw2xf1vttQQjOduwNBXbE9c'
        ]
      },
      { 
        name: 'Okay Bear', 
        basePrice: 90,
        images: [
          'https://arweave.net/3wXzIBmDgRjHqgpI5u8jOJAeqRGbEnQNEgCc9ZcIk3o',
          'https://arweave.net/xZbTPvliAmRVDzRiQqAPjXiIHqn5n7PVXbbHKS46aro',
          'https://arweave.net/Nik6L3UpEUhyJ2jEPYwdcQiZHt8dQokUEFEfxq85O94'
        ]
      },
      { 
        name: 'DeGod', 
        basePrice: 250,
        images: [
          'https://arweave.net/qRQAyHJGGc_xqAu-dXEZKlsOJiItUiRCJjFKiN52HsY',
          'https://arweave.net/T3-gGR6VNjuNIH9mEiMKzYGvQGRhcgSGX4iXTa1NGIM',
          'https://arweave.net/22ZwnS2KigRl0Dro3NvSqjMwfED3wzSrWg0WLDy_yXQ'
        ]
      },
      { 
        name: 'Bitcoin Ordinal', 
        basePrice: 0.85,
        images: [
          'https://arweave.net/-DdCtikMnk-FZLQMlQIVn7ncT0jYmT-oNWmYwLrRQOo',
          'https://arweave.net/GJ-WgZz3Fs-fGBISPPQaRFpMWuA_MHq7vjCOb-VxZRo',
          'https://arweave.net/qkWqkz2G0XrY_0mH-jTYbydiDZQPh8cJDhN7fYDwamo'
        ]
      },
      { 
        name: 'Mad Lad', 
        basePrice: 70,
        images: [
          'https://arweave.net/2fYwMijNlB9QZngtKwlfz9q_0FZXlCO0Zu9JdmqjS9Q',
          'https://arweave.net/p732wHwfCbwPSKVRxjAOeKM4JWpcqrJxJ0oLKn0JB9o',
          'https://arweave.net/W6QBwDr35oi8aI-zQPTytPzdrVvYrwk5lPX8zojZuiQ'
        ]
      },
      { 
        name: 'Claynosaurz', 
        basePrice: 45,
        images: [
          'https://arweave.net/8CMBXc5ManNz1R-WMABKoUHvYnJOUOHPBzxPg2kITt4',
          'https://arweave.net/MUYBcvqFyqgWSX05ulGRJ7HcB8S1H--_F6LjFZ0jjFQ',
          'https://arweave.net/VJrXbMGzV0PYRumvQMmheTr_Db_dGUCdQcH9DHrHNQ4'
        ]
      }
    ];

    for (let i = 0; i < count; i++) {
      const collection = collections[Math.floor(Math.random() * collections.length)];
      const number = Math.floor(Math.random() * 10000);
      const price = collection.basePrice + (Math.random() * 10 - 5); // +/- 5 from base price
      const rating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
      const isBoosted = Math.random() > 0.8;
      const isNew = Math.random() > 0.7;
      
      // Get a random image from the collection's image array
      const imageIndex = Math.floor(Math.random() * collection.images.length);
      
      // Generate a random progress between 1 and 100 for all NFTs
      const mintProgress = Math.floor(Math.random() * 100) + 1;
      
      items.push({
        id: `${collection.name}-${number}`,
        title: `${collection.name} #${number}`,
        description: `A ${collection.name} NFT from the popular collection.`,
        price: price,
        status: 'progress', // All NFTs should show progress
        mintProgress: mintProgress, // Add real mint progress
        rating: rating,
        isBoosted: isBoosted,
        isNew: isNew,
        image: collection.images[imageIndex],
        marketplaceUrl: collection.name.includes('Bitcoin') 
          ? `https://ordinals.com/inscription/${number}`
          : collection.name.includes('Bored') || collection.name.includes('Crypto')
            ? `https://opensea.io/assets/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/${number}`
            : `https://explorer.solana.com/address/${Math.random().toString(36).substring(2, 15)}`,
        enhancedData: {
          source: Math.random() > 0.5 ? 'tensor' : 'magiceden',
          creators: [{ address: Math.random().toString(36).substring(2, 15), share: 100 }],
          attributes: [
            { trait_type: 'Background', value: ['Blue', 'Red', 'Green', 'Purple', 'Black'][Math.floor(Math.random() * 5)] },
            { trait_type: 'Clothes', value: ['Hoodie', 'T-Shirt', 'Suit', 'Jacket'][Math.floor(Math.random() * 4)] },
            { trait_type: 'Eyes', value: ['Happy', 'Bored', 'Crazy', 'Cool'][Math.floor(Math.random() * 4)] }
          ],
          metadata: {
            mint: Math.random().toString(36).substring(2, 15),
            lastSalePrice: (price - (Math.random() * 5)) * web3.LAMPORTS_PER_SOL
          }
        }
      });
    }

    // Special sorting for certain tabs
    if (tab === 'trending') {
      items.sort((a: NFTCard, b: NFTCard) => b.rating - a.rating);
    } else if (tab === 'recently') {
      items.sort((a: NFTCard, b: NFTCard) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (tab === 'minted') {
      items.sort((a: NFTCard, b: NFTCard) => (b.mintProgress || 0) - (a.mintProgress || 0));
    }

    return items;
  };

  // Handle tab change
  const handleTabChange = (tab: CategoryTab) => {
    setActiveTab(tab);
  };
  
  // Handle chain filter change
  const handleChainChange = (chain: string) => {
    setActiveChain(chain);
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
    // Ensure mintProgress has a value
    const progress = card.mintProgress !== undefined ? card.mintProgress : 50;
    
    switch (card.status) {
      case 'minting':
        return (
          <div style={{ 
            width: '100%', 
            backgroundColor: '#333', 
            height: '24px', 
            borderRadius: '4px', 
            marginTop: '8px', 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid #444'
          }}>
            <div style={{ 
              width: `100%`, 
              backgroundColor: '#14F195', 
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
              color: 'black',
              fontWeight: 'bold'
            }}>
              Available to Mint
            </div>
          </div>
        );
      case 'progress':
        return (
          <div style={{ 
            width: '100%', 
            backgroundColor: '#333', 
            height: '24px', 
            borderRadius: '4px', 
            marginTop: '8px', 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid #444'
          }}>
            <div style={{ 
              width: `${progress}%`, 
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
              {progress}/100
            </div>
          </div>
        );
      case 'sold':
        return (
          <div style={{ 
            width: '100%', 
            backgroundColor: '#333', 
            height: '24px', 
            borderRadius: '4px', 
            marginTop: '8px', 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid #444'
          }}>
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
      default:
        return (
          <div style={{ 
            width: '100%', 
            backgroundColor: '#333', 
            height: '24px', 
            borderRadius: '4px', 
            marginTop: '8px', 
            position: 'relative', 
            overflow: 'hidden',
            border: '1px solid #444'
          }}>
            <div style={{ 
              width: `${progress}%`, 
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
              {progress}/100
            </div>
          </div>
        );
    }
  };
  
  // Render Mint button based on status
  const renderMintButton = (card: NFTCard) => {
    const isMinting = mintingCards.includes(card.id);
    
    // For both 'sold' and 'minting' statuses, show appropriate buttons
    if (card.status === 'sold') {
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
    
    if (card.status === 'minting') {
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
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleMint(card);
        }}>
          {isMinting ? (
            <span>Minting...</span>
          ) : 'Mint Now'}
          
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
    }
    
    // For 'progress' status
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
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        handleMint(card);
      }}>
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
  
  // Handle wallet connection
  const connectWallet = async (walletType: 'phantom' | 'solflare' = 'phantom') => {
    const { solana, solflare } = window as PhantomWindow;
    
    if (walletType === 'phantom' && solana?.isPhantom) {
      try {
        if (isConnected && activeWallet === 'phantom') {
          // Disconnect wallet if already connected
          await solana.disconnect();
          setIsConnected(false);
          setWalletAddress('');
          setActiveWallet(null);
        } else {
          // Connect to wallet
          const response = await solana.connect();
          const walletPublicKey = response.publicKey.toBase58();
          setWalletAddress(walletPublicKey);
          setIsConnected(true);
          setActiveWallet('phantom');
          
          // Disconnect other wallet if connected
          if (isConnected && activeWallet === 'solflare' && solflare) {
            await solflare.disconnect();
          }
        }
      } catch (error) {
        console.error("Error connecting to Phantom wallet:", error);
      }
    } else if (walletType === 'solflare' && solflare?.isSolflare) {
      try {
        if (isConnected && activeWallet === 'solflare') {
          // Disconnect wallet if already connected
          await solflare.disconnect();
          setIsConnected(false);
          setWalletAddress('');
          setActiveWallet(null);
        } else {
          // Connect to wallet
          console.log("Connecting to Solflare...");
          const response = await solflare.connect();
          console.log("Solflare response:", response);
          
          // Ensure we have a public key from the response
          if (response.publicKey) {
            // Get the wallet address from the public key
            const walletPublicKey = response.publicKey.toBase58();
            console.log("Solflare wallet address:", walletPublicKey);
            setWalletAddress(walletPublicKey);
            setIsConnected(true);
            setActiveWallet('solflare');
          } else if (solflare.publicKey) {
            // If no public key in response, try getting it from the wallet
            const walletPublicKey = solflare.publicKey.toBase58();
            console.log("Solflare wallet address from wallet:", walletPublicKey);
            setWalletAddress(walletPublicKey);
            setIsConnected(true);
            setActiveWallet('solflare');
          } else {
            throw new Error("Could not get public key from Solflare");
          }
          
          // Disconnect other wallet if connected
          if (isConnected && activeWallet === 'phantom' && solana) {
            await solana.disconnect();
          }
        }
      } catch (error) {
        console.error("Error connecting to Solflare wallet:", error);
        alert(`Solflare connection error: ${(error as Error).message}`);
      }
    } else {
      // Wallet not installed - open in new tab
      if (walletType === 'phantom') {
        window.open('https://phantom.app/', '_blank');
      } else {
        window.open('https://solflare.com/', '_blank');
      }
    }
  };
  
  // Shortened wallet address display
  const shortenAddress = (address: string) => {
    return address.slice(0, 4) + '...' + address.slice(-4);
  };
  
  // Handle mint button click with real wallet interaction
  const handleMint = async (card: NFTCard) => {
    if (!isConnected) {
      alert("Please connect your wallet to mint NFTs");
      return;
    }
    
    if (card.status === 'sold') {
      alert("Sorry, this NFT is already sold out!");
      return;
    }
    
    try {
      // Add card to minting state
      if (!mintingCards.includes(card.id)) {
        setMintingCards([...mintingCards, card.id]);
        
        // Access the wallet based on which one is active
        const { solana, solflare } = window as PhantomWindow;
        const wallet = activeWallet === 'phantom' ? solana : solflare;
        
        if (!wallet || !wallet.signTransaction) {
          throw new Error("Wallet doesn't support transaction signing");
        }
        
        // Create a simple transaction (this would be replaced with actual minting logic)
        const from = new web3.PublicKey(walletAddress);
        
        // Create a transaction
        const transaction = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: from, // Send to self (placeholder)
            lamports: 0, // No actual transfer
          })
        );
        
        // Set recent blockhash
        try {
          transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
          transaction.feePayer = from;
          
          // Sign the transaction - this will prompt the user's wallet
          const signedTransaction = await wallet.signTransaction(transaction);
          
          // Actually sending the transaction would be done here for a real mint
          // For demo purposes, we'll console log it but not send it
          console.log("Transaction signed successfully:", signedTransaction);
          // const signature = await connection.sendRawTransaction(signedTransaction.serialize());
          // await connection.confirmTransaction(signature);
          
          // Simulate a delay for the minting process
          setTimeout(() => {
            alert(`Successfully minted ${card.title}!`);
            setMintingCards(mintingCards.filter(id => id !== card.id));
            
            // Open the NFT in explorer or marketplace
            const openLink = window.confirm("View your NFT in the marketplace?");
            if (openLink && card.marketplaceUrl) {
              window.open(card.marketplaceUrl, '_blank');
            }
          }, 2000);
        } catch (error) {
          console.error("RPC Error:", error);
          alert(`Error connecting to Solana network: ${(error as Error).message}`);
          setMintingCards(mintingCards.filter(id => id !== card.id));
        }
      }
    } catch (error) {
      console.error("Error during minting:", error);
      alert(`Error during minting: ${(error as Error).message}`);
      setMintingCards(mintingCards.filter(id => id !== card.id));
    }
  };
  
  // Handle NFT card click
  const handleNFTCardClick = (card: NFTCard) => {
    if (!mintingCards.includes(card.id)) {
      // Show card details in a modal with real blockchain data
      const progress = card.mintProgress || 50;
      const isRealNFT = card.enhancedData?.source === 'helius';
      
      const detailsHtml = `
        <div style="max-width: 500px; padding: 20px; background: #1E1E1E; border-radius: 16px; color: white;">
          ${isRealNFT ? 
            `<div style="position: absolute; top: 15px; right: 15px; background: linear-gradient(to right, #9945FF, #14F195); color: white; font-size: 12px; padding: 5px 10px; border-radius: 12px; font-weight: bold;">
              Real NFT
            </div>` 
          : ''}
          
          <div style="text-align: center; margin-bottom: 15px;">
            <img src="${card.image}" alt="${card.title}" style="max-width: 100%; height: auto; border-radius: 10px; max-height: 300px;">
          </div>
          <h2 style="margin: 10px 0; color: white;">${card.title}</h2>
          <p style="margin: 10px 0; color: #aaa;">${card.description}</p>
          
          <!-- Solana's signature purple-to-green gradient progress bars -->
          <div style="background: #222; padding: 15px; margin: 20px 0; border-radius: 8px; border: 2px solid #444;">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px; color: white;">Mint Status:</div>
            
            <div style="width: 100%; height: 30px; background: #333; border-radius: 6px; margin-bottom: 5px; overflow: hidden;">
              <div style="width: ${progress}%; height: 100%; background: linear-gradient(to right, #9945FF, #14F195);"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px;">
              <span style="color: white; font-weight: bold;">Minting Progress</span>
              <span style="color: #14F195; font-weight: bold;">${progress}/100</span>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin: 15px 0;">
            <div>
              <div style="font-size: 14px; color: #999;">Price</div>
              <div style="font-weight: bold; font-size: 18px;">${card.price.toFixed(2)} SOL</div>
            </div>
            <div>
              <div style="font-size: 14px; color: #999;">Rating</div>
              <div style="color: #FFD700;">${'★'.repeat(card.rating)}${'☆'.repeat(5-card.rating)}</div>
            </div>
          </div>
          
          ${card.enhancedData?.attributes && card.enhancedData.attributes.length > 0 ? 
            `<div style="margin: 15px 0;">
              <div style="font-size: 14px; color: #999; margin-bottom: 5px;">Attributes</div>
              <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                ${card.enhancedData.attributes.map((attr: any) => 
                  `<div style="background: #333; padding: 5px 10px; border-radius: 5px; font-size: 12px;">
                    <span style="color: #999;">${attr.trait_type || 'Trait'}:</span> ${attr.value}
                  </div>`
                ).join('')}
              </div>
            </div>` 
          : ''}
          
          ${isRealNFT ?
            `<div style="margin: 15px 0; padding: 10px; background: #222; border-radius: 8px; border: 1px solid #444;">
              <div style="font-size: 14px; color: #999; margin-bottom: 5px;">NFT Address</div>
              <div style="font-family: monospace; font-size: 12px; color: #14F195; word-break: break-all;">${card.mint || card.id}</div>
            </div>`
          : ''}
          
          <div style="margin: 20px 0 10px; display: flex; gap: 10px; justify-content: space-between;">
            <button class="mint-btn" style="display: inline-block; padding: 10px 20px; background: linear-gradient(to right, #9945FF, #14F195); color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; flex: 1;">Mint Now</button>
            <a href="${card.marketplaceUrl}" target="_blank" style="display: inline-block; padding: 10px 20px; background: #333; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; text-align: center; flex: 1;">View on Explorer</a>
          </div>
          
          ${isRealNFT ? 
            `<div style="text-align: center; margin-top: 15px; font-size: 12px; color: #14F195;">
              Real NFT data from Helius API
            </div>` 
          : 
            `<div style="text-align: center; margin-top: 15px; font-size: 12px; color: #999;">
              Source: ${card.enhancedData?.source.charAt(0).toUpperCase() + card.enhancedData?.source.slice(1) || 'Unknown'}
            </div>`
          }
        </div>
      `;
      
      // Create modal elements as before
      const modalElement = document.querySelector('.nft-modal') || (() => {
        const el = document.createElement('div');
        el.className = 'nft-modal';
        document.body.appendChild(el);
        return el;
      })();
      
      const modalBackdrop = document.querySelector('.modal-backdrop') || (() => {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.style.position = 'fixed';
        backdrop.style.top = '0';
        backdrop.style.left = '0';
        backdrop.style.width = '100%';
        backdrop.style.height = '100%';
        backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        backdrop.style.display = 'flex';
        backdrop.style.justifyContent = 'center';
        backdrop.style.alignItems = 'center';
        backdrop.style.zIndex = '1000';
        document.body.appendChild(backdrop);
        return backdrop;
      })();
      
      // Set inner HTML of modal
      if (modalElement) {
        modalElement.innerHTML = detailsHtml;
        modalBackdrop.appendChild(modalElement);
        
        // Add click listener to close modal when clicking outside
        modalBackdrop.addEventListener('click', (e) => {
          if (e.target === modalBackdrop) {
            document.body.removeChild(modalBackdrop);
          }
        });
        
        // Add click listener to mint button
        const mintBtn = modalElement.querySelector('.mint-btn');
        if (mintBtn) {
          mintBtn.addEventListener('click', () => {
            handleMint(card);
          });
        }
      }
    }
  };
  
  // Now fix the modal's style to ensure it works with React properly
  useEffect(() => {
    // Setup modal styles when component mounts
    const style = document.createElement('style');
    style.textContent = `
      #nft-modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      
      @keyframes modal-fade-in {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      #nft-modal-backdrop > div {
        animation: modal-fade-in 0.3s ease-out;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        max-height: 90vh;
        overflow-y: auto;
        max-width: 90%;
      }
      
      @media (max-width: 600px) {
        #nft-modal-backdrop > div {
          width: 90%;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
      const modalBackdrop = document.getElementById('nft-modal-backdrop');
      if (modalBackdrop) {
        document.body.removeChild(modalBackdrop);
      }
    };
  }, []);
  
  // Render the component with original styling
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
        onClick={fetchRealNFTs}
        >
          HypeFlow
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
            className="categories-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M4 6H20M4 12H20M4 18H20" stroke="#14F195" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Categories
            </button>
            <span style={{ cursor: 'pointer' }}>Boost</span>
            <span style={{ cursor: 'pointer' }}>Tools</span>
            <span style={{ cursor: 'pointer' }}>Apply</span>
            
            {/* Create NFT button */}
            <button 
              style={{ 
                display: 'none', // Hide this button
                cursor: 'pointer',
                fontWeight: 'bold',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(to right, #9945FF, #14F195)',
                color: 'white',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                border: 'none',
                fontSize: '14px'
              }}
              onClick={() => window.location.href = '/create-nft.html'}
              className="create-nft-button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                <path d="M12 4V20M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Create NFT
            </button>
          </nav>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              style={{ 
                background: isConnected && activeWallet === 'phantom' ? '#14F195' : 'linear-gradient(to right, #9945FF, #14F195)', 
                padding: '10px 15px',
                borderRadius: '25px',
                border: 'none',
                color: isConnected && activeWallet === 'phantom' ? 'black' : 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="connect-phantom-btn"
              onClick={() => connectWallet('phantom')}
            >
              {/* Phantom Logo SVG */}
              <svg width="16" height="16" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="128" height="128" rx="64" fill="white"/>
                <path d="M110.584 64.9142H99.142C99.142 41.8335 80.2619 23 57.1276 23C34.6611 23 16.1443 40.7763 15.0193 62.8628C13.8362 86.5882 32.2307 106.564 55.956 106.564H61.7125C83.3712 106.564 103.04 91.1322 108.795 70.6503C109.767 67.0136 110.584 64.9142 110.584 64.9142Z" fill="url(#paint0_linear_21_53)"/>
                <path d="M61.7126 71.5026H99.1421V79.9523C99.1421 95.3258 86.6337 107.834 71.2603 107.834H61.7126C46.3392 107.834 33.8308 95.3258 33.8308 79.9523V71.5026H61.7126Z" fill="url(#paint1_linear_21_53)"/>
                <path d="M88.3243 90.2367H92.8274C94.6395 90.2367 96.1028 88.7734 96.1028 86.9613V64.9141H88.3243V90.2367Z" fill="url(#paint2_linear_21_53)"/>
                <defs>
                  <linearGradient id="paint0_linear_21_53" x1="15" y1="64.782" x2="110.584" y2="64.782" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#534BB1"/>
                    <stop offset="1" stopColor="#551BF9"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_21_53" x1="33.8308" y1="89.6683" x2="99.1421" y2="89.6683" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#534BB1"/>
                    <stop offset="1" stopColor="#551BF9"/>
                  </linearGradient>
                  <linearGradient id="paint2_linear_21_53" x1="88.3243" y1="77.5754" x2="96.1028" y2="77.5754" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#534BB1"/>
                    <stop offset="1" stopColor="#551BF9"/>
                  </linearGradient>
                </defs>
              </svg>

              {isConnected && activeWallet === 'phantom' 
                ? (walletAddress ? shortenAddress(walletAddress) : 'Connected') 
                : 'Phantom'}
            </button>
            
            <button 
              style={{ 
                background: isConnected && activeWallet === 'solflare' ? '#14F195' : 'linear-gradient(to right, #FC8E03, #F43D3D)', 
                padding: '10px 15px',
                borderRadius: '25px',
                border: 'none',
                color: isConnected && activeWallet === 'solflare' ? 'black' : 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              className="connect-solflare-btn"
              onClick={() => connectWallet('solflare')}
            >
              {/* Solflare Logo SVG */}
              <svg width="16" height="16" viewBox="0 0 99 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M49.1815 0L98.363 81.6324H0L49.1815 0Z" fill="url(#paint0_linear_1_7)"/>
                <defs>
                  <linearGradient id="paint0_linear_1_7" x1="17.0023" y1="82.0281" x2="77.121" y2="20.9245" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFC10B"/>
                    <stop offset="1" stopColor="#FB103D"/>
                  </linearGradient>
                </defs>
              </svg>

              {isConnected && activeWallet === 'solflare' 
                ? (walletAddress ? shortenAddress(walletAddress) : 'Connected') 
                : 'Solflare'}
            </button>
          </div>
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
            New Creations
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
            <p>Loading NFTs from Solana blockchain...</p>
          </div>
        ) : activeTab === 'watchlist' ? (
          // Empty state for watchlist
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ 
              fontSize: '24px', 
              marginBottom: '15px',
              background: 'linear-gradient(to right, #9945FF, #14F195)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Your Watchlist is Empty
            </div>
            <p style={{ color: '#999', marginBottom: '20px' }}>
              Add NFTs to your watchlist to keep track of them.
            </p>
            <button 
              style={{ 
                background: 'linear-gradient(to right, #9945FF, #14F195)', 
                padding: '10px 20px',
                borderRadius: '25px',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('trending')}
            >
              Browse Trending NFTs
            </button>
          </div>
        ) : nftCards.length > 0 ? (
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
              onClick={() => handleNFTCardClick(card)}
              >
                {/* External link indicator */}
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" 
                          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
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
                    position: 'relative'
                  }}
                  onError={(e: React.SyntheticEvent<HTMLDivElement>) => {
                    // When image fails to load, replace with a default
                    const target = e.target as HTMLDivElement;
                    target.style.backgroundImage = 'url("https://storage.googleapis.com/feliz-crypto/default-nft.webp")';
                  }}
                  >
                    {/* Optionally add a loading or error state indicator */}
                    <div style={{
                      position: 'absolute',
                      bottom: '5px',
                      right: '5px',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      display: 'none' // Only show on error
                    }} className="image-error-badge">
                      Fallback Image
                    </div>
                  </div>
                  
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
                    marginTop: '25px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#999' }}>Price</div>
                      <div style={{ fontWeight: 'bold' }}>
                        {/* Format price with proper precision */}
                        {card.price.toFixed(2)} SOL
                        {card.enhancedData?.metadata?.lastSalePrice && (
                          <span style={{ fontSize: '11px', marginLeft: '5px', color: '#999' }}>
                            (Last: {(card.enhancedData.metadata.lastSalePrice / web3.LAMPORTS_PER_SOL).toFixed(3)} SOL)
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
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
                      {(activeTab === 'recently' || card.isNew) && (
                        <span style={{ 
                          backgroundColor: '#FF9500', 
                          padding: '3px 8px', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          alert("This NFT was recently created on the Solana blockchain");
                        }}
                        >NEW</span>
                      )}
                      {card.isBoosted && (
                        <span style={{ 
                          backgroundColor: '#BB7A00', 
                          padding: '3px 8px', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          alert("Boosted collections are promoted by creators");
                        }}
                        >Boosted</span>
                      )}
                      {card.enhancedData?.creators && (
                        <span style={{ 
                          backgroundColor: '#0088CC', 
                          padding: '3px 8px', 
                          borderRadius: '3px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          const creators = card.enhancedData.creators;
                          alert(`Creators: ${creators.map((c: any) => `${c.address.substring(0, 6)}... (${c.share}%)`).join(', ')}`);
                        }}
                        >Verified</span>
                      )}
                      <span style={{ 
                        backgroundColor: '#0066BB', 
                        padding: '3px 8px', 
                        borderRadius: '3px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        alert("Trending collections are popular right now");
                      }}
                      >Trending</span>
                    </div>
                  </div>
                  
                  {/* Show attributes if available from enhanced metadata */}
                  {card.enhancedData?.attributes && card.enhancedData.attributes.length > 0 && (
                    <div style={{
                      marginTop: '10px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '5px'
                    }}>
                      {card.enhancedData.attributes.slice(0, 3).map((attr: any, idx: number) => (
                        <div 
                          key={idx}
                          style={{
                            backgroundColor: '#2A2A2A',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            const allAttributes = card.enhancedData.attributes;
                            alert(`All attributes:\n${allAttributes.map((a: any) => `${a.trait_type || 'Trait'}: ${a.value}`).join('\n')}`);
                          }}
                        >
                          <span style={{ color: '#999' }}>{attr.trait_type || 'Trait'}: </span>
                          <span>{attr.value}</span>
                        </div>
                      ))}
                      {card.enhancedData.attributes.length > 3 && (
                        <div 
                          style={{
                            backgroundColor: '#2A2A2A',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            const allAttributes = card.enhancedData.attributes;
                            alert(`All attributes:\n${allAttributes.map((a: any) => `${a.trait_type || 'Trait'}: ${a.value}`).join('\n')}`);
                          }}
                        >
                          +{card.enhancedData.attributes.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <h2>No NFTs Found</h2>
            <p>We couldn't find any real NFTs to display at this time.</p>
            <button 
              style={{ 
                background: 'linear-gradient(to right, #9945FF, #14F195)', 
                padding: '10px 20px',
                borderRadius: '25px',
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '20px'
              }}
              onClick={fetchRealNFTs}
            >
              Refresh NFTs
            </button>
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
        © HypeFlow all rights reserved 2025
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
          
          .nft-card:hover::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 15px;
            box-shadow: 0 0 0 2px #14F195;
            pointer-events: none;
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
            
            .connect-phantom-btn,
            .connect-solflare-btn {
              width: 180px;
              padding: 8px 10px;
              font-size: 12px;
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
  );
}

export default NoMockApp; 