// background.js

let isScanning = false; // Track if a scan is in progress

function saveScanResult(data) {
  chrome.storage.local.set(data, function () {
      console.log("Scan data saved to local storage.");
  });
}





chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanURL') {
        const url = request.url;
        isScanning = true; // Mark scanning as in progress

        // Call the API functions and handle them
        Promise.all([
            //scanUrlWithVirusTotal(url),
            submitURLScanIo(url),
            scanWithCloudflare(url)
        ]).then(results => {
            console.log("All tasks completed successfully:", results);
            isScanning = false; // Mark scanning as complete

            // Store the finished scan status and the URL
            // Save the scan status and URL
          chrome.storage.local.set({
            lastScannedURL: url,
            scanStatus: 'completed'
          }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving scan status:', chrome.runtime.lastError);
            } else {
                console.log('Scan status and URL saved successfully');
                
                // Immediately retrieve and log what was saved
                chrome.storage.local.get(['lastScannedURL', 'scanStatus'], (data) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error retrieving scan data:', chrome.runtime.lastError);
                    } else {
                        console.log('Verified saved data:');
                        console.log('Last Scanned URL:', data.lastScannedURL);
                        console.log('Scan Status:', data.scanStatus);
                    }
                });
            }
          });

            sendResponse({ success: true, results: results });
        }).catch(error => {
            console.error("Error during tasks:", error);
            isScanning = false; // Mark scanning as complete
            sendResponse({ success: false, error: error });
        });

        // Return true to indicate that you wish to send a response asynchronously
        return true; 
    }
});

// Define your API functions here or import them
// Function to URL-safe Base64 encode the input
function urlsafeBase64Encode(input) {
  const encoded = btoa(unescape(encodeURIComponent(input)));
  return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

let virustotalURL = 'N/A';


async function scanUrlWithVirusTotal(url) {

  // Encode the URL
  let urlId = urlsafeBase64Encode(url);
  console.log("Encoded URL: " + urlId);

  // Define API request options for retrieving the report
  const getOptions = {
      method: 'GET',
      headers: {
          accept: 'application/json',
          'x-apikey': '51cfa3951567e12258950a036b7df191be44202d5090c925ad169979f7911f4c' 
      }
  };

  try {
      // Attempt to retrieve the existing report
      virustotalURL=`https://www.virustotal.com/api/v3/urls/${urlId}`;
      let response = await fetch(virustotalURL, getOptions);
      
      if (response.ok) {
          // Report exists, process it
          console.log("Report found.");
          const data = await response.json();
          processVirusTotalData(data);
      } else if (response.status === 404) {
          // Report not found, submit the URL for scanning
          console.log("Report not found. Submitting URL for scanning...");
          const newUrlId = await submitUrlToVirusTotal(url); // Capture the new ID

          // Poll for the report
          console.log("Polling for the report...");
          const maxAttempts = 5;
          let attempts = 0;
          let reportFound = false;

          while (attempts < maxAttempts && !reportFound) {
              const pollInterval = Math.min(1000 * Math.pow(2, attempts), 20000); // Exponential backoff
              await delay(pollInterval);
              attempts++;
              console.log(`Polling attempt ${attempts}...`);
              virustotalURL=`https://www.virustotal.com/api/v3/urls/${newUrlId}`;
              response = await fetch(virustotalURL, getOptions);

              if (response.ok) {
                  const data = await response.json();
                  console.log("check point after response before print data")
                  console.log("Data received from VirusTotal:", data); // Print out the data
                  processVirusTotalData(data);
                  console.log("new report is processed")
                  reportFound = true;
              } else if (response.status === 404) {
                  console.log("Report still not available.");
              } else {
                  console.log(`Unexpected status code: ${response.status}`);
              }
          }

          if (!reportFound) {
              console.log("Failed to retrieve the report after multiple attempts.");
              chrome.runtime.sendMessage({
                  type: "virusTotalResult",
                  data: {
                      error: "Report not available after multiple attempts."
                  }
              });
          }
      } else {
          // Handle other HTTP errors
          throw new Error(`Unexpected HTTP error! Status: ${response.status}`);
      }

  } catch (err) {
      console.error('Error:', err);
      chrome.runtime.sendMessage({
          type: "virusTotalResult",
          data: {
              error: err.message
          }
      });
  }
}

// Helper function to submit the URL for scanning
async function submitUrlToVirusTotal(url) {
  const submitOptions = {
      method: 'POST',
      headers: {
          'x-apikey': '51cfa3951567e12258950a036b7df191be44202d5090c925ad169979f7911f4c', 
          'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `url=${encodeURIComponent(url)}`
  };

  let retries = 3; // Number of retry attempts
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const submitResponse = await fetch('https://www.virustotal.com/api/v3/urls', submitOptions);
            if (!submitResponse.ok) {
                if (attempt < retries - 1) {
                    console.log(`Retrying submission... (${attempt + 1})`);
                    continue; // Retry
                }
                throw new Error(`Failed to submit URL! Status: ${submitResponse.status}`);
            }
            const submitData = await submitResponse.json();
            const newUuid = submitData.data.id.split('-')[1];
            console.log("URL submitted successfully. Encoded ID:", newUuid);
            return newUuid;
        } catch (error) {
            console.error("Error submitting URL:", error);
            if (attempt === retries - 1) throw error; // Re-throw error on final attempt
        }
    }
}

// Helper function to process and send data to popup.js
function processVirusTotalData(data) {
  if (data && data.data && data.data.attributes) {
    console.log("checkpoint for new submit");
    console.log(data.data.attributes);
      let title = data.data.attributes.title|| 'N/A';
      let lastAnalysisDate = new Date(data.data.attributes.last_analysis_date * 1000).toLocaleString()|| 'N/A';
      
      let threatNames = data.data.attributes.threat_names.length > 0 ? data.data.attributes.threat_names.join(', ') : "None";
      
      let reputationStatus;
      if (data.data.attributes.reputation == 0) {
          reputationStatus = "Neutral";
      } else if (data.data.attributes.reputation > 0) {
          reputationStatus = "Positive";
      } else {
          reputationStatus = "Negative";
      }

      let categories;
      if (data.data.attributes.categories.length > 0) {
          categories = JSON.stringify(data.data.attributes.categories);
      } else {
          categories = "None";
      }

      // Iterate through the results and filter out those not "harmless" or "undetected"
      const analysisResults = data.data.attributes.last_analysis_results;
      let totalEngines = 0;
      let notHarmlessOrUndetected = 0;
      for (let [engine, result] of Object.entries(analysisResults)) {
          totalEngines++;
          if (result.category !== 'harmless' && result.category !== 'undetected') {
              notHarmlessOrUndetected++;
          }
      }

      saveScanResult( {
        title: title,
        lastAnalysisDate: lastAnalysisDate,
        threatName: threatNames,
        reputation: reputationStatus,
        category: categories,
        totalEngines: totalEngines,
        flag: notHarmlessOrUndetected
      });

      // Send data back to popup.js
      chrome.runtime.sendMessage({
          type: "virusTotalResult",
          data: {
            error: "saved to local"
          }
      });
  } else {
      console.log("Expected data structure not found.");
      chrome.runtime.sendMessage({
          type: "virusTotalResult",
          data: {
              error: "Unexpected data structure received from VirusTotal."
          }
      });
  }
}

// Helper function to introduce delays (used for polling)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


//URLscanIO

//screenshot,ip,location,final url, domain

// Define the API endpoint and API key
const apiEndpoint = "https://urlscan.io/api/v1/scan/";
const resultEndpoint = "https://urlscan.io/api/v1/result/"; // Define resultEndpoint
const apiKey = "4ed62301-3829-4c55-9451-8fe1b83087c9"; // Replace with your actual API key


// Function to submit scan and poll results
async function submitURLScanIo(urlToScan) {

    // Define the request options for scanning
    const scanOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'API-Key': apiKey
        },
        body: JSON.stringify({
            url: urlToScan,
            visibility: 'public'
        })
    };

    try {
        // Submit the scan request
        let response = await fetch(apiEndpoint, scanOptions);
        let data = await response.json();
        //console.log("Scan request submitted:", data);

        if (data.status === 400 && data.errors && data.errors.length > 0) {
            const dnsError = data.errors.find(error => error.title.includes('DNS Error'));
            if (dnsError) {
                console.error('DNS Error:', dnsError.detail);
                // Send the error message to popup.js
                chrome.runtime.sendMessage({ type: 'dnsError', message: "DNS Error found: URL Not Exist" });
                return; // Exit the function as no further processing is needed
            }
        }

        // Check for the unique scan UUID
        if (!data || !data.uuid) {
            chrome.runtime.sendMessage({ type: 'dnsError', message: "Scanning is disabled by the URL owner" });
                return; // Exit the function as no further processing is needed
        }

        const uuid = data.uuid;
        const resultUrl = `${resultEndpoint}${uuid}/`;

        // Polling variables
        const maxWaitTime = 2 * 60 * 1000; // 2 minutes
        const pollInterval = 5000; // 5 seconds
        let elapsedTime = 0;

        // Function to poll the result endpoint
        async function pollResult() {
            try {
                let resultResponse = await fetch(resultUrl);
                if (resultResponse.status === 404) {
                    // Scan still in progress, wait and retry
                    if (elapsedTime < maxWaitTime) {
                        console.log(`Scan in progress, retrying in ${pollInterval / 1000} seconds...`);
                        elapsedTime += pollInterval;
                        setTimeout(pollResult, pollInterval);
                    } else {
                        console.log("Maximum wait time reached. Scan is still in progress.");
                    }
                } else {
                    // Scan completed
                    let resultData = await resultResponse.json();
                    //console.log("Scan result:",JSON.stringify(resultData, null, 2) );

                    // Extract specific information from the scan result
                    if (resultData && resultData.data) {
                        const pageData = resultData.page;

                        // Extract information with fallback values
                        const ip = pageData.ip || 'IP not available';
                        const url = pageData.url || 'URL not available';
                        const domain = pageData.domain || 'Domain not available';
                        const city = pageData.city || 'IP not available';
                        const country = pageData.country || 'IP not available';
                        const tlsIssuer = pageData.tlsIssuer || 'IP not available';
                        const tlsValidFrom = pageData.tlsValidFrom || 'IP not available';
                        const tlsValidDays = pageData.tlsValidDays || 'IP not available';
                        // let urlscanioURL = resultUrl;
                        //const pngURL = resultData.task.screenshotURL;

                        if (url !== 'N/A') {
                          scanUrlWithVirusTotal(url);
                        }else {
                          console.warn("No valid URL received from URLScan.io");
                      }

                      saveScanResult( {
                        ip: ip,
                        url: url,
                        domain: domain,
                        city: city,
                        country: country,
                        tlsIssuer: tlsIssuer,
                        tlsValidFrom: tlsValidFrom,
                        tlsValidDays: tlsValidDays
                      });
                        chrome.runtime.sendMessage({
                          type: "URLScanIoResult",
                          data: {
                              error : "saved to local"
                          }
                      });

                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
            }
        }

        // Start polling
        await pollResult(); 

    } catch (error) {
        console.error('Error:', error);
        chrome.runtime.sendMessage({ type: 'dnsError', message: "Scanning is disabled by the URL owner" });
        return; // Exit the function as no further processing is needed
    }
}

// // Execute the scan and polling function
// submitURLScanIo();

//cloudflare

//get screenshot, cookies, http transaction, domain name, domain categorize

const apiToken = '37c0cece09b2f4c599d05dbf20761ba57fd09'; // Replace with your actual API token
const accountId = '274fd555e488dbf9ce23f897bf5e7a85'; // Replace with your actual Account ID
const email = 'ctfjd1234@gmail.com'; // Replace with your actual email

async function scanWithCloudflare(scanURL) {
  const options = {
    method: 'POST',
    headers: {
      'X-Auth-Email': email,
      'X-Auth-Key': apiToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: scanURL })
  };

  let uuid=""; // Declare uuid at the top level to ensure it's accessible
  let uniqueCategoryNames = ''; // Initialize the variable
  let rankResults = ''; // Initialize rankResults
  let ipsList = [];
  let domainsList = [];
  let screenshotURL="";

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/scan`, options);
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 409 && errorData.errors && errorData.errors.length > 0) {
        console.warn('Target was recently scanned. Using existing result...');
        const existingTask = errorData.result && errorData.result.tasks && errorData.result.tasks[0];
        if (existingTask) {
          uuid = existingTask.uuid; // Assign uuid from error response
          return await handleExistingResults(uuid); 
        }
      }
      throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    uuid = data.result.uuid;
    if (!uuid) {
      throw new Error("UUID not found.");
    }

    const resultsData = await pollForResults(uuid);
    return await handleResults(resultsData); // Return the results after scanning


    async function handleExistingResults(scanUuid) {
      const resultsData = await pollForResults(scanUuid);
      const processedData = await handleResults(resultsData);
      return processedData;
    }
  } catch (err) {
    console.error('Error:', err);
    chrome.runtime.sendMessage({ type: 'dnsError', message: err });
  }

    async function handleResults(resultsData) {
      // Log the rank and categories
    const rank = resultsData.result.scan?.meta?.processors?.rank|| "N/A"; ;
    // Extract categories from resultsData
    const categories = resultsData.result.scan?.meta?.processors?.categories|| {}; 
      // Function to recursively find all unique names
    function extractUniqueNames(obj, namesSet = new Set()) {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (key === 'name' && typeof obj[key] === 'string') {
            namesSet.add(obj[key]);
          } else {
            extractUniqueNames(obj[key], namesSet);
          }
        }
      }
      return namesSet;
    }

    const uniqueNames = extractUniqueNames(categories);
    let uniqueCategoryNames = Array.from(uniqueNames).join(', ');
    let rankResults = JSON.stringify(rank, null, 2);
    let ipsList = resultsData.result.scan.lists.ips|| [];;
    let domainsList = resultsData.result.scan.lists.domains|| [];;
    
    console.log(uuid);
    
    screenshotURL=`https://radar.cloudflare.com/api/url-scanner/${uuid}/screenshot?resolution=desktop` || "N/A"; 
    console.log(screenshotURL);

    saveScanResult({
      uniqueCategoryNames : uniqueCategoryNames,
      rankResults : rankResults,
      ipsList : ipsList,
      domainsList : domainsList,
      screenshotURL : screenshotURL
    });
  
    chrome.runtime.sendMessage({
    type: "cloudflareResult",
    data: {
      error : "saved to local"
      // cloudflareURL : cloudflareURL
      }
    });
    return { uniqueCategoryNames, rankResults, ipsList, domainsList, screenshotURL }; // Return processed data
  }
    

    

  // Function to poll for results
  async function pollForResults(scanUuid) {
    const resultsOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Email': email,
        'X-Auth-Key': apiToken
      }
    };

    while (true) {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/urlscanner/scan/${scanUuid}`, resultsOptions);
      if (response.status === 202) {
        console.log('Scan in progress, polling again (cloudflare)...');
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      } else if (response.status === 200) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}, Details: ${JSON.stringify(errorData)}`);
      }
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkScanStatus') {
      chrome.storage.local.get(['scanStatus'], (data) => {
          sendResponse({
              isScanning: isScanning,
              scanStatus: data.scanStatus || 'none'
          });
      });

      // Allow asynchronous response
      return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkScanError') {
      chrome.storage.local.get(['scanStatus'], (data) => {
          sendResponse({
              isScanning: isScanning,
              scanStatus: data.scanStatus || 'none'
          });
      });


      return true;
  }
});


