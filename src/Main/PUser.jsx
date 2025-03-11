import React, { useState, useEffect, useRef } from "react";
import { db } from "../Firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import "./PUser.css";
import { collection, query, where, getDocs } from "firebase/firestore";

const PUser = () => {
  const { patientId } = useParams(); // Getting patientId from the URL
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [familyDetails, setFamilyDetails] = useState([]); // State for family details
  const navigate = useNavigate();
  const componentRef = useRef(); // Ref for printing

  // Fetching patient details
  const fetchPatient = async () => {
    try {
      const docRef = doc(db, "Patients", patientId); // Fetch patient document based on patientId from URL
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const patientData = docSnap.data();
        setPatient(patientData);
        if (patientData.familyDetails) {
          setFamilyDetails(patientData.familyDetails); // Set family details if available
        }
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching patient details: ", error);
    }
  };

  // Fetching medicines related to this patient
  const fetchMedicines = async () => {
    try {
      if (patient) {
        const medicinesRef = collection(db, "Medicines");
        const q = query(medicinesRef, where("patientId", "==", patient.patientId));
        const querySnapshot = await getDocs(q);
        const medicinesData = querySnapshot.docs.map((doc) => doc.data());
        const allMedicines = medicinesData.flatMap((data) => data.medicines || []);
        setMedicines(allMedicines);
      }
    } catch (error) {
      console.error("Error fetching medicines: ", error);
    }
  };

  // Fetching equipments related to this patient
  const fetchEquipments = async () => {
    try {
      if (patient) {
        const equipmentsRef = collection(db, "Equipments");
        const q = query(equipmentsRef, where("patientId", "==", patient.patientId));
        const querySnapshot = await getDocs(q);
        const equipmentsData = querySnapshot.docs.map((doc) => doc.data());
        setEquipments(equipmentsData);
      }
    } catch (error) {
      console.error("Error fetching equipments: ", error);
    }
  };

  // Fetching conditions related to this patient
  const fetchConditions = async () => {
    try {
      if (patient) {
        const conditionsRef = collection(db, "Conditions");
        const q = query(conditionsRef, where("patientId", "==", patient.patientId));
        const querySnapshot = await getDocs(q);
        const conditionsData = querySnapshot.docs.map((doc) => doc.data());
        setConditions(conditionsData);
      }
    } catch (error) {
      console.error("Error fetching conditions: ", error);
    }
  };

  useEffect(() => {
    fetchPatient(); // Fetch patient details
  }, [patientId]); // Re-run when patientId changes

  useEffect(() => {
    if (patient) {
      fetchMedicines();
      fetchEquipments();
      fetchConditions();
    }
  }, [patient]); // Re-run when patient data is set

  const handlePrint = () => {
    window.print(); // Trigger the browser's print dialog
  };

  if (!patient) {
    return          <div className="loading-container">
    <img
      src="https://media.giphy.com/media/YMM6g7x45coCKdrDoj/giphy.gif"
      alt="Loading..."
      className="loading-image"
    />
  </div>;
  }

  return (
    <div ref={componentRef} className="userpt-container">
      <button className="userpt-backButton hide-back-button" onClick={() => navigate(-1)}>
        &#8592; Back
      </button>
      <h2>Bystander Details</h2>
      <div className="userpt-card" ref={componentRef}>
        <div className="userpt-profileHeader">
      
          <h3>{patient.name || "N/A"}</h3>
        </div>

        {/* Patient Information Table */}
        <div className="userpt-infoTable">
          <table>
            <tbody>
              <tr>
                <td><strong>Address:</strong></td>
                <td>{patient.address || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Age:</strong></td>
                <td>{patient.age || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Location:</strong></td>
                <td>{patient.location || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Asha Worker:</strong></td>
                <td>{patient.ashaWorker || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Category:</strong></td>
                <td>{patient.category || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Community Volunteer:</strong></td>
                <td>{patient.communityVolunteer || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Community Volunteer Phone:</strong></td>
                <td>{patient.communityVolunteerPhone || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Current Difficulties:</strong></td>
                <td>{patient.currentDifficulties || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Date of Birth:</strong></td>
                <td>{patient.dob || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{patient.email || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Gender:</strong></td>
                <td>{patient.gender || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Main Caretaker:</strong></td>
                <td>{patient.mainCaretaker || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Main Caretaker Phone:</strong></td>
                <td>{patient.mainCaretakerPhone || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Main Diagnosis:</strong></td>
                <td>{patient.mainDiagnosis || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Medical History:</strong></td>
                <td>{patient.medicalHistory || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Neighbour Name:</strong></td>
                <td>{patient.neighbourName || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Neighbour Phone:</strong></td>
                <td>{patient.neighbourPhone || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Panchayat:</strong></td>
                <td>{patient.panchayat || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Patient ID:</strong></td>
                <td>{patient.patientId || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Referral Person:</strong></td>
                <td>{patient.referralPerson || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Referral Phone:</strong></td>
                <td>{patient.referralPhone || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Registered Date & Time:</strong></td>
                <td>{patient.registerTime ? new Date(patient.registerTime).toLocaleString() : "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Registration Date:</strong></td>
                <td>{patient.registrationDate || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Relative Phone:</strong></td>
                <td>{patient.relativePhone || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Ward:</strong></td>
                <td>{patient.ward || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Ward Member:</strong></td>
                <td>{patient.wardMember || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Ward Member Phone:</strong></td>
                <td>{patient.wardMemberPhone || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="userpt-equipmentsContainer">
          <h3>Medical Condition</h3>
          {conditions.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th> Medical Condition</th>
                </tr>
              </thead>
              <tbody>
                {conditions.map((condition, index) => (
                  <tr key={index}>
                    <td>{condition.conditionName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No conditions found for this patient.</p>
          )}
        </div>

        {/* Medicines Section */}
        <div className="userpt-medicinesContainer">
          <h3>Medicines</h3>
          {medicines.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Quantity</th>
                  <th>Time</th>
                  <th>Show</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine, index) => (
                  <tr key={index}>
                    <td>{medicine.medicineName}</td>
                    <td>{medicine.quantity}</td>
                    <td>{medicine.time}</td>
                    <td>{medicine.patientsNow ? "Show" : "Hide"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No medicines found for this patient.</p>
          )}
        </div>

        {/* Family Details Section */}
        {/* <div className="userpt-familyDetails">
          <h3>Family Details</h3>
          {familyDetails.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Relation</th>
                  <th>Age</th>
                  <th>Education</th>
                  <th>Income</th>
                  <th>Marriage Status</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {familyDetails.map((family, index) => (
                  <tr key={index}>
                    <td>{family.name || "N/A"}</td>
                    <td>{family.relation || "N/A"}</td>
                    <td>{family.age || "N/A"}</td>
                    <td>{family.education || "N/A"}</td>
                    <td>{family.income || "N/A"}</td>
                    <td>{family.marriageStatus || "N/A"}</td>
                    <td>{family.remark || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No family details found for this patient.</p>
          )}
        </div> */}

        {/* Equipments Section */}
        <div className="userpt-equipmentsContainer">
          <h3>Equipments</h3>
          {equipments.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Equipment Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {equipments.map((equipment, index) => (
                  <tr key={index}>
                    <td>{equipment.equipmentName}</td>
                    <td>{equipment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No equipment found for this patient.</p>
          )}
        </div>

        {/* Print Button */}
        <button className="userpt-printButton hide-back-button" onClick={handlePrint}>
          Download
        </button>
      </div>
    </div>
  );
};

export default PUser;
