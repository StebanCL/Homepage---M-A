document.addEventListener("DOMContentLoaded", async () => {
    
    // --- 1. LÓGICA DE CARGA DE COMPONENTES ---
    // Dentro de la función cargarComponente en tu script.js
    async function cargarComponente(id, url) {
        const contenedor = document.getElementById(id);
        if (contenedor) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    contenedor.innerHTML = await response.text();
                    
                    // --- AQUÍ ESTÁ LA CLAVE ---
                    if (id === 'navbar-container') inicializarNavbar();
                    if (id === 'main-content') {
                        // Si main-content contiene los barberos, inicializamos ahora
                        if (document.querySelector('.barbers-track')) {
                            inicializarCarousel();
                        }
                    }
                }
            } catch (err) {
                console.error("Error cargando componente:", err);
            }
        }
    }

    // Carga de componentes necesarios
    if (document.getElementById('navbar-container')) cargarComponente('navbar-container', '/componentes/navbar.html');
    if (document.getElementById('footer-container')) cargarComponente('footer-container', '/componentes/footer.html');
    if (document.getElementById('main-content')) cargarComponente('main-content', '/secciones/info.html');

    // --- 2. INICIALIZAR OTROS ELEMENTOS ---
    if (document.querySelector('.barbers-track')) inicializarCarousel();

    // --- 3. LÓGICA DE REGISTRO ---
    const formRegistro = document.getElementById('registro-form');
    if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoUsuario = { 
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                fecha: document.getElementById('fecha').value,
                email: document.getElementById('correo').value,
                telefono: document.getElementById('telefono').value,
                password: document.getElementById('password').value
            };
            localStorage.setItem('usuarioRegistrado', JSON.stringify(nuevoUsuario));
            alert("Registro exitoso.");
            window.location.href = '/secciones/iniciarsesion.html';
        });
    }

    // --- 4. LÓGICA DE LOGIN ---
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputUsuario = document.getElementById('usuario').value;
            const inputPass = document.getElementById('password').value;
            const guardado = JSON.parse(localStorage.getItem('usuarioRegistrado'));

            if (guardado && (inputUsuario === guardado.email || inputUsuario === guardado.telefono) && inputPass === guardado.password) {
                localStorage.setItem('sesionActiva', JSON.stringify(guardado));
                window.location.href = '/index.html';
            } else {
                alert('Usuario, teléfono o contraseña incorrectos');
            }
        });
    }
});

// --- FUNCIONES GLOBALES ---
function inicializarNavbar() {
    const sesion = JSON.parse(localStorage.getItem('sesionActiva'));
    const authLinks = document.getElementById('auth-links');
    const dynamicArea = document.getElementById('dynamic-nav-area');
    const mobileBell = document.getElementById('mobile-bell-container');
    const mobileExtra = document.getElementById('mobile-extra-options');
    const logoContainer = document.getElementById('logo-container');
    const gearIcon = document.getElementById('gear-icon-desktop');

    // Limpieza inicial
    if (dynamicArea) dynamicArea.innerHTML = '';
    if (mobileBell) mobileBell.innerHTML = '';
    if (mobileExtra) mobileExtra.innerHTML = '';

    const campanaHTML = `<i class="bi bi-bell-fill text-warning" style="font-size: 1.2rem; cursor: pointer;"></i>`;

    if (sesion) {
        // --- SESIÓN INICIADA ---
        if (authLinks) authLinks.classList.add('d-none');
        
        // Creamos el side-menu solo una vez
        if (!document.getElementById('side-menu')) {
            crearSideMenuDOM(sesion);
        }

        if (window.innerWidth >= 992) {
            // ESCRITORIO: Rueda, Saludo y Campana
            if (gearIcon) {
                gearIcon.classList.remove('d-none');
                gearIcon.onclick = (e) => toggleSideMenu(e);
            }
            if (dynamicArea) {
                dynamicArea.innerHTML = `<span class="text-warning fw-bold px-3">Hola, ${sesion.nombre}</span> ${campanaHTML}`;
            }
        } else {
            // MÓVIL: Solo Campana (sin rueda)
            if (mobileBell) mobileBell.innerHTML = campanaHTML;
            if (gearIcon) gearIcon.classList.add('d-none'); // Asegurar que la rueda no salga
            
            // Contenido del sidemenu dentro del menú hamburguesa (abajo de la línea)
            if (mobileExtra) {
                mobileExtra.innerHTML = `
                    <hr class="text-white">
                    <li class="nav-item"><a class="nav-link" href="#">👤 Mi Perfil</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">📅 Mis Reservas</a></li>
                    <li class="nav-item"><button onclick="cerrarSesion()" class="nav-link text-danger border-0 bg-transparent w-100">Cerrar Sesión</button></li>
                `;
            }
        }
    } else {
        // --- SESIÓN CERRADA ---
        if (authLinks) authLinks.classList.remove('d-none');
        if (logoContainer) logoContainer.classList.remove('d-none');
        if (gearIcon) gearIcon.classList.add('d-none');
    }
}

window.addEventListener('resize', inicializarNavbar);

function crearSideMenuDOM(sesion) {
    if (document.getElementById('side-menu')) return;

    const menu = document.createElement('div');
    menu.id = 'side-menu';
    menu.innerHTML = `
        <span class="close-menu-btn" onclick="toggleSideMenu(event)">×</span>
        <div class="menu-header">
            <img src="/img/logo.jpeg" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #FFC600;">
            <h5 class="text-white mt-3">${sesion.nombre}</h5>
        </div>
        <div class="menu-items">
            <a href="#">👤 Mi Perfil</a>
            <a href="#">📅 Mis Reservas</a>
            <button onclick="cerrarSesion()" class="btn btn-outline-danger w-100 mt-4">Cerrar Sesión</button>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'menu-overlay';
    overlay.onclick = toggleSideMenu;
    
    document.body.appendChild(menu);
    document.body.appendChild(overlay);
}

function toggleSideMenu(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const menu = document.getElementById('side-menu');
    const overlay = document.getElementById('menu-overlay');
    if (menu && overlay) {
        const isActive = menu.classList.toggle('active');
        overlay.style.display = isActive ? 'block' : 'none';
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
}

function inicializarCarousel() {
    const track = document.querySelector('.barbers-track');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if (!track || !nextBtn || !prevBtn) return;

    // Usamos el ancho del contenedor visible para saber cuánto mover
    const getScrollAmount = () => {
        const firstCard = track.querySelector('.barber-card');
        return firstCard ? firstCard.offsetWidth + 24 : 300;
    };

    nextBtn.addEventListener('click', () => {
        const cardWidth = getScrollAmount();
        
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${cardWidth}px)`;
        
        track.addEventListener('transitionend', () => {
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
        }, { once: true });
    });

    prevBtn.addEventListener('click', () => {
        const cardWidth = getScrollAmount();
        
        // 1. Movemos el último al principio antes de animar
        track.insertBefore(track.lastElementChild, track.firstElementChild);
        
        // 2. Posicionamos el track a la izquierda para que al animar parezca que viene de atrás
        track.style.transition = 'none';
        track.style.transform = `translateX(-${cardWidth}px)`;
        
        // 3. Forzar reflow para que detecte el cambio de DOM
        track.offsetHeight; 
        
        // 4. Animamos hacia la posición original (0)
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = 'translateX(0)';
    });
}

function cerrarSesion() {
    localStorage.removeItem('sesionActiva');
    alert("Has cerrado sesión.");
    window.location.href = '/index.html';
}