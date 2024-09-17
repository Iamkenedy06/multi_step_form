'use strict';

// Grabbing all necessary elements from the DOM
const steps = document.querySelectorAll(".stp"); // All form steps
const circleSteps = document.querySelectorAll(".step"); // Sidebar step indicators
const formInputs = document.querySelectorAll(".step-1 form input"); // Input fields in Step 1
const plans = document.querySelectorAll(".plan-card"); // Plan options (Arcade, Advanced, Pro)
const switcher = document.querySelector(".switch"); // Billing switch (monthly/yearly)
const addons = document.querySelectorAll(".box"); // Add-on options
const total = document.querySelector(".total b"); // Total price display
const planPrice = document.querySelector(".plan-price"); // Price of selected plan
let time; // To track if billing is yearly or monthly
let currentStep = 1; // Current step number
let currentCircle = 0; // Current step circle
const obj = { plan: null, kind: null, price: null }; // Holds selected plan details

// Updates the active state of step circles in the sidebar
function updateCircleSteps() {
  circleSteps.forEach(step => step.classList.remove("active")); // Clear active class from all steps
  circleSteps[currentCircle].classList.add("active"); // Highlight the current step
}

// Handles form navigation for each step
steps.forEach((step) => {
  const nextBtn = step.querySelector(".next-stp");
  const prevBtn = step.querySelector(".prev-stp");

  // Handle "Go Back" button
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      document.querySelector(`.step-${currentStep}`).style.display = "none"; // Hide current step
      currentStep--; // Decrement step counter
      currentCircle--; // Decrement step circle
      document.querySelector(`.step-${currentStep}`).style.display = "flex"; // Show previous step
      updateCircleSteps(); // Update sidebar step indicators
    });
  }

  // Handle "Next Step" button
  nextBtn.addEventListener("click", () => {
    document.querySelector(`.step-${currentStep}`).style.display = "none"; // Hide current step
    if (currentStep < 5 && validateForm()) { // Ensure the form is valid
      currentStep++;
      currentCircle++;
      setTotal(); // Calculate and update the total price
    }
    document.querySelector(`.step-${currentStep}`).style.display = "flex"; // Show the next step
    updateCircleSteps(); // Update sidebar step indicators
    summary(obj); // Update the summary with selected details
  });
});

// Updates the summary section with the selected plan and billing details
function summary(obj) {
  const planName = document.querySelector(".plan-name");
  const planPrice = document.querySelector(".plan-price");
  planPrice.innerHTML = `${obj.price.innerText}`; // Set plan price in the summary
  planName.innerHTML = `${obj.plan.innerText} (${obj.kind ? "yearly" : "monthly"})`; // Show plan name and billing type
}

// Validates the inputs in Step 1 (Personal Info)
function validateForm() {
  let valid = true;
  formInputs.forEach(input => {
    if (!input.value) { // If input is empty
      valid = false;
      input.classList.add("err"); // Highlight input with error
      findLabel(input).nextElementSibling.style.display = "flex"; // Show error message
    } else {
      input.classList.remove("err"); // Clear error style
      findLabel(input).nextElementSibling.style.display = "none"; // Hide error message
    }
  });
  return valid; // Returns whether the form is valid or not
}

// Finds the label associated with a specific input field
function findLabel(el) {
  const idVal = el.id;
  const labels = document.getElementsByTagName("label");
  for (let i = 0; i < labels.length; i++) {
    if (labels[i].htmlFor === idVal) return labels[i]; // Match input ID with label's "for" attribute
  }
}

// Handles plan selection (Arcade, Advanced, Pro)
plans.forEach((plan) => {
  plan.addEventListener("click", () => {
    document.querySelector(".selected").classList.remove("selected"); // Remove 'selected' class from previous plan
    plan.classList.add("selected"); // Add 'selected' class to clicked plan
    obj.plan = plan.querySelector("b"); // Store selected plan name
    obj.price = plan.querySelector(".plan-priced"); // Store selected plan price
  });
});

// Toggles between monthly and yearly billing
switcher.addEventListener("click", () => {
  const val = switcher.querySelector("input").checked; // Check if yearly is selected
  document.querySelector(".monthly").classList.toggle("sw-active", !val); // Toggle monthly active state
  document.querySelector(".yearly").classList.toggle("sw-active", val); // Toggle yearly active state
  switchPrice(val); // Update plan prices based on billing type
  obj.kind = val; // Store the billing type (yearly or monthly)
});

// Handles add-on selection
addons.forEach((addon) => {
  addon.addEventListener("click", (e) => {
    const addonSelect = addon.querySelector("input");
    const ID = addon.getAttribute("data-id");
    if (addonSelect.checked) { // If the add-on was already selected
      addonSelect.checked = false; // Uncheck the add-on
      addon.classList.remove("ad-selected"); // Remove selected styling
      showAddon(ID, false); // Remove add-on from summary
    } else {
      addonSelect.checked = true; // Check the add-on
      addon.classList.add("ad-selected"); // Add selected styling
      showAddon(addon, true); // Add add-on to summary
      e.preventDefault(); // Prevent default action
    }
  });
});

// Updates plan prices when switching between monthly and yearly
function switchPrice(checked) {
  const yearlyPrice = [90, 120, 150];
  const monthlyPrice = [9, 12, 15];
  const prices = document.querySelectorAll(".plan-priced");

  prices.forEach((price, index) => {
    price.innerHTML = checked ? `$${yearlyPrice[index]}/yr` : `$${monthlyPrice[index]}/mo`; // Update prices based on billing
  });

  setTime(checked); // Update time variable
}

// Adds or removes add-ons from the summary
function showAddon(ad, val) {
  const temp = document.getElementsByTagName("template")[0];
  const clone = temp.content.cloneNode(true); // Clone the template for add-ons
  const serviceName = clone.querySelector(".service-name");
  const servicePrice = clone.querySelector(".servic-price");
  const serviceID = clone.querySelector(".selected-addon");

  if (val) { // If an add-on is being added
    serviceName.innerText = ad.querySelector("label").innerText; // Set add-on name
    servicePrice.innerText = ad.querySelector(".price").innerText; // Set add-on price
    serviceID.setAttribute("data-id", ad.dataset.id); // Assign data-id
    document.querySelector(".addons").appendChild(clone); // Append add-on to summary
  } else { // If an add-on is being removed
    const addons = document.querySelectorAll(".selected-addon");
    addons.forEach((addon) => {
      if (addon.getAttribute("data-id") === ad) {
        addon.remove(); // Remove the add-on from summary
      }
    });
  }
}

// Calculates and updates the total price in the summary
function setTotal() {
  const basePrice = parseInt(planPrice.innerHTML.replace(/\D/g, "")); // Extract the numeric value from the plan price
  let totalValue = basePrice;

  // Add the prices of selected add-ons
  const addonPrices = document.querySelectorAll(".selected-addon .servic-price");
  addonPrices.forEach(price => {
    totalValue += parseInt(price.innerHTML.replace(/\D/g, "")); // Add add-on prices
  });

  total.innerHTML = `$${totalValue}/${time ? "yr" : "mo"}`; // Update the total price display
}

// Sets the billing type (monthly or yearly)
function setTime(t) {
  time = t; // Set the time variable (true for yearly, false for monthly)
}
