// NEAR Integration Module for Higher Lower Game
// This handles wallet connection, contract calls, and blockchain interactions

import { connect, keyStores, WalletConnection, utils, Contract } from 'near-api-js';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupModal } from '@near-wallet-selector/modal-ui';

// NEAR Configuration for Testnet
const CONTRACT_ID = 'guest-book.testnet'; // Using existing demo contract for testing
const NETWORK_ID = 'testnet';

const config = {
    networkId: NETWORK_ID,
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://testnet.mynearwallet.com/',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://testnet.nearblocks.io',
};

class NearGameIntegration {
    constructor() {
        this.near = null;
        this.wallet = null;
        this.contract = null;
        this.accountId = null;
        this.currentGameId = null;
        this.isConnected = false;
        
        // Game state
        this.gameStake = '0';
        this.currentScore = 0;
        this.gameActive = false;
        
        // Event callbacks
        this.onWalletConnected = null;
        this.onWalletDisconnected = null;
        this.onGameStarted = null;
        this.onScoreUpdated = null;
        this.onGameEnded = null;
    }

    // Initialize NEAR connection and wallet
    async init() {
        try {
            console.log('Initializing NEAR connection...');
            
            // Connect to NEAR
            this.near = await connect(config);
            
            // Initialize wallet connection
            this.wallet = new WalletConnection(this.near, 'higher-lower-game');
            
            // Check if user is signed in
            if (this.wallet.isSignedIn()) {
                this.accountId = this.wallet.getAccountId();
                this.isConnected = true;
                console.log(`Connected as: ${this.accountId}`);
                
                // Initialize contract
                this.contract = new Contract(
                    this.wallet.account(), // Use wallet account
                    CONTRACT_ID,
                    {
                        viewMethods: [
                            'getGame',
                            'getPlayerStats', 
                            'getLeaderboard',
                            'getGameConfig'
                        ],
                        changeMethods: [
                            'startGame',
                            'submitCorrectAnswer',
                            'endGame'
                        ]
                    }
                );

                if (this.onWalletConnected) {
                    this.onWalletConnected(this.accountId);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize NEAR:', error);
            return false;
        }
    }

    // Connect wallet using wallet selector
    async connectWallet() {
        try {
            if (this.wallet && !this.wallet.isSignedIn()) {
                // Request sign in without contract requirement for initial connection
                this.wallet.requestSignIn({
                    // Remove contractId requirement to allow connection without deployed contract
                    // contractId: CONTRACT_ID,
                    // methodNames: ['startGame', 'submitCorrectAnswer', 'endGame']
                });
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        try {
            if (this.wallet && this.wallet.isSignedIn()) {
                this.wallet.signOut();
                this.accountId = null;
                this.isConnected = false;
                this.contract = null;
                
                if (this.onWalletDisconnected) {
                    this.onWalletDisconnected();
                }
                
                // Reload page to clear state
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        }
    }

    // Start a new game with stake
    async startGame(stakeInNear) {
        try {
            if (!this.isConnected) {
                throw new Error('Wallet not connected');
            }

            // Convert NEAR to yoctoNEAR
            const stake = utils.format.parseNearAmount(stakeInNear.toString());
            this.gameStake = stake;
            
            // Generate unique game ID
            this.currentGameId = `game_${this.accountId}_${Date.now()}`;
            
            console.log(`Starting game with stake: ${stakeInNear} NEAR (${stake} yoctoNEAR)`);
            
            // Call contract to start game
            const result = await this.contract.startGame(
                { gameId: this.currentGameId },
                300000000000000, // Gas limit (300 TGas)
                stake // Attached deposit
            );
            
            this.gameActive = true;
            this.currentScore = 0;
            
            console.log('Game started successfully:', result);
            
            if (this.onGameStarted) {
                this.onGameStarted(this.currentGameId, stakeInNear);
            }
            
            return this.currentGameId;
            
        } catch (error) {
            console.error('Failed to start game:', error);
            throw error;
        }
    }

    // Submit correct answer to blockchain
    async submitCorrectAnswer() {
        try {
            if (!this.gameActive || !this.currentGameId) {
                throw new Error('No active game');
            }

            console.log(`Submitting correct answer for game: ${this.currentGameId}`);
            
            const result = await this.contract.submitCorrectAnswer(
                { gameId: this.currentGameId },
                100000000000000 // Gas limit (100 TGas)
            );
            
            this.currentScore = result;
            console.log(`Score updated: ${this.currentScore}`);
            
            if (this.onScoreUpdated) {
                this.onScoreUpdated(this.currentScore);
            }
            
            return result;
            
        } catch (error) {
            console.error('Failed to submit correct answer:', error);
            throw error;
        }
    }

    // End game and get rewards
    async endGame() {
        try {
            if (!this.gameActive || !this.currentGameId) {
                throw new Error('No active game');
            }

            console.log(`Ending game: ${this.currentGameId}`);
            
            const result = await this.contract.endGame(
                { gameId: this.currentGameId },
                200000000000000 // Gas limit (200 TGas)
            );
            
            this.gameActive = false;
            const finalScore = result.score;
            const reward = result.reward;
            const rewardInNear = utils.format.formatNearAmount(reward);
            
            console.log(`Game ended. Score: ${finalScore}, Reward: ${rewardInNear} NEAR`);
            
            if (this.onGameEnded) {
                this.onGameEnded(finalScore, rewardInNear);
            }
            
            return {
                score: finalScore,
                reward: rewardInNear
            };
            
        } catch (error) {
            console.error('Failed to end game:', error);
            throw error;
        }
    }

    // Get player statistics
    async getPlayerStats(playerId = null) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const accountId = playerId || this.accountId;
            const stats = await this.contract.getPlayerStats({ playerId: accountId });
            
            // Convert earnings from yoctoNEAR to NEAR
            const earningsInNear = utils.format.formatNearAmount(stats.totalEarnings);
            
            return {
                ...stats,
                totalEarningsNear: earningsInNear
            };
            
        } catch (error) {
            console.error('Failed to get player stats:', error);
            return null;
        }
    }

    // Get leaderboard
    async getLeaderboard() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const leaderboard = await this.contract.getLeaderboard();
            
            // Convert earnings from yoctoNEAR to NEAR for display
            return leaderboard.map(entry => ({
                ...entry,
                totalEarningsNear: utils.format.formatNearAmount(entry.totalEarnings)
            }));
            
        } catch (error) {
            console.error('Failed to get leaderboard:', error);
            return [];
        }
    }

    // Get game configuration
    async getGameConfig() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const config = await this.contract.getGameConfig();
            
            return {
                minStakeNear: utils.format.formatNearAmount(config.minStake),
                maxStakeNear: utils.format.formatNearAmount(config.maxStake),
                developerFeePercent: config.developerFeePercent
            };
            
        } catch (error) {
            console.error('Failed to get game config:', error);
            return null;
        }
    }

    // Get account balance
    async getBalance() {
        try {
            if (!this.isConnected) {
                return '0';
            }

            const account = await this.near.account(this.accountId);
            const balance = await account.getAccountBalance();
            return utils.format.formatNearAmount(balance.available);
            
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    }

    // Utility function to convert NEAR to yoctoNEAR
    nearToYocto(nearAmount) {
        return utils.format.parseNearAmount(nearAmount.toString());
    }

    // Utility function to convert yoctoNEAR to NEAR
    yoctoToNear(yoctoAmount) {
        return utils.format.formatNearAmount(yoctoAmount);
    }

    // Check if wallet is connected
    isWalletConnected() {
        return this.isConnected;
    }

    // Get connected account ID
    getAccountId() {
        return this.accountId;
    }

    // Get current game ID
    getCurrentGameId() {
        return this.currentGameId;
    }

    // Check if game is active
    isGameActive() {
        return this.gameActive;
    }

    // Get current score
    getCurrentScore() {
        return this.currentScore;
    }

    // Set event handlers
    setEventHandlers({
        onWalletConnected = null,
        onWalletDisconnected = null,
        onGameStarted = null,
        onScoreUpdated = null,
        onGameEnded = null
    }) {
        this.onWalletConnected = onWalletConnected;
        this.onWalletDisconnected = onWalletDisconnected;
        this.onGameStarted = onGameStarted;
        this.onScoreUpdated = onScoreUpdated;
        this.onGameEnded = onGameEnded;
    }
}

// Export the integration class
export default NearGameIntegration; 