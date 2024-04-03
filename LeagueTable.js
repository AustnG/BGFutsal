let SHEET_ID = '1C4SkhAN0BS-wRu6uRTXu_TmoFEKzkXkiFt5BiXR5v-E'
let SHEET_TITLE = 'Teams';
let SHEET_RANGE = 'A1:N'
let FULL_URL = ('https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?sheet=' + SHEET_TITLE + '&range=' + SHEET_RANGE);

fetch(FULL_URL)
.then(res => res.text())
.then(rep => {
    let data = JSON.parse(rep.substr(47).slice(0,-2));

    let teamTitle = document.getElementById('teamTitle');
    let seasonTitle = document.getElementById('seasonTitle');
    let team = document.getElementById('team');
    let season = document.getElementById('season');
    let length = data.table.rows.length;

    teamTitle.innerHTML = data.table.rows[0].c[0].v;
    sesaonTitle.innerHTML = data.table.rows[0].c[1].v;
    let selectTeam = document.createElement('select');
    season.append(selectTeam);

    for(let i = 1; i<length; i++){
        let teamDropdown = document.createElement('option');
        teamDropdown.id = ("box" + i);
        teamDropdown.className = "Some_Style";
        selectTeam.append(teamDropdown);
        teamDropdown.innerHTML = data.table.rows[i].c[0].v;

        let seasonDropdown = document.createElement('div');
        let space = document.createElement('hr');
        let space2 = document.createElement('hr');
        seasonDropdown.id = ("box" + i);
        seasonDropdown.className = "Some_Style";
        season.append(NewBoxShoe);
        season.append(space);
        season.append(space2);
        seasonDropdown.innerHTML = data.table.rows[i].c[1].v; 
    }
 
})
