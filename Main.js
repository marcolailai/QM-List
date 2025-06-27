let inventoryData = []; // Global inventory array

// STATE
let signedIn = false;
let currentPage = 'inventory';  // inventory | request | signin
let showManageMenu = false;
let manageMode = null;          // 'add' | 'remove' | null


// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAUvX1JAOr5Q7KLE03RpPWlSAgJLrjLPTI",
    authDomain: "inventoryborrowing.firebaseapp.com",
    projectId: "inventoryborrowing",
    storageBucket: "inventoryborrowing.appspot.com",
    messagingSenderId: "65608029116",
    appId: "1:65608029116:web:b50fb4448aa519013e11b9",
    measurementId: "G-90CLH1VMVX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ON LOAD
window.addEventListener('load', loadInventory);

async function loadInventory() {
    try {
        const snapshot = await db.collection("Inventory").get(); // Compat method
        inventoryData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        render();
    } catch (err) {
        console.error("Error loading inventory:", err);
        alert("Failed to load inventory data.");
    }
}


function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function navigate(page) {
    currentPage = page;
    showManageMenu = false;
    manageMode = null;

    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('collapsed');

    render();
}

function handleAuth() {
    if (!signedIn) {
        currentPage = 'signin';
    } else {
        // logout
        signedIn = false;
        currentPage = 'inventory';
    }
    showManageMenu = false;
    manageMode = null;

    // Collapse the sidebar after clicking
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('collapsed');

    render();
}

function render() {
    const main = document.getElementById('main');
    const authBtn = document.getElementById('authBtn');
    authBtn.textContent = signedIn ? 'Logout' : 'Sign In';

    if (currentPage === 'signin') {
        renderSignIn(main);
    } else if (currentPage === 'inventory') {
        renderInventory(main);
    } else {
        main.innerHTML = '<h2>QM Request Form coming soon…</h2>';
    }
}

// SIGN IN
function renderSignIn(container) {
    container.innerHTML = `
                    <h2>Sign In</h2>
                    <div class="signin-form">
                      <label>Username</label>
                      <input id="si-user" type="text" />
                      <label>Password</label>
                      <input id="si-pass" type="password" />
                      <button onclick="submitSignIn()">Submit</button>
                    </div>`;
}
function submitSignIn() {
    const u = document.getElementById('si-user').value;
    const p = document.getElementById('si-pass').value;
    if (u === 'admin' && p === 'admin123') {
        signedIn = true;
        currentPage = 'inventory';
        alert('Signed in successfully!');
    } else {
        alert('Invalid credentials');
    }
    render();
}

// INVENTORY
function renderInventory(container) {
    let html = `
                        <div class="top-bar">
                          <input id="searchTxt" placeholder="Search items…" />
                          <button onclick="doSearch()">Search</button>
                          <button onclick="doDownload()">Download</button>
                          ${signedIn ? '<button onclick="toggleManageMenu()">Manage</button>' : ''}
                        </div>`;

    // Toggleable Manage submenu
    if (showManageMenu && signedIn) {
        html += `
                        <div class="manage-menu">
                          <button onclick="setManage('add')">Add</button>
                          <button onclick="setManage('edit')">Edit</button>
                          <button onclick="setManage('remove')">Remove</button>
                        </div>`;
    }

    // Depending on mode
    if (manageMode === 'add') {
        html += renderAddForm();
    } else if (manageMode === 'edit') {
        html += renderEditForm(); // You’ll need to define this if not already
    } else if (manageMode === 'remove') {
        html += renderRemoveView();
    } else {
        html += renderTables(inventoryData);
    }

    container.innerHTML = html;
    if (manageMode === 'add') {
        const catDropdown = document.getElementById('add-cat');
        const newCatField = document.getElementById('new-cat-field');
        if (catDropdown && newCatField) {
            catDropdown.addEventListener('change', function () {
                newCatField.style.display = this.value === '' ? 'block' : 'none';
            });
        }
    }
}

function toggleManageMenu() {
    showManageMenu = !showManageMenu;
    manageMode = null; // Reset mode when toggling
    renderInventory(document.getElementById('main'));
}

function openManageMenu() {
    showManageMenu = true;
    manageMode = null;
    render();
}
function closeManage() {
    showManageMenu = false;
    manageMode = null;
    render();
}
function setManage(mode) {
    manageMode = mode;
    render();
}

// RENDER TABLES
function renderTables(data) {
    const cats = [...new Set(data.map(i => i.category))];
    return cats.map(cat => {
        const rows = data.filter(i => i.category === cat)
            .map(i => `
                                       <tr>
                                         <td>${i.name}</td>
                                         <td>${i.code}</td>
                                         <td>${i.qty}</td>
                                         <td>${i.comment}</td>
                                       </tr>`).join('');
        return `
                      <div class="category-table">
                        <h3>${cat}</h3>
                        <table>
                          <thead><tr>
                            <th>Name</th><th>Code</th><th>Quantity</th><th>Comment</th>
                          </tr></thead>
                          <tbody>${rows}</tbody>
                        </table>
                      </div>`;
    }).join('');
}

// ADD FORM
function renderAddForm() {
    return `
        <div class="add-form">
            <h3>Add Item</h3>
            <label>Name</label><input id="add-name" />
            <label>Code</label><input id="add-code" />
            <label>Category</label>
            <select id="add-cat">
                ${[...new Set(inventoryData.map(i => i.category))].map(c => `<option>${c}</option>`).join('')}
                <option value="">-- New Category --</option>
            </select>
            <div id="new-cat-field" style="display:none;">
                <label>New Category</label><input id="add-new-cat" />
            </div>
            <label>Quantity</label><input id="add-qty" />
            <label>Comment</label><input id="add-com" />
            <button onclick="submitAdd()">Submit</button>

            <script>
                document.getElementById('add-cat').addEventListener('change', function () {
                    const newCatField = document.getElementById('new-cat-field');
                    newCatField.style.display = this.value === '' ? 'block' : 'none';
                });
            </script>
        </div>`;
}

async function submitAdd() {
    const name = document.getElementById('add-name').value;
    const code = document.getElementById('add-code').value;
    const qty = Number(document.getElementById('add-qty').value);
    const comment = document.getElementById('add-com').value;
    let category = document.getElementById('add-cat').value;
    if (category === '') {
        category = document.getElementById('add-new-cat').value.trim();
        if (!category) {
            alert("Please enter a new category name.");
            return;
        }
    }

    try {
        await db.collection('Inventory').add({ name, code, category, qty, comment });
        alert('Item added successfully.');
        await loadInventory();
    } catch (err) {
        console.error('Add failed:', err);
        alert('Failed to add item.');
    }
}

// EDIT VIEW
function renderEditForm() {
    return `
                    <div class="edit-view">
                      <h3>Select an item to edit</h3>
                      ${renderEditableTables(inventoryData)}
                    </div>`;
}
function renderEditableTables(data) {
    const cats = [...new Set(data.map(i => i.category))];
    let globalIdx = 0;

    return cats.map(cat => {
        const rows = data.filter(i => i.category === cat)
            .map((item) => {
                const row = `
                        <tr>
                          <td><input type="radio" name="edit-select" onclick="enableEdit(${globalIdx})" /></td>
                          <td><input id="edit-name-${globalIdx}" value="${item.name}" disabled /></td>
                          <td><input id="edit-code-${globalIdx}" value="${item.code}" disabled /></td>
                          <td><input id="edit-qty-${globalIdx}" value="${item.qty}" disabled /></td>
                          <td><input id="edit-com-${globalIdx}" value="${item.comment}" disabled /></td>
                          <td>${item.category}</td>
                          <td><button id="save-btn-${globalIdx}" onclick="saveEdit(${globalIdx}, '${item.id}')" style="display:none;">Save</button></td>
                        </tr>`;
                globalIdx++;
                return row;
            }).join('');

        return `
                        <div class="category-table">
                          <h3>${cat}</h3>
                          <table>
                            <thead><tr>
                              <th></th><th>Name</th><th>Code</th><th>Quantity</th><th>Comment</th><th>Category</th><th>Action</th>
                            </tr></thead>
                            <tbody>${rows}</tbody>
                          </table>
                        </div>`;
    }).join('');
}

function enableEdit(selectedIdx) {
    const total = inventoryData.length;

    for (let i = 0; i < total; i++) {
        const nameInput = document.getElementById(`edit-name-${i}`);
        const codeInput = document.getElementById(`edit-code-${i}`);
        const qtyInput = document.getElementById(`edit-qty-${i}`);
        const comInput = document.getElementById(`edit-com-${i}`);
        const saveBtn = document.getElementById(`save-btn-${i}`);

        if (nameInput && codeInput && qtyInput && comInput && saveBtn) {
            const isSelected = i === selectedIdx;
            nameInput.disabled = !isSelected;
            codeInput.disabled = !isSelected;
            qtyInput.disabled = !isSelected;
            comInput.disabled = !isSelected;
            saveBtn.style.display = isSelected ? 'inline-block' : 'none';
        }
    }
}

function saveEdit(idx, docId) {
    const name = document.getElementById(`edit-name-${idx}`).value;
    const code = document.getElementById(`edit-code-${idx}`).value;
    const qty = parseInt(document.getElementById(`edit-qty-${idx}`).value);
    const comment = document.getElementById(`edit-com-${idx}`).value;

    // Uncomment when Firebase is ready
    
    firebase.firestore().collection('Inventory').doc(docId).update({
        name, code, qty, comment
    }).then(() => {
    
    alert('Item updated successfully');
    showManageMenu = false;
    manageMode = null;
    render();
    
    }).catch(err => {
        console.error('Update failed:', err);
        alert('Failed to update item.');
    });
    
}




// REMOVE VIEW
function renderRemoveView() {
    return `
        <div class="remove-view">
            <h3>Select items to remove</h3>
            ${renderRemovableTables(inventoryData)}
        </div>
        <button class="confirm-delete" onclick="confirmDelete()">Confirm Delete</button>`;
}
function renderRemovableTables(data) {
    // identical categories but with checkboxes
    const cats = [...new Set(data.map(i => i.category))];
    return cats.map(cat => {
        const rows = data.filter(i => i.category === cat)
            .map((i, idx) => `
                <tr>
                    <td><input type="checkbox" data-idx="${idx}" /></td>
                    <td>${i.name}</td>
                    <td>${i.code}</td>
                    <td>${i.qty}</td>
                    <td>${i.comment}</td>
                </tr>`).join('');
        return `
            <div class="category-table">
            <h3>${cat}</h3>
            <table>
                <thead><tr>
                <th></th><th>Name</th><th>Code</th><th>Quantity</th><th>Comment</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
            </div>`;
    }).join('');
}

async function confirmDelete() {
    const toDelete = [];
    document.querySelectorAll('input[type="checkbox"][data-idx]').forEach(cb => {
        if (cb.checked) {
            toDelete.push(inventoryData[cb.dataset.idx].id);
        }
    });

    try {
        await Promise.all(toDelete.map(id => db.collection('Inventory').doc(id).delete()));
        alert('Items deleted.');
        await loadInventory();
    } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete items.');
    }
}

// SEARCH & DOWNLOAD
function doSearch() {
    const kw = document.getElementById('searchTxt').value.toLowerCase();
    const results = inventoryData.filter(i => i.name.toLowerCase().includes(kw));

    let html = `
                        <h3>Search Results for “${kw}”</h3>
                        <button class="back-btn" onclick="exitSearch()" style="margin-bottom: 1rem;">
                          ⬅ Back to Inventory
                        </button>
                        <div class="category-table">
                          <table>
                            <thead><tr>
                              <th>Name</th><th>Code</th><th>Quantity</th><th>Comment</th><th>Category</th>
                            </tr></thead>
                            <tbody>
                              ${results.map(i => `
                                <tr>
                                  <td>${i.name}</td><td>${i.code}</td>
                                  <td>${i.qty}</td><td>${i.comment}</td>
                                  <td>${i.category}</td>
                                </tr>`).join('')}
                            </tbody>
                          </table>
                        </div>`;

    document.getElementById('main').innerHTML = html;
}

function exitSearch() {
    manageMode = null;
    showManageMenu = false;
    renderInventory(document.getElementById('main'));
}

function doDownload() {
    alert('Generating PDF (mock)…');
    // use jsPDF → landscape A4 → iterate inventoryData tables
}
