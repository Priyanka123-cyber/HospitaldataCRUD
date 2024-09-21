const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = 'data.json';

app.use(bodyParser.json());

//function to read the JSON file 
function readDataFile(callback) {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            callback([]);
        } else {
            try {
                const hospitals = JSON.parse(data);
                callback(hospitals);
            } catch (parseError) {
                console.error("Error parsing data file:", parseError);
                callback([]);
            }
        }
    });
}

// Function to write to the JSON file 
function writeDataFile(data, callback) {
    fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error("Error writing to data file:", err);
            callback(false);
        } else {
            callback(true);
        }
    });
}

// GET all hospitals
// URL: http://localhost:3000/hospitals
app.get('/hospitals', (req, res) => {
    readDataFile((hospitals) => {
        res.json(hospitals);
    });
});

// GET a single hospital by ID
// URL: http://localhost:3000/hospitals/1
app.get('/hospitals/:id', (req, res) => {
    readDataFile((hospitals) => {
        const hospital = hospitals.find(h => h.id === parseInt(req.params.id));
        if (!hospital) {
            return res.status(404).send('Hospital not found');
        }
        res.json(hospital);
    });
});

// POST a new hospital with ID passed in URL
// URL: http://localhost:3000/hospitals/:id
app.post('/hospitals/:id', (req, res) => {
    readDataFile((hospitals) => {
        const newId = parseInt(req.params.id);

        // Check if the ID already exists
        if (hospitals.some(h => h.id === newId)) {
            return res.status(400).send('Hospital with this ID already exists');
        }

        const newHospital = {
            id: newId,
            hospitalName: req.body.hospitalName,
            patientCount: req.body.patientCount,
            location: req.body.location
        };
        hospitals.push(newHospital);
        writeDataFile(hospitals, (success) => {
            if (success) {
                res.status(201).json(newHospital);
            } else {
                res.status(500).send('Error saving hospital data');
            }
        });
    });
});

// PUT (update) an existing hospital by ID
// URL: http://localhost:3000/hospitals/:id
app.put('/hospitals/:id', (req, res) => {
    readDataFile((hospitals) => {
        const index = hospitals.findIndex(h => h.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).send('Hospital not found');
        }
        const updatedHospital = {
            ...hospitals[index],
            hospitalName: req.body.hospitalName,
            patientCount: req.body.patientCount,
            location: req.body.location
        };
        hospitals[index] = updatedHospital;
        writeDataFile(hospitals, (success) => {
            if (success) {
                res.json(updatedHospital);
            } else {
                res.status(500).send('Error updating hospital data');
            }
        });
    });
});

// DELETE a hospital by ID
// URL: http://localhost:3000/hospitals/:id
app.delete('/hospitals/:id', (req, res) => {
    readDataFile((hospitals) => {
        const newHospitals = hospitals.filter(h => h.id !== parseInt(req.params.id));
        if (hospitals.length === newHospitals.length) {
            return res.status(404).send('Hospital not found');
        }
        writeDataFile(newHospitals, (success) => {
            if (success) {
                res.status(204).send();  // No content
            } else {
                res.status(500).send('Error deleting hospital data');
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is initiated on http://localhost:${PORT}`);
});
