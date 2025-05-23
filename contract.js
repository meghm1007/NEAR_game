// NEAR Smart Contract for Higher Lower Game
// This contract handles game sessions, staking, and rewards

import { NearBindgen, near, call, view, initialize, assert, UnorderedMap, Vector } from 'near-sdk-js';

@NearBindgen({})
export class HigherLowerGame {
    constructor() {
        // Initialize storage collections
        this.gameInstances = new UnorderedMap('games');
        this.playerStats = new UnorderedMap('stats');
        this.leaderboard = new Vector('leaderboard');
        
        // Game configuration
        this.minStake = '1000000000000000000000000'; // 1 NEAR in yoctoNEAR
        this.maxStake = '10000000000000000000000000'; // 10 NEAR in yoctoNEAR
        this.developerFeePercent = 5; // 5% goes to developer
        this.contractOwner = near.predecessorAccountId();
    }

    // Initialize the contract (called once during deployment)
    @initialize({})
    init() {
        this.contractOwner = near.predecessorAccountId();
    }

    // Start a new game session with a stake
    @call({ payableFunction: true })
    startGame({ gameId }) {
        const playerId = near.predecessorAccountId();
        const stake = near.attachedDeposit();
        
        // Validate stake amount
        assert(
            BigInt(stake) >= BigInt(this.minStake), 
            `Minimum stake is ${this.minStake} yoctoNEAR (1 NEAR)`
        );
        assert(
            BigInt(stake) <= BigInt(this.maxStake),
            `Maximum stake is ${this.maxStake} yoctoNEAR (10 NEAR)`
        );

        // Create game instance
        const gameData = {
            playerId,
            stake,
            score: 0,
            isActive: true,
            startTime: near.blockTimestamp(),
            currentRound: 1
        };

        this.gameInstances.set(gameId, gameData);
        
        near.log(`Game ${gameId} started by ${playerId} with stake ${stake}`);
        return gameId;
    }

    // Submit a correct answer to continue the game
    @call({})
    submitCorrectAnswer({ gameId }) {
        const playerId = near.predecessorAccountId();
        const gameData = this.gameInstances.get(gameId);
        
        assert(gameData, 'Game not found');
        assert(gameData.playerId === playerId, 'You are not the player of this game');
        assert(gameData.isActive, 'Game is not active');

        // Increment score and round
        gameData.score += 1;
        gameData.currentRound += 1;
        
        this.gameInstances.set(gameId, gameData);
        
        near.log(`Player ${playerId} scored in game ${gameId}. New score: ${gameData.score}`);
        return gameData.score;
    }

    // End game and distribute rewards
    @call({})
    endGame({ gameId }) {
        const playerId = near.predecessorAccountId();
        const gameData = this.gameInstances.get(gameId);
        
        assert(gameData, 'Game not found');
        assert(gameData.playerId === playerId, 'You are not the player of this game');
        assert(gameData.isActive, 'Game is already ended');

        // Mark game as inactive
        gameData.isActive = false;
        gameData.endTime = near.blockTimestamp();
        this.gameInstances.set(gameId, gameData);

        // Calculate rewards based on score
        let reward = BigInt(0);
        const stake = BigInt(gameData.stake);
        
        if (gameData.score > 0) {
            // Reward = stake + (stake * score * 0.1) - developer fee
            const bonus = stake * BigInt(gameData.score) * BigInt(10) / BigInt(100); // 10% per correct answer
            const totalReward = stake + bonus;
            const developerFee = totalReward * BigInt(this.developerFeePercent) / BigInt(100);
            reward = totalReward - developerFee;
            
            // Transfer reward to player
            if (reward > BigInt(0)) {
                near.promiseBatchCreate(playerId);
                near.promiseBatchActionTransfer(near.currentAccountId(), reward.toString());
            }
            
            // Update player stats
            this.updatePlayerStats(playerId, gameData.score, reward.toString());
            
            near.log(`Game ${gameId} ended. Player ${playerId} earned ${reward} yoctoNEAR`);
        } else {
            near.log(`Game ${gameId} ended. Player ${playerId} lost their stake.`);
        }

        return {
            score: gameData.score,
            reward: reward.toString(),
            finalStake: gameData.stake
        };
    }

    // Update player statistics
    updatePlayerStats(playerId, score, reward) {
        let stats = this.playerStats.get(playerId);
        if (!stats) {
            stats = {
                gamesPlayed: 0,
                totalScore: 0,
                highestScore: 0,
                totalEarnings: '0'
            };
        }

        stats.gamesPlayed += 1;
        stats.totalScore += score;
        stats.highestScore = Math.max(stats.highestScore, score);
        stats.totalEarnings = (BigInt(stats.totalEarnings) + BigInt(reward)).toString();

        this.playerStats.set(playerId, stats);
        
        // Update leaderboard
        this.updateLeaderboard(playerId, stats);
    }

    // Update leaderboard with player's best score
    updateLeaderboard(playerId, stats) {
        // Simple leaderboard implementation
        const leaderboardEntry = {
            playerId,
            highestScore: stats.highestScore,
            totalEarnings: stats.totalEarnings
        };

        // For simplicity, we'll maintain top 10 players
        // In a real implementation, you'd want a more efficient data structure
        this.leaderboard.push(leaderboardEntry);
    }

    // View functions (read-only, no gas cost)
    
    @view({})
    getGame({ gameId }) {
        return this.gameInstances.get(gameId);
    }

    @view({})
    getPlayerStats({ playerId }) {
        return this.playerStats.get(playerId) || {
            gamesPlayed: 0,
            totalScore: 0,
            highestScore: 0,
            totalEarnings: '0'
        };
    }

    @view({})
    getLeaderboard() {
        const allEntries = [];
        for (let i = 0; i < this.leaderboard.length; i++) {
            allEntries.push(this.leaderboard.get(i));
        }
        
        // Sort by highest score, then by total earnings
        allEntries.sort((a, b) => {
            if (b.highestScore !== a.highestScore) {
                return b.highestScore - a.highestScore;
            }
            return BigInt(b.totalEarnings) > BigInt(a.totalEarnings) ? 1 : -1;
        });

        return allEntries.slice(0, 10); // Top 10
    }

    @view({})
    getGameConfig() {
        return {
            minStake: this.minStake,
            maxStake: this.maxStake,
            developerFeePercent: this.developerFeePercent
        };
    }

    // Developer functions
    @call({})
    withdrawFees() {
        assert(
            near.predecessorAccountId() === this.contractOwner,
            'Only contract owner can withdraw fees'
        );
        
        const balance = near.accountBalance();
        const availableBalance = BigInt(balance) - BigInt('1000000000000000000000000'); // Keep 1 NEAR for contract operations
        
        if (availableBalance > BigInt(0)) {
            near.promiseBatchCreate(this.contractOwner);
            near.promiseBatchActionTransfer(near.currentAccountId(), availableBalance.toString());
        }
    }
} 