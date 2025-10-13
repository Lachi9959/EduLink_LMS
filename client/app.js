const { useState, useEffect } = React;

const API_BASE = "http://localhost:5000/api";

function App(){
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(()=>{ fetchCourses(); const tok=localStorage.getItem("edulink_token"); if(tok) setUser({token:tok}); },[]);

  const fetchCourses = async ()=> {
    try{
      const res = await axios.get(API_BASE + "/courses");
      setCourses(res.data);
    }catch(e){ console.error(e); alert("Could not fetch courses"); }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>EduLink</h1>
        <div>
          {user ? <button className="btn" onClick={()=>{localStorage.removeItem("edulink_token"); setUser(null);}}>Logout</button> 
                : <button className="btn" onClick={()=>setView("auth")}>Login / Register</button>}
        </div>
      </div>

      <div className="grid">
        <div>
          <div className="card">
            <h2>Courses</h2>
            <p className="small">Available courses — enroll to start learning.</p>
            {courses.length===0 && <p className="small">No courses yet.</p>}
            {courses.map(c=>(
              <div key={c._id} className="list-item">
                <strong>{c.title}</strong>
                <p className="small">{c.description}</p>
                <small>Duration: {c.duration}</small>
                <div style={{marginTop:8}}>
                  <button className="btn" onClick={()=> enroll(c._id)}>Enroll</button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>Teacher Corner</h3>
            <p className="small">Teachers can create courses and assignments.</p>
            <button className="btn" onClick={()=>setView("createCourse")}>Create Course</button>
          </div>
        </div>

        <div>
          <div className="card">
            <h3>Quick Actions</h3>
            <p className="small">Jump to pages</p>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button className="btn" onClick={()=>setView("home")}>Home</button>
              <button className="btn" onClick={()=>setView("assignments")}>Assignments</button>
            </div>
          </div>

          <div className="card">
            <h4>Demo Notes</h4>
            <p className="small">This is a lightweight demo. Use the backend to register users and test full functionality.</p>
          </div>
        </div>
      </div>

      {view==="auth" && <Auth onAuth={(tok)=>{localStorage.setItem("edulink_token", tok); setUser({token:tok}); setView("home");}} />}
      {view==="createCourse" && <CreateCourse onDone={()=>{fetchCourses(); setView("home");}} />}
    </div>
  );

  async function enroll(courseId){
    const tok = localStorage.getItem("edulink_token");
    if(!tok){ alert("Please login/register first."); setView("auth"); return; }
    try{
      await axios.post(API_BASE + "/courses/" + courseId + "/enroll", {}, { headers: { Authorization: "Bearer " + tok }});
      alert("Enrolled! Check your dashboard.");
    }catch(e){ console.error(e); alert("Enroll failed"); }
  }
}

function Auth({onAuth}){
  const [isLogin,setIsLogin]=useState(true);
  const [form,setForm]=useState({name:'',email:'',password:'',role:'Student'});

  async function submit(e){
    e.preventDefault();
    try{
      const url = "/api/" + (isLogin? "auth/login":"auth/register");
      const res = await axios.post("http://localhost:5000/api/" + (isLogin? "auth/login":"auth/register"), form);
      onAuth(res.data.token);
    }catch(err){ console.error(err); alert("Auth error"); }
  }

  return <div className="card" style={{marginTop:12}}>
    <h3>{isLogin? "Login":"Register"}</h3>
    <form onSubmit={submit}>
      {!isLogin && <>
        <label className="small">Name</label>
        <input className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
      </>}
      <label className="small">Email</label>
      <input className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
      <label className="small">Password</label>
      <input className="input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
      {!isLogin && <>
        <label className="small">Role</label>
        <select className="input" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option>Student</option><option>Teacher</option>
        </select>
      </>}
      <div style={{marginTop:8}}>
        <button className="btn" type="submit">{isLogin? "Login":"Register"}</button>
        <button type="button" style={{marginLeft:8}} onClick={()=>setIsLogin(!isLogin)}>Switch</button>
      </div>
    </form>
  </div>
}

function CreateCourse({onDone}){
  const [f,setF]=useState({title:'',description:'',duration:'2 weeks'});
  async function submit(e){ e.preventDefault(); 
    const tok = localStorage.getItem("edulink_token");
    if(!tok){ alert("Login first"); return; }
    try{
      await axios.post("http://localhost:5000/api/courses", f, { headers: { Authorization: "Bearer " + tok }});
      alert("Course created");
      onDone();
    }catch(e){ console.error(e); alert("Create failed"); }
  }
  return <div className="card" style={{marginTop:12}}>
    <h3>Create Course</h3>
    <form onSubmit={submit}>
      <label className="small">Title</label>
      <input className="input" value={f.title} onChange={e=>setF({...f,title:e.target.value})} />
      <label className="small">Description</label>
      <input className="input" value={f.description} onChange={e=>setF({...f,description:e.target.value})} />
      <label className="small">Duration</label>
      <input className="input" value={f.duration} onChange={e=>setF({...f,duration:e.target.value})} />
      <div style={{marginTop:8}}><button className="btn" type="submit">Create</button></div>
    </form>
  </div>
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
