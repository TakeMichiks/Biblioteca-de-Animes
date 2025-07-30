const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

router.get('/scrape', async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query requerida' });

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('img');

    const images = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs
        .map(img => img.src)
        .filter(src => src && !src.includes('gstatic.com')) // evitar imágenes Google
        .slice(0, 20);
    });

    await browser.close();

    res.json({ images });
  } catch (error) {
    console.error('Error scraping images:', error);
    res.status(500).json({ error: 'Error buscando imágenes' });
  }
});

module.exports = router;
