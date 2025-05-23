
```bash
npm install
```

```bash
# If you have a local server
python -m http.server 8000
# Or use any static file server
```

3. **Open in Browser**
Navigate to `http://localhost:8000`




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

