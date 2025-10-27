# Telco-churn-lab# 📞 Telco Churn Lab  
> Predicting Telecom Customer Churn using Machine Learning, Flask API, and React + Vite Frontend  

![Project Demo](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVtY3dtZzBuZXA1aW9yMXpqNXZkZ2l4YTFoOHhoMGt4Z3JpOHl4dCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/qgQUggAC3Pfv687qPC/giphy.gif)

---

## 📘 Overview  

**Telco Churn Lab** is a full-stack Data Science project designed to **predict customer churn** in the telecom industry.  
Using **Machine Learning (Random Forest & XGBoost)**, the system identifies customers likely to leave, enabling proactive retention strategies.  

The project integrates a **Flask backend API** (for ML inference) and a **React + Vite frontend** for interactive predictions.  
Development and training were carried out in **Google Colab** using Python 🐍.

---

## 🧩 Tech Stack  

| Layer | Technology |
|-------|-------------|
| 💡 **Machine Learning** | Python, scikit-learn, XGBoost |
| ⚙️ **Backend** | Flask, Flask-CORS |
| 💻 **Frontend** | React, Vite |
| ☁️ **Environment** | Google Colab |
| 📊 **Dataset** | [Telco Customer Churn – Kaggle](https://www.kaggle.com/datasets/blastchar/telco-customer-churn) |

---

## 📂 Dataset Description  

**Dataset:** Telco Customer Churn (Kaggle)  
**Records:** 7,043 customers  
**Target Variable:** `Churn` (Yes/No)

**Feature Categories:**
- 🧍 Customer demographics  
- 💰 Account & billing information  
- 📡 Service usage (phone, internet, streaming)  
- 📆 Tenure and contract details  

---

## 🤖 Machine Learning Models  

Two supervised ML models were developed and compared:

```python
model = {
    "Random Forest": RandomForestClassifier(random_state=42),
    "XGBoost": XGBClassifier(random_state=42)
}

