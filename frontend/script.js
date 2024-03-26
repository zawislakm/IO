// import { SingleValueVariableModel } from "./models.js";
// import { DependencyModel } from './models.js';

var fileName = "";
var csvHeaders;
var eventLog;

function uploadCSV() {
    var fileInput = document.getElementById('csvFileInput');
    var file = fileInput.files[0];

    if (!file) {
        alert("Wybierz plik CSV do przesłania.");
        return;
    }

    var formData = new FormData();
    formData.append('uploaded_file', file);

    uploadCsvTable(file);
  
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
    fetch('http://127.0.0.1:8000/download/' + fileName)
        .then(response => {
            if (response.ok) {
                return response.blob();
            } else {
                throw new Error("Wystąpił błąd podczas pobierania pliku.");
            }
        })
        .then(blob => {
            console.log(blob)
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

function getCurrentCSV() {
  if (fileName == "") {
      alert("Brak pliku csv.")
      return
  }
  fetch('http://127.0.0.1:8000/download/' + fileName)
      .then(response => {
          if (response.ok) {
              return response.blob();
          } else {
              throw new Error("Wystąpił błąd podczas pobierania aktualnego pliku.");
          }
      })
      .then(response => response.text())
      .then(data => parseCSVAndGenerateTable(data))
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
    updateSelectLists();
  })
  .catch(error => {
    console.error('Błąd:', error);
    alert(error.message);
  });
}

function updateSelectList(selectElement) {
  selectElement.innerHTML = '';
  csvHeaders.forEach(header => {
    var option = document.createElement("option");
    option.text = header.name;
    option.value = header.column_index;
    selectElement.appendChild(option);
  });
}

function updateSelectLists() {
  updateSelectList(document.getElementById("variables"));
  updateSelectList(document.getElementById("case_ID"));
  updateSelectList(document.getElementById("action"));
  updateSelectList(document.getElementById("timestamp"));
  updateSelectList(document.getElementById("cluster"));
}

// DISPLAY CSV
function uploadCsvTable(file) {
  var reader = new FileReader();
    reader.onload = function(e) {
      var csvData = e.target.result;
      parseCSVAndGenerateTable(csvData);
    };
    reader.readAsText(file);
}

function parseCSVAndGenerateTable(csvData) {
    var lines = csvData.split('\n');
    var tableHTML = '<tr>';
    lines.forEach(function (line) {
        var cells = line.split(';');
        tableHTML += '<tr>';
        cells.forEach(function (cell) {
            tableHTML += '<td>' + cell + '</td>';
        });
        tableHTML += '</tr>';
    });
    tableHTML += '</table>';

    document.getElementById('csvTable').innerHTML = tableHTML;
}

// EDIT VARIABLE FORM
function changeVariableName() {
    let oldVariableIndex = document.getElementById('variables').value
    let newVariableName = document.getElementById('newVariableName').value
    let editedColumn = []
    editedColumn.push(new CSVColumn(oldVariableIndex, newVariableName))
    console.log(newVariableName)

    fetch('http://127.0.0.1:8000/variable/' + fileName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedColumn)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Wystąpił błąd podczas edytowania zmiennej.");
            }
        })
        .then(data => {
            alert("Zmienna została pomyślnie edytowana.");
            getCSVHeaders(); // Po uploadzie od razu pobieramy wszystkie headery
            getCurrentCSV();
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert(error.message);
        });

    document.getElementById('variableEditForm').reset();
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
    console.log("XD");
    console.log(newVariable);
    console.log(typeof newVariable);

    fetch('http://127.0.0.1:8000/new/variables/' + fileName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVariable) // Odkomentowana linia
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Wystąpił błąd wysyłnia nowych zmiennych");
            }
        })
        .then(data => {
            alert("Nowe zmienne zostały wysłane");
            getCSVHeaders(); // Po uploadzie od razu pobieramy wszystkie headery
            getCurrentCSV();
        })
        .catch(error => {
            console.error('Błąd:', error);
            alert(error.message);
        });


    DependencyList = [];
    SingleValueVariableList = [];
    document.getElementById('variableForm').reset();
}

// ADD LABELS FORM

function createLiElement(label, name, list) {
  const li = document.createElement('li');
  li.textContent = `${label}: ${name}`;
  list.appendChild(li);
}

function addLabels() {
  let case_ID = document.getElementById('case_ID').value;
  let action = document.getElementById('action').value;
  let timestamp = document.getElementById('timestamp').value;
  let cluster = document.getElementById('cluster').value;

  const labelsList = document.getElementById('labelsList');
  labelsList.innerHTML = '';
  createLiElement('case_ID', csvHeaders[case_ID].name, labelsList)
  createLiElement('action', csvHeaders[action].name, labelsList)
  createLiElement('timestamp', csvHeaders[timestamp].name, labelsList)
  createLiElement('cluster', csvHeaders[cluster].name, labelsList)

  eventLog = new EventLog(case_ID, timestamp, action, cluster)

  console.log(eventLog)

  document.getElementById('labelForm').reset();
}

// GET VISUALISATION

function showVisualisation() {
    if (eventLog === undefined) {
        alert("Brak dodanych oznaczeń.");
        return;
    }

    fetch('http://127.0.0.1:8000/variable/visualize/' + fileName, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventLog)
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        } else {
            throw new Error("Wystąpił błąd podczas ładowania wizualizacji.");
        }
    })
    .then(blob => {
        const url = URL.createObjectURL(blob);
        const imgElement = document.getElementById('visualisation');
        imgElement.src = url;
        imgElement.style.display = 'block';
        alert("Wizualizacja została pomyślnie załadowana.");
    })
    .catch(error => {
        console.error('Błąd:', error);
        alert(error.message);
    });
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

class CSVColumn {
    constructor(column_index, name) {
        this.column_index = column_index;
        this.name = name
    }
}

class EventLog {
    constructor(case_ID, timestamp, action, cluster) {
      this.case_ID = case_ID
      this.timestamp = timestamp
      this.action = action
      this.cluster = cluster
    }
}
