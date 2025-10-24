// 🔹 When user clicks the extension icon
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // ==============================
  // Step 1: Check if login form exists
  // ==============================
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => !!document.getElementById("password"),
      // && !document.getElementById("confirm-password"),
    },
    (results) => {
      const isLogin = results?.[0]?.result;

      if (isLogin) {
        // 🔹 Login form detected → call login API
        fetchLoginData()
          .then((data) => {
            fillFormOnPage(tab.id, data, "login");
            updateEmailStatus(data.email, "used");
          })
          .catch((err) => console.error("❌ Error fetching login data:", err));
        return; // Stop here, don’t do signup/profile
      }

      // ==============================
      // Step 2: Get email from the page for signup/profile
      // ==============================
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            const emailInput = document.getElementById("email");
            return emailInput ? emailInput.value.trim().toLowerCase() : "";
          },
        },
        (results) => {
          const email = results?.[0]?.result;
          if (!email) return;

          // Determine if signup or profile
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: () => {
                if (document.getElementById("confirm-password"))
                  return "signup";
                if (
                  document.getElementById("firstname") ||
                  document.getElementById("lastname")
                )
                  return "profile";
                return "unknown";
              },
            },
            (detectResults) => {
              const formType = detectResults?.[0]?.result;
              if (!formType || formType === "unknown") return;

              fetchSignupOrProfileData(email).then((data) => {
                fillFormOnPage(tab.id, data, formType);
                updateEmailStatus(email, "Done");
              });
            }
          );
        }
      );
    }
  );
});

async function updateEmailStatus(email, status) {
  try {
    const API_URL = "http://localhost:3000/api/update-status";
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, status }),
    });

    if (!res.ok) throw new Error("Failed to update email status");

    console.log(`✅ Status updated for ${email}`);
  } catch (err) {
    console.error("❌ Error updating email status:", err);
  }
}

// =======================================================
// 🔹 Login API (no email)
async function fetchLoginData() {
  const API_URL = "http://localhost:3000/api/search/status?value=N/A";
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch login data");
  return res.json();
}

// =======================================================
// 🔹 Signup/Profile API (needs email)
async function fetchSignupOrProfileData(email) {
  const API_URL = `http://localhost:3000/api/search/email?value=${encodeURIComponent(
    email
  )}`;
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch signup/profile data");
  return res.json();
}

// =======================================================
// 🔹 Fill the form inside the page
function fillFormOnPage(tabId, data, formType) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: fillForm,
    args: [data, formType],
  });
}

// =======================================================
// 🔹 Fill form logic
function fillForm(data, formType) {
  let filled = false;

  if (formType === "login") {
    const emailInput = document.getElementById("email");
    const passInput = document.getElementById("password");
    const confirmPassInput = document.getElementById("confirm-password");
    if (emailInput && data.email) emailInput.value = data.email;
    if (passInput && data.password) passInput.value = data.password;
    if (confirmPassInput) confirmPassInput.value = data.password;

    filled = true;
  }

  if (formType === "signup") {
    if (data.email) document.getElementById("email").value = data.email;
    if (data.password)
      document.getElementById("password").value = data.password;
    if (data["confirm-password"])
      document.getElementById("confirm-password").value = data.password;
    filled = true;
  }

  if (formType === "profile") {
    if (data.firstname)
      document.getElementById("firstname").value = data.firstname;
    if (data.lastname)
      document.getElementById("lastname").value = data.lastname;
    if (data.email) document.getElementById("email").value = data.email;
    if (data.country) document.getElementById("country").value = data.country;
    if (data.state) document.getElementById("state").value = data.state;
    if (data.gender) document.getElementById("gender").value = data.gender;
    if (data.day) document.getElementById("day").value = data.day;
    if (data.month) document.getElementById("month").value = data.month;
    if (data.year) document.getElementById("year").value = data.year;
    if (data.preferredLanguage)
      document.getElementById("preferredLanguage").value =
        data.preferredLanguage;

    if (data.newsletter)
      document.getElementById("newsletter").checked = [
        "true",
        "1",
        "yes",
      ].includes(data.newsletter.toLowerCase());
    if (data.partnerconsent)
      document.getElementById("partnerconsent").checked = [
        "true",
        "1",
        "yes",
      ].includes(data.partnerconsent.toLowerCase());

    const tandc = document.getElementById("TandC");
    if (tandc) tandc.checked = true;
    filled = true;
  }

  if (filled) {
    setTimeout(() => {
      const submitBtn = document.querySelector(
        'button[type="submit"], input[type="submit"], .submit-button'
      );
      if (submitBtn) submitBtn.click();
    }, 500);
  }

  return filled;
}
