const puppeteer = require('puppeteer');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs/promises');
const os = require('os');
const { URL } = require('url');

async function downloadSite(targetUrl) {
    let browser;
    let tempDir;

    try {
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'site-download-'));
        console.log(`Created temporary directory: ${tempDir}`);

        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: true,
            // These arguments are crucial for running in a container like Render/Docker/Gitpod
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', // This is for older containers, may not be needed but doesn't hurt
                '--disable-gpu'
            ],
        });
        console.log('Browser launched successfully.');

        const page = await browser.newPage();
        const client = await page.target().createCDPSession();

        await client.send('Fetch.enable', {
            patterns: [{ urlPattern: '*', requestStage: 'Response' }]
        });

        const savedUrls = new Set(); // To prevent saving the same URL twice

        client.on('Fetch.requestPaused', async (event) => {
            const { requestId, request } = event;
            if (savedUrls.has(request.url)) {
                 await client.send('Fetch.continueRequest', { requestId });
                 return;
            }

            if (request.url.startsWith('data:')) {
                await client.send('Fetch.continueRequest', { requestId });
                return;
            }
            
            savedUrls.add(request.url);

            try {
                const response = await client.send('Fetch.getResponseBody', { requestId });
                const body = Buffer.from(response.body, 'base64');
                const requestUrl = new URL(request.url);

                let filePath = requestUrl.pathname;
                if (filePath.endsWith('/')) {
                    filePath += 'index.html';
                }
                const fullPath = path.join(tempDir, requestUrl.hostname, filePath);

                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.writeFile(fullPath, body);
                
                // console.log(`Saved: ${requestUrl.hostname}${filePath}`);

            } catch (error) {
                if (!error.message.includes('No data found for resource')) {
                    console.error(`Skipping resource ${request.url}:`, error.message);
                }
            } finally {
                await client.send('Fetch.continueRequest', { requestId });
            }
        });
        
        console.log(`Navigating to ${targetUrl}...`);
        await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 90000 });
        
        console.log('Page finished loading. Zipping files...');
        
        const archive = archiver('zip', { zlib: { level: 9 } });
        archive.directory(tempDir, false);
        archive.finalize();

        // On success, return both the stream and the temp directory path for cleanup
        return { archive, tempDir };

    } catch (error) {
        console.error('An error occurred during Puppeteer processing:', error);
        // Clean up immediately on failure
        if (tempDir) {
            await fs.rm(tempDir, { recursive: true, force: true });
        }
        // Re-throw a user-friendly error to be caught by app.js
        throw new Error('Failed to capture the website. The site may be protected, too complex, or the server environment may need configuration.');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { downloadSite };