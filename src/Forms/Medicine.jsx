import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { db } from "../Firebase/config";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MedAdd.css";

const Medicine = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patientData, setPatientData] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [medicineDocId, setMedicineDocId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [currentMedicine, setCurrentMedicine] = useState({
    medicine: null,
    newMedicine: "",
    quantity: "",
    time: "Morning",
    patientsNow: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch patient data
        const patientQuery = query(collection(db, "Patients"), where("patientId", "==", patientId));
        const patientSnapshot = await getDocs(patientQuery);

        if (!patientSnapshot.empty) {
          setPatientData(patientSnapshot.docs[0].data());
        }

        // Fetch medicines
        const medicineQuery = query(collection(db, "Medicines"), where("patientId", "==", patientId));
        const medicineSnapshot = await getDocs(medicineQuery);

        if (!medicineSnapshot.empty) {
          const docData = medicineSnapshot.docs[0].data();
          setMedicines(docData.medicines || []);
          setMedicineDocId(medicineSnapshot.docs[0].id);
        }

        // Fetch medicine options
        const medibaseSnapshot = await getDocs(collection(db, "medibase"));
        const options = medibaseSnapshot.docs.map(doc => ({
          value: doc.data().name,
          label: doc.data().name,
        }));
        setMedicineOptions(options);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleInputChange = (name, value) => {
    setCurrentMedicine(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentMedicine.medicine && !currentMedicine.newMedicine) {
      toast.error("Please enter medicine name");
      return;
    }
    if (!currentMedicine.quantity) {
      toast.error("Please enter quantity");
      return;
    }

    setIsSubmitting(true);

    try {
      // Add new medicine to medibase if needed
      if (currentMedicine.newMedicine && !medicineOptions.some(opt => opt.value === currentMedicine.newMedicine)) {
        await addDoc(collection(db, "medibase"), { name: currentMedicine.newMedicine });
        setMedicineOptions(prev => [...prev, 
          { value: currentMedicine.newMedicine, label: currentMedicine.newMedicine }
        ]);
      }

      const newMed = {
        medicineName: currentMedicine.newMedicine || currentMedicine.medicine.value,
        quantity: currentMedicine.quantity,
        time: currentMedicine.time,
        patientsNow: currentMedicine.patientsNow,
      };

      const updatedMeds = editingIndex !== null 
        ? medicines.map((med, i) => i === editingIndex ? newMed : med)
        : [...medicines, newMed];

      if (medicineDocId) {
        await updateDoc(doc(db, "Medicines", medicineDocId), { medicines: updatedMeds });
      } else {
        const docRef = await addDoc(collection(db, "Medicines"), {
          patientId,
          patientDetails: patientData,
          medicines: updatedMeds,
          submittedAt: new Date().toISOString(),
        });
        setMedicineDocId(docRef.id);
      }

      setMedicines(updatedMeds);
      setShowModal(false);
      setEditingIndex(null);
      setCurrentMedicine({
        medicine: null,
        newMedicine: "",
        quantity: "",
        time: "Morning",
        patientsNow: false,
      });

      toast.success("Medicine saved successfully!");
    } catch (error) {
      console.error("Error saving medicine:", error);
      toast.error("Error saving medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (index) => {
    const med = medicines[index];
    setCurrentMedicine({
      medicine: { value: med.medicineName, label: med.medicineName },
      newMedicine: "",
      quantity: med.quantity,
      time: med.time,
      patientsNow: med.patientsNow,
    });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this medicine?");
    if (!confirmDelete) return; // Exit if user cancels
  
    try {
      const updatedMeds = medicines.filter((_, i) => i !== index);
      await updateDoc(doc(db, "Medicines", medicineDocId), { medicines: updatedMeds });
      setMedicines(updatedMeds);
      toast.success("Medicine deleted successfully!");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast.error("Error deleting medicine");
    }
  };
  

  if (isLoading) {
    return (
      <div className="loading-container">
        <img
          src="https://media.giphy.com/media/YMM6g7x45coCKdrDoj/giphy.gif"
          alt="Loading..."
          className="loading-image"
        />
      </div>
    );
  }

  return (
    <div className="MedAdd-container">
      <button className="MedAdd-backButton" onClick={() => navigate(-1)}>
        &larr; Back
      </button>
      <h2 className="MedAdd-title">Manage Medicines for Patient ID: {patientId}</h2>

      {patientData && (
        <div className="MedAdd-patientInfo">
          <h3>Patient Details</h3>
          <p><strong>Name:</strong> {patientData.name}</p>
          <p><strong>Address:</strong> {patientData.address}</p>
        </div>
      )}

      <div className="MedAdd-header">
        <h3>Medication List</h3>
        <button className="MedAdd-addButton" onClick={() => setShowModal(true)}>
          Add New Medicine
        </button>
      </div>

      {medicines.length > 0 ? (
        <table className="MedAdd-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Quantity</th>
              <th>Time</th>
              <th>Patients Show</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med, index) => (
              <tr key={index}>
                <td>{med.medicineName}</td>
                <td>{med.quantity}</td>
                <td>{med.time}</td>
                <td>{med.patientsNow ? "Yes" : "No"}</td>
                <td>
                  <button onClick={() => handleEdit(index)} class="btn btn-warning btn-sm me-1 del-get">Edit</button>
                  <button onClick={() => handleDelete(index)} class="btn btn-danger btn-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No medications found</p>
      )}

      {showModal && (
        <div className="MedAdd-modal">
          <div className="MedAdd-modalContent">
            <h3>{editingIndex !== null ? "Edit Medicine" : "Add New Medicine"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="MedAdd-formGroup">
                <label>Medicine Name:</label>
                <Select
                  options={medicineOptions}
                  value={currentMedicine.medicine}
                  onChange={(option) => handleInputChange("medicine", option)}
                  placeholder="Select medicine"
                  isClearable
                />
                <span className="MedAdd-or">OR</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter new medicine name"
                  value={currentMedicine.newMedicine}
                  onChange={(e) => handleInputChange("newMedicine", e.target.value)}
                />
              </div>

              <div className="MedAdd-formGroup">
                <label>Quantity:</label>
                <input
                  type="number"
                  className="form-control"
                  value={currentMedicine.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                />
              </div>

              <div className="MedAdd-formGroup">
                <label>Time:</label>
                <select
                  value={currentMedicine.time}
                  className="form-control"
                  onChange={(e) => handleInputChange("time", e.target.value)}
                >
                 <option value="Morning">Morning</option>
<option value="Noon">Noon</option>
<option value="Night">Night</option>
<option value="Morning-Noon">Morning & Noon</option>
<option value="Morning-Night">Morning & Night</option>
<option value="Noon-Night">Noon & Night</option>
<option value="Morning-Noon-Night">Morning, Noon & Night</option>
<option value="SOS">SOS</option> 
                  
                 
                </select>
              </div>

              <div className="MedAdd-formGroup">
                <label>
                <input
  type="checkbox"
  checked={!!currentMedicine.patientsNow} 
  onChange={(e) => handleInputChange("patientsNow", e.target.checked)}
/>


                  Patients Show
                </label>
              </div>

              <div className="MedAdd-modalActions">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  onClick={() => {
                    setShowModal(false);
                    setEditingIndex(null);
                    setCurrentMedicine({
                      medicine: null,
                      newMedicine: "",
                      quantity: "",
                      time: "Morning",
                      patientsNow: false,
                    });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} class="btn btn-success btn-sm">
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Medicine;