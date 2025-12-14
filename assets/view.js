/**
 * Clock Grid - Frontend Animation Script
 */
(function () {
    'use strict';

    /**
     * Initialize a single clock grid instance
     */
    function initClockGrid(container) {
        const canvas = container.querySelector('.clock-grid-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Read settings from data attributes
        const settings = {
            faceColor: container.dataset.faceColor || 'rgba(255, 255, 255, 0.2)',
            ringColor: container.dataset.ringColor || '#000000',
            minuteHandColor: container.dataset.minuteHandColor || '#000000',
            hourHandColor: container.dataset.hourHandColor || '#000000',
            gap: parseInt(container.dataset.gap, 10) || 4,
            maxHeight: parseInt(container.dataset.maxHeight, 10) || 610,
            containerPadding: parseInt(container.dataset.containerPadding, 10) || 0,
            aspectRatioWidth: parseInt(container.dataset.aspectRatioWidth, 10) || 1,
            aspectRatioHeight: parseInt(container.dataset.aspectRatioHeight, 10) || 1,
            rotationSpeed: parseInt(container.dataset.rotationSpeed, 10) || 400,
            sizeDesktop: parseInt(container.dataset.sizeDesktop, 10) || 85,
            sizeTablet: parseInt(container.dataset.sizeTablet, 10) || 60,
            sizeTabletSmall: parseInt(container.dataset.sizeTabletSmall, 10) || 50,
            sizeMobile: parseInt(container.dataset.sizeMobile, 10) || 30,
            breakpointDesktop: parseInt(container.dataset.breakpointDesktop, 10) || 799,
            breakpointTablet: parseInt(container.dataset.breakpointTablet, 10) || 768,
            breakpointMobile: parseInt(container.dataset.breakpointMobile, 10) || 650,
        };

        // State
        let clocks = [];
        let canvasWidth = 0;
        let canvasHeight = 0;
        let lastFrameTime = performance.now();
        let isAnimating = false;
        let animationId = null;

        /**
         * Get clock size based on window width
         */
        function getClockSize() {
            const width = window.innerWidth;
            if (width <= settings.breakpointMobile) return settings.sizeMobile;
            if (width <= settings.breakpointTablet) return settings.sizeTabletSmall;
            if (width <= settings.breakpointDesktop) return settings.sizeTablet;
            return settings.sizeDesktop;
        }

        /**
         * Normalize angle to 0-360
         */
        function normalizeAngle(deg) {
            return ((deg % 360) + 360) % 360;
        }

        /**
         * Calculate grid dimensions
         */
        function calculateGridDimensions() {
            const rect = container.getBoundingClientRect();
            const paddingLeft = parseFloat(getComputedStyle(container).paddingLeft) || 0;
            const paddingRight = parseFloat(getComputedStyle(container).paddingRight) || 0;
            const paddingTop = parseFloat(getComputedStyle(container).paddingTop) || 0;
            const paddingBottom = parseFloat(getComputedStyle(container).paddingBottom) || 0;

            const availableWidth = rect.width - paddingLeft - paddingRight;
            const availableHeight = rect.height - paddingTop - paddingBottom;

            const size = getClockSize();
            const gap = settings.gap;

            const cols = Math.max(1, Math.floor((availableWidth + gap) / (size + gap)));
            const rows = Math.max(1, Math.floor((availableHeight + gap) / (size + gap)));
            const squareSize = Math.min(cols, rows);

            return { cols: squareSize, rows: squareSize, clockSize: size, gap: gap };
        }

        /**
         * Initialize clocks
         */
        function initClocks() {
            const dims = calculateGridDimensions();
            const clockSize = dims.clockSize;
            const gap = dims.gap;
            const cols = dims.cols;
            const rows = dims.rows;

            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvasWidth = rect.width;
            canvasHeight = rect.height;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = rect.width + 'px';
            canvas.style.height = rect.height + 'px';

            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);

            const totalWidth = cols * clockSize + (cols - 1) * gap;
            const totalHeight = rows * clockSize + (rows - 1) * gap;
            const offsetX = (rect.width - totalWidth) / 2;
            const offsetY = (rect.height - totalHeight) / 2;

            const oldClocks = clocks;
            const newCount = rows * cols;

            clocks = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c;
                    const cx = offsetX + c * (clockSize + gap) + clockSize / 2;
                    const cy = offsetY + r * (clockSize + gap) + clockSize / 2;

                    if (oldClocks[idx]) {
                        clocks.push({
                            cx: cx,
                            cy: cy,
                            currentMinuteAngle: oldClocks[idx].currentMinuteAngle,
                            targetMinuteAngle: oldClocks[idx].targetMinuteAngle,
                            hourAngle: oldClocks[idx].hourAngle,
                            lastMinuteAngle: oldClocks[idx].lastMinuteAngle,
                        });
                    } else {
                        clocks.push({
                            cx: cx,
                            cy: cy,
                            currentMinuteAngle: 0,
                            targetMinuteAngle: 0,
                            hourAngle: 0,
                            lastMinuteAngle: 0,
                        });
                    }
                }
            }

            drawClocks();
        }

        /**
         * Draw all clocks
         */
        function drawClocks() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            const clockSize = getClockSize();
            const radius = clockSize / 2;
            const ringWidth = radius * 0.08;
            const hourHandLength = radius * 0.44;
            const minuteHandLength = radius * 0.68;
            const hourHandWidth = radius * 0.128;
            const minuteHandWidth = radius * 0.104;
            const pivotRadius = radius * 0.052;
            const faceRadius = radius * 0.92;
            const ringRadius = radius - ringWidth / 2;

            for (let i = 0; i < clocks.length; i++) {
                const clock = clocks[i];
                const cx = clock.cx;
                const cy = clock.cy;

                // Draw face
                ctx.beginPath();
                ctx.arc(cx, cy, faceRadius, 0, 6.283185307);
                ctx.fillStyle = settings.faceColor;
                ctx.fill();

                // Draw ring
                ctx.beginPath();
                ctx.arc(cx, cy, ringRadius, 0, 6.283185307);
                ctx.strokeStyle = settings.ringColor;
                ctx.lineWidth = ringWidth;
                ctx.stroke();

                // Draw hour hand
                const hourRad = (clock.hourAngle - 90) * 0.017453293;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(hourRad) * hourHandLength, cy + Math.sin(hourRad) * hourHandLength);
                ctx.strokeStyle = settings.hourHandColor;
                ctx.lineWidth = hourHandWidth;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw minute hand
                const minRad = (clock.currentMinuteAngle - 90) * 0.017453293;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo(cx + Math.cos(minRad) * minuteHandLength, cy + Math.sin(minRad) * minuteHandLength);
                ctx.strokeStyle = settings.minuteHandColor;
                ctx.lineWidth = minuteHandWidth;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Draw pivot
                ctx.beginPath();
                ctx.arc(cx, cy, pivotRadius, 0, 6.283185307);
                ctx.fillStyle = settings.hourHandColor;
                ctx.fill();
            }
        }

        /**
         * Update target angles based on cursor position
         */
        function updateTargets(x, y) {
            const rect = container.getBoundingClientRect();
            const relX = x - rect.left;
            const relY = y - rect.top;

            for (let i = 0; i < clocks.length; i++) {
                const clock = clocks[i];
                const dx = relX - clock.cx;
                const dy = relY - clock.cy;
                const angleRad = Math.atan2(dy, dx);
                clock.targetMinuteAngle = normalizeAngle(angleRad * 57.29577951 + 90);
            }
        }

        /**
         * Animation loop
         */
        function animate() {
            const now = performance.now();
            const deltaTime = Math.min((now - lastFrameTime) * 0.001, 0.1);
            lastFrameTime = now;

            let needsUpdate = false;
            const maxDelta = settings.rotationSpeed * deltaTime;

            for (let i = 0; i < clocks.length; i++) {
                const clock = clocks[i];

                let angleDiff = clock.targetMinuteAngle - clock.currentMinuteAngle;
                if (angleDiff > 180) angleDiff -= 360;
                if (angleDiff < -180) angleDiff += 360;

                let clampedDelta = angleDiff;
                if (clampedDelta > maxDelta) clampedDelta = maxDelta;
                else if (clampedDelta < -maxDelta) clampedDelta = -maxDelta;

                if (Math.abs(clampedDelta) > 0.1) needsUpdate = true;

                clock.currentMinuteAngle = normalizeAngle(clock.currentMinuteAngle + clampedDelta);

                let delta = clock.currentMinuteAngle - clock.lastMinuteAngle;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;

                clock.hourAngle += Math.abs(delta) * 0.083333333;
                clock.lastMinuteAngle = clock.currentMinuteAngle;
            }

            drawClocks();

            if (needsUpdate || isAnimating) {
                isAnimating = needsUpdate;
                animationId = requestAnimationFrame(animate);
            }
        }

        /**
         * Handle move (throttled)
         */
        let pendingMove = null;
        let moveScheduled = false;

        function scheduleMove(clientX, clientY) {
            pendingMove = { x: clientX, y: clientY };
            if (!moveScheduled) {
                moveScheduled = true;
                requestAnimationFrame(function () {
                    if (pendingMove) {
                        handleMove(pendingMove.x, pendingMove.y);
                        pendingMove = null;
                    }
                    moveScheduled = false;
                });
            }
        }

        function handleMove(clientX, clientY) {
            updateTargets(clientX, clientY);
            if (!isAnimating) {
                isAnimating = true;
                lastFrameTime = performance.now();
                animationId = requestAnimationFrame(animate);
            }
        }

        // Event listeners
        window.addEventListener('mousemove', function (e) {
            scheduleMove(e.clientX, e.clientY);
        }, { passive: true });

        let isTouching = false;
        window.addEventListener('touchstart', function (e) {
            isTouching = true;
            const t = e.touches[0];
            if (t) scheduleMove(t.clientX, t.clientY);
        }, { passive: true });

        window.addEventListener('touchmove', function (e) {
            if (isTouching) {
                const t = e.touches[0];
                if (t) scheduleMove(t.clientX, t.clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', function () {
            isTouching = false;
        }, { passive: true });

        window.addEventListener('touchcancel', function () {
            isTouching = false;
        }, { passive: true });

        // Resize handling
        let resizeTimeout = null;

        function handleResize() {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                initClocks();
            }, 150);
        }

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(function () {
                handleResize();
            });
            resizeObserver.observe(container);
        } else {
            window.addEventListener('resize', handleResize, { passive: true });
        }

        // Initialize
        initClocks();
    }

    /**
     * Initialize all clock grids on the page
     */
    function initAllClockGrids() {
        const containers = document.querySelectorAll('.clock-grid-container');
        containers.forEach(function (container) {
            initClockGrid(container);
        });
    }

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllClockGrids);
    } else {
        initAllClockGrids();
    }
})();
