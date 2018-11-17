jest.setTimeout(10000);

require('../models/User');
require('../models/Blog');
const mongoose = require('mongoose');
const { mongoURI } = require('../config/keys');

mongoose.Promise = global.Promise;
mongoose.connect(
  mongoURI,
  { useMongoClient: true }
);
