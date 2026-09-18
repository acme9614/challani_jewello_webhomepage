(function () {
  var brands = {
    cjm: { id: 'cjm', name: 'CHALLANI JEWELLERY MART', path: '/cjm/home' },
    fedha: { id: 'fedha', name: 'Fedha by CHALLANI', path: '/fedha/home' },
    lille: { id: 'lille', name: 'Lille By CHALLANI', path: '/lille/home' }
  };

  var storageKey = 'challani_selected_company';
  var diamonds = document.querySelectorAll('.company-brand-cluster__diamond');
  var toast = document.getElementById('pickedToast');
  var aboutBtn = document.getElementById('aboutBtn');
  var aboutDialog = document.getElementById('aboutDialog');
  var aboutClose = document.getElementById('aboutClose');
  var settingsRoot = document.getElementById('settingsRoot');
  var settingsBtn = document.getElementById('settingsBtn');
  var settingsPanel = document.getElementById('settingsPanel');
  var hideTimer;
  var pulseTimer;
  var selectTimer;

  function showToast(message) {
    if (!toast) return;
    toast.hidden = false;
    toast.textContent = message;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      toast.hidden = true;
    }, 2200);
  }

  function setActive(brandId, pulse) {
    diamonds.forEach(function (btn) {
      var isActive = btn.getAttribute('data-brand') === brandId;
      btn.classList.toggle('is-active', isActive);
      btn.classList.toggle('is-pulse', Boolean(pulse) && isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function selectCompany(brandId) {
    var brand = brands[brandId];
    if (!brand) return;

    setActive(brandId, true);
    try {
      localStorage.setItem(storageKey, JSON.stringify(brand));
    } catch (err) {}

    clearTimeout(pulseTimer);
    pulseTimer = setTimeout(function () {
      diamonds.forEach(function (btn) {
        btn.classList.remove('is-pulse');
      });
    }, 900);

    clearTimeout(selectTimer);
    selectTimer = setTimeout(function () {
      showToast('Selected: ' + brand.name);
    }, 380);
  }

  diamonds.forEach(function (btn) {
    btn.addEventListener('pointerdown', function () {
      btn.classList.add('is-pressing');
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (type) {
      btn.addEventListener(type, function () {
        btn.classList.remove('is-pressing');
      });
    });
    btn.addEventListener('click', function () {
      selectCompany(btn.getAttribute('data-brand'));
    });
  });

  if (aboutBtn && aboutDialog) {
    aboutBtn.addEventListener('click', function () {
      if (typeof aboutDialog.showModal === 'function') {
        aboutDialog.showModal();
      } else {
        aboutDialog.setAttribute('open', '');
      }
    });
  }

  if (aboutClose && aboutDialog) {
    aboutClose.addEventListener('click', function () {
      if (typeof aboutDialog.close === 'function') {
        aboutDialog.close();
      } else {
        aboutDialog.removeAttribute('open');
      }
    });
  }

  // Commented because the Settings icon now opens the Flutter Settings page.
  // if (settingsBtn && settingsPanel) {
  //   settingsBtn.addEventListener('click', function () {
  //     var open = settingsPanel.hidden;
  //     settingsPanel.hidden = !open;
  //     settingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  //   });
  // }

  document.addEventListener('mousedown', function (event) {
    if (!settingsRoot || !settingsPanel || settingsPanel.hidden) return;
    if (!settingsRoot.contains(event.target)) {
      settingsPanel.hidden = true;
      settingsBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelectorAll('[data-settings-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = btn.getAttribute('data-settings-action');
      settingsPanel.hidden = true;
      settingsBtn.setAttribute('aria-expanded', 'false');
      showToast(action === 'logout' ? 'Logout (HTML preview only)' : 'Change MPIN (HTML preview only)');
    });
  });

  try {
    var saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && saved.id && brands[saved.id]) {
      setActive(saved.id, false);
    }
  } catch (err) {}
})();



// js logic for flutter navigation
// Wait until the complete company-selection HTML is available.
document.addEventListener("DOMContentLoaded", function () {
  // Finds all brand buttons that contain a merchant code.
  const merchantButtons = document.querySelectorAll(
    ".company-brand-cluster__diamond[data-merchant-code]"
  );

  // Sends the selected brand's merchant code to Flutter.
  function selectMerchant(button) {
    // Reads the merchant code from the selected brand button.
    const merchantCode = button.dataset.merchantCode;

    // Stops when the selected button has no merchant code.
    if (!merchantCode) {
      console.error("Merchant code is missing.");
      return;
    }

    // Removes unwanted spaces from the merchant code.
    const normalizedMerchantCode = merchantCode.toString().trim();

    // Prints the selected code in the WebView browser console.
    console.log(
      "Selected merchant code:",
      normalizedMerchantCode
    );

    // Checks whether Flutter registered the Toaster JavaScript channel.
    if (
      window.Toaster &&
      typeof window.Toaster.postMessage === "function"
    ) {
      // Sends the merchant code to the Flutter WebView.
      window.Toaster.postMessage(normalizedMerchantCode);
      return;
    }

    // Reports when the HTML page is not running inside the Flutter WebView.
    console.error(normalizedMerchantCode);
    console.error("Toaster Flutter channel is unavailable.");
  }

  // Adds merchant selection to every brand button.
  merchantButtons.forEach(function (button) {
    // Sends the merchant code when the user clicks or taps a brand.
    button.addEventListener("click", function () {
      selectMerchant(button);
    });
  });
});


// setting page navigation logic-

// Finds the Settings icon displayed on the HTML homepage.
const settingsButton = document.getElementById("settingsBtn");

// Adds Flutter Settings navigation to the HTML Settings icon.
if (settingsButton) {
  settingsButton.addEventListener("click", function (event) {
    // Prevents the button's default browser action.
    event.preventDefault();

    // Checks whether the Flutter Toaster channel is available.
    if (
      window.Toaster &&
      typeof window.Toaster.postMessage === "function"
    ) {
      // Requests Flutter to open the existing Settings page.
      window.Toaster.postMessage("navigateToSetting");
      return;
    }

    // Reports when the webpage is not opened inside the Flutter WebView.
    console.error("Toaster Flutter channel is unavailable.");
  });
}




// Added By Ajit Mane RF IF #248239: Stores the maximum waiting time for the Flutter rate response.
var metalRatesResponseTimeout;

// Added By Ajit Mane RF IF #248239: Gets all HTML elements required for the rates section.
function getMetalRateElements() {
  return {
    loader: document.getElementById("metalRatesLoader"),
    card: document.getElementById("metalRatesCard"),

    gold: {
      section: document.getElementById("goldRateSection"),
      value: document.getElementById("goldRateValue"),
      unit: document.getElementById("goldRateUnit")
    },

    silver: {
      section: document.getElementById("silverRateSection"),
      value: document.getElementById("silverRateValue"),
      unit: document.getElementById("silverRateUnit")
    }
  };
}

// Added By Ajit Mane RF IF #248239: Checks whether all required rate elements are available.
function areMetalRateElementsAvailable(elements) {
  return Boolean(
    elements.loader &&
    elements.card &&
    elements.gold.section &&
    elements.gold.value &&
    elements.gold.unit &&
    elements.silver.section &&
    elements.silver.value &&
    elements.silver.unit
  );
}

// Added By Ajit Mane RF IF #248239: Formats a valid rate using Indian currency format.
function formatMetalRate(value) {
  var numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(numericValue);
}

// Added By Ajit Mane RF IF #248239: Validates whether the rate record contains a usable sale rate.
function hasValidSaleRate(rate) {
  return Boolean(
    rate &&
    rate.saleRate !== null &&
    rate.saleRate !== undefined &&
    Number.isFinite(Number(rate.saleRate))
  );
}

// Added By Ajit Mane RF IF #248239: Displays one valid Gold or Silver rate record.
function displayMetalRate(rate, elements) {
  if (!hasValidSaleRate(rate)) {
    elements.section.hidden = true;
    return false;
  }

  elements.value.textContent = formatMetalRate(rate.saleRate);
  elements.unit.textContent = rate.purityDesc
    ? rate.purityDesc + "/g"
    : "";
  elements.section.hidden = false;

  return true;
}

// Added By Ajit Mane RF IF #248239: Starts waiting for the Flutter rate response after the HTML page is ready.
document.addEventListener("DOMContentLoaded", function () {
  metalRatesResponseTimeout = setTimeout(function () {
    var elements = getMetalRateElements();

    if (elements.loader) {
      elements.loader.hidden = true;
    }

    if (elements.card) {
      elements.card.hidden = true;
    }

    console.warn("Rate response was not received from Flutter.");
  }, 10000);
});

// Added By Ajit Mane RF IF #248239: Listens for the filtered rate response sent by Flutter.
window.addEventListener("rateDetailsUpdated", function (event) {
  clearTimeout(metalRatesResponseTimeout);

  var elements = getMetalRateElements();

  // Added By Ajit Mane RF IF #248239: Stops processing when required HTML elements are unavailable.
  if (!areMetalRateElementsAvailable(elements)) {
    console.error("Rate display HTML elements are unavailable.");
    return;
  }

  // Added By Ajit Mane RF IF #248239: Hides the indicator and rates before processing the response.
  elements.loader.hidden = true;
  elements.card.hidden = true;
  elements.gold.section.hidden = true;
  elements.silver.section.hidden = true;

  console.log("Rate response received from Flutter:", event.detail);

  // Added By Ajit Mane RF IF #248239: Keeps the rates section hidden for an empty or error response.
  if (
    !event.detail ||
    event.detail.hasError === true ||
    !Array.isArray(event.detail.data)
  ) {
    console.error(
      "Flutter rate error:",
      event.detail && event.detail.error
        ? event.detail.error
        : "Valid rate data was not received."
    );
    return;
  }

  // Added By Ajit Mane RF IF #248239: Finds Gold and Silver records from the filtered Flutter response.
  var goldRate = event.detail.data.find(function (rate) {
    return Number(rate.metalType) === 4;
  });

  var silverRate = event.detail.data.find(function (rate) {
    return Number(rate.metalType) === 2;
  });

  // Added By Ajit Mane RF IF #248239: Displays each rate only when its record contains a valid sale rate.
  var hasGoldRate = displayMetalRate(goldRate, elements.gold);
  var hasSilverRate = displayMetalRate(silverRate, elements.silver);

  // Added By Ajit Mane RF IF #248239: Displays the card when Gold or Silver has a valid rate.
  elements.card.hidden = !(hasGoldRate || hasSilverRate);

  if (hasGoldRate || hasSilverRate) {
    console.table(event.detail.data);
  } else {
    console.warn("No valid Gold or Silver rates received from Flutter.");
  }
});