const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const ObjectID = require('mongodb').ObjectId;
const MongoClient = require("mongodb").MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('doctor'));
app.use(fileUpload());

require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hooq3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const appointmentCollection = client.db(process.env.DB_NAME).collection("appointments");
    const doctorsCollection = client.db(process.env.DB_NAME).collection("doctors");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.acknowledged)
            })
    })

    app.post('/appointmentByDate', (req, res) => {
        appointmentCollection.find({ date: req.body.date })
            .toArray((err, docs) => {
                res.send(docs);
            })
    })

    app.get('/allPatients', (req, res) => {
        appointmentCollection.find({})
            .toArray((err, docs) => {
                res.send(docs)
            })
    })

    //File UPLOADED SYSTEM
    app.post('/addADoctor', (req, res) => {
        const file   = req.files.file;
        const name   = req.body.name;
        const email  = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64')
        var image  = {
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer.from(encImg, 'base64')
        }
        doctorsCollection.insertOne({ name: name, email: email, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get('/doctors', (req, res) => {
        doctorsCollection.find()
            .toArray((err, docs) => {
                res.send(docs)
            })
    })

});

app.listen(process.env.PORT || 5000)
