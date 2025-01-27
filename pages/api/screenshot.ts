import puppeteer from 'puppeteer';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL parameter' });
  }

  // Prepend https:// if no protocol is included
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log("Navigated to", url);
    // Capture multiple viewport-sized screenshots while scrolling
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();
    console.log("Page height", height);
    const viewportHeight = page.viewport().height;
    let currentPosition = 0;
    const screenshots = [];
    console.log("Capturing screenshots...");
    while (currentPosition < height) {
      await page.evaluate((scrollTo) => {
        window.scrollTo(0, scrollTo);
      }, currentPosition);

      // Replace page.waitForTimeout with a custom delay
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const screenshot = await page.screenshot({ encoding: 'base64' });
      screenshots.push(screenshot);
      currentPosition += viewportHeight;
    }

    await browser.close();
    res.status(200).json({ screenshots });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    res.status(500).json({ error: 'Failed to capture screenshot' });
  }
}
