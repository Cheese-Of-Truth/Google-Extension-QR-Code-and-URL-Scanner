window.onload = function () {
    // Retrieve data from chrome.storage.local instead of localStorage
    const storedData = localStorage.getItem('detailData');
    const parsedData = JSON.parse(storedData);
    // console.log("test1");
    console.log(`print in fullreport.js: ${storedData}`);
    // console.log("test2");
        if (storedData) {
            
            document.getElementById('title').innerText = `Title: ${parsedData.title}`;
            document.getElementById('lastAnalysisDate').innerText = `Last Analysis Date: ${ (parsedData.lastAnalysisDate)}`;
            document.getElementById('threatName').innerText = `Threat Name: ${ (parsedData.threatName)}`;
            document.getElementById('reputation').innerText = `Reputation: ${ (parsedData.reputation)}`;
            document.getElementById('threatcategory').innerText = `Threat Category: ${ (parsedData.category)}`;
            document.getElementById('ip').innerText = `IP: ${ (parsedData.ip)}`;
            document.getElementById('url').innerText = `URL: ${ (parsedData.url)}`;
            document.getElementById('domain').innerText = `Domain: ${ (parsedData.domain)}`;
            document.getElementById('city').innerText = `City: ${ (parsedData.city)}`;
            document.getElementById('country').innerText = `Country: ${ (parsedData.country)}`;
            document.getElementById('tlsIssuer').innerText = `TLS Issuer: ${ (parsedData.tlsIssuer)}`;
            document.getElementById('tlsValidFrom').innerText = `TLS Valid From: ${parsedData.tlsValidFrom}`;
            document.getElementById('tlsValidDays').innerText = `TLS Valid Days: ${ (parsedData.tlsValidDays)}`;
            document.getElementById('uniqueCategoryNames').innerText = `Website Categories: ${ (parsedData.uniqueCategoryNames)}`;
            document.getElementById('rankResults').innerText = `Rank Results: ${ (parsedData.rankResults)}`;
            document.getElementById('screenshotURL').src =  (parsedData.screenshotURL);
            document.getElementById('ipsList').innerText = `IPs List: ${ (parsedData.ipsList)}`;
            document.getElementById('domainsList').innerText = `Domains List: ${ (parsedData.domainsList)}`;
            // document.getElementById('virustotalURL').innerText = `virusTotal: ${ (parsedData.virustotalURL)}`;
            // document.getElementById('cloudflareURL').innerText = `Cloudflare Radar: ${ (parsedData.cloudflareURL)}`;
            // document.getElementById('urlscanioURL').innerText = `Urlscanio: ${ (parsedData.urlscanioURL)}`;
            
            document.getElementById('downloadButton').addEventListener('click', function () {
                const content = document.documentElement.outerHTML;
                const blob = new Blob([content], { type: 'text/html' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'scan_results.html';
                link.click();
                URL.revokeObjectURL(link.href);
            });

        } else {
            document.getElementById('title').innerText = "No data found.";
        }


        
};

