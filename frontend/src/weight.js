import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function WeightTracker() {
  const [username, setUsername] = useState("");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [weights, setWeights] = useState([]);
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [backendBaseUrl, setBackendBaseUrl] = useState("");
  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then((config) => {
        setApiBaseUrl(config.REACT_APP_API_BASE_URL);
        setBackendBaseUrl(config.REACT_APP_BACKEND_BASE_URL);
      });
  }, []);

  if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "/login";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const encodedUsername = encodeURIComponent(username);
    await axios.post(`${backendBaseUrl}/weight`, {
      username,
      weight,
      date,
    });
    fetchWeights(encodedUsername);
  };

  const fetchWeights = async (encodedUsername) => {
    const response = await axios.get(
      `${backendBaseUrl}/weights/${encodedUsername}`
    );
    setWeights(response.data);
  };

  const data = {
    labels: weights.map((entry) => entry.date),
    datasets: [
      {
        label: "Weight",
        data: weights.map((entry) => entry.weight),
        fill: false,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Username"
        />
        <input
          type="date"
          value={date}
          className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Weight in lbs"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add Record
        </button>
      </form>
      <h2>Weight History</h2>
      {weights.length > 0 ? (
        <Line data={data} />
      ) : (
        <p>No data available for the specified user.</p>
      )}
    </div>
  );
}

export default WeightTracker;
