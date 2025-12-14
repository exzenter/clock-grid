=== Clock Grid ===
Contributors: exzent.de
Tags: block, animation, clock, canvas, interactive
Requires at least: 6.0
Tested up to: 6.4
Stable tag: 1.0.1
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An interactive Gutenberg block displaying a canvas animation with a grid of clocks that follow mouse/touch movement.

== Description ==

Clock Grid is a WordPress block plugin that creates an interactive canvas animation featuring a grid of analog clocks. The clock hands follow your mouse or touch input, creating a mesmerizing visual effect.

**Features:**

* Fully customizable colors (face, ring, minute hand, hour hand)
* Adjustable layout settings (max height, padding, gap, aspect ratio)
* Configurable animation speed
* Responsive clock sizes with customizable breakpoints
* Smooth 60fps animation with touch support
* Works in the block editor with live preview

== Installation ==

1. Upload the `clock-grid` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Add the "Clock Grid" block to any page or post

== Frequently Asked Questions ==

= How do I customize the colors? =

Select the Clock Grid block in the editor and use the "Colors" panel in the block settings sidebar to adjust face, ring, and hand colors.

= How do I make the grid smaller on mobile? =

Use the "Responsive Clock Sizes" panel to set different clock sizes for desktop, tablet, and mobile. Adjust the breakpoints in the "Breakpoints" panel if needed.

== Changelog ==

= 1.0.1 =
* Improved editor styling - clocks now display at correct size matching frontend
* Color pickers now use compact dropdown popouts instead of inline pickers
* Added block supports for alignment, spacing (margin/padding), dimensions, position, and border
* Fixed aspect ratio functionality with proper width/height calculation
* Enhanced color preview in settings panel

= 1.0.0 =
* Initial release
