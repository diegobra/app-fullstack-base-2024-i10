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

// Obtener todos los dispositivos
app.get('/devices/', function(req, res) {
    utils.query('SELECT * FROM Devices', (error, devices, fields) => {
        if (error) {
            res.status(500).send({ error: error.sqlMessage });
        } else {
            res.status(200).json(devices);
        }
    });
});

// Agregar un nuevo dispositivo
app.post('/device/', function(req, res) {
    let { name, description, typeId } = req.body;
    
    if (!name || !description || isNaN(typeId)) {
        return res.status(400).send({ error: 'Missing or invalid parameters' });
    }

    utils.query('INSERT INTO Devices (name, description, state, typeId) VALUES (?, ?, ?, ?)', 
    [name, description, 0.0, typeId], (error, result) => {
        if (error) {
            res.status(500).send({ error: error.sqlMessage });
        } else {
            res.status(201).send({ message: 'Device added successfully', id: result.insertId });
        }
    });
});

// Actualizar un dispositivo existente
app.put('/device/:id', function(req, res) {
    let deviceId = parseInt(req.params.id, 10);
    let { name, description, typeId } = req.body;

    if (isNaN(deviceId) || !name || !description || isNaN(typeId)) {
        return res.status(400).send({ error: 'Invalid or missing parameters' });
    }

    utils.query('UPDATE Devices SET name = ?, description = ?, typeId = ? WHERE id = ?', 
    [name, description, typeId, deviceId], (error, result) => {
        if (error) {
            res.status(500).send({ error: error.sqlMessage });
        } else {
            res.status(200).send({ message: 'Device updated successfully' });
        }
    });
});

// Actualizar el estado (state) de un dispositivo
app.patch('/device/:id/state', function(req, res) {
    let deviceId = parseInt(req.params.id, 10);
    let { state } = req.body;

    if (isNaN(deviceId) || isNaN(state) || state < 0 || state > 1) {
        return res.status(400).send({ error: 'Invalid or missing parameters' });
    }

    utils.query('UPDATE Devices SET state = ? WHERE id = ?', [state, deviceId], (error, result) => {
        if (error) {
            res.status(500).send({ error: error.sqlMessage });
        } else {
            res.status(200).send({ message: 'Device state updated successfully' });
        }
    });
});

// Eliminar un dispositivo
app.delete('/device/:id', function(req, res) {
    let deviceId = parseInt(req.params.id, 10);

    if (isNaN(deviceId)) {
        return res.status(400).send({ error: 'Invalid device ID' });
    }

    utils.query('DELETE FROM Devices WHERE id = ?', [deviceId], (error, result) => {
        if (error) {
            res.status(500).send({ error: error.sqlMessage });
        } else {
            res.status(200).send({ message: 'Device deleted successfully' });
        }
    });
});

// Obtener tipos de dispositivos
app.get('/deviceTypes', function(req, res) {
    utils.query('SELECT id, name, icon_name FROM DevicesTypes', (error, respuesta, fields) => {
        if (error) {
            res.status(409).send({ error: error.sqlMessage });
        } else {
            res.status(200).send(respuesta);
        }
    });
});

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================