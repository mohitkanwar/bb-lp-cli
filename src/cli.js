
var cliparse = require('cliparse');
var parsers = cliparse.parsers;
var pckJson = require('../package.json');
var colors = require('colors');
var utils = require('../lib/utils');
var config = require('../lib/config');

/*----------------------------------------------------------------*/
/* #TODO parse the commands folder and auto generate commands
/*----------------------------------------------------------------*/
var BBCLI = cliparse.cli({
    name: pckJson.name,
    version: pckJson.version,
    description: 'Backbase CLI tool',

    commands: [

        /*----------------------------------------------------------------*/
        /* Generate Widget
        /*----------------------------------------------------------------*/
        cliparse.command('generate', {
            description: 'Template path can be a local folder or the repository url. Default is using `widget-ng-template`.',
            args: [
                cliparse.argument('template', {
                    description: 'Template git repo or file system path',
                    default: 'git@bitbucket.org:backbase/lpg-generator-widget-ng.git'
                }),
                cliparse.argument('target', {
                    description: 'Target Folder',
                    default: utils.projectPath()
                })
            ],
            options: [
                cliparse.flag('prcessImages', { aliases: ['i'], description: 'Process images by template engine. Images are excluded by default.'})
            ]
        }, require('../lib/commands/common/generate') ),

        /*----------------------------------------------------------------*/
        /* Start Widget
        /*----------------------------------------------------------------*/
        cliparse.command('start', {
            description: 'Start local development brwserSync server on http://localhost:3000/.',
            args: [

            ],
            options: [
                cliparse.flag('apiVersion', { aliases: ['a'], description: 'Add version to raml api paths'}),
                cliparse.option('logLevel', {
                    aliases: ['l'],
                    description: 'Log level notifications' + [,
                                    'info'.info,
                                    //'debug'.debug,
                                    //'warn'.warn,
                                    'silent'.gray
                    ].join(' | '),
                    parser: function(v) {
                        if (['debug', 'info', 'silent', 'warn', 'error'].indexOf(v) !== -1) return {success: v};
                        else return {error: 'Wrong log level setting indicator'.red};
                    },
                    default: 'info'
                }),
                cliparse.option('port', {
                    aliases: ['p'],
                    parser: cliparse.parsers.intParser,
                    description: 'Server port',
                    defaultValue: null
                }),
                cliparse.flag('expand', {
                    aliases: ['e'],
                    description: 'Do not minify files.',
                    default: false
                }),
                cliparse.option('template', {
                    parser: cliparse.parsers.stringParser,
                    description: 'Template to use for standalone mode, default to local ' + 'index.dev.html'.green,
                    defaultValue: null
                }),
                cliparse.flag('deploy', {
                    aliases: ['d'],
                    description: 'Deploy item to running portal'
                }),
                cliparse.option('entry', {
                    parser: function(input) {
                        config.entry = utils.defaults(input, {
                            name: config.entry.name,
                            path: config.entry.path
                        });
                        return parsers.success(config.entry);
                    },
                    description: 'Javascript entry config option'
                }),
                cliparse.flag('withModuleId', {
                    aliases: ['m'],
                    description: 'Build with AMD module ID in definition',
                    default: false
                })
            ]
        }, require('../lib/commands/common/start') ),

        /*----------------------------------------------------------------*/
        /* Test Widget
        /*----------------------------------------------------------------*/
        /**
         * @todo add unit / functional / api tests
         * @type {String}
         */
        cliparse.command('test', {
            description: 'Test the widget/module using karma test runner and PhantomJS',
            args: [
                // cliparse.argument('type', { description: "Unit test", default: 'unit', })
            ],
            options: [
                cliparse.flag('watch', { aliases: ['w'], description: 'Watch files'}),
                cliparse.option('coverage', {
                    aliases: ['c'],
                    description: 'With coverage',
                    parser: function(v) {
                        if (['text-summary', 'text'].indexOf(v) === -1) {
                            v = 'text-summary';
                        }
                        return {success: v};
                    }
                }),
                cliparse.option('config', { description: 'Custom karma configuration file'}),
                cliparse.option('browsers', { description: 'A comma separated list of browsers to launch and capture'}),
                cliparse.option('moduleDirectories', { description: 'A comma separated list of the shared components'})
            ]
        }, require('../lib/commands/common/test') ),

        /*----------------------------------------------------------------*/
        /* Build Widget
        /*----------------------------------------------------------------*/
        cliparse.command('build', {
            description: 'Bundles pacakge resources.',
            args: [
                // cliparse.argument('config', {
                //     description: 'path to config file for components management',
                //     default: ''
                // }),
                // cliparse.argument('excludes', {
                //     description: 'array of components to exclude',
                //     default: ''
                // }),
                // cliparse.argument('destination', {
                //     description: 'name of target file',
                //     default: ''
                // })
            ],
            options: [
                cliparse.flag('fullTest', { aliases: ['f'], description: 'Run a full test (unit/lint)'}),
                cliparse.flag('all', { aliases: ['a'], description: 'Include all external dependencies'}),
                cliparse.flag('withTemplates', { aliases: ['t'], description: 'Bundle HTML templates into build file (for widgets)'}),
                cliparse.flag('withModuleId', {
                    aliases: ['m'],
                    description: 'Build with AMD module ID in definition',
                    default: false
                }),
                cliparse.flag('withPerformance', { aliases: ['p'], description: 'Parse performance annotations'}),
                cliparse.flag('expand', { aliases: ['e'], description: 'Do not minify files.'}),
                cliparse.option('webpackconfig', {
                    description: 'Build with a different webpack config'
                }),
                cliparse.option('moduleDirectories', { description: 'A comma separated list of the shared components'})
            ]
        }, require('../lib/commands/common/build') ),
        /*----------------------------------------------------------------*/
        /* Deploy package
        /*----------------------------------------------------------------*/
        cliparse.command('deploy', {
            description: 'Deploys package in CXP portal.',
            args: [],
            options: [
                cliparse.flag('all', { aliases: ['a'], description: 'Deploy package plus dependencies.'})
            ]
        }, require('../lib/commands/common/deploy') ),
        /*----------------------------------------------------------------*/
        /* Bump bower version
        /*----------------------------------------------------------------*/
        cliparse.command('bump', {
            description: 'Bump package version will affect README.md and CHANGELOG.md',
            args: [
                cliparse.argument('VERSION', {
                    description: [  'major'.gray + ' [X'.green + '.x.x]',
                                    'minor'.gray + ' [x.' +'X'.green + '.x]',
                                    'patch'.gray + ' [x.x.'+ 'X'.green + ']',
                                    'pre'.gray + ' [x.x.x-pre.'+ 'X'.green + ']'
                                    // @todo support for specific tags
                                ].join(' '),
                    parser: function(v) {
                        if (['major', 'minor', 'patch','pre'].indexOf(v) !== -1) return {success: v};
                        else return {error: 'Wrong version!'.red};
                    }
                }),
                cliparse.argument('MESSAGE', {
                    description: 'Bump message',
                    default: ''
                })
            ],
            options: [
                /**
                 * Add suffix for pre release versions
                 */
                cliparse.option('suffix', {
                    description: 'Pre-release suffix. Ex: -beta.0, -rc.0',
                    default: 'pre'
                }),
                cliparse.option('interactive', {
                    description: 'Non interactive bumping',
                    default: true,
                    parser: function(v) {
                        val = true;
                        try{
                            val = JSON.parse(v);
                        } catch (err) { /* do not handle just use default*/ }
                        return {success: val}
                    }
                }),
                /**
                 * @todo
                 *  - template
                 * Update the CHANGELOG file
                 */
                cliparse.option('changelog', {
                    description: 'Update CHANGELOG with commit messages',
                    default: 'CHANGELOG.md'
                })
                // deprecated will be moved to bblp docs
                // cliparse.flag('version-only', { aliases: ['v'], description: 'In version-only mode only README version section will be updated'})
            ]
        }, require('../lib/commands/common/bump') ),
        /*----------------------------------------------------------------*/
        /* Register package
        /*----------------------------------------------------------------*/
        cliparse.command('register', {
            description: 'Package manager type. Eg. `bblp register npm/bower`',
            args: [
                cliparse.argument('manager', {
                    description: 'Package manager',
                    parser: function(v) {
                        if (['bower', 'npm'].indexOf(v) !== -1) return {success: v};
                        else return {error: 'Wrong manager name!'.red};
                    },
                    default: 'bower' // will be deprecated in favor for npm
                })
            ],
            options: [
                cliparse.option('registry', {
                    description: 'Registry endpoint.',
                    parser: function(value) {
                        if( !utils.isString(value) || !utils.isUrl(value)  ) {
                            return {error: colors.error('Registry option must be an valid url endpoint')}
                        }
                        return {success: value}

                    }
                })
            ]
        }, require('../lib/commands/common/register') ),
        /*----------------------------------------------------------------*/
        /* Unregister package
        /*----------------------------------------------------------------*/
        cliparse.command('unregister', {
            description: 'Package manager type. Eg. `bblp unregister npm/bower`',
            args: [
                cliparse.argument('manager', {
                    description: 'Package manager',
                    parser: function(v) {
                        if (['bower', 'npm'].indexOf(v) !== -1) return {success: v};
                        else return {error: 'Wrong manager name!'.red};
                    },
                    default: 'bower' // will be deprecated in favor for npm
                })
            ],
            options: [
                cliparse.option('registry', {
                    description: 'Registry endpoint.',
                    parser: function(value) {
                        if( !utils.isString(value) || !utils.isUrl(value)  ) {
                            return {error: colors.error('Registry option must be an valid url endpoint')}
                        }
                        return {success: value}

                    }
                }),
                cliparse.flag('force', { aliases: ['f'], description: 'force', default: false})
            ]
        }, require('../lib/commands/common/unregister') ),
         /*----------------------------------------------------------------*/
        /* Clean Package
        /*----------------------------------------------------------------*/
        cliparse.command('clean', {
            description: 'Clean the package generated folders',
            args: [],
            options: []
        }, require('../lib/commands/common/clean') ),
        /*----------------------------------------------------------------*/
        /* DEP Custom Build
        /*----------------------------------------------------------------*/
        // cliparse.command('custom-build', {
        //     description: '[DEP] Builds the widget/module using custom entry points.',
        //     args: [
        //         cliparse.argument('config', {
        //             description: 'path to config file for components management',
        //             default: ''
        //         })
        //     ],
        //     options: [
        //         cliparse.flag('withTemplates', { aliases: ['t'], description: 'Bundle HTML templates into build file (for widgets)'}),
        //         cliparse.flag('useUnminified', { aliases: ['u'], description: 'Build with unminified scripts'}),
        //         cliparse.flag('verbose', { aliases: ['v'], description: 'Flag to turn on/off webpack output'}),
        //         cliparse.flag('withPerformance', { aliases: ['p'], description: 'Parse performance annotations'})
        //     ]
        // }, require('../lib/commands/common/custom-build') ),

        /*----------------------------------------------------------------*/
        /* Build docs
        /*----------------------------------------------------------------*/
        cliparse.command('docs', {
            description: 'Generates documentation',
            args: [

            ],
            options: [
                cliparse.flag('api', { aliases: ['a'], description: 'Generate API reference markdown'}),
                cliparse.option('services', {
                    description: 'Generate documentation from RAML files. Used for raml services'
                }),
                cliparse.flag('stats', { aliases: ['s'], description: 'Generate checklist statistics markdown'}),
                cliparse.flag('report', { aliases: ['r'], description: 'Generate an .csv checklist report file'}),
                cliparse.option('update', { description: 'Update manual checklist'})

            ]
        }, require('../lib/commands/common/docs') ),
        /*----------------------------------------------------------------*/
        /* Commit - Commitizen hook
        /*----------------------------------------------------------------*/
        cliparse.command('commit', {
            description: 'Use conventional commit messaged. Default will run git commit.',
            args: [

            ],
            options: [

            ]
        }, require('../lib/commands/common/commit') ),

         /*----------------------------------------------------------------*/
        /* Launchpad theme Commands
        /*----------------------------------------------------------------*/
        cliparse.command('theme', require('../lib/commands/theme'))
    ]
});

cliparse.parse(BBCLI);
