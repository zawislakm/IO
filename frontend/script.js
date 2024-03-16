// import { SingleValueVariableModel } from "./models.js";
// import { DependencyModel } from './models.js';

var fileName = "";
var csvHeaders;

function uploadCSV() {
    var fileInput = document.getElementById('csvFileInput');
    var file = fileInput.files[0];
  
    if (!file) {
      alert("Wybierz plik CSV do przesłania.");
      return;
    }
  
    var formData = new FormData();
    formData.append('uploaded_file', file);
  
    fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
        
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Wystąpił błąd podczas przesyłania pliku.");
      }
    })
    .then(data => {
      fileName = data.file;
      alert("Plik CSV został pomyślnie przesłany.\nNazwa: " + data.file + "\nTyp zawartości: " + data.content);
      getCSVHeaders(); // Po uploadzie od razu pobieramy wszystkie headery
    })
    .catch(error => {
      console.error('Błąd:', error);
      alert(error.message);
    });
  }
  
  function downloadCSV() {
    if (fileName == "") {
      alert("Najpierw prześlij plik csv")
      return
    }
    fetch('http://127.0.0.1:8000/download/'+fileName)
    .then(response => {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error("Wystąpił błąd podczas pobierania pliku.");
      }
    })
    .then(blob => {
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error('Błąd:', error);
      alert(error.message);
    });
  }

  
function getCSVHeaders() {
  fetch('http://127.0.0.1:8000/variable/' + fileName)
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Wystąpił błąd podczas pobierania nagłówków CSV.");
    }
  })
  .then(data => {
    csvHeaders = data; // Dostajemy liste elementow column_index i name
    displayCSVHeaders();
  })
  .catch(error => {
    console.error('Błąd:', error);
    alert(error.message);
  });
}

function displayCSVHeaders() {
  const headersList = document.getElementById('csvHeadersList');
  headersList.innerHTML = '';

  csvHeaders.forEach(header => {
    const li = document.createElement('li');
    li.textContent = `${header.column_index}: ${header.name}`;
    headersList.appendChild(li);
  });
}


// ADD VARIABLE FORM
let DependencyList = []; // Tablica przechowująca trójki danych
let SingleValueVariableList = [] // Tablica przechowujaca zaleznosci i wartosci dla tych zaleznosci

function addDataRow() {
  document.getElementById('')
  DependencyList.push(new DependencyModel(document.getElementById('firstVariableInput').value, document.getElementById('secondVariableInput').value, document.getElementById('dependencyInput').value));
  document.getElementById('firstVariableInput').id = '_'
  document.getElementById('dependencyInput').id = '_'
  document.getElementById('secondVariableInput').id = '_'
  addNewDependencyRow();
}


function addVariableValue() {
  let variableValue = document.getElementById('variableValue').value;
  SingleValueVariableList.push(new SingleValueVariableModel(DependencyList, variableValue));
  document.getElementById('variableValue').value = ''
  dataInputs.innerHTML = '';
  addNewDependencyRow();
  
  DependencyList = []
  console.log(SingleValueVariableList);
}

function addNewDependencyRow() {
  const dataInputs = document.getElementById('dataInputs');
  const newRow = document.createElement('div');
  newRow.classList.add('data-row');

  const firstVariableInput = document.createElement('input');
  firstVariableInput.type = 'text';
  firstVariableInput.classList.add('data-input');
  firstVariableInput.name = 'firstVariableName';
  firstVariableInput.required = true;
  firstVariableInput.id = 'firstVariableInput'

  const dependencyInput = document.createElement('input');
  dependencyInput.type = 'text';
  dependencyInput.classList.add('data-separator');
  dependencyInput.name = 'dependencyInput';
  dependencyInput.maxLength = 1;
  dependencyInput.required = true;
  dependencyInput.id = 'dependencyInput'

  const secondVariableInput = document.createElement('input');
  secondVariableInput.type = 'text';
  secondVariableInput.classList.add('data-input');
  secondVariableInput.name = 'secondVariableName';
  secondVariableInput.required = true;
  secondVariableInput.id = 'secondVariableInput'

  newRow.appendChild(firstVariableInput);
  newRow.appendChild(dependencyInput);
  newRow.appendChild(secondVariableInput);

  dataInputs.appendChild(newRow);
}

function addVariable() {

  let defaultValue = document.getElementById('defaultVariableValue').value;
  let variableName = document.getElementById('variableName').value;
  const newVariable = new VariableModel(SingleValueVariableList, defaultValue, variableName);

  // TUTAJ PRZESLANIE NEW VARIABLE DO API
  console.log(newVariable);


  DependencyList = [];
  SingleValueVariableList = [];
  document.getElementById('variableForm').reset();
}






// to trzeba do jakiegos innego pliku przeniesc ale nie chcialo to dzialac 

class DependencyModel {
  constructor(firstVariableName, secondVariableName, dependency) {
    this.firstVariableName = firstVariableName;
    this.secondVariableName = secondVariableName;
    this.dependency = dependency;
  }
}

class SingleValueVariableModel { //kozacka nazwa :)
  constructor(dependencyList, variableValue) {
      this.dependencyList = dependencyList;
      this.variableValue = variableValue;
  }
}

class VariableModel { 
  constructor(SingleValueVariableList, defaultValue, variableName) {
      this.SingleValueVariableList = SingleValueVariableList;
      this.defaultValue = defaultValue;
      this.variableName = variableName;
  }
}