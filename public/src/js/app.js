
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications')

if(!window.Promise) {
  window.Promise = Promise;
}

if('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(function() {
      console.log('Service worker registered!');
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

// Notification
function displayConfirmNotification() {
  if('serviceWorker' in navigator) {
    var options = {
    body: 'You successfully subscribed to our notification',
    icon: '/src/images/icons/app-icon-96x96.png',
    image: '/src/images/sf-boat.jpg',
    dir: 'ltr',
    lang: 'en-US',  // BCP 47
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app-icon-96x96.png',
    tag: 'confirm-notification',
    renotify: true,
    actions: [
      { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'  },
      { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'  }
    ] 
  };
  
  navigator.serviceWorker.ready
    .then(function(swreg) {
      swreg.showNotification('Successfully subscribed (from SW)!', options);
    });  
  }
}

// configure push subscription
function configurePushSub() {
  if(!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if(sub === null) {
        //Create a new subscription
        var vapidPublicKey = 'BF0gS881EMSy1geCf_Y01RlGya1ZTo7slGPO1l9Jjz9tkPi62Wq7Vw6P4bNkhGfHthH6TCbmMT3DgQoV49HTXCY';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // we have a subscription
      }
    })
    .then(function(newSub) {
      return fetch('https://pwagram-bc8e1.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    }) ; 
}

// Notification
function askForNotificationPermission() {
  Notification.requestPermission(function(result) {
    console.log('User Choice', result);
    if(result !== 'granted') {
      console.log('No notification permission granted!');
    } else {
      configurePushSub();
    }
  })
}
// Notification
if('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}

//Fetch and promise
// var promise = new Promise(function(resolve, reject){
//   setTimeout(function () {
//     //resolve('This is executed once the timer is done!');
//     reject({code: 500, message: 'An error occured!'});
//   //console.log('This is executed once the timer is done!')
// }, 3000);
// });

// fetch('http://httpbin.org/ip')
//   .then(function(response) {
//     console.log(response);
//     return response.json();
//   })
//   .then(function(data) {
//     console.log(data);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })

// fetch('http://httpbin.org/post', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   },
//   mode: 'cors', 
//   body: JSON.stringify({message: 'Does this work'})
// })
//   .then(function(response){
//     console.log(response);
//     return response.json();
//   })
//   .then(function(data) {
//     console.log(data);
//   })
//   .catch(function(err) {
//     console.log(err);
//   })
// // promise.then(function(text) {
// //   return text;
// // }, function(err) {
// //   console.log(err.code, err.message)
// // }).then(function(newText) {
// //   console.log(newText);
// // });

// promise.then(function(text) {
//   return text;
// }).then(function(newText) {
//   console.log(newText);
// }).catch(function(err){
//   console.log(err.code, err.message);
// })

// console.log('this is executed right after settimeout()');