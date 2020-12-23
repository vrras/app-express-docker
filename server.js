require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const redis = require("redis");
const app = express();

// MongoDB
mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/mean`, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const commentSchema = new Schema({
  author: String,
  comment: String
});
const Comment = mongoose.model('Comment', commentSchema);

// Redis
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

client.on("error", function (error) {
  console.error(error);
});

console.log('Connection is establishing now...');

app.get('/', (req, res) => {
  res.send(`Hello ${process.env.NAME}!`)
})

app.get('/comment', function (req, res) {
  const { author, comment } = req.query;
  const newComment = new Comment({
    author,
    comment
  });

  newComment.save((error) => {
    if (error)
      return res.send(error);

    res.send('saved');
  });
});

app.get('/comments', function (req, res) {
  Comment.find({}, function (error, comments) {
    if (error)
      return res.send(error);

    res.json(comments);
  });

});

app.get('/cache', function (req, res) {
  const { key, name } = req.query;
  client.set(key, name, (error) => {
    if (error)
      return res.send(error);

    res.send('saved');
  });
});

app.get('/caches', function (req, res) {
  const { key } = req.query;

  client.get(key, (error, result) => {
    if (error)
      return res.send(error);

    res.json(result);
  });

});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`)
})