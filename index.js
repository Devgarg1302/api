const { MongoClient } = require('mongodb');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  
  }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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



const transformData = (data) => {
    return data.map((item) => {
      const transformed = {};
  
      for (const key in item) {
        if (key === "_id") {
          transformed["_id"] = item["_id"];
          continue;
        }
  
        const times = item[key];
        if (Array.isArray(times) && times.length === 3) {
          const [time1, date] = times[0].split(" ");
          const [time2] = times[1].split(" ");
          const [time3] = times[2].split(" ");
  
          transformed[key] = {
            date,
            time1,
            time2,
            time3
          };
        }
      }
  
      return transformed;
    });
  };

  
function convertData(data) {
    const result = {};
    data.forEach((item, index) => {
        const fdate = item.date.split('-').reverse().join('-');
        result[index] = [`${item.time1} ${fdate}`, `${item.time2} ${fdate}`, `${item.time3} ${fdate}`];
    });
    return result;
}

  
app.get('/schedule', async (req, res) => {
    try {
        const database = client.db('scheduleDB');
        const collection = database.collection('timeData');

        const data = await collection.find({}).toArray();
        const datac = transformData(data);
        res.send(datac);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.post('/addData', async (req, res) => {
    try {
        const database = client.db('scheduleDB');
        const collection = database.collection('timeData');
        const doc = req.body;
        const convertedData = convertData(doc.rows);
  
        const result = await collection.insertOne(convertedData);

        console.log(`New document inserted with _id: ${result.insertedId}`);
    } catch (error) {
        console.log(error);
    }
});

app.get('/', async (req, res) => {
    try {
        const database = client.db('scheduleDB');
        const collection = database.collection('timeData');

        const data = await collection.find({}).toArray();

        console.log(data);
        res.send(JSON.stringify(data));
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/notifications', async (req, res) => {
    try {
        const database = client.db('scheduleDB');
        const collection = database.collection('notifyData');

        const data = await collection.find({}).toArray();
        res.send(data);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/sampleNotifications', async (req, res) => {
    try {
        const database = client.db('scheduleDB');
        const collection = database.collection('notifyData');

        const {sampleNotifications} = req.body;

        console.log(sampleNotifications)

        const result = await collection.insertMany([{ motor, timestamp: new Date() }]);
        console.log(`Sample notifications inserted with _ids: ${result.insertedIds}`);
        res.status(201).send({ message: 'Sample notifications saved successfully', ids: result.insertedIds });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
