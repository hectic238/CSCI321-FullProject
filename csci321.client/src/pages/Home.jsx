import { Link } from "react-router-dom";
import logoSmall from '../assets/logo_small.png';
import backgroundImg from '../assets/background.png';

function Home() {
    return (
        <>
            <div className="landing-page z-0 h-screen flex items-center justify-center" style={{ backgroundImage: `url(${backgroundImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className='flex flex-col items-center justify-center bg-white bg-opacity-70 rounded-full p-24'>
                    <img src={logoSmall} alt="Logo" className="homelogo mb-6" />
                    <h1 className="slogan mb-6">WHERE EVERY EVENT FALLS INTO PLACE</h1>
                    <Link to="/about" className="rounded-md bg-red-default hover:bg-red-500 px-3 py-2 text-sm font-semibold text-white shadow-sm" style={{ transition: 'all 0.3s ease-in-out' }}>
                        Find Events
                    </Link>
                </div>
            </div>
        </>
    )
}

export default Home;
