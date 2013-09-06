/**!
 * make.js, script to build the website for MPC-HC
 * Released under the terms of MIT license
 *
 * https://github.com/mpc-hc/mpc-hc.org
 *
 * Copyright (C) 2013 MPC-HC Team
 */

"use strict";

require("shelljs/make");
var fs = require("fs");
var rootDir = __dirname + "/";         // absolute path to project's root
var buildDir = rootDir + "_site/";


function writeText(file, text) {
    var content = fs.writeFileSync(file, text, "utf-8");
    return content;
}


function minify() {
    var cleanCSS = require("clean-css");
    var uglifyJS = require("uglify-js");

    echo();
    echo("### Combining css files...");

    // pack.css
    var inCss = cat(["css/bootstrap.css",
                     "css/font-awesome.css",
                     "css/jquery.fancybox.css",
                     "css/jquery.fancybox-thumbs.css",
                     "css/style.css"]);

    var minifiedCss = cleanCSS.process(inCss, {
        removeEmpty: true,
        keepSpecialComments: 0
    });

    writeText(buildDir + "css/pack.css", minifiedCss);

    echo();
    echo("### Combining js files...");

    var inJs = cat(["js/plugins.js",
                    "js/bootstrap.js",
                    "js/jquery.mousewheel.js",
                    "js/jquery.fancybox.js",
                    "js/jquery.fancybox-thumbs.js"]);

    var minifiedJs = uglifyJS.minify(inJs, {
        compress: true,
        fromString: true, // this is needed to pass JS source code instead of filenames
        mangle: true,
        warnings: false
    });

    writeText(buildDir + "js/pack.js", minifiedJs.code);

    // JS for IE < 9
    var inJsIE = cat(["js/html5shiv.js",
                      "js/respond.js"]);

    var minifiedJsIE = uglifyJS.minify(inJsIE, {
        compress: true,
        fromString: true, // this is needed to pass JS source code instead of filenames
        mangle: true,
        warnings: false
    });

    writeText(buildDir + "js/html5shiv-respond.min.js", minifiedJsIE.code);
}


(function () {
    //
    // make website
    //
    target.website = function () {
        cd(rootDir);
        //echo();
        //echo("### Building site and posts...");
        exec("jekyll build");

        echo();
        echo("### Removing files we don't need...");

        cd(buildDir);

        var filesToRemoveFromDist = [
            "*.css",
            "*.gif",
            "*.js",
            "*.png",
            "css/*.css",
            "favicon.ico",
            "js/*.js"
        ];

        rm("-rf", filesToRemoveFromDist);


        echo();
        echo("### Copying files...");

        cd("../");
        var filesToCopyToDist = [
            "apple-touch-icon-precomposed.png",
            "favicon.ico",
            "robots.txt",
            "version.txt"
        ];

        cp("-f", filesToCopyToDist, buildDir);

        minify();

    };


    //
    // make clean
    //
    target.clean = function () {
        cd(rootDir);
        echo();
        echo("### Cleaning build...");
        rm("-rf", buildDir);
    };


    //
    // make all
    //
    target.all = function () {
        target.website();
    };


    //
    // make rebuild
    //
    target.rebuild = function () {
        target.clean();
        target.website();
    };


    //
    // make server
    //
    target.server = function () {
        //echo();
        //echo("### Starting Jekyll's webserver...");
        exec("jekyll serve", {async: true});
        target.website();
    };


    //
    // make help
    //
    target.help = function () {
        echo("Available targets:");
        echo("  website  builds the website");
        echo("  server   starts the webserver");
        echo("  clean    cleans the built website");
        echo("  rebuild  rebuilds the website");
        echo("  help     shows this help message");
    };

}());
