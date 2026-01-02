document.addEventListener('DOMContentLoaded', () => {
    // 0. Determine root path (default to '../' if not set)
    const rootPath = window.ROOT_PATH || '../';

    // 0.5 Inject CSS immediately
    const cssFiles = [
        rootPath + 'style.css',
        'https://my937p.com/p/format_css?item_id=HDAPYctM&format=div&form_align=&label_align=&radio_float=&checkbox_float=&label_width=0&input_width=0&theme_name=3_7&ver=3',
        'https://my937p.com/p/mobile_css?item_id=HDAPYctM&format=div&form_align=&label_align=&radio_float=&checkbox_float=&label_width=0&input_width=0&theme_name=3_7&ver=3',
        'https://my937p.com/css/form/myasp-ui-form.css?d=20250810224710'
    ];

    cssFiles.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    });

    // 1. Fetch content from the parent index.html
    fetch(rootPath + 'index.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 2. Adjust relative paths (images, css, links)
            const adjustPath = (element, attribute) => {
                const value = element.getAttribute(attribute);
                if (value && !value.startsWith('http') && !value.startsWith('//') && !value.startsWith('#') && !value.startsWith('mailto:')) {
                    // if value starts with '../', remove it first to avoid double stacking if moving deeper
                    // actually, better to just prepend rootPath to the clean filename? 
                    // No, the original index.html has relative paths like "images/foo.jpg".
                    // So we just prepend rootPath.
                    element.setAttribute(attribute, rootPath + value);
                }
            };

            doc.querySelectorAll('link[href]').forEach(el => adjustPath(el, 'href'));
            doc.querySelectorAll('img[src]').forEach(el => adjustPath(el, 'src'));
            doc.querySelectorAll('script[src]').forEach(el => adjustPath(el, 'src'));
            doc.querySelectorAll('a[href]').forEach(el => adjustPath(el, 'href'));

            // 3. Inject <header> and <main> into the current body
            // We assume the destination page has an empty body (except for this script)
            // or specific containers. For simplicity, we append to body.

            // Get the header (hero) and main content
            const header = doc.querySelector('header');
            const main = doc.querySelector('main');
            const footer = doc.querySelector('footer');
            const validationScript = doc.querySelector('script[src*="validation.js"]'); // MyASP validation script

            if (header) document.body.appendChild(header);
            if (main) document.body.appendChild(main);
            if (footer) document.body.appendChild(footer);
            if (validationScript) {
                const newScript = document.createElement('script');
                newScript.src = validationScript.getAttribute('src'); // Path already adjusted above if relative
                document.body.appendChild(newScript);
            }

            // 3.5 Override Hero Image if specified
            if (window.HERO_IMAGE) {
                const heroImage = document.querySelector('.hero-image');
                if (heroImage) {
                    heroImage.src = window.HERO_IMAGE;
                }
            }

            // 3.6 Inject Bonus Copy if specified
            if (window.BONUS_COPY) {
                const packageImg = document.querySelector('.form-section-image');
                if (packageImg) {
                    const copy = document.createElement('h3');
                    copy.className = 'bonus-copy';
                    // Allow HTML tags like <br class="sp-only">
                    copy.innerHTML = window.BONUS_COPY;
                    copy.style.textAlign = 'center';
                    copy.style.marginBottom = '24px';
                    copy.style.fontSize = '1.8rem';
                    copy.style.fontWeight = 'bold';
                    copy.style.color = '#578A7C'; // Theme color
                    copy.style.lineHeight = '1.4';

                    // Inject styling for .sp-br (responsive break)
                    const style = document.createElement('style');
                    style.innerHTML = `
                        .sp-br { display: none; }
                        @media (max-width: 768px) {
                            .sp-br { display: block; }
                        }
                    `;
                    document.head.appendChild(style);

                    packageImg.parentNode.insertBefore(copy, packageImg);
                }
            }

            // 4. Override Form Action URL if specified in global config
            if (window.FORM_ACTION_URL) {
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    // Check if it's the MyASP form (or just all forms for now)
                    if (form.classList.contains('myForm')) {
                        form.action = window.FORM_ACTION_URL;
                        console.log('Form Action URL updated to:', window.FORM_ACTION_URL);
                    }
                });
            }

            // 5. Initialize Smooth Scroll for anchor links (since we inject them dynamically)
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });

        })
        .catch(error => {
            console.error('Error loading content:', error);
            document.body.innerHTML = '<p>コンテンツの読み込みに失敗しました。</p>';
        });
});
