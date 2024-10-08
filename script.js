document.addEventListener('DOMContentLoaded', function () {
    const showHeaderCheckbox = document.getElementById('show-header');
    const headerElement = document.querySelector('.header');
    const contactNameInput = document.getElementById('contact-name');
    const contactNameElement = document.querySelector('.contact-name');
    const addMessageBtn = document.getElementById('add-message-btn');
    const messagesList = document.getElementById('messages-list');
    const messageContainer = document.querySelector('.message-container');
    const generateImageBtn = document.getElementById('generate-image-btn');
    const boldMessagesCheckbox = document.getElementById('bold-messages');
    const importScriptBtn = document.getElementById('import-script-btn');

    // Update header visibility
    showHeaderCheckbox.addEventListener('change', function () {
        headerElement.style.display = showHeaderCheckbox.checked ? 'flex' : 'none';
    });

    // Update contact name
    contactNameInput.addEventListener('input', function () {
        contactNameElement.textContent = contactNameInput.value;
    });

    // Toggle bold messages
    boldMessagesCheckbox.addEventListener('change', function () {
        if (boldMessagesCheckbox.checked) {
            messageContainer.classList.add('bold-messages');
        } else {
            messageContainer.classList.remove('bold-messages');
        }
    });

    // Import Script button handler
    importScriptBtn.addEventListener('click', function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt';

        fileInput.addEventListener('change', function () {
            const file = fileInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const contents = e.target.result;
                    // Parse the contents using parser.js
                    const messagesData = parseScript(contents);
                    // Populate messages
                    populateMessagesFromData(messagesData);
                };
                reader.readAsText(file);
            }
        });

        fileInput.click();
    });

    function createMessageInput(messageData = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-input-item');

        // Collapsed summary
        const summaryDiv = document.createElement('div');
        summaryDiv.classList.add('message-summary');
        summaryDiv.style.cursor = 'pointer';

        // Create the text span for the summary
        const summaryTextSpan = document.createElement('span');
        summaryTextSpan.textContent = 'New message...';
        summaryDiv.appendChild(summaryTextSpan);

        // Create the trash icon
        const trashIcon = document.createElement('img');
        trashIcon.src = 'assets/trash.svg';
        trashIcon.classList.add('trash-icon');
        summaryDiv.appendChild(trashIcon);

        messageDiv.appendChild(summaryDiv);

        // Details container
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('message-details');
        messageDiv.appendChild(detailsDiv);

        // Message Type
        const messageTypeLabel = document.createElement('label');
        messageTypeLabel.textContent = 'Message Type:';
        const messageTypeSelect = document.createElement('select');
        messageTypeSelect.classList.add('message-type-select');
        messageTypeSelect.innerHTML = `
            <option value="text">Text</option>
            <option value="image">Image</option>
        `;
        messageTypeLabel.appendChild(messageTypeSelect);
        detailsDiv.appendChild(messageTypeLabel);

        // Side
        const sideLabel = document.createElement('label');
        sideLabel.textContent = 'Side:';
        const sideSelect = document.createElement('select');
        sideSelect.classList.add('side-select');
        sideSelect.innerHTML = `
            <option value="left">Left</option>
            <option value="right">Right</option>
        `;
        sideLabel.appendChild(sideSelect);
        detailsDiv.appendChild(sideLabel);

        // Color (for right messages)
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color:';
        const colorSelect = document.createElement('select');
        colorSelect.classList.add('color-select');
        colorSelect.innerHTML = `
            <option value="blue">Blue</option>
            <option value="green">Green</option>
        `;
        colorLabel.appendChild(colorSelect);
        detailsDiv.appendChild(colorLabel);

        // Content for text messages
        const contentLabel = document.createElement('label');
        contentLabel.textContent = 'Content:';
        const contentInput = document.createElement('input');
        contentInput.type = 'text';
        contentInput.classList.add('content-input');
        contentLabel.appendChild(contentInput);
        detailsDiv.appendChild(contentLabel);

        // Image URL for image messages (hidden now)
        const imageInputLabel = document.createElement('label');
        imageInputLabel.textContent = 'Image URL:';
        const imageInput = document.createElement('input');
        imageInput.type = 'text';
        imageInput.classList.add('image-url-input');
        imageInputLabel.appendChild(imageInput);
        imageInputLabel.style.display = 'none'; // Hide since users don't specify URL now
        detailsDiv.appendChild(imageInputLabel);

        // Image upload
        const imageFileLabel = document.createElement('label');
        imageFileLabel.textContent = 'Upload Image (optional):';
        const imageFileInput = document.createElement('input');
        imageFileInput.type = 'file';
        imageFileInput.accept = 'image/*';
        imageFileInput.classList.add('image-file-input');
        imageFileLabel.appendChild(imageFileInput);
        detailsDiv.appendChild(imageFileLabel);

        // Set initial values from messageData
        messageTypeSelect.value = messageData.type || 'text';
        sideSelect.value = messageData.side || 'left';
        colorSelect.value = messageData.color || 'blue';
        contentInput.value = messageData.content || '';
        // imageInput.value = messageData.imageUrl || ''; // No longer used

        // Append messageDiv to messagesList
        messagesList.appendChild(messageDiv);

        // Event listeners for dynamic behavior
        function updateVisibility() {
            if (messageTypeSelect.value === 'text') {
                contentLabel.style.display = 'block';
                imageFileLabel.style.display = 'none';
            } else {
                contentLabel.style.display = 'none';
                imageFileLabel.style.display = 'block';
            }

            if (sideSelect.value === 'right') {
                colorLabel.style.display = 'block';
            } else {
                colorLabel.style.display = 'none';
            }
        }

        messageTypeSelect.addEventListener('change', () => {
            updateVisibility();
            updateSummary();
            updatePreview();
        });
        sideSelect.addEventListener('change', () => {
            updateVisibility();
            updateSummary();
            updatePreview();
        });
        colorSelect.addEventListener('change', () => {
            updateSummary();
            updatePreview();
        });
        contentInput.addEventListener('input', () => {
            updateSummary();
            updatePreview();
        });
        imageFileInput.addEventListener('change', () => {
            updateSummary();
            updatePreview();
        });

        trashIcon.addEventListener('click', function () {
            messagesList.removeChild(messageDiv);
            updatePreview();
            updateAllSummaries(); // Update numbering after removal
        });

        // Toggle details visibility
        summaryDiv.addEventListener('click', function () {
            const isVisible = detailsDiv.style.display !== 'none';
            // Hide all other details
            const allDetails = messagesList.querySelectorAll('.message-details');
            allDetails.forEach(function (detail) {
                detail.style.display = 'none';
            });
            // Show or hide this one
            detailsDiv.style.display = isVisible ? 'none' : 'block';
        });

        // Initialize visibility
        updateVisibility();
        detailsDiv.style.display = 'none'; // Start collapsed

        // Update preview and summary initially
        updateSummary();
        updatePreview();

        function updateSummary() {
            const messageIndex = Array.from(messagesList.children).indexOf(messageDiv) + 1;
            summaryTextSpan.innerHTML = `Message #${messageIndex} <span class="click-to-modify">(Click to modify)</span>`;
        }

        return messageDiv; // Return the messageDiv for reference
    }

    // Function to update all summaries (used when messages are removed)
    function updateAllSummaries() {
        const messageItems = messagesList.querySelectorAll('.message-input-item');
        messageItems.forEach(function (messageDiv) {
            const summaryDiv = messageDiv.querySelector('.message-summary');
            const summaryTextSpan = summaryDiv.querySelector('span');
            const messageIndex = Array.from(messagesList.children).indexOf(messageDiv) + 1;
            summaryTextSpan.innerHTML = `Message #${messageIndex} <span class="click-to-modify">(Click to modify)</span>`;
        });
    }

    function updatePreview() {
        // Clear existing messages
        messageContainer.innerHTML = '';

        // Get all message input items
        const messageItems = messagesList.querySelectorAll('.message-input-item');

        messageItems.forEach(function (messageDiv, index) {
            const messageTypeSelect = messageDiv.querySelector('.message-type-select');
            const sideSelect = messageDiv.querySelector('.side-select');
            const colorSelect = messageDiv.querySelector('.color-select');
            const contentInput = messageDiv.querySelector('.content-input');
            const imageFileInput = messageDiv.querySelector('.image-file-input');

            const messageType = messageTypeSelect.value;
            const side = sideSelect.value;
            const color = colorSelect.value;
            const content = contentInput.value;
            const imageFile = imageFileInput.files[0];

            // Create message element
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', side);

            if (side === 'right' && color === 'green') {
                messageElement.classList.add('green');
            }

            if (messageType === 'text') {
                // Add content
                const messageSpan = document.createElement('span');
                messageSpan.textContent = content;
                messageElement.appendChild(messageSpan);
            } else {
                // Image message
                messageElement.classList.add('image-message');

                const imgElement = document.createElement('img');

                if (imageFile) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        imgElement.src = e.target.result;
                    };
                    reader.readAsDataURL(imageFile);
                } else {
                    imgElement.src = 'assets/image.png'; // Placeholder image
                }

                messageElement.appendChild(imgElement);
            }

            // Determine if this message is the last in its group
            const nextMessageDiv = messageItems[index + 1];
            let nextSide = null;
            if (nextMessageDiv) {
                const nextSideSelect = nextMessageDiv.querySelector('.side-select');
                nextSide = nextSideSelect.value;
            }

            if (side !== nextSide || index === messageItems.length - 1) {
                // This is the last message in its group
                messageElement.classList.add('last-message');

                // Add speech bubble tail using image
                messageElement.classList.add('speech-bubble');

                const speechTailImg = document.createElement('img');
                speechTailImg.classList.add('speech-tail');

                // Determine the appropriate image based on side and color
                let tailColor = '';
                if (side === 'left') {
                    tailColor = 'gray'; // Left messages are typically gray
                } else {
                    tailColor = color; // 'blue' or 'green'
                }

                speechTailImg.src = `assets/speech-tail-${side}-${tailColor}.png`;

                messageElement.appendChild(speechTailImg);
            }

            // Append the message to the container
            messageContainer.appendChild(messageElement);

            // Add click event to messageElement to open corresponding message input
            messageElement.addEventListener('click', function () {
                // Collapse all other message inputs
                const allDetails = messagesList.querySelectorAll('.message-details');
                allDetails.forEach(function (detail) {
                    detail.style.display = 'none';
                });
                // Expand the corresponding message input
                const detailsDiv = messageDiv.querySelector('.message-details');
                detailsDiv.style.display = 'block';
                // Scroll to the message input
                messageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    function populateMessagesFromData(messagesData) {
        // Clear existing messages
        messagesList.innerHTML = '';

        messagesData.forEach(function (messageData) {
            createMessageInput(messageData);
        });

        updateAllSummaries();
        updatePreview();
    }

    // Add initial message input
    createMessageInput();

    // Add message button click handler
    addMessageBtn.addEventListener('click', function () {
        const messageDiv = createMessageInput();
        // Scroll to the new message input
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    generateImageBtn.addEventListener('click', function () {
        const container = document.querySelector('.container');
        
        html2canvas(container, {
            useCORS: true,
            scale: 2, // Increase the scale for higher resolution export
            removeContainer: true // This ensures the canvas doesn't include unwanted extra elements
        }).then(function (canvas) {
            const link = document.createElement('a');
            link.download = 'message.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });
});