function onOpen() {

  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('GPT Tools')
  .addItem('Folder Q&A', 'showDialog')
  .addItem('Embed New Folder', `processFolder`)
  .addToUi();
  


}