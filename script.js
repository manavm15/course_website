document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const countryCodeSelect = document.getElementById('countryCode');
    const flagSpan = document.getElementById('flag');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');

    // Country data (ISO 3166-1 alpha-2 country codes with flags and phone codes)
    const countries = [
        { code: "NL", name: "Netherlands", dial_code: "+31", flag: "🇳🇱" },
        { code: "US", name: "United States", dial_code: "+1", flag: "🇺🇸" },
        { code: "GB", name: "United Kingdom", dial_code: "+44", flag: "🇬🇧" },
        { code: "IN", name: "India", dial_code: "+91", flag: "🇮🇳" },
        { code: "DE", name: "Germany", dial_code: "+49", flag: "🇩🇪" },
        { code: "FR", name: "France", dial_code: "+33", flag: "🇫🇷" },
        { code: "AU", name: "Australia", dial_code: "+61", flag: "🇦🇺" },
        { code: "JP", name: "Japan", dial_code: "+81", flag: "🇯🇵" },
        { code: "CN", name: "China", dial_code: "+86", flag: "🇨🇳" },
        { code: "BR", name: "Brazil", dial_code: "+55", flag: "🇧🇷" }
        // Add more countries as needed
    ];

    // Populate the countryCode select dropdown
    countries.forEach((country) => {
        const option = document.createElement('option');
        option.value = country.dial_code;
        option.textContent = `${country.name} (${country.dial_code})`;
        option.setAttribute('data-flag', country.flag);
        option.setAttribute('data-code', country.code);
        if (country.code === "NL") {
            option.selected = true; // Default to Netherlands
        }
        countryCodeSelect.appendChild(option);
    });

    // Set default flag and placeholder for Netherlands
    updateFlagAndPlaceholder("+31", "🇳🇱");

    // Update flag and placeholder on country change
    countryCodeSelect.addEventListener('change', () => {
        const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
        const flag = selectedOption.getAttribute('data-flag');
        const dialCode = selectedOption.value;
        updateFlagAndPlaceholder(dialCode, flag);
    });

    function updateFlagAndPlaceholder(dialCode, flag) {
        flagSpan.textContent = flag;
        phoneInput.placeholder = "Enter phone number";
    }

    // Validate email
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone using libphonenumber-js
    function validatePhone(phone, countryCode) {
        const { parsePhoneNumberFromString } = window.libphonenumber;
        const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
        return phoneNumber && phoneNumber.isValid();
    }

    // Form submission event
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        let valid = true;
        const selectedCountryCode = countryCodeSelect.options[countryCodeSelect.selectedIndex].getAttribute('data-code');

        // Email validation
        if (!validateEmail(emailInput.value)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.style.display = 'block';
            valid = false;
        } else {
            emailError.style.display = 'none';
        }

        // Phone validation
        if (!validatePhone(phoneInput.value, selectedCountryCode)) {
            phoneError.textContent = 'Please enter a valid phone number.';
            phoneError.style.display = 'block';
            valid = false;
        } else {
            phoneError.style.display = 'none';
        }

        if (valid) {
            alert('Form submitted successfully!');
        }
    });
});
