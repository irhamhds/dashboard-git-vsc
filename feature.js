// State Management
let users = [];
let sortField = 'name';
let sortDirection = 'asc';
let filterStatus = 'all';
let editingId = null;

// DOM Elements
const userForm = document.getElementById('userForm');
const userTableBody = document.getElementById('userTableBody');
const statusFilter = document.getElementById('statusFilter');
const loading = document.getElementById('loading');
const mainContent = document.getElementById('mainContent');
const errorAlert = document.getElementById('errorAlert');

// Fetch Initial Data
async function fetchUsers() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const apiData = await response.json();
        
        const transformedData = apiData.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            age: Math.floor(Math.random() * 30) + 20,
            status: Math.random() > 0.5 ? 'active' : 'inactive'
        }));

        // Load data from localStorage
        const storedData = localStorage.getItem('userData');
        const localData = storedData ? JSON.parse(storedData) : [];

        users = [...transformedData, ...localData];
        renderUsers();
        loading.style.display = 'none';
        mainContent.style.display = 'block';
    } catch (err) {
        showError('Failed to fetch user data');
    }
}

// Validation
function validateForm(data) {
    const errors = {};
    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Invalid email format';
    }
    if (!Number(data.age) || Number(data.age) <= 0) {
        errors.age = 'Age must be a positive number';
    }
    return errors;
}

// Show Error
function showError(message) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    setTimeout(() => {
        errorAlert.style.display = 'none';
    }, 5000);
}

// Render Users
function renderUsers() {
    const filteredUsers = users
        .filter(user => filterStatus === 'all' || user.status === filterStatus)
        .sort((a, b) => {
            const factor = sortDirection === 'asc' ? 1 : -1;
            if (sortField === 'age') {
                return (a[sortField] - b[sortField]) * factor;
            }
            return a[sortField].localeCompare(b[sortField]) * factor;
        });

    userTableBody.innerHTML = filteredUsers.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.age}</td>
            <td>
                <span class="status-badge status-${user.status}">
                    ${user.status}
                </span>
            </td>
            <td>
                <button class="btn btn-outline" onclick="handleEdit(${user.id})">Edit</button>
                <button class="btn btn-danger" onclick="handleDelete(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    localStorage.setItem('userData', JSON.stringify(users));
}

// Event Handlers
function handleEdit(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        editingId = id;
        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('age').value = user.age;
        document.getElementById('status').value = user.status;
        document.querySelector('button[type="submit"]').textContent = 'Update User';
    }
}

function handleDelete(id) {
    users = users.filter(user => user.id !== id);
    renderUsers();
}

function handleSort(field) {
    sortDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    sortField = field;
    renderUsers();
}

// Event Listeners
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        age: document.getElementById('age').value,
        status: document.getElementById('status').value
    };

    const errors = validateForm(formData);
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    if (Object.keys(errors).length === 0) {
        if (editingId) {
            users = users.map(user => 
                user.id === editingId ? { ...formData, id: editingId } : user
            );
            editingId = null;
            document.querySelector('button[type="submit"]').textContent = 'Add User';
        } else {
            users.push({ ...formData, id: Date.now() });
        }
        
        userForm.reset();
        renderUsers();
    } else {
        // Show errors
        Object.entries(errors).forEach(([field, message]) => {
            document.getElementById(`${field}Error`).textContent = message;
        });
    }
});

statusFilter.addEventListener('change', (e) => {
    filterStatus = e.target.value;
    renderUsers();
});

document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        handleSort(th.dataset.sort);
    });
});

// Initialize
fetchUsers();