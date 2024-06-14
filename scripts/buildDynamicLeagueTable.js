// Tutorial: https://www.youtube.com/watch?v=I-sf2ojxgQ0&ab_channel=mccormix
// BG Futsal Database -> "Teams" sheet
const googleSheetURL = "https://docs.google.com/spreadsheets/d/1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E/export?format=csv&gid=898919565";

const seasonSelector = document.getElementById('seasonSelector');
const divisionSelector = document.getElementById('divisionSelector');

function updateTableData() {
  const selectedSeason = seasonSelector.value;
  const selectedDivision = divisionSelector.value;

  // update: add animation here eventually
  tableBuilder.innerHTML = "<td colspan='10' style='border:none; color:lightgrey;'><span class='loader'></span></br>Retrieving data...</td>";

  fetch(googleSheetURL)
    .then(result => result.text())
    .then(csvText => {
      tableBuilder.innerHTML = "";
      return csv().fromString(csvText);
    })
    .then(csv => {
      const filteredData = csv.filter(row => row.SEASON === selectedSeason + " " + selectedDivision);
      console.log(selectedSeason + " " + selectedDivision);

      filteredData.sort((rowA, rowB) => {
        // Sort by PTS (descending order)
        if (rowB.PTS - rowA.PTS !== 0) {
          return rowB.PTS - rowA.PTS;
        }
        // If PTS are equal, sort by GD (descending order)
        if (rowB.GD - rowA.GD !== 0) {
          return rowB.GD - rowA.GD;
        }
        // If PTS and GD are equal, sort by GA (ascending order)
        return rowA.GA - rowB.GA;
      });

      const desiredColumns = ['TEAM', 'GP', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'];

      let rank = 1;
      filteredData.forEach(row => {
        const tableRow = document.createElement('tr');

        const positionCell = document.createElement('td');
        positionCell.innerText = rank;
        tableRow.appendChild(positionCell);
        rank++;

        desiredColumns.forEach(columnName => {
          const tableCell = document.createElement('td');
          tableCell.innerText = row[columnName];
          tableRow.appendChild(tableCell);
        });

        tableBuilder.appendChild(tableRow);
      });
    })
    .catch(error => {
      console.error('Error fetching or parsing data:', error);
      tableBuilder.innerHTML = "<p>Error retrieving stats. Please try again later.</p>";
    });
}

// Call updateTableData initially to populate with default selections
updateTableData();