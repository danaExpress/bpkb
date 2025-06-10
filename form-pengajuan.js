document.addEventListener('DOMContentLoaded', function () {
    // --- Retrieve Calculator and UTM Data ---
    const calculatorDataDisplay = document.getElementById('calculatorDataDisplay');
    const calcVehicleTypeDisplay = document.getElementById('calcVehicleTypeDisplay');
    const calcLoanAmountDisplay = document.getElementById('calcLoanAmountDisplay');
    const calcLoanTenorDisplay = document.getElementById('calcLoanTenorDisplay');
    const calcInstallmentDisplay = document.getElementById('calcInstallmentDisplay');

    let retrievedCalculatorData = null;
    let retrievedUtmData = null; // To store UTM data specifically

    const storedSubmissionDataString = localStorage.getItem('calculatorSubmissionData');
    if (storedSubmissionDataString) {
        try {
            const fullSubmissionData = JSON.parse(storedSubmissionDataString);
            console.log('Retrieved full submission data:', fullSubmissionData);

            // Separate calculator data
            retrievedCalculatorData = {
                vehicleType: fullSubmissionData.vehicleType,
                loanAmount: fullSubmissionData.loanAmount,
                loanTenor: fullSubmissionData.loanTenor,
                estimatedInstallment: fullSubmissionData.estimatedInstallment
            };
            // Separate UTM data
            retrievedUtmData = fullSubmissionData.utm || {}; // Get the utm object, default to empty if not present

            // Display Calculator Data
            if (calculatorDataDisplay && retrievedCalculatorData) {
                calculatorDataDisplay.style.display = 'block';
                if (calcVehicleTypeDisplay) calcVehicleTypeDisplay.textContent = `${retrievedCalculatorData.vehicleType.charAt(0).toUpperCase() + retrievedCalculatorData.vehicleType.slice(1)}`;
                if (calcLoanAmountDisplay) calcLoanAmountDisplay.textContent = `Rp ${parseInt(retrievedCalculatorData.loanAmount).toLocaleString('id-ID')}`;
                if (calcLoanTenorDisplay) calcLoanTenorDisplay.textContent = `${retrievedCalculatorData.loanTenor} Bulan`;
                if (calcInstallmentDisplay && retrievedCalculatorData.estimatedInstallment) {
                    calcInstallmentDisplay.textContent = `${retrievedCalculatorData.estimatedInstallment}`;
                }
                const asetDijaminkanField = document.getElementById('asetDijaminkan');
                if (asetDijaminkanField && retrievedCalculatorData.vehicleType) {
                    asetDijaminkanField.value = retrievedCalculatorData.vehicleType.charAt(0).toUpperCase() + retrievedCalculatorData.vehicleType.slice(1);
                }
            }
        } catch (error) {
            console.error('Error parsing submission data from localStorage:', error);
            if (calculatorDataDisplay) calculatorDataDisplay.style.display = 'none';
        }
    } else {
        console.log('No submission data (calculator + UTMs) found in localStorage.');
        if (calculatorDataDisplay) calculatorDataDisplay.style.display = 'none';
    }

    // --- Form Wizard Logic ---
    const form = document.getElementById('pengajuanForm');
    const steps = Array.from(form.querySelectorAll('.form-step'));
    const stepIndicators = Array.from(document.querySelectorAll('.step-indicator .step'));
    let currentStep = 0;

    const nextStep1Btn = document.getElementById('nextStep1');
    const prevStep2Btn = document.getElementById('prevStep2');

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        stepIndicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === stepIndex);
        });
        currentStep = stepIndex;
        window.scrollTo(0, 0); // Scroll to top when changing steps
    }

    function validateStep(stepIndex) {
        let isValid = true;
        const currentStepElement = steps[stepIndex];
        const currentStepInputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');

        currentStepInputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                // Bootstrap's default invalid feedback will be shown due to 'was-validated'
            }
            // We will add 'was-validated' to the step element itself
        });
        currentStepElement.classList.add('was-validated');
        return isValid;
    }

    if (nextStep1Btn) {
        nextStep1Btn.addEventListener('click', () => {
            if (validateStep(0)) {
                showStep(1);
            } else {
                Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Mohon lengkapi semua field yang wajib diisi.' });
            }
        });
    }

    if (prevStep2Btn) {
        prevStep2Btn.addEventListener('click', () => {
            steps[1].classList.remove('was-validated');
            showStep(0);
        });
    }

    const nomorHpInput = document.getElementById('nomorHp');
    const nomorWaInput = document.getElementById('nomorWa');
    const waSamaHpCheckbox = document.getElementById('waSamaHp');

    if (waSamaHpCheckbox && nomorHpInput && nomorWaInput) {
        waSamaHpCheckbox.addEventListener('change', function () {
            if (this.checked) {
                nomorWaInput.value = nomorHpInput.value;
                nomorWaInput.readOnly = true;
                nomorWaInput.dispatchEvent(new Event('input')); // Trigger validation if any
                nomorWaInput.classList.remove('is-invalid');
            } else {
                nomorWaInput.readOnly = false;
            }
        });
        nomorHpInput.addEventListener('input', function () {
            if (waSamaHpCheckbox.checked) {
                nomorWaInput.value = this.value;
                nomorWaInput.dispatchEvent(new Event('input'));
            }
        });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (!validateStep(currentStep)) {
            Swal.fire({
                icon: 'error',
                title: 'Data Belum Lengkap',
                text: 'Mohon lengkapi semua field yang wajib diisi pada langkah ini.',
            });
            return;
        }

        Swal.fire({
            title: 'Konfirmasi Pengajuan',
            text: "Apakah Anda yakin data yang dimasukkan sudah benar?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#f7941d',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Ya, Ajukan!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                submitData();
            }
        });
    });

    async function submitData() {
        Swal.fire({
            title: 'Mengirim Data...',
            text: 'Mohon tunggu sebentar.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const formData = new FormData();
        formData.append('timestamp', new Date().toISOString());

        // --- Append UTMs and GCLID (from retrievedUtmData) ---
        if (retrievedUtmData) {
            formData.append('utm_source', retrievedUtmData.utm_source || '');
            formData.append('utm_medium', retrievedUtmData.utm_medium || '');
            formData.append('utm_campaign', retrievedUtmData.utm_campaign || '');
            formData.append('utm_term', retrievedUtmData.utm_term || '');
            formData.append('utm_content', retrievedUtmData.utm_content || '');
            formData.append('gclid', retrievedUtmData.gclid || '');
        } else { // Fallback if UTMs were not in localStorage from landing page
            const urlParams = new URLSearchParams(window.location.search);
            formData.append('utm_source', urlParams.get('utm_source') || '');
            formData.append('utm_medium', urlParams.get('utm_medium') || '');
            formData.append('utm_campaign', urlParams.get('utm_campaign') || '');
            formData.append('utm_term', urlParams.get('utm_term') || '');
            formData.append('utm_content', urlParams.get('utm_content') || '');
            formData.append('gclid', urlParams.get('gclid') || '');
        }


        if (retrievedCalculatorData) {
            formData.append('calc_vehicle_type', retrievedCalculatorData.vehicleType || '');
            formData.append('calc_loan_amount', retrievedCalculatorData.loanAmount || '');
            formData.append('calc_loan_tenor', retrievedCalculatorData.loanTenor || '');
            formData.append('calc_installment', retrievedCalculatorData.estimatedInstallment || '');
        }

        const formFields = [
            'asetDijaminkan', 'namaKtp', 'nik', 'platNomor', 'nomorHp', 'nomorWa', 'email',
            'provinsi', 'kecamatan', 'kelurahan', 'namaJalan',
            'merekKendaraan', 'modelKendaraan', 'tahunKendaraan', 'asuransiKendaraan',
            'atasNamaKendaraan', 'tanggalStnk', 'statusBpkb'
        ];
        formFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            let value = element.value;
            if (fieldId === 'platNomor') value = value.toUpperCase();
            if (fieldId === 'nomorWa' && !value && document.getElementById('waSamaHp').checked) {
                value = document.getElementById('nomorHp').value;
            }
            formData.append(fieldId.replace(/([A-Z])/g, '_$1').toLowerCase(), value); // Convert camelCase to snake_case
        });


        const googleSheetURL = 'https://script.google.com/macros/s/AKfycbwaWpyZyV1CfWgm9glJz0zI8EFjETfoRgKNezL9TveIqs6c6Qdnte01pOCw6nI2PXc7Ww/exec';
        let sheetSubmissionSuccess = false;
        try {
            const response = await fetch(googleSheetURL, { method: 'POST', body: formData });
            if (response.ok) {
                const result = await response.json();
                if (result.status === "success") {
                    sheetSubmissionSuccess = true;
                    console.log('Data successfully sent to Google Sheet:', result.message);
                } else { console.error('Google Sheet submission error:', result.message); }
            } else { console.error('Error sending data to Google Sheet. Status:', response.status); }
        } catch (error) { console.error('Network error or Apps Script error:', error); }

        if (sheetSubmissionSuccess) {
            Swal.fire({
                icon: 'success', title: 'Pengajuan Terkirim!',
                text: 'Data Anda telah berhasil dikirim.',
                timer: 2000, timerProgressBar: true, showConfirmButton: false
            }).then(() => {
                redirectToWhatsAppAndThankYou(); // Modified function name
            });
        } else {
            Swal.fire({
                icon: 'warning', title: 'Pengajuan Gagal ke Sistem',
                text: 'Terjadi masalah saat menyimpan data, namun Anda dapat melanjutkan via WhatsApp.',
                showCancelButton: true, confirmButtonText: 'Lanjut ke WhatsApp',
                cancelButtonText: 'Tutup', confirmButtonColor: '#f7941d',
            }).then((result) => {
                if (result.isConfirmed) {
                    redirectToWhatsAppAndThankYou(); // Modified function name
                }
            });
        }
    }

    function redirectToWhatsAppAndThankYou() { // Renamed function
        const baseWaUrl = "https://wa.me/6281914438888";
        let waMessage = `Halo DanaExpress, saya ingin mengajukan pembiayaan dengan jaminan ${document.getElementById('asetDijaminkan').value}.\n`;
        if (retrievedCalculatorData && retrievedCalculatorData.loanAmount && retrievedCalculatorData.loanTenor) {
            waMessage += `Dengan Pembiayaan Rp ${parseInt(retrievedCalculatorData.loanAmount).toLocaleString('id-ID')} tenor ${retrievedCalculatorData.loanTenor} Bulan.\n\n`;
        } else { waMessage += `\n`; }

        waMessage += `Data Pribadi:\n`;
        waMessage += `Nama Sesuai KTP : ${document.getElementById('namaKtp').value}\n`;
        waMessage += `Email : ${document.getElementById('email').value}\n`;
        waMessage += `NIK : ${document.getElementById('nik').value}\n`;
        waMessage += `Alamat : ${document.getElementById('namaJalan').value}, ${document.getElementById('kelurahan').value}, ${document.getElementById('kecamatan').value}, ${document.getElementById('provinsi').value}\n\n`;
        waMessage += `Data Kendaraan:\n`;
        waMessage += `${document.getElementById('platNomor').value.toUpperCase()} ${document.getElementById('merekKendaraan').value} ${document.getElementById('modelKendaraan').value} ${document.getElementById('tahunKendaraan').value}\n`;
        waMessage += `Asuransi : ${document.getElementById('asuransiKendaraan').value}\n\n`;

        if (retrievedUtmData && Object.values(retrievedUtmData).some(val => val !== '')) {
            waMessage += `Tracking Info:\n`;
            if (retrievedUtmData.utm_source) waMessage += `Source: ${retrievedUtmData.utm_source}\n`;
            if (retrievedUtmData.utm_medium) waMessage += `Medium: ${retrievedUtmData.utm_medium}\n`;
            if (retrievedUtmData.utm_campaign) waMessage += `Campaign: ${retrievedUtmData.utm_campaign}\n`;
            if (retrievedUtmData.utm_term) waMessage += `Term: ${retrievedUtmData.utm_term}\n`;
            if (retrievedUtmData.utm_content) waMessage += `Content: ${retrievedUtmData.utm_content}\n`;
            if (retrievedUtmData.gclid) waMessage += `GCLID: ${retrievedUtmData.gclid}\n`;
        } else { // Fallback if UTMs were not in localStorage from landing page
            const urlParamsForWa = new URLSearchParams(window.location.search);
            const utmSource = urlParamsForWa.get('utm_source');
            const utmMedium = urlParamsForWa.get('utm_medium');
            const utmCampaign = urlParamsForWa.get('utm_campaign');
            const utmTerm = urlParamsForWa.get('utm_term');
            const utmContent = urlParamsForWa.get('utm_content');
            const gclid = urlParamsForWa.get('gclid');
            if (utmSource || utmMedium || utmCampaign || utmTerm || utmContent || gclid) {
                waMessage += `\nTracking Info (Current Page):\n`;
                if (utmSource) waMessage += `Source: ${utmSource}\n`;
                if (utmMedium) waMessage += `Medium: ${utmMedium}\n`;
                if (utmCampaign) waMessage += `Campaign: ${utmCampaign}\n`;
                if (utmTerm) waMessage += `Term: ${utmTerm}\n`;
                if (utmContent) waMessage += `Content: ${utmContent}\n`;
                if (gclid) waMessage += `GCLID: ${gclid}\n`;
            }
        }
        waMessage += `\nTolong segera diproses, terima kasih.`;

        const encodedMessage = encodeURIComponent(waMessage);
        const whatsappWindow = window.open(`${baseWaUrl}?text=${encodedMessage}`, '_blank');

        // Redirect to thank you page after a short delay,
        // allowing WhatsApp tab to open.
        setTimeout(() => {
            window.location.href = 'terima-kasih'; // Ensure this path is correct
        }, 1000); // 1 second delay

        // Clean up after process initiated
        form.reset();
        showStep(0);
        if (calculatorDataDisplay) calculatorDataDisplay.style.display = 'none';
        localStorage.removeItem('calculatorSubmissionData');
        localStorage.removeItem('capturedUtmData'); // Also clear specific UTM capture
        form.classList.remove('was-validated');
        steps.forEach(step => step.classList.remove('was-validated'));
    }
    showStep(0); // Initialize the first step
});