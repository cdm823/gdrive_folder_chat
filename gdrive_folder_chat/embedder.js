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
  const scriptProperties = PropertiesService.getScriptProperties();
  const EMBEDDING_BATCH_LIMIT = Number(scriptProperties.getProperty('EMBEDDING_BATCH_LIMIT'));
  const API_KEY = scriptProperties.getProperty("OPENAI_API_KEY");
  const API_URL = 'https://api.openai.com/v1/embeddings';
  const model = scriptProperties.getProperty("EMBEDDING_MODEL");

  function sendBatch(batch) {
    const payload = {
      model: model,
      input: batch.map(e => e.chunk),
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
    console.log(parsedRes.usage)
    return parsedRes.data;
  }

  function splitIntoBatches(files) {
    let currentBatch = [];
    let currentLength = 0;
    // rough estimate for # of tokens
    const maxBatch = EMBEDDING_BATCH_LIMIT * 4;
    const batches = [];

    files.forEach(file => {
      const addedLength = file.chunk.length;
      if (currentLength + addedLength > maxBatch && currentBatch.length > 0) {
        batches.push(currentBatch);
        currentBatch = [];
        currentLength = 0;
      }
      currentBatch.push(file);
      currentLength += addedLength;
    });

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  const batches = splitIntoBatches(files);
  let objectsWithEmbeddings = [];
  console.log(batches.length);
  batches.forEach(batch => {
    const embeddings = sendBatch(batch);
    const batchWithEmbeddings = batch.map((object, index) => ({
      ...object,
      embedding: `[${embeddings[index].embedding}]`,
      tokenLength: (object.chunk.length / 4)
    }));
    objectsWithEmbeddings = objectsWithEmbeddings.concat(batchWithEmbeddings);
  });

  return objectsWithEmbeddings;
}
