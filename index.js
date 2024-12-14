const { MongoClient } = require('mongodb');
require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGODB;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() 
{ 
    try 
    { 
        await client.connect(); 
        console.log('Connected to MongoDB Atlas'); 
    } catch (err) 
    { console.error(err); } 
}

connectToDatabase();

// app.get('/', async (req, res) => {
//     try {
//         const database = client.db('scheduleDB');
//         const collection = database.collection('timeData');

//         const doc = {
//             "0": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//             "1": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//             "2": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//             "3": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//             "4": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//             "5": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//             "6": ["09:45 14-12-2024", "13:45 14-12-2024", "20:45 14-12-2024"],
//         };

//         const result = await collection.insertOne(doc);
//         console.log(`New document inserted with _id: ${result.insertedId}`);

//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// });

app.get('/', async (req, res) => {
    try {
        const database = client.db('scheduleDB');
        const collection = database.collection('timeData');

        const data = await collection.find({}).toArray();
        res.send(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
