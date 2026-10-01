import { lazy } from 'react';

// Home is the main page and is eager-loaded so the first paint is not delayed.
import Home from './pages/Home';
import __Layout from './Layout.jsx';

// Everything else is code-split. The admin dashboard in particular pulls in
// jspdf, html2canvas and the chart library, which would otherwise ship to
// every visitor on the initial page load.
const ExecutiveInterviews = lazy(() => import('./pages/ExecutiveInterviews'));
const InterviewDetail = lazy(() => import('./pages/InterviewDetail'));
const DigitalMagazine = lazy(() => import('./pages/DigitalMagazine'));
const SpotlightAwards = lazy(() => import('./pages/SpotlightAwards'));
const NominationForm = lazy(() => import('./pages/NominationForm'));
const Advertise = lazy(() => import('./pages/Advertise'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const SubmitStory = lazy(() => import('./pages/SubmitStory'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Login = lazy(() => import('./pages/Login'));

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
    "Login": Login,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};