# gdrive_folder_chat
Interactive Q&A with Google Drive folder documents, using Google Apps Script and OpenAI's Embedding + GPT models.


## Usage

1. In Google Sheets Toolbar: GPT Tools > Embed New Folder
2. Paste G-Drive Folder URL
3. Wait for text extraction + embedding
4. In Sheet where file embeddings + metadata are shown:
    a. In Google Sheets Toolbar: GPT Tools > Folder Q&A
    b. Converse with folder content

Folder data will be stored in the currently active google sheet - any data in there at the time of embedding will be overwritten.

If you want to maintain current folder data and Q&A with another folder, open up a new sheet and repeat below steps.

## Limitations
1. Extracts text from the following document types:
    a. PDF
    b. Microsoft Word
    c. Google Doc
    Any other file types will be ignored.
2. No pagination set up for Drive API, so max documents processed = 100
3. Batches embeddings in one HTTP request to `https://api.openai.com/v1/embeddings`
    a. Max embeddings determined by your OpenAI limits for your chosen embedding model

## Prerequisites

(can skip Prereqs 1-2 and setup 1-9 if you copy/paste code in an Apps Script Project)
1. Node.js 
2. `clasp`, the command-line tool for managing Google Apps Script projects.
3. Google account
4. OpenAI API Key


## Setup Instructions

1. **Install `clasp` Globally**

    Open your terminal and run the following command to install `clasp` globally on your machine:

    ```bash
    npm install -g @google/clasp
    ```

2. **Login to Google Account with `clasp`**

    Authenticate `clasp` with your Google account by running:

    ```bash
    clasp login
    ```

    Follow the prompts in your browser to allow `clasp` to access your Google account.

3. **Clone the Repository**

    Clone the `gdrive_folder_chat` project repository to your local machine:

    ```bash
    git clone https://github.com/cdm823/gdrive_folder_chat.git
    ```

4. **Navigate to Project Directory**

    Change into the project directory:

    ```bash
    cd gdrive_folder_chat
    ```

5. **Create a New Google Sheet**

    Create a new Google Sheet by visiting [sheets.google.com/create](https://sheets.google.com/create). This sheet will be used by the Apps Script project.

6. **Open Google Sheets Apps Script Editor**

    In your new Google Sheet, click on `Extensions` > `Apps Script` to open the Apps Script editor.

7. **Copy Script ID**

    In the Apps Script editor, go to `Project Settings` (found in the left toolbar) and copy the `Script ID`.

8. **Create a `.clasp.json` File**

    Back in your project directory, create a `.clasp.json` file with the following content, replacing `YOUR_SCRIPT_ID` with the Script ID you copied, and `"path/to/your/code"` with the relative path to your script files if they are not in the project root:

    ```json
    {
      "scriptId": "YOUR_SCRIPT_ID",
      "rootDir": "path/to/your/code"
    }
    ```

9. **Push Code with `clasp`**

    Upload your local script files to the Apps Script project by running:

    ```bash
    clasp push
    ```

10. **In Apps Script Editor, go to Services > Drive API V3 and add**

11. **Set Environment Variables**

    In the Apps Script web editor, go to `Project Settings` > `Script Properties` and set the following environment variables:

    - `CHAT_MODEL` = `gpt-4-0125-preview`
        - OpenAI Model
    - `EMBEDDING_CHUNK_SIZE` = `5000`
        - Max Chunk Size for each text chunk (aiming for ~1250 tokens per chunk)
    - `EMBEDDING_MODEL` = `text-embedding-ada-002`
    - `MAX_CHAT_CONTEXT_TOKENS` = `50000`
        -Amount of tokens each conversation will maintain, before removing previously passed context
    - `OPENAI_API_KEY` = `{your_openai_api_key}`

    Replace `{your_openai_api_key}` with your actual OpenAI API key.
