import { useNavigate } from "react-router-dom";


function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="about-page">
            <button onClick={() => navigate('/')}>Back</button>
            <h1>About Me</h1>
            <p>Something about me</p>
        </div>

    );
}

export default AboutPage;