// ایجاد یک دسته کارت
const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const values = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

let deck = [];

// ایجاد ترکیب کارت‌ها
for (let suit of suits) {
    for (let value of values) {
        deck.push({suit, value});
    }
}

// مخلوط کردن کارت‌ها
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

deck = shuffle(deck);

// توزیع کارت‌ها به بازیکنان
function dealCards(deck, numPlayers, cardsPerPlayer) {
    let players = [];
    for (let i = 0; i < numPlayers; i++) {
        players.push(deck.splice(0, cardsPerPlayer));
    }
    return players;
}

let players = dealCards(deck, 2, 5);

// نمایش کارت‌های هر بازیکن
players.forEach((player, index) => {
    console.log(`Player ${index + 1}:`);
    player.forEach(card => console.log(`${card.value} of ${card.suit}`));
});

// سایر منطق بازی پوکر مانند شرط‌بندی و ارزیابی دست‌ها می‌تواند اضافه شود.
