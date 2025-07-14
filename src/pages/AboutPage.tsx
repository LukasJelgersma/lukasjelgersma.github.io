import { useNavigate } from "react-router-dom";
import AboutScene from "../components/aboutScene/AboutScene";


function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="about-page">
            <button onClick={() => navigate('/')}>Back</button>
            <span>This work is based on "Toyota Celica GT-Four (ST205)" (https://sketchfab.com/3d-models/toyota-celica-gt-four-st205-61dd3dc3c803421f9006102571ce3ffa) by GT Cars: Hyperspeed (https://sketchfab.com/Car2022) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)</span>

            <AboutScene />
        </div>


    );
}

export default AboutPage;