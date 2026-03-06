import puppeteer from 'puppeteer';

export async function generatePdf(html: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  const executablePath = isProduction ? '/usr/bin/chromium-browser' : undefined;
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
    executablePath,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div></div>`,
    footerTemplate: `
    <div style="font-size:10px; width:93%; text-align:right; margin-bottom:8px;">
      <span class="pageNumber"></span>
    </div>
  `,
  });

  await browser.close();
  return pdf;
}
