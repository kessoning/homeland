const gulp = require("gulp");

const uglify = require('gulp-uglify');

const browserify = require("browserify");
 
const source = require("vinyl-source-stream");

const buffer = require('vinyl-buffer');

gulp.task("build", function() {
 
  return browserify({
 
    entries: "./src/index.js",
 
    extensions: [".js"],
 
    debug: true
 
  })
 
  .transform("glslify") // the GLSLify transform
  .transform("babelify",{ presets: ["@babel/preset-env"] })
  .bundle()
  .pipe(source("app.js")) // gives streaming vinyl file object
  // .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
  // .pipe(uglify()) // now gulp-uglify works 
  .pipe(gulp.dest("dist/js"));
}); 