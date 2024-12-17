const { Telegraf } = require('telegraf');
const axios = require('axios');
require("dotenv").config();
const FormData = require('form-data');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const bot = new Telegraf(process.env.TOKEN);

async function fetchResult(resultName, userId) {
  const form = new FormData();
  form.append('resultName', resultName);
  form.append('userId', userId);

  try {
    const response = await axios.post(
      'https://gsa.teletalk.com.bd/gov/student/lottery-result/return-result.php',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Accept': '*/*',
          'Origin': 'https://gsa.teletalk.com.bd',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching result:', error.message);
    return 'Error';
  }
}

// loop function to handle server errors
async function fetchMeritUntilValid(type, userId) {
  while (true) {
    const data = await fetchResult(type, userId);
    console.log(data)

    // if response is in object , return
    if (typeof data === 'object') {
      return data;
    }

    // check response type and retry
    if (typeof data === 'string' && data.includes('Error')) {
      console.log('Retrying request...');
      await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay
    }
  }
}

// Message handler for User ID input
bot.on('text', async (ctx) => {
  const userId = ctx.message.text.trim();

  if (!userId) {
    return ctx.reply('User ID cannot be empty. Please provide a valid User ID.');
  }
  ctx.reply('রেজাল্ট চেক করা হচ্ছে, কিছুক্ষন অপেক্ষা করুন।');

  try {
    // Fetch Merit list with retry logic and delay
    const meritData = await fetchMeritUntilValid('Merit', userId);

    // Check if found in Merit list
    if (meritData.data) {
      const details = JSON.parse(meritData.data);
      return ctx.replyWithMarkdown(formatResult(details));
    }

    // If not found in Merit list, proceed to 1st Waiting list
    const waitingData = await fetchMeritUntilValid('1st Waiting', userId);

    // check response type
    if (typeof waitingData === 'string' && waitingData.includes('Error')) {
      return ctx.reply('সার্ভার ডাউন, আবার চেষ্টা করুন।');
    }

    // check in 1st waiting list
    if (waitingData.found) {
      const details = JSON.parse(waitingData.data);
      return ctx.replyWithMarkdown(formatResult(details));
    }

    const waitingData2 = await fetchMeritUntilValid('2nd Waiting', userId);

    // check response type
    if (typeof waitingData === 'string' && waitingData.includes('Error')) {
      return ctx.reply('সার্ভার ডাউন, আবার চেষ্টা করুন।');
    }

    // check in 2nd waiting list
    if (waitingData2.found) {
      const details = JSON.parse(waitingData2.data);
      return ctx.replyWithMarkdown(formatResult(details));
    }

    // No result found in both lists
    return ctx.reply('মেধা তালিকা / ওয়েটিং লিস্ট 1 & 2 এ খুজে পাওয়া যায়নি.');
  } catch (error) {
    console.error('Error handling user input:', error.message);
    ctx.reply('An unexpected error occurred. Please try again later.');
  }
});

function formatResult(details) {
  return `
🎉 *Result Found* 🎉
- *Name*: ${details.name}
- *User ID*: ${details.userId}
- *School*: ${details.school}
- *Class*: ${details.class}
- *Shift*: ${details.shift}
- *Version*: ${details.version}
- *Group*: ${details.group}
- *Selected Criteria*: ${details.selectedCriteria}
- *Selected For*: ${details.selectedForList}
- *Position*: ${details.selectPosition}
- *Choice Order*: ${details.choiceOrder}
`;
}

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
