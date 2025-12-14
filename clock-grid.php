<?php
/**
 * Plugin Name:       Clock Grid
 * Description:       A Gutenberg block displaying an interactive canvas animation with a grid of clocks that follow mouse/touch movement.
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Version:           1.0.0
 * Author:            Exzent.de 
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       clock-grid
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'CLOCK_GRID_VERSION', '1.0.0' );
define( 'CLOCK_GRID_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CLOCK_GRID_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 */
function clock_grid_register_block() {
    register_block_type( CLOCK_GRID_PLUGIN_DIR . 'build', array(
        'render_callback' => 'clock_grid_render_callback',
    ) );
}
add_action( 'init', 'clock_grid_register_block' );

/**
 * Renders the block on the frontend.
 *
 * @param array  $attributes Block attributes.
 * @param string $content    Block content.
 * @return string Rendered block HTML.
 */
function clock_grid_render_callback( $attributes, $content ) {
    // Enqueue frontend script
    wp_enqueue_script(
        'clock-grid-view',
        CLOCK_GRID_PLUGIN_URL . 'assets/view.js',
        array(),
        CLOCK_GRID_VERSION,
        true
    );

    // Default values
    $defaults = array(
        'faceColor'         => 'rgba(255, 255, 255, 0.2)',
        'ringColor'         => '#000000',
        'minuteHandColor'   => '#000000',
        'hourHandColor'     => '#000000',
        'gap'               => 4,
        'maxHeight'         => 610,
        'containerPadding'  => 0,
        'aspectRatioWidth'  => 1,
        'aspectRatioHeight' => 1,
        'rotationSpeed'     => 400,
        'sizeDesktop'       => 85,
        'sizeTablet'        => 60,
        'sizeTabletSmall'   => 50,
        'sizeMobile'        => 30,
        'breakpointDesktop' => 799,
        'breakpointTablet'  => 768,
        'breakpointMobile'  => 650,
    );

    $atts = wp_parse_args( $attributes, $defaults );

    // Generate unique ID
    $unique_id = 'clock-grid-' . uniqid();

    // Build data attributes
    $data_attrs = sprintf(
        'data-face-color="%s" data-ring-color="%s" data-minute-hand-color="%s" data-hour-hand-color="%s" data-gap="%d" data-max-height="%d" data-container-padding="%d" data-aspect-ratio-width="%d" data-aspect-ratio-height="%d" data-rotation-speed="%d" data-size-desktop="%d" data-size-tablet="%d" data-size-tablet-small="%d" data-size-mobile="%d" data-breakpoint-desktop="%d" data-breakpoint-tablet="%d" data-breakpoint-mobile="%d"',
        esc_attr( $atts['faceColor'] ),
        esc_attr( $atts['ringColor'] ),
        esc_attr( $atts['minuteHandColor'] ),
        esc_attr( $atts['hourHandColor'] ),
        intval( $atts['gap'] ),
        intval( $atts['maxHeight'] ),
        intval( $atts['containerPadding'] ),
        intval( $atts['aspectRatioWidth'] ),
        intval( $atts['aspectRatioHeight'] ),
        intval( $atts['rotationSpeed'] ),
        intval( $atts['sizeDesktop'] ),
        intval( $atts['sizeTablet'] ),
        intval( $atts['sizeTabletSmall'] ),
        intval( $atts['sizeMobile'] ),
        intval( $atts['breakpointDesktop'] ),
        intval( $atts['breakpointTablet'] ),
        intval( $atts['breakpointMobile'] )
    );

    // Build inline styles
    $style = sprintf(
        'max-height: %dpx; padding: %dpx; aspect-ratio: %d / %d;',
        intval( $atts['maxHeight'] ),
        intval( $atts['containerPadding'] ),
        intval( $atts['aspectRatioWidth'] ),
        intval( $atts['aspectRatioHeight'] )
    );

    // Build wrapper attributes
    $wrapper_attributes = get_block_wrapper_attributes( array(
        'id'    => $unique_id,
        'class' => 'clock-grid-container',
        'style' => $style,
    ) );

    return sprintf(
        '<div %s %s><canvas class="clock-grid-canvas"></canvas></div>',
        $wrapper_attributes,
        $data_attrs
    );
}
