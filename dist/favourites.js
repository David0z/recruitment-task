const cardsContainer = document.getElementById('cards');
const menu = document.getElementById('menu');
let numInRowElem = document.querySelector('button[data-num="3"]');

let favouriteCards = JSON.parse(localStorage.getItem('hp-fav'));

if (favouriteCards) {
  favouriteCards.forEach(card => {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.img = card.image;
    card.house && cardElement.classList.add(card.house.toLowerCase());

    cardElement.innerHTML = `
    <img src="${card.image ? card.image : '/dist/hogwart.jpg'}" alt="Card picture"/>
    <p>${card.name}</p>
    <button data-name="${card.name}"></button>
    `
    cardsContainer.append(cardElement);
  })  
} else {
  cardsContainer.innerHTML = '<h2>You have no favourite cards</h2>'
}

menu.addEventListener('click', (e) => {
  if (e.target.dataset.num && favouriteCards) {
    if (e.target === numInRowElem) return;
    numInRowElem.classList.remove('active');
    numInRowElem = e.target;
    numInRowElem.classList.add('active');
    cardsContainer.dataset.cols = e.target.dataset.num;
  }
})

cardsContainer.addEventListener('click', (e) => {
  if (e.target.dataset.name) {
    let favourites = JSON.parse(localStorage.getItem('hp-fav'));
    favourites = favourites.filter(item => item.name !== e.target.dataset.name);
    localStorage.setItem('hp-fav', JSON.stringify(favourites));

    e.target.parentElement.remove();

    return;
  }
})