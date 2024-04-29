const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./client/shortUrl'); 
require('dotenv').config(); 

const app = express();

// Connect to MongoDB using environment variable
const mongoUri = process.env.MONGODB_URI;
mongoose.connect(mongoUri)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('Error connecting to MongoDB:', err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false })); 

// handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); 
  res.status(500).send('Something went wrong!'); 
});

// Routes
app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find().limit(10).sort({$natural:-1});
    res.render('index', { shortUrls });
  } catch (err) {
    console.error(err); 
    res.status(500).send('Error fetching short URLs');
  }
});

app.post('/shortUrls', async (req, res) => {
  try {
    const newShortUrl = new ShortUrl({ full: req.body.fullUrl });
    await newShortUrl.save();
    res.redirect('/');
  } catch (err) {
    console.error(err); 
    res.status(400).send('Invalid or duplicate URL');
  }
});

app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) {
      return res.status(404).send('Not found'); 
    }
    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
  } catch (err) {
    console.error(err); 
    res.status(500).send('Error redirecting');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
