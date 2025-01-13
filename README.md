# **QR Code Decoder and URL Analysis Extension built for Google Chrome browser**

## **Compatibility:**
- **Google Chrome**
- **Microsoft Edge**

---

## **Installation Guidelines:**
1. Download the repository into one folder.
2. Open `background.js` with your preferred code editor (e.g., Visual Studio Code).
<img src="https://github.com/user-attachments/assets/6d49d741-9ed0-47f1-be3c-5254f329857a" width="600"/>

4. Register for three API keys, one from each of the following services:
   - **VirusTotal**
   - **Cloudflare Radar**
   - **URLScan.io**
     
### **VirusTotal Registration:**
4. Visit the VirusTotal registration page: https://www.virustotal.com/gui/join-us
<img src="https://github.com/user-attachments/assets/15aaa4a7-6b13-403f-aec8-2aa76d85d0e9" width="650"/>
  
5. Visit the VirusTotal API page: https://www.virustotal.com/gui/my-apikey
<img src="https://github.com/user-attachments/assets/f8306072-4a13-4f03-92f0-5de7b4cd6e3e" width="650"/>
   
6. Copy the API key and paste it into the `VIRUSTOTAL_API_KEY` variable in `background.js`

   ---

### **URLScan.io Registration:**
7. Visit the URLScan.io register page:  https://urlscan.io/user/signup
<img src="https://github.com/user-attachments/assets/8491cb43-6fe5-4d77-a0cd-7a60f04f7b2e" width="650"/>
   
8. After registering, go to your user profile page and create a new API key
<img src="https://github.com/user-attachments/assets/c4cca145-5103-472f-af20-afa5986ce561" width="650"/>
   
9. Copy the generated API key and paste it into the `URLSCANIO_API_KEY` variable in `background.js`

---

### **Cloudflare Registration:**
10. Register Cloudflare account at: https://dash.cloudflare.com/login
11. Navigate to **Compute (Workers)** > **Worker & Pages**
12. Create a Worker
<img src="https://github.com/user-attachments/assets/b10ce020-c563-4373-b67d-a44d27132948" width="600"/>
    
13. Deploy the Worker directly (it doesn’t matter what we have deployed, we just want to reveal the account ID in the dashboard)
<img src="https://github.com/user-attachments/assets/0971fbf3-4756-43ed-bcc1-ee419464b645" width="650"/>
    
14. Click **Continue to Project**
<img src="https://github.com/user-attachments/assets/ede377c8-86ab-46e5-a5a0-fd05c9204ce1" width="650"/>
    
15. Move back to **Compute (Workers)** > **Worker & Pages** and you will see the account ID at the right side
16. copy the Account ID
<img src="https://github.com/user-attachments/assets/b8bb1ff0-2c01-411f-90cf-aa7bdfc543d5" width="650"/>
    
17. Paste the ID into the `CLOUDFLARE_ACC_ID` variable in `background.js`
18. Click **Manage API Tokens** below the account ID
19. Click **View Global API Key** and copy the key, then paste it into the `CLOUDFLARE_API_KEY` variable in `background.js`
<img src="https://github.com/user-attachments/assets/6bc2de57-a82a-4c9d-a14e-bd5a5f4d9a10" width="650"/>
    
20. Save the background.js and close the code editor

  ---

## **Loading the Extension in Chrome:**
21. Open Google Chrome, click the extension icon, and go to **Manage Extensions**, or access the URL `chrome://extensions/` directly
22. Enable **Developer Mode** at the top right and click **Load Unpacked** at the top left.
<img src="https://github.com/user-attachments/assets/3cbaa741-356e-433a-8b2f-5ed81192e967" width="650"/>
    
23. Select the folder containing the extension files and load it
24. Click the extension icon in a new tab and pin the extension
25. You are good to go!

  ---

## **Reminder:**
1. You can switch between QR decoder or URL scanner by clicking the **QR/URL** button.
2. URL analysis may take more than 30 seconds.
3. You can close the extension while scanning is in progress. Just navigate to the URL page and click **Check Last Scan** to view the result after it is done.
   
