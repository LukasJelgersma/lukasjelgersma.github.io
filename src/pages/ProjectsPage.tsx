import { useNavigate } from "react-router-dom";


function ProjectsPage() {
    const navigate = useNavigate();

    return (
        <div className="projects-page">
            <button onClick={() => navigate('/')}>Back</button>
            <h1>Cool projects go here</h1>
            <p>Image there is something really cool here</p>
        </div>
    );
}

export default ProjectsPage;