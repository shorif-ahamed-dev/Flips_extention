// // 🔹 MAIN LOGIC — auto-run after popup loads
// window.addEventListener("DOMContentLoaded", function () {
//   chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//     // Step 1️⃣: get the email from the active page
//     chrome.scripting.executeScript(
//       {
//         target: { tabId: tabs[0].id },
//         func: () => {
//           const emailInput = document.getElementById("email");
//           return emailInput ? emailInput.value.trim().toLowerCase() : "";
//         },
//       },
//       (results) => {
//         if (!results || !results[0] || !results[0].result) return;
//         const email = results[0].result;
//         if (!email) return;

//         // Step 2️⃣: fetch user data from backend
//         const API_URL = `http://localhost:3000/data/status/email-fifa?email=${encodeURIComponent(
//           email
//         )}`;

//         fetch(API_URL)
//           .then((res) => {
//             if (!res.ok) throw new Error("Failed to fetch user data");
//             return res.json(); // assuming backend returns JSON
//           })
//           .then((data) => {
//             // Step 3️⃣: fill the form in the page
//             chrome.scripting.executeScript({
//               target: { tabId: tabs[0].id },
//               func: fillForm,
//               args: [data],
//             });

//             window.close(); // close popup after autofill
//           })
//           .catch((err) => console.error("❌ Error fetching data:", err));
//       }
//     );
//   });
// });

// // 🔹 Fill form logic
// function fillForm(data) {
//   let filled = false;

//   // === SIGNUP / LOGIN FORM ===
//   if (document.getElementById("password")) {
//     if (data.email) document.getElementById("email").value = data.email;
//     if (data.password)
//       document.getElementById("password").value = data.password;
//     if (data["confirm-password"])
//       document.getElementById("confirm-password").value =
//         data["confirm-password"];
//     filled = true;
//   }

//   // === PROFILE FORM ===
//   if (document.getElementById("firstname")) {
//     const fields = [
//       "firstname",
//       "lastname",
//       "email",
//       "country",
//       "state",
//       "gender",
//       "day",
//       "month",
//       "year",
//       "preferredLanguage",
//     ];
//     fields.forEach((field) => {
//       if (data[field] && document.getElementById(field)) {
//         document.getElementById(field).value = data[field];
//         filled = true;
//       }
//     });

//     if (data.newsletter && document.getElementById("newsletter"))
//       document.getElementById("newsletter").checked = [
//         "true",
//         "1",
//         "yes",
//       ].includes(data.newsletter.toLowerCase());

//     if (data.partnerconsent && document.getElementById("partnerconsent"))
//       document.getElementById("partnerconsent").checked = [
//         "true",
//         "1",
//         "yes",
//       ].includes(data.partnerconsent.toLowerCase());

//     // Always check T&C
//     const tandc = document.getElementById("TandC");
//     if (tandc) tandc.checked = true;
//   }

//   // === Auto-submit if any field was filled ===
//   if (filled) {
//     setTimeout(() => {
//       const submitBtn = document.querySelector(
//         'button[type="submit"], input[type="submit"], .submit-button'
//       );
//       if (submitBtn) submitBtn.click();
//     }, 500);
//   }

//   return filled;
// }
