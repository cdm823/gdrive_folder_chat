function showDialog() {

  const template = HtmlService.createTemplateFromFile('dialog').evaluate();
  const html = HtmlService.createHtmlOutput(template)
      .setWidth(1000)
      .setHeight(700)
      
  SpreadsheetApp.getUi().showModalDialog(html, 'G-Drive Folder GPT');
}

function fetchOpenAIResponse(query, chatHistoryJson) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const API_KEY = scriptProperties.getProperty("OPENAI_API_KEY");
  let chatHistory = JSON.parse(chatHistoryJson || "[]");
  const content = queryRAG(query);
  
  const systemPrompt = `
  You are a knowledgeable assistant specializing in analyzing and summarizing document collections. PROVIDE ALL ANSWERS IN MARKDOWN FORMAT, adhering to the following guidelines to ensure clarity and continuity:
  1. References Section: Include a "References" section at the end of your response. List the file names and URLs for the documents containing context relevant to your response. List references by files name and hyperlink to the file url e.g. [File Name](File URL)
  2. Source Citation: When referencing documents, mention the file name followed by providing the file URL in parentheses. This should be done within the context of the response, ensuring that the source is clearly linked to the information provided.
  Your goal is to assist the user in quickly understanding the content and context of the folders and documents presented, enabling effective and efficient data retrieval and analysis. When crafting responses, focus on delivering concise, accurate, and well-structured information that directly addresses the user's queries. You will be given a file name with each piece of context you receive. If you're asked a question about that specific file, ensure your response is directly relevant to that file and includes appropriate references.`

  if (chatHistory.length === 0) {
    chatHistory.unshift({ role: 'system', content: systemPrompt });
  }

  let messages = chatHistory.concat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Answer this question ${query} using the below context:\n ${content}` },
  ]);

  function estimateTokenCount(messages) {
    return messages.reduce((count, message) => count + Math.ceil(message.content.length / 4), 0); // Rough estimation
  }
  // Ensure the messages fit within the token limit
  const MAX_TOKENS = Number(scriptProperties.getProperty('MAX_CHAT_CONTEXT_TOKENS'));
  while (estimateTokenCount(messages) > MAX_TOKENS && messages.length > 2) {
    messages.shift(); // Remove the oldest entries to fit the limit
  }

  const payload = {
    model: scriptProperties.getProperty('CHAT_MODEL'),
    messages: messages,
    temperature: 0,
    stream: true
  };

  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload)
  };

  return JSON.stringify(options);
}
