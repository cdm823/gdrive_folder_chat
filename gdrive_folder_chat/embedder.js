function embedQuery(query) {
  
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty("OPENAI_API_KEY");
  const API_URL = 'https://api.openai.com/v1/embeddings'

  const payload = {
        model: scriptProperties.getProperty("EMBEDDING_MODEL"),
        input: query,
    }

  const options = {
    method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    payload: JSON.stringify(payload)
  }

  const res = UrlFetchApp.fetch(API_URL, options);
  const embedding = JSON.parse(res.getContentText()).data[0].embedding;

  return embedding;

}



function embedChunks(files) {
  
  const listedChunks = files.map(e => e.chunk);
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty("OPENAI_API_KEY");
  const API_URL = 'https://api.openai.com/v1/embeddings';

  const payload = {
      model: scriptProperties.getProperty("EMBEDDING_MODEL"),
      input: listedChunks,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    payload: JSON.stringify(payload)
  };

  const res = UrlFetchApp.fetch(API_URL, options);
  const parsedRes = JSON.parse(res.getContentText());
  
  const embeddings = parsedRes.data;
  const objectsWithEmbeddings = files.map((object, index) => ({
    ...object, 
    embedding: `[${embeddings[index].embedding}]`,
    tokenLength: (object.chunk.length / 4)
  }));

  return objectsWithEmbeddings;

}

