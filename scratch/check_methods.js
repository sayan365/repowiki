
const { streamText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

async function check() {
  try {
    const google = createGoogleGenerativeAI({ apiKey: 'test' });
    const result = await streamText({
      model: google('gemini-1.5-flash'),
      prompt: 'test'
    });
    console.log('Methods on result:', Object.keys(result));
    console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(result)));
  } catch (e) {
    console.log('Error identifying methods:', e.message);
  }
}
check();
