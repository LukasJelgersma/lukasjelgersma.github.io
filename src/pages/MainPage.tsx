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
        subtitle: "Yeah I have some",
        description: "Loremu ipsum"
    },
    {
        id: 2,
        title: "Projects",
        subtitle: "Got some aswell",
        description: "Lorem Ipsum"
    },
    {
        id: 3,
        title: "Contact",
        subtitle: "Hit me up",
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
                {/* <header className="main-header">
                    <h1>Welcome to my Portfolio</h1>
                    <p>Software Developer & Funny guy</p>
                    <div className="scroll-instruction">
                        <p>↓ Scroll to see more ↓</p>
                    </div>
                </header> */}

                <div className="scroll-instruction" style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p>↓ Scroll to see more ↓</p>
                </div>

                <main className="main-content">
                    {/* Generate sections based on information cards */}
                    {informationCards.map((card, index) => (
                        <section key={card.id} className={`info-section ${index === activeCardIndex ? 'active' : ''}`} style={{ visibility: 'hidden' }}>
                            <div className="section-number">{index + 1}</div>
                            <h2>{card.title}</h2>
                            <h3>{card.subtitle}</h3>
                            <p>{card.description}</p>
                        </section>
                    ))}

                    <section className="final-section">
                        <h2>Thank You</h2>
                        <p>Thanks for exploring my portfolio!</p>
                    </section>
                </main>
            </div>
        </div>
    )
}

export default MainPage
