import Home from './pages/Home';
import ExecutiveInterviews from './pages/ExecutiveInterviews';
import InterviewDetail from './pages/InterviewDetail';
import DigitalMagazine from './pages/DigitalMagazine';
import SpotlightAwards from './pages/SpotlightAwards';
import NominationForm from './pages/NominationForm';
import Advertise from './pages/Advertise';
import About from './pages/About';
import Contact from './pages/Contact';
import SubmitStory from './pages/SubmitStory';
import AdminDashboard from './pages/AdminDashboard';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "ExecutiveInterviews": ExecutiveInterviews,
    "InterviewDetail": InterviewDetail,
    "DigitalMagazine": DigitalMagazine,
    "SpotlightAwards": SpotlightAwards,
    "NominationForm": NominationForm,
    "Advertise": Advertise,
    "About": About,
    "Contact": Contact,
    "SubmitStory": SubmitStory,
    "AdminDashboard": AdminDashboard,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
