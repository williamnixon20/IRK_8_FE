import logo from './logo.svg';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

import React, { useState, useEffect } from 'react';
import './App.css';

const gradeOptions = [
  { value: 4, label: 'A' },
  { value: 3.5, label: 'AB' },
  { value: 3, label: 'B' },
  { value: 2.5, label: 'BC' },
  { value: 2, label: 'C' },
  { value: 1, label: 'D' },
  { value: 0, label: 'E' }
];

function App() {
  const [courses, setCourses] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(2);
  const [faculty, setFaculty] = useState('Science');
  const [maxWorkload, setMaxWorkload] = useState(24);
  const [minWorkload, setMinWorkload] = useState(0);
  const [maxGrade, setMaxGrade] = useState(0);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [totalWorkload, setTotalWorkload] = useState(0);
  const [majors, setMajors] = useState([]);
  const [newMajor, setNewMajor] = useState({ Faculty: 'FTSL', Major: ['Teknik Lingkungan', 'Perencanaan Kota'] });

  useEffect(() => {
    // Fetch data from the API endpoint
    fetch('/api/get')
      .then(response => response.json())
      .then(data => {
        // Assuming the API response is an array of courses
        if (data) {
          setCourses(data);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    fetch('/api/majors')
      .then(response => response.json())
      .then(data => {
        if (data) {
          setMajors(data);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []); // Empty dependency array means this effect runs once after initial render


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (jsonData.courses) {
            let courses_list = jsonData.courses.map(e => {
              e.Grade = gradeOptions.find(g => g.label === e.Grade).value;
              if (!e.Grade) {
                throw Error("Invalid Grade");
              }
              e.Id = uuidv4();
              submitCourse(e);
              return e;
            })
            setCourses(prevCourses => [...prevCourses, ...courses_list]);
          }
        } catch (error) {
          alert("ERROR PARSING FILE! Please make sure format is correct.")
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteCourse = async (index) => {
    const updatedCourses = [...courses];
    const deleted = updatedCourses.splice(index, 1)[0];
    const response = await fetch(`/api/delete?Id=${deleted["Id"]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deleted),
    });
    setCourses(updatedCourses);
  };
  const handleFileUploadFaculty = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (jsonData) {
            setMajors(prevMajors => [...prevMajors, ...jsonData]);
            fetch('/api/major', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(jsonData),
            });
          }
        } catch (error) {
          alert('Error parsing JSON file. Please make sure the format is correct.');
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    for (let course of courses) {
      if (course["Course Name"] === "") {
        alert("Please fill in all course names.");
        return;
      }
      if (course["Faculty"] === "") {
        alert("Please fill in faculty.");
        return;
      }
    }
    const data = {
      courses,
      current_semester: currentSemester,
      faculty,
      max_workload: maxWorkload,
      min_workload: minWorkload,
    };

    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (result.total_workload < minWorkload || result.max_grade < 0) {
      alert(`Failed to find a valid course arrangement for you!`);
      return;
    } else {
      if (result.selected_courses.length !== 0) {
        setMaxGrade(result.max_grade);
        setSelectedCourses(result.selected_courses);
        setTotalWorkload(result.total_workload);
      } else {
        alert('No available course arrangment found.');
        setMaxGrade(0);
        setSelectedCourses([]);
        setTotalWorkload(0);
      }
    }
  };

  const submitCourse = async (course) => {
    await fetch(`/api/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
  }

  const handleAddMajor = async () => {
    setMajors(prevMajors => [...prevMajors, newMajor]);
    setNewMajor({ Faculty: '', Major: [] });
    await fetch('/api/major', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([newMajor]),
    });
  };

  const handleCourseAttributeChange = async (index, attribute, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index][attribute] = value;
    setCourses(updatedCourses);
    await submitCourse(updatedCourses[index]);
  };
  return (
    <div className="App" style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#3498db', marginBottom: '20px' }}>Course Selection Tool</h1>
      <h3>Course selektor akan memberikan kombinasi matkul yang dapat kamu ambil di semester ini, sehingga memberikan <b>IP</b> terbaik dengan <b>Beban SKS</b> sebanyak mungkin. Matkul yang valid adalah matkul yang sudah dipenuhi syarat minimum semesternya dan <b> diampu di fakultas yang sama</b>. Misalnya, seorang mahasiswa <b>Teknik Informatika</b> dapat mengambil matkul yang diampu <b>Teknik Elektro</b>, <b>STEI</b>, dst.</h3>
      <br></br>
      <br></br>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {courses.map((course, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Course Name:</label>
            <input
              type="text"
              value={course["Course Name"]}
              onChange={(e) => handleCourseAttributeChange(index, "Course Name", e.target.value)}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Grade:</label>
            <select
              value={course.Grade}
              onChange={(e) => handleCourseAttributeChange(index, "Grade", parseFloat(e.target.value))}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              {gradeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Workload:</label>
            <input
              type="number"
              value={course.Workload}
              onChange={(e) => handleCourseAttributeChange(index, "Workload", parseInt(e.target.value))}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Faculty:</label>
            <input
              type="text"
              value={course.Faculty}
              onChange={(e) => handleCourseAttributeChange(index, "Faculty", e.target.value)}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Minimum Semester:</label>
            <input
              type="number"
              value={course["Minimum Semester"]}
              onChange={(e) => handleCourseAttributeChange(index, "Minimum Semester", parseInt(e.target.value))}
              style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button
              onClick={() => handleDeleteCourse(index)}
              style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        ))}
        <button
          onClick={() => setCourses([...courses, {
            Id: uuidv4(),
            "Course Name": "",
            Grade: 4, // Default grade value (A)
            Workload: 4,
            Faculty: "",
            "Minimum Semester": 1,
          }])}
          style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
        >
          Add Course
        </button>
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Upload JSON File:</label>
          <input type="file" accept=".json" onChange={handleFileUpload} style={{ marginLeft: '10px' }} />
        </div>
      </div>

      {/* ... user inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <div className="user-input" style={{ marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Current Semester:</label>
          <input
            type="number"
            value={currentSemester}
            onChange={(e) => setCurrentSemester(parseInt(e.target.value))}
            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="user-input" style={{ marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Faculty/Major:</label>
          <input
            type="text"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="user-input" style={{ marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Max Workload:</label>
          <input
            type="number"
            value={maxWorkload}
            onChange={(e) => setMaxWorkload(parseInt(e.target.value))}
            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
        <div className="user-input" style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Min Workload:</label>
          <input
            type="number"
            value={minWorkload}
            onChange={(e) => setMinWorkload(parseInt(e.target.value))}
            style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        style={{ backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', marginTop: '20px', cursor: 'pointer' }}
      >
        Calculate
      </button>

      <div className="results" style={{ marginTop: '100px', textAlign: 'left', marginLeft: '20px' }}>
        <p style={{ fontWeight: 'bold', color: '#3498db' }}>Max Grade: {maxGrade}</p>
        <p>Selected Courses: {selectedCourses.join(', ')}</p>
        <p>Total Workload: {totalWorkload}</p>
      </div>

      <h1>Available Faculties and Major Relationship</h1>
      <div className="majors-list" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {majors.map((major, index) => (
          <div key={index} className="major-item">
            <h2>{major.Faculty}</h2>
            <ul>
              {major.Major.map((course, courseIndex) => (
                <li key={courseIndex}>{course}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="add-major" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Add Major (Case Sensitive!)</h2>
        <div>
          <label>Faculty/Major:</label>
          <input
            type="text"
            value={newMajor.Faculty}
            onChange={(e) => setNewMajor({ ...newMajor, Faculty: e.target.value })}
          />
        </div>
        <div>
          <label>Major(s):</label>
          <input
            type="text"
            value={newMajor.Major.join(',')}
            onChange={(e) => setNewMajor({ ...newMajor, Major: e.target.value.split(', ') })}
          />
        </div>
        <button
          onClick={handleAddMajor}
          style={{ backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}
        >
          Add Major
        </button>
      </div>

      <div className="file-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Upload JSON File</h2>
        <input type="file" accept=".txt" onChange={handleFileUploadFaculty} />
      </div>
      <div style={{ marginTop: '100px', textAlign: 'left', marginLeft: '20px' }}>
        <div>
          <h3>Sample JSON Format for batch course upload: </h3>
          <pre>
            {`{"courses": [
  {"Course Name": "Kesehatan Masyarakat", "Grade": "A", "Workload": 4, "Faculty": "SF", "Minimum Semester": 1},
  {"Course Name": "Farmasi Herbal", "Grade": "A", "Workload": 3, "Faculty": "Farmasi", "Minimum Semester": 2},
  {"Course Name": "Kimia Organik", "Grade": "AB", "Workload": 6, "Faculty": "SF", "Minimum Semester": 2},
  {"Course Name": "Kimia Fisik", "Grade": "A", "Workload": 4, "Faculty": "Kesehatan Masyarakat", "Minimum Semester": 1},
  {"Course Name": "Epidemiologi", "Grade": "B", "Workload": 2, "Faculty": "SF", "Minimum Semester": 1},
  {"Course Name": "Pemrograman Berorientasi Netral", "Grade": "B", "Workload": 2, "Faculty": "STEI", "Minimum Semester": 1}
]}`}
          </pre>
        </div>
        <div>
          <h3>Sample JSON Format for batch major upload: </h3>
          <pre dangerouslySetInnerHTML={{
            __html: `
[
  {
    "Faculty": "SF",
    "Major": [
      "Farmasi",
      "Kesehatan Masyarakat"
    ]
  },
  {
    "Faculty": "FTI",
    "Major": [
      "Teknik Superkonduktor",
      "Teknik Nano"
    ]
  }
]
    `}} />
        </div>
      </div>
    </div>
  );
}



export default App;
