const fs = require('fs');

async function checkSnapshot() {
  try {
    const res = await fetch('http://web.archive.org/web/20120615012936/http://www.woozworld.com:80/?');
    const html = await res.text();
    
    const swfs = html.match(/https?:\/\/[^"'\s]+\.swf/gi) || [];
    const relSwfs = html.match(/[^"'\s\(\)]+\.swf/gi) || [];
    const flashvars = html.match(/flashvars["':\s=]+[^"'\n]+/gi) || [];
    
    console.log('--- SWFS ---');
    console.log([...new Set([...swfs, ...relSwfs])]);
    console.log('--- FLASHVARS ---');
    console.log(flashvars);

    // Let's also check login or game frame URL
    const gameLinks = html.match(/href=["'][^"']*game[^"']*["']/gi) || [];
    const playLinks = html.match(/href=["'][^"']*play[^"']*["']/gi) || [];
    console.log('--- GAME LINKS ---', gameLinks, playLinks);
  } catch (e) {
    console.error(e);
  }
}

checkSnapshot();
