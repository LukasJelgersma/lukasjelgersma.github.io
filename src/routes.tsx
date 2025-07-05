import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom"
import MainPage from "./pages/MainPage"
import AboutPage from "./pages/AboutPage"
import SkillsPage from "./pages/SkillsPage"
import ProjectsPage from "./pages/ProjectsPage"
import ContactPage from "./pages/ContactPage"

const routes = createRoutesFromElements(
    <>
        <Route path="/" element={<MainPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
    </>
)

const router = createBrowserRouter(routes);

export default router;


