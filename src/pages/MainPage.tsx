function MainPage() {
    return (
        <div className="main-page">
            <header className="main-header">
                <h1>Welcome to Lukas Jelgersma's Portfolio</h1>
                <p>Software Developer & Tech Enthusiast</p>
            </header>

            <main className="main-content">
                <section className="about-section">
                    <h2>About Me</h2>
                    <p>Lorem Ipsum</p>
                </section>

                <section className="projects-section">
                    <h2>Projects</h2>
                    <div className="projects-grid">
                        <div className="project-card">
                            <h3>Project 1</h3>
                            <p>Lorem ipsum</p>
                        </div>
                        <div className="project-card">
                            <h3>Project 2</h3>
                            <p>Lorem ipsum</p>
                        </div>
                    </div>
                </section>

                <section className="contact-section">
                    <h2>Contact</h2>
                    <p>Lorem ipsum</p>
                </section>
            </main>
        </div>
    )
}

export default MainPage
