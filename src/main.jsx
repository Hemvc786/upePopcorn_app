import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
// import './index.css'
// import App from './App.jsx'
import StarRating from "./StarRating";

function Test() {
  const [movieRating, setMovieRating] = useState(0);
  return (
    <div>
      <StarRating color="purple" maxRating={10} onSetRating={setMovieRating} />
      <p>this Movie is rated {movieRating} stars</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <App /> */}
    <StarRating maxRating={10} />

    <StarRating maxRating={7} color="red" size={32} />

    <StarRating maxRating={5} color="green" size={12} />

    <StarRating
      maxRating={3}
      color="blue"
      className="test"
      messages={["Terrible", "Good", "Amazing"]}
      defaultRating={2}
    />

    <StarRating maxRating={1} color="black" className="test" />

    <Test />
  </StrictMode>
);
