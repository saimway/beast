document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const carrierInput = document.getElementById('carrier-input');
    const secretInput = document.getElementById('secret-input');
    const encodedOutput = document.getElementById('encoded-output');
    const copyBtn = document.getElementById('copy-btn');
    const decodeInput = document.getElementById('decode-input');
    const decodedOutput = document.getElementById('decoded-output');

    // Constants
    const ZERO_WIDTH_SPACE = '\u200B'; // Represents 0
    const ZERO_WIDTH_NON_JOINER = '\u200C'; // Represents 1

    // Encoding Logic
    function textToBinary(text) {
        return text.split('').map(char => {
            const binary = char.charCodeAt(0).toString(2);
            return binary.padStart(8, '0');
        }).join('');
    }

    function binaryToZeroWidth(binary) {
        return binary.split('').map(bit => {
            return bit === '1' ? ZERO_WIDTH_NON_JOINER : ZERO_WIDTH_SPACE;
        }).join('');
    }

    function updateEncodedOutput() {
        const carrier = carrierInput.value;
        const secret = secretInput.value;

        if (!secret) {
            encodedOutput.value = carrier;
            return;
        }

        const binary = textToBinary(secret);
        const hiddenString = binaryToZeroWidth(binary);

        if (carrier.length > 0) {
            // Inject after the first character
            const firstChar = carrier.charAt(0);
            const rest = carrier.slice(1);
            encodedOutput.value = firstChar + hiddenString + rest;
        } else {
            // If empty, just return the hidden string (effectively invisible)
            // Or technically, following the "inside a single invisible space" idea?
            // The prompt says: "if the carrier word is empty, it hides the message inside a single invisible space character"
            // So we might prepend a space? Or just return the zero-width sequence.
            // A zero-width sequence *is* invisible. But maybe to make it copyable/selectable easily if it's empty?
            // Actually, if the output is just zero-width chars, it's very hard to select.
            // Let's stick to the simplest interpretation: Carrier (empty) + Hidden.
            encodedOutput.value = hiddenString;
        }
    }

    // Decoding Logic
    function zeroWidthToBinary(text) {
        let binary = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ZERO_WIDTH_NON_JOINER) {
                binary += '1';
            } else if (text[i] === ZERO_WIDTH_SPACE) {
                binary += '0';
            }
        }
        return binary;
    }

    function binaryToText(binary) {
        let text = '';
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.substr(i, 8);
            if (byte.length === 8) {
                text += String.fromCharCode(parseInt(byte, 2));
            }
        }
        return text;
    }

    function updateDecodedOutput() {
        const text = decodeInput.value;
        const binary = zeroWidthToBinary(text);

        if (binary.length > 0) {
            const secret = binaryToText(binary);
            decodedOutput.value = secret;
        } else {
            decodedOutput.value = '';
        }
    }

    // Event Listeners
    carrierInput.addEventListener('input', updateEncodedOutput);
    secretInput.addEventListener('input', updateEncodedOutput);
    decodeInput.addEventListener('input', updateDecodedOutput);

    copyBtn.addEventListener('click', () => {
        if (encodedOutput.value) {
            encodedOutput.select();
            // For mobile compatibility
            encodedOutput.setSelectionRange(0, 99999);

            navigator.clipboard.writeText(encodedOutput.value).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = 'Copied!';
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                // Fallback
                document.execCommand('copy');
            });
        }
    });

    // Initial call to handle any pre-filled values (browser autocomplete)
    updateEncodedOutput();
});
