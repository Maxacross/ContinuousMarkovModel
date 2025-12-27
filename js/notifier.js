/* =========================================================
   ПРОСТА СИСТЕМА СПОВІЩЕНЬ
========================================================= */
(function () {
    // Створюємо контейнер для сповіщень
    const container = document.createElement('div');
    container.id = 'notifierContainer';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.width = '300px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    document.body.appendChild(container);

    /**
     * Функція для створення сповіщень
     * @param {Object} options
     * @param {string} options.message - текст сповіщення
     * @param {string} [options.type='info'] - тип сповіщення: info, success, warning, error
     * @param {number} [options.duration=3000] - час відображення у мс
     */
    window.notify = function ({ message = '', type = 'info', duration = 3000 }) {
        // Створюємо елемент сповіщення
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.padding = '10px 15px';
        toast.style.borderRadius = '5px';
        toast.style.color = '#fff';
        toast.style.fontFamily = 'sans-serif';
        toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.transform = 'translateX(100%)';

        // Встановлюємо кольори залежно від типу сповіщення
        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#4CAF50'; // зелений
                break;
            case 'warning':
                toast.style.backgroundColor = '#FF9800'; // помаранчевий
                break;
            case 'error':
                toast.style.backgroundColor = '#F44336'; // червоний
                break;
            default:
                toast.style.backgroundColor = '#2196F3'; // синій (info)
        }

        // Додаємо сповіщення в контейнер
        container.appendChild(toast);

        // Анімація появи
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        // Автоматичне видалення після duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.addEventListener('transitionend', () => toast.remove());
        }, duration);
    };
})();
