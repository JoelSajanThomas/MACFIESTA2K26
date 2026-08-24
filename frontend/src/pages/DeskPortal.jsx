import { Link } from "react-router-dom";

import PageHeader from "../components/PageHeader";

import { PAGE_IMAGES } from "../utils/assets";

import { DESK_COMMITTEES, deskLoginPath } from "../utils/deskCommittees";



/**

 * Simple committee desk portal — plain language cards.

 */

export default function DeskPortal() {

  return (

    <>

      <PageHeader

        eyebrow="Staff"

        title="Committee Login"

        subtitle="Pick your desk. Sign in. Only your tools appear."

        seoDescription="MacFiesta committee desk login portal."

        image={PAGE_IMAGES.login}

      />

      <section className="section page-content desk-portal">

        <div className="container">

          <p className="desk-portal-note">
            Volunteers: use <Link to="/volunteer/login">Volunteer Login</Link> (one login, auto desk).
            {" "}
            Students use <Link to="/login">Student Login</Link>.
          </p>

          <div className="desk-portal-grid">

            {DESK_COMMITTEES.map((desk) => (

              <article key={desk.slug} className={`desk-portal-card desk-portal-card--${desk.slug}`}>

                <h2>{desk.label}</h2>

                <p>{desk.blurb}</p>

                <Link to={deskLoginPath(desk.slug)} className="btn btn-gold">

                  Login to {desk.label}

                </Link>

              </article>

            ))}

          </div>

        </div>

      </section>

    </>

  );

}


