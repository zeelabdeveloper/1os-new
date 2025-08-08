 
import { useEffect, useState } from "react";
import MessageScroller from "../components/dashboard/MessageScroller";
import TrackUserHistory from "../components/dashboard/TrackUserHistory";
import InterviewSessionNotifications from "../components/InterviewSessionChecker";
import TeamsReport from "../components/TeamsReport/TeamsReport";
import useAuthStore from "../stores/authStore";
 
import { useSearchParams } from "react-router-dom";

function Dashboard() {
const [searchParssams] = useSearchParams();
 
 const { user } = useAuthStore();
 
const userId = searchParssams.get('user') ;

if(userId){
  user._id=userId
}



  // const [showNotificationModal, setShowNotificationModal] = useState(false);
  // const [isNotificationAllowed, setIsNotificationAllowed] = useState(
  //   Notification?.permission === "granted"
  // );

  // function urlBase64ToUint8Array(base64String) {
  //   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  //   const base64 = (base64String + padding)
  //     .replace(/-/g, "+")
  //     .replace(/_/g, "/");

  //   const raw = atob(base64);
  //   const output = new Uint8Array(raw.length);

  //   for (let i = 0; i < raw.length; ++i) {
  //     output[i] = raw.charCodeAt(i);
  //   }
  //   return output;
  // }

  // const checkNotificationPermission = async () => {
  //   if (!("Notification" in window)) {
  //     console.log("This browser does not support notifications.");
  //     return;
  //   }
 
  //   const permission = await Notification.requestPermission();
  //   setIsNotificationAllowed(permission === "granted");

  //   if (permission !== "granted") {
  //     setShowNotificationModal(true);
  //   }
  // };









//  const subscribe = async () => {
//       if ("serviceWorker" in navigator && "PushManager" in window) {
//         try {
//           const permission = await Notification.permission;
//           if (permission === "denied") {
//             setShowNotificationModal(true);
//             return;
//           }

//           const registration = await navigator.serviceWorker.register("/service-worker.js");
//           const subscription = await registration.pushManager.subscribe({
//             userVisibleOnly: true,
//             applicationServerKey: urlBase64ToUint8Array(
//               import.meta.env.VITE_publicKeyForRealWebNotify
//             ),
//           });

//           await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/subscribe`, {
//             method: "POST",
//             body: JSON.stringify({ subscription, userId: user._id }),
//             headers: { "Content-Type": "application/json" },
//           });
//         } catch (err) {
//           console.error("Subscription failed:", err);
//           notification.error({
//             message: "Failed to subscribe to notifications!",
//           });
//         }
//       } else {
//         notification.error({
//           message: "Browser doesn't support notifications!",
//         });
//       }
//     };


  // useEffect(() => {
   

  //   if (user?._id) {
  //     checkNotificationPermission();
  //     subscribe();
  //   }
  // }, [user?._id]);

  // const handleEnableNotifications = async () => {
  //   const permission = await Notification.requestPermission();
  //   if (permission === "granted") {
  //     setIsNotificationAllowed(true);
  //     setShowNotificationModal(false);
  //     // Resubscribe after enabling
  //     if (user?._id) {
        
  //       subscribe();
  //     }
  //   }
  // };

  return (
    <div className="h-[92vh] overflow-y-auto relative">
      {/* Notification Permission Modal */}
      {/* {showNotificationModal && (
        <div className="absolute      inset-0 bg-black/75 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Important Notifications</h2>
            <p className="mb-4">
              You're missing out on important updates regarding Zeelab! Please enable
              notifications to stay informed about new messages, interview
              sessions, and team updates.
            </p>
            <div className="flex  flex-col sm:flex-row gap-3 justify-center ">
              <button
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={handleEnableNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Enable Notifications
              </button>
            </div>
            <div className="flex py-4 flex-col border-t-1 mt-3 sm:flex-row gap-3 justify-center ">
              <Button
                onClick={() => (window.location.href = "tel:+919896062723")}
                className="inline-flex mx-auto items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <FaPhone />
                Get Help
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>To enable manually:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Click the lock icon in your browser's address bar</li>
                <li>Find "Notifications" in the permissions list</li>
                <li>Select "Allow" from the dropdown</li>
                <li>Refresh this page</li>
              </ol>
            </div>
          </div>
        </div>
      )} */}

      <MessageScroller />
      <TrackUserHistory user={user} />
      <InterviewSessionNotifications user={user}   />
      <TeamsReport user={user} />
    </div>
  );
}

export default Dashboard;
