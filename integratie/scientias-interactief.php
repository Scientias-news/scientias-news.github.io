<?php
/**
 * Plugin Name: Scientias Interactief embeds (voorstel)
 * Description: Automatische hoogte voor expliciet gemarkeerde Scientias-iframes.
 * Version: 1.0.0
 *
 * VOORSTEL. Dit bestand installeert zichzelf niet op WordPress.
 * Plaats na beheercontrole samen met wordpress-parent.js in één pluginmap.
 */
if (!defined('ABSPATH')) { exit; }
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script(
        'scientias-interactief-embeds',
        plugin_dir_url(__FILE__) . 'wordpress-parent.js',
        array(),
        '1.0.0',
        true
    );
});
