// script.js (Full version for index.html - Landing Page)
document.addEventListener('DOMContentLoaded', function () {
    // --- Capture UTMs and GCLID on page load ---
    function storeUtmData() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmData = {
            utm_source: urlParams.get('utm_source') || '',
            utm_medium: urlParams.get('utm_medium') || '',
            utm_campaign: urlParams.get('utm_campaign') || '',
            utm_term: urlParams.get('utm_term') || '',
            utm_content: urlParams.get('utm_content') || '',
            gclid: urlParams.get('gclid') || ''
        };

        const hasUtmOrGclid = Object.values(utmData).some(value => value !== '');
        if (hasUtmOrGclid) {
            localStorage.setItem('capturedUtmData', JSON.stringify(utmData));
            console.log('UTM data captured and stored:', utmData);
        }
    }
    storeUtmData(); // Call this function when the DOM is ready

    // --- Update current year in footer ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Back to top button functionality ---
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.onscroll = function () {
            if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                backToTopBtn.classList.remove('d-none');
            } else {
                backToTopBtn.classList.add('d-none');
            }
        };
        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Testimonial Video Modal Logic ---
    const testimonialVideoModal = document.getElementById('testimonialVideoModal');
    const youtubePlayer = document.getElementById('tubePlayer');

    if (testimonialVideoModal && youtubePlayer) {
        testimonialVideoModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const youtubeId = button.getAttribute('data-tube-id');
            if (youtubeId) {
                const videoSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`;
                youtubePlayer.setAttribute('src', videoSrc);
            }
        });
        testimonialVideoModal.addEventListener('hide.bs.modal', function () {
            if (youtubePlayer) {
                youtubePlayer.setAttribute('src', ''); // Clear src to stop video
            }
        });
    }

    // --- Ensure Bootstrap Carousel Pauses on Modal Open ---
    const testimonialBootstrapCarouselEl = document.getElementById('testimonialBootstrapCarousel');
    if (testimonialBootstrapCarouselEl && testimonialVideoModal) {
        // Ensure Bootstrap's Carousel component is initialized if not already via data attributes
        // This might not be strictly necessary if data-bs-ride="carousel" is used and
        // Bootstrap's JS is loaded, but it's safer.
        let carouselInstance = bootstrap.Carousel.getInstance(testimonialBootstrapCarouselEl);
        if (!carouselInstance) {
            carouselInstance = new bootstrap.Carousel(testimonialBootstrapCarouselEl);
        }

        testimonialVideoModal.addEventListener('show.bs.modal', function () {
            if (carouselInstance) {
                carouselInstance.pause();
            }
        });

        testimonialVideoModal.addEventListener('hide.bs.modal', function () {
            if (carouselInstance) {
                const rideType = testimonialBootstrapCarouselEl.getAttribute('data-bs-ride');
                if (rideType === 'carousel' || rideType === 'true') {
                    carouselInstance.cycle();
                }
            }
        });
    }

    // --- Loan Calculator Logic ---
    // Get all calculator elements
    const vehicleTypeSelect = document.getElementById('vehicleType');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const loanAmountValueDisplay = document.getElementById('loanAmountValueDisplay');
    const loanTenorSlider = document.getElementById('loanTenorSlider');
    const loanTenorValueDisplay = document.getElementById('loanTenorValueDisplay');
    const loanAmountHelp = document.getElementById('loanAmountHelp');
    const calculatorResultDiv = document.getElementById('calculatorResult');
    const calculatorErrorDiv = document.getElementById('calculatorError');
    const resultVehicleType = document.getElementById('resultVehicleType');
    const resultLoanAmount = document.getElementById('resultLoanAmount');
    const resultLoanTenor = document.getElementById('resultLoanTenor');
    const resultInterestRate = document.getElementById('resultInterestRate');
    const resultTotalInterest = document.getElementById('resultTotalInterest');
    const resultTotalLoanWithInterest = document.getElementById('resultTotalLoanWithInterest');
    const resultMonthlyInstallment = document.getElementById('resultMonthlyInstallment');
    const ajukanPembiayaanBtn = document.getElementById('ajukanPembiayaanBtn');

    const loanConfig = {
        mobil: { minAmount: 10000000, maxAmount: 2000000000, amountStep: 1000000, minTenor: 12, maxTenor: 48, tenorStep: 1, interestRate: 0.0076, defaultAmount: 50000000, defaultTenor: 48 },
        truk: { minAmount: 10000000, maxAmount: 2000000000, amountStep: 1000000, minTenor: 12, maxTenor: 48, tenorStep: 1, interestRate: 0.0076, defaultAmount: 50000000, defaultTenor: 48 },
        pickup: { minAmount: 10000000, maxAmount: 2000000000, amountStep: 1000000, minTenor: 12, maxTenor: 48, tenorStep: 1, interestRate: 0.0076, defaultAmount: 50000000, defaultTenor: 48 },
        motor: { minAmount: 1000000, maxAmount: 50000000, amountStep: 500000, minTenor: 6, maxTenor: 24, tenorStep: 1, interestRate: 0.022, defaultAmount: 10000000, defaultTenor: 24 }
    };

    function formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    }

    function setupSliders(type) {
        // Ensure elements exist before trying to set their properties
        if (!vehicleTypeSelect || !loanAmountSlider || !loanAmountValueDisplay || !loanTenorSlider || !loanTenorValueDisplay || !loanAmountHelp) {
            console.error("One or more calculator slider elements are missing from the DOM.");
            return;
        }
        const config = loanConfig[type];
        loanAmountSlider.min = config.minAmount;
        loanAmountSlider.max = config.maxAmount;
        loanAmountSlider.step = config.amountStep;
        loanAmountSlider.value = config.defaultAmount;
        loanAmountValueDisplay.textContent = formatCurrency(loanAmountSlider.value);
        loanAmountHelp.textContent = `Pembiayaan mulai dari ${formatCurrency(config.minAmount)} s.d. ${formatCurrency(config.maxAmount)}`;

        loanTenorSlider.min = config.minTenor;
        loanTenorSlider.max = config.maxTenor;
        loanTenorSlider.step = config.tenorStep;
        loanTenorSlider.value = config.defaultTenor;
        loanTenorValueDisplay.textContent = `${loanTenorSlider.value} Bulan`;
    }

    function calculateAndDisplay() {
        // Ensure elements exist
        if (!calculatorResultDiv || !calculatorErrorDiv || !vehicleTypeSelect || !loanAmountSlider || !loanTenorSlider ||
            !resultVehicleType || !resultLoanAmount || !resultLoanTenor || !resultInterestRate ||
            !resultTotalInterest || !resultTotalLoanWithInterest || !resultMonthlyInstallment) {
            console.error("One or more calculator display elements are missing for calculation.");
            return;
        }

        calculatorResultDiv.style.display = 'none';
        calculatorErrorDiv.style.display = 'none';
        calculatorErrorDiv.textContent = '';

        const vehicleType = vehicleTypeSelect.value;
        const principal = parseInt(loanAmountSlider.value, 10);
        const tenorMonths = parseInt(loanTenorSlider.value, 10);
        const config = loanConfig[vehicleType];

        if (isNaN(principal) || isNaN(tenorMonths)) {
            calculatorErrorDiv.textContent = "Nilai slider tidak valid.";
            calculatorErrorDiv.style.display = 'block';
            return;
        }

        if (principal < config.minAmount || principal > config.maxAmount) {
            calculatorErrorDiv.textContent = `Jumlah pembiayaan untuk ${vehicleType} harus antara ${formatCurrency(config.minAmount)} dan ${formatCurrency(config.maxAmount)}.`;
            calculatorErrorDiv.style.display = 'block';
            return;
        }

        const monthlyInterestRate = config.interestRate;
        const totalInterest = principal * monthlyInterestRate * tenorMonths;
        const totalLoanWithInterest = principal + totalInterest;
        const monthlyInstallment = totalLoanWithInterest / tenorMonths;

        resultVehicleType.textContent = vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
        resultLoanAmount.textContent = formatCurrency(principal);
        let tenorYears = tenorMonths / 12;
        let tenorDisplay = `${tenorMonths} Bulan`;
        if (tenorYears >= 1) {
            tenorDisplay += ` (${Number.isInteger(tenorYears) ? tenorYears : tenorYears.toFixed(1)} Tahun)`;
        }
        resultLoanTenor.textContent = tenorDisplay;
        resultInterestRate.textContent = (monthlyInterestRate * 100).toFixed(2).replace('.', ',');
        resultTotalInterest.textContent = `${formatCurrency(principal)} x ${(monthlyInterestRate * 100).toFixed(2).replace('.', ',')}% x ${tenorMonths} bulan = ${formatCurrency(totalInterest)}`;
        resultTotalLoanWithInterest.textContent = `${formatCurrency(principal)} + ${formatCurrency(totalInterest)} = ${formatCurrency(totalLoanWithInterest)}`;
        resultMonthlyInstallment.textContent = formatCurrency(monthlyInstallment);

        calculatorResultDiv.style.display = 'block';
    }

    // Add event listeners ONLY if the core calculator input elements exist on the page
    if (vehicleTypeSelect && loanAmountSlider && loanTenorSlider && loanAmountValueDisplay && loanTenorValueDisplay) {
        loanAmountSlider.addEventListener('input', function () {
            loanAmountValueDisplay.textContent = formatCurrency(this.value);
            calculateAndDisplay();
        });

        loanTenorSlider.addEventListener('input', function () {
            loanTenorValueDisplay.textContent = `${this.value} Bulan`;
            calculateAndDisplay();
        });

        vehicleTypeSelect.addEventListener('change', function () {
            setupSliders(this.value);
            calculateAndDisplay(); // Recalculate on type change
        });

        // Initial setup and calculation for the calculator
        setupSliders(vehicleTypeSelect.value);
        calculateAndDisplay();
    } else {
        console.warn("Calculator input elements not found. Calculator functionality will be disabled.");
    }


    // Event listener for the "Ajukan Pembiayaan" button
    if (ajukanPembiayaanBtn) {
        ajukanPembiayaanBtn.addEventListener('click', function () {
            // Ensure calculator elements are present to get values
            if (!vehicleTypeSelect || !loanAmountSlider || !loanTenorSlider || !resultMonthlyInstallment) {
                console.error("Cannot proceed: Calculator elements missing when trying to submit.");
                // Optionally show an error to the user
                Swal.fire('Error', 'Komponen kalkulator tidak ditemukan.', 'error');
                return;
            }

            const vehicleType = vehicleTypeSelect.value;
            const loanAmount = parseInt(loanAmountSlider.value, 10);
            const loanTenor = parseInt(loanTenorSlider.value, 10);
            const monthlyInstallmentText = resultMonthlyInstallment.textContent;

            const calculatorData = {
                vehicleType: vehicleType,
                loanAmount: loanAmount,
                loanTenor: loanTenor,
                estimatedInstallment: monthlyInstallmentText
            };

            const storedUtmDataString = localStorage.getItem('capturedUtmData');
            let utmDataToPass = {};
            if (storedUtmDataString) {
                try {
                    utmDataToPass = JSON.parse(storedUtmDataString);
                } catch (e) {
                    console.error("Error parsing stored UTM data:", e);
                }
            }

            const submissionData = {
                ...calculatorData,
                utm: utmDataToPass
            };

            localStorage.setItem('calculatorSubmissionData', JSON.stringify(submissionData));
            window.location.href = './form-pengajuan';
        });
    }
});