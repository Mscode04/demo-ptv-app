import React, { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import "./ReportsPage.css";

const ReportsPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [pin, setPin] = useState("");

  const reportsPerPage = 22;

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const reportsRef = collection(db, "Reports");
        let q = query(reportsRef, where("patientId", "==", patientId));

        if (startDate) {
          q = query(q, where("submittedAt", ">=", new Date(startDate)));
        }
        if (endDate) {
          q = query(q, where("submittedAt", "<=", new Date(endDate)));
        }
        if (typeFilter) {
          q = query(q, where("formType", "==", typeFilter));
        }

        const querySnapshot = await getDocs(q);
        const reportsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReports(reportsData);
      } catch (error) {
        console.error("Error fetching reports: ", error);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [patientId, startDate, endDate, typeFilter, currentPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(reports.length / reportsPerPage);
  const currentReports = reports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  const getReportDetailsRoute = (formType, reportId) => {
    switch (formType) {
      case "NHC":
        return `/main/reportsdetailnhc/${reportId}`;
      case "NHC(E)":
        return `/main/reportsdetailnhce/${reportId}`;
      case "DHC":
        return `/main/report-details-dhc/${reportId}`;
      case "PROGRESSION REPORT":
        return `/main/report-details-progression/${reportId}`;
      case "SOCIAL REPORT":
        return `/main/report-details-social/${reportId}`;
      case "VHC":
        return `/main/report-details-vhc/${reportId}`;
      case "GVHC":
        return `/main/report-details-vhc/${reportId}`;
      case "INVESTIGATION":
        return `/main/report-details-investigation/${reportId}`;
      case "DEATH":
        return `/main/report-details-death/${reportId}`;
      default:
        return `/main/report-details-default/${reportId}`;
    }
  };

  const handleDeleteClick = (reportId) => {
    setReportToDelete(reportId);
    setShowConfirmation(true);
  };

  const handlePinChange = (e) => {
    setPin(e.target.value);
  };

  const handleConfirmDelete = async () => {
    if (pin === "2012") {
      try {
        await deleteDoc(doc(db, "Reports", reportToDelete));
        setReports(reports.filter((report) => report.id !== reportToDelete));
        setShowConfirmation(false);
        setPin("");
        toast.success("Report deleted successfully!"); // Use toast.success for success messages
      } catch (error) {
        console.error("Error deleting report: ", error);
        toast.error("Failed to delete report."); // Use toast.error for error messages
      }
    } else {
      toast.error("Incorrect PIN."); // Use toast.error for incorrect PIN
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setPin("");
  };

  return (
    <div className="reports-page-container">
      {/* Add ToastContainer here */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastStyle={{ marginTop: "20px" }}
      />

      <div className="back-button-container">
        <button onClick={() => navigate(-1)} className="back-button">
          Back
        </button>
      </div>
      <h2 className="text-white">Reports ({reports.length})</h2>

      <div className="filters-container">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="NHC">NHC</option>
          <option value="NHC(E)">NHC(E)</option>
          <option value="DHC">DHC</option>
          <option value="PROGRESSION REPORT">Progression Report</option>
          <option value="SOCIAL REPORT">Social Report</option>
          <option value="VHC">VHC</option>
          <option value="GVHC">GVHC</option>
          <option value="INVESTIGATION">Investigation</option>
          <option value="DEATH">Death</option>
        </select>
      </div>

      {loading ? (
        <p>         <div className="loading-container">
        <img
          src="https://media.giphy.com/media/YMM6g7x45coCKdrDoj/giphy.gif"
          alt="Loading..."
          className="loading-image"
        />
      </div></p>
      ) : error ? (
        <p>{error}</p>
      ) : currentReports.length === 0 ? (
        <p>No reports found for this patient.</p>
      ) : (
        <div className="reports-list">
          {currentReports.map((report) => (
            <div key={report.id} className="report-item">
              <Link
                to={getReportDetailsRoute(report.formType, report.id)}
                className="report-link"
              >
                <h3>{report.formType || "Report Title"}</h3>
                <p>
                  {report.submittedAt
                    ? new Date(report.submittedAt).toLocaleString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                        hour12: true,
                      })
                    : "No date available"}
                </p>
                <p>{report.name || "No Name"}</p>
                <p className="AllRep-report-name">REPORTED BY: {report.team1 || "NOT MENTION"}</p>
              </Link>
              <button onClick={() => handleDeleteClick(report.id)} className="delete-button">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>{currentPage}</span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {showConfirmation && (
        <div className="confirmation-box">
          <p>Enter PIN to delete the report:</p>
          <input
            type="password"
            value={pin}
            onChange={handlePinChange}
            placeholder="Enter PIN"
          />
          <button onClick={handleConfirmDelete}>Confirm</button>
          <button onClick={handleCancelDelete}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;