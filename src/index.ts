import { initServer } from "./App";


async function init(){
 
    const app=await initServer();
    
    app.listen(8000,()=>{console.log(`Server is started on PORT:8000`)});
}

init(); 
