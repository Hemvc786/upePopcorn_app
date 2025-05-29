import { useEffect, useState } from "react";
import StarRating from "./StarRating";
//RULE : NEVER UPDATE STATE IN RENDER LOGIC.

//NETWORK TAB --->set throttling to slow 3G and once data is getting loaded set to offline before the data arrives and see what happens...

//fetch movie data at initial render.
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

//variable declared outside comp function, Since this variable does not depend on anything inside the component.
const KEY = `bbfd0853`;

//structural component
export default function App() {
  const [query, setQuery] = useState("inception"); //lifted this state up from Search component
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null); //"tt1375666"

  /*
  ///VIDEO: SYNCH MOVIES WITH QUERY DATA "some trials":

  useEffect(function () {
    console.log("After Initial Render");
  }, []); //executes "second" due to order


  //Below effect has no Depenedancy array so it is SYNCHRONIZED with everything SO runs after EVERY RENDER.
  useEffect(function () {
    console.log("After every render");
  }); //executes "third" due to order


  //Below effect is synchronized with query state variable.And this runs on initial render and when the state variable changes.
  useEffect(
    function () {
      console.log("D");
    },
    [query]
  );

  console.log("during the render"); //run during the render--executes "First"

*/

  //VIDEO: HOW TO NOT FETCH DATA
  //This data fetching introduces side effect in components render logic,i.e not allowed.
  //setting a state in render logic-----> will immediately cause component to re-rendered itself again.On re-render---->func is executed again-->fetch again--->setMovies again as well ---> also this whole thing happens over and over again----->Therefore Infinite loop of state setting and component re-rendering-->This is the reason why it is allowed to NOT set STATE in render LOGIC.
  //-------------------------------------------------------------------
  // fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //   .then((res) => res.json())
  //   .then((data) => setMovies(data.Search));
  //-------------------------------------------------------------------
  //-------------------------------------------------------------------

  // fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //   .then((res) => res.json())
  //   .then((data) => console.log(data));//OK since here we are only logging to console

  // setWatched([]); //WILL CAUSE ERROR -> too many re-renders
  //we want to set movies here but w/o all the above problems
  //--------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------

  // useEffect -->Before using the useEffect the code of setting state was executed while the component was rendering using useEffect the code of setting state will executed after the component has rendered .So useEffect is used to register an effect.That effect is the function that contains the side effect that we want to register and register means code runs NOTTT when component renders BUT code runs after when then component is painterd to the screen.

  /*
  WARNING::::::

  Effect callbacks are synchronous to prevent race conditions. Put the async function inside:

useEffect(() => {
  async function fetchData() {
    // You can await here
    const response = await MyAPI.getData(someId);
    // ...
  }
  fetchData();
}, [someId]); // Or [] if effect doesn't need props or state

//like below will give ERROR--->becoz the effect function that we write in useEffect cannot written a promise which is what an async func does, so we wrap that async func in some other function
 useEffect(async function () {
    fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
      .then((res) => res.json())
      .then((data) => setMovies(data.Search));
  }, []);
  */

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id)); //currentid === selectedid then null else currentid
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  //VIDEO: SYNCH MOVIES WITH QUERY DATA::::::
  //now the useEffect hook is like a event handler which changes when the query state variable changes.
  /*
  ######  Why async function fetchMovies()?
👉 Because useEffect() cannot be async.
React’s useEffect() must return either:
undefined (nothing), or
a cleanup function

But an async function always returns a Promise, which React doesn’t allow for useEffect return values.


Question----->	Answer
Why define async fetchMovies()?	-----> So we can use await inside useEffect safely.
Why not make useEffect async?	-----> 	Because it must return undefined or cleanup, not a Promise.
  */

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError(""); //Before we start fetching for DATA we reset the error.
          //await pauses execution until the response arrives.
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          ); //effect is not yet synchronized with 'query' state variable,but effect not know that it should run each time query state changes so include query in depenedancy array .
          //fetch was successful but check if response is OK using below statement.
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies"); //as we throw the error here we need to wrap our code to try-catch block.

          const data = await res.json();

          // The OMDB API can return a success (HTTP 200) but still indicate "no results" via Response: "False" — so this is an extra check.
          if (data.Response === "False") {
            throw new Error("Movie Not Found!");
          }
          setMovies(data.Search);
          setIsLoading(false);

          //console.log(movies); //will give an empty array, SINCE setting state is asynchronous after we instruct REACT to set state in above line of code that doesnt mean that it happens immediately, so here we have stale state therefore empty array.state setting happens when fetchMovies() is called.

          console.log(data.Search);
          console.log(data);
        } catch (err) {
          console.error(err.message);
          setError(err.message); //setting the error to err.message
        } finally {
          setIsLoading(false);
        }
      }
      //if(!query.length)
      if (query.length < 3) {
        // query.length < 3 no fetch requests are made.
        setMovies([]); //removing all movies from UI
        setError(""); //reset error to nothing
        return; //fetchMovies() will not even be called!!!!!
      }
      fetchMovies();
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader></Loader>}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error}></ErrorMessage>}
        </Box>

        <Box>
          <>
            {selectedId ? (
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMovieList watched={watched} />
              </>
            )}
          </>
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}
//presentational component
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

//structural component
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}
//Presentational Component
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

//Stateful component
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

//Presentational Component
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

//structural component
function Main({ children }) {
  return <main className="main">{children}</main>;
}

//stateful component-->using children=representing COMPONENT COMPOSITION
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

//stateful component
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

//stateless/presentational component
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

//whenever MovieDetails component is going to mount we want to fetch the movie corresponding to the selectedId. i.e to do that each time component mounts --->useEffect
function MovieDetails({ selectedId, onCloseMovie }) {
  const [movie, setMovie] = useState({});
  //There is a visible delay betwen the click and something chnging in the UI so we need the isLoading state
  const [isLoading, setIsLoading] = useState(false);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  /*
for below code first we get undefined undefined and after some seconds we get the output.Since in the very begining the movie is empty object []. so undefined as o/p, then effect starts and it gets the movie and store it in its movie state---> then component is re-rendered and oject is no longer empty.
*/
  console.log(title, year);

  //load movie details about individual movies
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true); //immediately as we start fetching we set isLoading to true
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        console.log(data);
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId]
  );
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              <StarRating maxRating={10} size={24} />
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed By {director}</p>
          </section>
        </>
      )}

      {/* {selectedId} */}
    </div>
  );
}

//stateless/presentational component
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

//stateless/presentational component
function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

//stateless/presentational component
function WatchedMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
