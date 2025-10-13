const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple logger
app.use((req,res,next)=>{ console.log(new Date().toISOString(), req.method, req.url); next(); });

// Connect DB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulink', { useNewUrlParser:true, useUnifiedTopology:true })
  .then(()=>console.log('MongoDB connected')).catch(e=>console.error('DB err',e));

// Models
const UserSchema = new mongoose.Schema({
  name:String, email:{type:String,unique:true}, password:String, role:{type:String,enum:['Student','Teacher'],default:'Student'}
},{timestamps:true});
const User = mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({
  title:String, description:String, duration:String, teacher:{type:mongoose.Schema.Types.ObjectId, ref:'User'}, students:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}]
},{timestamps:true});
const Course = mongoose.model('Course', CourseSchema);

const AssignmentSchema = new mongoose.Schema({
  course:{type:mongoose.Schema.Types.ObjectId, ref:'Course'},
  title:String, description:String, dueDate:Date, submissions:[{
    student:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    content:String, grade:Number, feedback:String, submittedAt:Date
  }]
},{timestamps:true});
const Assignment = mongoose.model('Assignment', AssignmentSchema);

// Auth helpers
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({message:'No token'});
  const token = auth.split(' ')[1];
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = data;
    next();
  }catch(e){ return res.status(401).json({message:'Invalid token'}); }
}

// Routes
app.post('/api/auth/register', async (req,res)=>{
  const {name,email,password,role} = req.body;
  if(!email||!password) return res.status(400).json({message:'Missing fields'});
  const hashed = await bcrypt.hash(password, 10);
  try{
    const user = await User.create({name,email,password:hashed, role});
    const token = jwt.sign({id:user._id,role:user.role}, process.env.JWT_SECRET || 'dev_secret',{expiresIn:'7d'});
    res.json({token});
  }catch(e){ console.error(e); res.status(400).json({message:'Registration failed'}); }
});

app.post('/api/auth/login', async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.status(400).json({message:'Invalid'});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({message:'Invalid'});
  const token = jwt.sign({id:user._id,role:user.role}, process.env.JWT_SECRET || 'dev_secret',{expiresIn:'7d'});
  res.json({token});
});

// Create course (teacher)
app.post('/api/courses', authMiddleware, async (req,res)=>{
  if(req.user.role !== 'Teacher') return res.status(403).json({message:'Only teachers'});
  const {title,description,duration} = req.body;
  const course = await Course.create({title,description,duration, teacher: req.user.id});
  res.json(course);
});

// List courses
app.get('/api/courses', async (req,res)=>{
  const courses = await Course.find().populate('teacher','name email');
  res.json(courses);
});

// Enroll
app.post('/api/courses/:id/enroll', authMiddleware, async (req,res)=>{
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({message:'Not found'});
  if(course.students.includes(req.user.id)) return res.json({message:'Already enrolled'});
  course.students.push(req.user.id);
  await course.save();
  res.json({message:'Enrolled'});
});

// Create assignment
app.post('/api/courses/:id/assignments', authMiddleware, async (req,res)=>{
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({message:'Not found'});
  if(course.teacher.toString() !== req.user.id) return res.status(403).json({message:'Only teacher'});
  const {title,description,dueDate} = req.body;
  const assignment = await Assignment.create({course:course._id,title,description,dueDate});
  res.json(assignment);
});

// Submit assignment
app.post('/api/assignments/:id/submit', authMiddleware, async (req,res)=>{
  const asg = await Assignment.findById(req.params.id);
  if(!asg) return res.status(404).json({message:'Not found'});
  asg.submissions.push({student:req.user.id, content:req.body.content||'', submittedAt:new Date()});
  await asg.save();
  res.json({message:'Submitted'});
});

// Grade submission
app.post('/api/assignments/:id/grade', authMiddleware, async (req,res)=>{
  const {submissionId, grade, feedback} = req.body;
  const asg = await Assignment.findById(req.params.id).populate('course');
  if(!asg) return res.status(404).json({message:'Not found'});
  // only course teacher
  const course = await Course.findById(asg.course._id);
  if(course.teacher.toString() !== req.user.id) return res.status(403).json({message:'Only teacher'});
  const sub = asg.submissions.id(submissionId);
  if(!sub) return res.status(404).json({message:'Submission not found'});
  sub.grade = grade; sub.feedback = feedback;
  await asg.save();
  res.json({message:'Graded'});
});

// Simple dashboard
app.get('/api/me', authMiddleware, async (req,res)=>{
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log('Server running on',PORT));
