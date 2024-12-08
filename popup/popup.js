

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
            <button class="button" id="captureScreenshot">Scan QR on screen</button>
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
                <span class="file-cta">
                    <span class="file-icon">
                        <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label"> Choose a file… </span>
                </span>
                <span class="file-name"> No file uploaded </span>
            </label>
        </div>
    </div>

    

    <div class="container m-3">
        <p id="storeError"></p>
        <p class="has-text-danger" id="invalid-file-message" style="display: none;">Please upload a valid PNG or JPEG image.</p>
        <button id="qrAnalyseButton" class="button is-link" disabled >Analyse</button>
        
    </div>
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
                    <label class="label">Result:</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <span id="flagResult" class="tag is-success"></span>
                            <p id="title" >hello this should change</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="field is-grouped is-grouped-multiline">
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">Reputation</span>
                    <span id="reputation" class="tag is-info">URL</span>
                </div>
            </div>
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">IP</span>
                    <span id="ip" class="tag is-info">ip</span>
                </div>
            </div>
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">URL</span>
                    <span id="url" class="tag is-info" style="word-break: break-all; overflow-wrap: break-word;">url</span>
                </div>
            </div>
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">Domain</span>
                    <span id="domain" class="tag is-info">domain</span>
                </div>
            </div>
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">Country</span>
                    <span id="country" class="tag is-info">country</span>
                </div>
            </div>
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">Category</span>
                    <span id="uniqueCategoryNames" class="tag is-info">cat</span>
                </div>
            </div>
            <div class="control">
                <div class="tags has-addons">
                    <span class="tag is-dark">Certificate</span>
                    <span class="tag is-primary">Yes</span>
                </div>
            </div>
        </div>

        <div class="container m-3">
            <figure class="image is-180x180">
                <img id="screenshotURL" src="" alt="Screenshot" style="width: 50%; max-width: 100%; height: auto;">
            </figure>
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
        <div class="container m-3">
            <p>Analysing ...</p>
            <p>This process will take more than 20 seconds..</p>
             <p  id="loader" style="display: none;"></p>
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
    const urlPattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
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
        
        if (messagesReceived === 3) {
            console.log("all 3 done, go analyse page")
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
            document.getElementById('title').textContent=title; 
            document.getElementById('reputation').textContent=reputation;
            document.getElementById('ip').textContent=ip;
            document.getElementById('url').textContent=url;
            document.getElementById('domain').textContent=domain;
            document.getElementById('country').textContent=country;
            document.getElementById('uniqueCategoryNames').textContent=uniqueCategoryNames;
            document.getElementById('screenshotURL').src=screenshotURL;
 
    
        }else{
            console.log("this check done before all 3 done")
        }
    }

    
    content.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'qrAnalyseButton') {
            console.log('analyse button clicked');
            decodeNPrintText()
        }

        else if (event.target && event.target.id === 'urlAnalyseButton') {
            const urlInput = document.getElementById('url-input');
            // Regular expression to validate URL format
            const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?(#.*)?$/;
            
            if (urlInput) {
                const enteredURL = urlInput.value;
                console.log('Entered URL:', enteredURL);

                if (enteredURL === '') {
                    document.getElementById('urlError').innerText='Error: URL input is empty';
                    return;
                }

                else if (!urlPattern.test(enteredURL)){
                    document.getElementById('urlError').innerText='Error: Invalid URL format';
                    return;
                }
    
                // Reset state before starting a new analysis
                resetState();

                content.innerHTML = loadingContent;
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
                        content.innerHTML = analyseContent;
                        console.log('Redirecting to analysis page for URL:', data.lastScannedURL);

                        // Optionally, call a function to process or display the results
                        analyzeResults();
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
            // Regular expression to validate URL format
            const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?(\?.*)?(#.*)?$/;
            
            if (decodedElement) {
                const decodedText = decodedElement.textContent;
                const enteredURL = decodedText.valueOf;
                console.log('Entered URL:', enteredURL);

                if (!decodedText) {
                    document.getElementById('qrDecodedAction').textContent = "Error: Content is empty";
                    return;
                } else if (!urlPattern.test(decodedText)) {
                    document.getElementById('qrDecodedAction').textContent = "Error: Invalid URL format";
                    return;
                }
    
                // Reset state before starting a new analysis
                resetState();

                content.innerHTML = loadingContent;
                const loader = loadingAnimation();                 

                // Send a message to the background script
                chrome.runtime.sendMessage({ action: 'scanURL', url: enteredURL }, (response) => {
                    clearInterval(loader); // Stop loading animation
                    console.log('Response from background:', response);
                });

            }else {
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
                const virusTotalData = message.data;

                title = virusTotalData.title || 'N/A';
                console.log("title: "+title);
                lastAnalysisDate =  virusTotalData.lastAnalysisDate || 'N/A';
                threatName = virusTotalData.threatName || 'None';
                reputation = virusTotalData.reputation || 'N/A';
                category = virusTotalData.category || 'N/A';
                totalEngines = virusTotalData.totalEngines || '96';
                flag = virusTotalData.flag || '0';
                // virustotalURL = virusTotalData.virustotalURL;
                messagePromises.virusTotalResultResolve();
                messagesReceived++;
                analyzeResults();
            }

            // Process URLScanIoResult messages
            if (message.type === "URLScanIoResult") {
                console.log("urlscanio data received...");
                const urlScanData = message.data;

                ip = urlScanData.ip || 'N/A';

                url = urlScanData.url || 'N/A';

                domain= urlScanData.domain || 'N/A';

                city = urlScanData.city || 'N/A';

                country = urlScanData.country || 'N/A';

                tlsIssuer = urlScanData.tlsIssuer || 'N/A';

                tlsValidFrom = urlScanData.tlsValidFrom || 'N/A';

                tlsValidDays = urlScanData.tlsValidDays || 'N/A';

                // urlscanioURL = urlScanData.urlscanioURL;
                
                messagePromises.URLScanIoResultResolve();
                messagesReceived++;
                analyzeResults();
            }

            // Process cloudflareResult messages
            if (message.type === "cloudflareResult") {
                const cloudflareData = message.data;
                console.log("clouflare data received...");

                uniqueCategoryNames = cloudflareData.uniqueCategoryNames || 'N/A';

                rankResults = cloudflareData.rankResults || 'N/A';

                ipsList = cloudflareData.ipsList || 'None';

                domainsList = cloudflareData.domainsList || 'N/A';
                //cloudflareURL = cloudflareData.cloudflareURL;
                
                screenshotURL=cloudflareData.screenshotURL;
                console.log(`ssURL : ${cloudflareData.screenshotURL}`)
                messagePromises.cloudflareResultResolve(); 
                messagesReceived++;
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
            //cloudflareURL='N/A';
            //urlscanioURL='N/A';
            //virustotalURL='N/A';
        
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
