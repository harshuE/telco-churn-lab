import React, { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";

// ====== CONFIG ======
const API = "http://127.0.0.1:5000/api/predict";

const FIELDS = [
  { k: "gender", type: "slider", label: "Gender", opts: ["Male", "Prefer not to say", "Female"] },
  { k: "SeniorCitizen", type: "switch", label: "Senior Citizen" },
  { k: "Partner", type: "segment", label: "Partner", opts: ["Yes", "No"] },
  { k: "Dependents", type: "segment", label: "Dependents", opts: ["Yes", "No"] },
  { k: "tenure", type: "range", label: "Tenure (months)", min: 0, max: 72, step: 1, val: 1 },
  { k: "PhoneService", type: "switch", label: "Phone Service" },
  { k: "MultipleLines", type: "segment", label: "MultipleLines", opts: ["Yes", "No", "No phone service"] },
  { k: "InternetService", type: "dropdown", label: "InternetService", opts: ["DSL", "Fiber optic", "No"] },
  { k: "OnlineSecurity", type: "segment", label: "OnlineSecurity", opts: ["Yes", "No", "No internet service"] },
  { k: "OnlineBackup", type: "segment", label: "OnlineBackup", opts: ["Yes", "No", "No internet service"] },
  { k: "DeviceProtection", type: "segment", label: "DeviceProtection", opts: ["Yes", "No", "No internet service"] },
  { k: "TechSupport", type: "segment", label: "TechSupport", opts: ["Yes", "No", "No internet service"] },
  { k: "StreamingTV", type: "segment", label: "StreamingTV", opts: ["Yes", "No", "No internet service"] },
  { k: "StreamingMovies", type: "segment", label: "StreamingMovies", opts: ["Yes", "No", "No internet service"] },
  { k: "Contract", type: "dropdown", label: "Contract", opts: ["Month-to-month", "One year", "Two year"] },
  { k: "PaperlessBilling", type: "segment", label: "PaperlessBilling", opts: ["Yes", "No"] },
  { k: "PaymentMethod", type: "dropdown", label: "PaymentMethod", opts: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"] },
  { k: "MonthlyCharges", type: "range", label: "MonthlyCharges", min: 0, max: 200, step: 0.05, val: 29.85 },
  { k: "TotalCharges", type: "range", label: "TotalCharges", min: 0, max: 10000, step: 0.05, val: 29.85 },
];

const REQUIRED_KEYS = [
  "gender","Partner","Dependents","PhoneService","MultipleLines","InternetService",
  "OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport",
  "StreamingTV","StreamingMovies","Contract","PaperlessBilling","PaymentMethod",
  "SeniorCitizen","tenure","MonthlyCharges","TotalCharges"
];

// ====== HELPERS ======
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// simple toast manager
function Toast({ toast, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`toast ${toast.type === "success" ? "success" : toast.type === "error" ? "error" : ""}`}>
      {toast.msg}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, type = "info") => setToasts((t) => [...t, { id: crypto.randomUUID(), msg, type }]);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, push, remove };
}

// simple modal
function Modal({ children, onBgClose }) {
  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onBgClose?.()}>
      <div className="modal">{children}</div>
    </div>
  );
}

// ====== MAIN APP ======
export default function App() {
  const { toasts, push, remove } = useToasts();

  // floating bots like original
  useEffect(() => {
    const COUNT = 28;
    const nodes = [];
    for (let i = 0; i < COUNT; i++) {
      const b = document.createElement("i");
      b.className = "fa-solid fa-robot bot";
      b.style.left = Math.random() * 100 + "%";
      b.style.top = Math.random() * 100 + "%";
      b.style.fontSize = 14 + Math.random() * 20 + "px";
      b.style.animationDuration = 10 + Math.random() * 12 + "s";
      document.body.appendChild(b);
      nodes.push(b);
    }
    return () => nodes.forEach((n) => n.remove());
  }, []);

  // tabs
  const [tab, setTab] = useState("one"); // 'one' | 'batch'

  // modal state
  const [modal, setModal] = useState(null); // null | ReactNode
  const [loading, setLoading] = useState(false);

  // SINGLE state
  const defaults = useMemo(() => {
    const obj = {};
    for (const f of FIELDS) {
      if (f.type === "slider") obj[f.k] = "Prefer not to say";
      else if (f.type === "switch") obj[f.k] = f.k === "SeniorCitizen" ? 0 : "No";
      else if (f.type === "segment") obj[f.k] = f.opts[0];
      else if (f.type === "dropdown") obj[f.k] = f.opts[0];
      else if (f.type === "range") obj[f.k] = f.val;
    }
    // PhoneService default Yes like original
    obj["PhoneService"] = "Yes";
    return obj;
  }, []);

  const [one, setOne] = useState(defaults);

  // BATCH state
  const [batchRows, setBatchRows] = useState([]);
  const [batchPreviewHeaders, setBatchPreviewHeaders] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    push("Welcome to Telco Churn Lab", "info");
  }, []); // eslint-disable-line

  // ====== PDF MAKERS ======
  const makePDFSingle = (pred, prob, data) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFillColor(5, 17, 13);
    doc.rect(0, 0, 595, 70, "F");
    doc.setDrawColor(0, 255, 136);
    doc.setLineWidth(2);
    doc.line(24, 68, 571, 68);
    doc.setTextColor(0, 255, 136);
    doc.setFontSize(18);
    doc.text("Telco Churn Lab", 24, 30);
    doc.setTextColor(210);
    doc.setFontSize(12);
    doc.text("Dataset: Telco Customer Churn", 24, 50);

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("Prediction Report", 24, 96);

    doc.setDrawColor(0, 255, 136);
    doc.roundedRect(24, 110, 547, 70, 8, 8);

    doc.setFontSize(20);
    if (pred === "Churn") doc.setTextColor(220, 60, 60);
    else doc.setTextColor(20, 170, 115);
    doc.text(String(pred), 34, 140);

    doc.setTextColor(40);
    doc.setFontSize(12);
    doc.text(`Confidence: ${prob}%`, 34, 164);

    let y = 220;
    doc.setFontSize(12);
    doc.setTextColor(0, 255, 136);
    doc.text("DETAILS", 24, y);
    y += 14;
    doc.setTextColor(40);
    doc.setFontSize(11);

    const entries = Object.entries(data);
    entries.forEach(([k, v], i) => {
      if (i % 2 === 0) {
        if (i > 0) y += 20;
        doc.text(`${capitalize(k)}: ${String(v)}`, 24, y);
      } else {
        doc.text(`${capitalize(k)}: ${String(v)}`, 300, y);
      }
    });

    doc.setDrawColor(0, 255, 136);
    doc.line(24, 820, 571, 820);
    doc.setTextColor(120);
    doc.setFontSize(10);
    doc.text("© Telco Churn Lab — generated by AI dashboard", 24, 836);
    doc.save("prediction_report.pdf");
  };

  const makePDFBatch = (preds, probs, rows) => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFillColor(5, 17, 13);
    doc.rect(0, 0, 595, 70, "F");
    doc.setDrawColor(0, 255, 136);
    doc.line(24, 68, 571, 68);
    doc.setTextColor(0, 255, 136);
    doc.setFontSize(18);
    doc.text("Telco Churn Lab", 24, 30);
    doc.setTextColor(210);
    doc.setFontSize(12);
    doc.text("Dataset: Telco Customer Churn", 24, 50);
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text("Batch Report", 24, 96);

    let y = 120;
    doc.setTextColor(0, 255, 136);
    doc.text("TABLE SUMMARY", 24, y);
    y += 16;
    doc.setTextColor(40);
    doc.setFontSize(11);
    doc.text("No.", 24, y);
    doc.text("Gender", 70, y);
    doc.text("Prediction", 160, y);
    doc.text("Probability", 270, y);
    y += 18;

    for (let i = 0; i < preds.length; i++) {
      if (y > 780) {
        doc.addPage();
        y = 60;
      }
      const g = rows[i]?.gender ?? "—";
      const pr = probs?.[i] != null ? (probs[i] * 100).toFixed(1) + "%" : "—";
      doc.text(String(i + 1), 24, y);
      doc.text(String(g), 70, y);
      doc.text(String(preds[i]), 160, y);
      doc.text(String(pr), 270, y);
      y += 16;
    }

    doc.setDrawColor(0, 255, 136);
    doc.line(24, 820, 571, 820);
    doc.setTextColor(120);
    doc.setFontSize(10);
    doc.text("© Telco Churn Lab — generated by AI dashboard", 24, 836);
    doc.save("batch_report.pdf");
  };

  // ====== VALIDATION ======
  const validateOne = (row) => {
    for (const k of REQUIRED_KEYS) {
      if (row[k] === undefined || row[k] === null || row[k] === "") {
        return "Missing: " + k;
      }
    }
    return null;
  };

  // ====== SINGLE: handlers ======
  const resetOne = () => {
    setOne(defaults);
    push("Form reset", "success");
  };

  const handlePredictOne = async () => {
    const err = validateOne(one);
    if (err) {
      push(err, "error");
      return;
    }
    setLoading(true);
    setModal(
      <div>
        <div className="loader"></div>
        <p>Analyzing...</p>
      </div>
    );
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: one }),
      });
      const d = await res.json();
      setModal(null);
      setLoading(false);

      const p = d.predictions?.[0] ?? "—";
      const pr =
        d.probabilities?.[0] !== undefined
          ? (d.probabilities[0] * 100).toFixed(1)
          : "—";

      setModal(
        <div>
          <h2 style={{ color: "var(--neon)" }}>Prediction</h2>
          <div
            style={{
              border: "2px solid var(--neon)",
              padding: 14,
              borderRadius: 10,
              background: "#062012",
              margin: "10px 0",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: p === "Churn" ? "#ff5f5f" : "#5affb0",
              }}
            >
              {p}
            </div>
            <div>Confidence: {pr}%</div>
          </div>
          <div>
            <button
              className="btn"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify({ input: one, output: d }, null, 2)],
                  { type: "application/json" }
                );
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "prediction.json";
                a.click();
              }}
            >
              <i className="fa-solid fa-download"></i> JSON
            </button>
            <button className="btn" onClick={() => makePDFSingle(p, pr, one)}>
              <i className="fa-solid fa-file-pdf"></i> PDF
            </button>
            <button className="btn secondary" onClick={() => setModal(null)}>
              <i className="fa-solid fa-xmark"></i> Close
            </button>
          </div>
        </div>
      );
      push("Prediction ready", "success");
    } catch (e) {
      setModal(null);
      setLoading(false);
      push("Failed: " + e.message, "error");
    }
  };

  // ====== BATCH: CSV parsing ======
  const fileRef = useRef(null);

  const isCSVName = (name) => /\.csv$/i.test(name || "");

  const onFilePicked = (f) => {
    const x = f?.[0];
    if (!x) {
      push("No file selected", "error");
      return;
    }
    if (!isCSVName(x.name) && x.type !== "text/csv") {
      push("Please select a .csv file", "error");
      return;
    }
    const r = new FileReader();
    r.onerror = () => push("Failed to read file", "error");
    r.onload = () => parseCSV(String(r.result || ""));
    r.readAsText(x);
  };

  const splitCSV = (line) => {
    const out = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === "," && !inQ) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const parseCSV = (text) => {
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    const norm = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const lines = norm.split("\n").filter((s) => s.trim().length > 0);
    if (lines.length < 2) {
      setBatchRows([]);
      setBatchPreviewHeaders([]);
      push("Empty CSV", "error");
      return;
    }

    const headers = splitCSV(lines[0]).map((h) => h.replace(/^\uFEFF/, "").trim());
    const missing = REQUIRED_KEYS.filter((k) => !headers.includes(k));
    if (missing.length) {
      setBatchRows([]);
      setBatchPreviewHeaders(headers);
      push("CSV header mismatch. Missing: " + missing.join(", "), "error");
      return;
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = splitCSV(lines[i]);
      if (vals.length === 0 || vals.every((v) => v === "")) continue;
      const o = {};
      headers.forEach((h, idx) => (o[h] = (vals[idx] ?? "").trim()));
      rows.push(o);
    }

    setBatchRows(rows);
    setBatchPreviewHeaders(headers);

    if (rows.length === 0) {
      push("No data rows detected. Check quotes/commas.", "error");
      return;
    }
    push(`Loaded ${rows.length} rows`, "success");
  };

  const resetBatch = () => {
    setBatchRows([]);
    setBatchPreviewHeaders([]);
    if (fileRef.current) fileRef.current.value = "";
    push("Batch cleared", "success");
  };

  const runBatch = async () => {
    if (!batchRows.length) {
      push("No rows", "error");
      return;
    }
    setLoading(true);
    setModal(
      <div>
        <div className="loader"></div>
        <p>Analyzing...</p>
      </div>
    );
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: batchRows }),
      });
      if (!r.ok) {
        const msg = await r.text().catch(() => String(r.status));
        setModal(null);
        setLoading(false);
        push("Server error: " + msg, "error");
        return;
      }
      const d = await r.json();
      setLoading(false);

      const p = Array.isArray(d.predictions) ? d.predictions : [];
      const pr = Array.isArray(d.probabilities) ? d.probabilities : [];
      if (p.length === 0) {
        setModal(null);
        push(
          `API returned 0 predictions. Ensure backend accepts "features" as a list of objects with keys: ${REQUIRED_KEYS.join(
            ", "
          )}`,
          "error"
        );
        return;
      }

      setModal(
        <div>
          <h2 style={{ color: "var(--neon)" }}>Batch Results</h2>
          <p>Total Rows: {p.length}</p>
          <div style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => makePDFBatch(p, pr, batchRows)}>
              <i className="fa-solid fa-file-pdf"></i> PDF
            </button>
            <button className="btn secondary" onClick={() => setModal(null)}>
              <i className="fa-solid fa-xmark"></i> Close
            </button>
          </div>
        </div>
      );
      push("Batch ready", "success");
    } catch (e) {
      setModal(null);
      setLoading(false);
      push("Fail: " + e.message, "error");
    }
  };

  // ====== RENDER HELPERS ======
  const RangeRow = ({ f }) => {
    const v = one[f.k];
    const isMoney = f.k === "MonthlyCharges" || f.k === "TotalCharges";
    return (
      <div className="card">
        <h3>{f.label}</h3>
        <input
          type="range"
          className="range"
          min={f.min}
          max={f.max}
          step={f.step}
          value={v}
          onChange={(e) => setOne((s) => ({ ...s, [f.k]: Number(e.target.value) }))}
        />
        <span className="badge" id={`${f.k}Val`}>
          {isMoney ? `$${Number(v).toFixed(2)}` : v}
        </span>
      </div>
    );
  };

  const SwitchRow = ({ f }) => {
    const isActive =
      f.k === "SeniorCitizen" ? one[f.k] === 1 : one[f.k] === "Yes";
    return (
      <div className="card">
        <h3>{f.label}</h3>
        <div
          className={`switch ${isActive ? "active" : ""}`}
          onClick={() =>
            setOne((s) => {
              if (f.k === "SeniorCitizen") {
                return { ...s, [f.k]: s[f.k] === 1 ? 0 : 1 };
              } else {
                return { ...s, [f.k]: s[f.k] === "Yes" ? "No" : "Yes" };
              }
            })
          }
        />
        <div className="help">On = Yes, Off = No</div>
      </div>
    );
  };

  const SegmentRow = ({ f }) => {
    return (
      <div className="card">
        <h3>{f.label}</h3>
        <div className="segment" id={f.k}>
          {f.opts.map((opt) => (
            <button
              key={opt}
              className={one[f.k] === opt ? "active" : ""}
              onClick={() => setOne((s) => ({ ...s, [f.k]: opt }))}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const DropdownRow = ({ f }) => {
    return (
      <div className="card">
        <h3>{f.label}</h3>
        <select
          id={f.k}
          value={one[f.k]}
          onChange={(e) => setOne((s) => ({ ...s, [f.k]: e.target.value }))}
        >
          {f.opts.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  };

  const SliderGender = ({ f }) => {
    const valIndex = f.opts.indexOf(one[f.k]); // 0,1,2
    return (
      <div className="card">
        <h3>{f.label}</h3>
        <div className="gender-row">
          <i className="fa-solid fa-mars" style={{ color: "#3fc1ff" }}></i>
          <input
            type="range"
            className="range"
            min={0}
            max={2}
            value={valIndex >= 0 ? valIndex : 1}
            onChange={(e) =>
              setOne((s) => ({ ...s, [f.k]: f.opts[Number(e.target.value)] }))
            }
            style={{ flex: 1 }}
          />
          <i className="fa-solid fa-venus" style={{ color: "#ff91ff" }}></i>
        </div>
        <div className="help">Male ← • → Female</div>
      </div>
    );
  };

  const renderField = (f) => {
    if (f.type === "slider") return <SliderGender key={f.k} f={f} />;
    if (f.type === "switch") return <SwitchRow key={f.k} f={f} />;
    if (f.type === "segment") return <SegmentRow key={f.k} f={f} />;
    if (f.type === "dropdown") return <DropdownRow key={f.k} f={f} />;
    if (f.type === "range") return <RangeRow key={f.k} f={f} />;
    return null;
  };

  // ====== JSX ======
  return (
    <>
      <header>
        <video autoPlay muted loop playsInline>
          <source
            src="https://cdn.pixabay.com/vimeo/265175775/neural-13278.mp4?width=960"
            type="video/mp4"
          />
        </video>
        <i className="fa-solid fa-robot hbot s1"></i>
        <i className="fa-solid fa-robot hbot s2"></i>
        <i className="fa-solid fa-robot hbot s3"></i>
        <div className="inner">
          <h1>
            <i className="fa-solid fa-tower-broadcast"></i> Telco Churn Lab
          </h1>
          <div className="tag">Dataset: Telco Customer Churn • Real-time AI Predictions</div>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <div
            id="tab-one"
            className={`tab ${tab === "one" ? "active" : ""}`}
            onClick={() => setTab("one")}
          >
            <i className="fa-solid fa-user"></i> Predict One
          </div>
          <div
            id="tab-batch"
            className={`tab ${tab === "batch" ? "active" : ""}`}
            onClick={() => setTab("batch")}
          >
            <i className="fa-solid fa-layer-group"></i> Batch Upload
          </div>
        </div>

        {tab === "one" ? (
          <section id="panel-one">
            <div id="fieldsContainer" className="grid">
              {FIELDS.map((f) => renderField(f))}
            </div>
            <div style={{ textAlign: "center", marginTop: 15 }}>
              <button className="btn" id="predictBtn" onClick={handlePredictOne}>
                <i className="fa-solid fa-bolt"></i> Predict
              </button>
              <button className="btn secondary" id="resetOne" onClick={resetOne}>
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>
            </div>
          </section>
        ) : (
          <section id="panel-batch">
            <div className="card">
              <h3>
                <i className="fa-solid fa-file-csv"></i> Batch Upload (CSV)
              </h3>
              <div
                id="drop"
                className={`drop ${dragOver ? "drag" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  onFilePicked(e.dataTransfer.files);
                }}
                onClick={() => fileRef.current?.click()}
              >
                Drag &amp; Drop CSV or Click
              </div>
              <input
                ref={fileRef}
                id="file"
                type="file"
                accept=".csv,.CSV,text/csv"
                hidden
                onChange={(e) => onFilePicked(e.target.files)}
              />
              <div style={{ textAlign: "center" }}>
                <button
                  className="btn"
                  id="runBatch"
                  onClick={runBatch}
                  disabled={!batchRows.length}
                >
                  <i className="fa-solid fa-play"></i> Run Prediction
                </button>
                <button
                  className="btn secondary"
                  id="resetBatch"
                  onClick={resetBatch}
                  disabled={!batchRows.length && !batchPreviewHeaders.length}
                >
                  <i className="fa-solid fa-rotate-left"></i> Reset
                </button>
              </div>

              <div id="batchTableBox" style={{ marginTop: 15, maxHeight: 300, overflow: "auto" }}>
                {batchPreviewHeaders.length ? (
                  <>
                    <table>
                      <thead>
                        <tr>
                          {batchPreviewHeaders.map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {batchRows.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            {batchPreviewHeaders.map((h) => (
                              <td key={h}>{row[h] ?? ""}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="help" style={{ marginTop: 6 }}>
                      Preview shows first 5 rows. Click <b>Run Prediction</b> to score all {batchRows.length} rows.
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>
        )}
      </div>

      <footer>© 2025 Telco Churn Lab • Built for Telco Customer Churn</footer>

      {/* Toasters */}
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDone={() => remove(t.id)} />
      ))}

      {/* Modal */}
      {modal && <Modal onBgClose={() => (!loading ? setModal(null) : null)}>{modal}</Modal>}
    </>
  );
}
