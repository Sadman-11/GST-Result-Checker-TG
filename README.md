# GSA Result Checker Telegram Bot  

A Telegram bot that fetches government school lottery results upon providing a user ID. This bot interacts with the GSA Teletalk system and provides results for Merit and 1st Waiting lists.  

---

## Features  
- Fetches results from the GSA Teletalk lottery system.  
- Supports checking both Merit and 1st Waiting lists.  
- Retry mechanism for handling server errors or delays.  
- User-friendly Telegram interface.  

---

## Prerequisites  
- Node.js (v14 or higher)  
- A Telegram bot token from [BotFather](https://core.telegram.org/bots#botfather) 
---

## Installation  

1. Clone this repository or download the files.  
2. Navigate to the project directory:  
   ```bash
   cd GSA-Result-Checker-TG
   ```
3. Install dependencies
    ```
    npm install
    ```

---

## Configuration
1. rename .env.example to .env.
2. Add your Telegram bot token to the .env file
    ```
    TOKEN=your-telegram-bot-token
    ```
---

## Start the Bot
  ``` 
  npm start
  ```