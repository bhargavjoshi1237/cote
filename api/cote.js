const { scrapeBooks } = require('../lib/scraper');

module.exports = async (req, res) => {
  try {
    const books = await scrapeBooks();
    res.status(200).json({
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
};
