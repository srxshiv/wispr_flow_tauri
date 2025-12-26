import { invoke } from "@tauri-apps/api/core"
import { useState } from "react";

export default function App() {

  const [input , setInput] = useState<string>("");
  const [greet, setGreet] = useState<string>("");

  const handleSubmit = async ()=>{
    const result = await invoke("greet" , {name: input}) as string;
    setGreet(result);
  }

  return <div>
    <input value={input} onChange={(e)=>setInput(e.target.value)} />
    <button onClick={handleSubmit}>Submit</button>

    <div>
      {greet}
    </div>
  </div>
}