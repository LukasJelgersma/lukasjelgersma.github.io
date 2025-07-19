import { useNavigate } from "react-router-dom";
import AboutScene from "../components/aboutScene/AboutScene";
import Button from "../components/Button";


function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="about-page">
            <div className="about-header">
                <Button
                    variant="primary"
                    page="about"
                    onClick={() => navigate('/')}
                >
                    Back
                </Button>
                <span>This work is based on "Toyota Celica GT-Four (ST205)" (https://sketchfab.com/3d-models/toyota-celica-gt-four-st205-61dd3dc3c803421f9006102571ce3ffa) by GT Cars: Hyperspeed (https://sketchfab.com/Car2022) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)</span>
            </div>
            <AboutScene className="three-background" />
        </div>
    );
}

export default AboutPage;