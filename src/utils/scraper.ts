import { exec } from 'child_process';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';

export const fetchHTML = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // -s: Silent
    // -L: Follow redirects
    // --compressed: Handle gzip
    const command = `curl -s -L --compressed -A "${USER_AGENT}" "${url}"`;
    console.log(`[Scraper] Executing: ${command}`);
    
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Scraper] Curl error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`[Scraper] Stderr: ${stderr}`);
      }
      console.log(`[Scraper] Success. Length: ${stdout.length}`);
      resolve(stdout);
    });
  });
};

export const postAjax = (url: string, data: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // -X POST -d "data"
    const command = `curl -s -X POST -d "${data}" -A "${USER_AGENT}" "${url}"`;
    console.log(`[Scraper] Executing POST: ${command}`);
    
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Scraper] Curl POST error: ${error.message}`);
        return reject(error);
      }
      resolve(stdout);
    });
  });
};