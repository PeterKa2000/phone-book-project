
'use strict';

(function () {

    let contacts = [
        {
     // Data structure for contacts
     // Each contact has a unique id, name, phone and optional fields

        id: crypto.randomUUID(),
        name: 'Martin Zaknoun',
        phone: '0523456789',    // 
        address: 'Tel Aviv',
        age: 30,
        email: 'martin@example.com',
        imageURL: 'https://i.pravatar.cc/150?img=10'
    },
    {
        id: crypto.randomUUID(),
        name: 'Khaled Boshcar',
        phone: '0539876543',    
        address: 'Haifa',
        age: 28,
        email: 'khaled@example.com',
        imageURL: 'https://i.pravatar.cc/150?img=11'
    },
    {
        id: crypto.randomUUID(),
        name: 'Anthony Galanakis',
        phone: '0541234567',    
        address: 'Jerusalem',
        age: 35,
        email: 'anthony@example.com',
        imageURL: 'https://i.pravatar.cc/150?img=12'
    },
    {
        id: crypto.randomUUID(),
        name: 'Levon Panoyan',
        phone: '0558765432',    
        address: 'Nazareth',
        age: 32,
        email: 'levon@example.com',
        imageURL: 'https://i.pravatar.cc/150?img=13'
    }

    ];

    /*
     * Cached DOM elements
     */
    const contactListEl = document.getElementById('contact-list');
    const contactsCountEl = document.getElementById('contacts-count');
    const searchInputEl = document.getElementById('search-input');
    const emptyMessageEl = document.getElementById('empty-message');
    const addContactBtn = document.getElementById('add-contact-btn');
    const deleteAllBtn = document.getElementById('delete-all-btn');
    const effectToggleBtn = document.getElementById('effect-toggle-btn');
    const sortBtn = document.getElementById('sort-btn');

    // Modals
    const detailsModal = document.getElementById('details-modal');
    const detailsBody = document.getElementById('details-body');
    const closeDetailsBtn = document.getElementById('close-details-btn');

    const formModal = document.getElementById('form-modal');
    const formTitleEl = document.getElementById('form-title');
    const contactForm = document.getElementById('contact-form');
    const closeFormBtn = document.getElementById('close-form-btn');
    const cancelContactBtn = document.getElementById('cancel-contact-btn');
    const saveContactBtn = document.getElementById('save-contact-btn');
    // Form inputs
    const nameInput = document.getElementById('contact-name');
    const phoneInput = document.getElementById('contact-phone');
    const emailInput = document.getElementById('contact-email');
    const addressInput = document.getElementById('contact-address');
    const ageInput = document.getElementById('contact-age');
    const imageInput = document.getElementById('contact-image');
    // Error message spans
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');

    // Keeps track of the contact currently being edited (null if adding)
    let editingContactId = null;
    // Holds the current search query
    let searchQuery = '';

    // Sort order flag: true for ascending (A→Z), false for descending (Z→A)
    let sortAscending = true;

    /**
     * Renders the contact list based on the contacts array and current search
     */
    function renderContacts() {
        // Filter by search query
        const filtered = contacts
            .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                // Sort by name according to sortAscending flag
                const cmp = a.name.localeCompare(b.name);
                return sortAscending ? cmp : -cmp;
            });

        // Update count label
        contactsCountEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'person' : 'people'}`;

        // Clear list
        contactListEl.innerHTML = '';

        if (filtered.length === 0) {
            emptyMessageEl.classList.remove('hidden');
        } else {
            emptyMessageEl.classList.add('hidden');
        }

        // Generate list items
        filtered.forEach(contact => {
            const li = document.createElement('li');
            li.className = 'contact-item';
            li.dataset.id = contact.id;

            // Left part: avatar, name and phone
            const leftDiv = document.createElement('div');
            leftDiv.className = 'contact-left';
            const img = document.createElement('img');
            img.className = 'contact-avatar';
            img.src = contact.imageURL || 'https://via.placeholder.com/150';
            img.alt = contact.name;
            const infoDiv = document.createElement('div');
            infoDiv.className = 'contact-info';
            const nameSpan = document.createElement('span');
            nameSpan.className = 'contact-name';
            nameSpan.textContent = contact.name;
            const phoneSpan = document.createElement('span');
            phoneSpan.className = 'contact-phone';
            phoneSpan.textContent = contact.phone;
            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(phoneSpan);
            leftDiv.appendChild(img);
            leftDiv.appendChild(infoDiv);

            // Right part: actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'contact-actions';
            // Info button
            const infoBtn = document.createElement('button');
            infoBtn.className = 'icon-btn info-btn';
            infoBtn.title = 'View details';
            // use unicode info symbol to avoid external libraries
            infoBtn.textContent = 'ℹ️';
            actionsDiv.appendChild(infoBtn);
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'icon-btn edit-btn';
            editBtn.title = 'Edit contact';
            editBtn.textContent = '✏️';
            actionsDiv.appendChild(editBtn);
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-btn delete-btn';
            deleteBtn.title = 'Delete contact';
            deleteBtn.textContent = '🗑️';
            actionsDiv.appendChild(deleteBtn);

            li.appendChild(leftDiv);
            li.appendChild(actionsDiv);
            contactListEl.appendChild(li);
        });
    }

    /**
     * Shows the details modal with information about a contact
     * Only non-empty fields are shown.
     * @param {Object} contact 
     */
    function showDetails(contact) {
        detailsBody.innerHTML = '';
        const fields = {
            Name: contact.name,
            Phone: contact.phone,
            Email: contact.email,
            Address: contact.address,
            Age: contact.age
        };
        for (const [label, value] of Object.entries(fields)) {
            if (value !== undefined && value !== null && value !== '') {
                const span = document.createElement('span');
                span.innerHTML = `<strong>${label}:</strong> ${value}`;
                detailsBody.appendChild(span);
            }
        }
        // Show modal
        detailsModal.classList.remove('hidden');
    }

    /**
     * Opens the form modal for adding or editing a contact
     * @param {('add'|'edit')} mode
     * @param {Object|null} contact 
     */
    function openForm(mode, contact) {
        if (mode === 'add') {
            formTitleEl.textContent = 'Add Contact';
            editingContactId = null;
            contactForm.reset();
        } else if (mode === 'edit' && contact) {
            formTitleEl.textContent = 'Edit Contact';
            editingContactId = contact.id;
            // Pre-fill fields
            nameInput.value = contact.name;
            phoneInput.value = contact.phone;
            emailInput.value = contact.email || '';
            addressInput.value = contact.address || '';
            ageInput.value = contact.age != null ? contact.age : '';
            imageInput.value = contact.imageURL || '';
        }
        // Reset error messages
        nameError.style.display = 'none';
        phoneError.style.display = 'none';
        // Show modal
        formModal.classList.remove('hidden');
    }

    /**
     * Hides both modals and resets any state
     */
    function closeModals() {
        detailsModal.classList.add('hidden');
        formModal.classList.add('hidden');
    }

    /**
     * Deletes a contact by id
     * @param {string} id 
     */
    function deleteContact(id) {
        contacts = contacts.filter(c => c.id !== id);
        renderContacts();
    }

    /**
     * Deletes all contacts
     */
    function deleteAllContacts() {
        if (!confirm('Are you sure you want to delete all contacts?')) {
            return;
        }
        contacts = [];
        renderContacts();
    }

    /**
     * Validates the contact form
     * Sets error messages and returns boolean
     */
    function validateForm() {
        let valid = true;
        // Name required
        if (!nameInput.value.trim()) {
            nameError.textContent = 'Name is required';
            nameError.style.display = 'block';
            valid = false;
        } else {
            nameError.style.display = 'none';
        }
        // Phone required and must match the required pattern: starts with 05 (8 digits) or 04 (7 digits)
        const phoneVal = phoneInput.value.trim();
        const phonePattern05 = /^05\d{8}$/;
        const phonePattern04 = /^04\d{7}$/;
        if (!phoneVal) {
            phoneError.textContent = 'Phone number is required';
            phoneError.style.display = 'block';
            valid = false;
        } else if (!phonePattern05.test(phoneVal) && !phonePattern04.test(phoneVal)) {
            phoneError.textContent = 'Phone must start with 05 (8 digits after) or 04 (7 digits after)';
            phoneError.style.display = 'block';
            valid = false;
        } else {
            phoneError.style.display = 'none';
        }
        return valid;
    }

    /**
     * Saves a new contact or updates an existing one
     * Prevents duplicates by name (case-insensitive). In edit mode
     * it allows the original name.
     */
    function saveContact(event) {
        event.preventDefault();
        if (!validateForm()) return;
        const newContact = {
            id: editingContactId || crypto.randomUUID(),
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            email: emailInput.value.trim(),
            address: addressInput.value.trim(),
            age: ageInput.value ? Number(ageInput.value) : undefined,
            imageURL: imageInput.value.trim()
        };
        // Duplicate check (case-insensitive)
        const duplicate = contacts.some(c => c.name.toLowerCase() === newContact.name.toLowerCase() && c.id !== editingContactId);
        if (duplicate) {
            alert('A contact with this name already exists. Please choose a different name.');
            return;
        }
        if (editingContactId) {
            contacts = contacts.map(c => (c.id === editingContactId ? newContact : c));
        } else {
            contacts.push(newContact);
        }
        // Reset form and hide
        contactForm.reset();
        editingContactId = null;
        formModal.classList.add('hidden');
        renderContacts();
    }

    /**
     * Event handler for clicks within the contact list
     * Uses event delegation
     */
    function handleContactListClick(event) {
        const actionBtn = event.target.closest('button');
        if (!actionBtn) return;
        const listItem = actionBtn.closest('.contact-item');
        if (!listItem) return;
        const contactId = listItem.dataset.id;
        const contact = contacts.find(c => c.id === contactId);
        if (!contact) return;
        if (actionBtn.classList.contains('info-btn')) {
            showDetails(contact);
        } else if (actionBtn.classList.contains('edit-btn')) {
            openForm('edit', contact);
        } else if (actionBtn.classList.contains('delete-btn')) {
            if (confirm(`Delete ${contact.name}?`)) {
                deleteContact(contactId);
            }
        }
    }

    /**
     * Event handler for hover over contact list items
     * Adds or removes the hovered class
     */
    function handleContactHover(event) {
        const listItem = event.target.closest('.contact-item');
        if (!listItem) return;
        if (event.type === 'mouseover') {
            listItem.classList.add('hovered');
        } else if (event.type === 'mouseout') {
            listItem.classList.remove('hovered');
        }
    }

    /**
     * Toggles the creative effect on the page by adding/removing
     * a class on the body. The CSS defines how the effect looks.
     */
    function toggleEffect() {
        document.body.classList.toggle('colorful');
    }

    // Initial render
    renderContacts();

    // Event listeners
    // Search input
    searchInputEl.addEventListener('input', function () {
        searchQuery = this.value;
        renderContacts();
    });
    // Add contact button
    addContactBtn.addEventListener('click', () => openForm('add'));
    // Delete all button
    deleteAllBtn.addEventListener('click', deleteAllContacts);
    // Close modals
    closeDetailsBtn.addEventListener('click', () => detailsModal.classList.add('hidden'));
    closeFormBtn.addEventListener('click', () => formModal.classList.add('hidden'));
    cancelContactBtn.addEventListener('click', () => formModal.classList.add('hidden'));
    // Save contact form
    contactForm.addEventListener('submit', saveContact);
    // Clicks inside contact list (event delegation)
    contactListEl.addEventListener('click', handleContactListClick);
    // Hover events on contact list
    contactListEl.addEventListener('mouseover', handleContactHover);
    contactListEl.addEventListener('mouseout', handleContactHover);
    // Toggle effect
    effectToggleBtn.addEventListener('click', toggleEffect);

    // Sort button toggles the sort order (ascending/descending)
    sortBtn.addEventListener('click', function () {
        sortAscending = !sortAscending;
        // Update the displayed arrow according to the sort order
        const arrowSpan = sortBtn.querySelector('span[aria-hidden="true"]');
        if (arrowSpan) {
            arrowSpan.textContent = sortAscending ? '⇅' : '⇵';
        }
        renderContacts();
    });
})();