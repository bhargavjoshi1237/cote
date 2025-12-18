const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend with API key (to be set via environment variable)
// Only initialize if API key is provided
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

// Function to scrape book data from bookswagon.com
async function scrapeBooks() {
  try {
    const url = 'https://www.bookswagon.com/search-books/classroom-of%20elite%20year%202/filter?sid=0';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const books = [];

    // Find the list-view-books div and extract book information
    $('.list-view-books .product-summary').each((index, element) => {
      const title = $(element).find('.title a').text().trim();
      const sellPrice = $(element).find('.price .sell').text().trim();
      const shipsWithin = $(element).find('.action .order-info span').text().trim();

      if (title && sellPrice) {
        books.push({
          title,
          price: sellPrice,
          shipsWithin: shipsWithin || 'N/A'
        });
      }
    });

    return books;
  } catch (error) {
    console.error('Error scraping books:', error.message);
    throw error;
  }
}

// Function to send email with book data
async function sendBookEmail() {
  try {
    const books = await scrapeBooks();
    
    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set. Skipping email send.');
      console.log('Book data that would be sent:', JSON.stringify(books, null, 2));
      return;
    }

    const emailContent = `
      <h2>Daily Book Update - Classroom of Elite Year 2</h2>
      <p>Here are the latest books:</p>
      <ul>
        ${books.map(book => `
          <li>
            <strong>${book.title}</strong><br>
            Price: ${book.price}<br>
            Ships within: ${book.shipsWithin}
          </li>
        `).join('')}
      </ul>
    `;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_TO || 'user@example.com',
      subject: 'Daily Book Update - Classroom of Elite Year 2',
      html: emailContent
    });

    console.log('Email sent successfully at', new Date().toISOString());
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
}

// Root route - Hello World
app.get('/', (req, res) => {
  res.send('Hello World');
});

// /cote route - Fetch and return book data
app.get('/cote', async (req, res) => {
  try {
    const books = await scrapeBooks();
    res.json({
      success: true,
      count: books.length,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book data',
      message: error.message
    });
  }
});

// Schedule cron job to run daily at 12 PM IST (6:30 AM UTC)
// IST is UTC+5:30, so 12:00 PM IST = 6:30 AM UTC
cron.schedule('30 6 * * *', () => {
  console.log('Running scheduled job at 12 PM IST');
  sendBookEmail();
}, {
  timezone: 'Asia/Kolkata'
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Routes available:`);
  console.log(`  GET / - Hello World`);
  console.log(`  GET /cote - Fetch book data`);
  console.log(`Cron job scheduled for 12:00 PM IST daily`);
});
