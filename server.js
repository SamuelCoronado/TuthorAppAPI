const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const path = require('path')

//Connect database
connectDB();


//Init middleware
app.use(express.json({extended: false}));
app.use(morgan('dev'));
//app.use(cors());

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/tutorings', require('./routes/api/tutorings'));
//app.use('/api/auth', require('./routes/api/auth'));
app.use(express.static(path.join(__dirname, 'public/')))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log('Server started on port '+PORT))

