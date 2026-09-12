/* =========================================================
   CYBER LOCATION INVESTIGATION SIMULATOR
   FINAL CLEAN APP.JS

   IMPORTANT:
   This is an educational simulator.
   All location information is fictional/simulated.
========================================================= */


/* =========================================================
   API
========================================================= */

// =========================================================
// API CONFIGURATION
// =========================================================

const API_URL =
    window.SIMULATOR_API_URL ||
    "http://127.0.0.1:8000";

/* =========================================================
   GLOBAL STATE
========================================================= */

let map = null;
let locationMarkers = [];
let movementLine = null;
let movementChartInstance = null;

let currentLocations = [];
let currentTowers = [];
let currentUser = null;


/* =========================================================
   CASE
========================================================= */

let investigationCase = {
    id: null,
    status: "OPEN",
    evidence: []
};


/* =========================================================
   DOM HELPERS
========================================================= */

function el(id) {
    return document.getElementById(id);
}


function setText(id, value) {
    const element = el(id);

    if (element) {
        element.textContent = value ?? "-";
    }
}


function show(id) {
    const element = el(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


function hide(id) {
    const element = el(id);

    if (element) {
        element.classList.add("hidden");
    }
}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   LOGIN
========================================================= */

/* =========================================================
   LOGIN - JWT AUTHENTICATION
========================================================= */

const AUTH_TOKEN_KEY =
    "simulator_investigator_token";


function getAuthToken() {
    return localStorage.getItem(
        AUTH_TOKEN_KEY
    );
}


function clearAuthToken() {
    localStorage.removeItem(
        AUTH_TOKEN_KEY
    );

    localStorage.removeItem(
        "simulator_investigator_logged_in"
    );
}


function isAuthenticated() {
    return Boolean(
        getAuthToken()
    );
}


/* =========================================================
   AUTHENTICATED API FETCH
========================================================= */

async function apiFetch(
    url,
    options = {}
) {

    const token =
        getAuthToken();

    const headers =
        new Headers(
            options.headers || {}
        );


    if (token) {

        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }


    if (
        options.body &&
        typeof options.body === "string" &&
        !headers.has("Content-Type")
    ) {

        headers.set(
            "Content-Type",
            "application/json"
        );
    }


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    /* -----------------------------------------
       TOKEN EXPIRED / INVALID
    ----------------------------------------- */

    if (
        response.status === 401
    ) {

        clearAuthToken();

        if (el("loginPanel")) {

            el("loginPanel").style.display =
                "flex";
        }


        if (el("dashboard")) {

            el("dashboard").style.display =
                "none";
        }


        const loginMessage =
            el("loginMessage");


        if (loginMessage) {

            loginMessage.textContent =
                "⚠️ Session expired. Please login again.";

            loginMessage.style.color =
                "#dc2626";
        }
    }


    return response;
}


/* =========================================================
   INVESTIGATOR LOGIN
========================================================= */

async function investigatorLogin() {

    const username =
        el("investigatorUsername")
            ?.value
            .trim() || "";


    const password =
        el("investigatorPassword")
            ?.value || "";


    const loginMessage =
        el("loginMessage");


    if (
        !username ||
        !password
    ) {

        if (loginMessage) {

            loginMessage.textContent =
                "⚠️ Username and password required.";

            loginMessage.style.color =
                "#dc2626";
        }

        return;
    }


    if (loginMessage) {

        loginMessage.textContent =
            "🔐 Authenticating...";

        loginMessage.style.color =
            "#2563eb";
    }


    try {

        /* -----------------------------------------
           PUBLIC LOGIN API
        ----------------------------------------- */

        const response =
            await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username:
                            username,

                        password:
                            password
                    })
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok ||
            !data.access_token
        ) {

            throw new Error(
                data.detail ||
                "Invalid username or password."
            );
        }


        /* -----------------------------------------
           SAVE JWT
        ----------------------------------------- */

        localStorage.setItem(
            AUTH_TOKEN_KEY,
            data.access_token
        );


        localStorage.setItem(
            "simulator_investigator_logged_in",
            "true"
        );


        /* -----------------------------------------
           SHOW DASHBOARD
        ----------------------------------------- */

        if (el("loginPanel")) {

            el("loginPanel").style.display =
                "none";
        }


        if (el("dashboard")) {

            el("dashboard").style.display =
                "block";
        }


        if (loginMessage) {

            loginMessage.textContent =
                "";
        }


        /* -----------------------------------------
           LOAD CASE + USERS
        ----------------------------------------- */

        loadInvestigationCase();

        await loadUsers();


        showMessage(
            "✅ Investigator login successful."
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        clearAuthToken();


        if (loginMessage) {

            loginMessage.textContent =
                `❌ ${error.message}`;

            loginMessage.style.color =
                "#dc2626";
        }
    }
}


/* =========================================================
   LOGOUT
========================================================= */

function investigatorLogout() {

    clearAuthToken();

    currentUser = null;

    currentLocations = [];

    currentTowers = [];

    location.reload();
}


/* =========================================================
   AUTH CHECK
========================================================= */

function checkInvestigatorAuthentication() {

    const token =
        getAuthToken();


    if (token) {

        if (el("loginPanel")) {

            el("loginPanel").style.display =
                "none";
        }


        if (el("dashboard")) {

            el("dashboard").style.display =
                "block";
        }


        loadInvestigationCase();

        loadUsers();


    } else {

        clearAuthToken();


        if (el("loginPanel")) {

            el("loginPanel").style.display =
                "flex";
        }


        if (el("dashboard")) {

            el("dashboard").style.display =
                "none";
        }
    }
}

/* =========================================================
   CASE ID
========================================================= */

function generateCaseId() {

    const now = new Date();

    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const random =
        Math.floor(
            1000 + Math.random() * 9000
        );

    return `CASE-${date}-${random}`;
}


function saveInvestigationCase() {

    localStorage.setItem(
        "simulator_investigation_case",
        JSON.stringify(investigationCase)
    );

    renderCase();
}


function loadInvestigationCase() {

    try {

        const saved =
            localStorage.getItem(
                "simulator_investigation_case"
            );

        if (saved) {

            investigationCase =
                JSON.parse(saved);

        } else {

            investigationCase = {
                id: generateCaseId(),
                status: "OPEN",
                evidence: []
            };

            saveInvestigationCase();
        }

        renderCase();

    } catch (error) {

        console.error(
            "Case load error:",
            error
        );

        investigationCase = {
            id: generateCaseId(),
            status: "OPEN",
            evidence: []
        };

        saveInvestigationCase();
    }
}


function renderCase() {

    setText(
        "caseIdDisplay",
        investigationCase.id || "-"
    );

    setText(
        "caseStatus",
        investigationCase.status || "OPEN"
    );

    renderEvidenceLog();
}


function createNewInvestigationCase() {

    investigationCase = {
        id: generateCaseId(),
        status: "OPEN",
        evidence: []
    };

    saveInvestigationCase();

    showMessage(
        "✅ New investigation case created."
    );
}


function closeInvestigationCase() {

    investigationCase.status = "CLOSED";

    addEvidenceLog(
        "Investigation case closed."
    );

    saveInvestigationCase();

    showMessage(
        "🔒 Investigation case closed."
    );
}


function addEvidenceLog(description) {

    if (!investigationCase.evidence) {
        investigationCase.evidence = [];
    }

    investigationCase.evidence.push({

        time: new Date().toISOString(),

        description: String(
            description
        )

    });

    saveInvestigationCase();
}


function renderEvidenceLog() {

    const container =
        el("evidenceLog");

    if (!container) {
        return;
    }

    const evidence =
        investigationCase.evidence || [];

    if (!evidence.length) {

        container.innerHTML = `
            <div class="evidence-item">
                <span>📋</span>
                <span>No evidence events recorded.</span>
                <small>-</small>
            </div>
        `;

        return;
    }

    container.innerHTML =
        evidence.map((item, index) => {

            return `
                <div class="evidence-item">

                    <span>
                        ${index + 1}
                    </span>

                    <span>
                        ${escapeHtml(item.description)}
                    </span>

                    <small>
                        ${formatDateTime(item.time)}
                    </small>

                </div>
            `;

        }).join("");
}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

    const userSelect =
        el("userSelect");

    if (!userSelect) {
        return;
    }

    try {

        userSelect.innerHTML = `
            <option value="">
                Loading users...
            </option>
        `;

    const response =
        await apiFetch(
           `${API_URL}/api/users`
        );

        if (!response.ok) {
            throw new Error(
                `Users API failed: ${response.status}`
            );
        }

        const users =
            await response.json();

        userSelect.innerHTML = `
            <option value="">
                -- Select User --
            </option>
        `;

        users
            .sort(
                (a, b) =>
                    Number(a.id) - Number(b.id)
            )
            .forEach(user => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(user.id);

                option.textContent =
                    `${user.name} (User ID: ${user.id})`;

                userSelect.appendChild(
                    option
                );
            });

        showMessage(
            `✅ ${users.length} simulated users loaded.`
        );

    } catch (error) {

        console.error(
            "User loading error:",
            error
        );

        userSelect.innerHTML = `
            <option value="">
                API connection failed
            </option>
        `;

        showMessage(
            "❌ Backend API से connection नहीं हुआ।",
            true
        );
    }
}


/* =========================================================
   INVESTIGATE USER
========================================================= */

async function investigateUser(
    userIdOverride = null
) {

    const userSelect =
        el("userSelect");

    const selectedUserId =
        userIdOverride !== null
            ? String(userIdOverride)
            : userSelect?.value;

    if (!selectedUserId) {

        showMessage(
            "⚠️ पहले simulated user select करो।",
            true
        );

        return;
    }

    try {

        showMessage(
            "🔄 Investigation data loading..."
        );


        /* -----------------------------------------
           USERS
        ----------------------------------------- */

        const usersResponse =
            await apiFetch(
                `${API_URL}/api/users`
            );

        if (!usersResponse.ok) {
            throw new Error(
                "Users API failed"
            );
        }

        const users =
            await usersResponse.json();

        const user =
            users.find(
                item =>
                    String(item.id) ===
                    String(selectedUserId)
            );

        if (!user) {

            showMessage(
                "❌ Simulated user नहीं मिला।",
                true
            );

            return;
        }


        currentUser = user;


        /* -----------------------------------------
           USER INFORMATION
        ----------------------------------------- */

        setText(
            "userName",
            user.name
        );

        setText(
            "userPhone",
            user.phone
        );

        setText(
            "userId",
            user.id
        );

        show("userInfo");


        /* -----------------------------------------
           LOCATIONS
        ----------------------------------------- */

        const locationsResponse =
            await apiFetch(
                `${API_URL}/api/locations/${selectedUserId}`
            );

        if (!locationsResponse.ok) {
            throw new Error(
                "Locations API failed"
            );
        }

        const locations =
            await locationsResponse.json();

        currentLocations =
            Array.isArray(locations)
                ? locations.sort(
                    (a, b) =>
                        new Date(a.recorded_at) -
                        new Date(b.recorded_at)
                )
                : [];


        /* -----------------------------------------
           TOWERS
        ----------------------------------------- */

        const towersResponse =
            await apiFetch(
                `${API_URL}/api/towers`
            );

        if (!towersResponse.ok) {
            throw new Error(
                "Towers API failed"
            );
        }

        currentTowers =
            await towersResponse.json();


        /* -----------------------------------------
           BASIC SECTIONS
        ----------------------------------------- */

        show("locationSection");
        show("towerSection");


        if (currentLocations.length === 0) {

            hide("latestLocationSection");
            hide("summarySection");
            hide("movementSection");
            hide("speedSection");
            hide("timelineSection");
            hide("statisticsSection");
            hide("movementChartSection");
            hide("eventDetailsSection");
            hide("reportSection");

            displayLocations([]);

            displayTowers(currentTowers);

            clearMap();

            showMessage(
                "⚠️ इस simulated user के लिए location records नहीं मिले।"
            );

            addEvidenceLog(
                `Investigation opened for ${user.name} - no location records`
            );

            return;
        }


        /* -----------------------------------------
           DISPLAY
        ----------------------------------------- */

        displayLatestLocation(
            currentLocations
        );

        displayLocations(
            currentLocations
        );

        updateInvestigationSummary(
            currentLocations
        );

        updateMovementAnalysis(
            currentLocations
        );

        updateSpeedAnalysis(
            currentLocations
        );

        updateInvestigationTimeline(
            currentLocations
        );

        updateStatisticsDashboard(
            currentLocations
        );

        updateMovementChart(
            currentLocations
        );

        updateEventDetails(
            currentLocations
        );

        displayMap(
            currentLocations
        );

        displayTowers(
            currentTowers
        );

        show("reportSection");


        addEvidenceLog(
            `Investigation opened for ${user.name} (User ID: ${user.id})`
        );

        showMessage(
            "✅ Investigation data loaded successfully."
        );

    } catch (error) {

        console.error(
            "Investigation error:",
            error
        );

        showMessage(
            "❌ Investigation data load नहीं हुआ। Backend check करें।",
            true
        );
    }
}


/* =========================================================
   SEARCH USER / PHONE / ID
========================================================= */

async function searchInvestigationUser() {

    const input =
        el("userSearchInput");

    const results =
        el("userSearchResults");

    if (!input || !results) {
        return;
    }

    const query =
        input.value
            .trim()
            .toLowerCase();

    if (!query) {

        results.innerHTML = `
            <div class="search-no-result">
                ⚠️ Enter simulated user name, phone, or User ID.
            </div>
        `;

        return;
    }

    results.innerHTML = `
        <div class="search-loading">
            🔄 Searching...
        </div>
    `;

    try {

        const response =
            await apiFetch(
                `${API_URL}/api/users`
            );

        if (!response.ok) {
            throw new Error(
                "Users API failed"
            );
        }

        const users =
            await response.json();

        const matchedUsers =
            users.filter(user => {

                const name =
                    String(
                        user.name ?? ""
                    ).toLowerCase();

                const phone =
                    String(
                        user.phone ?? ""
                    ).toLowerCase();

                const id =
                    String(
                        user.id ?? ""
                    ).toLowerCase();

                return (
                    name.includes(query) ||
                    phone.includes(query) ||
                    id === query
                );
            });

        addEvidenceLog(
            `User search performed: "${query}"`
        );


        if (!matchedUsers.length) {

            results.innerHTML = `
                <div class="search-no-result">
                    ❌ No simulated user found.
                </div>
            `;

            return;
        }


        results.innerHTML =
            matchedUsers
                .map(user => {

                    return `
                        <div class="search-result-item">

                            <div class="search-user-info">

                                <h3>
                                    👤 ${escapeHtml(user.name)}
                                </h3>

                                <p>
                                    📱 Phone:
                                    <strong>
                                        ${escapeHtml(user.phone)}
                                    </strong>
                                </p>

                                <p>
                                    🆔 User ID:
                                    <strong>
                                        ${user.id}
                                    </strong>
                                </p>

                            </div>

                            <button
                                type="button"
                                class="search-view-btn"
                                data-user-id="${Number(user.id)}"
                            >
                                🔍 View Investigation
                            </button>

                        </div>
                    `;

                })
                .join("");


        results
            .querySelectorAll(
                ".search-view-btn"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const userId =
                            Number(
                                button.dataset.userId
                            );

                        const select =
                            el("userSelect");

                        if (select) {
                            select.value =
                                String(userId);
                        }

                        investigateUser(
                            userId
                        );

                    }
                );
            });

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

        results.innerHTML = `
            <div class="search-no-result">
                ❌ Search failed.<br>
                Backend API check करें।
            </div>
        `;
    }
}


/* =========================================================
   LATEST LOCATION
========================================================= */

function displayLatestLocation(
    locations
) {

    const section =
        el("latestLocationSection");

    const box =
        el("latestLocationBox");

    if (!section || !box) {
        return;
    }

    if (
        !locations ||
        !locations.length
    ) {

        section.classList.add(
            "hidden"
        );

        box.innerHTML = "";

        return;
    }

    const latest =
        locations[
            locations.length - 1
        ];

    box.innerHTML = `
        <strong>
            📍 Latest Simulated Location
        </strong>

        <div>
            Tower:
            <strong>
                ${getTowerName(latest.tower_id)}
            </strong>
        </div>

        <div>
            Latitude:
            ${Number(latest.latitude).toFixed(6)}
        </div>

        <div>
            Longitude:
            ${Number(latest.longitude).toFixed(6)}
        </div>

        <div>
            Accuracy:
            ${latest.accuracy ?? "N/A"} m
        </div>

        <div>
            Recorded:
            ${formatDate(latest.recorded_at)}
        </div>
    `;

    section.classList.remove(
        "hidden"
    );
}


/* =========================================================
   LOCATION TABLE
========================================================= */

function displayLocations(
    locations
) {

    const table =
        el("locationTable");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    if (
        !locations ||
        locations.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No location records found.
                </td>
            </tr>
        `;

        return;
    }

    locations.forEach(
        (location, index) => {

            const row =
                document.createElement(
                    "tr"
                );

            row.innerHTML = `
                <td>
                    ${index + 1}
                </td>

                <td>
                    ${escapeHtml(
                        getTowerName(
                            location.tower_id
                        )
                    )}
                </td>

                <td>
                    ${Number(
                        location.latitude
                    ).toFixed(6)}
                </td>

                <td>
                    ${Number(
                        location.longitude
                    ).toFixed(6)}
                </td>

                <td>
                    ${location.accuracy ?? "N/A"} m
                </td>

                <td>
                    ${formatDate(
                        location.recorded_at
                    )}
                </td>
            `;

            table.appendChild(
                row
            );
        }
    );
}


/* =========================================================
   TOWERS
========================================================= */

function displayTowers(
    towers
) {

    const container =
        el("towerContainer");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        !towers ||
        towers.length === 0
    ) {

        container.innerHTML =
            "<p>No tower information available.</p>";

        return;
    }

    towers.forEach(
        tower => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "tower-card";

            card.innerHTML = `
                <h3>
                    🗼 ${escapeHtml(
                        tower.tower_id
                    )}
                </h3>

                <p>
                    <strong>Area:</strong>
                    ${escapeHtml(
                        tower.area
                    )}
                </p>

                <p>
                    <strong>Latitude:</strong>
                    ${Number(
                        tower.latitude
                    ).toFixed(6)}
                </p>

                <p>
                    <strong>Longitude:</strong>
                    ${Number(
                        tower.longitude
                    ).toFixed(6)}
                </p>
            `;

            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   TOWER NAME
========================================================= */

function getTowerName(
    towerId
) {

    const tower =
        currentTowers.find(
            item =>
                Number(item.id) ===
                Number(towerId)
        );

    if (tower) {
        return tower.tower_id;
    }

    return `SIM-TOWER-${String(
        towerId
    ).padStart(3, "0")}`;
}


/* =========================================================
   MAP
========================================================= */

function displayMap(
    locations
) {

    const section =
        el("mapSection");

    if (!section) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        clearMap();

        section.classList.add(
            "hidden"
        );

        return;
    }

    section.classList.remove(
        "hidden"
    );

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet not loaded"
        );

        return;
    }


    if (!map) {

        map =
            L.map("map");

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);
    }


    locationMarkers.forEach(
        marker => {

            map.removeLayer(
                marker
            );

        }
    );

    locationMarkers = [];


    if (movementLine) {

        map.removeLayer(
            movementLine
        );

        movementLine = null;
    }


    const coordinates =
        locations.map(
            location => [
                Number(
                    location.latitude
                ),
                Number(
                    location.longitude
                )
            ]
        );


    locations.forEach(
        (location, index) => {

            const marker =
                L.marker([
                    Number(
                        location.latitude
                    ),
                    Number(
                        location.longitude
                    )
                ]).addTo(map);


            let title =
                `📍 Location #${index + 1}`;

            if (index === 0) {
                title =
                    `🟢 First Location #${index + 1}`;
            }

            if (
                index ===
                locations.length - 1
            ) {
                title =
                    `🎯 Latest Location #${index + 1}`;
            }


            marker.bindPopup(`
                <strong>
                    ${title}
                </strong>

                <br><br>

                <strong>
                    Tower:
                </strong>

                ${escapeHtml(
                    getTowerName(
                        location.tower_id
                    )
                )}

                <br>

                <strong>
                    Latitude:
                </strong>

                ${Number(
                    location.latitude
                ).toFixed(6)}

                <br>

                <strong>
                    Longitude:
                </strong>

                ${Number(
                    location.longitude
                ).toFixed(6)}

                <br>

                <strong>
                    Accuracy:
                </strong>

                ${location.accuracy ?? "N/A"} m

                <br>

                <strong>
                    Recorded:
                </strong>

                ${formatDate(
                    location.recorded_at
                )}
            `);

            locationMarkers.push(
                marker
            );
        }
    );


    movementLine =
        L.polyline(
            coordinates,
            {
                weight: 4
            }
        ).addTo(map);


    map.fitBounds(
        movementLine.getBounds(),
        {
            padding: [
                30,
                30
            ]
        }
    );


    setTimeout(
        () => {

            if (map) {
                map.invalidateSize();
            }

        },
        200
    );
}


function clearMap() {

    if (!map) {
        return;
    }

    locationMarkers.forEach(
        marker => {

            map.removeLayer(
                marker
            );

        }
    );

    locationMarkers = [];

    if (movementLine) {

        map.removeLayer(
            movementLine
        );

        movementLine = null;
    }
}


/* =========================================================
   SUMMARY
========================================================= */

function updateInvestigationSummary(
    locations
) {

    const section =
        el("summarySection");

    if (!section) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        return;
    }

    section.classList.remove(
        "hidden"
    );


    setText(
        "totalLocations",
        locations.length
    );


    const uniqueTowers =
        new Set(
            locations.map(
                location =>
                    location.tower_id
            )
        );

    setText(
        "towersVisited",
        uniqueTowers.size
    );


    setText(
        "firstSeen",
        formatDateTime(
            locations[0].recorded_at
        )
    );


    setText(
        "lastSeen",
        formatDateTime(
            locations[
                locations.length - 1
            ].recorded_at
        )
    );


    setText(
        "latestTower",
        getTowerName(
            locations[
                locations.length - 1
            ].tower_id
        )
    );
}


/* =========================================================
   MOVEMENT ANALYSIS
========================================================= */

function updateMovementAnalysis(
    locations
) {

    const section =
        el("movementSection");

    if (!section) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        return;
    }

    section.classList.remove(
        "hidden"
    );


    const latest =
        locations[
            locations.length - 1
        ];


    setText(
        "latestCoordinates",
        `${Number(
            latest.latitude
        ).toFixed(6)}, ${Number(
            latest.longitude
        ).toFixed(6)}`
    );


    setText(
        "movementTower",
        getTowerName(
            latest.tower_id
        )
    );


    const distance =
        calculateTotalDistance(
            locations
        );


    setText(
        "movementDistance",
        `${distance.toFixed(2)} km`
    );


    let direction =
        "Insufficient Data";

    if (locations.length >= 2) {

        const previous =
            locations[
                locations.length - 2
            ];

        direction =
            calculateDirection(
                Number(
                    previous.latitude
                ),
                Number(
                    previous.longitude
                ),
                Number(
                    latest.latitude
                ),
                Number(
                    latest.longitude
                )
            );
    }


    setText(
        "movementDirection",
        direction
    );


    const duration =
        getDurationMilliseconds(
            locations[0].recorded_at,
            latest.recorded_at
        );


    setText(
        "investigationDuration",
        formatDuration(
            duration
        )
    );
}


/* =========================================================
   SPEED ANALYSIS
========================================================= */

function updateSpeedAnalysis(
    locations
) {

    const section =
        el("speedSection");

    if (!section) {
        return;
    }

    if (
        !locations ||
        locations.length < 2
    ) {

        section.classList.add(
            "hidden"
        );

        return;
    }

    section.classList.remove(
        "hidden"
    );


    let totalDistance = 0;
    let maximumSpeed = 0;


    for (
        let i = 1;
        i < locations.length;
        i++
    ) {

        const previous =
            locations[i - 1];

        const current =
            locations[i];


        const distance =
            calculateDistance(
                Number(
                    previous.latitude
                ),
                Number(
                    previous.longitude
                ),
                Number(
                    current.latitude
                ),
                Number(
                    current.longitude
                )
            );


        const duration =
            getDurationMilliseconds(
                previous.recorded_at,
                current.recorded_at
            );


        const hours =
            duration / 3600000;


        totalDistance +=
            distance;


        if (hours > 0) {

            const speed =
                distance / hours;

            maximumSpeed =
                Math.max(
                    maximumSpeed,
                    speed
                );
        }
    }


    const totalDuration =
        getDurationMilliseconds(
            locations[0].recorded_at,
            locations[
                locations.length - 1
            ].recorded_at
        );


    const durationHours =
        totalDuration /
        3600000;


    const averageSpeed =
        durationHours > 0
            ? totalDistance /
              durationHours
            : 0;


    setText(
        "averageSpeed",
        `${averageSpeed.toFixed(2)} km/h`
    );


    setText(
        "maximumSpeed",
        `${maximumSpeed.toFixed(2)} km/h`
    );


    setText(
        "speedDistance",
        `${totalDistance.toFixed(2)} km`
    );


    setText(
        "speedDuration",
        formatDuration(
            totalDuration
        )
    );
}


/* =========================================================
   TIMELINE
========================================================= */

function updateInvestigationTimeline(
    locations
) {

    const section =
        el("timelineSection");

    const container =
        el("timelineContainer");

    if (!section || !container) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        container.innerHTML = "";

        return;
    }

    section.classList.remove(
        "hidden"
    );

    container.innerHTML = "";


    locations.forEach(
        (location, index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "timeline-item";


            let movementHtml = "";


            if (
                index <
                locations.length - 1
            ) {

                const next =
                    locations[index + 1];


                const distance =
                    calculateDistance(
                        Number(
                            location.latitude
                        ),
                        Number(
                            location.longitude
                        ),
                        Number(
                            next.latitude
                        ),
                        Number(
                            next.longitude
                        )
                    );


                const direction =
                    calculateDirection(
                        Number(
                            location.latitude
                        ),
                        Number(
                            location.longitude
                        ),
                        Number(
                            next.latitude
                        ),
                        Number(
                            next.longitude
                        )
                    );


                movementHtml = `
                    <div class="timeline-movement">
                        ➡️ ${direction}
                        • ${distance.toFixed(2)} km
                    </div>
                `;
            }


            const title =
                index === 0
                    ? "🟢 First Location"
                    : index === locations.length - 1
                        ? "🎯 Latest Location"
                        : "📍 Location";


            item.innerHTML = `
                <div class="timeline-dot">
                    ${index + 1}
                </div>

                <div class="timeline-content">

                    <h3>
                        ${title}
                        #${index + 1}
                    </h3>

                    <p>
                        🕐
                        <strong>
                            ${formatDate(
                                location.recorded_at
                            )}
                        </strong>
                    </p>

                    <p>
                        🗼
                        <strong>
                            ${escapeHtml(
                                getTowerName(
                                    location.tower_id
                                )
                            )}
                        </strong>
                    </p>

                    <p>
                        🌐
                        ${Number(
                            location.latitude
                        ).toFixed(6)}
                        ,
                        ${Number(
                            location.longitude
                        ).toFixed(6)}
                    </p>

                    <p>
                        🎯 Accuracy:
                        ${location.accuracy ?? "-"} m
                    </p>

                    ${movementHtml}

                </div>
            `;

            container.appendChild(
                item
            );
        }
    );
}


/* =========================================================
   STATISTICS
========================================================= */

function updateStatisticsDashboard(
    locations
) {

    const section =
        el("statisticsSection");

    if (!section) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        return;
    }

    section.classList.remove(
        "hidden"
    );


    const totalDistance =
        calculateTotalDistance(
            locations
        );


    const duration =
        getDurationMilliseconds(
            locations[0].recorded_at,
            locations[
                locations.length - 1
            ].recorded_at
        );


    const durationHours =
        duration /
        3600000;


    const averageSpeed =
        durationHours > 0
            ? totalDistance /
              durationHours
            : 0;


    let maximumSpeed = 0;


    for (
        let i = 1;
        i < locations.length;
        i++
    ) {

        const distance =
            calculateDistance(
                Number(
                    locations[i - 1].latitude
                ),
                Number(
                    locations[i - 1].longitude
                ),
                Number(
                    locations[i].latitude
                ),
                Number(
                    locations[i].longitude
                )
            );


        const segmentTime =
            getDurationMilliseconds(
                locations[i - 1].recorded_at,
                locations[i].recorded_at
            );


        const hours =
            segmentTime /
            3600000;


        if (hours > 0) {

            maximumSpeed =
                Math.max(
                    maximumSpeed,
                    distance / hours
                );
        }
    }


    const uniqueTowers =
        new Set(
            locations.map(
                location =>
                    location.tower_id
            )
        ).size;


    const latest =
        locations[
            locations.length - 1
        ];


    let direction =
        "Insufficient Data";


    if (locations.length >= 2) {

        const previous =
            locations[
                locations.length - 2
            ];

        direction =
            calculateDirection(
                Number(
                    previous.latitude
                ),
                Number(
                    previous.longitude
                ),
                Number(
                    latest.latitude
                ),
                Number(
                    latest.longitude
                )
            );
    }


    setText(
        "statLocations",
        locations.length
    );

    setText(
        "statTowers",
        uniqueTowers
    );

    setText(
        "statDistance",
        `${totalDistance.toFixed(2)} km`
    );

    setText(
        "statAverageSpeed",
        `${averageSpeed.toFixed(2)} km/h`
    );

    setText(
        "statMaximumSpeed",
        `${maximumSpeed.toFixed(2)} km/h`
    );

    setText(
        "statDuration",
        formatDuration(duration)
    );

    setText(
        "statLatestTower",
        getTowerName(
            latest.tower_id
        )
    );

    setText(
        "statDirection",
        direction
    );
}


/* =========================================================
   MOVEMENT CHART
========================================================= */

function updateMovementChart(
    locations
) {

    const section =
        el("movementChartSection");

    const canvas =
        el("movementChart");

    if (!section || !canvas) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        if (movementChartInstance) {

            movementChartInstance.destroy();

            movementChartInstance =
                null;
        }

        return;
    }


    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js not loaded"
        );

        return;
    }


    section.classList.remove(
        "hidden"
    );


    const labels = [];
    const distanceData = [];


    let cumulativeDistance = 0;


    locations.forEach(
        (location, index) => {

            const date =
                new Date(
                    location.recorded_at
                );


            labels.push(
                date.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                )
            );


            if (index > 0) {

                cumulativeDistance +=
                    calculateDistance(
                        Number(
                            locations[index - 1]
                                .latitude
                        ),
                        Number(
                            locations[index - 1]
                                .longitude
                        ),
                        Number(
                            location.latitude
                        ),
                        Number(
                            location.longitude
                        )
                    );
            }


            distanceData.push(
                Number(
                    cumulativeDistance.toFixed(2)
                )
            );
        }
    );


    if (movementChartInstance) {

        movementChartInstance.destroy();
    }


    movementChartInstance =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "line",

                data: {

                    labels: labels,

                    datasets: [
                        {
                            label:
                                "Cumulative Distance (km)",

                            data:
                                distanceData,

                            borderWidth: 3,

                            tension: 0.3,

                            fill: false,

                            pointRadius: 5
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {
                        intersect: false,
                        mode: "index"
                    },

                    plugins: {

                        legend: {
                            display: true
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        ` Distance: ${context.parsed.y} km`
                            }
                        }
                    },

                    scales: {

                        x: {

                            title: {
                                display: true,
                                text: "Time"
                            }
                        },

                        y: {

                            beginAtZero: true,

                            title: {
                                display: true,
                                text: "Distance (km)"
                            }
                        }
                    }
                }
            }
        );
}


/* =========================================================
   EVENT DETAILS
========================================================= */

function updateEventDetails(
    locations
) {

    const section =
        el("eventDetailsSection");

    const container =
        el("eventDetailsContainer");

    if (!section || !container) {
        return;
    }

    if (
        !locations ||
        locations.length === 0
    ) {

        section.classList.add(
            "hidden"
        );

        container.innerHTML = "";

        return;
    }


    section.classList.remove(
        "hidden"
    );

    container.innerHTML = "";


    locations.forEach(
        (location, index) => {

            const previous =
                index > 0
                    ? locations[index - 1]
                    : null;


            let distance = 0;
            let direction =
                "Start Point";


            if (previous) {

                distance =
                    calculateDistance(
                        Number(
                            previous.latitude
                        ),
                        Number(
                            previous.longitude
                        ),
                        Number(
                            location.latitude
                        ),
                        Number(
                            location.longitude
                        )
                    );


                direction =
                    calculateDirection(
                        Number(
                            previous.latitude
                        ),
                        Number(
                            previous.longitude
                        ),
                        Number(
                            location.latitude
                        ),
                        Number(
                            location.longitude
                        )
                    );
            }


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "event-detail-card";


            card.innerHTML = `
                <h3>
                    📍 Event ${index + 1}
                </h3>

                <p>
                    <span class="event-label">
                        🕐 Time:
                    </span>

                    ${formatDateTime(
                        location.recorded_at
                    )}
                </p>

                <p>
                    <span class="event-label">
                        📡 Tower:
                    </span>

                    ${escapeHtml(
                        getTowerName(
                            location.tower_id
                        )
                    )}
                </p>

                <p>
                    <span class="event-label">
                        🌐 Latitude:
                    </span>

                    ${Number(
                        location.latitude
                    ).toFixed(6)}
                </p>

                <p>
                    <span class="event-label">
                        🌐 Longitude:
                    </span>

                    ${Number(
                        location.longitude
                    ).toFixed(6)}
                </p>

                <p>
                    <span class="event-label">
                        🎯 Accuracy:
                    </span>

                    ${location.accuracy ?? "N/A"} m
                </p>

                <p>
                    <span class="event-label">
                        📏 Distance from Previous:
                    </span>

                    ${distance.toFixed(2)} km
                </p>

                <p>
                    <span class="event-label">
                        🧭 Direction:
                    </span>

                    ${direction}
                </p>
            `;


            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   REPORT
========================================================= */

function generateInvestigationReport() {

    const container =
        el("reportContainer");

    if (!container) {
        return;
    }

    if (
        !currentUser ||
        !currentLocations.length
    ) {

        container.innerHTML = `
            <p>
                ❌ No investigation data available.
            </p>
        `;

        return;
    }


    const locations =
        currentLocations;


    const totalDistance =
        calculateTotalDistance(
            locations
        );


    const duration =
        getDurationMilliseconds(
            locations[0].recorded_at,
            locations[
                locations.length - 1
            ].recorded_at
        );


    const latest =
        locations[
            locations.length - 1
        ];


    const uniqueTowers =
        new Set(
            locations.map(
                location =>
                    location.tower_id
            )
        ).size;


    container.innerHTML = `

        <div class="report-header">

            <h2>
                Cyber Location Investigation Report
            </h2>

            <p>
                <strong>Case ID:</strong>
                ${escapeHtml(
                    investigationCase.id
                )}
            </p>

            <p>
                <strong>User:</strong>
                ${escapeHtml(
                    currentUser.name
                )}
            </p>

            <p>
                <strong>User ID:</strong>
                ${currentUser.id}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHtml(
                    currentUser.phone
                )}
            </p>

        </div>


        <table class="report-table">

            <tr>
                <th>Total Locations</th>
                <td>${locations.length}</td>
            </tr>

            <tr>
                <th>Towers Visited</th>
                <td>${uniqueTowers}</td>
            </tr>

            <tr>
                <th>Total Distance</th>
                <td>${totalDistance.toFixed(2)} km</td>
            </tr>

            <tr>
                <th>First Seen</th>
                <td>${formatDateTime(
                    locations[0].recorded_at
                )}</td>
            </tr>

            <tr>
                <th>Last Seen</th>
                <td>${formatDateTime(
                    latest.recorded_at
                )}</td>
            </tr>

            <tr>
                <th>Latest Tower</th>
                <td>${escapeHtml(
                    getTowerName(
                        latest.tower_id
                    )
                )}</td>
            </tr>

            <tr>
                <th>Duration</th>
                <td>${formatDuration(
                    duration
                )}</td>
            </tr>

        </table>


        <h3>
            📍 Location History
        </h3>


        <table class="report-table">

            <thead>

                <tr>
                    <th>#</th>
                    <th>Tower</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Accuracy</th>
                    <th>Recorded At</th>
                </tr>

            </thead>

            <tbody>

                ${locations.map(
                    (location, index) => `
                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHtml(
                                    getTowerName(
                                        location.tower_id
                                    )
                                )}
                            </td>

                            <td>
                                ${Number(
                                    location.latitude
                                ).toFixed(6)}
                            </td>

                            <td>
                                ${Number(
                                    location.longitude
                                ).toFixed(6)}
                            </td>

                            <td>
                                ${location.accuracy ?? "N/A"} m
                            </td>

                            <td>
                                ${formatDate(
                                    location.recorded_at
                                )}
                            </td>

                        </tr>
                    `
                ).join("")}

            </tbody>

        </table>


        <p class="report-warning">
            ⚠️ Educational simulator using
            fictional/simulated location data.
        </p>
    `;


    addEvidenceLog(
        "Investigation report generated."
    );
}


function exportInvestigationCSV() {

    if (
        !currentUser ||
        !currentLocations.length
    ) {

        showMessage(
            "⚠️ पहले investigation data load करो।",
            true
        );

        return;
    }


    const rows = [

        [
            "User ID",
            "User Name",
            "Phone",
            "Tower",
            "Latitude",
            "Longitude",
            "Accuracy",
            "Recorded At"
        ]

    ];


    currentLocations.forEach(
        location => {

            rows.push([

                currentUser.id,

                currentUser.name,

                currentUser.phone,

                getTowerName(
                    location.tower_id
                ),

                location.latitude,

                location.longitude,

                location.accuracy ?? "",

                location.recorded_at
            ]);
        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            csvEscape
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );

    link.href = url;

    link.download =
        `${investigationCase.id || "investigation"}_${currentUser.id}.csv`;

    document.body.appendChild(
        link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );


    addEvidenceLog(
        "Investigation CSV exported."
    );

    showMessage(
        "✅ CSV exported successfully."
    );
}


function printInvestigationReport() {

    if (
        !currentUser ||
        !currentLocations.length
    ) {

        showMessage(
            "⚠️ पहले investigation data load करो।",
            true
        );

        return;
    }


    if (
        !el("reportContainer")?.innerHTML.trim()
    ) {

        generateInvestigationReport();
    }


    window.print();
}


/* =========================================================
   CSV ESCAPE
========================================================= */

function csvEscape(value) {

    const text =
        String(value ?? "");

    if (
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n")
    ) {

        return `"${text.replaceAll(
            '"',
            '""'
        )}"`;
    }

    return text;
}


/* =========================================================
   DISTANCE - HAVERSINE
========================================================= */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;


    const dLat =
        (
            lat2 - lat1
        ) *
        Math.PI /
        180;


    const dLon =
        (
            lon2 - lon1
        ) *
        Math.PI /
        180;


    const a =
        Math.sin(
            dLat / 2
        ) ** 2
        +
        Math.cos(
            lat1 *
            Math.PI /
            180
        )
        *
        Math.cos(
            lat2 *
            Math.PI /
            180
        )
        *
        Math.sin(
            dLon / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;
}


/* =========================================================
   TOTAL DISTANCE
========================================================= */

function calculateTotalDistance(
    locations
) {

    if (
        !locations ||
        locations.length < 2
    ) {
        return 0;
    }


    let total = 0;


    for (
        let i = 0;
        i < locations.length - 1;
        i++
    ) {

        total +=
            calculateDistance(
                Number(
                    locations[i].latitude
                ),
                Number(
                    locations[i].longitude
                ),
                Number(
                    locations[i + 1].latitude
                ),
                Number(
                    locations[i + 1].longitude
                )
            );
    }


    return total;
}


/* =========================================================
   DIRECTION
========================================================= */

function calculateDirection(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const dLat =
        lat2 - lat1;

    const dLon =
        lon2 - lon1;


    if (
        Math.abs(dLat) < 0.0001 &&
        Math.abs(dLon) < 0.0001
    ) {

        return "Stationary";
    }


    let direction = "";


    if (dLat > 0) {

        direction += "North";

    } else if (dLat < 0) {

        direction += "South";
    }


    if (dLon > 0) {

        direction +=
            direction
                ? "-East"
                : "East";

    } else if (dLon < 0) {

        direction +=
            direction
                ? "-West"
                : "West";
    }


    return direction ||
        "Stationary";
}


/* =========================================================
   DURATION
========================================================= */

function getDurationMilliseconds(
    start,
    end
) {

    const startDate =
        new Date(start);

    const endDate =
        new Date(end);


    if (
        Number.isNaN(
            startDate.getTime()
        ) ||
        Number.isNaN(
            endDate.getTime()
        )
    ) {

        return 0;
    }


    return Math.max(
        0,
        endDate - startDate
    );
}


function formatDuration(
    milliseconds
) {

    const minutes =
        Math.floor(
            milliseconds /
            60000
        );


    const hours =
        Math.floor(
            minutes /
            60
        );


    const remainingMinutes =
        minutes % 60;


    if (hours > 0) {

        return `${hours}h ${remainingMinutes}m`;

    }


    return `${remainingMinutes} min`;
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    );
}


function formatDateTime(
    dateString
) {

    if (!dateString) {
        return "-";
    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    text,
    isError = false
) {

    const message =
        el("message");

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.classList.toggle(
        "error",
        Boolean(isError)
    );
}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* LOGIN */

        el("loginBtn")
            ?.addEventListener(
                "click",
                investigatorLogin
            );


        el("logoutBtn")
            ?.addEventListener(
                "click",
                investigatorLogout
            );


        el("investigatorPassword")
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        investigatorLogin();
                    }
                }
            );


        /* CASE */

        el("newCaseBtn")
            ?.addEventListener(
                "click",
                createNewInvestigationCase
            );


        el("newCaseBtn2")
            ?.addEventListener(
                "click",
                createNewInvestigationCase
            );


        el("closeCaseBtn")
            ?.addEventListener(
                "click",
                closeInvestigationCase
            );


        /* INVESTIGATION */

        el("loadBtn")
            ?.addEventListener(
                "click",
                () =>
                    investigateUser()
            );


        el("userSelect")
            ?.addEventListener(
                "change",
                event => {

                    if (!event.target.value) {
                        return;
                    }

                    // Do not automatically investigate.
                    // User presses Investigate Location.
                }
            );


        /* SEARCH */

        el("userSearchBtn")
            ?.addEventListener(
                "click",
                searchInvestigationUser
            );


        el("userSearchInput")
            ?.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        searchInvestigationUser();
                    }
                }
            );


        /* REPORT */

        el("generateReportBtn")
            ?.addEventListener(
                "click",
                () => {

                    generateInvestigationReport();

                    showMessage(
                        "✅ Investigation report generated."
                    );
                }
            );


        el("exportCsvBtn")
            ?.addEventListener(
                "click",
                exportInvestigationCSV
            );


        el("printReportBtn")
            ?.addEventListener(
                "click",
                printInvestigationReport
            );


        /* AUTH */

        checkInvestigatorAuthentication();

    }
);