

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const content = document.getElementById('content');
    const scannedImage = document.getElementById('scannedImage');
    const canvas = document.createElement('canvas');
    const checkScanButton = document.getElementById('checkScanButton');
    const urlError = document.getElementById('urlError'); // Reference to the label
    let storedFile = null; // Variable to store the file data URL
    let currentView = 'qr'; // Default view is QR

    let fileInputListenerAttached = false;

    const qrContent = `
    <div class="container m-3">
        <div class="field">
            <button class="button custom-dark" id="captureScreenshot">Scan QR on screen</button>
        </div>
    </div>

    <!-- Divider with "OR" -->
    <div class="container m-3">
        <h5 style="padding-left: 70px;">OR</h5>
    </div>

    <div class="container m-3">
        <div id="file-js-example" class="file has-name">
            <label class="file-label">
                <input class="file-input" type="file" name="resume" />
                <span class="file-cta custom-dark" style="width: 130px;">
                    <span class="file-icon">
                        <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label"> Select file </span>
                </span>
                <span class="file-name custom-dark"> No file uploaded </span>
            </label>
        </div>
    </div>

    <div class="container m-3">
        <p style="color: orange; font-weight: bold;">Ensure only one QR code is visible or uploaded to avoid errors</p>
    </div>


    

    <div class="container m-3">
        <p id="storeError"></p>
        <p class="has-text-danger" id="invalid-file-message" style="display: none;">Please upload a valid PNG or JPEG image.</p>
        <button id="qrAnalyseButton" class="button is-link" disabled >Analyse</button>
        
    </div>

    <!-- Custom CSS for Light Background and Text Color -->
    <style>
        .custom-dark {
            background-color:rgb(54, 54, 54); /* Dark background */
            color: #f5f5f5; /* Light text color */
            border: 1px solid #4a4a4a; /* Light border */
            font-weight: normal;
        }

        .custom-dark .file-label {
            color: #f5f5f5; /* Light text color inside the button */
            
        }

        .custom-dark .file-label:hover {
            color: #e0e0e0; /* Slightly lighter text color on hover */
        }

        .custom-dark:hover {
            background-color: #4a4a4a; /* Darker background on hover */
        }

        .custom-dark .file-name {
            color: #f5f5f5; /* Light text color for file name */
           
        }

        .custom-dark .file-name:hover {
            color: #e0e0e0; /* Lighter color on hover for file name */
        }
    </style>

    `;

    const urlContent = `
        <div class="field-container m-3">
 
            <div class="field-label">
                <label class="label">Enter URL:</label>
            </div>
            <div class="field-input">
                <input type="text" class="input" id="url-input" placeholder="URL to Check">
            </div>
            <div class="field-label">
                <label class="label" id=urlError></label>
            </div>

        </div>

        <div class="container m-3">
        <button id="urlAnalyseButton" class="button is-link" >Analyse</button>
        <button id="checkScanButton" class="button is-primary">Check Last Scan</button>
        </div>
    `;

    const decodeContent = `
        <div class="container m-3">
            <p id="decodedText"></p>
        </div>

        <div class="control">
                <div style="padding-left: 10px;">
                    <textarea id="decoded-data" rows="4" cols="40"></textarea>
                </div>
            </div>

        
        <div class="control">
                <div class="tags has-addons" style="padding-left: 10px; padding-bottom: 10px;">
                    <span class="tag is-dark" >Data type</span>
                    <span class="tag is-success" id="data-type"></span>
                </div>
            </div>

        <div class="container m-3">
            <div>
                <p id="qrDecodedAction"></p>
            </div>
        </div>

        <div class="container m-3">
            <button id="copyContent" class="button is-success" style="margin-bottom: 5px;">Copy Content</button>
            <button id="qrScanURL" class="button is-warning" style="margin-bottom: 5px;">Scan URL</button>
            <button id="downloadButton" class="button is-link">Download Content</button>
            <button id="exitButton" class="button is-danger">Exit</button>
        </div>
    
    `

    const analyseContent = `
        <div class="container m-3">
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label has-text-weight-bold">Title:</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <p id="title" class=" has-text-info">Unavailable</p>
                    </div>
                <div class="field-label is-normal">
                    <label class="label has-text-weight-bold">Final URL:</label>
                </div>
                </div>
                <div class="field-body">
                    <div class="field">
                        <p id="finalURL">redirectedURL</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="container m-3 field is-grouped is-grouped-multiline">
            
            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">VirusTotal Flagged Results </span>
                    <span id="flagResult" class="tag is-success"></span>
                </div>
            </div>

            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">Reputation</span>
                    <span id="reputation" class="tag is-success">Neutral</span>
                </div>
            </div>

            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">IP</span>
                    <span id="ip" class="tag is-info">ip</span>
                </div>
            </div>

            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">Domain</span>
                    <span id="domain" class="tag is-info">domain</span>
                </div>
            </div>
            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">Country</span>
                    <span id="country" class="tag is-info">country</span>
                </div>
            </div>
            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">Category</span>
                    <span id="uniqueCategoryNames" class="tag is-info">cat</span>
                </div>
            </div>
            <div class="control mr-1">
                <div class="tags has-addons">
                    <span class="tag is-dark">Certificate</span>
                    <span class="tag is-primary">Yes</span>
                </div>
            </div>
        </div>

        <div class="container m-3">
            <figure class="image is-180x180">
                <img id="screenshotURL" src="" alt="Screenshot" style="width: 100%; max-width: 100%; height: auto;">
            </figure>
            
        </div>
        <div class="container m-3">
            
            <button id="fullReportButton" class="button is-link">Report in Detail</button>
            <button id="exitButton" class="button is-link">Exit</button>
        </div>
        
    `;

    const exitContent = `
        <div class="container m-3">
            <div class="field">
                <h2>Have a Good Day</h2>
            </div>
        </div>
    `;

    const loadingContent = `
        <div id="processMessages" class="container m-3">
            <p>Analysing ...</p>
            <p>This process will take more than 20 seconds..</p>
        </div>
        <div class="container m-3">
             <p  id="loader" style="display: none;"></p>
             <p id="scanError" style="display: none;"></p> 
        </div>
    `;

    function loadContent() {
        if (currentView === 'qr') {
            content.innerHTML = qrContent;
            detachFileInputListener();
            attachFileInputListener();

        } else if (currentView === 'url') {
            content.innerHTML = urlContent;
            detachFileInputListener();
            storedFile = null; 
        }
    }
    
    // Initial content load for QR
    loadContent();

    // Toggle between QR and URL views when the button is clicked
    toggleButton.addEventListener('click', function() {
        currentView = currentView === 'qr' ? 'url' : 'qr'; // Toggle the view
        loadContent(); // Load the appropriate content
    });

    
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        const errorElement = document.getElementById('scanError');
        if (message.type === 'dnsError') {
            // Update the HTML to show the DNS error
            errorElement.innerText = message.message;
            errorElement.style.display = 'block';
            errorElement.classList.add('has-text-danger');
            // Hide the loader and process messages
            document.getElementById('loader').style.display = 'none';  // Hide the loader
            document.getElementById('processMessages').style.display = 'none';  // Hide all process messages
        } else if (message.type === 'requestFailed') {
            errorElement.innerText = `Request failed: URL Not Exist`;
            errorElement.style.display = 'block';
            errorElement.classList.add('has-text-danger');
            // Hide the loader and process messages
            document.getElementById('loader').style.display = 'none';  // Hide the loader
            document.getElementById('processMessages').style.display = 'none';  // Hide all process messages
        }
    });
    
        


    function attachFileInputListener() {
        if (!fileInputListenerAttached) {
            const fileInput = document.querySelector("#file-js-example input[type=file]");
            fileInput.addEventListener('change', function() {
                const file = fileInput.files[0];

                // Clear previous file data
                localStorage.removeItem('storedFile');
                document.querySelector("#file-js-example .file-name").textContent = "No file uploaded";

                //show file name
                const fileNameSpan = document.querySelector("#file-js-example .file-name");
                fileNameSpan.textContent = file.name;

                if (file) {
                    const allowedExtensions = ['png', 'jpg', 'jpeg'];
                    const fileExtension = file.name.split('.').pop().toLowerCase();
                    const errorMessage = document.getElementById('invalid-file-message');
                    if (!allowedExtensions.includes(fileExtension)) {
                        // Display an error message indicating invalid file type
                        errorMessage.style.display = 'block';
                        // Clear the file input
                        fileInput.value = '';
                        //block analyse button
                        document.getElementById('qrAnalyseButton').disabled = true;
                        return;
        
                    }
                    else{
                        // Store the file
                        errorMessage.style.display = 'none';
                        storeFile(file)
                        .then(() => {
                            document.getElementById('storeError').textContent = 'File uploaded successfully. Click "Analyze QR Code" to process.';
                        })
                        .catch(error => {
                            document.getElementById('storeError').textContent = 'Error uploading file: ' + error;
                        });
                
                        document.getElementById('qrAnalyseButton').disabled = false;
                    }
                    
                    
                }
            });
                fileInputListenerAttached = true;
            }
           
            
        }

    function detachFileInputListener() {
        if (fileInputListenerAttached) {
            const fileInput = document.querySelector("#file-js-example input[type=file]");
            
            if (fileInput) {
                fileInput.removeEventListener('change', null);
                fileInputListenerAttached = false;
              }
        }
    }

    

// Function to store the file in local storage
function storeFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Read the file as a data URL
        reader.onload = () => {
            // Store the data URL (or your preferred representation of the file)
            storedFile = reader.result; // Save the data URL in a variable
            resolve();
        };
        reader.onerror = error => {
            reject(error);
        };
    });
}

function decodeQR(dataURL) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    resolve(code.data);
                } else {
                    reject('No QR code found');
                }
            } catch (error) {
                reject(error);
            }
        };
        img.src = dataURL;
    });
}

function categorizeData(data) {
    // Check if the data is a URL
    const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?(#.*)?$/;
    if (urlPattern.test(data)) {
        return 'URL';
    }

    // Check if the data is an integer
    const integerPattern = /^\d+$/;
    if (integerPattern.test(data)) {
        return 'Integer';
    }

    // Check if the data is binary (only 0s and 1s)
    const binaryPattern = /^[01]+$/;
    if (binaryPattern.test(data)) {
        return 'Binary';
    }

     // General code pattern: match common function call patterns, assignments, and symbols
    const codePattern = /\b\w+\s*\(.*\)\s*\{|\b\w+\s*=\s*[^;]+;/; // Function call or assignment pattern
    const symbolPattern = /[{}()\[\];,.]/; // Code symbols like {}, (), [], ;, etc.

    // If any code-like structure is found (e.g., function calls, assignments, or symbols)
    if (codePattern.test(data) || symbolPattern.test(data)) {
        return 'Code';
    }

    // Default fallback: categorize it as text
    return 'Text';
}

function screenshot(){
    // Capture the screenshot of the current tab
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
        // Convert the data URL to a Blob
        fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                // Store the file using the provided function
                storeFile(blob)
                    .then(() => {
                        console.log('Screenshot stored successfully.');
                        decodeNPrintText();
                    })
                    .catch(error => {
                        console.error('Error storing screenshot:', error);
                    });
            })
            .catch(error => {
                console.error('Error converting data URL to Blob:', error);
            });
    });

}

function downloadData(){
    const decodedText = document.getElementById('decoded-data').textContent;

    if (!decodedText) {
        console.error('No decoded text available for download.');
        document.getElementById('qrDecodedAction').textContent = "No decoded text available for download.";
        return;
    }

    // Create a Blob with the decoded text
    const blob = new Blob([decodedText], { type: 'text/plain' });

    // Create a link element
    const link = document.createElement('a');

    // Set the download attribute with a filename
    link.download = 'decoded-data.txt';

    // Create an object URL for the Blob and set it as the href
    link.href = URL.createObjectURL(blob);

    // Append the link to the body (necessary for Firefox)
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);

    document.getElementById('qrDecodedAction').textContent = "File Downloaded.";
}
    
function decodeNPrintText(){
    decodeQR(storedFile)
        .then(decodedData => {
            document.getElementById('decodedText').textContent = 'Decoded QR code data: ';
            document.getElementById('decoded-data').textContent = decodedData;
            const categorizedType = categorizeData(decodedData);
            document.getElementById('data-type').textContent = categorizedType;
        })
        .catch(error => {
            document.getElementById('decodedText').textContent = 'Error decoding QR code: ' + error;
        });
        
    content.innerHTML = decodeContent;
    // Detach file input listener (assuming it's necessary)
    detachFileInputListener();
}



    function copyDecodedData() {
        const decodedData = document.getElementById('decoded-data').textContent;

        if (!decodedData) {
            console.error('No decoded data available to copy.');
            document.getElementById('qrDecodedAction').textContent = 'No decoded data available to copy.';
            return;
        }

        // Use the Clipboard API to copy text to clipboard
        navigator.clipboard.writeText(decodedData)
            .then(() => {
                document.getElementById('qrDecodedAction').textContent = 'Decoded data copied to clipboard.';
            })
            .catch(err => {
                document.getElementById('qrDecodedAction').textContent = 'Failed to copy text to clipboard: ' + err;
            });
    }



    // Loading animation function
    function loadingAnimation() {
        const loaderChars = ['|', '/', '-', '\\'];
        let i = 0;
        const loaderElement = document.getElementById('loader'); // Ensure you have an element with this ID
        loaderElement.style.display = 'block'; // Make sure the loader is visible

        return setInterval(() => {
            loaderElement.innerText = `Loading ${loaderChars[i++ % loaderChars.length]}`;
        }, 200); // Update every 200ms
    }

    // Create an object to hold the message promises and their resolvers
    const messagePromises = {
        virusTotalResult: null,
        URLScanIoResult: null,
        cloudflareResult: null,
    };

    // Initialize the promises
    messagePromises.virusTotalResult = new Promise((resolve) => {
        messagePromises.virusTotalResultResolve = resolve;
    });

    messagePromises.URLScanIoResult = new Promise((resolve) => {
        messagePromises.URLScanIoResultResolve = resolve;
    });

    messagePromises.cloudflareResult = new Promise((resolve) => {
        messagePromises.cloudflareResultResolve = resolve;
    });

    let messagesReceived = 0; // Counter for received messages
    let title=' ', lastAnalysisDate='N/A', threatName='N/A', reputation='N/A', category='N/A', totalEngines='N/A', flag='N/A';
    let ip='N/A', url='N/A', domain='N/A', city='N/A', country='N/A', tlsIssuer='N/A', tlsValidFrom='N/A', tlsValidDays='N/A';
    let uniqueCategoryNames='N/A', rankResults='N/A', screenshotURL='N/A', ipsList='N/A', domainsList='N/A';
    //let cloudflareURL='N/A', urlscanioURL='N/A', virustotalURL='N/A';

    async function analyzeResults() {
        await Promise.all([
            messagePromises.virusTotalResult,
            messagePromises.URLScanIoResult,
            messagePromises.cloudflareResult,
        ]);
        
        

            chrome.storage.local.get(['title', 'lastAnalysisDate', 'threatName', 'reputation', 'category', 'totalEngines', 'flag', 'ip', 'url', 'domain', 'city', 'country', 'tlsIssuer', 'tlsValidFrom', 'tlsValidDays', 'uniqueCategoryNames', 'rankResults', 'ipsList', 'domainsList', 'screenshotURL'], function (result) {
                console.log("Retrieved scan data from local storage:", result);
                title = result.title || 'N/A';                     
                lastAnalysisDate =  result.lastAnalysisDate || 'N/A';
                threatName = result.threatName || 'None';
                reputation = result.reputation || 'N/A';
                category = result.category || 'N/A';
                totalEngines = result.totalEngines || '96';
                flag = result.flag || '0';

                ip = result.ip || 'N/A';
                url = result.url || 'N/A';
                domain= result.domain || 'N/A';
                city = result.city || 'N/A';
                country = result.country || 'N/A';
                tlsIssuer = result.tlsIssuer || 'N/A';
                tlsValidFrom = result.tlsValidFrom || 'N/A';
                tlsValidDays = result.tlsValidDays || 'N/A';

                uniqueCategoryNames = result.uniqueCategoryNames || 'N/A';
                rankResults = result.rankResults || 'N/A';
                ipsList = result.ipsList || 'None';
                domainsList = result.domainsList || 'N/A';
                screenshotURL=result.screenshotURL;



            content.innerHTML = analyseContent;

            let flagResult = `${flag}/${totalEngines}`;
            const flagElement = document.getElementById('flagResult');
                if (flagElement) {
                    flagElement.textContent = flagResult;

                    // Apply color based on flag value using className
                    if (parseInt(flag, 10) > 5) {
                        flagElement.className = 'tag is-danger'; // Red
                    } else if (parseInt(flag, 10) > 0) {
                        flagElement.className = 'tag is-warning'; // Orange
                    } else {
                        flagElement.className = 'tag is-success'; // Green
                    }
                } 

            const reputationElement = document.getElementById('reputation');
            if (reputationElement) {
                reputationElement.textContent = reputation;
            
                // Apply color based on reputation value
                if (reputation === 'Negative') {
                    reputationElement.className = 'tag is-danger'; // Red
                } else if (reputation === 'Neutral') {
                    reputationElement.className = 'tag is-warning'; // Orange
                } else if (reputation === 'Positive') {
                    reputationElement.className = 'tag is-success'; // Green
                }
            }

            document.getElementById('title').textContent=title; 
            document.getElementById('ip').textContent=ip;
            document.getElementById('finalURL').textContent=url;
            document.getElementById('domain').textContent=domain;
            document.getElementById('country').textContent=country;
            document.getElementById('screenshotURL').src=screenshotURL;

            // Split the uniqueCategoryNames into an array, trim, and filter for the priority categories
            let categories = uniqueCategoryNames && uniqueCategoryNames.trim() ? uniqueCategoryNames.split(',').map(category => category.trim()) : [];

            // Prioritize Malicious, Phishing, and Security threats
            let prioritizedCategories = categories.filter(category => ['Malicious', 'Phishing', 'Security threats'].includes(category));

            // Filter out the remaining categories
            let otherCategories = categories.filter(category => !['Malicious', 'Phishing', 'Security threats'].includes(category));

            // Combine the prioritized categories with the others, and take only the first two
            let finalCategories = prioritizedCategories.concat(otherCategories).slice(0, 2);

            // Set the text content for the element
            document.getElementById('uniqueCategoryNames').textContent = finalCategories.join(', ').trim() || '';

            const categoryElement = document.getElementById('uniqueCategoryNames');
            if (categoryElement) {
                // Check if any of the categories match the specific threat types
                const hasThreatCategory = finalCategories.some(category => 
                    ['Malicious', 'Phishing', 'Security threats'].includes(category)
                );

                // Apply red color (has-text-danger) if any of the threat categories are found
                if (hasThreatCategory) {
                    categoryElement.className = 'tag is-danger'; // Red for threats
                    
                } else {
                    categoryElement.className = 'tag is-info'; // Green (default) for safe categories
            
                }
            }
 
        });
        
    }

    
    content.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'qrAnalyseButton') {
            console.log('analyse button clicked');
            decodeNPrintText()
        }

        else if (event.target && event.target.id === 'urlAnalyseButton') {
            const urlInput = document.getElementById('url-input');
            // Regular expression to validate standard URL format (domain-based URLs)
            const urlPattern1 = /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?(#.*)?$/;
            // Regular expression to validate IP addresses with optional ports and paths
            const urlPattern2 = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/[\w\-\.]+)*\/?(\?.*)?(#.*)?$/;
            
            if (urlInput) {
                const enteredURL = urlInput.value;
                console.log('Entered URL:', enteredURL);

                if (enteredURL === '') {
                    document.getElementById('urlError').innerText='Error: URL input is empty';
                    return;
                }

                // Check if either of the patterns matches
                else if (!urlPattern1.test(enteredURL) && !urlPattern2.test(enteredURL)) {
                    document.getElementById('urlError').innerText = 'Error: Invalid URL format';
                    return;
                }
    
                // Reset state before starting a new analysis
                resetState();

                content.innerHTML = loadingContent;
                            
                document.getElementById('loader').style.display = 'block';  
                document.getElementById('processMessages').style.display = 'block';  

                const errorElement = document.getElementById('scanError');
                errorElement.style.display = 'none';  // Hide the error message
                errorElement.innerText = '';  // Clear the error message text
                errorElement.classList.remove('has-text-danger');  // Remove red color

                const loader = loadingAnimation();                 

                // Send a message to the background script
                chrome.runtime.sendMessage({ action: 'scanURL', url: enteredURL }, (response) => {
                    clearInterval(loader); // Stop loading animation
                    console.log('Response from background:', response);
                });

            }else {
                console.error('Error: url-input element not found');
            }
        }

        // Add the event listener for the checkScanButton
        else if (event.target && event.target.id === 'checkScanButton') {
            const urlError = document.getElementById('urlError'); // Make sure this element exists

            // Send a message to check if a scan is in progress
            chrome.runtime.sendMessage({ action: 'checkScanStatus' }, (response) => {
                if (response.isScanning) {
                    urlError.innerText = 'Please wait until the last scan is completed.';
                    urlError.style.color = 'orange'; // Optional: Change the color for better visibility
                } else {
                    // Fetch last scan data and status
                chrome.storage.local.get(['lastScannedURL', 'scanStatus'], (data) => {
                    if (data.scanStatus === 'completed' && data.lastScannedURL) {
                        // Redirect to analysis page
                        console.log('Redirecting to analysis page for URL:', data.lastScannedURL);

                        // Optionally, call a function to process or display the results
                        chrome.storage.local.get(['title', 'lastAnalysisDate', 'threatName', 'reputation', 'category', 'totalEngines', 'flag', 'ip', 'url', 'domain', 'city', 'country', 'tlsIssuer', 'tlsValidFrom', 'tlsValidDays', 'uniqueCategoryNames', 'rankResults', 'ipsList', 'domainsList', 'screenshotURL'], function (result) {
                            console.log("Retrieved scan data from local storage:", result);
                            title = result.title || 'N/A';                     
                            lastAnalysisDate =  result.lastAnalysisDate || 'N/A';
                            threatName = result.threatName || 'None';
                            reputation = result.reputation || 'N/A';
                            category = result.category || 'N/A';
                            totalEngines = result.totalEngines || '96';
                            flag = result.flag || '0';
            
                            ip = result.ip || 'N/A';
                            url = result.url || 'N/A';
                            domain= result.domain || 'N/A';
                            city = result.city || 'N/A';
                            country = result.country || 'N/A';
                            tlsIssuer = result.tlsIssuer || 'N/A';
                            tlsValidFrom = result.tlsValidFrom || 'N/A';
                            tlsValidDays = result.tlsValidDays || 'N/A';
            
                            uniqueCategoryNames = result.uniqueCategoryNames || 'N/A';
                            rankResults = result.rankResults || 'N/A';
                            ipsList = result.ipsList || 'None';
                            domainsList = result.domainsList || 'N/A';
                            screenshotURL=result.screenshotURL;
            
            
            
                        content.innerHTML = analyseContent;
            
                        let flagResult = `${flag}/${totalEngines}`;
                        const flagElement = document.getElementById('flagResult');
                            if (flagElement) {
                                flagElement.textContent = flagResult;
            
                                // Apply color based on flag value using className
                                if (parseInt(flag, 10) > 5) {
                                    flagElement.className = 'tag is-danger'; // Red
                                } else if (parseInt(flag, 10) > 0) {
                                    flagElement.className = 'tag is-warning'; // Orange
                                } else {
                                    flagElement.className = 'tag is-success'; // Green
                                }
                            } 

                        const reputationElement = document.getElementById('reputation');
                        if (reputationElement) {
                            reputationElement.textContent = reputation;
                        
                            // Apply color based on reputation value
                            if (reputation === 'Negative') {
                                reputationElement.className = 'tag is-danger'; // Red
                            } else if (reputation === 'Neutral') {
                                reputationElement.className = 'tag is-warning'; // Orange
                            } else if (reputation === 'Positive') {
                                reputationElement.className = 'tag is-success'; // Green
                            }
                        }
            
                        document.getElementById('title').textContent=title; 
                        document.getElementById('ip').textContent=ip;
                        document.getElementById('finalURL').textContent=url;
                        document.getElementById('domain').textContent=domain;
                        document.getElementById('country').textContent=country;
                        document.getElementById('screenshotURL').src=screenshotURL;

                        // Split the uniqueCategoryNames into an array, trim, and filter for the priority categories
                        let categories = uniqueCategoryNames && uniqueCategoryNames.trim() ? uniqueCategoryNames.split(',').map(category => category.trim()) : [];

                        // Prioritize Malicious, Phishing, and Security threats
                        let prioritizedCategories = categories.filter(category => ['Malicious', 'Phishing', 'Security threats'].includes(category));

                        // Filter out the remaining categories
                        let otherCategories = categories.filter(category => !['Malicious', 'Phishing', 'Security threats'].includes(category));

                        // Combine the prioritized categories with the others, and take only the first two
                        let finalCategories = prioritizedCategories.concat(otherCategories).slice(0, 2);

                        // Set the text content for the element
                        document.getElementById('uniqueCategoryNames').textContent = finalCategories.join(', ').trim() || '';
                        
                        const categoryElement = document.getElementById('uniqueCategoryNames');
                        if (categoryElement) {
                            // Check if any of the categories match the specific threat types
                            const hasThreatCategory = finalCategories.some(category => 
                                ['Malicious', 'Phishing', 'Security threats'].includes(category)
                            );

                            // Apply red color (has-text-danger) if any of the threat categories are found
                            if (hasThreatCategory) {
                                categoryElement.className = 'tag is-danger'; // Red for threats
                              
                            } else {
                                categoryElement.className = 'tag is-info'; // Green (default) for safe categories
                            
                            }
                        }

                    })

                    } else if (data.scanStatus !== 'completed') {
                        urlError.innerText = 'No scan is currently running, or the scan is not yet completed.';
                        urlError.style.color = 'red';
                    } else {
                        urlError.innerText = 'No scan has been submitted.';
                        urlError.style.color = 'red';
                    }
                });
                }
            });
        }

        else if (event.target && event.target.id === 'exitButton') {
            content.innerHTML = exitContent;
            const fileInput = document.querySelector("#file-js-example input[type=file]");
            if (fileInput) {
                fileInput.value = ''; // Reset the file input value
            }
            document.getElementById('decoded-data').textContent = "";
            document.getElementById('data-type').textContent = "";
            document.getElementById('qrDecodedAction').textContent = "";
            resetState();
            // Reset the flag to allow reattaching the listener when user returns to the QR page
            fileInputListenerAttached = false;
        }

        else if (event.target && event.target.id === 'captureScreenshot') {
        screenshot();
        }

        else if (event.target && event.target.id === 'downloadButton') {
        downloadData();
        }

        else if (event.target && event.target.id === 'copyContent') {
        copyDecodedData();
        }

        else if (event.target && event.target.id === 'qrScanURL') {
            const decodedElement = document.getElementById('decoded-data');
            // Regular expression to validate standard URL format (domain-based URLs)
            const urlPattern1 = /^(https?:\/\/)?(www\.)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?(#.*)?$/;
            // Regular expression to validate IP addresses with optional ports and paths
            const urlPattern2 = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/[\w\-\.]+)*\/?(\?.*)?(#.*)?$/;
        
            if (decodedElement) {
                const decodedText = decodedElement.textContent.trim();  // Ensure there is no leading/trailing space
                console.log('Entered URL:', decodedText);
        
                // Validate if the decoded text exists and is not empty
                if (!decodedText) {
                    document.getElementById('qrDecodedAction').textContent = "Error: Content is empty";
                    return;
                }
        
                // Validate the URL format using the regex
                if (!urlPattern1.test(decodedText) && !urlPattern2.test(decodedText)) {
                    document.getElementById('urlError').innerText = 'Error: Invalid URL format';
                    return;
                }
        
                // Reset state and initiate loading animation
                resetState();
                content.innerHTML = loadingContent;

                document.getElementById('loader').style.display = 'block';  
                document.getElementById('processMessages').style.display = 'block';  

                const errorElement = document.getElementById('scanError');
                errorElement.style.display = 'none';  // Hide the error message
                errorElement.innerText = '';  // Clear the error message text
                errorElement.classList.remove('has-text-danger');  // Remove red color

                const loader = loadingAnimation();
        
                // Send the decoded URL for scanning
                chrome.runtime.sendMessage({ action: 'scanURL', url: decodedText }, (response) => {
                    clearInterval(loader);
                    console.log('Response from background:', response);
                });
        
            } else {
                console.error('Error: decoded text element not found');
            }
        }

        else if (event.target && event.target.id ==='fullReportButton'){
            const sampleData = { 
                title : title,
                lastAnalysisDate : lastAnalysisDate,
                threatName : threatName,
                reputation : reputation,
                category : category,
                totalEngines : totalEngines,
                flag : flag,
                ip : ip,
                url : url,
                domain : domain,
                city : city,
                country : country,
                tlsIssuer : tlsIssuer,
                tlsValidFrom : tlsValidFrom,
                tlsValidDays : tlsValidDays,
                uniqueCategoryNames : uniqueCategoryNames,
                rankResults : rankResults,
                screenshotURL : screenshotURL,
                ipsList : ipsList,
                domainsList : domainsList,
                // virustotalURL : virustotalURL,
                // cloudflareURL : cloudflareURL,
                // urlscanioURL : urlscanioURL
            };
                
           openDetailsPage(sampleData);
        }
    })
        // You may have other event listeners or functions here

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

            // Process virusTotalResult messages
            if (message.type === "virusTotalResult") {
                console.log("VT data received...");

                messagePromises.virusTotalResultResolve();
                messagesReceived++;
                
            }

            // Process URLScanIoResult messages
            if (message.type === "URLScanIoResult") {
                console.log("urlscanio data received...");
                
                messagePromises.URLScanIoResultResolve();
                messagesReceived++;
                
            }

            // Process cloudflareResult messages
            if (message.type === "cloudflareResult") {

                console.log("clouflare data received...");
                
                messagePromises.cloudflareResultResolve(); 
                messagesReceived++;
                
            }
            
            if (messagesReceived === 3) {
                console.log("all 3 done, go analyse page")
                analyzeResults();
            }
            
        });
        function resetState() {
            // Reset state variables
            messagesReceived = 0;
            title = '';
            lastAnalysisDate = 'N/A';
            threatName = 'N/A';
            reputation = 'N/A';
            category = 'N/A';
            totalEngines = 'N/A';
            flag = 'N/A';
            ip = 'N/A';
            url = 'N/A';
            domain = 'N/A';
            city = 'N/A';
            country = 'N/A';
            tlsIssuer = 'N/A';
            tlsValidFrom = 'N/A';
            tlsValidDays = 'N/A';
            uniqueCategoryNames = 'N/A';
            rankResults = 'N/A';
            screenshotURL = 'N/A';
            ipsList = 'N/A';
            domainsList = 'N/A';

        
            // Reinitialize messagePromises
            messagePromises.virusTotalResult = new Promise((resolve) => {
                messagePromises.virusTotalResultResolve = resolve;
            });
        
            messagePromises.URLScanIoResult = new Promise((resolve) => {
                messagePromises.URLScanIoResultResolve = resolve;
            });
        
            messagePromises.cloudflareResult = new Promise((resolve) => {
                messagePromises.cloudflareResultResolve = resolve;
            });

            console.log("reset done...");
        }

        function openDetailsPage(data){
            
            
            localStorage.setItem('detailData', JSON.stringify(data));
            const retrievedData = localStorage.getItem('detailData');

            // Print the retrieved data to the console to check
            console.log('Data saved to localStorage:', retrievedData);

            openWindow()
        }

        function openWindow(){
            window.open('fullreport.html', '_blank', 'width=800,height=800,scrollbars=yes');
        }
        
        
        


});
