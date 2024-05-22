function loadContent(url, containerElement) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        containerElement.innerHTML = data;
      })
      .catch(error => {
        console.error('Error fetching content:', error);
        // Implement user-friendly error handling here (optional)
      });
  }
  
  const bracketContainer = document.getElementById('bracket-container');
    
  loadContent('tournyBracket.html', bracketContainer);