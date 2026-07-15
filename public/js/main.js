const API_URL = '/.netlify/functions';

async function fetchArticles() {
    try {
        const res = await fetch(`${API_URL}/articles`);
        if (!res.ok) throw new Error('Failed to load');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

async function fetchExternalNews() {
    try {
        const res = await fetch(`${API_URL}/articles?type=external`);
        if (!res.ok) throw new Error('Failed to load external news');
        return await res.json();
    } catch (e) {
        return [];
    }
}

async function fetchMatches() {
    try {
        const res = await fetch(`${API_URL}/articles?type=matches`);
        if (!res.ok) throw new Error('Failed to load matches');
        return await res.json();
    } catch (e) {
        return [];
    }
}

function formatDate(isoString) {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    return d.toLocaleDateString('fr-FR');
}

// ------------------------------------------------------------------
// PUBLIC PAGES
// ------------------------------------------------------------------

let globalArticles = [];
let currentView = '';
let currentCategory = '';
let currentContainerId = '';

document.addEventListener('DOMContentLoaded', () => {
    const searchInputs = document.querySelectorAll('.nav-search');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleGlobalSearch);
    });
});

function handleGlobalSearch(e) {
    const term = e.target.value.trim().toLowerCase();
    
    const heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        heroCarousel.style.display = term ? 'none' : 'block';
    }
    
    let articlesToFilter = currentView === 'category' && currentCategory
        ? globalArticles.filter(a => a.category === currentCategory)
        : globalArticles;
        
    const filtered = term 
        ? articlesToFilter.filter(a => 
            a.title.toLowerCase().includes(term) || 
            a.content.toLowerCase().includes(term) || 
            a.category.toLowerCase().includes(term))
        : articlesToFilter;

    if (currentView === 'home') {
        renderHomeContent(filtered, term);
    } else if (currentView === 'category') {
        renderCategoryContent(filtered, term);
    }
}

function renderHomeContent(articles, term) {
    if (!term) {
        const carouselContainer = document.getElementById('carousel-content');
        if (carouselContainer) {
            const topArticles = articles.slice(0, 3);
            carouselContainer.innerHTML = topArticles.map((a, i) => `
                <div class="carousel-item ${i === 0 ? 'active' : ''}">
                    <img src="${a.image}" class="d-block w-100" alt="${a.title}">
                    <div class="carousel-caption">
                        <span class="badge badge-category mb-3">${a.category}</span>
                        <h3>${a.title}</h3>
                        <p class="text-light d-none d-md-block" style="max-width: 600px; font-size: 0.875rem;">${a.content.substring(0, 100)}...</p>
                    </div>
                </div>
            `).join('') || '<div class="text-center py-5">Aucun article à la Une</div>';
        }
    }

    const newsContainer = document.getElementById('latest-news');
    if (newsContainer) {
        const displayArticles = term ? articles : articles.slice(0, 4);
        newsContainer.innerHTML = displayArticles.map(a => `
            <div class="col-md-6">
                <div class="card h-100">
                    <img src="${a.image}" class="card-img-top" alt="${a.title}">
                    <div class="card-body">
                        <span class="text-football text-uppercase mb-1 d-block" style="font-size: 10px; font-weight: 700;">${a.category}</span>
                        <h5 class="card-title">${a.title}</h5>
                        <p class="card-text text-muted small">${a.content.substring(0, 100)}...</p>
                    </div>
                    <div class="card-footer bg-white border-0 pt-0 pb-3 d-flex justify-content-between align-items-center">
                        <span class="text-muted" style="font-size: 10px;">${formatDate(a.date)}</span>
                        <a href="#" class="text-primary fw-bold" style="font-size: 10px; text-decoration: none;">Lire plus &rarr;</a>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="col-12 text-muted py-3">Aucun article trouvé.</div>';
    }

    const transferContainer = document.getElementById('transfer-rumors');
    if (transferContainer) {
        const transfers = term ? articles.filter(a => a.category === 'Transfert') : articles.filter(a => a.category === 'Transfert').slice(0, 3);
        transferContainer.innerHTML = transfers.map(a => `
            <div class="card mb-3 transfer-card">
                <div class="card-body p-3">
                    <h6 class="fw-bold mb-1">${a.title}</h6>
                    <small class="text-muted" style="font-size: 10px;">${formatDate(a.date)}</small>
                </div>
            </div>
        `).join('') || '<p class="text-muted small">Aucune rumeur trouvée.</p>';
    }
}

async function loadHomeData() {
    currentView = 'home';
    const articles = await fetchArticles();
    globalArticles = articles;
    
    renderHomeContent(articles, '');

    // RSS loading
    loadRSSNews();
    
    // Matches
    loadMatchesData('matches-list', 4);

    const btnRefreshRss = document.getElementById('btn-refresh-rss');
    if (btnRefreshRss) {
        btnRefreshRss.addEventListener('click', async () => {
            btnRefreshRss.disabled = true;
            btnRefreshRss.textContent = 'Actualisation...';
            try {
                await fetch(`${API_URL}/rss-update`);
                await loadRSSNews();
            } finally {
                btnRefreshRss.disabled = false;
                btnRefreshRss.textContent = 'Actualiser les flux RSS';
            }
        });
    }
}

async function loadRSSNews() {
    const rssList = document.getElementById('rss-list');
    if (!rssList) return;
    
    const externalNews = await fetchExternalNews();
    if (!externalNews || externalNews.length === 0) {
        rssList.innerHTML = '<li class="list-group-item text-center text-muted">Aucune actualité externe disponible. Cliquez sur Actualiser.</li>';
        return;
    }
    
    rssList.innerHTML = externalNews.slice(0, 5).map(news => `
        <li class="list-group-item px-3 py-3">
            <a href="${news.link}" target="_blank" class="text-decoration-none text-dark d-block">
                <small class="fw-bold d-block mb-1 text-primary-hover">${news.title}</small>
                <small class="text-muted">${formatDate(news.pubDate)}</small>
            </a>
        </li>
    `).join('');
}

async function loadMatchesData(elementId, limit = null) {
    const matchesList = document.getElementById(elementId);
    if (!matchesList) return;
    
    let matches = await fetchMatches();
    if (limit) matches = matches.slice(0, limit);
    
    if (matches.length === 0) {
        matchesList.innerHTML = '<li class="list-group-item text-center text-muted py-4">Aucun match disponible.</li>';
        return;
    }
    
    matchesList.innerHTML = matches.map(m => `
        <li class="list-group-item d-flex justify-content-between align-items-center py-3">
            <div>
                <span class="fw-bold text-dark">${m.home}</span> <span class="text-muted mx-1">vs</span> <span class="fw-bold text-dark">${m.away}</span>
                <br><small class="text-muted">${formatDate(m.date)}</small>
            </div>
            <span class="badge bg-dark rounded-pill px-3 py-2 fs-6 shadow-sm">${m.score}</span>
        </li>
    `).join('');
}

async function loadCategoryData(category, containerId) {
    currentView = 'category';
    currentCategory = category;
    currentContainerId = containerId;
    
    const articles = await fetchArticles();
    globalArticles = articles;
    let filtered = category ? articles.filter(a => a.category === category) : articles;
    
    renderCategoryContent(filtered, '');
}

function renderCategoryContent(filtered, term) {
    const container = document.getElementById(currentContainerId);
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted py-5">Aucun article trouvé.</div>';
        return;
    }
    
    container.innerHTML = filtered.map(a => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <img src="${a.image}" class="card-img-top" alt="${a.title}">
                <div class="card-body">
                    <span class="text-football text-uppercase mb-1 d-block" style="font-size: 10px; font-weight: 700;">${a.category}</span>
                    <h5 class="card-title">${a.title}</h5>
                    <p class="card-text text-muted small">${a.content.substring(0, 120)}...</p>
                </div>
                <div class="card-footer bg-white border-0 pt-0 pb-3 d-flex justify-content-between align-items-center">
                    <span class="text-muted" style="font-size: 10px;">${formatDate(a.date)}</span>
                    <a href="#" class="text-primary fw-bold" style="font-size: 10px; text-decoration: none;">Lire plus &rarr;</a>
                </div>
            </div>
        </div>
    `).join('');
    
    const pagination = document.getElementById('pagination');
    if (pagination) {
        if (term) {
            pagination.style.display = 'none';
        } else if (filtered.length > 0) {
            pagination.style.display = 'flex';
            pagination.innerHTML = `
                <li class="page-item disabled"><a class="page-link" href="#">Précédent</a></li>
                <li class="page-item active"><a class="page-link" style="background-color: var(--football-green); border-color: var(--football-green);" href="#">1</a></li>
                <li class="page-item disabled"><a class="page-link" href="#">Suivant</a></li>
            `;
        }
    }
}


// ------------------------------------------------------------------
// ADMIN LOGIC
// ------------------------------------------------------------------

function getAuthToken() {
    return localStorage.getItem('admin_token');
}

async function handleLogin(e) {
    e.preventDefault();
    const pwd = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');
    errorMsg.classList.add('d-none');
    
    try {
        const res = await fetch(`${API_URL}/admin-login`, {
            method: 'POST',
            body: JSON.stringify({ password: pwd }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('admin_token', data.token);
            window.location.href = '/admin/dashboard.html';
        } else {
            errorMsg.classList.remove('d-none');
        }
    } catch (err) {
        console.error(err);
        errorMsg.classList.remove('d-none');
    }
}

function checkAuth() {
    if (!getAuthToken()) {
        window.location.href = '/admin/index.html';
    }
}

function logout() {
    localStorage.removeItem('admin_token');
    window.location.href = '/';
}

let allArticles = [];

async function loadAdminArticles() {
    const list = document.getElementById('admin-articles-list');
    if (!list) return;
    
    const articles = await fetchArticles();
    allArticles = articles;
    
    if (articles.length === 0) {
        list.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Aucun article disponible</td></tr>';
        return;
    }
    
    list.innerHTML = articles.map(a => `
        <tr>
            <td class="ps-4 text-muted small">${formatDate(a.date)}</td>
            <td class="fw-bold">${a.title}</td>
            <td><span class="badge bg-secondary">${a.category}</span></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editArticle('${a.id}')">Éditer</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteArticle('${a.id}')">Supprimer</button>
            </td>
        </tr>
    `).join('');
}

async function handleArticleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('article-id').value;
    const title = document.getElementById('article-title').value;
    const category = document.getElementById('article-category').value;
    const image = document.getElementById('article-image').value;
    const content = document.getElementById('article-content').value;
    const btnSave = document.getElementById('btn-save');
    
    const payload = { title, category, image, content };
    const endpoint = id ? `${API_URL}/update-article` : `${API_URL}/add-article`;
    
    if (id) payload.id = id;
    else payload.date = new Date().toISOString();
    
    btnSave.disabled = true;
    btnSave.textContent = 'Enregistrement...';
    
    try {
        const res = await fetch(endpoint, {
            method: id ? 'PUT' : 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            resetForm();
            loadAdminArticles();
        } else {
            alert("Erreur lors de l'enregistrement. Vérifiez vos droits d'accès.");
            if (res.status === 401) logout();
        }
    } catch(err) {
        console.error(err);
        alert("Erreur réseau");
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = 'Enregistrer l\'article';
    }
}

function editArticle(id) {
    const a = allArticles.find(x => x.id === id);
    if (!a) return;
    
    document.getElementById('form-title').textContent = 'Modifier l\'Article';
    document.getElementById('article-id').value = a.id;
    document.getElementById('article-title').value = a.title;
    document.getElementById('article-category').value = a.category;
    document.getElementById('article-image').value = a.image;
    document.getElementById('article-content').value = a.content;
    
    document.getElementById('btn-save').textContent = 'Mettre à jour l\'article';
    document.getElementById('btn-save').classList.replace('btn-success', 'btn-primary');
    document.getElementById('btn-cancel-edit').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('article-form').reset();
    document.getElementById('article-id').value = '';
    document.getElementById('form-title').textContent = 'Ajouter un Article';
    document.getElementById('btn-save').textContent = 'Enregistrer l\'article';
    document.getElementById('btn-save').classList.replace('btn-primary', 'btn-success');
    document.getElementById('btn-cancel-edit').classList.add('d-none');
}

async function deleteArticle(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article définitivement ?')) return;
    
    try {
        const res = await fetch(`${API_URL}/delete-article`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({ id })
        });
        
        if (res.ok) {
            loadAdminArticles();
        } else {
            alert('Erreur lors de la suppression. Accès refusé.');
            if (res.status === 401) logout();
        }
    } catch (e) {
        console.error(e);
        alert("Erreur réseau");
    }
}
