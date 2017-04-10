const bluebird = require('bluebird');
const readFileSync = require('fs').readFileSync;
const readFile = bluebird.promisify(require('fs').readFile);
const yaml = require('js-yaml');

const logger = require('./logger');

const log = logger.log;




function read_config_file() {
    let config_data;
    
    try {
        log.info('Loading Config File...');
        // let f = yield readFile(__dirname + '/configs/koatest.conf', 'utf-8'); 
        let f = readFileSync(__dirname + '/configs/koatest.conf', 'utf-8'); 
        config_data = yaml.safeLoad(f); 
        log.info('Successfully loaded config file'); 
        
    }
    catch(err) {
        log.error('exception opening koatest.conf : ', err);
        return -1;
    }

    log.debug('Config Data :\n', config_data);
    return config_data;
}


// read the data from koatest.conf file and read it in Gloabl variable
let CONFIG_DATA = read_config_file();



let AVATARS = {
    female: [
        'avatar_female.png',
        'avatar_female_2.jpeg',
        'avatar_female_3.jpg',
        'avatar_female_4.jpeg',
        'avatar_female_5.jpeg',
        'avatar_female_6.jpeg',
        'avatar_female_7.jpg',
        'avatar_female_8.jpeg',
        'avatar_female_9.jpg',
        'avatar_female_10.jpeg',
        'avatar_female_11.jpg',
        'avatar_female_12.jpeg'
    ],

    male: [
        'avatar_male.jpg',
        'avatar_male_2.jpg',
        'avatar_male_3.jpg',
        'avatar_male_4.jpeg',
        'avatar_male_5.jpg',
        'avatar_male_6.png',
        'avatar_male_7.jpg',
        'avatar_male_8.png',
        'avatar_male_9.png',
        'avatar_male_10.jpg',
        'avatar_male_11.jpg',
        'avatar_male_12.jpeg'
    ]

};






exports.CONFIG_DATA = CONFIG_DATA;
exports.AVATARS = AVATARS;

