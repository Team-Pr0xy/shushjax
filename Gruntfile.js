module.exports = function(grunt) {
 
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      all: ['shushjax.js']
    },
    jshint: {
      all: ['Gruntfile.js', 'shushjax.js']
    }
  });
 
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jslint');
  //grunt.loadNpmTasks('grunt-jslint');
  grunt.registerTask('default', 'jshint');
  grunt.registerTask('travis', 'jshint');
 
};
