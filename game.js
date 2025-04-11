// Game variables
let grid;
let score;
let gameOver;
let moving = false; // To track if tiles are currently moving

// Initialize the game
function initGame() {
    grid = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    
    score = 0;
    gameOver = false;
    
    document.getElementById('score').textContent = score;
    document.getElementById('game-over').style.display = 'none';
    
    // Create the grid cells
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = `cell-${Math.floor(i / 4)}-${i % 4}`;
        gridElement.appendChild(cell);
    }
    
    // Add two initial tiles immediately (without setTimeout)
    addRandomTile(true);
    addRandomTile(true);
    
    updateGrid();
}


// Add a random tile (2 or 4) to an empty cell
function addRandomTile(animate = false) {
    const emptyCells = [];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                emptyCells.push({i, j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[randomCell.i][randomCell.j] = Math.random() < 0.9 ? 2 : 4;
        
        if (animate) {
            const cell = document.getElementById(`cell-${randomCell.i}-${randomCell.j}`);
            cell.classList.add('tile-new');
            setTimeout(() => cell.classList.remove('tile-new'), 200);
        }
    }
}

// Update the grid display with animations
function updateGrid() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            cell.textContent = '';
            cell.className = 'cell';
            cell.classList.remove('tile-merged', 'tile-new');
            
            if (grid[i][j] !== 0) {
                cell.textContent = grid[i][j];
                cell.classList.add(`tile-${grid[i][j]}`);
            }
        }
    }
    
    document.getElementById('score').textContent = score;
    
    // Check for game over
    if (isGameOver()) {
        setTimeout(() => {
            gameOver = true;
            document.getElementById('game-over').style.display = 'flex';
        }, 300);
    }
}

// Highlight merged tiles
function highlightMergedTiles(newGrid, oldGrid) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (newGrid[i][j] > oldGrid[i][j] && oldGrid[i][j] !== 0) {
                const cell = document.getElementById(`cell-${i}-${j}`);
                cell.classList.add('tile-merged');
                setTimeout(() => cell.classList.remove('tile-merged'), 200);
            }
        }
    }
}

// Move tiles left with animation
function moveLeft() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(val => val !== 0);
        
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                row[j + 1] = 0;
                score += row[j];
                moved = true;
            }
        }
        
        row = row.filter(val => val !== 0);
        while (row.length < 4) row.push(0);
        
        if (!arraysEqual(grid[i], row)) moved = true;
        grid[i] = row;
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
    }
    
    return moved;
}

// Move tiles right with animation
function moveRight() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let i = 0; i < 4; i++) {
        let row = grid[i].filter(val => val !== 0);
        
        for (let j = row.length - 1; j > 0; j--) {
            if (row[j] === row[j - 1]) {
                row[j] *= 2;
                row[j - 1] = 0;
                score += row[j];
                moved = true;
            }
        }
        
        row = row.filter(val => val !== 0);
        while (row.length < 4) row.unshift(0);
        
        if (!arraysEqual(grid[i], row)) moved = true;
        grid[i] = row;
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
    }
    
    return moved;
}

// Move tiles up with animation
function moveUp() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let j = 0; j < 4; j++) {
        let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]].filter(val => val !== 0);
        
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                column[i + 1] = 0;
                score += column[i];
                moved = true;
            }
        }
        
        column = column.filter(val => val !== 0);
        while (column.length < 4) column.push(0);
        
        const oldColumn = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
        if (!arraysEqual(oldColumn, column)) moved = true;
        
        for (let i = 0; i < 4; i++) grid[i][j] = column[i];
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
    }
    
    return moved;
}

// Move tiles down with animation
function moveDown() {
    if (moving || gameOver) return false;
    moving = true;
    
    const oldGrid = JSON.parse(JSON.stringify(grid));
    let moved = false;
    
    for (let j = 0; j < 4; j++) {
        let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]].filter(val => val !== 0);
        
        for (let i = column.length - 1; i > 0; i--) {
            if (column[i] === column[i - 1]) {
                column[i] *= 2;
                column[i - 1] = 0;
                score += column[i];
                moved = true;
            }
        }
        
        column = column.filter(val => val !== 0);
        while (column.length < 4) column.unshift(0);
        
        const oldColumn = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
        if (!arraysEqual(oldColumn, column)) moved = true;
        
        for (let i = 0; i < 4; i++) grid[i][j] = column[i];
    }
    
    if (moved) {
        highlightMergedTiles(grid, oldGrid);
        setTimeout(() => {
            addRandomTile(true);
            updateGrid();
            moving = false;
        }, 200);
    } else {
        moving = false;
    }
    
    return moved;
}

// Check if the game is over
function isGameOver() {
    // Check if there are any empty cells
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (grid[i][j] === 0) {
                return false;
            }
        }
    }
    
    // Check if there are any possible merges
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i][j] === grid[i][j + 1]) {
                return false;
            }
        }
    }
    
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 3; i++) {
            if (grid[i][j] === grid[i + 1][j]) {
                return false;
            }
        }
    }
    
    return true;
}

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// Handle keyboard input
function handleKeyPress(e) {
    if (gameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        default:
            return; // Ignore other keys
    }
}

function startGame() {
    const gameOverScreen = document.getElementById('game-over');
    gameOverScreen.style.opacity = 0;
    gameOverScreen.style.display = 'none';
    initGame(); // Call initGame directly without delay
}

// Initialize the game when the page loads
window.onload = function() {
    startGame();
    document.addEventListener('keydown', handleKeyPress);
};