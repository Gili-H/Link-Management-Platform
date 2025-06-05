const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0', // אנו משתמשים בגרסה 3 של OpenAPI
    info: {
      title: 'TinyUrl API',
      version: '1.0.0',
      description: 'API documentation for the TinyUrl service, including link shortening and tracking.',
      contact: {
        name: 'Your Name/Company',
        url: 'http://yourwebsite.com',
        email: 'your.email@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000', // הכתובת של השרת המקומי שלך
        description: 'Development server',
      },
      // אתה יכול להוסיף כאן שרתים נוספים (לדוגמה, שרת Production)
      // {
      //   url: 'https://api.tinyurl.co.il',
      //   description: 'Production server',
      // },
    ],
  },
  // API files to document
  apis: ['./routes/*.js', './controllers/*.js'], // נתיבים לקבצי ה-API שלך
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;