function openModal(type) {
    const overlay = document.getElementById('modal-overlay');
    const message = document.getElementById('modal-message');
    
    if (type === 'job') {
        message.textContent = 'Please sign up or log in to view the job position';
    } else if (type === 'candidate') {
        message.textContent = 'Please sign up or log in to view the candidate profile';
    }
    
    overlay.classList.remove('hidden');
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.add('hidden');
}

function handleAction(action) {
    const message = document.getElementById('modal-message');
    
    if (action === 'signup') {
        message.textContent = 'Redirecting to sign up...';
    } else if (action === 'login') {
        message.textContent = 'Redirecting to log in...';
    }
    
    setTimeout(() => {
        closeModal();
    }, 800);
}

// Close modal when clicking outside of it
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('modal-overlay');
    
    overlay.addEventListener('click', function(event) {
        if (event.target === overlay) {
            closeModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
});