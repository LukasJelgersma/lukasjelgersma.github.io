import { useState } from 'react';
import ThreeScene from '../components/threeComponents/sampleThree';

// Define your information cards here - easy to add more!
const informationCards = [
    {
        id: 0,
        title: "About Me",
        subtitle: "Software Developer",
        description: "Lorem ipsum"
    },
    {
        id: 1,
        title: "Skills",
        subtitle: "Technical Expertise",
        description: "Loremu ipsum"
    },
    {
        id: 2,
        title: "Projects",
        subtitle: "Recent Work",
        description: "Lorem Ipsum"
    },
    {
        id: 3,
        title: "Contact",
        subtitle: "Get In Touch",
        description: "Lorem Ipsum"
    }
];

function MainPage() {
    const [activeCardIndex, setActiveCardIndex] = useState(-1);

    const handleActiveObjectChange = (index: number) => {
        setActiveCardIndex(index);
    };

    return (
        <div className="main-page">
            {/* Three.js Background */}
            <ThreeScene className="three-background" onActiveObjectChange={handleActiveObjectChange} />

            {/* Main Content */}
            <div className="main-page-content">
                <header className="main-header">
                    <h1>Welcome to Lukas Jelgersma's Portfolio</h1>
                    <p>Software Developer & Tech Enthusiast</p>
                    <div className="scroll-instruction">
                        <p>↓ Scroll to explore ↓</p>
                    </div>
                </header>

                <main className="main-content">
                    {/* Generate sections based on information cards */}
                    {informationCards.map((card, index) => (
                        <section key={card.id} className={`info-section ${index === activeCardIndex ? 'active' : ''}`} style={{ display: 'hidden' }}>
                            <div className="section-number">{index + 1}</div>
                            <h2>{card.title}</h2>
                            <h3>{card.subtitle}</h3>
                            <p>{card.description}</p>
                        </section>
                    ))}

                    <section className="final-section">
                        <h2>Thank You</h2>
                        <p>Thanks for exploring my portfolio! Feel free to reach out for collaborations or opportunities.</p>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default MainPage
