"use strict";

/* ==========================================
   VALIDATION RULES
   (every text / number / textarea field has one)
   ========================================== */

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validationRules = {
    helpName: {
        label: "Name",
        validate: value => value.trim().length >= 2,
        message: "Please enter at least 2 characters."
    },
    helpEmail: {
        label: "Email",
        validate: value => emailPattern.test(value.trim()),
        message: "Please enter a valid email address."
    },
    helpAge: {
        label: "Age",
        validate: value =>
            value !== "" &&
            Number.isInteger(Number(value)) &&
            Number(value) >= 1 &&
            Number(value) <= 120,
        message: "Age must be a whole number between 1 and 120."
    },
    helpDetails: {
        label: "Assistance Details",
        validate: value => value.trim().length >= 10,
        message: "Please provide at least 10 characters of details."
    },

    volunteerName: {
        label: "Name",
        validate: value => value.trim().length >= 2,
        message: "Please enter at least 2 characters."
    },
    volunteerEmail: {
        label: "Email",
        validate: value => emailPattern.test(value.trim()),
        message: "Please enter a valid email address."
    },
    // NEW: rule for "Hours available per week" (1 to 170)
    volunteerHours: {
        label: "Hours",
        validate: value =>
            value !== "" &&
            Number.isInteger(Number(value)) &&
            Number(value) >= 1 &&
            Number(value) <= 170,
        message: "Hours must be a whole number between 1 and 170."
    },
    volunteerSkills: {
        label: "Skills",
        validate: value => value.trim().length >= 10,
        message: "Please provide at least 10 characters describing your skills."
    }
};

function validateField(input) {
    const rule = validationRules[input.id];
    if (!rule) return true;

    const errorElement = document.getElementById(input.id + "Error");
    const isValid = rule.validate(input.value);

    if (!isValid) {
        errorElement.textContent = rule.message;
        input.classList.add("invalid");
        input.classList.remove("valid");
    } else {
        errorElement.textContent = "";
        input.classList.remove("invalid");
        input.classList.add("valid");
    }
    return isValid;
}

// Live validation on every field
Object.keys(validationRules).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("input", () => validateField(input));
    input.addEventListener("blur", () => {
        if (input.value.trim() !== "") {
            validateField(input);
        }
    });
});

function validateForm(form) {
    const inputs = form.querySelectorAll("input, textarea");
    let isFormValid = true;
    let firstInvalid = null;

    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
            if (!firstInvalid) firstInvalid = input;
        }
    });

    if (firstInvalid) firstInvalid.focus();
    return isFormValid;
}

function clearValidation(form) {
    form.querySelectorAll("input, textarea").forEach(input => {
        input.classList.remove("valid", "invalid");

        const error = document.getElementById(input.id + "Error");
        if (error) error.textContent = "";
    });
}

function showFeedback(element, message, isSuccess) {
    element.textContent = message;
    element.className =
        "form-feedback " + (isSuccess ? "success-feedback" : "error-feedback");
}

/* ==========================================
   FORM SUBMISSION
   ========================================== */

const helpForm = document.getElementById("helpForm");
const volunteerForm = document.getElementById("volunteerForm");

// FIX: ids are helpFeedback / volunteerFeedback (not ...FormFeedback)
helpForm.addEventListener("submit", event => {
    event.preventDefault();
    const feedback = document.getElementById("helpFeedback");

    if (!validateForm(helpForm)) {
        showFeedback(feedback, "Please correct the errors in the form.", false);
        return;
    }

    showFeedback(
        feedback,
        "Your help request has passed validation! Thank you for reaching out.",
        true
    );
    helpForm.reset();
    clearValidation(helpForm);
});

volunteerForm.addEventListener("submit", event => {
    event.preventDefault();
    const feedback = document.getElementById("volunteerFeedback");

    if (!validateForm(volunteerForm)) {
        showFeedback(feedback, "Please correct the errors in the form.", false);
        return;
    }

    showFeedback(
        feedback,
        "Your volunteer application has passed validation! Thank you for your interest.",
        true
    );
    volunteerForm.reset();
    clearValidation(volunteerForm);
});

/* ==========================================
   VOICE COMMANDS
   ========================================== */

const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");
const idleLabel = "🎙️ Start Voice Command";

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (!SpeechRecognition) {
    voiceButton.disabled = true;
    voiceStatus.textContent =
        "Speech recognition is not supported by this browser. Try Chrome or Edge.";
} else {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        voiceButton.textContent = "🎙️ Listening...";
        voiceButton.classList.add("listening");
        voiceStatus.textContent = "I'm listening, speak now...";
    };

    recognition.onresult = event => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        voiceStatus.textContent = `You said: "${command}"`;
        executeVoiceCommand(command);
    };

    recognition.onerror = event => {
        voiceStatus.textContent =
            `Voice recognition error: ${event.error}. Please try again.`;
    };

    recognition.onend = () => {
        isListening = false;
        voiceButton.textContent = idleLabel;
        voiceButton.classList.remove("listening");
    };
}

voiceButton.addEventListener("click", () => {
    if (!recognition) return;

    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (error) {
            voiceStatus.textContent =
                "Unable to start microphone. Please try again.";
        }
    }
});

// FIX: renamed from executiveVoiceCommand so the call above works
function executeVoiceCommand(command) {
    if (command.includes("volunteer")) {
        navigateTo("volunteer");
        voiceStatus.textContent = "Opening volunteer registration.";
    } else if (
        command.includes("request help") ||
        command.includes("need help") ||
        command.includes("get help")
    ) {
        navigateTo("help");
        voiceStatus.textContent = "Opening the help request form.";
    } else if (command.includes("resources")) {
        // FIX: resources now goes to the resources section (was "help")
        navigateTo("resources");
        voiceStatus.textContent = "Opening community resources.";
    } else if (command.includes("home")) {
        navigateTo("home");
        voiceStatus.textContent = "Taking you home.";
    } else {
        voiceStatus.textContent =
            "Sorry, I didn't understand. Try 'find resources', 'request help', or 'volunteer'.";
    }
}

function navigateTo(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* ==========================================
   RESOURCE SEARCH + LIVE VALIDATION
   ========================================== */

const resourceSearch = document.getElementById("resourceSearch");
const searchFeedback = document.getElementById("searchFeedback");
const resourceSearchError = document.getElementById("resourceSearchError");

resourceSearch.addEventListener("input", () => {
    const query = resourceSearch.value.trim().toLowerCase();

    if (query.length > 50) {
        resourceSearchError.textContent = "Search must be 50 characters or fewer.";
        resourceSearch.classList.add("invalid");
        searchFeedback.textContent = "";
        return;
    }

    resourceSearchError.textContent = "";
    resourceSearch.classList.remove("invalid");

    const cards = document.querySelectorAll(".resource-card");
    let visibleCount = 0;

    cards.forEach(card => {
        const category = card.dataset.category;
        const content = card.textContent.toLowerCase();

        const matches =
            query === "" || category.includes(query) || content.includes(query);

        card.hidden = !matches;
        if (matches) visibleCount++;
    });

    if (query === "") {
        searchFeedback.textContent = "";
    } else if (visibleCount === 0) {
        searchFeedback.textContent = "No matching resources found.";
    } else {
        searchFeedback.textContent = `${visibleCount} resource(s) found.`;
    }
});
