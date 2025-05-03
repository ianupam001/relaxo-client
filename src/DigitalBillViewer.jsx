"use client";

import { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DigitalBillViewer = () => {
  // Slider state
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const contact = searchParams.get("contact");

  const billRef = useRef(null);

  const fetchData = async (phone) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://relaxobilling.onrender.com/api/bills/${phone}`
      );
      if (res.data && res.data.length > 0) {
        setBill(res.data[0]);
      } else {
        setError("No bill found for this contact");
      }
    } catch (err) {
      setError("Error fetching bill data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contact) {
      fetchData(contact);
    }
  }, [contact]);

  // Popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Sample slides data (replace with your actual data)
  const slides = [
    {
      logoSrc: "public/logo192.png",
      location: bill?.storeData?.displayAddress || "STORE LOCATION",
    },
    {
      address: bill?.storeData?.storeAddress || "STORE ADDRESS",
    },
  ];

  // Slide navigation handler
  const slide = (direction) => {
    let newIndex = slideIndex + direction;
    if (newIndex < 0) newIndex = slides.length - 1;
    else if (newIndex >= slides.length) newIndex = 0;
    setSlideIndex(newIndex);
  };

  // Popup handlers
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  // Handle star rating
  const handleStarClick = (value) => {
    setRating(value);
    openPopup();
  };

  // Handle feedback submission
  const submitFeedback = async () => {
    try {
      const payload = {
        phone: bill?.customerData?.phone,
        rating,
        feedback,
        bill_id: bill?._id,
      };
      const res = await axios.post(
        "https://relaxobilling.onrender.com/api/feedback",
        {
          payload,
        }
      );
      setFeedbackSubmitted(true);
      closePopup();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  // Submit without feedback
  const submitWithoutFeedback = async () => {
    try {
      await axios.post("https://relaxobilling.onrender.com/api/feedback", {
        billId: bill?._id,
        rating,
        feedback: "",
        contact: bill?.customerData?.phone,
      });
      setFeedbackSubmitted(true);
      closePopup();
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Failed to submit rating. Please try again.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!billRef.current) return;

    try {
      // Show loading indicator
      const downloadButton = document.querySelector(".downloadpdf-button");
      if (downloadButton) {
        downloadButton.textContent = "Generating PDF...";
        downloadButton.disabled = true;
      }

      // Temporarily hide the download button for the PDF
      if (downloadButton) downloadButton.style.display = "none";

      const canvas = await html2canvas(billRef.current, {
        scale: 1.5, // Reduced scale for better fit
        useCORS: true,
        logging: false,
        windowWidth: 1000, // Fixed width for consistent rendering
        onclone: (clonedDoc) => {
          // Adjust font sizes in the cloned document to make content more compact
          const styles = clonedDoc.createElement("style");
          styles.innerHTML = `
          .bill-body p { font-size: 8px !important; margin: 2px 0 !important; }
          .bill-body .heading1 { font-size: 10px !important; }
          .bill-body .fs14 { font-size: 9px !important; }
          .bill-body .mt18 { margin-top: 5px !important; }
          .bill-body .mb10 { margin-bottom: 3px !important; }
          .bill-body hr.dashed-line { margin: 3px 0 !important; }
          .bill-body .tblcontainer { margin: 3px 0 !important; }
          .bill-body table { margin: 2px 0 !important; }
        `;
          clonedDoc.head.appendChild(styles);
        },
      });

      // Restore the download button
      if (downloadButton) {
        downloadButton.style.display = "block";
        downloadButton.textContent = "Download PDF";
        downloadButton.disabled = false;
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the image to fit on a single page
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, 297));

      pdf.save(`Relaxo_Bill_${bill.transactionalData.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");

      // Reset button state in case of error
      const downloadButton = document.querySelector(".downloadpdf-button");
      if (downloadButton) {
        downloadButton.textContent = "Download PDF";
        downloadButton.disabled = false;
        downloadButton.style.display = "block";
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Loading bill data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!bill) {
    return <div className="error-container">No bill data available</div>;
  }

  return (
    <main>
      <section id="bill-desk">
        <div className="main-bill-container">
          {/* Bill Head */}
          <div className="bill-head">
            <div className="slider-container">
              <div className="slider-wrapper" id="slider">
                {slides.map((slideItem, idx) => (
                  <div
                    key={idx}
                    className="slide"
                    style={{ display: idx === slideIndex ? "block" : "none" }}
                  >
                    {slideItem.logoSrc ? (
                      <div className="head-sec">
                        <img
                          src={logo || "/placeholder.svg"}
                          className="relaxo-logo-bill-generator"
                          alt="Relaxo Logo"
                        />
                        <p>{slideItem.location}</p>
                      </div>
                    ) : (
                      <div className="slide2-data">
                        <p>{slideItem.address}</p>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  className={`arrow left ${slideIndex === 0 ? "hidden" : ""}`}
                  id="leftArrow"
                  onClick={() => slide(-1)}
                  aria-label="Previous Slide"
                >
                  &lt;
                </button>
                <button
                  className="arrow right"
                  id="rightArrow"
                  onClick={() => slide(1)}
                  aria-label="Next Slide"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          {/* Bill Review */}
          <div className="bill-review">
            <div className="stars">
              {feedbackSubmitted ? (
                <p className="feedtext">Feedback submitted</p>
              ) : (
                <p className="feedtext">Rate your experience</p>
              )}
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src={rating >= star ? "/star-selected.png" : "/star.png"}
                  data-value={star}
                  className={`star-img ${rating >= star ? "active" : ""}`}
                  alt="star"
                  onClick={() => !feedbackSubmitted && handleStarClick(star)}
                  style={{ cursor: feedbackSubmitted ? "default" : "pointer" }}
                />
              ))}
            </div>

            {/* Popup Overlay */}
            {isPopupOpen && (
              <div
                className="popup-overlay"
                id="popupOverlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000,
                }}
              >
                <div
                  className="popup"
                  style={{
                    backgroundColor: "white",
                    padding: "20px",
                    borderRadius: "8px",
                    width: "90%",
                    maxWidth: "400px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                  }}
                >
                  <span
                    className="close-btn"
                    onClick={closePopup}
                    role="button"
                    tabIndex={0}
                    aria-label="Close popup"
                    style={{
                      cursor: "pointer",
                      fontSize: "24px",
                      alignSelf: "flex-end",
                    }}
                  >
                    ×
                  </span>
                  <textarea
                    placeholder="Got any suggestions?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{
                      width: "5 rem",
                      minHeight: "100px",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      className="submit-btn"
                      onClick={submitWithoutFeedback}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#f0f0f0",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      Submit without feedback
                    </button>
                    <button
                      className="submit-btn"
                      onClick={submitFeedback}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      Submit feedback
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bill Body */}
          <div className="bill-body" ref={billRef}>
            <div className="bill-part1">
              <p className="heading1 uppercase mt18 wid100 fs14">
                {bill.transactionalData.invoiceType}
              </p>
              <p className="heading1 mt18 wid100 fs14">
                {bill.companyData.name}
              </p>
              <p className="content2 mt18">
                <span className="wt600">Store Contact Number : &nbsp;</span>
                {bill.storeData.storeNumberPrimary}
              </p>
            </div>

            <div className="flexrow wid100 mb10">
              <div className="dcol1">
                <p className="content1 mt18">
                  <span className="wt600">Retail Shoppe :&nbsp; </span>
                </p>
              </div>
              <div className="dcol2">
                <p className="content1 mt18">{bill.storeData.storeAddress}</p>
              </div>
            </div>

            <div className="flexrow wid100 mb10">
              <div className="dcol1">
                <p className="content1 mt18">
                  <span className="wt600">Principal Office : &nbsp;</span>
                </p>
              </div>
              <div className="dcol2">
                <p className="content1 mt18">{bill.companyData.address}</p>
              </div>
            </div>

            <p className="content2 mb10">
              <span className="wt600">GSTIN :&nbsp; </span>
              {bill.storeData.storeGstNumber}
            </p>

            <hr className="dashed-line" />

            {/* 1st section table */}
            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Date :&nbsp; </span>
                        </p>
                        <p className="content1 mt18">
                          {bill.transactionalData.invDate}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          <span className="wt600">Time :&nbsp; </span>
                        </p>
                        <p className="content1 mt18">
                          {bill.transactionalData.invTime}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2">
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Invoice No :&nbsp; </span>
                        </p>
                        <p className="content1 mt18">
                          {bill.transactionalData.invoiceNumber}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />
            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="concont justify-content-center">
                        <p className="content1 mt18">
                          <span className="wt600">Mobile No :&nbsp; </span>
                        </p>
                        <p className="content1 mt18">
                          {bill.customerData.phone}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <hr className="dashed-line" />

            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">HSN Code&nbsp; </span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-center">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">GST %&nbsp; </span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">MRP&nbsp; </span>
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">Item Code&nbsp; </span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-center">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">QTY&nbsp; </span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">Amount&nbsp; </span>
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2">
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">Description&nbsp; </span>
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />

            {/* Product Items */}
            {bill.productsData.map((product, index) => (
              <div key={index} className="tblcontainer">
                <div className="tblcontainer">
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <div className="concont">
                            <p className="content1 mt18">{product.hsnCode}</p>
                          </div>
                        </td>
                        <td>
                          <div className="concont justify-content-center">
                            <p className="content1 mt18">
                              {product.gstPercent}%
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="concont justify-content-end">
                            <p className="content1 mt18">
                              ₹{product.unitAmount.toFixed(2)}
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="concont">
                            <p className="content1 mt18">
                              {product.productCode}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div className="concont justify-content-center">
                            <p className="content1 mt18">{product.quantity}</p>
                          </div>
                        </td>
                        <td>
                          <div className="concont justify-content-end">
                            <p className="content1 mt18">
                              <span className="wt600">
                                ₹{product.totalAmount.toFixed(2)}&nbsp;{" "}
                              </span>
                            </p>
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td colSpan="2">
                          <div className="concont">
                            <p className="content1 mt18">{product.name}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <hr className="dashed-line" />
              </div>
            ))}

            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">
                            Total QTY : {bill.billAmountData.totalQty}
                          </span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          <span className="wt600">
                            Grand Total: ₹
                            {bill.billAmountData.netPayableAmount.toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />
            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Net Payable</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          ₹{bill.billAmountData.netPayableAmount.toFixed(2)}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />

            {/* Loyalty Information Section */}
            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td colSpan="2">
                      <div className="concont justify-content-center">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">
                            Loyalty Information
                          </span>
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Card Num</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          {bill.loyaltyData.cardNum}
                        </p>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Card Holder Name</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          {bill.loyaltyData.cardHolderName}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Points Earned</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          {bill.loyaltyData.pointsEarned}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Points Redeemed</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          {bill.loyaltyData.pointsRedeemed}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Points Available</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          {bill.loyaltyData.pointsAvailable}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Points Balance</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          {bill.loyaltyData.pointsBalance}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />

            {/* Payment Methods Section */}
            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td colSpan="2">
                      <div className="concont justify-content-center">
                        <p className="content1 mt18">
                          <span className="wt600 fs14">Payment Methods</span>
                        </p>
                      </div>
                    </td>
                  </tr>
                  {bill.paymentData.paymentMethods.map((method, index) => (
                    <tr key={index}>
                      <td>
                        <div className="concont">
                          <p className="content1 mt18">
                            <span className="wt600">{method.name}</span>
                          </p>
                        </div>
                      </td>
                      <td>
                        <div className="concont justify-content-end">
                          <p className="content1 mt18">
                            ₹{method.amount.toFixed(2)}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Amount in words</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          **** {bill.billAmountData.amountInWords}
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />

            {/* Footer Sections */}
            <div className="tblcontainer">
              <div className="offadd justify-content-center">
                <p className="text-center">
                  <span className="wt600">Regd. Off. : </span>{" "}
                  {bill.companyData.address}
                </p>
              </div>
              <div className="offadd justify-content-center mb10">
                <p className="text-center">
                  <span className="wt600">CIN No. : </span>{" "}
                  {bill.companyData.cin}
                </p>
              </div>
            </div>

            <hr className="dashed-line" />

            <div className="offadd justify-content-center">
              <p className="text-center">
                All prices are inclusive of GST. Subject to Delhi Jurisdiction.
              </p>
            </div>

            <div className="offadd justify-content-center mb10">
              <p className="text-center">
                {bill.billFooterData.disclaimer ||
                  "Thank you for shopping at Relaxo."}
              </p>
            </div>
            <div className="offadd justify-content-center mb10">
              <p className="text-center">
                Thank you for sharing your contact details. We will use this
                information for loyalty management and to share product updates
                and offers. Your data will be handled in accordance with our
                Privacy Policy, which outlines how we collect, use, and protect
                your information. By sharing your details, you consent to these
                terms. For further details, please refer to our{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://relaxofootwear.com/pages/help-privacy"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <hr className="dashed-line" />
            <div className="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div className="concont justify-content-center">
                        <p className="content1 mt18">
                          <a
                            href="javascript:void(0);"
                            className="myPopup_trigger"
                          >
                            Terms and conditions
                          </a>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-center">
                        <a
                          href="javascript:void(0);"
                          className="myPopup_trigger"
                        >
                          Need help? Click here
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="fpart1">
              <img
                src={logo || "/placeholder.svg"}
                className="relaxo-logo-bill-generator"
                alt="Relaxo Logo"
              />
            </div>

            <div className="bill-footer">
              <div className="fpart2">
                <button
                  className="downloadpdf-button"
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DigitalBillViewer;
