const axios = require('axios');
const cheerio = require('cheerio');
const { Resend } = require('resend');

let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

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

    $('.list-view-books .product-summary').each((index, element) => {
      const title = $(element).find('.title a').text().trim();
      const sellPrice = $(element).find('.price .sell').text().trim();

      let shipsWithin = 'N/A';
      const orderInfoEl = $(element).find('.action .order-info');
      if (orderInfoEl.length) {
        const spanText = orderInfoEl.find('span').first().text().trim();
        if (spanText) {
          shipsWithin = spanText;
        } else {
          const cloned = orderInfoEl.clone();
          cloned.find('a').remove();
          const fullText = cloned.text().replace(/Ships within/i, '').trim();
          shipsWithin = fullText || 'N/A';
        }
      }

      if (title && sellPrice) {
        books.push({
          title,
          price: sellPrice,
          shipsWithin
        });
      }
    });

    return books;
  } catch (error) {
    console.error('Error scraping books:', error.message);
    throw error;
  }
}

async function sendBookEmail() {
  try {
    const books = await scrapeBooks();

    if (!resend || !process.env.RESEND_API_KEY) {
      console.log('RESEND_API_KEY not set. Skipping email send.');
      console.log('Book data that would be sent:', JSON.stringify(books, null, 2));
      return { skipped: true, books };
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
    return { skipped: false, books };
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error;
  }
}

module.exports = {
  scrapeBooks,
  sendBookEmail
};
