// js/main.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".contact-input form");
    const submitBtn = form.querySelector(".form-btn");
    const inputs = Array.from(form.querySelectorAll("input[required]"));

    // Disable submit initially
    submitBtn.disabled = true;
    submitBtn.setAttribute("aria-disabled", "true");

    // Find password and confirm password inputs (assume there are 2 password inputs)
    const passwordInputs = inputs.filter(i => i.type === "password");
    const passwordInput = passwordInputs[0] || null;
    const confirmPasswordInput = passwordInputs[1] || null;

    // helper: create or return feedback element after an input
    function getFeedbackEl(input) {
        let el = input.parentElement.querySelector(".invalid-feedback.custom-feedback");
        if (!el) {
            el = document.createElement("div");
            el.className = "invalid-feedback custom-feedback"; // uses bootstrap style
            input.parentElement.appendChild(el);
        }
        return el;
    }

    // validation rules per input
    function validateInput(input) {
        const val = input.value.trim();
        const type = input.type;
        const placeholder = (input.getAttribute("placeholder") || "").toLowerCase();
        const feedbackEl = getFeedbackEl(input);

        // default: empty required check
        if (input.required && val === "") {
            feedbackEl.textContent = "This field is required.";
            input.classList.remove("is-valid");
            input.classList.add("is-invalid");
            return false;
        }

        // type-specific checks
        if (type === "email") {
            // simple email regex (reasonable)
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!re.test(val)) {
                feedbackEl.textContent = "Please enter a valid email address.";
                input.classList.remove("is-valid");
                input.classList.add("is-invalid");
                return false;
            }
        }

        if (type === "number") {
            // phone vs age by placeholder
            if (placeholder.includes("phone")) {
                // Accept digits, +, spaces, hyphens; require 7+ digits
                const digitsOnly = val.replace(/\D/g, "");
                if (digitsOnly.length < 7) {
                    feedbackEl.textContent = "Please enter a valid phone number (at least 7 digits).";
                    input.classList.remove("is-valid");
                    input.classList.add("is-invalid");
                    return false;
                }
            } else if (placeholder.includes("age")) {
                const n = Number(val);
                if (!Number.isInteger(n) || n <= 0 || n > 120) {
                    feedbackEl.textContent = "Please enter a valid age (1–120).";
                    input.classList.remove("is-valid");
                    input.classList.add("is-invalid");
                    return false;
                }
            } else {
                // generic number
                if (isNaN(Number(val))) {
                    feedbackEl.textContent = "Please enter a valid number.";
                    input.classList.remove("is-valid");
                    input.classList.add("is-invalid");
                    return false;
                }
            }
        }

        if (type === "password") {
            if (val.length < 6) {
                feedbackEl.textContent = "Password must be at least 6 characters.";
                input.classList.remove("is-valid");
                input.classList.add("is-invalid");
                return false;
            }
        }

        if (confirmPasswordInput && input === confirmPasswordInput) {
        }

        feedbackEl.textContent = "";
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        return true;
    }

    function validatePasswordsMatch() {
        if (!passwordInput || !confirmPasswordInput) return true;
        const p1 = passwordInput.value.trim();
        const p2 = confirmPasswordInput.value.trim();
        const feedbackEl = getFeedbackEl(confirmPasswordInput);

        if (p2 === "") {
            feedbackEl.textContent = "This field is required.";
            confirmPasswordInput.classList.remove("is-valid");
            confirmPasswordInput.classList.add("is-invalid");
            return false;
        }

        if (p1 !== p2) {
            feedbackEl.textContent = "Passwords do not match.";
            confirmPasswordInput.classList.remove("is-valid");
            confirmPasswordInput.classList.add("is-invalid");
            passwordInput.classList.remove("is-valid");
            passwordInput.classList.add("is-invalid");
            return false;
        }

        // ok match
        feedbackEl.textContent = "";
        confirmPasswordInput.classList.remove("is-invalid");
        confirmPasswordInput.classList.add("is-valid");
        passwordInput.classList.remove("is-invalid");
        passwordInput.classList.add("is-valid");
        return true;
    }

    // Check all inputs and enable/disable submit
    function checkFormValidity() {
        let allValid = true;
        inputs.forEach(input => {
            const ok = validateInput(input);
            if (!ok) allValid = false;
        });

        // check password match if exists
        if (passwordInput && confirmPasswordInput) {
            const matchOk = validatePasswordsMatch();
            if (!matchOk) allValid = false;
        }

        // set button state
        submitBtn.disabled = !allValid;
        submitBtn.setAttribute("aria-disabled", String(!allValid));
        if (allValid) {
            submitBtn.classList.remove("btn-secondary");
            submitBtn.classList.add("btn-primary");
        } else {
            submitBtn.classList.remove("btn-primary");
            submitBtn.classList.add("btn-secondary");
        }

        return allValid;
    }

    // run validation on input events
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            validateInput(input);

            // if editing password fields, also check match
            if (passwordInput && confirmPasswordInput) validatePasswordsMatch();

            checkFormValidity();
        });

        // also validate on blur for better UX
        input.addEventListener("blur", () => {
            validateInput(input);
            if (passwordInput && confirmPasswordInput) validatePasswordsMatch();
            checkFormValidity();
        });
    });

    // Prevent real submission if not valid, otherwise simulate success
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const ok = checkFormValidity();
        if (!ok) {
            // focus first invalid input
            const firstInvalid = form.querySelector(".is-invalid");
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // All good — here you can send data via fetch/AJAX
        // For demo, show a bootstrap alert dynamically
        showSuccessMessage("Form submitted successfully!");
        form.reset();

        // reset validation classes
        inputs.forEach(i => {
            i.classList.remove("is-valid");
            i.classList.remove("is-invalid");
            const fb = i.parentElement.querySelector(".invalid-feedback.custom-feedback");
            if (fb) fb.textContent = "";
        });

        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-disabled", "true");
    });

    // small helper to show success
    function showSuccessMessage(msg) {
        // remove existing
        const existing = document.querySelector(".submit-success");
        if (existing) existing.remove();

        const alert = document.createElement("div");
        alert.className = "alert alert-success submit-success mt-3";
        alert.textContent = msg;
        form.parentElement.insertBefore(alert, form);
        setTimeout(() => alert.remove(), 4000);
    }

    // initial check (in case browser autofill)
    checkFormValidity();
});
