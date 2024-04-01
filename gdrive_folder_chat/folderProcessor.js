function processFolder() {
  
  const folderUrl = SpreadsheetApp.getUi().prompt('Enter Folder URL:').getResponseText();
  const folderId = folderUrl.split('folders/')[1];
  const folderName = Drive.Files.get(folderId, {
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  }).name;
  let pageToken = null;
  const files = [];
  do {
    const filesResponse = Drive.Files.list({
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, webViewLink, size, createdTime, modifiedTime, parents, mimeType)',
      pageToken: pageToken
    });
    if (filesResponse.files && filesResponse.files.length > 0) {
      files.push(...filesResponse.files);
    }
    pageToken = filesResponse.nextPageToken;
  } while (pageToken);

  const oAuthToken = ScriptApp.getOAuthToken();

  files.forEach(file => {
    file.folderName = folderName;
    file.folderId = folderId;
    file.size = Number(file.size)
    file.token = oAuthToken;
  });

  const template = HtmlService.createTemplateFromFile('doc_processor');
  template.doc_files = JSON.stringify(files);
  const evaluatedTemp = template.evaluate();
  const html = HtmlService.createHtmlOutput(evaluatedTemp);
  SpreadsheetApp.getUi().showModalDialog(html, 'Extracting text from documents...');
}


function chunkAndEmbed(files) {

  const chunks = [];
  
  files.forEach(file => {
    delete file.token
    delete file.id
    chunks.push(...chunkText(file))
  });

  const headers = Object.keys(chunks[0]);
  const chunkObjects = chunks.map(chunk => 
    headers.reduce((obj, header) => ({ ...obj, [header]: chunk[header] }), {})
  );
  
  const filesWithEmbeddings = embedChunks(chunkObjects);

  paste_obj_to_active_sheet(filesWithEmbeddings);
  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().setName(files[0].folderName);
  SpreadsheetApp.getUi().alert('Embeddings finished!')


}

function chunkText(file) {
  const str = cleanData(file.text);
  delete file.text;
  const maxChunkSize = Number(PropertiesService.getScriptProperties().getProperty('EMBEDDING_CHUNK_SIZE'));

  const chunks = [];
  let chunkStart = 0;

  while (chunkStart < str.length) {
    let chunkEnd = Math.min(chunkStart + maxChunkSize, str.length);
    if (chunkEnd < str.length) { // If not the last chunk
      // Look backwards for a sentence end
      let lastPeriod = str.lastIndexOf('.', chunkEnd);
      let lastQuestion = str.lastIndexOf('?', chunkEnd);
      let lastExclamation = str.lastIndexOf('!', chunkEnd);
      let nearestEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
      if (nearestEnd > chunkStart) { // Found a closer sentence end within this chunk
        chunkEnd = nearestEnd + 1; // Include the punctuation in the chunk
      }
    }

    // Including file name in embedding -- helps search if informative
    const chunk = `File Name: ${file.name} | ` + str.substring(chunkStart, chunkEnd);
    const fileCopy = { ...file, chunk: chunk, chunkSize: chunk.length };
    chunks.push(fileCopy);

    // Move to the start of the next chunk
    chunkStart = chunkEnd;
  }

  return chunks;
}
