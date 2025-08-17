class VideoDownloader {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.apiEndpoints = [
            'https://api.cobalt.tools/api/json',
            'https://instavideo-uhd.onrender.com/api/video-info',
            'https://yt-dlp-api.herokuapp.com/download'
        ];
        this.addWelcomeAnimation();
    }

    initializeElements() {
        this.urlInput = document.getElementById('videoUrl');
        this.fetchBtn = document.getElementById('fetchBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.loading = document.getElementById('loading');
        this.videoInfo = document.getElementById('videoInfo');
    }

    bindEvents() {
        this.fetchBtn.addEventListener('click', () => this.processVideo());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.processVideo();
        });
        this.urlInput.addEventListener('input', () => this.clearError());
        
        // Add smooth scrolling for navigation links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    addWelcomeAnimation() {
        // Add entrance animations
        setTimeout(() => {
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.transform = 'translateY(0)';
                navbar.style.opacity = '1';
            }
        }, 100);

        setTimeout(() => {
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.transform = 'translateY(0)';
                hero.style.opacity = '1';
            }
        }, 300);
    }

    clearError() {
        this.errorMessage.innerHTML = '';
    }

    showError(message) {
        this.errorMessage.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                ${message}
            </div>
        `;
    }

    detectPlatform(url) {
        const platforms = {
            'youtube.com': { name: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000' },
            'youtu.be': { name: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000' },
            'instagram.com': { name: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
            'tiktok.com': { name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' },
            'twitter.com': { name: 'Twitter', icon: 'fab fa-twitter', color: '#1da1f2' },
            'x.com': { name: 'Twitter', icon: 'fab fa-twitter', color: '#1da1f2' },
            'facebook.com': { name: 'Facebook', icon: 'fab fa-facebook', color: '#1877f2' },
            'vimeo.com': { name: 'Vimeo', icon: 'fab fa-vimeo', color: '#1ab7ea' },
            'dailymotion.com': { name: 'Dailymotion', icon: 'fas fa-play-circle', color: '#0066cc' }
        };

        for (const [domain, platform] of Object.entries(platforms)) {
            if (url.includes(domain)) return platform;
        }
        return { name: 'Unknown', icon: 'fas fa-globe', color: '#64748b' };
    }

    getQualityBadge(quality, format) {
        if (format && format.includes('audio')) return 'quality-audio';
        
        const height = parseInt(quality);
        if (height >= 2160) return 'quality-4k';
        if (height >= 1080) return 'quality-1080p';
        if (height >= 720) return 'quality-720p';
        if (height >= 480) return 'quality-480p';
        return 'quality-360p';
    }

    getQualityLabel(quality, format) {
        if (format && format.includes('audio')) return 'Audio Only';
        
        const height = parseInt(quality);
        if (height >= 2160) return '4K Ultra HD';
        if (height >= 1080) return 'Full HD 1080p';
        if (height >= 720) return 'HD 720p';
        if (height >= 480) return 'SD 480p';
        if (height >= 360) return 'SD 360p';
        return 'Standard Quality';
    }

    getQualityIcon(quality, format) {
        if (format && format.includes('audio')) return 'fas fa-music';
        
        const height = parseInt(quality);
        if (height >= 2160) return 'fas fa-gem';
        if (height >= 1080) return 'fas fa-crown';
        if (height >= 720) return 'fas fa-star';
        return 'fas fa-play';
    }

    formatFileSize(bytes) {
        if (!bytes) return 'Unknown size';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    formatDuration(seconds) {
        if (!seconds) return 'Unknown';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    async downloadFile(url, filename) {
        try {
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'video';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return true;
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Download failed. Please try again or use the preview link.');
            return false;
        }
    }

    async fetchVideoInfo(url) {
        // Try multiple APIs for better compatibility
        const attempts = [
            () => this.fetchFromCobalt(url),
            () => this.fetchFromInstaVideo(url),
            () => this.fetchFromYTDLP(url),
            () => this.createMockData(url) // Fallback demo data
        ];

        for (const attempt of attempts) {
            try {
                const result = await attempt();
                if (result && result.success) return result;
            } catch (error) {
                console.log('API attempt failed:', error);
            }
        }

        throw new Error('All APIs failed');
    }

    // Mock data for demonstration purposes
    createMockData(url) {
        const platform = this.detectPlatform(url);
        const mockFormats = [
            {
                url: '#',
                quality: '1080p',
                format: 'mp4',
                size: 52428800, // 50MB
            },
            {
                url: '#',
                quality: '720p',
                format: 'mp4',
                size: 31457280, // 30MB
            },
            {
                url: '#',
                quality: '480p',
                format: 'mp4',
                size: 20971520, // 20MB
            },
            {
                url: '#',
                quality: 'audio',
                format: 'mp3',
                size: 5242880, // 5MB
            }
        ];

        return {
            success: true,
            title: 'Sample Video - Professional Quality Download',
            thumbnail: 'https://via.placeholder.com/320x240/667eea/ffffff?text=Video+Thumbnail',
            duration: '3:45',
            uploader: 'Demo Channel',
            platform: platform,
            formats: mockFormats
        };
    }

    async fetchFromCobalt(url) {
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                vCodec: 'h264',
                vQuality: '1080',
                aFormat: 'mp3',
                isAudioOnly: false
            })
        });

        const data = await response.json();
        
        if (data.status === 'success' || data.url) {
            return {
                success: true,
                title: data.filename || 'Downloaded Video',
                thumbnail: data.thumb || '',
                formats: [{
                    url: data.url,
                    quality: '1080p',
                    format: 'mp4',
                    size: null
                }]
            };
        }
        
        throw new Error('Cobalt API failed');
    }

    async fetchFromInstaVideo(url) {
        const response = await fetch(`https://instavideo-uhd.onrender.com/api/video-info?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.formats && data.formats.length > 0) {
            return {
                success: true,
                title: data.title || 'Downloaded Video',
                thumbnail: data.thumbnail || '',
                duration: data.duration,
                uploader: data.uploader,
                formats: data.formats.map(f => ({
                    url: f.url,
                    quality: f.height ? `${f.height}p` : 'Audio',
                    format: f.ext || 'mp4',
                    size: f.filesize
                }))
            };
        }
        
        throw new Error('InstaVideo API failed');
    }

    async fetchFromYTDLP(url) {
        const response = await fetch(`https://yt-dlp-api.herokuapp.com/download?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.download_url) {
            return {
                success: true,
                title: data.title || 'Downloaded Video',
                thumbnail: data.thumbnail || '',
                formats: [{
                    url: data.download_url,
                    quality: data.quality || '720p',
                    format: data.format || 'mp4',
                    size: data.filesize
                }]
            };
        }
        
        throw new Error('YT-DLP API failed');
    }

    renderVideoInfo(videoData, originalUrl) {
        const platform = this.detectPlatform(originalUrl);
        
        let html = `
            <div class="video-info">
                <div class="video-header">
                    ${videoData.thumbnail ? `<img src="${videoData.thumbnail}" alt="Thumbnail" class="video-thumbnail" onerror="this.src='https://via.placeholder.com/160x120/667eea/ffffff?text=Video';">` : ''}
                    <div class="video-details">
                        <h3>${videoData.title}</h3>
                        <div class="video-meta">
                            ${videoData.duration ? `<span class="meta-item"><i class="fas fa-clock"></i>Duration: ${videoData.duration}</span>` : ''}
                            ${videoData.uploader ? `<span class="meta-item"><i class="fas fa-user"></i>By: ${videoData.uploader}</span>` : ''}
                            ${videoData.views ? `<span class="meta-item"><i class="fas fa-eye"></i>${videoData.views} views</span>` : ''}
                        </div>
                        <span class="video-platform">
                            <i class="${platform.icon}" style="color: ${platform.color};"></i>
                            ${platform.name}
                        </span>
                    </div>
                </div>
                
                <div class="formats-section">
                    <div class="formats-header">
                        <i class="fas fa-download"></i>
                        Available Downloads (${videoData.formats.length} options)
                    </div>
        `;

        videoData.formats.forEach((format, index) => {
            const qualityClass = this.getQualityBadge(format.quality, format.format);
            const qualityLabel = this.getQualityLabel(format.quality, format.format);
            const qualityIcon = this.getQualityIcon(format.quality, format.format);
            const fileSize = this.formatFileSize(format.size);
            const filename = `${videoData.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format.format}`;
            const formatType = format.format.toUpperCase();

            html += `
                <div class="format-item">
                    <div class="format-info">
                        <div class="format-quality">
                            <span class="quality-badge ${qualityClass}">
                                <i class="${qualityIcon}"></i>
                                ${qualityLabel}
                            </span>
                            ${formatType}
                        </div>
                        <div class="format-details">
                            <span><i class="fas fa-hdd"></i>File size: ${fileSize}</span>
                            <span><i class="fas fa-file-video"></i>Format: ${formatType}</span>
                            ${format.fps ? `<span><i class="fas fa-film"></i>FPS: ${format.fps}</span>` : ''}
                        </div>
                    </div>
                    <div class="format-actions">
                        <button class="action-btn" onclick="window.open('${format.url}', '_blank')" ${format.url === '#' ? 'disabled' : ''}>
                            <i class="fas fa-eye"></i>
                            Preview
                        </button>
                        <button class="action-btn primary" onclick="videoDownloader.downloadFile('${format.url}', '${filename}')" ${format.url === '#' ? 'onclick="videoDownloader.showDemoMessage()"' : ''}>
                            <i class="fas fa-download"></i>
                            Download
                        </button>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        this.videoInfo.innerHTML = html;
        
        // Add stagger animation to format items
        const formatItems = document.querySelectorAll('.format-item');
        formatItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    showDemoMessage() {
        this.showError('This is a demo version. In the real version, this would start the actual download.');
    }

    async processVideo() {
        const url = this.urlInput.value.trim();
        
        if (!url) {
            this.showError('Please enter a video URL');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            this.showError('Please enter a valid URL');
            return;
        }

        this.clearError();
        this.videoInfo.innerHTML = '';
        this.loading.style.display = 'block';
        this.fetchBtn.disabled = true;
        this.fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        try {
            const videoData = await this.fetchVideoInfo(url);
            this.renderVideoInfo(videoData, url);
        } catch (error) {
            this.showError('Failed to fetch video information. Please check the URL and try again. This demo shows sample data for demonstration.');
            console.error('Error:', error);
            
            // Show demo data even on error for demonstration
            try {
                const demoData = this.createMockData(url);
                this.renderVideoInfo(demoData, url);
            } catch (demoError) {
                console.error('Demo data error:', demoError);
            }
        } finally {
            this.loading.style.display = 'none';
            this.fetchBtn.disabled = false;
            this.fetchBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        }
    }
}

// Initialize the downloader when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.videoDownloader = new VideoDownloader();
    
    // Add some interactive effects
    const platformTags = document.querySelectorAll('.platform-tag');
    platformTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.style.transform = 'scale(0.95)';
            setTimeout(() => {
                tag.style.transform = 'translateY(-2px)';
            }, 150);
        });
    });
    
    // Add typing effect to the hero title
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 800);
    }
});
