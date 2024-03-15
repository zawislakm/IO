var fileName = "";
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