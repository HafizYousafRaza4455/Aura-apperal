import fs from 'node:fs';

const code = fs.readFileSync('src/data/products.ts', 'utf8');
const urls = [...new Set(code.match(/https:\/\/images\.unsplash\.com\/photo-[^\"'\s]+/g))];
console.log('Unique images count:', urls.length);

async function check() {
  let failCount = 0;
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      if (res.status === 200) {
        console.log('OK', u.split('?')[0]);
      } else {
        failCount++;
        console.log('FAIL', res.status, u.split('?')[0]);
      }
    } catch (e) {
      failCount++;
      console.log('ERR', u.split('?')[0], e.message);
    }
  }
  console.log('Finished. Total fails:', failCount);
}
check();
