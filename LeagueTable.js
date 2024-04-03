// Replace with your actual Spreadsheet ID and deployed web app URL
const SPREADSHEET_ID = '1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E';
const SHEET_TITLE = 'Teams';
const FILTER_URL = 'https://script.google.com/macros/s/AKfycby7VwWIl1WQa820236RA5P3y2D_sOaAX_m3Q_6DucXlOXi5K61kpC7WzKghbTPhQ4E/exec';

// Function to fetch data from Google Sheet
function fetchData(filters) {
    const url = `${FILTER_URL}&sheet=${SHEET_TITLE}&filters=${JSON.stringify(filters)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => updateTable(data))
        .catch(error => console.error('Error fetching data:', error));
}

// Function to update the table with retrieved data
function updateTable(data) {
    const tableBody = document.getElementById('tableData');
    tableBody.innerHTML = ''; // Clear existing data

    data.forEach(row => {
        const tableRow = document.createElement('tr');
        row.forEach(cell => {
            const tableCell = document.createElement('td');
            tableCell.textContent = cell;
            tableRow.appendChild(tableCell);
        });
        tableBody.appendChild(tableRow);
    });
}

// Function to populate dropdown options
function populateDropdowns() {
    const yearDropdown = document.getElementById('yearDropdown');
    const seasonDropdown = document.getElementById('seasonDropdown');
    const divisionDropdown = document.getElementById('divisionDropdown');

    // Add year options
    const years = ['2021', '2022', '2023', '2024'];
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearDropdown.appendChild(option);
    });

    // Select default year (2024)
    yearDropdown.value = '2024';

    // Add season options
    const seasons = ['Spring', 'Winter'];
    seasons.forEach(season => {
        const option = document.createElement('option');
        option.value = season;
        option.text = season;
        seasonDropdown.appendChild(option);
    });

    // Select default season (Winter)
    seasonDropdown.value = 'Winter';

    // Add division options
    const divisions = ['A', 'B'];
    divisions.forEach(division => {
        const option = document.createElement('option');
        option.value = division;
        option.text = division;
        divisionDropdown.appendChild(option);
    });

    // Select default division (A)
    divisionDropdown.value = 'A';
}

// Call functions on page load
populateDropdowns();
fetchData({}); // Initial fetch without filters
