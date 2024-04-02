function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('LeagueTable')
      .setTitle('League Table');
  }
  
  function getTableData(year, season, division) {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var filteredData = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (year != "" && row[0] != year) continue; // Filter Year
      if (season != "" && row[1] != season) continue; // Filter Season
      if (division != "" && row[2] != division) continue; // Filter Division
      filteredData.push(row);
    }
    return filteredData;
  }