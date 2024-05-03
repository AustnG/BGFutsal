// Tutorial: https://www.youtube.com/watch?v=I-sf2ojxgQ0&ab_channel=mccormix
// Database: https://www.npmjs.com/package/csvtojson#browser-usage

// BG Futsal Database -> "Teams" sheet
const googleSheetURL = "https://docs.google.com/spreadsheets/d/1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E/export?format=csv&gid=898919565";

const seasonSelector = document.getElementById('seasonSelector');
const tableBuilder = document.querySelector("tbody");

function updateTableData() {
    const selectedSeason = seasonSelector.value;
    tableBuilder.innerHTML = "<p>Retrieving latest stats..</p>";

    fetch(googleSheetURL)
        .then(result => result.text())
        .then(csvText => {
            tableBuilder.innerHTML = "";
            return csv().fromString(csvText);
        })
        .then(csv => {
            const filteredData = csv.filter(row => row.SEASON === selectedSeason);

            filteredData.sort((rowA, rowB) => {
                // Sort by PTS (DESC)
                if (rowB.PTS - rowA.PTS !== 0) {
                    return rowB.PTS - rowA.PTS;
                }
                // If PTS are equal, sort by GD (DESC)
                if (rowB.GD - rowA.GD !== 0) {
                    return rowB.GD - rowA.GD;
                }
                // Does this need to be changed to DESC as well??
                // If PTS and GD are equal, sort by GA (ASC)
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

// Call updateTableData initially to populate with default selection ("2024 Spring B")
updateTableData();
