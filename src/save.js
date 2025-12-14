/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Save component - renders the frontend markup
 */
export default function save({ attributes }) {
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

    const blockProps = useBlockProps.save({
        className: 'clock-grid-container',
        style: {
            maxHeight: `${maxHeight}px`,
            padding: `${containerPadding}px`,
            aspectRatio: `${aspectRatioWidth} / ${aspectRatioHeight}`,
        },
        'data-face-color': faceColor,
        'data-ring-color': ringColor,
        'data-minute-hand-color': minuteHandColor,
        'data-hour-hand-color': hourHandColor,
        'data-gap': gap,
        'data-max-height': maxHeight,
        'data-container-padding': containerPadding,
        'data-aspect-ratio-width': aspectRatioWidth,
        'data-aspect-ratio-height': aspectRatioHeight,
        'data-rotation-speed': rotationSpeed,
        'data-size-desktop': sizeDesktop,
        'data-size-tablet': sizeTablet,
        'data-size-tablet-small': sizeTabletSmall,
        'data-size-mobile': sizeMobile,
        'data-breakpoint-desktop': breakpointDesktop,
        'data-breakpoint-tablet': breakpointTablet,
        'data-breakpoint-mobile': breakpointMobile,
    });

    return (
        <div {...blockProps}>
            <canvas className="clock-grid-canvas"></canvas>
        </div>
    );
}
