script.js
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const contentAreas = document.querySelectorAll('.content-area');
    const sidebarItems = document.querySelectorAll('.sidebar ul li[data-tab]');
    const subTabContainers = document.querySelectorAll('.sub-tabs-container');
    const currentHeaderTitle = document.getElementById('current-header-title');
    const buildingSelect = document.getElementById('building-select');
    const languageSelect = document.getElementById('language-select');

    const userInfoTrigger = document.getElementById('user-info-trigger');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    const profileLinkDropdown = document.getElementById('profile-link-dropdown');
    const settingsLinkDropdown = document.getElementById('settings-link-dropdown');
    const headerLogoutLink = document.getElementById('header-logout-link');

    // Home page links
    const viewAllAnnouncementsLink = document.getElementById('view-all-announcements-link');
    const viewFullCalendarLink = document.getElementById('view-full-calendar-link');
    const postNewItemLink = document.getElementById('post-new-item-link');
    const exploreLocalResourcesLink = document.getElementById('explore-local-resources-link');


    // --- Core Navigation Functions ---

    /**
     * Shows a specific main content area and updates the header title and sidebar active state.
     * Manages ARIA attributes for accessibility.
     * @param {string} tabId - The ID of the main tab (e.g., 'home', 'amenities').
     * @param {string} [title=''] - The title to display in the header. If empty, it's derived from tabId.
     */
    function showTab(tabId, title = '') {
        // Hide all content areas
        contentAreas.forEach(content => {
            content.style.display = 'none';
        });

        // Show the selected main tab content
        const selectedTabContent = document.getElementById(`${tabId}-tab-content`);
        if (selectedTabContent) {
            selectedTabContent.style.display = 'flex';
            currentHeaderTitle.textContent = title || formatTabTitle(tabId);
        }

        // Remove active class and ARIA attributes from all main sidebar items and their sub-items
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            const subMenu = item.querySelector('ul');
            if (subMenu) {
                subMenu.style.display = 'none'; // Collapse all sub-menus
                item.setAttribute('aria-expanded', 'false');
                subMenu.querySelectorAll('li').forEach(subItem => {
                    subItem.classList.remove('active');
                    subItem.removeAttribute('aria-current');
                });
            }
        });

        // Add active class and ARIA attributes to the clicked main sidebar item
        const clickedSidebarItem = document.querySelector(`.sidebar ul li[data-tab="${tabId}"]`);
        if (clickedSidebarItem) {
            clickedSidebarItem.classList.add('active');
            clickedSidebarItem.setAttribute('aria-current', 'page');
            const subMenu = clickedSidebarItem.querySelector('ul');
            if (subMenu) {
                subMenu.style.display = 'block'; // Show its sub-menu
                clickedSidebarItem.setAttribute('aria-expanded', 'true');
            }
        }

        // Manage sub-tabs container visibility and active state for the current main tab
        const currentSubTabsContainer = selectedTabContent ? selectedTabContent.querySelector('.sub-tabs-container') : null;
        if (currentSubTabsContainer) {
            currentSubTabsContainer.style.display = 'flex'; // Show sub-tabs container
            currentSubTabsContainer.querySelectorAll('.sub-tab').forEach(subTab => {
                subTab.classList.remove('active');
                subTab.setAttribute('aria-selected', 'false');
            });

            // Activate the first sub-tab by default if it exists
            const firstSubTab = currentSubTabsContainer.querySelector('.sub-tab');
            if (firstSubTab) {
                firstSubTab.classList.add('active');
                firstSubTab.setAttribute('aria-selected', 'true');
                // Call the specific sub-tab handler for the first sub-tab
                const parentTab = firstSubTab.closest('.content-area').id.replace('-tab-content', '');
                const subTabId = firstSubTab.dataset.subTab;
                if (parentTab === 'amenities') {
                    showAmenityTab(subTabId);
                } else if (parentTab === 'reservations') {
                    showReservationTab(subTabId);
                } else if (parentTab === 'service-requests') {
                    showServiceRequestTab(subTabId);
                }
            }
        } else {
            // If no sub-tabs, hide all sub-tab content divs for this main tab
            selectedTabContent.querySelectorAll('[id$="-sub-tab-content"]').forEach(subContent => {
                subContent.style.display = 'none';
            });
        }

        // Specific actions for each main tab on initial load or switch
        if (tabId === 'resident-management') {
            populateResidentList(); // Ensure resident list is refreshed
        }
        // Hide AI suggestion bar when switching tabs
        hideAiSuggestion();
    }

    /**
     * Shows a specific sub-tab content area within a parent tab and updates ARIA attributes.
     * @param {string} parentTabId - The ID of the parent main tab (e.g., 'amenities', 'reservations').
     * @param {string} subTabId - The ID of the sub-tab (e.g., 'amenity-list', 'pending-reservations').
     */
    function showSubTab(parentTabId, subTabId) {
        const parentContent = document.getElementById(`${parentTabId}-tab-content`);
        if (!parentContent) return;

        // Hide all sub-tab contents within this parent
        parentContent.querySelectorAll('[id$="-sub-tab-content"]').forEach(content => {
            content.style.display = 'none';
        });

        // Show the selected sub-tab content
        const selectedSubTabContent = document.getElementById(`${subTabId}-sub-tab-content`);
        if (selectedSubTabContent) {
            selectedSubTabContent.style.display = 'flex';
        }

        // Update active class and ARIA attributes for sub-tabs in the sub-tabs-container
        parentContent.querySelectorAll('.sub-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        const selectedSubTab = parentContent.querySelector(`.sub-tab[data-sub-tab="${subTabId}"]`);
        if (selectedSubTab) {
            selectedSubTab.classList.add('active');
            selectedSubTab.setAttribute('aria-selected', 'true');
        }

        // Ensure the parent sidebar item is active and expanded
        sidebarItems.forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            const subMenu = item.querySelector('ul');
            if (subMenu) {
                subMenu.style.display = 'none';
                item.setAttribute('aria-expanded', 'false');
                subMenu.querySelectorAll('li').forEach(li => {
                    li.classList.remove('active');
                    li.removeAttribute('aria-current');
                });
            }
        });

        const mainSidebarItem = document.querySelector(`.sidebar ul li[data-tab="${parentTabId}"]`);
        if (mainSidebarItem) {
            mainSidebarItem.classList.add('active');
            mainSidebarItem.setAttribute('aria-current', 'page'); // Parent is current page
            const mainSubMenu = mainSidebarItem.querySelector('ul');
            if (mainSubMenu) {
                mainSubMenu.style.display = 'block';
                mainSidebarItem.setAttribute('aria-expanded', 'true');
                const specificSubMenuItem = mainSubMenu.querySelector(`li[data-sub-tab="${subTabId}"]`);
                if (specificSubMenuItem) {
                    specificSubMenuItem.classList.add('active');
                    specificSubMenuItem.setAttribute('aria-current', 'page'); // Sub-tab is also current page
                }
            }
        }

        // Set the header title based on the sub-tab
        currentHeaderTitle.textContent = formatTabTitle(subTabId);

        // Specific actions for each sub-tab
        if (parentTabId === 'amenities') {
            showAmenityTab(subTabId);
        } else if (parentTabId === 'reservations') {
            showReservationTab(subTabId);
        } else if (parentTabId === 'service-requests') {
            showServiceRequestTab(subTabId);
        }
    }

    /**
     * Formats a tab ID into a human-readable title.
     * @param {string} tabId - The ID of the tab.
     * @returns {string} The formatted title.
     */
    function formatTabTitle(tabId) {
        return tabId.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }

    // --- Event Listeners and Initial Setup ---

    // Initial setup
    showTab('home', 'Dashboard'); // Default to home tab
    loadTheme(); // Load theme preference
    populateAmenityListManagement(); // Populate amenities on load
    populateAmenityRulesSelect(); // Populate amenity rules select
    loadAmenityRules(); // Load existing amenity rules
    populateNonBookableAmenitiesList(); // Populate non-bookable amenities
    loadAutoApprovalSettings(); // Load auto-approval settings
    populateResidentList(); // Populate resident list

    // Hamburger menu toggle
    hamburgerMenu.addEventListener('click', () => {
        console.log("Hamburger menu clicked!"); // Debugging log
        sidebar.classList.toggle('active');
        // Toggle aria-expanded for accessibility
        const isExpanded = sidebar.classList.contains('active');
        hamburgerMenu.setAttribute('aria-expanded', isExpanded);
        // Toggle 'sidebar-active' class on main content
        document.querySelector('.main').classList.toggle('sidebar-active', isExpanded);
    });

    // Close sidebar if clicked outside on mobile
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 992 && sidebar.classList.contains('active') &&
            !sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            sidebar.classList.remove('active');
            hamburgerMenu.setAttribute('aria-expanded', 'false');
            document.querySelector('.main').classList.remove('sidebar-active'); // Ensure main reverts
        }
    });


    // Sidebar tab switching (main tabs and sub-tabs)
    sidebarItems.forEach(item => {
        item.addEventListener('click', (event) => {
            const tab = item.dataset.tab;
            const subTabClicked = event.target.closest('li[data-sub-tab]');

            if (subTabClicked) {
                const subTab = subTabClicked.dataset.subTab;
                showSubTab(tab, subTab);
            } else {
                // If a main tab is clicked, toggle its sub-menu visibility
                const subMenu = item.querySelector('ul');
                if (subMenu) {
                    const isExpanded = item.getAttribute('aria-expanded') === 'true';
                    // If clicking a main tab that has a submenu, always expand it and show its first sub-tab
                    if (!isExpanded) {
                        item.setAttribute('aria-expanded', 'true');
                        subMenu.style.display = 'block';
                        // Automatically click the first sub-tab if it exists
                        const firstSubTabItem = subMenu.querySelector('li[data-sub-tab]');
                        if (firstSubTabItem) {
                            firstSubTabItem.click(); // Programmatically click to activate
                        }
                    } else {
                        // If already expanded, collapse it
                        item.setAttribute('aria-expanded', 'false');
                        subMenu.style.display = 'none';
                    }
                }
                showTab(tab); // Always show the main tab content
            }
        });

        // Keyboard navigation for main sidebar items
        item.addEventListener('keydown', (event) => {
            const currentItem = event.target;
            const parentUl = currentItem.closest('ul');
            const menuItems = Array.from(parentUl.children).filter(li => li.getAttribute('role') === 'menuitem');
            const currentIndex = menuItems.indexOf(currentItem);

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextItem = menuItems[currentIndex + 1];
                if (nextItem) {
                    nextItem.focus();
                } else {
                    // Loop to first item
                    menuItems[0].focus();
                }
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const prevItem = menuItems[currentIndex - 1];
                if (prevItem) {
                    prevItem.focus();
                } else {
                    // Loop to last item
                    menuItems[menuItems.length - 1].focus();
                }
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                currentItem.click(); // Simulate click for activation
            }
        });
    });

    // Sub-tab switching (for Amenity, Reservation, Service Request tabs)
    subTabContainers.forEach(container => {
        container.addEventListener('click', (event) => {
            if (event.target.classList.contains('sub-tab')) {
                const parentTab = event.target.closest('.content-area').id.replace('-tab-content', '');
                const subTab = event.target.dataset.subTab;
                showSubTab(parentTab, subTab);
            }
        });

        // Keyboard navigation for sub-tabs (horizontal navigation)
        container.addEventListener('keydown', (event) => {
            const currentTab = event.target;
            if (!currentTab.classList.contains('sub-tab')) return;

            const tabList = Array.from(container.querySelectorAll('.sub-tab'));
            const currentIndex = tabList.indexOf(currentTab);

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                const nextTab = tabList[currentIndex + 1];
                if (nextTab) {
                    nextTab.focus();
                    nextTab.click(); // Activate on focus for horizontal tabs
                } else {
                    tabList[0].focus(); // Loop to first
                    tabList[0].click();
                }
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                const prevTab = tabList[currentIndex - 1];
                if (prevTab) {
                    prevTab.focus();
                    prevTab.click(); // Activate on focus for horizontal tabs
                } else {
                    tabList[tabList.length - 1].focus(); // Loop to last
                    tabList[tabList.length - 1].click();
                }
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                currentTab.click(); // Activate on Enter/Space
            }
        });
    });


    /**
     * Loads the theme preference from local storage and applies it.
     */
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        // Assuming there's a theme toggle checkbox, set its state
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton && savedTheme === 'dark') {
            themeToggleButton.checked = true;
        }
    }

    // Building and Language select functionality
    buildingSelect.addEventListener('change', (event) => {
        console.log('Selected Building:', event.target.value);
        // Implement logic to switch building context
    });

    languageSelect.addEventListener('change', (event) => {
        console.log('Selected Language:', event.target.value);
        // Implement logic to change language
    });

    // User Info Dropdown (Profile/Logout)
    userInfoTrigger.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from immediately closing the dropdown
        const isExpanded = userDropdownMenu.style.display === 'block';
        userDropdownMenu.style.display = isExpanded ? 'none' : 'block';
        userInfoTrigger.setAttribute('aria-expanded', !isExpanded);
    });

    // Close dropdown if clicked outside
    document.addEventListener('click', (event) => {
        if (!userDropdownMenu.contains(event.target) && !userInfoTrigger.contains(event.target)) {
            userDropdownMenu.style.display = 'none';
            userInfoTrigger.setAttribute('aria-expanded', 'false');
        }
    });

    profileLinkDropdown.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Profile clicked!'); // Replace with actual profile page navigation
        showTab('settings', 'User Profile'); // Example: navigate to a generic settings page
        userDropdownMenu.style.display = 'none';
        userInfoTrigger.setAttribute('aria-expanded', 'false');
    });

    headerLogoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Logout clicked!'); // Replace with actual logout logic
        // Example: Redirect to login page or clear session
        // window.location.href = '/login';
        userDropdownMenu.style.display = 'none';
        userInfoTrigger.setAttribute('aria-expanded', 'false');
    });

    // --- Home Page Link Event Listeners ---
    if (viewAllAnnouncementsLink) {
        viewAllAnnouncementsLink.addEventListener('click', (e) => {
            e.preventDefault();
            showTab('announcements', 'Announcements');
        });
    }

    if (viewFullCalendarLink) {
        viewFullCalendarLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Link to Announcements as the closest available tab for events/calendar
            showTab('announcements', 'Announcements');
            console.log('View Full Calendar clicked - linked to Announcements tab.');
        });
    }

    if (postNewItemLink) {
        postNewItemLink.addEventListener('click', (e) => {
            e.preventDefault();
            // There's no specific 'bulletin-board' tab, so link to Announcements or a more relevant section.
            // For now, let's link to Announcements as it's related to notices.
            showTab('announcements', 'Announcements');
            console.log('Post New Item clicked - linked to Announcements tab.');
        });
    }

    if (exploreLocalResourcesLink) {
        exploreLocalResourcesLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Link to Home as a fallback, or consider adding a dedicated "Local Resources" tab
            showTab('home', 'Dashboard');
            console.log('Explore More Local Resources clicked - linked to Dashboard tab.');
        });
    }


    // --- Dummy Data (In a real application, this would come from a backend API) ---
    let bookableAmenities = [
        { id: 'basketball', name: 'Basketball Court', description: 'Outdoor court for basketball.', capacity: 10, imageUrl: '', iconClass: 'uil uil-basketball' },
        { id: 'tennis', name: 'Tennis Court', description: 'Outdoor court for tennis.', capacity: 4, imageUrl: '', iconClass: 'uil uil-tennis-ball' },
        { id: 'table-tennis', name: 'Table Tennis Room', description: 'Indoor room with ping pong tables.', capacity: 8, imageUrl: '', iconClass: 'uil uil-table-tennis' },
        { id: 'squash', name: 'Squash Court', description: 'Indoor court for squash.', capacity: 2, imageUrl: '', iconClass: '' },
        { id: 'snooker-pool', name: 'Snooker/Pool Table', description: 'Recreation room with snooker and pool tables.', capacity: 6, imageUrl: '', iconClass: 'uil uil-bill' },
        { id: 'party-room', name: 'Party Room', description: 'Versatile space for private events.', capacity: 50, imageUrl: '', iconClass: 'uil uil-glass-martini' },
        { id: 'guest-suite', name: 'Guest Suite', description: 'Private suite for overnight guests.', capacity: 2, imageUrl: '', iconClass: 'uil uil-bed' },
        { id: 'swimming-pool', name: 'Swimming Pool', description: 'Large outdoor pool with lifeguard', capacity: 50, imageUrl: 'http://googleusercontent.com/img/pool_amenity.jpg', iconClass: 'uil uil-swimmer' },
        { id: 'sauna', name: 'Sauna', description: 'Relaxing dry heat sauna.', capacity: 4, imageUrl: '', iconClass: 'uil uil-temperature-half' },
        { id: 'spa', name: 'Spa', description: 'Full-service spa for relaxation.', capacity: 8, imageUrl: '', iconClass: 'uil uil-spa' },
        { id: 'jacuzzi', name: 'Jacuzzi', description: 'Hot tub for relaxation.', capacity: 6, imageUrl: '', iconClass: '' },
        { id: 'bbq-area', name: 'BBQ Area', description: 'Outdoor grilling stations with seating.', capacity: 20, imageUrl: '', iconClass: 'uil uil-fire' },
        { id: 'party-hall', name: 'Party Hall', description: 'Large hall for major events, with specific capacity.', capacity: 100, imageUrl: '', iconClass: 'uil uil-users-alt' }
    ];

    let nonBookableAmenities = [
        { id: 'children-park', name: 'Children Park', description: 'Outdoor play area for children.', iconClass: 'uil uil-trees' },
        { id: 'dog-park', name: 'Dog Park', description: 'Fenced area for dogs to play.', iconClass: 'uil uil-dog' }
    ];

    let amenities = [...bookableAmenities]; // Main array for managing bookable amenities
    let amenityRules = JSON.parse(localStorage.getItem('amenityRules')) || {};
    let autoApprovalSettings = JSON.parse(localStorage.getItem('autoApprovalSettings')) || {};

    let reservations = [
        { id: 'res001', amenityId: 'swimming-pool', resident: 'Alice Smith', unit: '101', date: '2025-07-15', time: '10:00-11:00', status: 'requested' },
        { id: 'res002', amenityId: 'gym', resident: 'Bob Johnson', unit: '203', date: '2025-07-16', time: '14:00-15:00', status: 'approved' },
        { id: 'res003', amenityId: 'party-room', resident: 'Charlie Brown', unit: '305', date: '2025-07-20', time: '18:00-22:00', status: 'denied' },
        { id: 'res004', amenityId: 'basketball', resident: 'Diana Prince', unit: '402', date: '2025-07-18', time: '09:00-10:00', status: 'requested' },
        { id: 'res005', amenityId: 'tennis', resident: 'Clark Kent', unit: '501', date: '2025-07-22', time: '11:00-12:00', status: 'approved' },
    ];

    let serviceRequests = [
        { id: 'SR001', resident: 'Alice Smith', unit: '101', issue: 'Leaky Faucet', status: 'active', submittedDate: '2025-07-01', completionDate: '' },
        { id: 'SR002', resident: 'Bob Johnson', unit: '203', issue: 'Broken A/C', status: 'active', submittedDate: '2025-07-03', completionDate: '' },
        { id: 'SR003', resident: 'Charlie Brown', unit: '305', issue: 'Lobby Light Out', status: 'completed', submittedDate: '2025-06-25', completionDate: '2025-06-27' },
        { id: 'SR004', resident: 'Diana Prince', unit: '402', issue: 'Elevator Malfunction', status: 'active', submittedDate: '2025-07-05', completionDate: '' },
        { id: 'SR005', resident: 'Clark Kent', unit: '501', issue: 'Gym Equipment Repair', status: 'completed', submittedDate: '2025-06-20', completionDate: '2025-06-22' }
    ];

    let residents = [
        { id: 'R001', name: 'Alice Smith', unit: '101', email: 'alice@example.com', phone: '111-222-3333', moveInDate: '2023-01-15' },
        { id: 'R002', name: 'Bob Johnson', unit: '203', email: 'bob@example.com', phone: '444-555-6666', moveInDate: '2022-05-20' },
        { id: 'R003', name: 'Charlie Brown', unit: '305', email: 'charlie@example.com', phone: '777-888-9999', moveInDate: '2024-03-10' },
        { id: 'R004', name: 'Diana Prince', unit: '402', email: 'diana@example.com', phone: '123-456-7890', moveInDate: '2023-08-01' },
        { id: 'R005', name: 'Clark Kent', unit: '501', email: 'clark@example.com', phone: '987-654-3210', moveInDate: '2022-11-11' },
    ];


    // --- Amenity Management Functions ---
    const addAmenityModal = document.getElementById('addAmenityModal');
    const editAmenityModal = document.getElementById('editAmenityModal');
    const addAmenityButton = document.getElementById('add-amenity-button');
    const amenityManagementList = document.getElementById('amenity-management-list');

    // Modal close buttons
    document.getElementById('close-add-amenity-modal-btn').addEventListener('click', () => closeAddAmenityModal());
    document.getElementById('close-edit-amenity-modal-btn').addEventListener('click', () => closeEditAmenityModal());
    document.getElementById('close-add-resident-modal-btn').addEventListener('click', () => closeAddResidentModal());

    // Add Amenity Modal buttons
    addAmenityButton.addEventListener('click', () => {
        addAmenityModal.style.display = 'flex';
        addAmenityModal.setAttribute('aria-hidden', 'false');
        document.getElementById('amenity-name').focus(); // Focus first input in modal
    });
    document.getElementById('add-amenity-submit-btn').addEventListener('click', () => addAmenity());
    document.getElementById('cancel-add-amenity-btn').addEventListener('click', () => closeAddAmenityModal());


    window.closeAddAmenityModal = () => {
        addAmenityModal.style.display = 'none';
        addAmenityModal.setAttribute('aria-hidden', 'true');
        // Clear form
        document.getElementById('amenity-name').value = '';
        document.getElementById('amenity-description').value = '';
        document.getElementById('amenity-capacity').value = '';
        document.getElementById('amenity-image-url').value = '';
        document.getElementById('amenity-icon-class').value = '';
    };

    window.addAmenity = () => {
        const name = document.getElementById('amenity-name').value;
        const description = document.getElementById('amenity-description').value;
        const capacity = parseInt(document.getElementById('amenity-capacity').value);
        const imageUrl = document.getElementById('amenity-image-url').value;
        const iconClass = document.getElementById('amenity-icon-class').value;

        if (!name || isNaN(capacity) || capacity < 1) {
            console.error('Amenity Name and Capacity (must be a positive number) are required.');
            return;
        }

        const newAmenity = {
            id: name.toLowerCase().replace(/\s/g, '-'), // Simple ID generation
            name,
            description,
            capacity,
            imageUrl,
            iconClass
        };

        amenities.push(newAmenity);
        populateAmenityListManagement();
        populateAmenityRulesSelect(); // Update rules dropdown
        closeAddAmenityModal();
        console.log('Amenity added successfully!');
    };

    // Edit Amenity Modal buttons
    document.getElementById('save-amenity-changes-btn').addEventListener('click', () => saveAmenityChanges());
    document.getElementById('cancel-edit-amenity-btn').addEventListener('click', () => closeEditAmenityModal());

    window.openEditAmenityModal = (id) => {
        const amenity = amenities.find(a => a.id === id);
        if (amenity) {
            document.getElementById('edit-amenity-id').value = amenity.id;
            document.getElementById('edit-amenity-name').value = amenity.name;
            document.getElementById('edit-amenity-description').value = amenity.description;
            document.getElementById('edit-amenity-capacity').value = amenity.capacity;
            document.getElementById('edit-amenity-image-url').value = amenity.imageUrl;
            document.getElementById('edit-amenity-icon-class').value = amenity.iconClass;
            editAmenityModal.style.display = 'flex';
            editAmenityModal.setAttribute('aria-hidden', 'false');
            document.getElementById('edit-amenity-name').focus(); // Focus first input
        }
    };

    window.closeEditAmenityModal = () => {
        editAmenityModal.style.display = 'none';
        editAmenityModal.setAttribute('aria-hidden', 'true');
    };

    window.saveAmenityChanges = () => {
        const id = document.getElementById('edit-amenity-id').value;
        const amenity = amenities.find(a => a.id === id);
        if (amenity) {
            amenity.name = document.getElementById('edit-amenity-name').value;
            amenity.description = document.getElementById('edit-amenity-description').value;
            amenity.capacity = parseInt(document.getElementById('edit-amenity-capacity').value);
            amenity.imageUrl = document.getElementById('edit-amenity-image-url').value;
            amenity.iconClass = document.getElementById('edit-amenity-icon-class').value;

            if (!amenity.name || isNaN(amenity.capacity) || amenity.capacity < 1) {
                console.error('Amenity Name and Capacity (must be a positive number) are required.');
                return;
            }

            populateAmenityListManagement();
            populateAmenityRulesSelect(); // Update rules dropdown
            closeEditAmenityModal();
            console.log('Amenity changes saved successfully!');
        }
    };

    // Event delegation for amenity list buttons (Edit, Delete)
    amenityManagementList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.tagName === 'BUTTON') {
            const amenityId = target.closest('.list-item').dataset.id; // Get ID from the list-item
            if (target.classList.contains('edit-amenity-btn')) {
                openEditAmenityModal(amenityId);
            } else if (target.classList.contains('delete-amenity-btn')) {
                deleteAmenity(amenityId);
            }
        }
    });

    window.deleteAmenity = (id) => {
        console.log('Confirm deletion of amenity:', id);
        if (true) { // Simulate confirmation for now
            amenities = amenities.filter(a => a.id !== id);
            populateAmenityListManagement();
            populateAmenityRulesSelect(); // Update rules dropdown
            console.log('Amenity deleted successfully!');
        }
    };

    function populateAmenityListManagement() {
        amenityManagementList.innerHTML = '';
        if (amenities.length === 0) {
            amenityManagementList.innerHTML = '<p style="text-align: center; color: #777;">No amenities added yet. Click "Add New Amenity" to get started.</p>';
            return;
        }
        amenities.forEach(amenity => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.dataset.id = amenity.id; // Add data-id for event delegation
            item.innerHTML = `
                <div class="item-details">
                    <h4>${amenity.iconClass ? `<i class="${amenity.iconClass}" aria-hidden="true" style="margin-right: 8px;"></i>` : ''}${amenity.name}</h4>
                    <p>${amenity.description || 'No description provided.'}</p>
                    <small>Capacity: ${amenity.capacity} people</small>
                </div>
                <div class="item-actions">
                    <button class="edit-amenity-btn">Edit</button>
                    <button class="delete-amenity-btn">Delete</button>
                </div>
            `;
            amenityManagementList.appendChild(item);
        });
    }

    // AI Suggestion Logic
    const aiSuggestionBar = document.getElementById('ai-suggestion-bar');
    const aiSuggestionButton = document.getElementById('ai-suggestion-button');

    aiSuggestionButton.addEventListener('click', () => {
        aiSuggestionBar.classList.toggle('show');
        if (aiSuggestionBar.classList.contains('show')) {
            aiSuggestionBar.setAttribute('aria-live', 'polite');
        } else {
            aiSuggestionBar.removeAttribute('aria-live');
        }
    });

    const aiSuggestionActionButton = document.getElementById('ai-suggestion-action-btn');
    if (aiSuggestionActionButton) {
        aiSuggestionActionButton.addEventListener('click', () => {
            console.log('AI Action triggered: Adding Co-working Space!');
            hideAiSuggestion();

            addAmenityModal.style.display = 'flex';
            addAmenityModal.setAttribute('aria-hidden', 'false');

            document.getElementById('amenity-name').value = 'Co-working Space';
            document.getElementById('amenity-capacity').value = '20';
            document.getElementById('amenity-description').value = 'Modern co-working space with high-speed internet and comfortable seating.';
            document.getElementById('amenity-icon-class').value = 'uil uil-laptop';

            document.getElementById('amenity-name').focus();
        });
    }

    function hideAiSuggestion() {
        if (aiSuggestionBar) {
            aiSuggestionBar.classList.remove('show');
            aiSuggestionBar.removeAttribute('aria-live');
        }
    }


    // Amenity Rules Logic
    const ruleAmenitySelect = document.getElementById('rule-amenity-select');
    const allowFriendsToggle = document.getElementById('allow-friends-toggle');
    const timingRestrictionsInput = document.getElementById('timing-restrictions');
    const saveAmenityRulesButton = document.getElementById('save-amenity-rules-btn');
    const currentAmenityRulesList = document.getElementById('current-amenity-rules-list');

    function populateAmenityRulesSelect() {
        ruleAmenitySelect.innerHTML = '<option value="">-- Select an Amenity --</option>';
        bookableAmenities.forEach(amenity => {
            const option = document.createElement('option');
            option.value = amenity.id;
            option.textContent = amenity.name;
            ruleAmenitySelect.appendChild(option);
        });
    }

    ruleAmenitySelect.addEventListener('change', (event) => {
        const selectedAmenityId = event.target.value;
        const rules = amenityRules[selectedAmenityId] || { allowFriends: false, timing: '' };
        allowFriendsToggle.checked = rules.allowFriends;
        timingRestrictionsInput.value = rules.timing;
    });

    saveAmenityRulesButton.addEventListener('click', () => {
        const selectedAmenityId = ruleAmenitySelect.value;
        if (!selectedAmenityId) {
            console.error('Please select an amenity to save rules for.');
            return;
        }
        amenityRules[selectedAmenityId] = {
            allowFriends: allowFriendsToggle.checked,
            timing: timingRestrictionsInput.value
        };
        localStorage.setItem('amenityRules', JSON.stringify(amenityRules));
        console.log('Amenity rules saved successfully!');
        loadAmenityRules();
    });

    function loadAmenityRules() {
        currentAmenityRulesList.innerHTML = '';
        if (Object.keys(amenityRules).length === 0) {
            currentAmenityRulesList.innerHTML = '<p>No rules set yet.</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.marginTop = '1rem';

        for (const id in amenityRules) {
            const amenity = bookableAmenities.find(a => a.id === id);
            if (amenity) {
                const li = document.createElement('li');
                li.style.marginBottom = '0.8rem';
                li.style.paddingBottom = '0.8rem';
                li.style.borderBottom = '1px dashed var(--border-color)';
                li.innerHTML = `
                    <strong>${amenity.name}:</strong><br>
                    Allow Friends/Guests: ${amenityRules[id].allowFriends ? 'Yes' : 'No'}<br>
                    Timing Restrictions: ${amenityRules[id].timing || 'None'}
                `;
                ul.appendChild(li);
            }
        }
        currentAmenityRulesList.appendChild(ul);
    }

    function populateNonBookableAmenitiesList() {
        const nonBookableList = document.getElementById('non-bookable-amenities-list');
        nonBookableList.innerHTML = '';
        if (nonBookableAmenities.length === 0) {
            nonBookableList.innerHTML = '<li>No open access amenities listed.</li>';
            return;
        }
        nonBookableAmenities.forEach(amenity => {
            const listItem = document.createElement('li');
            listItem.textContent = amenity.name;
            if (amenity.iconClass) {
                const icon = document.createElement('i');
                icon.className = `${amenity.iconClass} icon`;
                icon.setAttribute('aria-hidden', 'true');
                icon.style.marginRight = '8px';
                listItem.prepend(icon);
            }
            nonBookableList.appendChild(listItem);
        });
    }

    // Auto Approval Settings
    const autoApprovalSettingsList = document.getElementById('auto-approval-settings-list');
    const saveAutoApprovalSettingsButton = document.getElementById('save-auto-approval-settings');
    const cancelAutoApprovalSettingsButton = document.getElementById('cancel-auto-approval-settings');

    saveAutoApprovalSettingsButton.addEventListener('click', () => {
        localStorage.setItem('autoApprovalSettings', JSON.stringify(autoApprovalSettings));
        console.log('Auto-approval settings saved!');
    });

    cancelAutoApprovalSettingsButton.addEventListener('click', () => {
        loadAutoApprovalSettings();
        showAmenitySettings();
    });

    function showAmenityTab(subTabId) {
        document.querySelectorAll('#amenities-tab-content > .amenities-page-content').forEach(div => {
            div.style.display = 'none';
        });

        document.getElementById(`${subTabId}-sub-tab-content`).style.display = 'flex';

        if (subTabId === 'amenity-list') {
            populateAmenityListManagement();
        } else if (subTabId === 'amenity-rules') {
            populateAmenityRulesSelect();
            loadAmenityRules();
            populateNonBookableAmenitiesList();
        } else if (subTabId === 'amenity-settings') {
            showAmenitySettings();
        }
    }

    function showAmenitySettings() {
        autoApprovalSettingsList.innerHTML = '';

        if (amenities.length === 0) {
            autoApprovalSettingsList.innerHTML = '<p style="text-align: center; color: #777;">No amenities to configure auto-approval for.</p>';
            return;
        }

        amenities.forEach(amenity => {
            if (autoApprovalSettings[amenity.id] === undefined) {
                autoApprovalSettings[amenity.id] = false;
            }

            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <div class="item-details">
                    <h4>${amenity.name}</h4>
                    <p>Auto-approve reservations for this amenity?</p>
                </div>
                <div class="item-actions">
                    <label class="switch">
                        <input type="checkbox" id="auto-approve-${amenity.id}" data-amenity-id="${amenity.id}" ${autoApprovalSettings[amenity.id] ? 'checked' : ''} aria-label="Toggle auto-approval for ${amenity.name}">
                        <span class="slider round"></span>
                    </label>
                </div>
            `;
            autoApprovalSettingsList.appendChild(item);
        });

        autoApprovalSettingsList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const amenityId = event.target.dataset.amenityId;
                autoApprovalSettings[amenityId] = event.target.checked;
            });
        });
    }

    // Reservation Management Functions
    const pendingReservationsTableBody = document.getElementById('pending-reservations-table-body');
    const allReservationsTableBody = document.getElementById('all-reservations-table-body');

    // Event delegation for pending reservations table
    pendingReservationsTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const reservationId = row.dataset.id;

        if (target.classList.contains('approve')) {
            updateReservationStatus(reservationId, 'approved');
        } else if (target.classList.contains('deny')) {
            updateReservationStatus(reservationId, 'denied');
        }
    });

    // Event delegation for all reservations table
    allReservationsTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const reservationId = row.dataset.id;

        if (target.classList.contains('view')) {
            viewReservationDetails(reservationId);
        }
    });

    function showReservationTab(subTabId) {
        document.getElementById('pending-reservations-sub-tab-content').style.display = 'none';
        document.getElementById('all-reservations-sub-tab-content').style.display = 'none';

        if (subTabId === 'pending-reservations') {
            document.getElementById('pending-reservations-sub-tab-content').style.display = 'flex';
            populatePendingReservations();
        } else if (subTabId === 'all-reservations') {
            document.getElementById('all-reservations-sub-tab-content').style.display = 'flex';
            populateAllReservations();
        }
    }

    function getAmenityNameById(id) {
        const amenity = amenities.find(a => a.id === id);
        return amenity ? amenity.name : 'Unknown Amenity';
    }

    function populatePendingReservations() {
        pendingReservationsTableBody.innerHTML = '';
        const pending = reservations.filter(res => res.status === 'requested');

        if (pending.length === 0) {
            pendingReservationsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No pending reservations.</td></tr>';
            return;
        }

        pending.forEach(res => {
            const row = document.createElement('tr');
            row.dataset.id = res.id; // Add data-id for event delegation
            row.innerHTML = `
                <td>${getAmenityNameById(res.amenityId)}</td>
                <td>${res.resident}</td>
                <td>${res.date}</td>
                <td>${res.time}</td>
                <td><span class="status-requested">${res.status.charAt(0).toUpperCase() + res.status.slice(1)}</span></td>
                <td class="action-buttons">
                    <button class="approve">Approve</button>
                    <button class="deny">Deny</button>
                </td>
            `;
            pendingReservationsTableBody.appendChild(row);
        });
    }

    function populateAllReservations() {
        allReservationsTableBody.innerHTML = '';
        if (reservations.length === 0) {
            allReservationsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No reservations history.</td></tr>';
            return;
        }

        reservations.forEach(res => {
            const row = document.createElement('tr');
            row.dataset.id = res.id; // Add data-id for event delegation
            const statusClass = `status-${res.status}`;
            row.innerHTML = `
                <td>${getAmenityNameById(res.amenityId)}</td>
                <td>${res.resident}</td>
                <td>${res.date}</td>
                <td>${res.time}</td>
                <td><span class="${statusClass}">${res.status.charAt(0).toUpperCase() + res.status.slice(1)}</span></td>
                <td class="action-buttons">
                    <button class="view">View</button>
                </td>
            `;
            allReservationsTableBody.appendChild(row);
        });
    }

    window.updateReservationStatus = (id, newStatus) => {
        const index = reservations.findIndex(res => res.id === id);
        if (index !== -1) {
            reservations[index].status = newStatus;
            populatePendingReservations();
            populateAllReservations();
            console.log(`Reservation ${id} ${newStatus}!`);
        }
    };

    window.viewReservationDetails = (id) => {
        const reservation = reservations.find(res => res.id === id);
        if (reservation) {
            console.log(`Reservation Details:\nAmenity: ${getAmenityNameById(reservation.amenityId)}\nResident: ${reservation.resident}\nUnit: ${reservation.unit}\nDate: ${reservation.date}\nTime: ${reservation.time}\nStatus: ${reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}`);
        }
    };


    // Service Request Functions
    const activeServiceRequestsTableBody = document.getElementById('active-service-requests-table-body');
    const completedServiceRequestsTableBody = document.getElementById('completed-service-requests-table-body');

    // Event delegation for active service requests table
    activeServiceRequestsTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const requestId = row.dataset.id;

        if (target.classList.contains('approve')) { // 'approve' class used for 'Complete' action
            completeServiceRequest(requestId);
        } else if (target.classList.contains('deny')) { // 'deny' class used for 'Cancel' action
            cancelServiceRequest(requestId);
        } else if (target.classList.contains('view')) {
            viewServiceRequestDetails(requestId);
        }
    });

    function showServiceRequestTab(subTabId) {
        document.getElementById('active-requests-sub-tab-content').style.display = 'none';
        document.getElementById('completed-requests-sub-tab-content').style.display = 'none';

        if (subTabId === 'active-requests') {
            document.getElementById('active-requests-sub-tab-content').style.display = 'flex';
            populateActiveServiceRequests();
        } else if (subTabId === 'completed-requests') {
            document.getElementById('completed-requests-sub-tab-content').style.display = 'flex';
            populateCompletedServiceRequests();
        }
    }

    function populateActiveServiceRequests() {
        activeServiceRequestsTableBody.innerHTML = '';
        const activeRequests = serviceRequests.filter(req => req.status === 'active');

        if (activeRequests.length === 0) {
            activeServiceRequestsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No active service requests.</td></tr>';
            return;
        }

        activeRequests.forEach(req => {
            const row = document.createElement('tr');
            row.dataset.id = req.id; // Add data-id for event delegation
            row.innerHTML = `
                <td>${req.id}</td>
                <td>${req.resident}</td>
                <td>${req.unit}</td>
                <td>${req.issue}</td>
                <td><span class="status-requested">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                <td>${req.submittedDate}</td>
                <td class="action-buttons">
                    <button class="approve">Complete</button>
                    <button class="deny">Cancel</button>
                    <button class="view">View</button>
                </td>
            `;
            activeServiceRequestsTableBody.appendChild(row);
        });
    }

    function populateCompletedServiceRequests() {
        completedServiceRequestsTableBody.innerHTML = '';
        const completedRequests = serviceRequests.filter(req => req.status === 'completed');

        if (completedRequests.length === 0) {
            completedServiceRequestsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No completed service requests.</td></tr>';
            return;
        }

        completedRequests.forEach(req => {
            const row = document.createElement('tr');
            row.dataset.id = req.id; // Add data-id for event delegation
            row.innerHTML = `
                <td>${req.id}</td>
                <td>${req.resident}</td>
                <td>${req.unit}</td>
                <td>${req.issue}</td>
                <td><span class="status-approved">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span></td>
                <td>${req.submittedDate}</td>
                <td>${req.completionDate || 'N/A'}</td>
            `;
            completedServiceRequestsTableBody.appendChild(row);
        });
    }

    window.completeServiceRequest = (id) => {
        const index = serviceRequests.findIndex(req => req.id === id);
        if (index !== -1) {
            serviceRequests[index].status = 'completed';
            serviceRequests[index].completionDate = new Date().toISOString().slice(0, 10);
            populateActiveServiceRequests();
            populateCompletedServiceRequests();
            console.log(`Service Request ${id} marked as completed!`);
        }
    };

    window.cancelServiceRequest = (id) => {
        console.log('Confirm cancellation of service request:', id);
        if (true) {
            serviceRequests = serviceRequests.filter(req => req.id !== id);
            populateActiveServiceRequests();
            populateCompletedServiceRequests();
            console.log(`Service Request ${id} cancelled.`);
        }
    };

    window.viewServiceRequestDetails = (id) => {
        const request = serviceRequests.find(req => req.id === id);
        if (request) {
            console.log(`Service Request Details:\nID: ${request.id}\nResident: ${request.resident}\nUnit: ${request.unit}\nIssue: ${request.issue}\nStatus: ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}\nSubmitted: ${request.submittedDate}\nCompleted: ${request.completionDate || 'N/A'}`);
        }
    };


    // Resident Management Functions
    const addResidentModal = document.getElementById('addResidentModal');
    const addResidentButton = document.getElementById('add-resident-button');
    const residentListTableBody = document.getElementById('resident-list-table-body');
    const residentSearchInput = document.getElementById('resident-search');

    addResidentButton.addEventListener('click', () => {
        addResidentModal.style.display = 'flex';
        addResidentModal.setAttribute('aria-hidden', 'false');
        document.getElementById('resident-name').focus();
    });

    document.getElementById('add-resident-submit-btn').addEventListener('click', () => addResident());
    document.getElementById('cancel-add-resident-btn').addEventListener('click', () => closeAddResidentModal());

    window.closeAddResidentModal = () => {
        addResidentModal.style.display = 'none';
        addResidentModal.setAttribute('aria-hidden', 'true');
        document.getElementById('resident-name').value = '';
        document.getElementById('resident-unit').value = '';
        document.getElementById('resident-email').value = '';
        document.getElementById('resident-phone').value = '';
        document.getElementById('resident-movein-date').value = '';
    };

    window.addResident = () => {
        const name = document.getElementById('resident-name').value;
        const unit = document.getElementById('resident-unit').value;
        const email = document.getElementById('resident-email').value;
        const phone = document.getElementById('resident-phone').value;
        const moveInDate = document.getElementById('resident-movein-date').value;

        if (!name || !unit || !email || !moveInDate) {
            console.error('Full Name, Unit, Email, and Move-in Date are required.');
            return;
        }

        const newResident = {
            id: `R${String(residents.length + 1).padStart(3, '0')}`,
            name,
            unit,
            email,
            phone,
            moveInDate
        };

        residents.push(newResident);
        populateResidentList();
        closeAddResidentModal();
        console.log('Resident added successfully!');
    };

    // Event delegation for resident list table
    residentListTableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const residentId = row.dataset.id;

        if (target.classList.contains('view')) {
            viewResidentDetails(residentId);
        } else if (target.classList.contains('deny')) {
            deleteResident(residentId);
        }
    });

    function populateResidentList(searchTerm = '') {
        residentListTableBody.innerHTML = '';
        const filteredResidents = residents.filter(resident => {
            const searchLower = searchTerm.toLowerCase();
            return resident.name.toLowerCase().includes(searchLower) ||
                   resident.unit.toLowerCase().includes(searchLower) ||
                   resident.email.toLowerCase().includes(searchLower);
        });

        if (filteredResidents.length === 0) {
            residentListTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No residents found.</td></tr>';
            return;
        }

        filteredResidents.forEach(resident => {
            const row = document.createElement('tr');
            row.dataset.id = resident.id; // Add data-id for event delegation
            row.innerHTML = `
                <td>${resident.name}</td>
                <td>${resident.unit}</td>
                <td>${resident.email}</td>
                <td>${resident.phone || 'N/A'}</td>
                <td>${resident.moveInDate}</td>
                <td class="action-buttons">
                    <button class="view">View</button>
                    <button class="deny">Delete</button>
                </td>
            `;
            residentListTableBody.appendChild(row);
        });
    }

    residentSearchInput.addEventListener('keyup', (event) => {
        populateResidentList(event.target.value);
    });

    window.viewResidentDetails = (id) => {
        const resident = residents.find(res => res.id === id);
        if (resident) {
            console.log(`Resident Details:\nName: ${resident.name}\nUnit: ${resident.unit}\nEmail: ${resident.email}\nPhone: ${resident.phone || 'N/A'}\nMove-in Date: ${resident.moveInDate}`);
        }
    };

    window.deleteResident = (id) => {
        console.log('Confirm deletion of resident:', id);
        if (true) {
            residents = residents.filter(res => res.id !== id);
            populateResidentList();
            console.log('Resident deleted successfully!');
        }
    };
});
