import React from "react";
import styles from "./termsandcondition.module.css";

function Termsandcondition() {
  return (
    <>
      <div className={styles.termsandcondition}>
        <div className={styles.title}>
          <h1>Terms and Conditions</h1>
        </div>
        <div className={styles.content}>
          <p className={styles.intro}>
            Welcome to BeeHonest's LMS. By accessing or using our Site, you
            agree to comply with and be bound by the following terms and
            conditions. If you do not agree to these Terms, please do not use
            our Site.
          </p>
          <hr />
          <div className={styles.subtitle}>
            <h2>1. Acceptance of Terms</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              By creating an account and using our services, you agree to these
              Terms, including our Privacy Policy, which describes how we
              collect, use, and share your information.
            </p>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>2. Account Registration</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              To use certain features of the Site, you must create an account.
              When you register, you will provide us with the following
              information:
            </p>
            <ul>
              <li>Email address</li>
              <li>Password</li>
              <li>First name</li>
              <li>Last name</li>
            </ul>
            <p>
              You are responsible for maintaining the confidentiality of your
              password and account information and for all activities that occur
              under your account. You agree to notify us immediately of any
              unauthorized use of your account.
            </p>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>3. Data Collection</h2>
          </div>
          <div className={styles.subdescription}>
            <p>Our LMS collects the following data:</p>
            <ul>
              <li>
                <strong>Account Details:</strong> We collect your email address,
                password, first name, and last name for account creation and
                management.
              </li>
              <li>
                <strong>Cheating Behaviors:</strong> During assessments, we will
                monitor and collect data related to cheating behaviors. This
                includes:
                <ul>
                  <li>Use of shortcut keys</li>
                  <li>Switching tabs</li>
                  <li>
                    Detecting smartphone use (through the use of your camera)
                  </li>
                  <li>
                    Detecting multiple people present (through the use of your
                    camera)
                  </li>
                  <li>
                    Monitoring face movements (through the use of your camera)
                  </li>
                  <li>
                    Checking for the absence of a person during the assessment
                    (through the use of your camera)
                  </li>
                </ul>
              </li>
            </ul>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>4. Camera Usage During Assessments</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              As a condition of taking assessments, you are required to turn on
              your camera. By doing so, you consent to the collection of the
              aforementioned cheating behavior data. This data will be monitored
              and analyzed to ensure academic integrity.
            </p>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>5. Use of Data</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              By creating an account, you authorize educators to access and
              review all data collected regarding cheating behaviors attempted
              during assessments. This data may be used to enforce academic
              policies and to maintain the integrity of the educational process.
            </p>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>6. Data Security</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              We take the security of your data seriously. We implement
              reasonable security measures to protect your information from
              unauthorized access, disclosure, alteration, and destruction.
              However, no method of transmission over the internet or method of
              electronic storage is 100% secure.
            </p>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>7. Changes to the Terms</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              We may update these Terms from time to time. We will notify you of
              any changes by posting the new Terms on this page. Your continued
              use of the Site after any changes constitutes your acceptance of
              the new Terms.
            </p>
          </div>
          <hr />
          <div className={styles.subtitle}>
            <h2>9. Contact Information</h2>
          </div>
          <div className={styles.subdescription}>
            <p>
              If you have any questions about these Terms, please contact us at
              beehonest10@gmail.com.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Termsandcondition;
