const { sendBookEmail } = require('../lib/scraper');

module.exports = async (req, res) => {
  try {
    // Allow GET or POST to trigger the email send (useful for manual triggering or cron services)
    const result = await sendBookEmail();
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
