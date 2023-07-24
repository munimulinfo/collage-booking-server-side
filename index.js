const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.j5a0pdi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        const usersCollection = client.db("Collage-booking").collection('allusers');
        const collageCollection = client.db("Collage-booking").collection('allcollage');
        const admidCollageCollection = client.db("Collage-booking").collection('admitCollage');
        const reviewsCollection = client.db("Collage-booking").collection('reviews');

        app.get('/allusers', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })


        app.get('/allusers/:email', async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.find({ email: email }).toArray();
            res.send(result);
        })
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);
          })

        app.put('/allusers/:id', async (req, res) => {
            const id = req.params.id;
            const name = req.body.name;
            const image = req.body.image;
            const university = req.body.university;
            const address = req.body.address;
            const birthdate = req.body.birthdate;

            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    name: name,
                    image: image,
                    university: university,
                    address: address,
                    birthdate: birthdate,
                },
            };
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        app.delete('/allusers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/allusers', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ error: "user Alredy exsits" })
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.get('/allcollage', async (req, res) => {
            const result = await collageCollection.find().toArray();
            res.send(result);
        })

        app.get("/searchcollage/:text", async (req, res) => {
            const text = req.params.text;
            const result = await collageCollection
                .find({
                    $or: [
                        {
                            collagename: { $regex: text, $options: "i" }
                        },

                    ],
                })
                .toArray();
            res.send(result);
        });

        app.get('/allcollage/:id', async (req, res) => {
            const id = req.params.id;
            const query = ({ _id: new ObjectId(id) })
            const result = await collageCollection.findOne(query);
            res.send(result);
        })

        app.post('/allcollage', async (req, res) => {
            const addcollage = req.body;
            const result = await collageCollection.insertOne(addcollage);
            res.send(result);
        })

        app.get('/admitCollage/:email', async (req, res) => {
            const email = req.params.email;
            const result = await admidCollageCollection.find({ candidateEmail: email }).toArray();
            res.send(result);
        })

        app.post('/admitCollage', async (req, res) => {
            const newadmitcollage = req.body;
            const result = await admidCollageCollection.insertOne(newadmitcollage);
            res.send(result);
        })

        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            const result = await reviewsCollection.insertOne(reviews);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("music instrument leran school server is running");
})

app.listen(port, (req, res) => {
    console.log(`music instrument leran school server is running on port ${port}`)
})