const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose");
const bodyParser = require('body-parser')
require('dotenv').config()

const dbUri = `mongodb+srv://giancoppola:${process.env.MONGO_PW}@cluster0.gjnjhuw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
mongoose.connect(dbUri);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userSchema = new mongoose.Schema({
  username: String,
})
const User = new mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema({
  id: String,
  description: String,
  duration: Number,
  date: String
})
const Exercise = new mongoose.model("Exercise", exerciseSchema);

app.route("*")
.get((req, res, next) => {
  console.log(req.method, req.url, res.statusCode);
  next();
})

// api/users route - POST and GET
app.route("/api/users")
.post(async (req, res, next) => {
  let username = req.body.username;
  if (username){
    let user = new User({ username: username })
    console.log(user);
    try{
      await user.save()
      res.json({
        username: user.username,
        _id: user._id
      })
    }
    catch(e){
      return console.log(e);
    }
  }
  next()
})
.get(async (req, res, next) => {
  let users = await User.find();
  res.json(users);
  next()
})

app.route('/api/users/:_id/exercises')
.post(async (req, res, next) => {
  let id = req.params._id;
  let desc = req.body.description;
  let duration = req.body.duration;
  let date = req.body.date;
  if(id && desc && duration && date){
    let exercise = new Exercise({
      id: id,
      description: desc,
      duration: duration,
      date: date
    })
    try{
      await exercise.save()
      res.json(exercise)
    }
    catch(e){
      console.log(e);
    }
  }
  next()
})
.get(async (req, res, next) => {
  let id = req.params._id;
  if(id){
    try{
      let exercises = await Exercise.find({id: id});
      res.json(exercises)
    }
    catch(e){
      console.log(e);
    }
  }
  next()
})

app.get('api/users/:_id/logs?from&to&limit', (req, res) => { res.send("huh")})


// http://localhost:3000/api/users/65d8d232886dff8d77f97c9a/logs
app.route("api/users/:_id/logs?from&to&limit")
.get(async (req, res, next) => {
  res.send("test");
  console.log('get');
  let id = req.params._id;
  let from = req.query.from;
  let to = req.query.to;
  let limit = req.query.limit;
  if (id){
    try{
      let exercises = await Exercise.find({id: id}).select('-id').exec();
      let user = await User.findById(id);
      res.json({
        username: user.username,
        count: exercises.length,
        _id: id,
        log: exercises
      })
    }
    catch(e){
      console.log(e);
    }
  }
  next();
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
