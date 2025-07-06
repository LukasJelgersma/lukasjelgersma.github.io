import { useNavigate } from "react-router-dom";
import AboutScene from "../components/aboutScene/AboutScene";


function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="about-page">
            <button onClick={() => navigate('/')}>Back</button>
            <h1>About Me</h1>
            <p>Something about me</p>
            <AboutScene />


        </div>


    );
}

export default AboutPage;