const { validationResult, param, check, body, query, oneOf } = require('express-validator');

const reporter = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
    }
    next();
};

const pgIntMax = 2147483647; // postgres integer max

const messages = {
    max10: 'max length 10 characters',
    max100: 'max length 100 characters',
    max255: 'max length 255 characters',
    ascii: 'must be only ASCII characters',
    alpha: 'must be only a-z',
    alphanum: 'must be only alphanumeric',
    date: 'must be date in ISO-8601 format (YYYY-MM-DD HH:MM)',
    numeric: 'must be numeric 0-9',
    numeric_separator: 'must be numeric, allowed decimal_separator: "."',
    boolean: 'must be boolean value',
    integer: 'must be only integer',
    eventdate: 'missing eventDate object',
    location: 'missing location object',
    owner: 'missing ownerContact object',
    email: 'must be only email',
};


const validatorOptions = {};
validatorOptions.max_10_chars = { min: 1, max: 10 }
validatorOptions.max_100_chars = { min: 1, max: 100 }
validatorOptions.max_255_chars = { min: 1, max: 255 }

const validator = {};
validator.search_query = () => query('q').isLength(validatorOptions.max_100_chars).trim().escape().withMessage(messages.max100)
validator.param_id = () => param('id').isInt({ lt: pgIntMax }).withMessage(messages.integer)

validator.event_title = () => body('title').isLength(validatorOptions.max_255_chars).trim().escape().withMessage(messages.max255)
validator.event_price = () => body('price').isCurrency({ allow_negatives: false, thousands_separator: '', allow_decimal: true, require_decimal: false, digits_after_decimal: [1, 2] }).trim().withMessage(messages.numeric_separator)
validator.event_date_exists = () => body('eventDate').exists().withMessage(messages.eventdate)
validator.event_date_not_exists = () => body('eventDate').not().exists().withMessage(messages.eventdate)
validator.event_date_start = () => body('eventDate.start').isISO8601({ strict: true }).trim().escape().withMessage(messages.date)
validator.event_date_end = () => body('eventDate.end').isISO8601({ strict: true }).trim().escape().withMessage(messages.date)
validator.event_active = () => body('active').optional().isBoolean().withMessage(messages.boolean)
validator.event_date_correct = () => [ check('eventDate.end').toDate(), check('eventDate.start').toDate().custom((startDate, { req }) => {
    if(startDate && req && req.body && req.body.eventDate && req.body.eventDate.end) {
        if (startDate.getTime() > req.body.eventDate.end.getTime()) {
            throw new Error('start date must be before end date');
        }
    }
    return true;
})];

validator.location_exists = () => body('location').exists().withMessage(messages.location)
validator.location_not_exists = () => body('location').not().exists().withMessage(messages.location)
validator.location_id = () => body('location.id').isInt({ lt: pgIntMax }).withMessage(messages.integer)
validator.location_place = () => body('location.place').isLength(validatorOptions.max_255_chars).trim().escape().withMessage(messages.max255)
validator.location_city = () => body('location.city').isLength(validatorOptions.max_255_chars).trim().escape().withMessage(messages.max255)
validator.location_state = () => body('location.state').isLength(validatorOptions.max_255_chars).trim().escape().withMessage(messages.max255)
validator.location_seats = () => body('location.seats').isInt({ gt: 0, lt: pgIntMax }).isLength(validatorOptions.max_10_chars).withMessage(messages.integer)

validator.owner_exists = () => body('ownerContact').exists().withMessage(messages.owner)
validator.owner_not_exists = () => body('ownerContact').not().exists().withMessage(messages.owner)
validator.owner_id = () => body('ownerContact.id').isInt({ lt: pgIntMax }).isLength(validatorOptions.max_10_chars).withMessage(messages.integer)
validator.owner_email = () => body('ownerContact.email').optional().isEmail().isLength(validatorOptions.max_100_chars).normalizeEmail().withMessage(messages.email)
validator.owner_firstname = () => body('ownerContact.firstName').isLength(validatorOptions.max_100_chars).trim().escape().withMessage(messages.max100)
validator.owner_lastname = () => body('ownerContact.lastName').isLength(validatorOptions.max_100_chars).trim().escape().withMessage(messages.max100)
validator.owner_phone = () => body('ownerContact.phone').isNumeric().isLength({ min: 6, max: 20 }).trim().escape().withMessage(messages.numeric)

exports.validateId = [
    validator.param_id(),
    reporter
];

exports.search = [
    validator.search_query(),
    reporter
];

exports.createEvent = [
    validator.event_title(),
    validator.event_price(),
    validator.event_date_start(),
    validator.event_date_end(),
    validator.event_date_correct(),
    
    // check if location property exists, we require only location.id or rest of the data is required,
    // because we need to create new location record
    validator.location_exists(),
    oneOf([
        [
            validator.location_id()
        ],
        [
            validator.location_place(),            
            validator.location_city(),
            validator.location_state(),
            validator.location_seats(),
        ]
    ]),

    // check if ownerContact property exists, we require only ownerContact.id or rest of the data is required,
    // because we need to create new ownerContact record
    validator.owner_exists(),
    oneOf([
        [
            validator.owner_id()
        ],
        [
            validator.owner_firstname(),
            validator.owner_lastname(),
            validator.owner_phone(),
        ]
    ]),

    // optional
    validator.event_active(),
    validator.owner_email(),

    reporter
];

exports.editEvent = [
    validator.param_id(),

    // check if we have any of below parameters, we require only one of those
    validator.event_title().optional(),
    validator.event_price().optional(),
    validator.event_date_start().optional(),
    validator.event_date_end().optional(),
    validator.event_date_correct(),

    validator.location_place().optional(),
    validator.location_city().optional(),
    validator.location_state().optional(),
    validator.location_seats().optional(),
    validator.location_id().optional(),

    validator.owner_firstname().optional(),
    validator.owner_lastname().optional(),
    validator.owner_phone().optional(),
    validator.owner_id().optional(),

    // optional
    validator.event_active(),
    validator.owner_email(),

    reporter
];

exports.createLocation = [    
    validator.location_exists(),
    validator.location_place(),
    validator.location_city(),
    validator.location_state(),
    validator.location_seats(),
    reporter
];

exports.editLocation = [
    validator.param_id(),
    validator.location_exists(),
    oneOf([
        validator.location_place(),
        validator.location_city(),
        validator.location_state(),
        validator.location_seats(),
    ]),
    reporter
];

exports.createOwner = [
    validator.owner_exists(),
    validator.owner_email(),
    validator.owner_firstname(),
    validator.owner_lastname(),
    validator.owner_phone(),
    reporter
];

exports.editOwner = [
    validator.param_id(),
    validator.owner_exists(),
    validator.owner_email(),
    validator.owner_firstname().optional(),
    validator.owner_lastname().optional(),
    validator.owner_phone().optional(),
    reporter
];
