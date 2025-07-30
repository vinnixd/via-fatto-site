// Via Fatto Imóveis - JavaScript Principal

document.addEventListener('DOMContentLoaded', function() {
    // Navegação Mobile
    initMobileNavigation();
    
    // Carrossel de Imóveis
    initCarousel();
    
    // Filtros de Categoria
    initCategoryFilters();
    
    // Favoritos
    initFavorites();
    
    // Formulários
    initForms();
    
    // Busca de Imóveis
    initPropertySearch();
});

// Navegação Mobile
function initMobileNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Carrossel de Imóveis em Destaque
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const carouselInner = carousel.querySelector('.carousel-inner');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const items = carousel.querySelectorAll('.carousel-item');
    
    if (!carouselInner || !items.length) return;
    
    let currentIndex = 0;
    const itemsPerView = getItemsPerView();
    const maxIndex = Math.ceil(items.length / itemsPerView) - 1;
    
    // Auto-play
    setInterval(() => {
        currentIndex = (currentIndex + 1) > maxIndex ? 0 : currentIndex + 1;
        updateCarousel();
    }, 4000);
    
    // Navegação manual
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
            updateCarousel();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) > maxIndex ? 0 : currentIndex + 1;
            updateCarousel();
        });
    }
    
    function updateCarousel() {
        const translateX = -(currentIndex * (100 / itemsPerView));
        carouselInner.style.transform = `translateX(${translateX}%)`;
    }
    
    function getItemsPerView() {
        const width = window.innerWidth;
        if (width < 768) return 1;
        if (width < 1024) return 2;
        return 3;
    }
    
    // Redimensionamento da janela
    window.addEventListener('resize', () => {
        const newItemsPerView = getItemsPerView();
        if (newItemsPerView !== itemsPerView) {
            location.reload(); // Recarrega para recalcular
        }
    });
}

// Filtros de Categoria
function initCategoryFilters() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const propertyCards = document.querySelectorAll('.property-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Remove active de todos os botões
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Adiciona active ao botão clicado
            this.classList.add('active');
            
            // Filtra propriedades
            filterProperties(category);
        });
    });
    
    function filterProperties(category) {
        propertyCards.forEach(card => {
            const cardCategory = card.dataset.category;
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Sistema de Favoritos
function initFavorites() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    
    // Carrega favoritos do localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    favoriteButtons.forEach(btn => {
        const propertyId = btn.dataset.propertyId;
        
        // Aplica estado inicial
        if (favorites.includes(propertyId)) {
            btn.classList.add('favorited');
            updateFavoriteIcon(btn, true);
        }
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isFavorited = favorites.includes(propertyId);
            
            if (isFavorited) {
                // Remove dos favoritos
                const index = favorites.indexOf(propertyId);
                favorites.splice(index, 1);
                btn.classList.remove('favorited');
                updateFavoriteIcon(btn, false);
            } else {
                // Adiciona aos favoritos
                favorites.push(propertyId);
                btn.classList.add('favorited');
                updateFavoriteIcon(btn, true);
            }
            
            // Salva no localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // Atualiza contador de favoritos (se existir)
            updateFavoritesCounter();
        });
    });
    
    function updateFavoriteIcon(btn, isFavorited) {
        const icon = btn.querySelector('.heart-icon');
        if (icon) {
            icon.style.fill = isFavorited ? 'currentColor' : 'none';
        }
    }
    
    function updateFavoritesCounter() {
        const counter = document.querySelector('.favorites-counter');
        if (counter) {
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            counter.textContent = favorites.length;
        }
    }
    
    // Inicializa contador
    updateFavoritesCounter();
}

// Formulários
function initForms() {
    // Formulário de busca no hero
    const heroSearchForm = document.getElementById('hero-search-form');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const searchParams = Object.fromEntries(formData);
            
            // Aplica filtros na página atual ou redireciona
            if (window.location.pathname === '/') {
                applySearchFilters(searchParams);
            } else {
                // Redireciona para página de imóveis com parâmetros
                const params = new URLSearchParams(searchParams);
                window.location.href = `imoveis.html?${params.toString()}`;
            }
        });
    }
    
    // Formulário de contato
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Cria mensagem do WhatsApp
            const whatsappMessage = `Olá!\n\nNome: ${data.name}\nE-mail: ${data.email}\nTelefone: ${data.phone}\nAssunto: ${data.subject}\n\nMensagem:\n${data.message}`;
            
            // Abre WhatsApp
            const whatsappUrl = `https://wa.me/5511999887766?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');
            
            // Limpa o formulário
            this.reset();
            
            // Mostra mensagem de sucesso
            showMessage('Mensagem enviada! Você será redirecionado para o WhatsApp.', 'success');
        });
    }
}

// Busca de Imóveis
function initPropertySearch() {
    const searchInput = document.getElementById('property-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterPropertiesBySearch(query);
        });
    }
}

function applySearchFilters(filters) {
    const properties = document.querySelectorAll('.property-card');
    
    properties.forEach(property => {
        let shouldShow = true;
        
        // Filtro por categoria
        if (filters.category && filters.category !== '') {
            const propertyCategory = property.dataset.category;
            if (propertyCategory !== filters.category) {
                shouldShow = false;
            }
        }
        
        // Filtro por preço mínimo
        if (filters.minPrice && filters.minPrice !== '') {
            const propertyPrice = parseInt(property.dataset.price);
            const minPrice = parseInt(filters.minPrice.replace(/\D/g, ''));
            if (propertyPrice < minPrice) {
                shouldShow = false;
            }
        }
        
        // Filtro por localização
        if (filters.location && filters.location !== '') {
            const propertyLocation = property.dataset.location.toLowerCase();
            if (!propertyLocation.includes(filters.location.toLowerCase())) {
                shouldShow = false;
            }
        }
        
        property.style.display = shouldShow ? 'block' : 'none';
    });
}

function filterPropertiesBySearch(query) {
    const properties = document.querySelectorAll('.property-card');
    
    properties.forEach(property => {
        const title = property.dataset.title.toLowerCase();
        const location = property.dataset.location.toLowerCase();
        const description = property.dataset.description.toLowerCase();
        
        const matches = title.includes(query) || 
                       location.includes(query) || 
                       description.includes(query);
        
        property.style.display = matches ? 'block' : 'none';
    });
}

// Função para mostrar mensagens
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Função para formatar preços
function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

// Função para gerar URL do WhatsApp para propriedades
function getPropertyWhatsAppUrl(property) {
    const title = property.dataset.title;
    const reference = property.dataset.reference;
    const price = formatPrice(parseInt(property.dataset.price));
    
    const message = `Olá! Tenho interesse no imóvel: ${title} - Ref: ${reference} - ${price}. Poderia me passar mais informações?`;
    return `https://wa.me/5511999887766?text=${encodeURIComponent(message)}`;
}

// Animações CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Analytics básico (se necessário)
function trackEvent(event, data) {
    console.log('Event tracked:', event, data);
    // Aqui você pode integrar com Google Analytics ou outra ferramenta
}

// Event listeners para tracking
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-primary, .btn-secondary')) {
        trackEvent('button_click', {
            button_text: e.target.textContent,
            page: window.location.pathname
        });
    }
    
    if (e.target.matches('.property-card, .property-card *')) {
        const card = e.target.closest('.property-card');
        if (card) {
            trackEvent('property_view', {
                property_id: card.dataset.propertyId,
                property_title: card.dataset.title
            });
        }
    }
});