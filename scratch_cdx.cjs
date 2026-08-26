async function queryCdx() {
  const url = 'https://web.archive.org/cdx/search/cdx?url=*.woozworld.com/*&output=json&limit=50&filter=original:.*play.*';
  console.log('Querying:', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Found results:', data.length);
    for (const row of data.slice(0, 20)) {
      console.log(row[1], row[2], row[0]);
    }
  } catch (e) {
    console.error(e);
  }
}
queryCdx();
