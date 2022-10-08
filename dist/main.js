import { removeFromFavourites } from '/dist/favourites.js'

if (!localStorage.getItem('hp-fav')) {
  localStorage.setItem('hp-fav', "[]");
}

// ================================================================
// STATE

let fetchedStudentsData;
let fetchedContent;
let isLoading = false;
let sortFilter = {
  name: '',
  order: ''
};
let latestSortFilterRef;

function removeActiveSortFilter() {
  if (latestSortFilterRef) {
    latestSortFilterRef.classList.remove('active');
  }
}

function resetSortFilter() {
  sortFilter.name = ''
  sortFilter.order = ''
}

// ================================================================
// UI ELEMENTS

const mainMenuElement = document.getElementById('main-menu');
const dataTable = document.querySelector('#data-table tbody');
const tableHead = document.querySelector('#data-table thead');
const modal = document.getElementById('modal');

// ================================================================
// DATA FETCHING LOGIC

mainMenuElement.addEventListener('click', async (e) => {
  // only works if fetch button
  if (e.target.dataset.fetchable) {
    let apiEndpoint = 'https://hp-api.herokuapp.com/api/characters/'
    switch (e.target.dataset.content) {
      case 'all':
        apiEndpoint += 'students';
        break;
      case 'house':
        apiEndpoint += `house/${e.target.dataset.house}`
        break;
      default:
        apiEndpoint += 'students';
        break;
    }
    
    try {
      let response = await fetch(apiEndpoint);
      let responseData = await response.json();
      fetchedStudentsData = responseData.map(person => {
        if (person.dateOfBirth) {
          let bd = person.dateOfBirth.split('-');
          // formating date of birth for easier sorting calculation
          // since js can't recognize DD-MM-YYYY format
           let parsedBirthDate = `${bd[1]}-${bd[0]}-${bd[2]}`

          return {
            ...person,
            dateOfBirth: new Date(parsedBirthDate)
          }
        } else {
          return person;
        }
      })
      updateTable(fetchedStudentsData);
      resetSortFilter();
    } catch (error) {
      console.log(error);      
    }
  }
})

// ================================================================
// DATA TABLE DOM UPDATE LOGIC

// 
function parsedDateOfBirth(person) {
  if (person.dateOfBirth) {
    let parsedDate = person.dateOfBirth.toDateString().split(' ');
    parsedDate.splice(0, 1);
    parsedDate = parsedDate.join(' ')
    return parsedDate;
  }
  return '-';
}

// Function that updates the table in dom with any given data
function updateTable(data) {
  dataTable.innerHTML = '';
  for(const student of data) {
    const newTableRow = document.createElement('tr');
    newTableRow.dataset.name = student.name;
    newTableRow.innerHTML = `
    <td>${student.name || '-'}</td>
    <td>${parsedDateOfBirth(student)}</td>
    <td>${student.house || '-'}</td>
    <td>${student.wizard || '-'}</td>
    <td>${student.ancestry || '-'}</td>
    <td>${student.hogwartsStudent ? 'Student' : student.hogwartsStaff ? 'Staff' : '-'}</td>
    `
    dataTable.append(newTableRow);
  }
  removeActiveSortFilter()
}

// DATA TABLE MODAL OPEN ON CLICK
dataTable.addEventListener('click', (e) => {
  if (e.target.parentElement.dataset.name) {
    openModal(e.target.parentElement.dataset.name)
  }
})

// DATA TABLE HEAD SORTING

tableHead.addEventListener('click', (e) => {
  if (fetchedStudentsData && e.target.dataset.sort) {

    const {sortName} = e.target.dataset;

    // function to return sorted data
    function sortData(data, order) {
      let sortedData = [...data];
      switch (order) {
        case 'asc':
          return sortedData.sort((a, b) => {
            // elements with no property data will be moved to the end of the table
            // this is to first show and sort elements which have particular property
            // it is only needed here, since descending order sorting will move them to the end anyway...
            if (a[sortName] && !b[sortName]) {
              return -1;
            }
            if (!a[sortName] && b[sortName]) {
              return 1;
            }
            if (!a[sortName] && !b[sortName]) {
              return 0;
            }
            if (a[sortName] < b[sortName]) {
              return -1;
            }
            if (a[sortName] > b[sortName]) {
              return 1;
            }
            return 0;
          });
        case 'desc':
          return sortedData.sort((a, b) => {
            if (a[sortName] > b[sortName]) {
              return -1;
            }
            if (a[sortName] < b[sortName]) {
              return 1;
            }
            return 0;
          });
        default:
          return;
      }
    }

    function updateTableDataAndSortButtons(order) {
      sortFilter.name = sortName;
      sortFilter.order = order;
      updateTable(sortData(fetchedStudentsData, order));

      latestSortFilterRef = document.querySelector(`[data-sort="${order}"][data-sort-name="${sortName}"]`)
      latestSortFilterRef.classList.add('active')
    }

    switch (e.target.dataset.sort) {
      case 'toggle':
        if (sortFilter.name === sortName) {
            if (sortFilter.order === 'asc') {
              updateTableDataAndSortButtons('desc')
            } else if (sortFilter.order === 'desc') {
              updateTableDataAndSortButtons('asc')
            }
        } else {
          updateTableDataAndSortButtons('asc')
        }
        break;
      case 'asc':
        updateTableDataAndSortButtons('asc')
        break;
      case 'desc':
        updateTableDataAndSortButtons('desc')
        break;
      default:
        return;
    }
  }
})

// ================================================================
// MODAL

function openModal(personName) {
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'modal-overlay';
  const personData = fetchedStudentsData.find(student => student.name === personName);

  function loopThroughWandProps(wand) {
    let wandPropsString = [];
    for (let key of Object.keys(wand)) {
      if (wand[key]) {
          if(key === 'length') {
          wandPropsString.push(`${wand[key]} inches`);
          continue;
        }
        wandPropsString.push(wand[key])
      }
    }

    return wandPropsString.join(', ');
  }

  let isFavourites = JSON.parse(localStorage.getItem('hp-fav'))?.find(person => person.name === personData.name) ? true : false;

  modalOverlay.innerHTML = `
  <div id="modal-content" class="${personData.house.toLowerCase()}">
    <img src="${personData.image}" alt="Character's picture" />
    <div data-main>
      <p>${personData.name}</p>
      <table>
        <tr>
          <td>Species:</td>
          <td>${personData.species || '-'}</td>
        </tr>
        <tr>
          <td>Gender:</td>
          <td>${personData.gender || '-'}</td>
        </tr>
        <tr>
          <td>House:</td>
          <td>${personData.house || '-'}</td>
        </tr>
        <tr>
          <td>Date of birth:</td>
          <td>${parsedDateOfBirth(personData)}</td>
        </tr>
        <tr>
          <td>Year of birth:</td>
          <td>${personData.yearOfBirth || '-'}</td>
        </tr>
      </table>
    </div>
    <div data-other>
      <b>OTHER DETAILS:</b>
      <table>
        <tr>
          <td>Ancestry:</td>
          <td>${personData.ancestry || '-'}</td>
        </tr>
        <tr>
          <td>Eye colour:</td>
          <td>${personData.eyeColour || '-'}</td>
        </tr>
        <tr>
          <td>Hair colour:</td>
          <td>${personData.hairColour || '-'}</td>
        </tr>
        <tr>
          <td>Wand:</td>
          <td>${loopThroughWandProps(personData.wand) || '-'}</td>
        </tr>
        <tr>
          <td>Patronus:</td>
          <td>${personData.patronus || '-'}</td>
        </tr>
        <tr>
          <td>Status:</td>
          <td>${personData.hogwartsStudent ? 'Hogwart student' : personData.hogwartsStaff ? 'Hogwart staff' : '-'}</td>
        </tr>
        <tr>
          <td>Actor:</td>
          <td>${personData.actor || '-'}</td>
        </tr>
      </table>
    </div>
    <button data-img="${personData.image}" data-name="${personData.name}" data-is-fav="${!!isFavourites}">${isFavourites ? 'Remove from favourites' : 'Add to favourites'}</button>
  </div>
  `
  modal.append(modalOverlay);

  modalOverlay.querySelector('button').addEventListener('click', favBtnClickHandler)
}

function closeModal(e) {
  if (e.target.id === 'modal-overlay') {
    e.target.remove();
  }
}

modal.addEventListener('click', closeModal)

function favBtnClickHandler() {
  if (this.dataset.isFav === "true") {
    let favourites = JSON.parse(localStorage.getItem('hp-fav'));
    favourites = favourites.filter(item => item.name !== this.dataset.name);

    localStorage.setItem('hp-fav', JSON.stringify(favourites));
    this.dataset.isFav = "false";
    this.innerText = "Add to favourites";
    return;
  }

  let favourites = JSON.parse(localStorage.getItem('hp-fav'));

  favourites = [...favourites, {
    name: this.dataset.name,
    image: this.dataset.img
  }]

  localStorage.setItem('hp-fav', JSON.stringify(favourites));
  this.dataset.isFav = "true";
  this.innerText = "Remove from favourites";
}