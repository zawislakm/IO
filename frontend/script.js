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
        
      console.log(response)
      if (response.ok) {
        return response.json();
      } else {
        console.log(response)
        throw new Error("Wystąpił błąd podczas przesyłania pliku.");
      }
    })
    .then(data => {
      alert("Plik CSV został pomyślnie przesłany.\nNazwa: " + data.file + "\nTyp zawartości: " + data.content);
    })
    .catch(error => {
      console.error('Błąd:', error);
      alert(error.message);
    });
  }
  