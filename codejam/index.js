console.log(`оценка 105 из 120 - реализовано все, кроме перетаскивания фишки мышкой`);
console.log(`добавлена возможность выбора поля 2х2 с целью упрощения проверки. Уточняла у админов курса, это не считается ошибкой`);


//* рендер сетки ===========================================================

function renderLayOut() {
    // --- создание контейнера
    let container = document.createElement('div');
    container.className = 'container';

    // --- создание блока кнопок
    let controls = document.createElement('div');
    controls.className = 'controls';

    // --- создание селекта
    let select = document.createElement('select');
    select.setAttribute('name', 'size');
    select.id = 'select-size';

    // --- наполнение селекта
    for (let i = 2; i <= 8; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}x${i}`;
        if (i == 4) {
            option.setAttribute('selected', 'selected');
        }
        select.append(option);
    }

    // --- вставка селекта в блок с кнопками
    controls.append(select);

    // --- создание и вставка кнопок в блок с кнопками
    let btnNames = ['shuffle', 'save', 'results'];
    btnNames.forEach(elem => {
        let btn = document.createElement('button');
        btn.className = `controls__item controls__item_${elem} ${elem}`;
        btn.textContent = elem.toUpperCase();
        controls.append(btn);

    })

    // --- создание и вставка кнопки звука в блок с кнопками
    let soundBtn = document.createElement('div');
    soundBtn.className = 'sounds-control';
    let soundTmblr = document.createElement('button');
    soundTmblr.className = 'sound-control__item';
    soundBtn.append(soundTmblr);
    controls.append(soundBtn);

    // --- вставка блока с кнопками в контейнер
    container.append(controls);


    // --- создание блока со статами
    let stats = document.createElement('div');
    stats.className = 'stats';

    // --- заполнение блока со статами
    let statsName = ['moves', 'timer'];
    statsName.forEach(elem => {
        let div = document.createElement('div');
        div.textContent = `${elem.toUpperCase()}:`;
        let stat = document.createElement('div');
        stat.className = elem;
        stat.textContent = elem === 'moves' ? '0' : '00:00';
        div.append(stat);
        stats.append(div);
    })

    // --- вставка блока со статами в контейнер
    container.append(stats);

    // --- создание и вставка обертки игрового поля
    let field = document.createElement('div');
    field.className = 'fifteen';
    container.append(field);

    // --- создание блока с результатами с содержимым
    let results = document.createElement('div');
    results.className = 'results-list';

    let table = document.createElement('table');
    let caption = document.createElement('caption');
    caption.textContent = 'Better results';
    table.append(caption);
    let row = document.createElement('tr');
    
    let columns = ['position', 'time', 'moves', 'field-size'];
    columns.forEach(elem => {
        let cell = document.createElement('th');
        cell.textContent = elem.toUpperCase();
        row.append(cell);
    })
    table.append(row);
    results.append(table);

    // --- вставка блока с результатами в верстку
    container.append(results);


    // --- создание и вставка блока для поздравлений
    let alert = document.createElement('div');
    alert.className = 'congratulations';
    container.append(alert);

    // --- вставка заполненного контейнера
    document.body.append(container);
}
renderLayOut()


//* general vars ====================================================================

const fifteenBox = document.querySelector('.fifteen');
const moves = document.querySelector('.moves');
const timer = document.querySelector('.timer');
const chooseSize = document.querySelector('#select-size');
const sizeOptions = document.querySelectorAll('option');
const shuffleBtn = document.querySelector('.shuffle');
const saveBtn = document.querySelector('.save');
const resultsBtn = document.querySelector('.results');
const soundBtn = document.querySelector('.sound-control__item');
const resultsBox = document.querySelector('.results-list');
const resultsTable = document.querySelector('table');
const congratulationsBox = document.querySelector('.congratulations');
let size = +chooseSize.value;
let matrixGlobal = [];
let minutes = 0;
let seconds = 0;

let results = [{
    moves: 19,
    time: '05:15'
}, {
    moves: 17,
    time: '04:12'
}, {
    moves: 51,
    time: '10:08'
}, {
    moves: 15,
    time: '03:29'
}, {
    moves: 25,
    time: '06:34'
}]



//* Helpers =========================================================================
// отрисовка плиток
function renderTiles(size) {
    fifteenBox.innerHTML = '';

    let arr = new Array((size * size)).fill(0).map((_elem, index) => index + 1);
    arr.forEach((elem) => {
        let div = document.createElement('div');
        div.classList.add('fifteen__item');
        div.textContent = elem;
        div.style.width = `${100/size}%`;
        div.style.height = `${100/size}%`;
        fifteenBox.append(div);
    })
}

// конвертирует массив в матрицу
function convertMatrix(arr, size) {
    const matrix = [];
    for (let i = 0; i < size; i++) {
        matrix.push([])
    }

    let y = 0;
    let x = 0;

    for (let i = 0; i < arr.length; i++) {
        if (x >= size) {
            y++;
            x = 0;
        }
        matrix[y][x] = arr[i];
        x++;
    }
    return matrix;
}

// управление позиционированием плиток в зависимости от координат в матрице
// array - массив с плитками
function setPositionTiles(matrix, array) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            const value = matrix[y][x];
            const tile = array[value - 1];
            tile.style.transform = `translate(${x*100}%, ${y*100}%)`;
        }
    }
}

// перемешивает массив рандомным образом
function shuffleArray(arr) {
    return arr
        .map(value => ({
            value,
            sort: Math.random()
        }))
        .sort((a, b) => a.sort - b.sort)
        .map(({
            value
        }) => value)
}

// определение координат плитки
function findCoordinates(n, matrix) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] === n) {
                return {
                    x,
                    y
                }
            }
        }
    }
    return null;
}


// определение возможности перемещения плитки на пустое место
function validateForSwap(c1, c2) {
    const diffX = Math.abs(c1.x - c2.x);
    const diffY = Math.abs(c1.y - c2.y);


    return (diffX === 1 || diffY === 1) && (c1.x === c2.x || c1.y === c2.y)
}

// перемещение плиток
function swap(c1, c2, matrix) {
    const c1Number = matrix[c1.y][c1.x];
    matrix[c1.y][c1.x] = matrix[c2.y][c2.x];
    matrix[c2.y][c2.x] = c1Number;
}

// изменение количества ходов
function changeCounter(elem) {
    +elem.textContent++;
}

// таймер
{
    function timerFn() {


        if (seconds > 59) {
            minutes++;
            seconds = 0;
        }

        timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        ++seconds;
    }

    function startTimer() {
        window.timerPlay = window.setInterval(timerFn, 1000)
    }

    function restartTimer() {
        seconds = 0;
        minutes = 0;
    }

    function stopTimer() {
        window.clearInterval(window.timerPlay);
    }
}

// сохранение состояния игры
function saveStatus() {
    let status = {
        moves: moves.textContent,
        minutes,
        seconds,
        matrixGlobal,
        boardSize: chooseSize.value,
        results
    }
    localStorage.setItem('status', JSON.stringify(status));
}


// звук движения плитки
const audio = new Audio();

function play() {
    audio.src = './sound.mp3';
    audio.currentTime = 0;
    audio.volume = 0.2;
    audio.play();
}


//результаты

// ------------ сортировка результатов по количеству ходов
function sortResults() {
    return (a, b) => a.moves > b.moves ? 1 : -1;
}

// ------------ отрисовка результатов в таблицу
function renderResults() {
    resultsTable.innerHTML = `<caption>Better results</caption>
    <tr><th>Position</th><th>Time</th><th>Moves</th></tr></div>`;
    results.sort(sortResults()).forEach((elem, index) => {
        let tableRow = document.createElement('tr');
        tableRow.innerHTML = `<td>${index+1}</td><td>${elem.time}</td><td>${elem.moves}</td>`;
        resultsTable.append(tableRow);
    })
}


//если пазл сошелся

function ifSolved() {
    let checkArray = matrixGlobal.flat();
    let isTrue = checkArray.every((e, i) => e === i + 1);
    if (isTrue) {
        stopTimer();
        let overlayBlock = document.createElement('div');
        overlayBlock.classList.add('fifteen__overlay');
        fifteenBox.append(overlayBlock);
        congratulationsBox.innerHTML = `
        <div>Hooray! You solved the puzzle in ${timer.textContent} and ${moves.textContent} moves!</div>
        `
        congratulationsBox.classList.add('congratulations_active');

        let elem = {
            moves: +moves.textContent,
            time: timer.textContent
        }
        results.push(elem);
        results.sort(sortResults());
        if (results.length <= 10) {
            renderResults();
        } else {
            results.pop();
            renderResults();
        }
    }
}



// проверка на решаемость
function checkMatrix(m) { //m - матрица
    let flatM = m.flat();
    let emptyIndex = flatM.indexOf(Math.pow(m.length, 2))
    let emptyTileRow = Math.floor(flatM.indexOf(Math.pow(m.length, 2)) / m.length);
    flatM.splice(emptyIndex, 1);

    let inversions = 0;

    for (let j = flatM.length - 1; j > 0; j--) {
        for (let i = 0; i < j; i++) {
            if (flatM[i] > flatM[i + 1]) {
                let temp = flatM[i];
                flatM[i] = flatM[i + 1];
                flatM[i + 1] = temp;
                inversions++;
            }
        }
    }

    if (m.length % 2 === 0) {
        return (inversions + emptyTileRow) % 2 === 0 ? false : true;
    } else {
        return inversions % 2 === 0 ? true : false
    }

}


//* отрисовка плиток ===========================================================


function render() {
    size = +chooseSize.value;

    //* отрисовка квадратиков
    renderTiles(size);

    //* позиционирование квадратиков
    const items = Array.from(document.querySelectorAll('.fifteen__item'));
    items.forEach(elem => {
        if (elem.textContent == `${size*size}`) {
            elem.style.display = 'none';
        }
    })
    let numbers = items.map(item => Number(item.textContent));
    numbers = shuffleArray(numbers);
    let matrix = convertMatrix(numbers, size);
    let check = checkMatrix(matrix);
    while (!check) {
        numbers = shuffleArray(numbers);
        matrix = convertMatrix(numbers, size);
        check = checkMatrix(matrix);
    }

    if (matrixGlobal.length !== 0) {
        setPositionTiles(matrixGlobal, items)
    } else {
        matrixGlobal = matrix;
        setPositionTiles(matrix, items);
    }
}


//* перемешивание

shuffleBtn.addEventListener('click', () => {
    let overlay = document.querySelector('.fifteen__overlay');
    if (overlay) {
        overlay.parentNode.removeChild(overlay)
    }
    matrixGlobal = [];
    render();
    moves.textContent = 0;
    stopTimer();
    restartTimer();
    startTimer();
})


//* смена позиции по клику

fifteenBox.addEventListener('click', (event) => {
    try {
        const blankNumber = size * size;
        const tile = event.target.closest('.fifteen__item');
        const tileNumber = +tile.textContent;
        const tileCoords = findCoordinates(tileNumber, matrixGlobal);
        const blankCoords = findCoordinates(blankNumber, matrixGlobal);
        const isValid = validateForSwap(tileCoords, blankCoords);
        const items = Array.from(document.querySelectorAll('.fifteen__item'));

        if (isValid) {

            swap(blankCoords, tileCoords, matrixGlobal); // перемещение
            setPositionTiles(matrixGlobal, items);
            changeCounter(moves); // увеличение количества ходов
            if (!soundBtn.classList.contains('sound-control__item_off')) { // проверяем, включать ли звук
                play();
            };
        }
    } catch (err) {}

})

//* проверяем, сошелся ли паззл
fifteenBox.addEventListener('transitionend', (event) => {
    if (event.target.classList.contains('fifteen__item')) {
        ifSolved();
    }
})

//* скрыть поздравление 
congratulationsBox.addEventListener('click', (event => {
    if (event.target.classList.contains('congratulations')) {
        congratulationsBox.classList.remove('congratulations_active');
    }
}))

//* выбор размера
chooseSize.addEventListener('change', function () {
    size = +this.value;
    matrixGlobal = [];
    moves.textContent = '0';
    render();
    stopTimer();
    restartTimer();
    startTimer();
});

//* включение-выключение звука плиток
soundBtn.addEventListener('click', () => {
    soundBtn.classList.toggle('sound-control__item_off');
})

//* показать результаты
resultsBtn.addEventListener('click', () => {
    resultsBox.classList.add('results-list_active');
})

//* спрятать результаты
resultsBox.addEventListener('click', (event) => {
    if (event.target.classList.contains('results-list')) {
        resultsBox.classList.remove('results-list_active')
    }
})

//*сохранение состояния игры
saveBtn.addEventListener('click', () => {
    saveStatus();
})

window.addEventListener('beforeunload', saveStatus);

window.addEventListener('load', () => {
    if (!localStorage.getItem('status')) {
        render();
        startTimer();
        renderResults();

    } else {
        let status = JSON.parse(localStorage.getItem('status'));
        matrixGlobal = status.matrixGlobal;
        seconds = status.seconds;
        minutes = status.minutes;
        moves.textContent = status.moves;
        chooseSize.value = +status.boardSize;
        results = status.results;

        render();
        startTimer();
        renderResults();
    }
})