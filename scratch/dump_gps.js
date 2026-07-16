const http = require('http');

const url = "http://track2.millitrack.com/api/middleMan/getDeviceInfo?accessToken=ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnpkV0lpT2lJek16WTVNU0lzSW1semN5STZJbWR3Y3kxMGNtRmphMlZ5SWl3aWFXRjBJam94Tnpnd05qVTJPREF6ZlEuLWhqVzNXNFZuRHZNUXBaaXRwMGoyVzk2dFNWTWctb1o0V0VHRmNvb1JwZw==";

http.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const d = JSON.parse(body);
    if (d.object) {
      d.object.forEach((o) => {
        console.log('\n=== ' + o.name + ' ===');
        console.log('speed:', o.speed, '| course:', o.course);
        console.log('lat:', o.latitude, '| lng:', o.longitude);
        console.log('serverTime:', o.serverTime);
        console.log('ALL attributes:', JSON.stringify(o.attributes, null, 2));
        console.log('ALL top-level keys:', Object.keys(o).join(', '));
      });
    }
  });
});
