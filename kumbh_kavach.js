//------------------Kumbh kavach app javascript------------------//

//------------Application data from json----------------------//
const appData = {
 "statistics":{
  "totalReports":3,
   "activeSearches":3,
   "peopleFound":0
  },
 "activeAlerts": [
    {
        "id": 1,
        "name": "Shivam Kumar",
        "age": 8,
        "gender": "Male",
        "lastSeen": "Sector 12, Main Gate Area",
        "timeAgo": "2 hours ago",
        "distance": "500m",
        "description": "Wearing blue shirt and khaki shorts.Has a small birthmark on left cheek.",
        "contactNumber": "+91-9876543210",
        "emergencyContact": "+91-9876543211",
        "status": "active",
        "reportedBy": "Father - Rajesh Kumar"
    },
    {
        "id": 2,
        "name": "Suman Devi",
        "age": 65,
        "gender": "Female",
        "lastSeen": "Ganga Ghat, Bathing Area 3",
        "timeAgo": "45 minutes ago",
        "distance": "1.2km",
        "description": "Elderly lady in white saree, walk with a cane. Speaks only Hindi.",
        "contactNumber": "+91-9823456789",
        "emergencyContact": "+91-9823456788",
        "status": "active",
        "reportedBy": "Son - Mohan Sharma"
    },
    {
        "id": 3,
        "name": "pooja Singh",
        "age": 16,
        "gender": "Female",
        "lastSeen": "Food Court Area, Stall 45",
        "timeAgo": "1 hour ago",
        "distance": "800m",
        "description": "Teenager in pink kurta, black bag, height 5'4\"",
        "contactNumber": "+91-9025467880",
        "emergencyContact": "+91-9765432109",
        "status": "active",
        "reportedBy": "Mother - Kavita Singh"
    }
  ],
  "emergencyContacts": [
    {
        "service": "Police Control Room",
        "number": "100"
    },
    {
        "service": "Medical Emergency",
        "number": "108"
    },
    {
        "service": "Fire Brigade",
        "number": "101"
    },
    {  
        "service": "Kumbh Help Desk",
        "number": "1800-180-1111"
    }
  ],
  "foundReports":[
    {
        "id": 101,
        "name": "Ramesh Gupta",
        "foundAt": "Temple Complex",
        "foundBy": "Volunteer - Amit Joshi",
        "reunionTime": "30 minutes"
    }
  ],
  "userLocation": {
    "latitude": 25.4358,
    "longitude": 81.8463,
    "area": "Sector 8, Kumbh mela Ground"
  },
  "notifications": [
    {
        "id": 1,
        "type": "new_alert",
        "message": "New missing person alert in your area",
        "timestamp": "2025-01-15T09:30:00Z"
    },
    {
        "id": 2,
        "type": "person_found",
        "message": "Ramesh Gupta has been found safe",
        "timestamp": "2025-01-15T09:45:00Z"
    }
  ]
};

//-----------------Application Status----------------------//
let currentView = 'dashboard';
let currentFilter = 'all';
let isEmergencyActive = false;
let reportCounter = appData.statistics.totalReports;

//----------------Initialize app---------------------------//
document.addEventListener('DOMContentLoaded' , function() {
    initializeApp();
    setupEventListeners();
    populateStatistics();
    renderAlerts();
    renderEmergencyContacts();
    renderRecentActivity();
    startRealTimeUpdates();
});

function initializeApp(){
    //-----show dashboard bydefault-------//
    showView('dashboard');

    //-----update location display-------//
    const locationspan = document.getElementById('currentLocation');
    if(locationspan){
        locationspan.textContent = appData.userLocation.area;        
    }

     //-----update alerts badge-----------//
    updateAlertsBadge();
}

function setupEventListeners() {
    //-----bottom navigation - update to use event delegation----//
    document.addEventListener('click',function(e) {
        //----Navigation items---//
        if(e.target.closest('.nav-item')) {
            const navItem = e.target.closest('.nav-item');
            const targetView = navItem.dataset.view;
            if (targetView) {
                showView(targetView);
                updateActiveNavItem(navItem);
            }
        }
        //----Quick Action buttons----//
        if(e.target.dataset.action == 'report' || e.target.closest('[data-action="report"]')) {
            showView('report');
            updateActiveNavItem(document.querySelector('[data-view="report"]'));
        } else if(e.target.dataset.action == 'alerts' || e.target.closest('[data-action="alerts"]')){
            showView('alerts');
            updateActiveNavItem(document.querySelector('[data-view="report"]'));
        }

        //----filter tabs---------//
        if(e.target.classList.contains('filter-tab')) {
            currentFilter = e.target.dataset.filter;
            updateActiveFilterTab(e.target);
            renderAlerts();
        }

        //-----modal close buttons-----//
        if(e.target.id === 'closeSuccessModal') {
            hideModal(document.getElementById('successModal'));
        }

        if(e.target.id==='closeEmergencyModal') {
            hideModal(document.getElementById('emergencyModal'));
            isEmergencyActive = false;
        }

        //----modal overlay clicks-----//
        if(e.target.classList.contains('modal-overlay')) {
            const modal =e.target.closest('.modal');
            hideModal(modal);
        }

       //------chat send button----//
        if(e.target.closest('.chat-input .btn')) {
            sendChatMessage();
        }

        //----photo upload----//
        if(e.target.id === 'uploadArea' || e.target.closest('#uploadArea')) {
            document.getElementById('photoInput').click();
        }

        //-----remove photo-----//
        if(e.target.id === 'removephoto' || e.target.closest('#removePhoto')) {
            removePhoto();
        }

        //-------location button-----//
        if(e.target.classList.contains('location-btn')){
            showNotification('Location services activated' , 'info');
        }
    });

   //------form submission-------//
const reportForm = document.getElementById('reportForm');
if(reportForm){
    reportForm.addEventListener('submit',handleReportSubmission);
}
//--------upload photo events-----------//
const photoInput = document.getElementById('photoInput');
const uploadArea = document.getElementById('uploadArea');

    if (photoInput){
        photoInput.addEventListener('change',handlePhotoSelect);
    }
    if(uploadArea){
        uploadArea.addEventListener('dragover',handleDragOver);
        uploadArea.addEventListener('drop',handleDrop);
    }
    //----------panic button with proper event handling---------//
    const panicButton = document.getElementById('panicButton');
        if(panicButton){
            let panicTimer;

            function startPanicTimer() {
            panicTimer = setTimeout(()=>{
                activateEmergency();
            },3000);
            panicButton.style.transform = '';
        }

        function clearPanictimer(){
            clearTimeout(panicTimer);
            panicButton.style.transform = '';
        }

        panicButton.addEventListener('mousedown',startPanicTimer);
        panicButton.addEventListener('mouseup',clearPanictimer);
        panicButton.addEventListener('mouseleave',clearPanictimer);
        panicButton.addEventListener('touchstart',startPanicTimer);
        panicButton.addEventListener('touchend',clearPanictimer);
    }
    //--------chat input enter key---------//
    const chatInput = document.querySelector('.chat-input input');
    if(chatInput){
        chatInput.addEventListener('keypress',function(e){
            if(e.key==='Enter'){
                sendChatMessage();
            }
        });
    } 
}

function showView(viewName) {
    console.log('Switching to view:',viewName);

    //-----------hide all views-------------//
    const view = document.querySelectorAll('.view');
    view.forEach(view =>view.classList.remove('active'));

    //-------show target views--------------//
    const targetView = document.getElementById(viewName + 'View');
    if (targetView){
        targetView.classList.add('active');
        currentView =viewName;
        console.log('View switched to:',viewName);
    }else {
        console.error('View not found:',viewName + 'View');
    }
}

function updateActiveNavItem(activeItem){
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item =>item.classList.remove('active'));
    if (activeItem){
        activeItem.classList.add('active');
    }
}

function updateActiveFilterTab(activeTab){
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => tab.classList.remove('active'));
    if(activeTab){
        activeTab.classList.add('active');
    }
}
function populateStatistics(){
    const totalReportsE1 = document.getElementById('totalReports');
    const activeSearchesE1 = document.getElementById('activeSearches');
    const peopleFoundE1 = document.getElementById('peopleFound');
    
    if(totalReportsE1) totalReportsE1.textContent = appData.statistics.totalReports;
    if(activeSearchesE1) activeSearchesE1.textContent = appData.statistics.activeSearches;
    if(peopleFoundE1) peopleFoundE1.textContent = appData.statistics.peopleFound;
}
function updateAlertsBadge(){
    const alertsBadge = document.getElementById('alertsBadge');
    if(alertsBadge){
        alertsBadge.textContent = appData.activeAlerts.length;
    }
}
function renderAlerts() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        let filteredAlerts = appData.activeAlerts;

        //--------------Apply filter-----------//
        switch (currentFilter) {
            case 'children':
                filteredAlerts = appData.activeAlerts.filter(alert => alert.age < 18);
                break;
            case 'elderly':
                filteredAlerts = appData.activeAlerts.filter(alert => alert.age > 60);
                break;
            case 'recent':
                filteredAlerts = appData.activeAlerts.filter(alert =>
                    alert.timeAgo.includes('minutes') || alert.timeAgo.includes('1 hour')
                );
                break;           
        }

        alertsList.innerHTML ='';

        filteredAlerts.forEach(alert => {
            const alertCard = document.createElement('div');
            alertCard.className = 'alert-card';
            alertCard.innerHTML =  `
                <div class="alert-header">
                    <div class="alert-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="alert-info">
                        <h4>${alert.name}, ${alert.age} years</h4>
                        <div class="alert-meta">
                            ${alert.gender} . ${alert.timeAgo} . ${alert.distance} from you
                        </div>
                    </div>
                </div>
                <div class="alert-location">
                    <i class="fas fa-map-marker-alt"></i>
                    Last seen: ${alert.lastSeen}
                </div>
                <p>${alert.description}</p>
                <div class="alert-actions">
                    <button class="btn btn--primary" onclick="markAsFound(${alert.id})">
                        <i class="fas fa-check"></i>
                        I Found This Person
                    </button>
                    <button class="btn btn--outline" onclick="contactFamily('${alert.contactNumber}')">
                           <i class="fas fa-phone"></i>
                           Contact
                    </button>
                </div>
            `;
            alertsList.appendChild(alertCard);
        });

        if (filteredAlerts.length ===0) {
            alertsList.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
                    <p>No alerts found for this filter.</p>
                </div>
            `;
        }
    }

    function renderEmergencyContacts() {
        const emergencyContactsList = document.getElementById('emergencyContactsList');
        if (!emergencyContactsList) return;
        
        emergencyContactsList.innerHTML = '';

        appData.emergencyContacts.forEach(contact => {
            const contactEl = document.createElement('div');
            contactEl.className = 'emergency-contact';
            contactEl.innerHTML = `
                <div class="contact-info">
                    <h4<${contact.service}</h4>
                    <p>${contact.number}</p>
                </div>
                <button class="call-btn" onclick="makeEmergencyCall('${contact.number}')">
                    <i class="fas fa-phone"></i>
                </button>
            `;
            emergencyContactsList.appendChild(contactEl);
        });
    }

    function renderRecentActivity() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        const activities = [
            "New missing person report filed for Arjun Kumar",
            "Sunita Devi marked as found safe",
            "3 volunteers joined search for priya Singh",
            "Emergency alert issued for Sector 12 area"
        ];

        activityList.innerHTML = '';

        activities.forEach(activity =>{
            const activityEl =document.createElement('div');
            activityEl.className ='activity-item';
            activityEl.textContent = activity;
            activityList.appendChild(activityEl);
        });
    }

    //------------------photo handling functions---------------//
function handleDragOver(e) {
      e.preventDefault();
      const uploadArea = document.getElementById('uploadArea');
      if(uploadArea) {
        uploadArea.style.borderColor ='#1E40AF';
      }
}

function handleDrop(e) {
  e.preventDefault();
  const uploadArea = document.getElementById('uploadArea');
  if(uploadArea) {
    uploadArea.style.borderColor = '';
  }

  const files = e.dataTransfer.files;
  if(files.length > 0 && files[0].type.startsWith('image/')) {
    displayPhoto(files[0]);
  }
}

function handlePhotoSelect(e) {
  const file = e.target.files[0];
  if(file && file.type.startsWith('image/')) {
    displayPhoto(file);
  }
}

function displayPhoto(file) {
  const reader = new FileReader();
  const uploadArea = document.getElementById('uploadArea');
  const photoPreview = document.getElementById('photoPreview');
  const previewImage = document.getElementById('previewImage');

  reader.onload = function(e) {
    if(previewImage) {
      previewImage.src = e.target.result;
    }
    if(uploadArea) {
      uploadArea.style.display ='none' ;
    }
    if(photoPreview) {
      photoPreview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function removePhoto() {
  const photoInput = document.getElementById('photoInput');
  const uploadArea = document.getElementById('uploadArea');
  const photoPreview = document.getElementById('photoPreview');
  const previewImage = document.getElementById('previewImage');

  if(photoInput) photoInput.value = '';
  if(uploadArea) uploadArea.style.display = 'block';
  if(photoPreview) photoPreview.style.display = 'none';
  if(previewImage) previewImage.src = '';
}

//------------------------form handling--------------------------//
function handleReportSubmission(e){
    e.preventDefault();

    if(!validateForm()){
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    showLoading();

    //--------get form values:--------------//
    const fullName = document.getElementById('fullName').value.trim();
    const age = parseInt(document.getElementById('age').value.trim());
    const gender = document.getElementById('gender').value;
    const lastSeen = document.getElementById('lastSeen').value.trim();
    const contactNumber = document.getElementById('contactNumber').value.trim();
    const emergencyContact = document.getElementById('emergencyContact').value.trim();
    const description = document.getElementById('description').value.trim();

    setTimeout(()=> {
        hideLoading();

        //----update statistics----//
        reportCounter++;
        appData.statistics.totalReports = reportCounter;
        appData.statistics.activeSearches++;

        //-----create new alert object---//
        const newAlert = {
        id: Date.now(), //---unique id based pn timestamp--//
        name: fullName,
        age: age,
        gender: gender,
        lastSeen: lastSeen,
        timeAgo: "Just now",
        distance: "N/A",
        description: description,
        contactNumber: contactNumber,
        emergencyContact: emergencyContact || '',
        status: "active",
        reportedBy: "Self-Report"
       };
       
       //---add new alert to activateAlerts Array (at the start):--//
       appData.activeAlerts.unshift(newAlert);

       //----update UI components-----//
       populateStatistics();
       renderAlerts();
       updateAlertsBadge();

       //-----Reset form and photo preview----//
       const reportForm = document.getElementById('reportForm');
       if (reportForm) reportForm.reset();
       removePhoto();

       //-----show success model----//
       const successModal = document.getElementById('successModal');

       //---optimal update recent activity or add custom message--//
       renderRecentActivity();

       showNotification('New missing person report added successfully.', 'success');
}, 2000);

}

//----------------Alert Action-------------------//
function markAsFound(alertId){
    const alert = appData.activeAlerts.find(a => a.id === alertId);
    if (!alert) return;

    showLoading();
    setTimeout(() => {
        hideLoading();

        //---------remove from active alerts---------------//
        appData.activeAlerts = appData.activeAlerts.filter( a => a.id !== alertId);

        //-------------update statistics-----------//
        appData.statistics.activeSearches--;
        appData.statistics.peopleFound++;

        populateStatistics();
        renderAlerts();
        updateAlertsBadge();
        renderRecentActivity();

       //-------show success message-------------//
        showNotification(`${alert.name} has been marked as found!`,'success');
    },1500);
}

function contactFamily(phoneNumber){
    //----------simulate opening phone dialer--------//
    showNotification(`calling ${phoneNumber}...`,'info');
}
function makeEmergencyCall(number){
    showNotification(`CallingEmergencyService: ${number}`,'info');
}
//--------------emergency functions----------------//
function activateEmergency(){
    isEmergencyActive = true;
    const emergencyModal = document.getElementById('emergencyModal');
    if(emergencyModal){
        showModal(emergencyModal);
    }
    //--------------simulate emergency services notification------------//
    showNotification('Emergency SOS activated! Location shared with authorities.','error');
}
//---------chat function----------------//
function sendChatMessage(){
    const chatInput = document.querySelector('.chat-input input');
    const chatMessages = document.getElementById('chatMessage');

    if (chatInput && chatInput.value.trim()){
        const messageE1 = document.createElement('div');
        messageE1.className = 'message sent';
        messageE1.innerHTML = `
        <span class ="sender">You</span>
        <p>${chatInput.value}</p>
        <span class ="time">Just now</span>
        `;
        if (chatMessages){
            chatMessages.appendChild(messageE1);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        chatInput.value = '';
    }
}
//-----------model functions---------//
function showModal(modal){
    if(modal){
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}
function hideModal(modal){
    if(modal){
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}
function showLoading(){
    const loadingSpinner = document.getElementById('loadingSpinner');
    if(loadingSpinner){
        loadingSpinner.classList.remove('hidden');
    }
}
function hideLoading(){
    const loadingSpinner = document.getElementById('loadingSpinner');
    if(loadingSpinner){
        loadingSpinner.classList.add('hidden')
    }
}

//---------------notification system--------------//
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notificationnotification--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-surface);
        color: var(--color-text);
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        z-index:1001;
        border-left: 4px solid var(--color-${type ==='success' ? 'success-green' : type === 'error' ? 'emergency-red' : 'primary-blue'});
        max-width: calc(100% - 2rem);
        font-size: var(--font-size-sm);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);

   //------auto removes after 3 sec------------//
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

//----------real-time updates simulation-----------//
function startRealTimeUpdates(){
    //---------simulate real-time statistics updates-------//
    setInterval(() =>{
        if(Math.random()>0.8) {
            const randomStat = Math.floor(Math.random()*3);
            switch(randomStat){
                case 0:
                    appData.statistics.totalReports++;
                    break;
                case 1:
                    if (appData.statistics.activesearches > 0 && Math.random() > 0.5){
                        appData.statistics.activeSearches--;
                        appData.statistics.peopleFound++;
                    }
                    break;
                case 2:
                    appData.statistics.activeSearches = Math.max(0,appData.statistics.activeSearches + (Math.random() > 0.5 ? 1: -1));
                    break;
            }
            populateStatistics();
        }
    },10000);

    //----------simulates new alerts(less frequent)-----------//
    setInterval(() => {
        if(Math.random() > 0.9 && appData.activeAlerts.length < 5){
            const newAlert = {
                id: Date.now(),
                name: "New Alert Person",
                age: Math.floor(Math.random()* 60) + 10,
                gender: Math.random() > 0.5 ? "Male" : "Female",
                lastSeen: "Random Location",
                timeAgo: "Just now",
                distance: Math.floor(Math.random()*2000) + 100 +"m",
                description: "Recently reported missing person",
                contactNumber: "+91-9999999999",
                emergencyContact: "+91-9999999998",
                status: "active",
                reportedBy:"Family Member"
            };
            appData.activeAlerts.unshift(newAlert);
            updateAlertsBadge();

            if (currentView === 'alerts'){
                renderAlerts();
            }
            showNotification("New missing person alert in your area!","info");
        }
    },30000);
}

//----------------form validation------------// 
function validateForm() {
    const requiredFields = ['fullName','age', 'gender', 'lastSeen', 'contactNumber'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()){
            field.style.borderColor = 'var(--color-emergency-red)';
            isValid = false;
        } else if (field) {
            field.style.borderColor ='';
        }
    });  
      return isValid;
}

//-------------accessibility improvements--------------//
document.addEventListener('keydown', function(e) {
    //-----ESC key closes modals---------//
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            hideModal(modal);
        });
    }
});

//----------export functions for testing--------//
window.KumbhKavach = {
    showView,
    markAsFound,
    contactFamily,
    activateEmergency,
    showNotification
};

/*------------------------javascript code to update the human icon with the photo after uploading the report data on alert-----------------*/

//-----global variable to upload the photo------//
let uploadedPhotoDataURL = null;

//-----display uploaded photo preview and stored data URL globally---//
function displayPhoto(file) {
  const reader = new FileReader();
  const uploadArea = document.getElementById('uploadArea');
  const photoPreview = document.getElementById('photoPreview');
  const previewImage = document.getElementById('previewImage');

  reader.onload = function(e) {
    if (previewImage) {
      previewImage.src = e.target.result;
      uploadedPhotoDataURL = e.target.result; // store photo data URL
    }
    if (uploadArea) {
      uploadArea.style.display = 'none';
    }
    if (photoPreview) {
      photoPreview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

//-----remove photo preview and reset stored data URL-----//
function removePhoto(){
  const photoInput = document.getElementById('photoInput');
  const uploadArea = document.getElementById('uploadArea');
  const photoPreview = document.getElementById('photoPreview');
  const previewImage = document.getElementById('previewImage');

  if (photoInput) photoInput.value = '';
  if (uploadArea) uploadArea.style.display = 'block';
  if (photoPreview) photoPreview.style.display = 'none';
  if (previewImage) previewImage.src = '';
  uploadedPhotoDataURL(null);
}

//------handler for form submission: include photo data  URL into alert object---//
function handleReportSubmission(e) {
  e.preventDefault();

  if (!validateForm()) {
    showNotification('Please fill in all required fields', 'error');
    return;
  }

  showLoading();

  const fullName = document.getElementById('fullName').value.trim();
  const age = parseInt(document.getElementById('age').value.trim());
  const gender = document.getElementById('gender').value;
  const lastSeen = document.getElementById('lastSeen').value.trim();
  const contactNumber = document.getElementById('contactNumber').value.trim();
  const emergencyContact = document.getElementById('emergencyContact').value.trim();
  const description = document.getElementById('description').value.trim();

  setTimeout(() => {
    hideLoading();

    reportCounter++;
    appData.statistics.totalReports = reportCounter;
    appData.statistics.activeSearches++;

    const newAlert = {
      id: Date.now(),
      name: fullName,
      age: age,
      gender: gender,
      lastSeen: lastSeen,
      timeAgo: "Just now",
      distance: "N/A",
      description: description,
      contactNumber: contactNumber,
      emergencyContact: emergencyContact || '',
      status: "active",
      reportedBy: "Self-Report",
      photo: uploadedPhotoDataURL
    };

    appData.activeAlerts.unshift(newAlert);

    populateStatistics();
    renderAlerts();
    updateAlertsBadge();

    const reportForm = document.getElementById('reportForm');
    if (reportForm) reportForm.reset();
    removePhoto();

    renderRecentActivity();
    showNotification('New missing person report added successfully.', 'success');
  }, 2000);
}

//-----render alert and show photo if available per alert else fallback to icon---//
function renderAlerts() {
  const alertsList = document.getElementById('alertsList');
  if (!alertsList) return;

  let filteredAlerts = appData.activeAlerts;

  // apply your current filter if necessary//
    alertsList.innerHTML = '';

  filteredAlerts.forEach(alert => {
    const alertCard = document.createElement('div');
    alertCard.className = 'alert-card';

    const avatarHTML = alert.photo
      ? `<img src="${alert.photo}" alt="${alert.name}" class="alert-avatar-img" />`
      : `<i class="fas fa-user"></i>`;

    alertCard.innerHTML = `
      <div class="alert-header">
        <div class="alert-avatar">
          ${avatarHTML}
        </div>
        <div class="alert-info">
          <h4>${alert.name}, ${alert.age} years</h4>
          <div class="alert-meta">
            ${alert.gender} &middot; ${alert.timeAgo} &middot; ${alert.distance} from you
          </div>
        </div>
      </div>
      <div class="alert-location">
        <i class="fas fa-map-marker-alt"></i>
        Last seen: ${alert.lastSeen}
      </div>
      <p>${alert.description}</p>
      <div class="alert-actions">
        <button class="btn btn--primary" onclick="markAsFound(${alert.id})">
          <i class="fas fa-check"></i> I Found This Person
        </button>
        <button class="btn btn--outline" onclick="contactFamily('${alert.contactNumber}')">
          <i class="fas fa-phone"></i> Contact
        </button>
      </div>
    `;
    alertsList.appendChild(alertCard);
  });

  if (filteredAlerts.length === 0) {
    alertsList.innerHTML = `
      <div class="card" style="text-align:center; padding: 2rem;">
        <i class="fas fa-search" style="font-size: 3rem; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
        <p>No alerts found for this filter.</p>
      </div>
    `;
  }
}
