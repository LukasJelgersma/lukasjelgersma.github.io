import { useNavigate } from "react-router-dom";


function ContactPage() {
    const navigate = useNavigate();

    return (
        <div className="contact-page">
            <button onClick={() => navigate('/')}>Back</button>
            <h1>Contact</h1>
            <p>Hit me up</p>
        </div>
    );
}

export default ContactPage;