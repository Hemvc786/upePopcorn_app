import { useEffect, useState } from "react";
import StarRating from "./StarRating";
/*

//RULE : NEVER UPDATE STATE IN RENDER LOGIC.

//NETWORK TAB --->set throttling to slow 3G and once data is getting loaded set to offline before the data arrives and see what happens...

//Changing the page title in the browser i.e interact outside the react effect.So we will register a side effect using the useEffect Hook

Network tab--> throttling to 3G-->in fetch/XHR tab and clear all previous requests.
we made one request for each key stroke,this created all these different requests that are happening at same time, which will cause 3 problems ----> 
1.having so many requests at same time will slow each of them down.

2. We end up downloading too much data since we are not interested in data for other queries. how to clean up fetch request so that as soon as new request is fired up the previous one will stop.

3.If one intermediate request takes some longer time then that intermediate request with some incomplete word will be last one to arrive in that case it will be the movies or the results from this requests that will be stored in our state and that would be rendered in our UI. WE want the last request to be the one that matters.This is common problem called "RACE CONDITION". SInce all the requests are racing with one another.
*** We will handle this by the native browser api called AbortController.
*** AbortController is connected to fetch using the object in fetch having signal.
*** in network tab we are interested in fetch type of requests only ignore fetch/redirect request.
*** In network tab Look for the request with type--->fetch, all the fetch type requests which are not the last one got cancelled.
*** Only 1 req happening at time until it gets cancelled by other.
*** At each key stroke the re-render happens and betn each re-renders the cleanup function get called, & in clean up func the controller will abort the current fetch request.

*/
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
  // 2 // fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
  //   .then((res) => res.json())
  //   .then((data) => setMovies(data.Search));
  //-------------------------------------------------------------------
  //-------------------------------------------------------------------

  // 1 // fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=interstellar`)
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
    //setting selectedId state in App component from MovieList & Movie component
    setSelectedId((selectedId) => (id === selectedId ? null : id)); //currentid === selectedid then null else currentid
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  //add new item to watched[]
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  //---------------------------------------------------------------------------------------------------
  /*
  The way in  which we can react to an key press event is simply by attacing the event handler to the entire document.
  This is the side effect since we will be directly touching the DOM so we need another effect.
  As we press Escape we find that event handler still listening for keydown event and it will execute the callback function for every keydown of Escape happen , even when we dont have movie open.Basically we want to attach event handler only when we have movieDetails open in our tree i.e whenever the moviedetails component instance is mounted.
  */

  // useEffect(function () {
  //   document.addEventListener("keydown", function (e) {
  //     if (e.code === "Escape") {
  //       handleCloseMovie();
  //       console.log("CLOSING");
  //     }
  //   });
  // }, []);
  //------------------------------------------------------------------
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
      const controller = new AbortController(); //browser api just like fetch function is also an browser api

      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError(""); //Before we start fetching for DATA we reset the error.
          //await pauses execution until the response arrives.
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
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
          //set error to empty state after the movies has been set
          setError("");
        } catch (err) {
          // console.error(err.message);
          console.log(err.message);

          if (err.name !== "AbortError") setError(err.message); //setting the error to err.message
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
      handleCloseMovie(); //Added since we want the movieDetails to leave when we search for next movie in search bar.
      fetchMovies();

      //at each keystroke the component gets re-rendered.
      //clean up function--> called at every re-render and at each re-render the controller will abort the current fetch request. as soon as request gets cancelled the JS sees it as error, so we get the error there. then it will throw an error and get catched in catch clause.
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <NavBar>
        {/* Lifted query state up in App component. */}
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
              //selectedId from Movie component passed in MovieDetails.
              <MovieDetails
                selectedId={selectedId}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched={watched}
              />
            ) : (
              <>
                {/* watched is an array. */}
                <WatchedSummary watched={watched} />
                <WatchedMovieList
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                />
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
function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  //There is a visible delay betwen the click and something chnging in the UI so we need the isLoading state
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  console.log(isWatched);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

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
for below code first we get "undefined undefined" and after some seconds we get the output after the data arrive from the api.Since in the very begining the movie is empty object []. so undefined as o/p, then effect starts and it gets the movie and store it in its movie state---> then component is re-rendered and oject is no longer empty.
*/
  console.log(title, year);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newWatchedMovie); //adding to watched[]
    onCloseMovie();
  }

  //keydown EVENT  LISTENER
  useEffect(
    function () {
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          console.log("CLOSING");
        }
      } //required in addEventListener and removeEventListener
      document.addEventListener("keydown", callback);

      //But now in this case if we open up 10 movies and close them up we end up attaching 10 event listeners to the document.
      //here the function must be same as that in the addEventListener
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

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

  //we need the cleanup function since the side effect that we introduce in useEffect keeps happening after the component has already unmounted.
  //WE should always use diff effect for diff purpose.
  useEffect(
    //how to ensure the page title stay synchronize with the application even when the component has disappeared, need a way to execute some code as component unmounts.
    function () {
      if (!title) return; //instead of seeing "undefined" for title return
      document.title = `Movie | ${title}`; //if title changes set title to

      //when we click on left arrow the component function MovieDetails unmounted and the cleanup function executed.
      //cleanup function is simply the function that we are returning from an effect.
      return function () {
        //resetting the document.title to its original form...
        document.title = "usePopcorn";

        //STRANGE BEHAVIOUR : Since the clean up function runs after the component unmounted , then how will the function remembers the title here??? this function runs only after the component disappears from the component tree, and all the state including the movie object destroyed.It is possible becoz of concept called CLOSURE....

        //CLOSURE -->the function will always remember all the variables that were present at the time and place where the function is created.

        //CLEANUP function was created by the time before the side effects destroyed.
        console.log(`clean up effect for the movie ${title}`); //you will get the previous movie title here.
      };
    },
    [title]
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
              {!isWatched ? (
                <>
                  {" "}
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating} //to get movie outside star rating comp and inside moviedetails component.
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You Rated this movie {watchedUserRating} <span>⭐</span>
                </p>
              )}
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
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
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
function WatchedMovieList({ watched, onDeleteWatched }) {
  console.log(watched);
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

//stateless/presentational component
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
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
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
