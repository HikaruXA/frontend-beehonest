import React from "react";
import { Link } from "react-router-dom";
import styles from "./Landing.module.css";

const Landing = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <ul className={styles.navListLeft}>
            <li>
              <a href="#about" className={styles.navLink}>
                About
              </a>
            </li>

            <li>
              <a href="#features" className={styles.navLink}>
                Features
              </a>
            </li>
            <li>
              <a href="#demonstration" className={styles.navLink}>
                Demonstration
              </a>
            </li>
            <li>
              <a href="#contact" className={styles.navLink}>
                Contact
              </a>
            </li>
          </ul>
          <ul className={styles.navListRight}>
            <li>
              <Link to="/login" className={styles.navLink}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={styles.navLink}>
                Register
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.landing}>
          <div className={styles.taglineContainer}>
            <h2 className={styles.tagline}>BEEHONEST</h2>
            <p className={styles.tagline2}>
              "We encourage honesty as it is our number one policy."
            </p>
          </div>
          <div className={styles.landingImage}>
            <img src="/logo/bee.png" alt="Use of Smartphone Detection" />
          </div>
        </div>

        {/* Insert the SVG wave below the landing section */}

        <section id="about" className={styles.section}>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.CardContainer}>
            <div className={styles.aboutCard}>
              <img
                src="/logo/object detection.png" // Add your logo image here
                alt="About Us Logo"
                className={styles.cardLogo}
              />
              <h3 className={styles.cardTitle}>Object Detection</h3>
              <p className={styles.cardDescription}>
                Our platform utilizes Object Detection pre-trained model by
                Tensorflow.js to ensure a secure and fair environment for online
                assessments. By doing so, we promote academic integrity and
                provide a reliable tool for educators.
              </p>
            </div>
            <div className={styles.aboutCard}>
              <img
                src="/logo/face detection.png" // Add your logo image here
                alt="About Us Logo"
                className={styles.cardLogo}
              />
              <h3 className={styles.cardTitle}>Face Detection</h3>
              <p className={styles.cardDescription}>
                Our platform utilizes Face Detection pre-trained model by
                Tensorflow.js to ensure a secure and fair environment for online
                assessments. By doing so, we promote academic integrity and
                provide a reliable tool for educators.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className={styles.section}>
          <h2 className={styles.sectionTitle}>Features</h2>
          <p className={styles.sectionContent}>
            These are the following detection features that the website provides
            to minimize online cheating.
          </p>
          <div className={styles.servicesContainer}>
            <div className={styles.serviceCard}>
              <img
                src="/logo/smartphone.svg"
                alt="Use of Smartphone Detection"
                className={styles.serviceLogo}
              />
              <h3>Use of Smartphone</h3>
              <p>The LMS can detect the use of smartphone.</p>
            </div>
            <div className={styles.serviceCard}>
              <img
                src="/logo/multiplepeople.svg"
                alt="Multiple People Detection"
                className={styles.serviceLogo}
              />
              <h3>Multiple People</h3>
              <p>The LMS can detect multiple people.</p>
            </div>
            <div className={styles.serviceCard}>
              <img
                src="/logo/copy.svg"
                alt="Copy and Paste Detection"
                className={styles.serviceLogo}
              />
              <h3>Shortcut Keys</h3>
              <p>The LMS can detect copy and paste shortcut keys.</p>
            </div>
            <div className={styles.serviceCard}>
              <img
                src="/logo/ghost.svg"
                alt="No Person Detected"
                className={styles.serviceLogo}
              />
              <h3>No person</h3>
              <p>
                The LMS can detect if there is a person during the assessment.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <img
                src="/logo/emoji.svg"
                alt="Not looking at the front"
                className={styles.serviceLogo}
              />
              <h3>Face Movement</h3>
              <p>
                The LMS can detect if the student is not looking at the front.
              </p>
            </div>
            <div className={styles.serviceCard}>
              <img
                src="/logo/tabs.svg"
                alt="Switch tabs"
                className={styles.serviceLogo}
              />
              <h3>Switch Tabs</h3>
              <p>
                The LMS can detect if the student switches tab during the
                assessments.
              </p>
            </div>
          </div>
        </section>

        <section id="demonstration" className={styles.section}>
          <h2 className={styles.sectionTitle}>Demonstration</h2>
          <p className={styles.sectionContent}>
            Watch our quick demonstration for both educators and students to get
            started.
          </p>
          <div className={styles.CardContainer}>
            <div className={styles.aboutCard}>
              <img
                src="/logo/professor.svg"
                alt="Switch tabs"
                className={styles.serviceLogo}
              />
              <h3 className={styles.cardTitle}>Educator Demonstration</h3>
              <a
                href="https://drive.google.com/file/d/1IwhugUl1i1S3PfcTfX_Lf27rm2yYBz0E/view?usp=sharing"
                className={styles.cardLink}
              >
                Click here!
              </a>
            </div>

            <div className={styles.aboutCard}>
              <img
                src="/logo/student.svg"
                alt="Switch tabs"
                className={styles.serviceLogo}
              />
              <h3 className={styles.cardTitle}>Student Demonstration</h3>
              <a
                href="https://drive.google.com/file/d/1T7udi-JZjakDZ5MVSmKpnJiroR5I6srf/view?usp=sharing"
                className={styles.cardLink}
              >
                Click here!
              </a>
            </div>
          </div>
        </section>
        <section id="contact" className={styles.section}>
          <h2 className={styles.sectionTitle}>Contact Us</h2>
          <p className={styles.sectionContent}>
            If you have any questions or would like to know more about our
            services, please reach out to us. You can contact us via email:
            <br></br>
            📧 r.cabangal.524231@umindanao.edu.ph
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          © 2024 Our Company. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
