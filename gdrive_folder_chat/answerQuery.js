function queryRAG(query) {
  
  const embeddings = get_active_sheet_obj();
  const queryEmbedding = embedQuery(query);

  embeddings.map(e => {
      e.cosine_similarity = cosineSimilarity(JSON.parse(e.embedding), queryEmbedding);
      return e;
    })

  const relevantChunks = embeddings.sort((a, b) => b.cosine_similarity - a.cosine_similarity)
  .slice(0, 10);
  let text = '';
  
  relevantChunks.forEach(file => {
    console.log(file.name)
    const str = `Folder Name: ${file.folderName}| File URL: ${file.webViewLink}
    File Snippet: ${file.chunk}`
    text += str
  })

  return text;

}
