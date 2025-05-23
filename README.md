# Higher Lower Game - NEAR Blockchain Edition

A blockchain-powered guessing game built with Three.js and NEAR Protocol. Players can stake NEAR tokens on their ability to guess whether popularity values are higher or lower.

## 🎮 Game Features

- **Beautiful 3D Interface**: Built with Three.js for smooth 3D card animations
- **Blockchain Integration**: Stake real NEAR tokens on your guesses
- **Multiple Game Modes**: Play demo mode for free or blockchain mode with stakes
- **Smart Rewards System**: Earn 10% bonus per correct answer
- **Developer Revenue**: Automatic 5% fee collection for the developer
- **Player Statistics**: Track your games, high scores, and total earnings
- **Global Leaderboard**: Compete with other players worldwide
- **Testnet Ready**: Start with NEAR testnet before going to mainnet

## 💰 How Players Make Money

1. **Stake NEAR tokens** (1-10 NEAR) when starting a game
2. **Earn bonuses** - Get 10% of your stake for each correct answer
3. **Keep your winnings** - If you guess correctly, you get your stake back plus bonuses
4. **Risk/Reward** - Guess wrong and lose your stake

### Example:
- Stake: 5 NEAR
- Correct answers: 3
- Total reward: 5 NEAR + (5 × 3 × 0.1) = 6.5 NEAR
- Developer fee (5%): 0.325 NEAR
- Player receives: 6.175 NEAR

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- NEAR Testnet Account ([create one here](https://testnet.mynearwallet.com/))
- Some testnet NEAR tokens ([get them from faucet](https://near-faucet.io/))

### Installation

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Start Local Development Server**
```bash
# If you have a local server
python -m http.server 8000
# Or use any static file server
```

3. **Open in Browser**
Navigate to `http://localhost:8000`

## 📦 Project Structure

```
higher_lower/
├── index.html          # Main HTML with NEAR wallet interface
├── main.js             # Game logic + NEAR integration
├── near-integration.js # NEAR Protocol wrapper
├── contract.js         # Smart contract code
├── style.css          # Styling for game and wallet UI
├── package.json       # Dependencies
└── README.md          # This file
```

## 🔧 NEAR Smart Contract Deployment

### Step 1: Set Up NEAR CLI

```bash
npm install -g near-cli
```

### Step 2: Login to NEAR

```bash
near login
```

### Step 3: Create Contract Account

```bash
# Replace YOUR_ACCOUNT with your actual account
near create-account higher-lower-game.YOUR_ACCOUNT.testnet --masterAccount YOUR_ACCOUNT.testnet --initialBalance 10
```

### Step 4: Deploy Smart Contract

For this tutorial, we'll create a simplified contract deployment process:

1. **Create a new JavaScript project for the contract:**
```bash
mkdir near-contract
cd near-contract
npm init -y
npm install near-sdk-js
```

2. **Copy the contract.js content into the contract directory**

3. **Build and deploy the contract:**
```bash
# This would typically involve more steps in a real deployment
# For now, use the contract ID: higher-lower-game.testnet
```

### Step 5: Update Contract ID

In `near-integration.js`, update the CONTRACT_ID:
```javascript
const CONTRACT_ID = 'your-contract-name.testnet';
```

## 🎯 How to Play

### Demo Mode (Free)
1. Click "Play Demo (No Stakes)"
2. Guess whether the second item has higher or lower popularity
3. Score points with no financial risk

### Blockchain Mode (Real Stakes)
1. Click "Connect Wallet" and sign in with NEAR wallet
2. Choose your stake amount (1-10 NEAR)
3. Click "Start Blockchain Game"
4. Make guesses - each correct answer increases your potential reward
5. Game ends on first wrong answer or timeout
6. Receive rewards automatically to your wallet

## 💸 Revenue Models

### For Players
- **Conservative Strategy**: Start with 1 NEAR stakes, build up winnings gradually
- **Aggressive Strategy**: Use higher stakes for bigger potential rewards
- **Practice First**: Use demo mode to understand game mechanics

### For Developers
- **Automatic Revenue**: 5% of all winnings goes to contract owner
- **Withdrawal Function**: Contract owner can withdraw accumulated fees
- **Scalable**: Revenue grows with player activity

### Revenue Potential Examples

**Player with 10 correct answers at 5 NEAR stake:**
- Base stake: 5 NEAR
- Bonuses: 5 NEAR (10 × 5 × 0.1)
- Total before fees: 10 NEAR
- Developer fee: 0.5 NEAR (5%)
- Player gets: 9.5 NEAR
- **Player profit: 4.5 NEAR**

## 🛠️ Development Customization

### Adding New Items
Edit the `ITEMS` array in `main.js`:
```javascript
const ITEMS = [
    { name: "Your New Item" },
    // ... more items
];
```

### Changing Stake Limits
Update in `contract.js`:
```javascript
this.minStake = '1000000000000000000000000'; // 1 NEAR
this.maxStake = '10000000000000000000000000'; // 10 NEAR
```

### Modifying Reward Structure
In `contract.js`, change the bonus calculation:
```javascript
const bonus = stake * BigInt(gameData.score) * BigInt(10) / BigInt(100); // 10% per answer
```

### Adjusting Developer Fee
```javascript
this.developerFeePercent = 5; // 5%
```

## 🔐 Security Features

- **Smart Contract Validation**: All game logic runs on-chain
- **Automatic Payouts**: Rewards are transferred automatically
- **Gas Optimization**: Efficient contract methods to minimize fees
- **Error Handling**: Comprehensive error handling for failed transactions

## 🌍 Deployment to Mainnet

1. **Test Thoroughly**: Ensure everything works on testnet
2. **Update Configuration**: Change network from testnet to mainnet
3. **Deploy Contract**: Deploy to mainnet (costs ~5 NEAR)
4. **Fund Contract**: Add initial balance for contract operations
5. **Update Frontend**: Point to mainnet contract ID

### Mainnet Configuration Changes

In `near-integration.js`:
```javascript
const NETWORK_ID = 'mainnet';
const config = {
    networkId: 'mainnet',
    nodeUrl: 'https://rpc.mainnet.near.org',
    walletUrl: 'https://app.mynearwallet.com/',
    helperUrl: 'https://helper.mainnet.near.org',
    explorerUrl: 'https://nearblocks.io',
};
```

## 📊 Analytics and Monitoring

The smart contract provides these view methods for analytics:
- `getLeaderboard()`: Top 10 players
- `getPlayerStats(playerId)`: Individual player statistics  
- `getGameConfig()`: Current game settings

## ❓ Troubleshooting

### Common Issues

**Wallet Connection Failed**
- Ensure you're using a supported browser
- Check that you have a NEAR testnet account
- Try refreshing the page

**Transaction Failed**
- Check your account balance
- Ensure you have enough NEAR for gas fees
- Try reducing stake amount

**Contract Not Found**
- Verify the CONTRACT_ID in near-integration.js
- Ensure the contract is deployed to the specified account

### Getting Help

1. Check browser console for error messages
2. Verify network connectivity
3. Ensure correct contract deployment
4. Test with smaller stake amounts first

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔗 Useful Links

- [NEAR Documentation](https://docs.near.org/)
- [NEAR Testnet Wallet](https://testnet.mynearwallet.com/)
- [NEAR Faucet](https://near-faucet.io/)
- [Three.js Documentation](https://threejs.org/docs/)
- [NEAR Explorer Testnet](https://testnet.nearblocks.io/)

---

**Ready to start earning with blockchain gaming? Connect your wallet and start playing!** 🎮💰 