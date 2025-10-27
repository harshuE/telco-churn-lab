# 📞 Telco Churn Lab  
> Predicting Customer Churn using Machine Learning, Flask Framework, and React + Vite Frontend  

![Telco Churn Lab Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVtY3dtZzBuZXA1aW9yMXpqNXZkZ2l4YTFoOHhoMGt4Z3JpOHl4dCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qgQUggAC3Pfv687qPC/giphy.gif)

---

## 📘 Overview  

**Telco Churn Lab** (📁 `Customer Churn Prediction Model`) is a **full-stack Machine Learning application** built to predict telecom customer churn using data-driven insights.  
It integrates a **Flask backend** for ML model predictions and a **React + Vite frontend** for an interactive, real-time user experience.  

🧠 **Developed Models:**  
- 🌲 **Random Forest (Best Performing Model)**  
- ⚡ **XGBoost**  

The project leverages customer demographics, billing, and service-usage data to estimate churn probability, empowering telecom companies to improve retention.  

---

## 🧱 Folder Structure  
Customer Churn Prediction Model/
│
├── backend/ # Flask Backend (API + Model)
│ ├── app.py # Main Flask app entry point
│ ├── model/ # Trained ML models
│ ├── static/ # Static files (optional)
│ ├── templates/ # Flask templates (optional)
│ ├── requirements.txt # Python dependencies
│ └── utils/ # Helper scripts (data preprocessing, etc.)
│
├── frontend/ # React + Vite Frontend
│ ├── src/
│ │ ├── components/ # UI Components
│ │ ├── pages/ # Pages (Home, Predict, About)
│ │ ├── assets/ # Images, GIFs
│ │ └── App.jsx # Main component
│ ├── package.json # Frontend dependencies
│ └── vite.config.js # Vite configuration
│
└── README.md # Project Documentation

---

## 🧩 Tech Stack  

| Layer | Technology |
|-------|-------------|
| 💡 **Machine Learning** | Python, scikit-learn, XGBoost |
| ⚙️ **Backend Framework** | Flask + Flask-CORS |
| 💻 **Frontend Framework** | React + Vite |
| ☁️ **Development Environment** | Google Colab |
| 📂 **Dataset Source** | [Telco Customer Churn – Kaggle](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) |

---

## 📊 Dataset Details  

**Dataset:** Telco Customer Churn  
**Records:** 7,043 customers  
**Target Variable:** `Churn (Yes/No)`  

**Feature Categories:**
- 👤 Customer demographics  
- 💰 Account & billing information  
- 📡 Service usage (internet, phone, streaming)  
- 📆 Tenure and contract type  

---

## 🤖 Machine Learning Models

The project implemented and evaluated two supervised classification algorithms:

🌲 Random Forest Classifier — an ensemble-based model known for robustness, interpretability, and high predictive accuracy.

⚡ XGBoost Classifier — a gradient boosting framework optimized for speed and performance on structured data.

After comprehensive evaluation using accuracy, precision, recall, and F1-score metrics,
🏆 Random Forest was identified as the best-performing model, demonstrating superior overall performance and reliability in churn prediction.
