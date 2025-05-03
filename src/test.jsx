import React, { useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import bd from "../dbt/bd.json";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
const DigitalBillViewer = () => {
  // Slider state
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const [bill, setBill] = useState([]);
  const contact = searchParams.get("contact");

  const fetchData = async (phone) => {
    const res = await axios.get(
      `https://relaxobilling.onrender.com/api/bills/${phone}`
    );
    setBill(res.data);
    console.log(res);
  };

  useEffect(() => {
    fetchData(contact);
  }, []);

  // Popup state
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Sample slides data (replace with your actual data)
  const slides = [
    {
      logoSrc: "public/logo192.png",
      location: "RS040, RANI BAGH",
    },
    {
      address: "PLOT NO-1&2, WZ-4205/1,KHASRA NO-354,SANT NAGAR DELHI, 110034",
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
                          src={logo}
                          className="relaxo-logo-bill-generator"
                          alt=""
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
              <p className="feedtext">Feedback submitted</p>
              {[1, 2, 3, 4, 5].map((star) => (
                <img
                  key={star}
                  src="/star.png"
                  data-value={star}
                  className="star-img"
                  alt="star"
                  onClick={() => openPopup()}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>

            {/* Popup Overlay */}
            {isPopupOpen && (
              <div className="popup-overlay" id="popupOverlay">
                <div className="popup">
                  <span
                    className="close-btn"
                    onClick={closePopup}
                    role="button"
                    tabIndex={0}
                    aria-label="Close popup"
                  >
                    ×
                  </span>
                  <textarea placeholder="Got any suggestions?" />
                  <button
                    className="submit-btn"
                    onClick={() => alert("Submitted without feedback")}
                  >
                    Submit without feedback
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bill Body */}
          <div className="bill-body">
            <div className="bill-part1">
              <p className="heading1 uppercase mt18 wid100 fs14">
                {bd.transactionalData.invoiceType}
              </p>
              <p className="heading1 mt18 wid100 fs14">{bd.companyData.name}</p>
              <p className="content2 mt18">
                <span className="wt600">Store Contact Number : &nbsp;</span>011
                43029004
              </p>
            </div>

            <div className="flexrow wid100 mb10">
              <div className="dcol1">
                <p className="content1 mt18">
                  <span className="wt600">Retail Shoppe :&nbsp; </span>
                </p>
              </div>
              <div className="dcol2">
                <p className="content1 mt18">{bd.storeData.storeAddress}</p>
              </div>
            </div>

            <div className="flexrow wid100 mb10">
              <div className="dcol1">
                <p className="content1 mt18">
                  <span className="wt600">Principal Office : &nbsp;</span>
                </p>
              </div>
              <div className="dcol2">
                <p className="content1 mt18">{bd.companyData.name}</p>
              </div>
            </div>

            <p className="content2 mb10">
              <span className="wt600">GSTIN :&nbsp; </span>07AAACR0259D1ZS
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
                        <p className="content1 mt18">22/07/2022</p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">
                          <span className="wt600">Time :&nbsp; </span>
                        </p>
                        <p className="content1 mt18">12:35:15 PM</p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="2">
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Invoice No :&nbsp; </span>
                        </p>
                        <p className="content1 mt18">02223R040004933</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <hr className="dashed-line" />
            <div class="tblcontainer">
              <table>
                <tr>
                  <td>
                    <div class="concont justify-content-center">
                      <p class="content1  mt18">
                        <span class="wt600">Mobile No :&nbsp; </span>
                      </p>
                      <p class="content1  mt18"> 9643478844</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>
            <hr className="dashed-line" />
            {/* Additional sections (2nd to 11th) can be similarly structured */}

            <div class="tblcontainer">
              <table>
                <tr>
                  <td>
                    <div class="concont">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">HSN Code&nbsp; </span>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-center">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">GST %&nbsp; </span>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-end">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">MRP&nbsp; </span>
                      </p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="concont">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">Item Code&nbsp; </span>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-center">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">QTY&nbsp; </span>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-end">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">Amount&nbsp; </span>
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colspan="2">
                    <div class="concont">
                      <p class="content1  mt18">
                        <span class="wt600 fs14">Description&nbsp; </span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <hr class="dashed-line" />

            <div class="tblcontainer">
              <table>
                <tr>
                  <td>
                    <div class="concont">
                      <p class="content1  mt18">0603</p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-center">
                      <p class="content1  mt18">0.00%</p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-end">
                      <p class="content1  mt18">₹10.00</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="concont">
                      <p class="content1  mt18">I0045235</p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-center">
                      <p class="content1  mt18">1</p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-end">
                      <p class="content1  mt18">
                        <span class="wt600">₹10.00&nbsp; </span>
                      </p>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colspan="2">
                    <div class="concont">
                      <p class="content1  mt18">SHOE FRESHENER</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <hr class="dashed-line" />

            <div class="tblcontainer">
              <table>
                <tr>
                  <td>
                    <div class="concont">
                      <p class="content1  mt18">
                        <span class="wt600">Total QTY : 1</span>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-end">
                      <p class="content1  mt18">
                        <span class="wt600">Grand Total: ₹10.00</span>
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <hr class="dashed-line" />
            <div class="tblcontainer">
              <table>
                <tr>
                  <td>
                    <div class="concont">
                      <p class="content1  mt18">
                        <span class="wt600">Net Payable</span>
                      </p>
                    </div>
                  </td>
                  <td>
                    <div class="concont justify-content-end">
                      <p class="content1  mt18">₹10.00</p>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <hr class="dashed-line" />

            {/* Example: Loyalty Information Section */}
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
                        <p className="content1 mt18">{bd.customerData.phone}</p>
                      </div>
                    </td>
                  </tr>
                  {/* Add other loyalty rows similarly */}
                  <tr>
                    <td>
                      <div class="concont ">
                        <p class="content1  mt18">
                          <span class="wt600">Card Holder Name</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="concont justify-content-end">
                        <p class="content1  mt18">manpreet</p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div class="concont ">
                        <p class="content1  mt18">
                          <span class="wt600">Points Earned</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="concont justify-content-end">
                        <p class="content1  mt18">0</p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div class="concont ">
                        <p class="content1  mt18">
                          <span class="wt600">Points Redeemed</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="concont justify-content-end">
                        <p class="content1  mt18">0</p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div class="concont ">
                        <p class="content1  mt18">
                          <span class="wt600">Points Available</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="concont justify-content-end">
                        <p class="content1  mt18">14</p>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div class="concont ">
                        <p class="content1  mt18">
                          <span class="wt600">Points Balance</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="concont justify-content-end">
                        <p class="content1  mt18">14</p>
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
                  <tr>
                    <td>
                      <div className="concont">
                        <p className="content1 mt18">
                          <span className="wt600">Cash</span>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="concont justify-content-end">
                        <p className="content1 mt18">₹10.00</p>
                      </div>
                    </td>
                  </tr>
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
                          **** TEN RUPEES AND ZERO PAISA ONLY
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
                  <span className="wt600">Regd. Off. : </span> Aggarwal City
                  Square, District Centre, Manglam Palace, Sector-3, Rohini,
                  DELHI, 110085
                </p>
              </div>
              <div className="offadd justify-content-center mb10">
                <p className="text-center">
                  <span className="wt600">CIN No. : </span>{" "}
                  L74899DL1984PLC019097
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
            <div class="tblcontainer">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <div class="concont justify-content-center">
                        <p class="content1 mt18">
                          <a
                            href="javascript:void(0);"
                            class="myPopup_trigger"
                            onClick={"myPopup_open('my Popup-1')"}
                          >
                            Terms and conditions
                          </a>
                        </p>
                      </div>
                    </td>
                    <td>
                      <div class="concont justify-content-center">
                        <a
                          href="javascript:void(0);"
                          class="myPopup_trigger"
                          onClick={"myPopup_open('my Popup-2')"}
                        >
                          Need help? Click here
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="fpart1">
              <img src={logo} className="relaxo-logo-bill-generator" alt="" />
            </div>

            <div class="bill-footer ">
              <div class="fpart2">
                <button className="downloadpdf-button">Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DigitalBillViewer;
