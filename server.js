const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const path = require('path')

//Connect database
connectDB();

//Init middleware
app.use(express.json({extended: false}))
app.use(cors())
app.use(morgan('dev'))

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/tutorings', require('./routes/api/tutorings'));
//app.use('/api/auth', require('./routes/api/auth'));
app.use(express.static(path.join(__dirname, 'public/')))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log('Server started on port '+PORT))
