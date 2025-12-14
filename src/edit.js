/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    __experimentalUnitControl as UnitControl,
    ColorPicker,
    __experimentalHStack as HStack,
    __experimentalVStack as VStack,
    __experimentalText as Text,
    BaseControl,
} from '@wordpress/components';
import { useEffect, useRef, useCallback } from '@wordpress/element';

/**
 * Color Control Component
 */
const ColorControl = ({ label, value, onChange }) => {
    return (
        <BaseControl label={label} __nextHasNoMarginBottom>
            <ColorPicker
                color={value}
                onChange={onChange}
                enableAlpha={true}
            />
        </BaseControl>
    );
};

/**
 * Editor component
 */
export default function Edit({ attributes, setAttributes }) {
    const {
        faceColor,
        ringColor,
        minuteHandColor,
        hourHandColor,
        gap,
        maxHeight,
        containerPadding,
        aspectRatioWidth,
        aspectRatioHeight,
        rotationSpeed,
        sizeDesktop,
        sizeTablet,
        sizeTabletSmall,
        sizeMobile,
        breakpointDesktop,
        breakpointTablet,
        breakpointMobile,
    } = attributes;

    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const clocksRef = useRef([]);
    const animationRef = useRef(null);
    const isAnimatingRef = useRef(false);
    const lastFrameTimeRef = useRef(performance.now());

    const blockProps = useBlockProps({
        ref: containerRef,
        className: 'clock-grid-container',
        style: {
            maxHeight: `${maxHeight}px`,
            padding: `${containerPadding}px`,
            aspectRatio: `${aspectRatioWidth} / ${aspectRatioHeight}`,
        },
    });

    // Get clock size based on container width
    const getClockSize = useCallback((containerWidth) => {
        if (containerWidth <= breakpointMobile) return sizeMobile;
        if (containerWidth <= breakpointTablet) return sizeTabletSmall;
        if (containerWidth <= breakpointDesktop) return sizeTablet;
        return sizeDesktop;
    }, [sizeDesktop, sizeTablet, sizeTabletSmall, sizeMobile, breakpointDesktop, breakpointTablet, breakpointMobile]);

    // Normalize angle to 0-360
    const normalizeAngle = (deg) => ((deg % 360) + 360) % 360;

    // Draw all clocks
    const drawClocks = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        const rect = container.getBoundingClientRect();
        const clockSize = getClockSize(rect.width);

        ctx.clearRect(0, 0, rect.width, rect.height);

        const radius = clockSize / 2;
        const ringWidth = radius * 0.08;
        const hourHandLength = radius * 0.44;
        const minuteHandLength = radius * 0.68;
        const hourHandWidth = radius * 0.128;
        const minuteHandWidth = radius * 0.104;
        const pivotRadius = radius * 0.052;
        const faceRadius = radius * 0.92;
        const ringRadius = radius - ringWidth / 2;

        const clocks = clocksRef.current;
        for (let i = 0; i < clocks.length; i++) {
            const clock = clocks[i];
            const cx = clock.cx;
            const cy = clock.cy;

            // Draw face
            ctx.beginPath();
            ctx.arc(cx, cy, faceRadius, 0, Math.PI * 2);
            ctx.fillStyle = faceColor;
            ctx.fill();

            // Draw ring
            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = ringColor;
            ctx.lineWidth = ringWidth;
            ctx.stroke();

            // Draw hour hand
            const hourRad = (clock.hourAngle - 90) * (Math.PI / 180);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(hourRad) * hourHandLength, cy + Math.sin(hourRad) * hourHandLength);
            ctx.strokeStyle = hourHandColor;
            ctx.lineWidth = hourHandWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Draw minute hand
            const minRad = (clock.currentMinuteAngle - 90) * (Math.PI / 180);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(minRad) * minuteHandLength, cy + Math.sin(minRad) * minuteHandLength);
            ctx.strokeStyle = minuteHandColor;
            ctx.lineWidth = minuteHandWidth;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Draw pivot
            ctx.beginPath();
            ctx.arc(cx, cy, pivotRadius, 0, Math.PI * 2);
            ctx.fillStyle = hourHandColor;
            ctx.fill();
        }
    }, [faceColor, ringColor, minuteHandColor, hourHandColor, getClockSize]);

    // Animation loop
    const animate = useCallback(() => {
        const now = performance.now();
        const deltaTime = Math.min((now - lastFrameTimeRef.current) * 0.001, 0.1);
        lastFrameTimeRef.current = now;

        let needsUpdate = false;
        const maxDelta = rotationSpeed * deltaTime;
        const clocks = clocksRef.current;

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

        if (needsUpdate || isAnimatingRef.current) {
            isAnimatingRef.current = needsUpdate;
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [rotationSpeed, drawClocks]);

    // Initialize clocks
    const initClocks = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const clockSize = getClockSize(rect.width);

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';

        const ctx = canvas.getContext('2d');
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const cols = Math.max(1, Math.floor((rect.width + gap) / (clockSize + gap)));
        const rows = Math.max(1, Math.floor((rect.height + gap) / (clockSize + gap)));
        const squareSize = Math.min(cols, rows);

        const totalWidth = squareSize * clockSize + (squareSize - 1) * gap;
        const totalHeight = squareSize * clockSize + (squareSize - 1) * gap;
        const offsetX = (rect.width - totalWidth) / 2;
        const offsetY = (rect.height - totalHeight) / 2;

        const oldClocks = clocksRef.current;
        const newClocks = [];

        for (let r = 0; r < squareSize; r++) {
            for (let c = 0; c < squareSize; c++) {
                const idx = r * squareSize + c;
                const cx = offsetX + c * (clockSize + gap) + clockSize / 2;
                const cy = offsetY + r * (clockSize + gap) + clockSize / 2;

                if (oldClocks[idx]) {
                    newClocks.push({
                        cx,
                        cy,
                        currentMinuteAngle: oldClocks[idx].currentMinuteAngle,
                        targetMinuteAngle: oldClocks[idx].targetMinuteAngle,
                        hourAngle: oldClocks[idx].hourAngle,
                        lastMinuteAngle: oldClocks[idx].lastMinuteAngle,
                    });
                } else {
                    newClocks.push({
                        cx,
                        cy,
                        currentMinuteAngle: 0,
                        targetMinuteAngle: 0,
                        hourAngle: 0,
                        lastMinuteAngle: 0,
                    });
                }
            }
        }

        clocksRef.current = newClocks;
        drawClocks();
    }, [gap, getClockSize, drawClocks]);

    // Handle mouse move
    const handleMouseMove = useCallback((e) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;

        const clocks = clocksRef.current;
        for (let i = 0; i < clocks.length; i++) {
            const clock = clocks[i];
            const dx = relX - clock.cx;
            const dy = relY - clock.cy;
            const angleRad = Math.atan2(dy, dx);
            clock.targetMinuteAngle = normalizeAngle(angleRad * (180 / Math.PI) + 90);
        }

        if (!isAnimatingRef.current) {
            isAnimatingRef.current = true;
            lastFrameTimeRef.current = performance.now();
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [animate]);

    // Initialize on mount and attribute changes
    useEffect(() => {
        initClocks();

        const resizeObserver = new ResizeObserver(() => {
            initClocks();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [initClocks]);

    // Re-draw when colors change
    useEffect(() => {
        drawClocks();
    }, [faceColor, ringColor, minuteHandColor, hourHandColor, drawClocks]);

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Colors', 'clock-grid')} initialOpen={true}>
                    <VStack spacing={4}>
                        <ColorControl
                            label={__('Face Color', 'clock-grid')}
                            value={faceColor}
                            onChange={(value) => setAttributes({ faceColor: value })}
                        />
                        <ColorControl
                            label={__('Ring Color', 'clock-grid')}
                            value={ringColor}
                            onChange={(value) => setAttributes({ ringColor: value })}
                        />
                        <ColorControl
                            label={__('Minute Hand Color', 'clock-grid')}
                            value={minuteHandColor}
                            onChange={(value) => setAttributes({ minuteHandColor: value })}
                        />
                        <ColorControl
                            label={__('Hour Hand Color', 'clock-grid')}
                            value={hourHandColor}
                            onChange={(value) => setAttributes({ hourHandColor: value })}
                        />
                    </VStack>
                </PanelBody>

                <PanelBody title={__('Layout', 'clock-grid')} initialOpen={false}>
                    <VStack spacing={4}>
                        <RangeControl
                            label={__('Max Height (px)', 'clock-grid')}
                            value={maxHeight}
                            onChange={(value) => setAttributes({ maxHeight: value })}
                            min={100}
                            max={2000}
                            step={10}
                        />
                        <RangeControl
                            label={__('Container Padding (px)', 'clock-grid')}
                            value={containerPadding}
                            onChange={(value) => setAttributes({ containerPadding: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Gap Between Clocks (px)', 'clock-grid')}
                            value={gap}
                            onChange={(value) => setAttributes({ gap: value })}
                            min={0}
                            max={50}
                        />
                        <HStack spacing={2}>
                            <RangeControl
                                label={__('Aspect Ratio Width', 'clock-grid')}
                                value={aspectRatioWidth}
                                onChange={(value) => setAttributes({ aspectRatioWidth: value })}
                                min={1}
                                max={16}
                            />
                            <RangeControl
                                label={__('Aspect Ratio Height', 'clock-grid')}
                                value={aspectRatioHeight}
                                onChange={(value) => setAttributes({ aspectRatioHeight: value })}
                                min={1}
                                max={16}
                            />
                        </HStack>
                    </VStack>
                </PanelBody>

                <PanelBody title={__('Animation', 'clock-grid')} initialOpen={false}>
                    <RangeControl
                        label={__('Rotation Speed (deg/s)', 'clock-grid')}
                        value={rotationSpeed}
                        onChange={(value) => setAttributes({ rotationSpeed: value })}
                        min={50}
                        max={1000}
                        step={10}
                    />
                </PanelBody>

                <PanelBody title={__('Responsive Clock Sizes', 'clock-grid')} initialOpen={false}>
                    <VStack spacing={4}>
                        <RangeControl
                            label={__('Desktop Size (px)', 'clock-grid')}
                            help={__(`Used when width > ${breakpointDesktop}px`, 'clock-grid')}
                            value={sizeDesktop}
                            onChange={(value) => setAttributes({ sizeDesktop: value })}
                            min={20}
                            max={200}
                        />
                        <RangeControl
                            label={__('Tablet Size (px)', 'clock-grid')}
                            help={__(`Used when width ≤ ${breakpointDesktop}px`, 'clock-grid')}
                            value={sizeTablet}
                            onChange={(value) => setAttributes({ sizeTablet: value })}
                            min={20}
                            max={200}
                        />
                        <RangeControl
                            label={__('Tablet Small Size (px)', 'clock-grid')}
                            help={__(`Used when width ≤ ${breakpointTablet}px`, 'clock-grid')}
                            value={sizeTabletSmall}
                            onChange={(value) => setAttributes({ sizeTabletSmall: value })}
                            min={20}
                            max={200}
                        />
                        <RangeControl
                            label={__('Mobile Size (px)', 'clock-grid')}
                            help={__(`Used when width ≤ ${breakpointMobile}px`, 'clock-grid')}
                            value={sizeMobile}
                            onChange={(value) => setAttributes({ sizeMobile: value })}
                            min={20}
                            max={200}
                        />
                    </VStack>
                </PanelBody>

                <PanelBody title={__('Breakpoints', 'clock-grid')} initialOpen={false}>
                    <VStack spacing={4}>
                        <RangeControl
                            label={__('Desktop Breakpoint (px)', 'clock-grid')}
                            value={breakpointDesktop}
                            onChange={(value) => setAttributes({ breakpointDesktop: value })}
                            min={400}
                            max={1600}
                        />
                        <RangeControl
                            label={__('Tablet Breakpoint (px)', 'clock-grid')}
                            value={breakpointTablet}
                            onChange={(value) => setAttributes({ breakpointTablet: value })}
                            min={300}
                            max={1200}
                        />
                        <RangeControl
                            label={__('Mobile Breakpoint (px)', 'clock-grid')}
                            value={breakpointMobile}
                            onChange={(value) => setAttributes({ breakpointMobile: value })}
                            min={200}
                            max={800}
                        />
                    </VStack>
                </PanelBody>
            </InspectorControls>

            <div {...blockProps} onMouseMove={handleMouseMove}>
                <canvas ref={canvasRef} className="clock-grid-canvas" />
            </div>
        </>
    );
}
