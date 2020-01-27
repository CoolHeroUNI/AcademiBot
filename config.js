module.exports.dbConfig = {
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    timezone: process.env.DATABASE_TIMEZONE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    dialect: process.env.DATABASE_DIALECT,
    benchmark: true,
    pool: {
        acquire: parseInt(process.env.DATABASE_ACQUIRE_TIME),
        max: parseInt(process.env.DATABASE_MAX_CONNECTION),
        min: parseInt(process.env.DATABASE_MIN_CONNECTION),
        idle: parseInt(process.env.DATABASE_IDLE_TIME),
        evict: parseInt(process.env.DATABASE_EVICT_TIME)
    }
};

module.exports.env = process.env.NODE_ENVIRONMENT;

module.exports.ownUrl = process.env.SERVER_OWN_URL;

module.exports.pingInterval = parseInt(process.env.PROCESS_OWN_PING_INTERVAL);

module.exports.cacheTime = parseInt(process.env.CACHE_TIME);

module.exports.awsCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};

module.exports.s3Config = {
    region: process.env.AWS_S3_REGION,
    bucket: process.env.AWS_S3_BUCKET,
    cache: parseInt(process.env.AWS_S3_CACHE)
};

module.exports.fbConfig = {
    token: process.env.FACEBOOK_TOKEN,
    version: process.env.FACEBOOK_API_VERSION,
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN
};

module.exports.dialogflowConfig = {
    path: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    json: process.env.GOOGLE_DIALOGFLOW_JSON,
    lang: process.env.GOOGLE_DIALOGFLOW_LANGUAGE,
    project: JSON.parse(process.env.GOOGLE_DIALOGFLOW_JSON)['project_id']
};

module.exports.academibotConfig = {
    mediaFolder: process.env.ACADEMIBOT_MEDIA_FOLDER,
    bienvenida: process.env.ACADEMIBOT_BIENVENIDA,
    usersFolder: process.env.ACADEMIBOT_USERS_FOLDER
};

module.exports.serverConfig = {
    cookie: {
        name: process.env.SERVER_COOKIE_NAME,
        secret: process.env.SERVER_COOKIE_SECRET,
        maxAge: parseInt(process.env.SERVER_COOKIE_MAXAGE)
   },
    port: process.env.PORT
};

module.exports.reportes = {
    intervalo: parseFloat(process.env.REPORT_TIME_INTERVAL),
    folder: process.env.REPORT_FOLDER
};

module.exports.jobs = {
    ping: process.env.JOBS_PING,
    reporte: process.env.JOBS_REPORTE,
    batch_recursos: process.env.JOBS_BATCH_RECURSOS
};