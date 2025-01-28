import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const bodyHandle = await page.$('body');
    const height = bodyHandle ? await bodyHandle.boundingBox() : null;
    
    if (bodyHandle) {
      await bodyHandle.dispose();
    }
    const viewportHeight = page.viewport()?.height ?? 0;
    let currentPosition = 0;
    const screenshots = [];
    let screenshotCount = 0;

    while (height && currentPosition < height.height) {
      await page.evaluate((scrollTo) => {
        window.scrollTo(0, scrollTo);
      }, currentPosition);

      await new Promise((resolve) => setTimeout(resolve, 250));

      const screenshot = await page.screenshot({ encoding: 'base64' });
      screenshots.push(screenshot);
      screenshotCount++;

      console.log(`Captured screenshot ${screenshotCount}`);

      // Send progress update
      res.write(`event: progress\ndata: ${JSON.stringify({ count: screenshotCount })}\n\n`);
      currentPosition += viewportHeight;
    }

    await browser.close();

    // Send final result
    res.write(`event: complete\ndata: ${JSON.stringify({ screenshots })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to capture screenshot' })}\n\n`);
    res.end();
  }
}
