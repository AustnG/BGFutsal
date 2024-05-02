const tableBody = document.getElementById("standingsTable").getElementsByTagName("tbody")[0];
const data = [
  { Rank: 1, TEAM: "Bosanceros", GP: 7, W: 6, D: 0, L: 1 , GF: 60, GA: 29, GD: 31, PTS: 18},
  { Rank: 2, TEAM: "Sonsonate FC", GP: 7, W: 6, D: 0, L: 1 , GF: 49, GA: 23, GD: 26, PTS: 18},
  { Rank: 3, TEAM: "Atletico Colon", GP: 7, W: 5, D: 2, L: 0 , GF: 28, GA: 20, GD: 8, PTS: 17},
  { Rank: 4, TEAM: "Toasty FC", GP: 7, W: 4, D: 2, L: 1 , GF: 25, GA: 17, GD: 8, PTS: 14},
  { Rank: 5, TEAM: "RPG FC", GP: 7, W: 4, D: 0, L: 3 , GF: 32, GA: 26, GD: 6, PTS: 12},
  { Rank: 6, TEAM: "La Banderas", GP: 7, W: 4, D: 0, L: 3 , GF: 28, GA: 33, GD: -5, PTS: 12},
  { Rank: 7, TEAM: "Orion FC", GP: 7, W: 3, D: 1, L: 3 , GF: 26, GA: 26, GD: 0, PTS: 10},
  { Rank: 8, TEAM: "Los Bears", GP: 7, W: 3, D: 0, L: 4 , GF: 32, GA: 31, GD: 1, PTS: 9},
  { Rank: 9, TEAM: "IZR", GP: 7, W: 3, D: 0, L: 4 , GF: 19, GA: 27, GD: -8, PTS: 9},
  { Rank: 10, TEAM: "Motozintla Chiapaz", GP: 7, W: 2, D: 0, L: 5 , GF: 22, GA: 30, GD: -8, PTS: 6},
  { Rank: 11, TEAM: "Magic Moments", GP: 7, W: 2, D: 0, L: 5 , GF: 22, GA: 36, GD: -14, PTS: 6},
  { Rank: 12, TEAM: "Semline", GP: 7, W: 1, D: 0, L: 6 , GF: 18, GA: 30, GD: -12, PTS: 3},
  { Rank: 13, TEAM: "Traviesos FC", GP: 5, W: 0, D: 2, L: 3, GF: 17, GA: 39, GD: -22, PTS: 2},
  { Rank: 14, TEAM: "CD Olimpia", GP: 5, W: 0, D: 1, L: 4, GF: 9, GA: 20, GD: -11, PTS: 1}
];

function populateTable() {
  tableBody.innerHTML = ""; // Clear existing rows

  data.forEach((team) => {
    const row = document.createElement("tr");
    for (const key in team) {
      const cell = document.createElement("td");
      cell.innerText = team[key];
      row.appendChild(cell);
    }
    tableBody.appendChild(row);
  });
}

populateTable();