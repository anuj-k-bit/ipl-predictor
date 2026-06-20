# 🏏 IPL Win Predictor Dashboard

A premium, high-fidelity web dashboard that predicts Indian Premier League (IPL) match win probabilities using a Machine Learning model trained on historical ball-by-ball IPL match data. The application features a clean, responsive dark navy user interface with distinct visual hierarchy, pre-match analytics, and real-time live match prediction simulation.

---

## 🌟 Key Features

### 1. Match Win Predictions
* **Pre-match Predictor:** Predicts the winner of a match based on Team 1, Team 2, Venue, Toss Winner, and Toss Decision.
* **Live Predictor:** Simulates live-chasing scenarios. Recalculates win probabilities dynamically in real-time as you update live scores, overs played, wickets lost, and run targets.

### 2. Premium Visual Overhaul
* **Hero Visualization:** High-impact, centered win-probability card displaying team names and outcomes with bold colors and large ($56\text{px}$) percentage displays.
* **Accent & Brand Color Integrations:** Interactive UI elements (chips, radios, dropdowns, and checked indicators) use bold gradient states and individual team colors.
* **Depth & Layers:** Visual hierarchy built using a layered dark navy layout (Primary page background `#030712`, secondary cards `#112240`).

### 3. Analytics & Statistics Panels
* **Recent Form Bubble Strip:** Displays the last 5 match outcomes (wins/losses) for each team in setup dropdowns.
* **Player Impact Simulators:** Toggle individual key players on/off to simulate their absence and see how the ML model's win probability shifts. Includes progress bars representing each player's contribution.
* **Venue Statistics:** Key details including average first innings scores, chasing win percentages, the venue's most successful team, and total matches.
* **Season-by-Season Head-to-Head (H2H):** Historical match counts, win ratios, and a visual bar graph breakdown of season-wise wins.

### 4. Interactive Standings (Points Table)
* **Playoff Highlighting:** Top 4 spots are visually separated with subtle green background tints and left-border accents.
* **Qualification Badging:** Features a clean green `Q` badge next to playoff-bound ranks.

---

## 🛠️ Architecture & Tech Stack

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling:** Vanilla CSS, custom dark navy variables, CSS grids/flexbox
* **Visualizations:** Recharts (responsive bar and area charts)

### Backend
* **Server Framework:** Flask (Python 3)
* **Machine Learning:** Scikit-Learn (Logistic Regression model trained on historic ball-by-ball match features, including `toss_decision`, `venue`, `toss_winner`, `batting_team`, and `bowling_team`).
* **Data Processing:** Pandas, NumPy, Joblib

---

## 🚀 Getting Started

Follow these steps to run both the frontend and backend locally.

### Prerequisites
* **Node.js** (v18 or higher)
* **Python** (v3.9 or higher)

---

### Setup Instructions

#### 1. Clone & Setup the Backend
```bash
# Navigate to the backend folder
cd backend

# Create and activate a Python virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run the Flask backend (runs on http://127.0.0.1:5000)
python app.py
```

#### 2. Setup the Frontend
```bash
# Navigate to the frontend folder
cd ../frontend

# Install Node modules
npm install

# Run the Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 📊 Dataset & Model Training
* The model is trained on a comprehensive historical IPL match dataset (`IPL.csv`).
* Run the preprocessing and training scripts if you want to rebuild the model:
  ```bash
  cd backend
  python preprocess.py  # Filters raw data and creates matches.csv
  python train.py       # Trains the logistic regression model and saves model.pkl
  ```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
