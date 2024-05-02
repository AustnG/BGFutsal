// Tutorial: https://www.youtube.com/watch?v=I-sf2ojxgQ0&ab_channel=mccormix
// Database: https://www.npmjs.com/package/csvtojson#browser-usage

// BG Futsal Database -> "Teams" sheet
const googleSheetURL = "https://docs.google.com/spreadsheets/d/1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E/export?format=csv&gid=898919565";
const googleSheetDataFilter = "&sq=filter(SEASON = '2024 Spring B')";
const dynamicUrl = googleSheetURL + googleSheetDataFilter;

const tableBuilder = document.querySelector("tbody");
tableBuilder.innerHTML = "<p>Loading...</p>";

fetch(dynamicUrl).then(result => result.text()).then(function (csvtext) {
    tableBuilder.innerHTML = "";
    return csv().fromString(csvtext);
}).then(function (csv) {
    // tableBuilder.innerHTML = "<code>" + JSON.stringify(csv) + "</code>";
    csv.forEach(function (row) {
        tableBuilder.innerHTML +=
            "<td>" + row.SEASON + " </td>" +
            "<td>" + row.RANK + " </td>" +
            "<td>" + row.TEAM + "</td>" +
            "<td>" + row.GP + "</td>" +
            "<td>" + row.W + "</td>" +
            "<td>" + row.D + "</td>" +
            "<td>" + row.L + "</td>" +
            "<td>" + row.GF + "</td>" +
            "<td>" + row.GA + "</td>" +
            "<td>" + row.GD + "</td>" +
            "<td>" + row.PTS + "</td>";
    })
});

/*
const desiredSeason = "2024 Spring B"; // Replace with your desired season

function filterBySeason(data) {
    return data.filter(row => row.SEASON === desiredSeason);
}

csv.then(function (data) {
    const filteredData = filterBySeason(data);
    filteredData.forEach(function (row) {
        tableBuilder.innerHTML +=
            "<td>" + row.RANK + " </td>" +
            "<td>" + row.TEAM + "</td>" +
            "<td>" + row.GP + "</td>" +
            "<td>" + row.W + "</td>" +
            "<td>" + row.D + "</td>" +
            "<td>" + row.L + "</td>" +
            "<td>" + row.GF + "</td>" +
            "<td>" + row.GA + "</td>" +
            "<td>" + row.GD + "</td>" +
            "<td>" + row.PTS + "</td>";
    });
});
*/