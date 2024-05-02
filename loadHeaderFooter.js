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
  
  const headerContainer = document.getElementById('header-container');
  const footerContainer = document.getElementById('footer-container');
  
  loadContent('header.html', headerContainer);
  loadContent('footer.html', footerContainer);
  