const http = require('http');

const url = "http://track2.millitrack.com/api/middleMan/getDeviceInfo?accessToken=ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnpkV0lpT2lJek16WTVNU0lzSW1semN5STZJbWR3Y3kxMGNtRmphMlZ5SWl3aWFXRjBJam94Tnpnd05qVTJPREF6ZlEuLWhqVzNXNFZuRHZNUXBaaXRwMGoyVzk2dFNWTWctb1o0V0VHRmNvb1JwZw==";

http.get(url, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.object) {
        console.log("Total objects returned from API:", data.object.length);
        console.log("All vehicles in API:");
        data.object.forEach((o, i) => {
          console.log(`${i + 1}. Name: "${o.name}" | UniqueId: "${o.deviceUniqueId}" | Lat: ${o.latitude} | Lng: ${o.longitude} | Ignition: ${o.attributes?.ignition}`);
        });
      } else {
        console.log("No object field in response", data);
      }
    } catch (e) {
      console.error("Parse error:", e);
    }
  });
}).on('error', (err) => {
  console.error("Fetch error:", err);
});
