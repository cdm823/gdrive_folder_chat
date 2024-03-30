function cleanData(str) {
    return str
        .split('\n').join(' ') // Replace newline characters with space
        .split('\t').join(' ') // Replace tab characters with space
        .replace(/\s\s+/g, ' ') // Replace multiple spaces with one
        .trim(); // Remove spaces at the start and end of the string
}

function obj_to_arr(data) {

const header = Object.keys(data[0]);
const return_arr = data.map(e => Object.values(e));
return_arr.unshift(header);

return return_arr;

}

function get_active_sheet_obj() {
  return arr_to_obj(
    SpreadsheetApp
    .getActiveSpreadsheet()
    .getActiveSheet()
    .getDataRange()
    .getValues()
    );
}

function paste_obj_to_active_sheet(data) {
  
  const arr = obj_to_arr(data);
  const ss_dest = SpreadsheetApp
  .getActiveSpreadsheet()
  .getActiveSheet();

  ss_dest.clearContents();
  
  SpreadsheetApp.flush();
  
  ss_dest
  .getRange(1, 1, arr.length, arr[0].length)
  .setValues(arr);
}

function obj_to_ss(data, ss_num) {
arr_to_ss(obj_to_arr(data), ss_num)
}

function arr_to_ss(data, ss_num) {

SpreadsheetApp.getActiveSpreadsheet()
.getSheets()[ss_num]
.clearContents();

SpreadsheetApp.flush();

SpreadsheetApp.getActiveSpreadsheet()
.getSheets()[ss_num]
.getRange(1, 1, data.length, data[0].length)
.setValues(data);
}

function arr_to_obj(data) {
const header = data.shift();
const return_obj = data.map(e => {
  const new_obj = {};
  e.map((z, num) => {
  Object.assign(new_obj, {[header[num]]: z});
  })
  return new_obj;
})
return return_obj;
}

function get_ss_data(ss_num) {

return SpreadsheetApp.getActiveSpreadsheet()
.getSheets()[ss_num]
.getDataRange()
.getValues()

}

function get_ss_data_obj(ss_num) {

return arr_to_obj(get_ss_data(ss_num));

}


function cosineSimilarity(a, b) {
    // Normalize the arrays to have the same length
    const maxLength = Math.max(a.length, b.length);
    a = a.concat(Array(maxLength - a.length).fill(0));
    b = b.concat(Array(maxLength - b.length).fill(0));
    // Calculate the dot product
    let dotProduct = 0;
    for (let i = 0; i < maxLength; i++) {
      dotProduct += a[i] * b[i];
    }
  
    // Calculate the magnitudes
    const aMagnitude = Math.sqrt(a.reduce((acc, val) => acc + val ** 2, 0));
    const bMagnitude = Math.sqrt(b.reduce((acc, val) => acc + val ** 2, 0));
  
    // Calculate the cosine similarity
    return dotProduct / (aMagnitude * bMagnitude);
  }


  function formatSizeUnits(bytes){
  if      (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
  else if (bytes >= 1048576)    { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
  else if (bytes >= 1024)       { bytes = (bytes / 1024).toFixed(2) + " KB"; }
  else if (bytes > 1)           { bytes = bytes + " bytes"; }
  else if (bytes == 1)          { bytes = bytes + " byte"; }
  else                          { bytes = "0 bytes"; }
  return bytes;
}