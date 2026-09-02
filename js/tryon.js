// ============================================================
// TRY-ON MODULE — Virtual Makeup Try-On using MediaPipe Face Mesh
// ============================================================

const TryOn = {
    video: null,
    canvas: null,
    ctx: null,
    faceMesh: null,
    camera: null,
    isRunning: false,

    // Current makeup settings
    settings: {
        mode: 'lipstick',           // 'lipstick', 'eyeshadow', 'eyeliner'
        shadeCode: '#c0392b',
        intensity: 0.7,
        thickness: 3,               // for eyeliner
        gradientShades: null        // for eyeshadow gradient
    },

    // --------------------------------------------------------
    // Initialize the try-on page
    // --------------------------------------------------------
    async init() {
        this.video = document.getElementById('tryOnVideo');
        this.canvas = document.getElementById('tryOnCanvas');
        this.ctx = this.canvas.getContext('2d');

        await this.loadShades();
        this.setupEventListeners();
        this.setupModeButtons();
    },

    // --------------------------------------------------------
    // Load shades from Firestore products
    // --------------------------------------------------------
    async loadShades() {
        const shades = await Products.getAllShades();
        const lipstickContainer = document.getElementById('lipstickShades');
        const eyeshadowContainer = document.getElementById('eyeshadowShades');
        const eyelinerContainer = document.getElementById('eyelinerShades');

        const lipShades = shades.filter(s => s.category === 'Lipstick');
        const eyeShades = shades.filter(s => s.category === 'Eyeshadow');
        const linerShades = shades.filter(s => s.category === 'Eyeliner');

        // If no products in DB, show default shades
        const defaultLip = [
            { shadeCode: '#c0392b', name: 'Classic Red' },
            { shadeCode: '#e91e63', name: 'Hot Pink' },
            { shadeCode: '#8e44ad', name: 'Berry' },
            { shadeCode: '#d4a574', name: 'Nude' },
            { shadeCode: '#e74c3c', name: 'Coral' },
            { shadeCode: '#6c3483', name: 'Plum' }
        ];
        const defaultEye = [
            { shadeCode: '#b76e79', name: 'Rose Gold' },
            { shadeCode: '#d4af37', name: 'Gold' },
            { shadeCode: '#8e44ad', name: 'Purple' },
            { shadeCode: '#2196f3', name: 'Blue' },
            { shadeCode: '#27ae63', name: 'Green' },
            { shadeCode: '#ff9800', name: 'Orange' }
        ];

        const renderShades = (container, items, defaultItems) => {
            const list = items.length > 0 ? items : defaultItems;
            if (!container) return;
            container.innerHTML = list.map(s => `
                <button class="shade-btn ${s.shadeCode === this.settings.shadeCode ? 'active' : ''}"
                        style="background-color: ${s.shadeCode};"
                        data-shade="${s.shadeCode}"
                        title="${s.name}">
                </button>
            `).join('');

            container.querySelectorAll('.shade-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    container.querySelectorAll('.shade-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.settings.shadeCode = btn.dataset.shade;
                });
            });
        };

        renderShades(lipstickContainer, lipShades, defaultLip);
        renderShades(eyeshadowContainer, eyeShades, defaultEye);
        renderShades(eyelinerContainer, linerShades, defaultEye);
    },

    // --------------------------------------------------------
    // Setup mode buttons (Lipstick / Eyeshadow / Eyeliner)
    // --------------------------------------------------------
    setupModeButtons() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.mode = btn.dataset.mode;

                // Show/hide relevant shade panels
                document.querySelectorAll('.shade-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(this.settings.mode + 'Panel');
                if (panel) panel.classList.add('active');
            });
        });
    },

    // --------------------------------------------------------
    // Setup event listeners for controls
    // --------------------------------------------------------
    setupEventListeners() {
        // Start Camera button
        document.getElementById('startCamera')?.addEventListener('click', () => this.startCamera());

        // Intensity slider
        document.getElementById('intensitySlider')?.addEventListener('input', (e) => {
            this.settings.intensity = e.target.value / 100;
            document.getElementById('intensityValue').textContent = e.target.value + '%';
        });

        // Thickness slider (eyeliner)
        document.getElementById('thicknessSlider')?.addEventListener('input', (e) => {
            this.settings.thickness = parseInt(e.target.value);
            document.getElementById('thicknessValue').textContent = e.target.value + 'px';
        });

        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());

        // Snapshot button
        document.getElementById('snapshotBtn')?.addEventListener('click', () => this.takeSnapshot());
    },

    // --------------------------------------------------------
    // Start camera and face detection
    // --------------------------------------------------------
    async startCamera() {
        const statusEl = document.getElementById('cameraStatus');

        try {
            statusEl.textContent = 'Requesting camera access...';
            statusEl.className = 'status-text';

            // Request camera
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });

            this.video.srcObject = stream;
            await this.video.play();

            // Set canvas size to match video
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            statusEl.textContent = 'Loading face detection model...';

            // Load MediaPipe Face Mesh
            this.faceMesh = new FaceMesh({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
            });

            this.faceMesh.setOptions({
                maxNumFaces: 1,
                refineLandmarks: true,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            this.faceMesh.onResults((results) => this.onFaceResults(results));

            // Start the camera loop
            this.isRunning = true;
            document.getElementById('startCamera').textContent = 'Camera Active';
            document.getElementById('startCamera').disabled = true;
            statusEl.textContent = 'Face detection active — position your face in the frame';
            statusEl.className = 'status-text active';

            this.processFrame();

        } catch (error) {
            console.error('Camera error:', error);
            if (error.name === 'NotAllowedError') {
                statusEl.textContent = 'Camera access denied. Please allow camera and reload.';
            } else if (error.name === 'NotFoundError') {
                statusEl.textContent = 'No camera found. Please connect a camera.';
            } else {
                statusEl.textContent = 'Camera error: ' + error.message;
            }
            statusEl.className = 'status-text error';
        }
    },

    // --------------------------------------------------------
    // Process each video frame
    // --------------------------------------------------------
    async processFrame() {
        if (!this.isRunning) return;
        await this.faceMesh.send({ image: this.video });
        requestAnimationFrame(() => this.processFrame());
    },

    // --------------------------------------------------------
    // Handle face mesh results — draw makeup
    // --------------------------------------------------------
    onFaceResults(results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) return;

        const landmarks = results.multiFaceLandmarks[0];
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.settings.mode === 'lipstick') {
            this.drawLipstick(landmarks, w, h);
        } else if (this.settings.mode === 'eyeshadow') {
            this.drawEyeshadow(landmarks, w, h);
        } else if (this.settings.mode === 'eyeliner') {
            this.drawEyeliner(landmarks, w, h);
        }
    },

    // --------------------------------------------------------
    // Draw lipstick on lips
    // --------------------------------------------------------
    drawLipstick(landmarks, w, h) {
        const ctx = this.ctx;
        const intensity = this.settings.intensity;

        // MediaPipe lip landmarks (outer lips: 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185)
        const outerLip = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
        const innerLip = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];

        // Draw outer lip fill
        ctx.beginPath();
        ctx.moveTo(landmarks[outerLip[0]].x * w, landmarks[outerLip[0]].y * h);
        for (let i = 1; i < outerLip.length; i++) {
            ctx.lineTo(landmarks[outerLip[i]].x * w, landmarks[outerLip[i]].y * h);
        }
        ctx.closePath();

        ctx.fillStyle = this.hexToRGBA(this.settings.shadeCode, intensity * 0.6);
        ctx.fill();

        // Draw inner lip slightly brighter
        ctx.beginPath();
        ctx.moveTo(landmarks[innerLip[0]].x * w, landmarks[innerLip[0]].y * h);
        for (let i = 1; i < innerLip.length; i++) {
            ctx.lineTo(landmarks[innerLip[i]].x * w, landmarks[innerLip[i]].y * h);
        }
        ctx.closePath();
        ctx.fillStyle = this.hexToRGBA(this.settings.shadeCode, intensity * 0.8);
        ctx.fill();

        // Outline
        ctx.beginPath();
        ctx.moveTo(landmarks[outerLip[0]].x * w, landmarks[outerLip[0]].y * h);
        for (let i = 1; i < outerLip.length; i++) {
            ctx.lineTo(landmarks[outerLip[i]].x * w, landmarks[outerLip[i]].y * h);
        }
        ctx.closePath();
        ctx.strokeStyle = this.hexToRGBA(this.settings.shadeCode, intensity);
        ctx.lineWidth = 1.5;
        ctx.stroke();
    },

    // --------------------------------------------------------
    // Draw eyeshadow on eyelids
    // --------------------------------------------------------
    drawEyeshadow(landmarks, w, h) {
        const ctx = this.ctx;
        const intensity = this.settings.intensity;

        // Left eye landmarks (upper eyelid area)
        const leftEyeUpper = [246, 161, 160, 159, 158, 157, 173, 243, 190, 56, 28, 27, 29, 30, 247];
        // Right eye landmarks
        const rightEyeUpper = [466, 388, 387, 386, 385, 384, 398, 462, 414, 344, 334, 333, 335, 336, 467];

        // Expand the area slightly upward for shadow effect
        const expandUp = 0.05;

        // Left eyeshadow
        ctx.beginPath();
        ctx.moveTo(landmarks[leftEyeUpper[0]].x * w, (landmarks[leftEyeUpper[0]].y - expandUp) * h);
        for (let i = 1; i < leftEyeUpper.length; i++) {
            ctx.lineTo(landmarks[leftEyeUpper[i]].x * w, (landmarks[leftEyeUpper[i]].y - expandUp) * h);
        }
        ctx.closePath();

        const gradient1 = ctx.createRadialGradient(
            landmarks[159].x * w, landmarks[159].y * h, 0,
            landmarks[159].x * w, landmarks[159].y * h, 50
        );
        gradient1.addColorStop(0, this.hexToRGBA(this.settings.shadeCode, intensity * 0.7));
        gradient1.addColorStop(1, this.hexToRGBA(this.settings.shadeCode, 0));
        ctx.fillStyle = gradient1;
        ctx.fill();

        // Right eyeshadow
        ctx.beginPath();
        ctx.moveTo(landmarks[rightEyeUpper[0]].x * w, (landmarks[rightEyeUpper[0]].y - expandUp) * h);
        for (let i = 1; i < rightEyeUpper.length; i++) {
            ctx.lineTo(landmarks[rightEyeUpper[i]].x * w, (landmarks[rightEyeUpper[i]].y - expandUp) * h);
        }
        ctx.closePath();

        const gradient2 = ctx.createRadialGradient(
            landmarks[386].x * w, landmarks[386].y * h, 0,
            landmarks[386].x * w, landmarks[386].y * h, 50
        );
        gradient2.addColorStop(0, this.hexToRGBA(this.settings.shadeCode, intensity * 0.7));
        gradient2.addColorStop(1, this.hexToRGBA(this.settings.shadeCode, 0));
        ctx.fillStyle = gradient2;
        ctx.fill();
    },

    // --------------------------------------------------------
    // Draw eyeliner along the lash line
    // --------------------------------------------------------
    drawEyeliner(landmarks, w, h) {
        const ctx = this.ctx;
        const thickness = this.settings.thickness;
        const intensity = this.settings.intensity;

        // Left eye lash line
        const leftLashLine = [33, 7, 163, 144, 145, 153, 154, 155, 133];
        // Right eye lash line
        const rightLashLine = [362, 382, 381, 380, 374, 373, 390, 249, 263];

        // Draw left eyeliner
        ctx.beginPath();
        ctx.moveTo(landmarks[leftLashLine[0]].x * w, landmarks[leftLashLine[0]].y * h);
        for (let i = 1; i < leftLashLine.length; i++) {
            const cp1x = (landmarks[leftLashLine[i-1]].x + landmarks[leftLashLine[i]].x) / 2 * w;
            const cp1y = (landmarks[leftLashLine[i-1]].y + landmarks[leftLashLine[i]].y) / 2 * h;
            ctx.lineTo(landmarks[leftLashLine[i]].x * w, landmarks[leftLashLine[i]].y * h);
        }
        ctx.strokeStyle = this.hexToRGBA(this.settings.shadeCode, intensity);
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Wing on left eye
        const lastLeft = landmarks[leftLashLine[leftLashLine.length - 1]];
        const prevLeft = landmarks[leftLashLine[leftLashLine.length - 2]];
        ctx.beginPath();
        ctx.moveTo(lastLeft.x * w, lastLeft.y * h);
        ctx.lineTo(lastLeft.x * w - 15, lastLeft.y * h - 10);
        ctx.stroke();

        // Draw right eyeliner
        ctx.beginPath();
        ctx.moveTo(landmarks[rightLashLine[0]].x * w, landmarks[rightLashLine[0]].y * h);
        for (let i = 1; i < rightLashLine.length; i++) {
            ctx.lineTo(landmarks[rightLashLine[i]].x * w, landmarks[rightLashLine[i]].y * h);
        }
        ctx.strokeStyle = this.hexToRGBA(this.settings.shadeCode, intensity);
        ctx.lineWidth = thickness;
        ctx.stroke();

        // Wing on right eye
        const lastRight = landmarks[rightLashLine[rightLashLine.length - 1]];
        ctx.beginPath();
        ctx.moveTo(lastRight.x * w, lastRight.y * h);
        ctx.lineTo(lastRight.x * w + 15, lastRight.y * h - 10);
        ctx.stroke();
    },

    // --------------------------------------------------------
    // Take a snapshot and download
    // --------------------------------------------------------
    takeSnapshot() {
        // Combine video + canvas overlay
        const snapshotCanvas = document.createElement('canvas');
        snapshotCanvas.width = this.video.videoWidth;
        snapshotCanvas.height = this.video.videoHeight;
        const snapCtx = snapshotCanvas.getContext('2d');

        // Draw mirrored video
        snapCtx.translate(snapshotCanvas.width, 0);
        snapCtx.scale(-1, 1);
        snapCtx.drawImage(this.video, 0, 0);
        snapCtx.setTransform(1, 0, 0, 1, 0, 0);

        // Draw makeup overlay
        snapCtx.drawImage(this.canvas, 0, 0);

        // Download
        const link = document.createElement('a');
        link.download = 'luxe-beauty-tryon-' + Date.now() + '.png';
        link.href = snapshotCanvas.toDataURL('image/png');
        link.click();
    },

    // --------------------------------------------------------
    // Reset everything
    // --------------------------------------------------------
    reset() {
        this.settings.intensity = 0.7;
        this.settings.thickness = 3;
        this.settings.shadeCode = '#c0392b';
        document.getElementById('intensitySlider').value = 70;
        document.getElementById('intensityValue').textContent = '70%';
        document.getElementById('thicknessSlider').value = 3;
        document.getElementById('thicknessValue').textContent = '3px';
    },

    // --------------------------------------------------------
    // Utility: hex color to rgba string
    // --------------------------------------------------------
    hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
};
