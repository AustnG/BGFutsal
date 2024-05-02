// BG Futsal Database -> "Teams" sheet
const googleSheetURL = "https://docs.google.com/spreadsheets/d/1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E/export?format=csv&gid=898919565";

fetch(googleSheetURL).then(result => result.text()).then(function (csvText) {
    tableBuilder.innerHTML = "";
    return csv().fromString(csvText);
}).then(function (csv) {
    // tableBuilder.innerHTML = "<code>" + JSON.stringify(csv) + "</code>";
    csv.forEach(function (row) {
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
    })
});


google.charts.load('current', { 'packages': ['table'] });
google.charts.setOnLoadCallback(drawTable);

function drawTable() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'RANK');
    data.addColumn('string', 'TEAM');
    data.addColumn('number', 'GP');
    data.addColumn('number', 'W');
    data.addColumn('number', 'D');
    data.addColumn('number', 'L');
    data.addColumn('number', 'GF');
    data.addColumn('number', 'GA');
    data.addColumn('number', 'GD');
    data.addColumn('number', 'PTS');

    data.addRows([
        [1, "Bosanceros", 7, 6, 0, 1, 60, 29, 31, 18],
        [2, "Sonsonate FC", 7, 6, 0, 1, 49, 23, 26, 18],
        [3, "Atletico Colon", 7, 5, 2, 0, 28, 20, 8, 17 ],
    ]);

    var table = new google.visualization.Table(document.getElementById('table_div'));

    table.draw(data, { width: '80%', height: '100%' });
}