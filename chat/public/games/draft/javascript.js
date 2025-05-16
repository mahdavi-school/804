const players = {
    'Forward': [{name: 'محمد ضیا الدینی', img: 'url.jpg', overall: 99}, {name: 'حسن طهمورسی', img: 'url.jpg', overall: 80}, {name: 'ارشیا عزیز زاده', img: 'url.jpg', overall: 98}],
    'Midfielder': [{name: 'محمد حسن فدایی', img: 'url.jpg', overall: 99}, {name: 'رادین محسنی(تکلو)', img: 'url.jpg', overall: 90}, {name: 'سپهر فکوری', img: 'url.jpg', overall: 97}, {name: "کیان کاراموزیان", img: 'url.jpg', overall: 93}],
    'Defender': [{name: 'بردیا عسکریان', img: 'askarian photo.jpg', overall: 88}, {name: 'متین محمدی', img: 'url.jpg', overall: 94}, {name: "مهراد گرگانی", img: 'mehrad photo.jpg', overall: 92}, {name: 'علیرضا کریمی', img: 'url.jpg', overall: 85}, {name: 'امیرعلی گرانمایه', img: 'url.jpg', overall: 100}],
    'Goalkeeper': [{name: 'ابتین کاظمی پور', img: 'abtin photo.jpg', overall: 95}, {name: 'امیرعلی قرایی', img: 'url.jpg', overall: 96}]
};

let selectedPlayers = [];
let cardsOpened = 0;
let formationPositions = [];

function selectFormation(formation) {
    formationPositions = getFormation(formation);
    generateDraft();
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('draft').classList.remove('hidden');
}

function generateDraft() {
    let result = '';
    const usedPlayers = new Set();
    selectedPlayers = [];
    cardsOpened = 0;
    formationPositions.forEach((position, index) => {
        let randomIndex;
        let player;
        do {
            randomIndex = Math.floor(Math.random() * players[position].length);
            player = players[position][randomIndex];
        } while (usedPlayers.has(player.name));
        usedPlayers.add(player.name);
        selectedPlayers.push(player);

        result += `
            <div class="card ${position.toLowerCase()}" onclick="showPlayer(${index})">
                <div class="player-info hidden" id="player-${index}">
                    <img src="${player.img}" alt="${player.name}">
                    <h3>${player.name}</h3>
                    <p>${position}</p>
                    <p>Overall: ${player.overall}</p>
                </div>
            </div>`;
    });
    document.getElementById('result').innerHTML = result;
}

function getFormation(formation) {
    switch(formation) {
        case '4-4-2':
            return ['Goalkeeper', 'Defender', 'Defender', 'Defender', 'Defender', 'Midfielder', 'Midfielder', 'Midfielder', 'Midfielder', 'Forward', 'Forward'];
        case '4-3