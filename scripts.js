const gameBoard = document.querySelector("#gameboard")
const playerDisplay = document.querySelector("#player")
const infoDisplay = document.querySelector("#info-display")
const capturedWhiteDisplay = document.querySelector("#captured-white")
const capturedBlackDisplay = document.querySelector("#captured-black")
const width = 8
let playerGo = 'white'
let capturedWhite = []
let capturedBlack = []
playerDisplay.textContent = 'white'

const startPieces = [
    rook, knight, bishop, queen, king, bishop, knight, rook,
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
    rook, knight, bishop, queen, king, bishop, knight, rook,
]

function createBoard() {
    startPieces.forEach((startPiece, i) => {
        const square = document.createElement('div')
        square.classList.add('square')
        square.innerHTML = startPiece
        square.firstChild && square.firstChild.setAttribute('draggable', true)
        square.setAttribute('square-id', i)
        
        const row = Math.floor((63 - i) / 8) + 1
        if (row % 2 === 0) {
            square.classList.add(i % 2 === 0 ? "beige" : "brown")
        } else {
            square.classList.add(i % 2 === 0 ? "brown" : "beige")
        }
        
        if (i <= 15) {
            square.firstChild.firstChild.classList.add('black')
        }
        if (i >= 48) {
            square.firstChild.firstChild.classList.add('white')
        }
        
        gameBoard.append(square)
    })
}

createBoard()

const allSquares = document.querySelectorAll("#gameboard .square")
allSquares.forEach(square => {
    square.addEventListener('dragstart', dragStart)
    square.addEventListener('dragover', dragOver)
    square.addEventListener('dragenter', dragEnter)
    square.addEventListener('dragleave', dragLeave)
    square.addEventListener('drop', dragDrop)
    square.addEventListener('click', handleClick)
})

let startPositionId
let draggedElement
let selectedSquare = null

function dragStart(e) {
    startPositionId = e.target.parentNode.getAttribute('square-id')
    draggedElement = e.target
}

function dragOver(e) {
    e.preventDefault()
}

function dragEnter(e) {
    e.preventDefault()
    this.classList.add('hovered')
}

function dragLeave() {
    this.classList.remove('hovered')
}

function handleClick(e) {
    const square = e.currentTarget
    const squareId = parseInt(square.getAttribute('square-id'))
    
    if (selectedSquare === null) {
        if (square.firstChild && square.firstChild.firstChild.classList.contains(playerGo)) {
            selectedSquare = squareId
            square.classList.add('selected')
            highlightValidMoves(squareId)
        }
    } else {
        if (selectedSquare === squareId) {
            clearSelection()
        } else {
            const selectedSquareElement = document.querySelector(`[square-id="${selectedSquare}"]`)
            if (square.classList.contains('valid-move') || square.classList.contains('capture-move')) {
                makeMove(selectedSquareElement, square)
            } else {
                clearSelection()
                if (square.firstChild && square.firstChild.firstChild.classList.contains(playerGo)) {
                    selectedSquare = squareId
                    square.classList.add('selected')
                    highlightValidMoves(squareId)
                }
            }
        }
    }
}

function clearSelection() {
    if (selectedSquare !== null) {
        const selectedSquareElement = document.querySelector(`[square-id="${selectedSquare}"]`)
        selectedSquareElement.classList.remove('selected')
        selectedSquare = null
    }
    clearHighlights()
}

function clearHighlights() {
    allSquares.forEach(square => {
        square.classList.remove('valid-move', 'capture-move')
    })
}

function highlightValidMoves(squareId) {
    const piece = document.querySelector(`[square-id="${squareId}"]`).firstChild
    if (!piece) return
    
    const pieceType = piece.id
    const pieceColor = piece.firstChild.classList.contains('white') ? 'white' : 'black'
    const validMoves = getValidMoves(squareId, pieceType, pieceColor)
    
    validMoves.forEach(moveId => {
        const targetSquare = document.querySelector(`[square-id="${moveId}"]`)
        if (targetSquare.firstChild) {
            targetSquare.classList.add('capture-move')
        } else {
            targetSquare.classList.add('valid-move')
        }
    })
}

function makeMove(fromSquare, toSquare) {
    const piece = fromSquare.firstChild
    
    if (toSquare.firstChild) {
        const capturedPiece = toSquare.firstChild
        const capturedColor = capturedPiece.firstChild.classList.contains('white') ? 'white' : 'black'
        if (capturedColor === 'white') {
            capturedWhite.push(capturedPiece.id)
        } else {
            capturedBlack.push(capturedPiece.id)
        }
        updateCapturedDisplay()
    }
    
    toSquare.innerHTML = ''
    toSquare.appendChild(piece)
    
    clearSelection()
    changePlayer()
    checkGameStatus()
}

function updateCapturedDisplay() {
    if (capturedWhiteDisplay) {
        capturedWhiteDisplay.textContent = capturedWhite.join(', ')
    }
    if (capturedBlackDisplay) {
        capturedBlackDisplay.textContent = capturedBlack.join(', ')
    }
}

function dragDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    
    const correctGo = draggedElement.firstChild.classList.contains(playerGo)
    if (!correctGo) {
        infoDisplay.textContent = "It's not your turn!"
        return
    }
    
    const startId = parseInt(startPositionId)
    const endId = parseInt(this.getAttribute('square-id'))
    const pieceType = draggedElement.id
    const pieceColor = draggedElement.firstChild.classList.contains('white') ? 'white' : 'black'
    
    const validMoves = getValidMoves(startId, pieceType, pieceColor)
    if (!validMoves.includes(endId)) {
        infoDisplay.textContent = "Invalid move!"
        return
    }
    
    if (this.firstChild && this.firstChild.firstChild.classList.contains(playerGo)) {
        infoDisplay.textContent = "Cannot capture your own piece!"
        return
    }
    
    if (this.firstChild) {
        const capturedPiece = this.firstChild
        const capturedColor = capturedPiece.firstChild.classList.contains('white') ? 'white' : 'black'
        if (capturedColor === 'white') {
            capturedWhite.push(capturedPiece.id)
        } else {
            capturedBlack.push(capturedPiece.id)
        }
        this.removeChild(this.firstChild)
        updateCapturedDisplay()
    }
    
    this.appendChild(draggedElement)
    this.classList.remove('hovered')
    
    infoDisplay.textContent = ""
    changePlayer()
    checkGameStatus()
}

function getValidMoves(startId, pieceType, pieceColor) {
    const startRow = Math.floor(startId / 8)
    const startCol = startId % 8
    const moves = []
    
    switch (pieceType) {
        case 'pawn':
            moves.push(...getPawnMoves(startRow, startCol, pieceColor))
            break
        case 'rook':
            moves.push(...getRookMoves(startRow, startCol, pieceColor))
            break
        case 'bishop':
            moves.push(...getBishopMoves(startRow, startCol, pieceColor))
            break
        case 'knight':
            moves.push(...getKnightMoves(startRow, startCol, pieceColor))
            break
        case 'queen':
            moves.push(...getQueenMoves(startRow, startCol, pieceColor))
            break
        case 'king':
            moves.push(...getKingMoves(startRow, startCol, pieceColor))
            break
    }
    
    return moves.filter(moveId => moveId >= 0 && moveId < 64)
}

function getPawnMoves(row, col, color) {
    const moves = []
    const direction = color === 'white' ? -1 : 1
    const startingRow = color === 'white' ? 6 : 1
    
    const oneStep = (row + direction) * 8 + col
    if (row + direction >= 0 && row + direction < 8) {
        const oneStepSquare = document.querySelector(`[square-id="${oneStep}"]`)
        if (!oneStepSquare.firstChild) {
            moves.push(oneStep)
            
            if (row === startingRow) {
                const twoStep = (row + 2 * direction) * 8 + col
                if (row + 2 * direction >= 0 && row + 2 * direction < 8) {
                    const twoStepSquare = document.querySelector(`[square-id="${twoStep}"]`)
                    if (!twoStepSquare.firstChild) {
                        moves.push(twoStep)
                    }
                }
            }
        }
    }
    
    const captureLeft = (row + direction) * 8 + (col - 1)
    if (row + direction >= 0 && row + direction < 8 && col - 1 >= 0) {
        const captureSquare = document.querySelector(`[square-id="${captureLeft}"]`)
        if (captureSquare.firstChild && !captureSquare.firstChild.firstChild.classList.contains(color)) {
            moves.push(captureLeft)
        }
    }
    
    const captureRight = (row + direction) * 8 + (col + 1)
    if (row + direction >= 0 && row + direction < 8 && col + 1 < 8) {
        const captureSquare = document.querySelector(`[square-id="${captureRight}"]`)
        if (captureSquare.firstChild && !captureSquare.firstChild.firstChild.classList.contains(color)) {
            moves.push(captureRight)
        }
    }
    
    return moves
}

function getRookMoves(row, col, color) {
    const moves = []
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]
    
    directions.forEach(([dRow, dCol]) => {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dRow * i
            const newCol = col + dCol * i
            
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break
            
            const newId = newRow * 8 + newCol
            const square = document.querySelector(`[square-id="${newId}"]`)
            
            if (!square.firstChild) {
                moves.push(newId)
            } else {
                if (!square.firstChild.firstChild.classList.contains(color)) {
                    moves.push(newId)
                }
                break
            }
        }
    })
    
    return moves
}

function getBishopMoves(row, col, color) {
    const moves = []
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]
    
    directions.forEach(([dRow, dCol]) => {
        for (let i = 1; i < 8; i++) {
            const newRow = row + dRow * i
            const newCol = col + dCol * i
            
            if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) break
            
            const newId = newRow * 8 + newCol
            const square = document.querySelector(`[square-id="${newId}"]`)
            
            if (!square.firstChild) {
                moves.push(newId)
            } else {
                if (!square.firstChild.firstChild.classList.contains(color)) {
                    moves.push(newId)
                }
                break
            }
        }
    })
    
    return moves
}

function getKnightMoves(row, col, color) {
    const moves = []
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]
    
    knightMoves.forEach(([dRow, dCol]) => {
        const newRow = row + dRow
        const newCol = col + dCol
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const newId = newRow * 8 + newCol
            const square = document.querySelector(`[square-id="${newId}"]`)
            
            if (!square.firstChild || !square.firstChild.firstChild.classList.contains(color)) {
                moves.push(newId)
            }
        }
    })
    
    return moves
}

function getQueenMoves(row, col, color) {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)]
}

function getKingMoves(row, col, color) {
    const moves = []
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    
    directions.forEach(([dRow, dCol]) => {
        const newRow = row + dRow
        const newCol = col + dCol
        
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const newId = newRow * 8 + newCol
            const square = document.querySelector(`[square-id="${newId}"]`)
            
            if (!square.firstChild || !square.firstChild.firstChild.classList.contains(color)) {
                moves.push(newId)
            }
        }
    })
    
    return moves
}

function changePlayer() {
    if (playerGo === "white") {
        playerGo = "black"
        playerDisplay.textContent = 'black'
    } else {
        playerGo = "white"
        playerDisplay.textContent = 'white'
    }
}

function checkGameStatus() {
    const kings = document.querySelectorAll('#king')
    let whiteKing = false
    let blackKing = false
    
    kings.forEach(king => {
        if (king.firstChild.classList.contains('white')) {
            whiteKing = true
        } else if (king.firstChild.classList.contains('black')) {
            blackKing = true
        }
    })
    
    if (!whiteKing) {
        infoDisplay.textContent = "Black wins! White king captured."
    } else if (!blackKing) {
        infoDisplay.textContent = "White wins! Black king captured."
    }
}