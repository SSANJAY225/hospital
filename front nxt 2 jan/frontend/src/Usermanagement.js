import { Link } from "react-router-dom"
import { useLocation } from "react-router-dom";
const Usermanagemanet = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const username = searchParams.get('loginlocation');
    return (<>
        <div className='main-container'>
            <div className='panel-container'>
                <div className='panel-content'>
                    <div className='action-buttons'>
                        <Link to={`/createuser?loginlocation=${username}`} className='button-link'>Add user</Link>
                        <Link to={`/manageusers?loginlocation=${username}`}className='button-link'>Manage users</Link>
                    </div>
                </div>
            </div>         
        </div>
    </>)
}

export default Usermanagemanet