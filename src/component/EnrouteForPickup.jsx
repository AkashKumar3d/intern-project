import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { FaTruckPickup } from "react-icons/fa";
import { WorkBook, WorkSheet, utils, writeFile } from "xlsx";
import { useNavigate } from "react-router-dom";

const EnrouteForPickup = () => {
  const token = sessionStorage.getItem("token");
  const nagivate = useNavigate();
  const [combo, setCombo] = useState([]);
  const [loader, setLoader] = useState(false);
  const headers = {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NjQ2MDI2MDIsInVzZXJJZCI6Ijc3N2Q5YzIwLTEyNWYtNDhhZS04MWZjLTUzZWI2ZWM3MjZmZSIsImVtYWlsIjoiZGF0YS5zY2llbmNlQGFnYXJ3YWxwYWNrZXJzLmNvbSIsIm1vYmlsZU51bWJlciI6IjgyOTE4NDk1NjUiLCJvcmdJZCI6IjQwNTJhYjI0LTA1NDMtNGNkNC1iNTE3LTllNzhlZmVlNGZlZCIsIm5hbWUiOiJQcml5YWVzaCBQYXRlbCIsIm9yZ1R5cGUiOiJGTEVFVF9PV05FUiIsImlzR29kIjpmYWxzZSwicG9ydGFsVHlwZSI6ImJhc2ljIn0.cJR4aISn0MMed1zPQqPxkMsZTn0_9N0W9n1D5mCzLMw",
    "Content-Type": "application/json",
  };

  const url1Data = {
    filters: {
      consigner: [
        "RENEWSYS-PATAL GANGA-PANVAL CHOWK-MUMBAI",
      ],
      orderDate: {
        from: 1680287400000,
      },
    },
    limit: 5000,
  };

  const url2Data = {
    filters: {
      shipmentStatus: ["Planned", "Created"],
      // customer: ["RENEWSYS"],
      customer: ["RENEWSYS"],
      shipmentDate: {
        from: 1680287400000,
      },
    },
  };

  const url1 =
    "https://apis.fretron.com/automate/autoapi/run/255ab0db-70ed-4933-a0cc-b30b67b70955";
  const url2 =
    "https://apis.fretron.com/automate/autoapi/run/67953f4a-fb2d-4548-a86f-7b4ce2d710d2";

  function fetching() {
    const promise1 = axios.post(url1, url1Data, headers);
    const promise2 = axios.post(url2, url2Data, headers);

    Promise.all([promise1, promise2]).then((message) => {
      let pendingResponse = [];
      for (let i = 0; i < message[1].data.data.length; i++) {
        if (
          message[1].data.data[i].shipmentTrackingStatus ===
          "Enroute For Pickup"
        ) {
          pendingResponse.push(message[1].data.data[i]);
        }
      }


      const pink = [];
      pendingResponse.map((res) => {
        for (let i = 0; i < message[0].data.data.length; i++) {
          if (
            res.freightUnitLineItemId ===
            message[0].data.data[i]?.lineItems[0]
              ?.freightUnitLineItemIds[0] ||
            res.freightUnitLineItemId ===
            message[0].data.data[i]?.lineItems[1]
              ?.freightUnitLineItemIds[0] ||
            res.freightUnitLineItemId ===
            message[0].data.data[i]?.lineItems[2]
              ?.freightUnitLineItemIds[0] ||
            res.freightUnitLineItemId ===
            message[0].data.data[i]?.lineItems[3]?.freightUnitLineItemIds[0]
          ) {
            var obj = {
              order: message[0].data.data[i],
              shipment: res,
            };
            pink.push(obj);
          } else {
            pink.push({ noMatch: true, ...res });
          }
        }
      });

      let pink1 = [];
      pink.map((res) => {
        if (res.shipment) {
          pink1.push(res);
        }
        setCombo(pink1);
      });
      setLoader(true);
    });
    console.log(combo)
  }
  const exportExcelFile = () => {
    const element = document.getElementById("excel_table");
    let ws = utils.table_to_sheet(element);
    /* generate workbook and add the worksheet */
    let wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sheet1");
    /* save to file */
    writeFile(wb, "sample.xlsx");
  };

  function differentdate(a) {
    let date = new Date(a);
    let milliseconds = date.getTime();
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();
    const expectedPickupDate = milliseconds;
    const expectedPickupTimestamp = expectedPickupDate;
    let days, hours, minutes;
    if (expectedPickupTimestamp > currentTimestamp) {
      const difference = expectedPickupTimestamp - currentTimestamp;
      days = Math.floor(difference / (1000 * 60 * 60 * 24));
      hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    } else if (currentTimestamp > expectedPickupTimestamp) {
      const difference = currentTimestamp - expectedPickupTimestamp;
      days = Math.floor(difference / (1000 * 60 * 60 * 24)) * -1;
      hours =
        Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) *
        -1;
      minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)) * -1;
    } else {
      days = 0;
      hours = 0;
      minutes = 0;
    }
    const re = days + "d" + hours + "h" + minutes + "m";
    return re;
  }

  function GetFullName(a) {
    var countFrom = new Date(a).getTime();
    this.now = new Date();
    this.b = new Date(countFrom);
    this.distance = (this.now - this.b);
    var secondsInADay = 60 * 60 * 1000 * 24,
      secondsInAHour = 60 * 60 * 1000;
    let days = Math.floor(this.distance / (secondsInADay) * 1);
    let hours = Math.floor((this.distance % (secondsInADay)) / (secondsInAHour) * 1);
    let mins = Math.floor(((this.distance % (secondsInADay)) % (secondsInAHour)) / (60 * 1000) * 1);
    let secs = Math.floor((((this.distance % (secondsInADay)) % (secondsInAHour)) % (60 * 1000)) / 1000 * 1);
    let xyz = days + " d " + hours + " h " + mins + ' m ' + secs + ' s'
    if (days > 1924) {
      return '-'
    }
    return xyz;
  }

  useEffect(() => {
    axios
      .get("https://fire-hot-hardhat.glitch.me/auth", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        if (res.data.message === "Authorized") {
          fetching();
        }
      })
      .catch((err) => {
        nagivate("/");
      });
  }, []);
  return (
    <>
      <main>
        <div className="main_table-export">
          <div className="export">
            <button onClick={exportExcelFile}>
              <h1> EXPORT</h1>
            </button>
          </div>
        </div>
        <div className="main_table-heading">
          <div className="heading">
            <FaTruckPickup
              className="heading-icon"
              style={{ color: "orange" }}
            />
            <h1>
              ENROUTE FOR PICKUP <span>{combo.length}</span>
            </h1>
          </div>
        </div>
        {loader ? (
          <>
            {" "}
            <table id="excel_table">
              <thead>
                <tr>
                  <th className="table-th">ORder number </th>
                  <th className="table-th">Vehicle No. </th>
                  <th className="table-th">Consignor</th>
                  <th className="table-th">Consignee</th>
                  <th className="table-th">material</th>
                  <th className="table-th">Vehicle Type </th>
                  <th className="table-th">shipment created </th>
                  <th className="table-th">expected Pickup Date </th>
                  {/* <th className="table-th">SHPL instructions </th> */}
                  <th className="table-th">Special Instruction </th>
                  <th className="table-th">expected DELIVERY Date </th>
                </tr>
              </thead>
              <tbody>
                {combo.map((res) => {
                  return (
                    <tr>
                      <td className="td-main">{res.order.orderNumber}</td>
                      <td className="td-main">
                        {
                          res.shipment.fleetInfo.vehicle
                            .vehicleRegistrationNumber
                        }
                      </td>
                      <td className="td-main">
                        {res.order.lineItems[0].consigner.name}
                      </td>
                      <td
                        className="td-main"
                        style={{ color: "rgb(16, 177, 231)" }}
                      >
                        {res.order.customFields
                          .filter((res) => res.fieldKey === "destination")
                          .map((res) => {
                            return <>{res.value}</>;
                          })}
                      </td>
                      <td className="td-main">
                        {res.order.customFields
                          .filter((res) => res.fieldKey === "Material")
                          .map((res) => {
                            return <>{res.value}</>;
                          })}
                      </td>
                      <td className="td-main">
                        {res.order.lineItems[0].allowedLoadTypes[0].name}
                      </td>
                      <td className="td-main">
                          {
                            differentdate(res.shipment.creationTime) 
                          }
                      </td>
                      <td className="td-main" style={{
                        fontWeight: "bolder",
                        color:
                          differentdate(res.value) > 86400000
                            ? "#00ff00"
                            : differentdate(res.value) > 21600000 &&
                              differentdate(res.value) < 86400000
                              ? "yellow"
                              : differentdate(res.value) > 0 &&
                                differentdate(res.value) < 21600000
                                ? "orange"
                                : "red",
                      }}>
                        {res.order.customFields
                          .filter(
                            (res) =>
                              res.fieldKey === "expected pickup date"
                          )
                          .map((res) => {
                            return <>{differentdate(res.value)}</>;
                          })}
                      </td>
                      <td
                        className="td-main"
                        style={{ color: "rgb(247, 3, 145)" }}
                      >
                        {res.order.customFields
                          .filter((res) => res.fieldKey === "SpecialInstruction")
                          .map((res) => {
                            return <>{res.value ? res.value : "no remark"}</>;
                          })}
                      </td>
                      <td className="td-main" style={{ color: "#00ff00", fontWeight: "bold" }}>
                        {res.order.customFields
                          .filter(
                            (res) => res.fieldKey === "expected delivery date"
                          )
                          .map((res) => {
                            return <>{differentdate(res.value)}</>;
                          })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        ) : (
          <Loader />
        )}
      </main>
    </>
  );
};

export default EnrouteForPickup;
