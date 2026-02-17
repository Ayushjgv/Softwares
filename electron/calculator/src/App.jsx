import React, { useEffect } from 'react'
import { useState } from 'react'

const App = () => {

  const [operator, setoperator] = useState('');
  const [output, setoutput] = useState('');
  const [key, setkey] = useState('');
  const [arr, setarr] = useState([]);
  const [theme, settheme] = useState('dark');
  
  useEffect(() => {
    setarr(['/','*','+','-','7','8','9','%','4','5','6','(','1','2','3',')','0','.','=','c']);
    console.log("arr set");
  },[]);

  function eventhandler(key){
    // console.log(key);
    if(key === 'c'){
      setoperator('');
      setoutput('');
    }else if(key === '='){
      try {
        const result = eval(output);
        setoutput(result.toString());
        setoperator(result.toString());
      } catch (error) {
        setoutput('Error');
        setoperator('');
      }
    }else if(key=='Backspace'){
      const prevoperator=operator.slice(0,-1);
      setoperator(prevoperator);
      setoutput(prevoperator);
    }else {
      const nextOperator = operator + key;
      // console.log(nextOperator)
      setoperator(nextOperator);
      setoutput(nextOperator);
    }
  }

useEffect(()=>{
  console.log("useefect")
  const handlekey=(e)=>{
    if(arr.includes(e.key)){
      eventhandler(e.key);
    }else if(e.key == 'Enter'){
      eventhandler('=');
    }else if(e.key == 'Backspace'){
      eventhandler('Backspace');
    }
    console.log("key");
  }
    window.addEventListener('keydown',handlekey);
    return()=>window.removeEventListener('keydown',handlekey);
})


//theme


function toggletheme(){
  settheme(prev => (prev =='light' ? 'dark' : 'light'));
}

useEffect(() => {
  document.body.className=theme;
}, [theme])





  return (
    <div className='container'>
        <div className="box">
         <input
            className='input'
            type="text"
            value={output}
            readOnly
            style={{
              fontSize:
                output.length > 15
                  ? '1rem'
                  : output.length > 10
                  ? '1.5rem'
                  : '2rem',
              width: '100%',
            }}
          />
        </div>
        <div className="buttons">
          {arr.map((item,index)=>{
            return <button id={item} key={index} className={item === "=" ? "btn equal" : "btn"}  onClick={(e)=>{
              e.target.blur();
              eventhandler(e.target.id);
              if(e.target.id=='c') e.target.classList.add('c');
            }}>{item}</button>
          })}
        </div>
        <input className='theme' type="checkbox" onClick={toggletheme} name='Light'/>
    </div>
  )
}

export default App