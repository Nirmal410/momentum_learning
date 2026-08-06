import { useEffect, useState } from "react";
import api from "./services/api";

function App() {

    const [message, setMessage] = useState("");

    useEffect(() => {

        api.get("/test")
            .then((response) => {

                setMessage(response.data);

            })
            .catch(console.error);

    }, []);

    return (

        <div>

            <h1>Momentum Learning</h1>

            <h2>{message}</h2>

        </div>

    );

}

export default App;