// ================================================================
// STATE

let fetchedStudentsData;
let fetchedContent;
let isLoading = false;

// ================================================================
// UI ELEMENTS

const mainMenuElement = document.getElementById('main-menu');
const dataTable = document.querySelector('#data-table tbody');
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
      fetchedStudentsData = await response.json();
      updateTable(fetchedStudentsData);
    } catch (error) {
      console.log(error);      
    }
  }
})

// ================================================================
// DATA TABLE DOM UPDATE LOGIC

function updateTable(data) {
  dataTable.innerHTML = '';
  for(const student of data) {
    const newTableRow = document.createElement('tr');
    newTableRow.dataset.name = student.name;
    newTableRow.innerHTML = `
    <td>${student.name}</td>
    <td>${student.dateOfBirth}</td>
    <td>${student.house}</td>
    <td>${student.wizard}</td>
    <td>${student.ancestry}</td>
    <td>${student.hogwartsStudent ? 'Student' : student.hogwartsStaff ? 'Staff' : ''}</td>
    `
    dataTable.append(newTableRow);
  }
}

// DATA TABLE MODAL OPEN ON CLICK
dataTable.addEventListener('click', (e) => {
  if (e.target.parentElement.dataset.name) {
    openModal(e.target.parentElement.dataset.name)
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

  modalOverlay.innerHTML = `
  <div id="modal-content" class="${personData.house.toLowerCase()}">
    <img src="${personData.image}"/>
    <div data-main>
      <p>${personData.name}</p>
      <table>
        <tr>
          <td>Species:</td>
          <td>${personData.species}</td>
        </tr>
        <tr>
          <td>Gender:</td>
          <td>${personData.gender}</td>
        </tr>
        <tr>
          <td>House:</td>
          <td>${personData.house}</td>
        </tr>
        <tr>
          <td>Date of birth:</td>
          <td>${personData.dateOfBirth}</td>
        </tr>
        <tr>
          <td>Year of birth:</td>
          <td>${personData.yearOfBirth}</td>
        </tr>
      </table>
    </div>
    <div data-other>
      <p>OTHER DETAILS:</p>
      <table>
        <tr>
          <td>Ancestry:</td>
          <td>${personData.ancestry}</td>
        </tr>
        <tr>
          <td>Eye colour:</td>
          <td>${personData.eyeColour}</td>
        </tr>
        <tr>
          <td>Hair colour:</td>
          <td>${personData.hairColour}</td>
        </tr>
        <tr>
          <td>Wand:</td>
          <td>${loopThroughWandProps(personData.wand)}</td>
        </tr>
        <tr>
          <td>Patronus:</td>
          <td>${personData.patronus}</td>
        </tr>
        <tr>
          <td>Status:</td>
          <td>${personData.hogwartsStudent ? 'Hogwart student' : personData.hogwartsStaff ? 'Hogwart staff' : ''}</td>
        </tr>
        <tr>
          <td>Actor:</td>
          <td>${personData.actor}</td>
        </tr>
      </table>
    </div>
  </div>
  `
  modal.append(modalOverlay);
}

function closeModal(e) {
  if (e.target.id === 'modal-overlay') {
    e.target.remove();
  }
}

modal.addEventListener('click', closeModal)