# cote

A Node.js Express application that scrapes book data from Bookswagon and sends daily email updates.

## Features

- **Web Scraping**: Fetches book data (title, price, shipping time) from Bookswagon.com
- **REST API**: Simple endpoints for testing and data retrieval
- **Scheduled Tasks**: Daily cron job at 12 PM IST to send email updates
- **Email Integration**: Uses Resend API for sending emails

## Installation

1. Clone the repository:
```bash
git clone https://github.com/bhargavjoshi1237/cote.git
cd cote
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory (optional):
```bash
RESEND_API_KEY=your_resend_api_key_here
EMAIL_TO=recipient@example.com
PORT=3000
```

## Usage

Start the server:
```bash
npm start
```

The server will start on port 3000 (or the port specified in environment variables).

## API Endpoints

### GET /
Returns "Hello World" message.

**Response:**
```
Hello World
```

### GET /cote
Fetches and returns book data from Bookswagon.com in JSON format.

**Response:**
```json
{
  "success": true,
  "count": 10,
  "books": [
    {
      "title": "Classroom of the Elite: Year 2 (Light Novel) Vol. 1",
      "price": "₹824",
      "shipsWithin": "2-4 Days"
    }
  ]
}
```

## Scheduled Tasks

A cron job runs daily at **12:00 PM IST** to:
1. Scrape the latest book data
2. Send an email with the book information (requires RESEND_API_KEY to be set)

## Dependencies

- **express**: Web framework
- **axios**: HTTP client for making requests
- **cheerio**: HTML parsing and web scraping
- **node-cron**: Task scheduling
- **resend**: Email delivery service

## Environment Variables

- `RESEND_API_KEY`: Your Resend API key (required for email functionality)
- `EMAIL_TO`: Email address to send daily updates to
- `PORT`: Server port (default: 3000)

## Notes

- The application will run without a Resend API key, but email functionality will be disabled
- Book scraping targets the URL: `https://www.bookswagon.com/search-books/classroom-of%20elite%20year%202/filter?sid=0`
- The cron job is configured for Asia/Kolkata timezone (IST)
