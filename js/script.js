document.addEventListener('DOMContentLoaded', function() {
    // Mobile view notice
    if (window.innerWidth > 480) {
        const notice = document.createElement('div');
        notice.className = 'mobile-view-notice';
        notice.innerHTML = '<i class="fas fa-mobile-alt"></i> This is a mobile view. For best experience, use your mobile device.';
        document.body.appendChild(notice);

        setTimeout(() => {
            notice.remove();
        }, 6000);
    }

    // Modal functions
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.classList.add('modal-open');
            
            // Initialize collapsible menus when rules or amenities modal opens
            if (modalId === 'rules-modal' || modalId === 'amenities-modal') {
                initializeCollapsible(modal);
            }
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }

    // Button click handlers
    const buttonMappings = {
        'book-now-btn': 'book-now-modal',
        'book-now-footer-btn': 'book-now-modal',
        'reviews-btn': 'reviews-modal',
        'nearby-btn': 'nearby-modal',
        'emergency-btn': 'emergency-modal',
        'rules-btn': 'rules-modal',
        'specials-btn': 'specials-modal',
        'host-favorites': 'food-modal',
        'gallery-card': 'gallery-modal',
        'rooms-card': 'rooms-modal',
        'amenities-card': 'amenities-modal'
    };

    // Add click handlers for all buttons
    Object.entries(buttonMappings).forEach(([btnId, modalId]) => {
        const button = document.getElementById(btnId);
        if (button) {
            button.addEventListener('click', () => {
                console.log(`Button clicked: ${btnId} for modal: ${modalId}`);
                const modal = document.getElementById(modalId);
                if (modal) {
                    openModal(modalId);
                } else {
                    console.error(`Modal not found: ${modalId}`);
                }
            });
        } else {
            console.error(`Button not found: ${btnId}`);
        }
    });

    // Close button handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });

    // Share button functionality
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: "Mrudhgandh PoolVilla - Digital Guidebook",
                        text: 'Check out this amazing property!',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Error sharing:', err);
                    alert('Unable to share at this time');
                }
            } else {
                alert('Share via: [Copy URL functionality to be implemented]');
            }
        });
    }

    // Collapsible menu functionality
    function initializeCollapsible(modalElement) {
        const headers = modalElement.querySelectorAll('.category-header');
        
        headers.forEach(header => {
            // Remove existing event listeners
            header.replaceWith(header.cloneNode(true));
            const newHeader = modalElement.querySelector(`[data-category="${header.dataset.category}"]`);
            
            newHeader.addEventListener('click', function() {
                const category = this.parentElement;
                const content = category.querySelector('.category-content');
                const icon = this.querySelector('i');
                
                // Close other categories
                const otherCategories = modalElement.querySelectorAll('.rule-category.active, .amenity-category.active');
                otherCategories.forEach(otherCategory => {
                    if (otherCategory !== category) {
                        otherCategory.classList.remove('active');
                        otherCategory.querySelector('.category-content').style.display = 'none';
                        otherCategory.querySelector('i').style.transform = 'rotate(0deg)';
                    }
                });
                
                // Toggle current category
                category.classList.toggle('active');
                if (category.classList.contains('active')) {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(180deg)';
                } else {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(0deg)';
                }
            });
        });
    }

    // Gallery functionality
    function initializeGallery() {
        const sliders = document.querySelectorAll('.gallery-slider');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // Show all sliders initially
        sliders.forEach(slider => {
            slider.classList.add('show');
            initializeSlider(slider);
        });

        // Filter functionality
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                sliders.forEach(slider => {
                    if (filterValue === 'all' || slider.getAttribute('data-category') === filterValue) {
                        slider.classList.add('show');
                    } else {
                        slider.classList.remove('show');
                    }
                });
            });
        });

        // Lightbox functionality
        const sliderItems = document.querySelectorAll('.slider-item');
        sliderItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const lightbox = document.querySelector('.lightbox');
                const lightboxImg = lightbox.querySelector('img');
                
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.style.display = 'block';
                document.body.style.overflow = 'hidden';
            });
        });
    }

    function initializeSlider(sliderElement) {
        const track = sliderElement.querySelector('.slider-track');
        const items = sliderElement.querySelectorAll('.slider-item');
        const prevBtn = sliderElement.querySelector('.prev');
        const nextBtn = sliderElement.querySelector('.next');
        let currentIndex = 0;
        
        // Set initial position
        updateSliderPosition();

        // Add click handlers for buttons
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateSliderPosition();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % items.length;
            updateSliderPosition();
        });

        // Add touch support
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // minimum swipe distance
                if (diff > 0) {
                    // Swipe left
                    currentIndex = (currentIndex + 1) % items.length;
                } else {
                    // Swipe right
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                }
                updateSliderPosition();
            }
        });

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (sliderElement.classList.contains('show')) {
                if (e.key === 'ArrowLeft') {
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    updateSliderPosition();
                } else if (e.key === 'ArrowRight') {
                    currentIndex = (currentIndex + 1) % items.length;
                    updateSliderPosition();
                }
            }
        });

        function updateSliderPosition() {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        }
    }

    // Initialize gallery when gallery modal opens
    document.getElementById('gallery-card').addEventListener('click', () => {
        setTimeout(initializeGallery, 100);
    });

    // Gallery Filtering
    function initializeGalleryFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');

        // Show all items initially
        galleryItems.forEach(item => item.classList.add('show'));

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterValue = button.getAttribute('data-filter');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Filter items
                galleryItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.add('show');
                    } else {
                        item.classList.remove('show');
                    }
                });
            });
        });
    }

    // Initialize filters when gallery modal opens
    document.getElementById('gallery-card').addEventListener('click', () => {
        setTimeout(() => {
            initializeGalleryFilters();
            // Show all items initially
            document.querySelectorAll('.gallery-item').forEach(item => item.classList.add('show'));
        }, 100);
    });

    // Add this with your other event listeners
    document.getElementById('rooms-card').addEventListener('click', function() {
        document.getElementById('rooms-modal').style.display = 'block';
    });

    // Room Gallery functionality
    function initializeRoomGalleries() {
        const galleries = document.querySelectorAll('.room-image-gallery');
        
        galleries.forEach(gallery => {
            const images = gallery.querySelectorAll('img');
            const dots = gallery.querySelectorAll('.dot');
            const prevBtn = gallery.querySelector('.prev');
            const nextBtn = gallery.querySelector('.next');
            let currentIndex = 0;

            function showImage(index) {
                images.forEach(img => img.classList.remove('active'));
                dots.forEach(dot => dot.classList.remove('active'));
                images[index].classList.add('active');
                dots[index].classList.add('active');
            }

            function nextImage() {
                currentIndex = (currentIndex + 1) % images.length;
                showImage(currentIndex);
            }

            function prevImage() {
                currentIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(currentIndex);
            }

            prevBtn.addEventListener('click', e => {
                e.stopPropagation();
                prevImage();
            });

            nextBtn.addEventListener('click', e => {
                e.stopPropagation();
                nextImage();
            });

            dots.forEach((dot, index) => {
                dot.addEventListener('click', e => {
                    e.stopPropagation();
                    currentIndex = index;
                    showImage(currentIndex);
                });
            });
        });
    }

    // Initialize galleries when rooms modal opens
    document.getElementById('rooms-card').addEventListener('click', () => {
        setTimeout(initializeRoomGalleries, 100);
    });

    // Gallery Lightbox functionality
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Open lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const imgAlt = item.querySelector('img').alt;
            lightboxImg.src = imgSrc;
            lightboxImg.alt = imgAlt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        });
    });

    // Close lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        // Clear source after animation
        setTimeout(() => {
            lightboxImg.src = '';
            lightboxImg.alt = '';
        }, 300);
    }

    // Initialize room sliders immediately
    const sliders = [
        { id: 'water-lilies-slider', path: 'assets/rooms/water' },
        { id: 'rose-bud-slider', path: 'assets/rooms/rose' },
        { id: 'hansta-gulmohar-slider', path: 'assets/rooms/hansta' },
        { id: 'coconut-cluster-slider', path: 'assets/rooms/coconut' },
        { id: 'mango-hum-slider', path: 'assets/rooms/mango' }
    ];

    class ImageSlider {
        constructor(sliderId, folderPath, totalImages = 5) {
            this.slider = document.getElementById(sliderId);
            if (!this.slider) return;
            
            this.folderPath = folderPath;
            this.totalImages = totalImages;
            this.currentIndex = 1;
            
            // Get parent container and buttons
            this.sliderContainer = this.slider.closest('.room-slider');
            this.prevBtn = this.sliderContainer.querySelector('.prev');
            this.nextBtn = this.sliderContainer.querySelector('.next');
            
            // Bind event listeners
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevSlide();
            });
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextSlide();
            });

            // Add touch support
            this.initTouchSupport();
        }

        initTouchSupport() {
            let touchStartX = 0;
            let touchEndX = 0;
            
            this.sliderContainer.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, false);
            
            this.sliderContainer.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                
                if (Math.abs(diff) > 50) { // threshold of 50px
                    if (diff > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                }
            }, false);
        }

        async prevSlide() {
            this.currentIndex--;
            if (this.currentIndex < 1) {
                this.currentIndex = this.totalImages;
            }
            await this.updateImage();
        }

        async nextSlide() {
            this.currentIndex++;
            if (this.currentIndex > this.totalImages) {
                this.currentIndex = 1;
            }
            await this.updateImage();
        }

        async updateImage() {
            const img = this.slider.querySelector('img');
            if (img) {
                const newSrc = `${this.folderPath}/${this.currentIndex}.jpg`;
                try {
                    await this.imageExists(newSrc);
                    img.src = newSrc;
                } catch (error) {
                    console.log('Image not found:', newSrc);
                    if (this.currentIndex > 1) {
                        this.currentIndex = 1;
                        await this.updateImage();
                    }
                }
            }
        }

        imageExists(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => reject(false);
                img.src = url;
            });
        }
    }

    // Initialize sliders
    sliders.forEach(slider => {
        new ImageSlider(slider.id, slider.path);
    });

    // Add keyboard support
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('rooms-modal').style.display === 'block') {
            const visibleSlider = document.querySelector('.room-slider');
            if (e.key === 'ArrowLeft') {
                visibleSlider.querySelector('.prev').click();
            } else if (e.key === 'ArrowRight') {
                visibleSlider.querySelector('.next').click();
            }
        }
    });

    // Simplified Review Prompt Functionality
    const reviewPromptBtn = document.getElementById('review-prompt-btn');
    const reviewPromptModal = document.getElementById('review-prompt-modal');
    const reviewPromptClose = document.querySelector('.review-prompt-close');
    const remindLaterBtn = document.getElementById('remind-later');

    // Show the button immediately
    if (reviewPromptBtn) {
        reviewPromptBtn.style.display = 'flex';
        reviewPromptBtn.style.opacity = '1';
        reviewPromptBtn.style.visibility = 'visible';
    }

    // Open modal when button is clicked
    if (reviewPromptBtn && reviewPromptModal) {
        reviewPromptBtn.addEventListener('click', () => {
            reviewPromptModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal functionality
    if (reviewPromptClose) {
        reviewPromptClose.addEventListener('click', () => {
            reviewPromptModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // Remind later functionality
    if (remindLaterBtn) {
        remindLaterBtn.addEventListener('click', () => {
            reviewPromptModal.classList.remove('active');
            document.body.style.overflow = '';
            reviewPromptBtn.style.display = 'none';
        });
    }

    // Close on outside click
    if (reviewPromptModal) {
        reviewPromptModal.addEventListener('click', (e) => {
            if (e.target === reviewPromptModal) {
                reviewPromptModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Sports Slider Functionality
    function initSportsSlider() {
        const sliderWrapper = document.querySelector('#amenities-modal .amenity-image .slider-wrapper');
        if (!sliderWrapper) {
            console.error('Slider wrapper not found');
            return;
        }

        const slides = sliderWrapper.querySelectorAll('.slider-item');
        const prevBtn = sliderWrapper.querySelector('.slider-btn.prev');
        const nextBtn = sliderWrapper.querySelector('.slider-btn.next');
        
        if (!slides.length || !prevBtn || !nextBtn) {
            console.error('Required slider elements not found');
            return;
        }

        let currentIndex = 0;
        let isAnimating = false;

        // Initialize first slide
        slides[0].classList.add('active');

        function showSlide(index) {
            if (isAnimating) return;
            isAnimating = true;

            // Remove active class from all slides
            slides.forEach(slide => slide.classList.remove('active'));
            
            // Add active class to target slide
            slides[index].classList.add('active');

            // Allow next animation after transition completes
            setTimeout(() => {
                isAnimating = false;
            }, 500); // Match this with CSS transition duration
        }

        function nextSlide() {
            if (isAnimating) return;
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        }

        function prevSlide() {
            if (isAnimating) return;
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
        }

        // Event Listeners
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        sliderWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            clearInterval(autoSlideInterval);
        }, { passive: true });

        sliderWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { // threshold of 50px
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
            }
        }, { passive: true });

        // Auto-advance slides
        let autoSlideInterval = setInterval(nextSlide, 4000);

        // Pause auto-advance on hover
        sliderWrapper.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });

        sliderWrapper.addEventListener('mouseleave', () => {
            autoSlideInterval = setInterval(nextSlide, 4000);
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('amenities-modal').style.display === 'block') {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                }
            }
        });

        // Clear interval when modal is closed
        const modal = document.getElementById('amenities-modal');
        const closeButton = modal.querySelector('.close');
        
        closeButton.addEventListener('click', () => {
            clearInterval(autoSlideInterval);
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                clearInterval(autoSlideInterval);
            }
        });

        // Preload images for smooth transitions
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img) {
                const newImg = new Image();
                newImg.src = img.src;
                newImg.onload = () => {
                    img.style.opacity = '1';
                };
            }
        });
    }

    // Initialize slider when amenities modal opens
    document.getElementById('amenities-card').addEventListener('click', function() {
        setTimeout(() => {
            initSportsSlider();
        }, 300); // Delay to ensure modal is fully opened
    });
}); 