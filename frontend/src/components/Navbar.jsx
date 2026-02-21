import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm px-4 py-2">
            <Link className="navbar-brand fw-bold fs-5" to="/">
                🚌 PublicTransit
            </Link>

            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#mainNav"
                aria-controls="mainNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="mainNav">
                <ul className="navbar-nav mx-auto gap-2">
                    <li className="nav-item">
                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) =>
                                isActive ? 'nav-link active fw-semibold' : 'nav-link'
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/search"
                            className={({ isActive }) =>
                                isActive ? 'nav-link active fw-semibold' : 'nav-link'
                            }
                        >
                            Search
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? 'nav-link active fw-semibold' : 'nav-link'
                            }
                        >
                            Profile
                        </NavLink>
                    </li>
                </ul>

                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <button className="btn btn-outline-danger btn-sm fw-semibold px-3">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
