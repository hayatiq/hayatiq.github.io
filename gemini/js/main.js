document.addEventListener('DOMContentLoaded', () => {

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('is-open');
    });

    // Simple Add to Cart placeholder using Local Storage
    const addToCartButtons = document.querySelectorAll('.btn-add-to-cart, .btn-add-to-cart-large');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.productId || 'unknown';
            let cart = JSON.parse(localStorage.getItem('hayatiq-cart')) || [];
            cart.push(productId);
            localStorage.setItem('hayatiq-cart', JSON.stringify(cart));
            alert(`Product ${productId} added to cart! Total items in cart: ${cart.length}`);
            console.log('Current cart:', cart);
        });
    });

});