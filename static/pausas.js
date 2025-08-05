const wordsToFind = ['ALICO', 'EMPAQUES', 'EXTRUSION', 'FUNDAS', 'IMPRESIÓN', 'CORTE', 'LAMINACIÓN', 'CORRUGADO', 'SELLADO', 'INSERTADORAS', 'ADITAMENTOS'];
const gridSize = 15; 
let grid = [];
let foundWords = [];
let timerInterval;
let startTime;


// Detectar en qué página estamos
document.addEventListener('DOMContentLoaded', function () {
    if (document.body.classList.contains('rompecabezas-page')) {
        console.log("🔵 Cargando la lógica del ROMPECABEZAS...");
        startPuzzle(); // Solo ejecuta el código del rompecabezas
    } else if (document.getElementById('grid-container')) {
        console.log("🟢 Cargando la lógica de la SOPA DE LETRAS...");
        startWordSearch(); // Solo ejecuta el código de la sopa de letras
    } else {
        console.warn("⚠ No se detectó una vista compatible. Verifica la estructura del HTML.");
    }
});


function startTimer() {
    if (timerInterval) clearInterval(timerInterval); // Evitar múltiples intervalos
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        document.getElementById("tiempo").textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, 1000);
}


// 🛑 Función para detener el cronómetro
function stopTimer() {
    clearInterval(timerInterval);
}

// 🔄 Función para reiniciar el cronómetro
function resetTimer() {
    stopTimer(); // 🔹 Detener el cronómetro
    document.getElementById("tiempo").textContent = "00:00"; // 🔹 Reiniciar el texto del cronómetro
}

setTimeout(() => {
    startTimer();
}, 5000);

// Función para verificar si todas las palabras han sido encontradas
function checkCompletion() {
    if (foundWords.length === wordsToFind.length) {
        stopTimer(); // Detener el cronómetro
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;

        setTimeout(() => {
            alert(`¡Felicidades! Has encontrado todas las palabras en ${minutes}:${seconds < 10 ? "0" : ""}${seconds} minutos.`);
        }, 300);
    }
}

function initGrid() {
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = ''; 
        }
    }
}

// Función para insertar palabras en la cuadrícula
function placeWord(word) {
    const directions = ['horizontal', 'vertical'];
    let placed = false;
    let attempts = 0;  // 🔹 Se limita el número de intentos para evitar bloqueos

    while (!placed && attempts < 200) {  // 🔹 Intentar un máximo de 200 veces
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const row = Math.floor(Math.random() * gridSize);
        const col = Math.floor(Math.random() * gridSize);
        let canPlace = true;

        // 🔹 Verificar si la palabra cabe en la dirección seleccionada
        if (direction === 'horizontal' && col + word.length <= gridSize) {
            for (let i = 0; i < word.length; i++) {
                if (grid[row][col + i] !== '') { 
                    canPlace = false;
                    break;
                }
            }
            if (canPlace) {
                for (let i = 0; i < word.length; i++) {
                    grid[row][col + i] = word[i];
                }
                placed = true;
            }
        } 
        else if (direction === 'vertical' && row + word.length <= gridSize) {
            for (let i = 0; i < word.length; i++) {
                if (grid[row + i][col] !== '') { 
                    canPlace = false;
                    break;
                }
            }
            if (canPlace) {
                for (let i = 0; i < word.length; i++) {
                    grid[row + i][col] = word[i];
                }
                placed = true;
            }
        }
        attempts++;  // 🔹 Contador de intentos
    }

    if (!placed) {
        console.error(`⚠ No se pudo colocar la palabra: ${word}`);
    }
}



// Función para llenar las celdas vacías con letras aleatorias
function fillRandomLetters() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}


// Función para crear el HTML de la cuadrícula
function createGrid() {
    const gridContainer = document.getElementById('grid-container');
    
    if (!gridContainer) {
        console.error("⚠ Error: No se encontró el elemento con id 'grid-container'. Verifica el HTML.");
        return; // Detiene la ejecución para evitar el error
    }

    gridContainer.innerHTML = '';  // Limpiar el contenedor antes de llenarlo
    grid.forEach((row, rowIndex) => {
        row.forEach((letter, colIndex) => {
            const cell = document.createElement('div');
            cell.classList.add('letter-cell');
            cell.textContent = letter;
            cell.dataset.row = rowIndex;
            cell.dataset.col = colIndex;
            gridContainer.appendChild(cell);
        });
    });
}


// Función para iniciar la sopa de letras
function startWordSearch() {
    initGrid(); // 🔹 Inicializar la cuadrícula vacía

    let wordsPlaced = 0; 

    for (let i = 0; i < wordsToFind.length; i++) {
        placeWord(wordsToFind[i]);  // 🔹 Intentar colocar cada palabra
    }

    fillRandomLetters();  // 🔹 Rellenar con letras aleatorias
    createGrid();  // 🔹 Renderizar la cuadrícula
    addEvents();  // 🔹 Activar eventos de selección
    startTimer();  // 🔹 Iniciar el cronómetro después de que todo esté listo
}



// Inicializar los eventos
function addEvents() {
    const cells = document.querySelectorAll('.letter-cell'); // Cambiado a letter-cell
    cells.forEach((cell) => {
        cell.addEventListener('click', () => selectCell(cell));
    });
}


// Función para seleccionar las celdas
let selectedCells = [];
let isSelecting = false;
function startSelecting(cell) {
    if (!isSelecting) {
        // Si no estamos seleccionando, comenzar la selección
        selectedCells = [cell];  // Comenzamos con la primera celda
        isSelecting = true;
        cell.classList.add('selected');
    }
}

function continueSelecting(cell) {
    if (isSelecting) {
        // Si estamos en el proceso de selección, agregar la celda seleccionada
        if (!selectedCells.includes(cell)) {
            selectedCells.push(cell);
            cell.classList.add('selected');
        }
    }
}

function endSelecting(cell) {
    if (isSelecting) {
        continueSelecting(cell);  // Asegurarse de que la última celda también se agregue
        isSelecting = false;  // Terminamos de seleccionar
        checkWord();  // Verificamos la palabra
    }
}

function checkWord() {
    if (selectedCells.length > 0) {
        const selectedWord = selectedCells.map((cell) => cell.textContent).join('');

        if (wordsToFind.includes(selectedWord)) {
            alert(`¡Encontraste la palabra: ${selectedWord}!`);
            selectedCells.forEach((cell) => {
                cell.classList.add('found'); // Marcar las letras en la cuadrícula
                cell.classList.remove('selected'); // Limpiar la selección
            });

            // Agregar la palabra encontrada a foundWords si no está ya incluida
            if (!foundWords.includes(selectedWord)) {
                foundWords.push(selectedWord);
            }

            // Actualizar la lista de palabras
            updateWordList();

            // Verificar si se han encontrado todas las palabras
            checkCompletion();
        } else {
            alert('¡Intenta de nuevo!');
            selectedCells.forEach((cell) => {
                cell.classList.remove('selected');
            });
        }
        selectedCells = []; // Limpiar la selección
    }
}


function updateWordList() {
    const wordItems = document.querySelectorAll('#word-list li'); // Seleccionar los elementos <li>

    // Iterar sobre cada palabra en la lista
    wordItems.forEach((item) => {
        const word = item.dataset.word; // Obtener la palabra desde el atributo 'data-word'

        // Verificar si la palabra está en la lista de palabras encontradas
        if (foundWords.includes(word)) {
            item.style.textDecoration = 'line-through'; // Tachar la palabra
            item.style.color = 'green'; // Cambiar el color del texto
            item.style.backgroundColor = '#d3f8e2'; // Fondo verde claro
        }
    });
}


// Función para añadir eventos
function addEvents() {
    const cells = document.querySelectorAll('.letter-cell');

    cells.forEach((cell) => {
        // Eventos para mouse
        cell.addEventListener('mousedown', () => startSelecting(cell));
        cell.addEventListener('mouseover', () => continueSelecting(cell));
        cell.addEventListener('mouseup', () => endSelecting(cell));
    });

    // Eventos globales para touch (pantalla táctil)
    const gridContainer = document.getElementById('grid-container');
    gridContainer.addEventListener('touchstart', (e) => {
        const cell = getCellFromTouch(e.touches[0]);
        if (cell) startSelecting(cell);
        e.preventDefault();
    });

    gridContainer.addEventListener('touchmove', (e) => {
        const cell = getCellFromTouch(e.touches[0]);
        if (cell) continueSelecting(cell);
        e.preventDefault();
    });

    gridContainer.addEventListener('touchend', (e) => {
        const cell = getCellFromTouch(e.changedTouches[0]);
        if (cell) endSelecting(cell);
        e.preventDefault();
    });
}



function areCellsAligned(cells) {
    const firstCell = cells[0];
    const firstRow = firstCell.dataset.row;
    const firstCol = firstCell.dataset.col;
    
    let isHorizontal = true;
    let isVertical = true;

    // Verificar si están alineadas horizontalmente
    cells.forEach((cell) => {
        if (cell.dataset.row !== firstRow) {
            isHorizontal = false;
        }
        if (cell.dataset.col !== firstCol) {
            isVertical = false;
        }
    });

    return isHorizontal || isVertical; // Las celdas deben estar alineadas
}


// Inicializar la sopa de letras al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    startWordSearch();
    addEvents();
    startTimer();
});

document.getElementById("reset-button").addEventListener("click", function () {
    stopTimer(); // 🔹 Detener el cronómetro antes de reiniciar
    resetTimer(); // 🔹 Reiniciar el tiempo a 00:00
    foundWords = []; // 🔹 Vaciar lista de palabras encontradas
    
    // 🔹 Limpiar la cuadrícula visualmente
    document.querySelectorAll('.letter-cell').forEach(cell => {
        cell.classList.remove('found', 'selected'); 
    });

    // 🔹 Restaurar la lista de palabras tachadas
    document.querySelectorAll('#word-list li').forEach(item => {
        item.style.textDecoration = 'none'; 
        item.style.color = ''; 
        item.style.backgroundColor = ''; 
    });

    startWordSearch(); // 🔹 Reiniciar la sopa de letras
});

function getCellFromTouch(touch) {
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.classList.contains('letter-cell')) {
        return el;
    }
    return null;
}



// --------------------
// AQUI EMPIEZA EL ROMPECABEZAS
//---------------------




document.addEventListener('DOMContentLoaded', function() {
    // Configuración del canvas y del rompecabezas
    const canvas = document.getElementById('puzzleCanvas');
    const ctx = canvas.getContext('2d');
    const rows = 4, cols = 4;
    const pieceWidth = canvas.width / cols;
    const pieceHeight = canvas.height / rows;
    let pieces = [];
    let selectedPieceIndex = null;
    let startTime = null;
    let timerInterval;

    // Cargar la imagen
    const image = new Image();
    image.src = "/static/images/logo_redondo.png";
    image.onload = function() {
        initializePuzzle();
    };

    function initializePuzzle() {
        pieces = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                pieces.push({
                    sx: col * pieceWidth,
                    sy: row * pieceHeight,
                    correctRow: row,
                    correctCol: col
                });
            }
        }
        shuffle(pieces);
        startPuzzle();
    }

    function startPuzzle() {
        stopTimer();  // 🔹 Detener cualquier cronómetro anterior
        startTime = Date.now();  // 🔹 Inicializar el tiempo de inicio correctamente
        startTimer(); // 🔹 Iniciar el cronómetro
        shuffle(pieces);
        renderPuzzle();
    }

    function startPuzzle() {
        stopTimer();  // 🔹 Detener cualquier cronómetro anterior
        startTime = Date.now();  // 🔹 Asegurar que startTime siempre tenga un valor válido
        startTimer(); // 🔹 Iniciar el cronómetro
        shuffle(pieces);
        renderPuzzle();
    }    
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }    

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function renderPuzzle() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scaleX = image.width / canvas.width;
        const scaleY = image.height / canvas.height;

        let index = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const piece = pieces[index];
                ctx.drawImage(
                    image,
                    piece.sx * scaleX, piece.sy * scaleY, pieceWidth * scaleX, pieceHeight * scaleY,
                    col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight
                );

                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.strokeRect(col * pieceWidth, row * pieceHeight, pieceWidth, pieceHeight);
                index++;
            }
        }
    }

    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor(x / pieceWidth);
        const row = Math.floor(y / pieceHeight);
        const clickedIndex = row * cols + col;
    
        if (selectedPieceIndex === null) {
            selectedPieceIndex = clickedIndex;
        } else {
            [pieces[selectedPieceIndex], pieces[clickedIndex]] = [pieces[clickedIndex], pieces[selectedPieceIndex]];
            selectedPieceIndex = null;
    
            // ✅ Si el rompecabezas está completo, detener el cronómetro y mostrar mensaje
            if (isPuzzleSolved()) {
                return; // 🚨 Salir para evitar render innecesario
            }
        }
        renderPuzzle();
    });
    

    function isPuzzleSolved() {
        let index = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const piece = pieces[index];
                if (piece.sx !== col * pieceWidth || piece.sy !== row * pieceHeight) {
                    return false; // 🚨 Si hay una pieza mal ubicada, salir
                }
                index++;
            }
        }
    
        // ✅ Detener el cronómetro correctamente
        stopTimer();
    
        // ✅ Verificar que startTime existe antes de calcular el tiempo
        if (!startTime) {
            console.error("⚠ Error: startTime no está definido. No se puede calcular el tiempo.");
            return;
        }
    
        // ✅ Calcular el tiempo correctamente
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
    
        // ✅ Mostrar mensaje de finalización con el tiempo
        setTimeout(() => {
            alert(`🎉 ¡Felicidades! Has completado el rompecabezas en ${minutes}:${seconds < 10 ? "0" : ""}${seconds} minutos.`);
        }, 300);
    
        return true;
    }
    
    
    document.getElementById('reset-button').addEventListener('click', function() {
        stopTimer(); // ✅ Detener el cronómetro antes de reiniciar
        startTime = null; // ✅ Reiniciar startTime
        startPuzzle(); // ✅ Reiniciar el juego correctamente
    });
    
});

document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("memorama");
    const timerElement = document.getElementById("tiempo");
    const resetButton = document.getElementById("reset-button");
    const symbols = ["🍎", "🍌", "🍒", "🍇", "🍉", "🍓", "🍍", "🥑"];
    let cards = [...symbols, ...symbols];
    let flippedCards = [];
    let matchedPairs = 0;
    let startTime;
    let timerInterval;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createBoard() {
        grid.innerHTML = "";
        shuffle(cards);
        cards.forEach((symbol, index) => {
            const card = document.createElement("div");
            card.classList.add("card-memorama");
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.addEventListener("click", flipCard);
            grid.appendChild(card);
        });
    
        stopTimer();  // Detiene cualquier cronómetro previo
        startTime = Date.now();  // 🔹 Asigna startTime correctamente aquí
        startTimer(); // 🔹 Inicia el cronómetro después de definir startTime
    }
      

    function flipCard() {
        if (flippedCards.length < 2 && !this.classList.contains("flipped")) {
            this.textContent = this.dataset.symbol;
            this.classList.add("flipped");
            flippedCards.push(this);

            if (flippedCards.length === 2) {
                setTimeout(checkMatch, 500);
            }
        }
    }

    function checkMatch() {
        if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
            flippedCards.forEach(card => card.removeEventListener("click", flipCard));
            matchedPairs++;
    
            if (matchedPairs === symbols.length) {
                stopTimer(); // ✅ Detener el cronómetro
    
                if (typeof startTime === "undefined" || startTime === null) {
                    console.error("⚠ Error: startTime no está definido. No se puede calcular el tiempo.");
                    return;
                }
    
                // ✅ Calcular el tiempo correctamente
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsedTime / 60);
                const seconds = elapsedTime % 60;
    
                setTimeout(() => {
                    alert(`¡Felicidades! Has completado el memorama en ${minutes}:${seconds < 10 ? "0" : ""}${seconds} minutos.`);
                }, 300);
            }
        } else {
            flippedCards.forEach(card => {
                card.textContent = "";
                card.classList.remove("flipped");
            });
        }
        flippedCards = [];
    }
    
  
    resetButton.addEventListener("click", () => {
        stopTimer(); // ✅ Detener el cronómetro
        matchedPairs = 0;
        flippedCards = [];
        startTime = null; // ✅ Asegurar que startTime se reinicie antes de volver a asignarlo
        createBoard();
    });
    

    createBoard();
});
