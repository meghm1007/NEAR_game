// Deployment and Setup Script for Higher Lower Game
// This script helps with NEAR contract deployment and configuration

const fs = require('fs');
const path = require('path');

console.log('🚀 Higher Lower Game - NEAR Deployment Helper\n');

// Configuration
const CONFIG = {
    testnet: {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://testnet.mynearwallet.com/',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://testnet.nearblocks.io',
    },
    mainnet: {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://app.mynearwallet.com/',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://nearblocks.io',
    }
};

function displayWelcomeMessage() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    NEAR INTEGRATION SETUP                   ║
║                                                              ║
║  🎮 Higher Lower Game - Blockchain Edition                   ║
║  💰 Stake NEAR tokens and earn rewards!                     ║
╚══════════════════════════════════════════════════════════════╝

📋 SETUP CHECKLIST:

1. ✅ Dependencies installed (npm install completed)
2. ⏳ NEAR CLI setup needed
3. ⏳ Testnet account creation needed
4. ⏳ Contract deployment needed
5. ⏳ Frontend configuration needed

Let's get started!
`);
}

function displayNearCliSetup() {
    console.log(`
🔧 STEP 1: Install NEAR CLI

Run these commands in your terminal:

    npm install -g near-cli
    near --version

If successful, you should see the NEAR CLI version number.
`);
}

function displayAccountSetup() {
    console.log(`
👤 STEP 2: Create NEAR Testnet Account

1. Visit: https://testnet.mynearwallet.com/
2. Click "Create Account"
3. Choose a memorable account name (e.g., yourname.testnet)
4. Complete the setup process
5. Save your seed phrase securely!

6. Get testnet tokens:
   - Visit: https://near-faucet.io/
   - Enter your account name
   - Request tokens (you'll get 200 testnet NEAR)
`);
}

function displayContractDeployment() {
    console.log(`
📦 STEP 3: Deploy Smart Contract

Method 1 - Using existing deployed contract (RECOMMENDED FOR TESTING):
   - Update CONTRACT_ID in near-integration.js to: 'demo-higher-lower.testnet'
   - Skip to Step 4

Method 2 - Deploy your own contract:

1. Login to NEAR CLI:
   near login

2. Create contract subaccount:
   near create-account higher-lower-game.YOUR_ACCOUNT.testnet --masterAccount YOUR_ACCOUNT.testnet --initialBalance 10

3. Deploy contract (this requires building the contract first):
   # This step needs additional setup for contract compilation
   # For now, use the demo contract above

🔍 CONTRACT FEATURES:
   - Minimum stake: 1 NEAR
   - Maximum stake: 10 NEAR  
   - Developer fee: 5%
   - Reward: 10% bonus per correct answer
`);
}

function displayFrontendConfig() {
    console.log(`
⚙️ STEP 4: Configure Frontend

Update near-integration.js with your contract details:

const CONTRACT_ID = 'your-contract-name.testnet'; // or 'demo-higher-lower.testnet'

That's it! The configuration is already set for testnet.
`);
}

function displayTestingInstructions() {
    console.log(`
🧪 STEP 5: Testing Your Setup

1. Start a local server:
   python -m http.server 8000
   # Or use any static file server

2. Open http://localhost:8000 in your browser

3. Test the game:
   ✅ Click "Play Demo" - should work without wallet
   ✅ Click "Connect Wallet" - should prompt for NEAR wallet login
   ✅ Try a blockchain game with 1 NEAR stake
   ✅ Check the stats panel for your player data

4. Monitor transactions:
   - View on NEAR Explorer: https://testnet.nearblocks.io/
   - Search for your account or contract address
`);
}

function displayMonetizationTips() {
    console.log(`
💰 MONETIZATION STRATEGIES:

For Players:
- Start with 1 NEAR stakes to learn the game
- Practice in demo mode first
- Higher stakes = higher potential rewards
- Each correct answer adds 10% of stake to winnings

For Developers:
- 5% of all winnings automatically collected
- Call withdrawFees() method to claim revenue
- Revenue scales with player activity
- Consider marketing to drive more players

Example Revenue Calculation:
- 100 players per day
- Average stake: 3 NEAR
- Average score: 2 correct answers
- Daily volume: 300 NEAR
- Daily revenue (5%): 15 NEAR
- Monthly revenue: ~450 NEAR ($1,800+ at $4/NEAR)
`);
}

function displaySecurityNotes() {
    console.log(`
🔒 SECURITY CONSIDERATIONS:

✅ Smart Contract Security:
   - All game logic runs on-chain
   - Automatic payout system
   - No manual intervention needed
   - Gas fees handled automatically

⚠️ Important Notes:
   - Test thoroughly on testnet first
   - Keep contract simple and audited
   - Monitor for unusual activity
   - Have emergency pause mechanisms

🌐 Moving to Mainnet:
   - Change networkId to 'mainnet' in near-integration.js
   - Deploy contract to mainnet (costs ~5 NEAR)
   - Update all URLs to mainnet endpoints
   - Fund contract account for operations
`);
}

function displayTroubleshooting() {
    console.log(`
🚨 TROUBLESHOOTING:

Common Issues:

1. "Wallet connection failed"
   - Check browser console for errors
   - Ensure you're on testnet
   - Try refreshing the page

2. "Contract not found"
   - Verify CONTRACT_ID in near-integration.js
   - Check if contract is deployed
   - Try using demo contract first

3. "Transaction failed"
   - Check account balance
   - Ensure sufficient gas fees
   - Try smaller stake amounts

4. "Game not loading"
   - Check all dependencies are installed
   - Verify server is running
   - Check browser console for errors

Need Help?
- NEAR Discord: https://near.chat
- NEAR Documentation: https://docs.near.org
- GitHub Issues: Create an issue in your repository
`);
}

function main() {
    displayWelcomeMessage();
    
    console.log('Press Enter to continue through each step...\n');
    
    // In a real script, you'd wait for user input
    // For now, just display all steps
    
    displayNearCliSetup();
    displayAccountSetup();
    displayContractDeployment();
    displayFrontendConfig();
    displayTestingInstructions();
    displayMonetizationTips();
    displaySecurityNotes();
    displayTroubleshooting();
    
    console.log(`
🎉 CONGRATULATIONS!

Your NEAR-powered Higher Lower Game is ready!

Next Steps:
1. Complete the setup steps above
2. Test thoroughly on testnet
3. Share with friends to test multiplayer
4. Consider mainnet deployment when ready
5. Start earning from your blockchain game!

Happy coding and earning! 🚀💰

═══════════════════════════════════════════════════════════════
              Built with ❤️ using NEAR Protocol
═══════════════════════════════════════════════════════════════
`);
}

// Run the deployment helper
main(); 