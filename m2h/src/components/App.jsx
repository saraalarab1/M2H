import React, { useEffect, useState }  from "react"


function App() {
  const{init,setinit} =useState([])
  useEffect(()=>{
    fetch('/api/').then(res=>{
      if(res.ok){
        return res.json()
      }
    }).then(jsonResponse => console.log(jsonResponse))

  },[])
  console.log(init)
  return (
   <h1>Hello</h1>
  );
}

export default App;
