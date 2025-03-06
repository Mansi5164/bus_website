document.addEventListener("DOMContentLoaded", function() {
    const images = [
        'image/img1.jpg',
        'image/img2.jpg',
        'image/img3.jpg',
        'image/img4.jpg',
        'image/img5.jpg',
        'image/img6.jpg'
    ];

    images.forEach(image => {
        const img = new Image();
        img.src = image;
    });
});