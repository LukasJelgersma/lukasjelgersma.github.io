import { useNavigate } from "react-router-dom";


function SkillsPage() {
    const navigate = useNavigate();

    return (
        <div className="skills-page">
            <button onClick={() => navigate('/')}>Back</button>
            <h1>Skills page</h1>
            <p>I got a few</p>
        </div>
    );
}

export default SkillsPage;