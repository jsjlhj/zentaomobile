module.exports = function(grunt)
{
    var banner      = '/*!\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * GitHub: <%= pkg.repository.url %> \n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
        ' Licensed <%= pkg.license %>\n' +
        ' */\n\n',
        statement   = '/* Some code copy from ratchet v2.0.2 (Copyright (c) 2014 connors and other contributors. Licensed under http://www.apache.org/licenses/)*/\n\n',
        srcPath     = 'src/',
        distPath    = 'dist/',
        buildPath   = 'build/',
        concatSrcPath = function(a) {return 'src/js/' + a};

    // project config
    grunt.initConfig(
    {
        pkg: grunt.file.readJSON('package.json'),

        clean:
        {
            dist: ['dist']
        },

        copy:
        {
            fonts:
            {
                expand: true,
                cwd: srcPath,
                src: 'fonts/*',
                dest: distPath
            },
            zentao:
            {
                files: 
                [
                    {expand: true, cwd: 'dist/js', src: 'zui.m.min.js', dest: '../zentao/js/lib/', filter: 'isFile'},
                    {expand: true, cwd: 'dist/css', src: 'zui.m.min.css', dest: '../zentao/css/', filter: 'isFile'}
                ]
            }
        },

        concat:
        {
            options:
            {
                banner: banner,
                stripBanners: false
            },
            js:
            {
                options:
                {
                    banner: banner + statement
                },
                src: grunt.file.readJSON(srcPath + 'js/import.json').map(concatSrcPath),
                dest: distPath + 'js/<%= pkg.name %>.js'
            }
        },

        uglify:
        {
            options:
            {
                banner: banner
            },
            js:
            {
                options: {banner: banner + statement},
                src:  ['<%= concat.js.dest %>'],
                dest: distPath + 'js/<%= pkg.name %>.min.js'
            }
        },

        less:
        {
            css:
            {
                options:
                {
                    strictMath: true,
                    sourceMap: true,
                    outputSourceFiles: true,
                    sourceMapURL: '<%= pkg.name %>.css.map',
                    sourceMapFilename: distPath + 'css/<%= pkg.name %>.css.map'
                },
                files:
                {
                    'dist/css/<%= pkg.name %>.css': srcPath + 'less/<%= pkg.name %>.less'
                }
            },
            min:
            {
                options:
                {
                    cleancss: true,
                    report: 'min'
                },
                files:
                {
                    'dist/css/<%= pkg.name %>.min.css': distPath + 'css/<%= pkg.name %>.css'
                }
            },
        },

        csscomb:
        {
            options:
            {
                config: srcPath + 'less/.csscomb.json'
            },
            'sort-dist':
            {
                files:
                {
                    'dist/css/<%= pkg.name %>.css': [distPath + 'css/<%= pkg.name %>.css']
                }
            }
        },

        usebanner:
        {
            dist:
            {
                options:
                {
                    position: 'top',
                    banner: banner + statement
                },
                files:
                {
                    src:
                    [
                        distPath + 'css/<%= pkg.name %>.css',
                        distPath + 'css/<%= pkg.name %>.min.css'
                    ]
                }
            }
        },

        watch:
        {
            src:
            {
                files: srcPath + '**',
                tasks: ['dist']
            },
            zentao:
            {
                files: srcPath + '**',
                tasks: ['dist', 'copy:zentao']
            }
        }
    });

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

    // Distribution task
    grunt.registerTask('dist-js', ['concat:js', 'uglify:js']);
    grunt.registerTask('dist-css', ['less:css', 'csscomb:sort-dist', 'less:min', 'usebanner:dist']);
    grunt.registerTask('dist-fonts', ['copy:fonts']);

    grunt.registerTask('dist', ['clean:dist', 'dist-js', 'dist-css', 'dist-fonts']);

    // The default task
    grunt.registerTask('default', ['dist']);

    // Watch task
    grunt.registerTask('watch-src', ['watch:src']);
    grunt.registerTask('watch-zentao', ['watch:zentao']);
}
