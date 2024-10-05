//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;

var express = require('express');
var app     = express();
var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

// Obtener un dispositivo por ID
app.get('/device/:id', function(req, res) {
    utils.query(`SELECT id, description FROM Devices WHERE id=${req.params.id}`, (error, respuesta, fields) => {
        if (error) {
            res.status(409).send(error.sqlMessage);
        } else {
            res.status(200).send(respuesta);
        }
    });
});

// Obtener todos los dispositivos
app.get('/devices/', function(req, res) {
    utils.query('SELECT * FROM Devices', (error, devices, fields) => {
        if (error) {
            res.status(500).send('este es el error: '  + error.sqlMessage);
        } else {
            res.status(200).json(devices);
        }
    });
});

// Agregar un nuevo dispositivo
app.post('/device/', function(req, res) {
    let { name, description, typeId } = req.body;
    utils.query(`INSERT INTO Devices (name, description, state, typeId) VALUES ('${name}', '${description}', 0.0, ${typeId})`, (error, result) => {
        if (error) {
            res.status(500).send(error.sqlMessage);
        } else {
            res.status(201).send({ message: 'Device added successfully', id: result.insertId });
        }
    });
});

// Actualizar un dispositivo existente
app.put('/device/:id', function(req, res) {
    let { name, description, state, typeId } = req.body;
    utils.query(`UPDATE Devices SET name='${name}', description='${description}', state=${state}, typeId=${typeId} WHERE id=${req.params.id}`, (error, result) => {
        if (error) {
            res.status(500).send(error.sqlMessage);
        } else {
            res.status(200).send({ message: 'Device updated successfully' });
        }
    });
});

// Actualizar el estado (state) de un dispositivo
app.patch('/device/:id/state', function(req, res) {
    let { state } = req.body;
    console.log('estado recibido: '+ state);
    utils.query(`UPDATE Devices SET state=${state} WHERE id=${req.params.id}`, (error, result) => {
        if (error) {
            res.status(500).send(error.sqlMessage);
        } else {
            res.status(200).send({ message: 'Device state updated successfully' });
        }
    });
});

// Eliminar un dispositivo
app.delete('/device/:id', function(req, res) {
    utils.query(`DELETE FROM Devices WHERE id=${req.params.id}`, (error, result) => {
        if (error) {
            res.status(500).send(error.sqlMessage);
        } else {
            res.status(200).send({ message: 'Device deleted successfully' });
        }
    });
});

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================