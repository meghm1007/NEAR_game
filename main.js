import * as THREE from 'three';
import { Text } from 'troika-three-text';
import NearGameIntegration from './near-integration.js';

const ITEMS = [
    { name: "Streaming Movies" }, { name: "Cinema Tickets" },
    { name: "Reading Books" }, { name: "Video Games" },
    { name: "Home Cooking" }, { name: "Restaurant Dining" },
    { name: "Cat Adoptions" }, { name: "Dog Adoptions" },
    { name: "Coffee Consumption" }, { name: "Tea Consumption" },
    { name: "Smartphone Sales" }, { name: "Laptop Sales" },
    { name: "Summer Holidays" }, { name: "Winter Holidays" },
    { name: "Pizza Orders" }, { name: "Burger Orders" }
];

const CARD_WIDTH = 3.5;
const CARD_HEIGHT = 5;
const CARD_DEPTH = 0.2;
const CARD_SPACING = 0.5;
const CARD_Y_POSITION = 0;
const TIMER_DURATION = 10; // Seconds
const COLORS = {
    background: 0x1a1a2e,
    cardDefault: 0x4d508e, // Muted purple/blue
    cardCorrect: 0x57cc99, // Green
    cardIncorrect: 0xf94144, // Red
    textPrimary: 0xffffff,
    textSecondary: 0xf9c74f, // Yellow for popularity
};

let scene, camera, renderer;
let itemCardLeft, itemCardRight;
let itemA, itemB;
let score = 0;
let gameActive = true;
let timerValue = TIMER_DURATION;
let timerInterval = null;

// NEAR Integration
let nearIntegration = null;
let isBlockchainMode = false;
let currentStake = 0;

// DOM Elements
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const messageDisplay = document.getElementById('message-display');
const questionText = document.getElementById('question-text');
const higherButton = document.getElementById('higher-button');
const lowerButton = document.getElementById('lower-button');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const playAgainButton = document.getElementById('play-again-button');
const canvasContainer = document.getElementById('scene-canvas');

// Additional DOM Elements for NEAR interface
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
const playDemoBtn = document.getElementById('play-demo-btn');
const walletDisconnected = document.getElementById('wallet-disconnected');
const walletConnected = document.getElementById('wallet-connected');
const stakingInterface = document.getElementById('staking-interface');
const startBlockchainGameBtn = document.getElementById('start-blockchain-game-btn');
const stakeAmountSelect = document.getElementById('stake-amount');
const accountIdSpan = document.getElementById('account-id');
const accountBalanceSpan = document.getElementById('account-balance');
const modeText = document.getElementById('mode-text');
const stakeDisplay = document.getElementById('stake-display');
const toggleStatsBtn = document.getElementById('toggle-stats-btn');
const statsPanel = document.getElementById('stats-panel');
const blockchainResult = document.getElementById('blockchain-result');
const earningsInfo = document.getElementById('earnings-info');

// Stats elements
const gamesPlayedSpan = document.getElementById('games-played');
const highestScoreSpan = document.getElementById('highest-score');
const totalEarningsSpan = document.getElementById('total-earnings');
const leaderboardList = document.getElementById('leaderboard-list');

// Initialize NEAR integration
async function initNear() {
    try {
        nearIntegration = new NearGameIntegration();
        
        // Set up event handlers
        nearIntegration.setEventHandlers({
            onWalletConnected: (accountId) => {
                console.log('Wallet connected:', accountId);
                updateWalletUI(true);
            },
            onWalletDisconnected: () => {
                console.log('Wallet disconnected');
                updateWalletUI(false);
                isBlockchainMode = false;
            },
            onGameStarted: (gameId, stake) => {
                console.log('Blockchain game started:', gameId, 'Stake:', stake);
                currentStake = stake;
            },
            onScoreUpdated: (score) => {
                console.log('Blockchain score updated:', score);
            },
            onGameEnded: (finalScore, reward) => {
                console.log('Blockchain game ended:', finalScore, 'Reward:', reward);
                showBlockchainGameOverMessage(finalScore, reward);
            }
        });
        
        await nearIntegration.init();
        console.log('NEAR integration initialized');
        
    } catch (error) {
        console.error('Failed to initialize NEAR:', error);
    }
}

function updateWalletUI(connected) {
    if (connected) {
        walletDisconnected.style.display = 'none';
        walletConnected.style.display = 'block';
        stakingInterface.style.display = 'block';
        
        // Update account info
        accountIdSpan.textContent = nearIntegration.getAccountId();
        updateBalanceDisplay();
        
        // Load and display player stats
        loadPlayerStats();
        
        // Load leaderboard
        loadLeaderboard();
    } else {
        walletDisconnected.style.display = 'block';
        walletConnected.style.display = 'none';
        stakingInterface.style.display = 'none';
        statsPanel.style.display = 'none';
    }
}

async function updateBalanceDisplay() {
    try {
        const balance = await nearIntegration.getBalance();
        accountBalanceSpan.textContent = parseFloat(balance).toFixed(2);
    } catch (error) {
        console.error('Failed to update balance:', error);
        accountBalanceSpan.textContent = '0';
    }
}

async function loadPlayerStats() {
    try {
        const stats = await nearIntegration.getPlayerStats();
        if (stats) {
            gamesPlayedSpan.textContent = stats.gamesPlayed;
            highestScoreSpan.textContent = stats.highestScore;
            totalEarningsSpan.textContent = parseFloat(stats.totalEarningsNear).toFixed(4);
        }
    } catch (error) {
        console.error('Failed to load player stats:', error);
    }
}

async function loadLeaderboard() {
    try {
        const leaderboard = await nearIntegration.getLeaderboard();
        displayLeaderboard(leaderboard);
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
    }
}

function displayLeaderboard(leaderboard) {
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<p>No games played yet!</p>';
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'leaderboard-entry';
        entryDiv.innerHTML = `
            <span>${index + 1}. ${entry.playerId.substring(0, 10)}...</span>
            <span>Score: ${entry.highestScore}</span>
            <span>${parseFloat(entry.totalEarningsNear).toFixed(2)} NEAR</span>
        `;
        leaderboardList.appendChild(entryDiv);
    });
}

function showBlockchainGameOverMessage(finalScore, reward) {
    const rewardAmount = parseFloat(reward);
    const rewardText = rewardAmount > 0 ? 
        `🎉 You earned ${reward} NEAR!` : 
        '💸 You lost your stake. Better luck next time!';
    
    earningsInfo.textContent = rewardText;
    blockchainResult.style.display = 'block';
    
    // Update balance and stats after game
    setTimeout(() => {
        updateBalanceDisplay();
        loadPlayerStats();
        loadLeaderboard();
    }, 1000);
}

// Event Listeners for NEAR interface
function setupNearEventListeners() {
    connectWalletBtn.addEventListener('click', async () => {
        try {
            connectWalletBtn.classList.add('loading');
            await nearIntegration.connectWallet();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        } finally {
            connectWalletBtn.classList.remove('loading');
        }
    });

    disconnectWalletBtn.addEventListener('click', async () => {
        try {
            disconnectWalletBtn.classList.add('loading');
            await nearIntegration.disconnectWallet();
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
        } finally {
            disconnectWalletBtn.classList.remove('loading');
        }
    });

    playDemoBtn.addEventListener('click', () => {
        isBlockchainMode = false;
        modeText.textContent = 'Demo Mode';
        stakeDisplay.style.display = 'none';
        startGame();
    });

    startBlockchainGameBtn.addEventListener('click', async () => {
        try {
            const stakeAmount = parseFloat(stakeAmountSelect.value);
            
            startBlockchainGameBtn.classList.add('loading');
            
            await nearIntegration.startGame(stakeAmount);
            
            isBlockchainMode = true;
            currentStake = stakeAmount;
            modeText.textContent = 'Blockchain Mode';
            stakeDisplay.textContent = `Stake: ${stakeAmount} NEAR`;
            stakeDisplay.style.display = 'inline';
            
            startGame();
            
        } catch (error) {
            console.error('Failed to start blockchain game:', error);
            alert('Failed to start blockchain game. Please check your balance and try again.');
        } finally {
            startBlockchainGameBtn.classList.remove('loading');
        }
    });

    toggleStatsBtn.addEventListener('click', () => {
        const isVisible = statsPanel.style.display !== 'none';
        statsPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible && nearIntegration && nearIntegration.isWalletConnected()) {
            loadPlayerStats();
            loadLeaderboard();
        }
    });
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);

    // Camera
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, CARD_Y_POSITION, 7);
    camera.lookAt(0, CARD_Y_POSITION, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Event Listeners
    higherButton.addEventListener('click', () => handleGuess(true));
    lowerButton.addEventListener('click', () => handleGuess(false));
    playAgainButton.addEventListener('click', resetGame);
    window.addEventListener('resize', onWindowResize);

    // Setup NEAR event listeners
    setupNearEventListeners();

    // Initialize NEAR integration
    initNear();

    startGame();
    animate();
}

function createItemCard(name, popularity, isRevealed, isLeft = true) {
    const group = new THREE.Group();
    const geometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
    const material = new THREE.MeshStandardMaterial({ 
        color: COLORS.cardDefault, 
        roughness: 0.5, 
        metalness: 0.2 
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Item Name Text
    const nameText = new Text();
    nameText.text = name.toUpperCase();
    nameText.fontSize = 0.32;
    nameText.color = COLORS.textPrimary;
    nameText.anchorX = 'center';
    nameText.anchorY = 'middle';
    nameText.position.set(0, CARD_HEIGHT * 0.3, CARD_DEPTH / 2 + 0.01);
    nameText.maxWidth = CARD_WIDTH * 0.9;
    nameText.textAlign = 'center';
    group.add(nameText);

    // Popularity Text ("Searches", "Units Sold", etc.)
    const popularityLabel = new Text();
    popularityLabel.text = "POPULARITY";
    popularityLabel.fontSize = 0.18;
    popularityLabel.color = COLORS.textSecondary;
    popularityLabel.anchorX = 'center';
    popularityLabel.anchorY = 'middle';
    popularityLabel.position.set(0, -CARD_HEIGHT * 0.15, CARD_DEPTH / 2 + 0.01);
    group.add(popularityLabel);
    
    // Popularity Value Text
    const popularityValueText = new Text();
    const displayPopularity = isRevealed ? formatPopularity(popularity) : "???";
    popularityValueText.text = displayPopularity;
    popularityValueText.fontSize = 0.5;
    popularityValueText.color = COLORS.textSecondary;
    popularityValueText.anchorX = 'center';
    popularityValueText.anchorY = 'middle';
    popularityValueText.position.set(0, -CARD_HEIGHT * 0.3, CARD_DEPTH / 2 + 0.01);
    group.add(popularityValueText);
    
    group.userData.nameText = nameText;
    group.userData.popularityLabel = popularityLabel;
    group.userData.popularityValueText = popularityValueText;
    group.userData.mesh = mesh;
    group.userData.isRevealed = isRevealed;
    group.userData.popularity = popularity;

    group.position.x = isLeft ? -(CARD_WIDTH / 2 + CARD_SPACING / 2) : (CARD_WIDTH / 2 + CARD_SPACING / 2);
    group.position.y = CARD_Y_POSITION;
    
    return group;
}

function formatPopularity(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toString();
}

function generatePopularity() {
    return Math.floor(Math.random() * 999000) + 1000; // Range from 1,000 to 1,000,000
}

function startGame() {
    score = 0;
    updateScoreDisplay();
    messageDisplay.textContent = "";
    gameOverScreen.style.display = 'none';
    gameActive = true;
    setButtonsEnabled(true);
    stopTimer(); // Ensure any existing timer is stopped
    setupNextRound();
}

function setupNextRound() {
    if (itemCardLeft) scene.remove(itemCardLeft);
    if (itemCardRight) scene.remove(itemCardRight);
    itemCardLeft = null;
    itemCardRight = null;

    if (!itemB) { // First round or after a loss
        itemA = getRandomItem();
        itemA.popularity = generatePopularity();
    } else { // Subsequent rounds
        itemA = { ...itemB }; // Item B from previous round becomes Item A
    }
    
    itemB = getRandomItem(itemA); // Get a new item, different from A
    itemB.popularity = generatePopularity();
    // Ensure popularity values are not identical for a clear higher/lower choice
    while (itemB.popularity === itemA.popularity) {
        itemB.popularity = generatePopularity();
    }

    itemCardLeft = createItemCard(itemA.name, itemA.popularity, true, true);
    scene.add(itemCardLeft);

    itemCardRight = createItemCard(itemB.name, itemB.popularity, false, false);
    scene.add(itemCardRight);
    
    questionText.textContent = `Is "${itemB.name}" popularity Higher or Lower than ${formatPopularity(itemA.popularity)}?`;
    messageDisplay.textContent = "";
    setButtonsEnabled(true);
    startTimer();
}

function getRandomItem(excludeItem = null) {
    let selectedItem;
    do {
        selectedItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    } while (excludeItem && selectedItem.name === excludeItem.name);
    return { ...selectedItem }; // Return a copy
}

async function handleGuess(isHigherGuess) {
    if (!gameActive) return;
    setButtonsEnabled(false);
    stopTimer();
    
    // Reveal Item B's score
    itemCardRight.userData.popularityValueText.text = formatPopularity(itemB.popularity);
    itemCardRight.userData.isRevealed = true;
    
    const isCorrect = (isHigherGuess && itemB.popularity > itemA.popularity) || 
                      (!isHigherGuess && itemB.popularity < itemA.popularity);
    
    if (isCorrect) {
        score++;
        updateScoreDisplay();
        messageDisplay.textContent = "Correct!";
        messageDisplay.style.color = COLORS.cardCorrect.toString(16);
        itemCardRight.userData.mesh.material.color.setHex(COLORS.cardCorrect);
        
        // Submit correct answer to blockchain if in blockchain mode
        if (isBlockchainMode && nearIntegration && nearIntegration.isGameActive()) {
            try {
                await nearIntegration.submitCorrectAnswer();
                console.log('Correct answer submitted to blockchain');
            } catch (error) {
                console.error('Failed to submit correct answer to blockchain:', error);
            }
        }
        
        setTimeout(() => {
            itemCardLeft.userData.mesh.material.color.setHex(COLORS.cardDefault);
            itemCardRight.userData.mesh.material.color.setHex(COLORS.cardDefault);
            setupNextRound();
        }, 1500);
    } else {
        messageDisplay.textContent = "Incorrect!";
        messageDisplay.style.color = COLORS.cardIncorrect.toString(16);
        itemCardRight.userData.mesh.material.color.setHex(COLORS.cardIncorrect);
        gameActive = false;
        setTimeout(gameOver, 1500);
    }
}

function startTimer() {
    timerValue = TIMER_DURATION;
    updateTimerDisplay();
    clearInterval(timerInterval); // Clear any existing interval
    timerInterval = setInterval(() => {
        timerValue--;
        updateTimerDisplay();
        if (timerValue <= 0) {
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay() {
    timerDisplay.textContent = timerValue;
}

function handleTimeout() {
    stopTimer();
    if (!gameActive) return; // If game already ended by a quick click then timeout
    setButtonsEnabled(false);
    gameActive = false;
    messageDisplay.textContent = "Time's up!";
    messageDisplay.style.color = COLORS.cardIncorrect.toString(16);
    
    // Reveal Item B's score if not already
    if (!itemCardRight.userData.isRevealed) {
        itemCardRight.userData.popularityValueText.text = formatPopularity(itemB.popularity);
        itemCardRight.userData.isRevealed = true;
    }
    itemCardRight.userData.mesh.material.color.setHex(COLORS.cardIncorrect);
    setTimeout(gameOver, 1500);
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function setButtonsEnabled(enabled) {
    higherButton.disabled = !enabled;
    lowerButton.disabled = !enabled;
}

async function gameOver() {
    stopTimer();
    
    // End blockchain game if active
    if (isBlockchainMode && nearIntegration && nearIntegration.isGameActive()) {
        try {
            const result = await nearIntegration.endGame();
            console.log('Blockchain game ended:', result);
            // The showBlockchainGameOverMessage will be called by the event handler
            return; // Don't show the regular game over screen for blockchain games
        } catch (error) {
            console.error('Failed to end blockchain game:', error);
        }
    }
    
    // Regular game over for non-blockchain games
    finalScoreDisplay.textContent = `Your Final Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    stopTimer();
    itemB = null; // Reset itemB so startGame generates two new items
    if (itemCardLeft) itemCardLeft.userData.mesh.material.color.setHex(COLORS.cardDefault);
    if (itemCardRight) itemCardRight.userData.mesh.material.color.setHex(COLORS.cardDefault);
    
    // Hide blockchain result
    blockchainResult.style.display = 'none';
    
    startGame();
}

function onWindowResize() {
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Animate cards slightly for effect
    const time = Date.now() * 0.0005;
    if (itemCardLeft) {
        itemCardLeft.rotation.y = Math.sin(time) * 0.05;
    }
    if (itemCardRight) {
        itemCardRight.rotation.y = Math.sin(time + Math.PI * 0.5) * 0.05;
    }

    // Ensure Troika text objects are updated
    if (itemCardLeft) {
        itemCardLeft.userData.nameText.sync();
        itemCardLeft.userData.popularityLabel.sync();
        itemCardLeft.userData.popularityValueText.sync();
    }
    if (itemCardRight) {
        itemCardRight.userData.nameText.sync();
        itemCardRight.userData.popularityLabel.sync();
        itemCardRight.userData.popularityValueText.sync();
    }
    
    renderer.render(scene, camera);
}

// Initialize and start the game
init();